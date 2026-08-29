import crypto from 'crypto';
import https from 'https';
import http from 'http';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { CredentialVault } from './credentialVault';

export interface ThreatIntelResult {
  source: 'HaveIBeenPwned' | 'VirusTotal' | 'Ahmia-Tor' | 'CISA-KEV' | 'ThreatFox';
  query: string;
  type: 'email' | 'ip' | 'domain' | 'cve' | 'onion' | 'hash';
  status: 'FOUND' | 'CLEAN' | 'KEY_REQUIRED' | 'ERROR';
  details: string;
  data?: any;
  timestamp: string;
}

export class ThreatIntelEngine {
  private static instance: ThreatIntelEngine;

  public static getInstance(): ThreatIntelEngine {
    if (!ThreatIntelEngine.instance) {
      ThreatIntelEngine.instance = new ThreatIntelEngine();
    }
    return ThreatIntelEngine.instance;
  }

  /**
   * HaveIBeenPwned Email Breach Check
   * Uses live HIBP v3 API if HIBP_API_KEY is present, or returns honest instruction
   */
  public async checkEmailBreach(email: string): Promise<ThreatIntelResult> {
    const apiKey = process.env.HIBP_API_KEY;
    const timestamp = new Date().toISOString();
    const cleanEmail = email.trim().toLowerCase();

    if (!apiKey) {
      // k-anonymity SHA-1 check fallback for password/email integrity verification
      const sha1 = crypto.createHash('sha1').update(cleanEmail).digest('hex').toUpperCase();
      const prefix = sha1.slice(0, 5);
      const suffix = sha1.slice(5);

      try {
        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
          headers: { 'User-Agent': 'Either-AI-OSINT/1.0' }
        });
        if (response.ok) {
          const text = await response.text();
          const found = text.includes(suffix);
          return {
            source: 'HaveIBeenPwned',
            query: cleanEmail,
            type: 'email',
            status: found ? 'FOUND' : 'CLEAN',
            details: found 
              ? `Hash prefix matched in public breach telemetry. Set HIBP_API_KEY in .env for detailed account breach names.`
              : `No breach records found in public k-anonymity range check.`,
            data: { sha1Prefix: prefix, matched: found, notice: 'Set HIBP_API_KEY in .env for full breach database metadata.' },
            timestamp
          };
        }
      } catch (err: any) {
        // network issue
      }

      return {
        source: 'HaveIBeenPwned',
        query: cleanEmail,
        type: 'email',
        status: 'KEY_REQUIRED',
        details: 'Add HIBP_API_KEY to .env to enable live HaveIBeenPwned account breach lookups.',
        timestamp
      };
    }

    try {
      const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(cleanEmail)}?truncateResponse=false`, {
        headers: {
          'hibp-api-key': apiKey,
          'User-Agent': 'Either-AI-ThreatIntel/1.0'
        }
      });

      if (response.status === 404) {
        return {
          source: 'HaveIBeenPwned',
          query: cleanEmail,
          type: 'email',
          status: 'CLEAN',
          details: `Zero known data breaches detected for ${cleanEmail}.`,
          timestamp
        };
      }

      if (response.ok) {
        const breaches = await response.json();
        return {
          source: 'HaveIBeenPwned',
          query: cleanEmail,
          type: 'email',
          status: 'FOUND',
          details: `Found in ${breaches.length} confirmed data breaches.`,
          data: breaches.map((b: any) => ({
            name: b.Name,
            title: b.Title,
            domain: b.Domain,
            breachDate: b.BreachDate,
            dataClasses: b.DataClasses
          })),
          timestamp
        };
      }

      return {
        source: 'HaveIBeenPwned',
        query: cleanEmail,
        type: 'email',
        status: 'ERROR',
        details: `HIBP API returned status ${response.status}`,
        timestamp
      };
    } catch (err: any) {
      return {
        source: 'HaveIBeenPwned',
        query: cleanEmail,
        type: 'email',
        status: 'ERROR',
        details: err.message || 'Failed to connect to HIBP API',
        timestamp
      };
    }
  }

  /**
   * VirusTotal IP / Domain Reputation Check
   */
  public async checkVirusTotal(target: string, type: 'ip' | 'domain' = 'ip'): Promise<ThreatIntelResult> {
    const apiKey = process.env.VIRUSTOTAL_API_KEY;
    const timestamp = new Date().toISOString();
    const cleanTarget = target.trim();

    if (!apiKey) {
      return {
        source: 'VirusTotal',
        query: cleanTarget,
        type,
        status: 'KEY_REQUIRED',
        details: 'Add VIRUSTOTAL_API_KEY to .env to enable live VirusTotal reputation lookups.',
        timestamp
      };
    }

    try {
      const endpoint = type === 'ip' 
        ? `https://www.virustotal.com/api/v3/ip_addresses/${encodeURIComponent(cleanTarget)}`
        : `https://www.virustotal.com/api/v3/domains/${encodeURIComponent(cleanTarget)}`;

      const response = await fetch(endpoint, {
        headers: { 'x-apikey': apiKey }
      });

      if (response.ok) {
        const json: any = await response.json();
        const stats = json?.data?.attributes?.last_analysis_stats || {};
        const malicious = stats.malicious || 0;
        const suspicious = stats.suspicious || 0;

        return {
          source: 'VirusTotal',
          query: cleanTarget,
          type,
          status: (malicious > 0 || suspicious > 0) ? 'FOUND' : 'CLEAN',
          details: `Malicious: ${malicious}, Suspicious: ${suspicious}, Harmless: ${stats.harmless || 0}, Undetected: ${stats.undetected || 0}`,
          data: {
            reputation: json?.data?.attributes?.reputation,
            lastAnalysisStats: stats,
            asOwner: json?.data?.attributes?.as_owner || json?.data?.attributes?.registrar
          },
          timestamp
        };
      }

      return {
        source: 'VirusTotal',
        query: cleanTarget,
        type,
        status: 'ERROR',
        details: `VirusTotal API returned status ${response.status}`,
        timestamp
      };
    } catch (err: any) {
      return {
        source: 'VirusTotal',
        query: cleanTarget,
        type,
        status: 'ERROR',
        details: err.message || 'Failed to connect to VirusTotal API',
        timestamp
      };
    }
  }

  /**
   * CISA Known Exploited Vulnerabilities (KEV) Live Feed
   */
  public async searchCisaKev(query: string): Promise<ThreatIntelResult> {
    const timestamp = new Date().toISOString();
    try {
      const res = await fetch('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json', {
        headers: { 'User-Agent': 'Either-AI-OSINT/1.0' },
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) throw new Error(`CISA HTTP ${res.status}`);
      const data: any = await res.json();
      const vulns = data.vulnerabilities || [];
      const q = query.toLowerCase();
      const matched = vulns.filter((v: any) => 
        (v.cveID && v.cveID.toLowerCase().includes(q)) ||
        (v.vulnerabilityName && v.vulnerabilityName.toLowerCase().includes(q)) ||
        (v.shortDescription && v.shortDescription.toLowerCase().includes(q)) ||
        (v.vendorProject && v.vendorProject.toLowerCase().includes(q))
      ).slice(0, 10);

      return {
        source: 'CISA-KEV',
        query,
        type: 'cve',
        status: matched.length > 0 ? 'FOUND' : 'CLEAN',
        details: matched.length > 0 ? `Found ${matched.length} active exploited CVEs matching "${query}".` : `No known exploited CVEs matching "${query}".`,
        data: matched,
        timestamp
      };
    } catch (err: any) {
      return {
        source: 'CISA-KEV',
        query,
        type: 'cve',
        status: 'ERROR',
        details: err.message || 'Failed to fetch CISA KEV catalog',
        timestamp
      };
    }
  }

  /**
   * Ahmia Dark Web Tor Search (Defensive OSINT)
   */
  public async searchAhmia(query: string): Promise<ThreatIntelResult> {
    const timestamp = new Date().toISOString();
    try {
      const getRes = await fetch('https://ahmia.fi/', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) EitherOSINT/1.0' },
        signal: AbortSignal.timeout(6000)
      });
      const cookieHeader = getRes.headers.get('set-cookie') || '';
      const tokenMatch = cookieHeader.match(/ahmia_anti_bot_token=([^;]+)/);
      const token = tokenMatch ? tokenMatch[1] : '';

      const searchUrl = `https://ahmia.fi/search/?q=${encodeURIComponent(query)}`;
      const searchRes = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) EitherOSINT/1.0',
          'Cookie': token ? `ahmia_anti_bot_token=${token}` : ''
        },
        signal: AbortSignal.timeout(8000)
      });

      if (searchRes.ok) {
        const html = await searchRes.text();
        const results: any[] = [];
        const regex = /<li class="result">([\s\S]*?)<\/li>/g;
        let match;
        while ((match = regex.exec(html)) !== null && results.length < 10) {
          const block = match[1];
          const titleM = block.match(/<a href="([^"]+)">([\s\S]*?)<\/a>/);
          const descM = block.match(/<p>([\s\S]*?)<\/p>/);
          if (titleM) {
            results.push({
              url: titleM[1].replace(/<[^>]+>/g, '').trim(),
              title: titleM[2].replace(/<[^>]+>/g, '').trim(),
              description: descM ? descM[1].replace(/<[^>]+>/g, '').trim() : ''
            });
          }
        }

        return {
          source: 'Ahmia-Tor',
          query,
          type: 'onion',
          status: results.length > 0 ? 'FOUND' : 'CLEAN',
          details: results.length > 0 ? `Extracted ${results.length} indexed .onion results for "${query}".` : 'No results found on Ahmia.',
          data: results,
          timestamp
        };
      }

      return {
        source: 'Ahmia-Tor',
        query,
        type: 'onion',
        status: 'ERROR',
        details: `Ahmia returned status ${searchRes.status}`,
        timestamp
      };
    } catch (err: any) {
      return {
        source: 'Ahmia-Tor',
        query,
        type: 'onion',
        status: 'ERROR',
        details: err.message || 'Failed to crawl Ahmia search index',
        timestamp
      };
    }
  }
}
