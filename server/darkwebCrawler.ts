import crypto from 'crypto';
import net from 'net';

export interface CrawledOnion {
  title: string;
  snippet: string;
  onionUrl: string;
  source: string;
  crawledAt: string;
  safetyStatus: 'INDEXED_LEGIT_OSINT' | 'POTENTIAL_THREAT' | 'UNVERIFIED';
}

export interface ThreatIntelligenceReport {
  success: boolean;
  query: string;
  category: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  threatScore: number;
  summary: string;
  torAvailable: boolean;
  torProxy: string;
  crawledOnions: CrawledOnion[];
  cisaKevVulnerabilities: any[];
  threatFoxIocs: any[];
  hibpBreachResult: any;
  findings: Array<{
    indicator: string;
    type: string;
    risk: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    mitigation: string;
  }>;
  mitigationSteps: string[];
  table: {
    headers: string[];
    rows: string[][];
  };
  auditLogId: string;
  firewallStatus: any;
}

/**
 * 1. Real Ahmia .onion Search Crawler with anti-bot token acquisition
 * Performs defensive OSINT querying over Ahmia Tor index
 */
export async function crawlAhmia(query: string): Promise<CrawledOnion[]> {
  try {
    const home = await fetch('https://ahmia.fi/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(6000)
    });
    const homeHtml = await home.text();
    const tokenMatch = /<input type="hidden" name="([0-9a-f]+)" value="([0-9a-f]+)">/i.exec(homeHtml);

    const params = new URLSearchParams();
    params.set('q', query);
    if (tokenMatch) params.set(tokenMatch[1], tokenMatch[2]);

    const res = await fetch('https://ahmia.fi/search/?' + params.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://ahmia.fi/'
      },
      signal: AbortSignal.timeout(9000)
    });

    if (!res.ok) return [];
    const searchHtml = await res.text();
    const results: CrawledOnion[] = [];
    const blockRegex = /<li class="result">([\s\S]*?)<\/li>/gi;
    let block;
    while ((block = blockRegex.exec(searchHtml)) !== null && results.length < 12) {
      const content = block[1];
      const titleMatch = /<h4><a[^>]*>([\s\S]*?)<\/a><\/h4>/i.exec(content);
      const snippetMatch = /<p>([\s\S]*?)<\/p>/i.exec(content);
      const urlMatch = /<cite>([\s\S]*?)<\/cite>/i.exec(content);
      
      const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : 'Active Hidden Service';
      const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      const onionUrl = urlMatch ? urlMatch[1].replace(/<[^>]+>/g, '').trim() : '';

      if (onionUrl) {
        results.push({
          title: title || 'Dark Web Hidden Service',
          snippet: snippet || 'Crawled active .onion endpoint indexed on Ahmia search network.',
          onionUrl,
          source: 'Ahmia Tor Engine',
          crawledAt: new Date().toISOString(),
          safetyStatus: snippet.toLowerCase().includes('escrow') || snippet.toLowerCase().includes('ransom') ? 'POTENTIAL_THREAT' : 'INDEXED_LEGIT_OSINT'
        });
      }
    }
    return results;
  } catch (e: any) {
    console.warn('Ahmia crawler fallback:', e.message);
    return [];
  }
}

/**
 * 2. 100% Free HaveIBeenPwned k-Anonymity SHA-1 Breach API
 * Requires NO PAID API KEY or registration. Queries 5-character SHA-1 range bucket.
 */
export async function checkHIBPBreach(term: string): Promise<any> {
  try {
    const sha1 = crypto.createHash('sha1').update(term.trim()).digest('hex').toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);
    const res = await fetch('https://api.pwnedpasswords.com/range/' + prefix, {
      headers: { 'User-Agent': 'Either-ThreatIntelligence/1.0' },
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) return { checked: false, query: term, error: 'HTTP ' + res.status };
    const text = await res.text();
    const lines = text.split('\n');
    for (const line of lines) {
      const [h, count] = line.trim().split(':');
      if (h === suffix) {
        return {
          checked: true,
          query: term,
          pwned: true,
          occurrences: parseInt(count, 10),
          sha1Prefix: prefix,
          severity: parseInt(count, 10) > 1000 ? 'CRITICAL' : 'HIGH',
          source: 'HaveIBeenPwned (k-Anonymity Free Tier)',
          recommendation: 'Credential was exposed in known dark web breach collections. Immediate credential rotation required.'
        };
      }
    }
    return {
      checked: true,
      query: term,
      pwned: false,
      occurrences: 0,
      sha1Prefix: prefix,
      severity: 'SAFE',
      source: 'HaveIBeenPwned (k-Anonymity Free Tier)',
      recommendation: 'No direct exposure detected in public HIBP breach range catalog.'
    };
  } catch (e: any) {
    return { checked: false, query: term, error: e.message };
  }
}

/**
 * 3. Real CISA Known Exploited Vulnerabilities (KEV) Live Feed
 */
export async function fetchCisaKev(query: string): Promise<any[]> {
  try {
    const res = await fetch('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json', {
      headers: { 'User-Agent': 'Either-ThreatIntel/1.0' },
      signal: AbortSignal.timeout(7000)
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.vulnerabilities || !Array.isArray(data.vulnerabilities)) return [];
    
    const qLower = query.toLowerCase();
    const terms = qLower.split(/\s+/).filter(t => t.length > 2);
    
    const matched = data.vulnerabilities.filter(v => {
      const fullText = (v.cveID + ' ' + v.vendorProject + ' ' + v.product + ' ' + v.vulnerabilityName + ' ' + v.shortDescription).toLowerCase();
      return terms.some(t => fullText.includes(t));
    }).slice(0, 5);

    return matched.map(v => ({
      cve: v.cveID,
      vendor: v.vendorProject,
      product: v.product,
      vulnerabilityName: v.vulnerabilityName,
      dateAdded: v.dateAdded,
      action: v.requiredAction,
      description: v.shortDescription,
      source: 'CISA KEV Feed'
    }));
  } catch (e: any) {
    return [];
  }
}

/**
 * 4. Real ThreatFox / Abuse.ch Live IOC Search
 */
export async function fetchThreatFox(query: string): Promise<any[]> {
  try {
    const term = query.split(/\s+/)[0];
    const res = await fetch('https://threatfox-api.abuse.ch/api/v1/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'search_ioc', search_term: term }),
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (data.query_status === 'ok' && Array.isArray(data.data)) {
      return data.data.slice(0, 6).map(item => ({
        indicator: item.ioc,
        type: item.ioc_type,
        threat: item.threat_type_desc || item.malware_printable,
        confidence: item.confidence_level,
        reporter: item.reporter,
        source: 'abuse.ch ThreatFox'
      }));
    }
    return [];
  } catch (e: any) {
    return [];
  }
}

/**
 * 5. Probe Single TCP Port for Tor SOCKS Proxy
 */
export async function probeSinglePort(host: string, port: number): Promise<boolean> {
  return new Promise(resolve => {
    try {
      const sock = new net.Socket();
      sock.setTimeout(800);
      sock.once('connect', () => { sock.destroy(); resolve(true); });
      sock.once('timeout', () => { sock.destroy(); resolve(false); });
      sock.once('error', () => { sock.destroy(); resolve(false); });
      sock.connect(port, host);
    } catch {
      resolve(false);
    }
  });
}

/**
 * 6. Intelligent Tor Service Auto-Discovery (Port 9050, Port 9150, Custom TOR_PROXY)
 * Returns { available: boolean, proxy: string, mode: string }
 */
export async function discoverTorService(preferredProxy?: string): Promise<{
  available: boolean;
  proxy: string;
  mode: 'Live SOCKS5H Daemon' | 'Tor Browser SOCKS5' | 'Clearnet OSINT Gateway';
}> {
  if (preferredProxy) {
    const [host, portStr] = preferredProxy.replace(/socks5h?:\/\//, '').split(':');
    const port = parseInt(portStr || '9050', 10);
    const ok = await probeSinglePort(host || '127.0.0.1', port);
    if (ok) {
      return { available: true, proxy: preferredProxy, mode: 'Live SOCKS5H Daemon' };
    }
  }

  const daemonActive = await probeSinglePort('127.0.0.1', 9050);
  if (daemonActive) {
    return { available: true, proxy: 'socks5h://127.0.0.1:9050', mode: 'Live SOCKS5H Daemon' };
  }

  const browserActive = await probeSinglePort('127.0.0.1', 9150);
  if (browserActive) {
    return { available: true, proxy: 'socks5h://127.0.0.1:9150', mode: 'Tor Browser SOCKS5' };
  }

  return {
    available: false,
    proxy: 'socks5h://127.0.0.1:9050',
    mode: 'Clearnet OSINT Gateway'
  };
}

export async function probeTorService(torProxy: string = 'socks5h://127.0.0.1:9050'): Promise<boolean> {
  const discovered = await discoverTorService(torProxy);
  return discovered.available;
}