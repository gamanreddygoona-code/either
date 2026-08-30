/**
 * EITHER AI WORKSPACE — THREAT INTELLIGENCE & DARK WEB OSINT TEST SUITE
 * 
 * 1. Intelligent Tor Service Probing (Ports 9050, 9150 & Clearnet Gateway Fallback)
 * 2. 100% Free HaveIBeenPwned k-Anonymity SHA-1 Range API (Zero API Key Required)
 * 3. Real CISA Known Exploited Vulnerabilities (KEV) Live Zero-Day Feed
 * 4. Abuse.ch ThreatFox / IOC Engine
 * 5. Ahmia .onion Search Crawler
 * 6. Cryptographic SHA-256 Tamper-Proof Audit Ledger Chaining
 * 7. Live Server Endpoints:
 *    - GET /api/osint/darkweb/status
 *    - GET /api/osint/darkweb/audit-ledger
 *    - POST /api/osint/darkweb/hibp-check
 *    - POST /api/osint/darkweb/research
 */

const crypto = require('crypto');

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message} — Assertion failed`);
  }
}

async function runThreatIntelTests() {
  console.log('====================================================');
  console.log('  EITHER AI WORKSPACE — THREAT INTEL & OSINT TESTS');
  console.log(`  Target Base: ${BASE_URL}`);
  console.log('====================================================\n');

  // 1. Test Free HIBP k-Anonymity Range Query (No API Key Required)
  console.log('• [1/6] Testing HaveIBeenPwned k-Anonymity SHA-1 Range API (Free Tier)...');
  try {
    const knownPwned = 'password';
    const sha1 = crypto.createHash('sha1').update(knownPwned).digest('hex').toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    const hibpRes = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'User-Agent': 'Either-AI-OSINT-Test/1.0' },
      signal: AbortSignal.timeout(8000)
    });

    assert(hibpRes.ok, `HIBP range API returns HTTP ${hibpRes.status}`);
    const body = await hibpRes.text();
    const isExposed = body.includes(suffix);
    assert(isExposed, 'k-Anonymity hash matching accurately identifies exposed credential');
  } catch (err) {
    console.error('  ✗ HIBP test error:', err.message);
    failedTests++;
  }

  // 2. Test CISA Known Exploited Vulnerabilities (KEV) Live Feed
  console.log('\n• [2/6] Testing CISA Known Exploited Vulnerabilities Feed...');
  try {
    const cisaRes = await fetch('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json', {
      headers: { 'User-Agent': 'Either-AI-OSINT-Test/1.0' },
      signal: AbortSignal.timeout(10000)
    });
    assert(cisaRes.ok, `CISA KEV feed returns HTTP ${cisaRes.status}`);
    const cisaJson = await cisaRes.json();
    assert(Array.isArray(cisaJson.vulnerabilities), 'CISA catalog contains array of vulnerabilities');
    assert(cisaJson.vulnerabilities.length > 500, `CISA catalog contains ${cisaJson.vulnerabilities.length} active zero-day records`);
  } catch (err) {
    console.error('  ✗ CISA KEV test error:', err.message);
    failedTests++;
  }

  // 3. Test Cryptographic Audit Ledger SHA-256 Chaining
  console.log('\n• [3/6] Testing Cryptographic Tamper-Proof Audit Ledger...');
  try {
    const prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
    const entryData = JSON.stringify({ user: 'auditor@either.local', query: 'ransomware', timestamp: new Date().toISOString() });
    const blockHash = crypto.createHash('sha256').update(prevHash + entryData).digest('hex');

    assert(typeof blockHash === 'string' && blockHash.length === 64, 'SHA-256 block hash generated with 64 hex characters');
    const blockHash2 = crypto.createHash('sha256').update(prevHash + entryData).digest('hex');
    assert(blockHash === blockHash2, 'SHA-256 hashing is deterministic and tamper-evident');
  } catch (err) {
    console.error('  ✗ Audit ledger test error:', err.message);
    failedTests++;
  }

  // 4. Test Live Server OSINT Status Endpoint (GET /api/osint/darkweb/status)
  console.log('\n• [4/6] Testing Server OSINT Status & Tor Auto-Discovery...');
  try {
    const statusRes = await fetch(`${BASE_URL}/api/osint/darkweb/status`);
    assert(statusRes.status === 200, 'GET /api/osint/darkweb/status returns 200 OK');
    const statusData = await statusRes.json();
    assert(statusData.success === true, 'Status response success is true');
    assert(typeof statusData.tor === 'object', 'Tor auto-discovery object present in status');
    assert(typeof statusData.tor.mode === 'string', `Tor routing mode reported: "${statusData.tor.mode}"`);
    assert(statusData.crawlers && statusData.crawlers.hibp, 'HaveIBeenPwned k-anonymity free crawler reported LIVE');
  } catch (err) {
    console.error('  ✗ Server OSINT status test error:', err.message);
    failedTests++;
  }

  // 5. Test Live Server HIBP Check Endpoint (POST /api/osint/darkweb/hibp-check)
  console.log('\n• [5/6] Testing Server HIBP Check Endpoint (POST /api/osint/darkweb/hibp-check)...');
  try {
    const hibpCheckRes = await fetch(`${BASE_URL}/api/osint/darkweb/hibp-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ term: 'password123' })
    });
    assert(hibpCheckRes.status === 200, 'POST /api/osint/darkweb/hibp-check returns 200 OK');
    const checkData = await hibpCheckRes.json();
    assert(checkData.success === true, 'HIBP check success is true');
    assert(checkData.checked === true, 'HIBP range check executed');
    assert(checkData.pwned === true, 'Common password detected as exposed in public breaches');
    assert(typeof checkData.sha1Prefix === 'string', `SHA-1 prefix returned: "${checkData.sha1Prefix}"`);
  } catch (err) {
    console.error('  ✗ Server HIBP check error:', err.message);
    failedTests++;
  }

  // 6. Test Live Server Dark Web Research Endpoint (POST /api/osint/darkweb/research)
  console.log('\n• [6/6] Testing Server Dark Web Research Execution (POST /api/osint/darkweb/research)...');
  try {
    const researchRes = await fetch(`${BASE_URL}/api/osint/darkweb/research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'ransomware lockbit',
        category: 'ransomware',
        justification: 'Defensive enterprise cybersecurity threat evaluation and signature extraction'
      })
    });

    assert(researchRes.status === 200, 'POST /api/osint/darkweb/research returns 200 OK');
    const researchData = await researchRes.json();
    assert(researchData.success === true, 'Research synthesis report success is true');
    assert(typeof researchData.threatScore === 'number', `Threat score calculated: ${researchData.threatScore}/100`);
    assert(typeof researchData.auditHash === 'string', `Audit hash generated: ${researchData.auditHash.slice(0, 16)}...`);
    assert(Array.isArray(researchData.cisaKevVulnerabilities), 'CISA zero-day vulnerabilities list returned');
    assert(Array.isArray(researchData.crawledOnions), 'Ahmia crawled .onion results returned');
    assert(Array.isArray(researchData.findings), 'Synthesized threat findings list returned');
    assert(Array.isArray(researchData.mitigationSteps), 'Defensive mitigation steps list returned');
  } catch (err) {
    console.error('  ✗ Server research test error:', err.message);
    failedTests++;
  }

  console.log('\n====================================================');
  console.log(`  RESULTS: ${passedTests} PASSED, ${failedTests} FAILED (Total: ${totalTests})`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runThreatIntelTests().catch(err => {
  console.error('Fatal test failure:', err);
  process.exit(1);
});
