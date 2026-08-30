/**
 * EITHER AI WORKSPACE — PHASE 2 & 3 ADVANCED SYSTEMS TEST SUITE
 * 
 * 1. Multi-Agent StateGraph Orchestrator (Architect, Coder, Security Swarm, Approval Gate)
 * 2. Advanced Context Engineering (Token Budgeting, Relevance Sorting)
 * 3. Plugin / Extension Marketplace (Manifest, Dynamic Install, MCP Registration)
 * 4. Real-Time CRDT Collaboration (Yjs-style Delta, Room State, Shared Presence)
 * 5. Local-First Sovereign Vault (Manifest, Encrypted Snapshot)
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log('  ✓ PASS: ' + message);
  } else {
    failedTests++;
    console.error('  ✗ FAIL: ' + message + ' — Assertion failed');
  }
}

async function runPhase2Phase3Tests() {
  console.log('====================================================');
  console.log('  EITHER AI — PHASE 2 & 3 ENTERPRISE SUITE');
  console.log('  Target Base: ' + BASE_URL);
  console.log('====================================================\n');

  // 1. Test Multi-Agent StateGraph Swarm
  console.log('• [1/5] Testing Multi-Agent StateGraph Swarm Orchestration...');
  try {
    const swarmRes = await fetch(BASE_URL + '/api/agents/orchestrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'architect sovereign AI workspace' })
    });
    assert(swarmRes.status === 200, 'POST /api/agents/orchestrate returns 200 OK');
    const swarmData = await swarmRes.json();
    assert(swarmData.success === true, 'Swarm execution reported success');
    assert(swarmData.state.agentOutputs.architect, 'Architect agent produced plan');
    assert(swarmData.state.agentOutputs.coderAgent, 'Coder agent produced parallel output');
    assert(swarmData.state.agentOutputs.securityAgent, 'Security agent produced audit score');
  } catch (err) {
    console.error('  ✗ Multi-Agent Swarm test error:', err.message);
    failedTests++;
  }

  // 2. Test Advanced Context Engineering & Budget Optimizer
  console.log('\n• [2/5] Testing Context Engineering & Token Budget Optimizer...');
  try {
    const ctxRes = await fetch(BASE_URL + '/api/context/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Binance trading and security audit', availableTokens: 2000 })
    });
    assert(ctxRes.status === 200, 'POST /api/context/optimize returns 200 OK');
    const ctxData = await ctxRes.json();
    assert(ctxData.success === true, 'Context optimization success is true');
    assert(ctxData.context.tokensUsed <= 2000, 'Tokens used (' + ctxData.context.tokensUsed + ') strictly obeys budget (2000)');
    assert(Array.isArray(ctxData.context.items), 'Optimized items list returned');
  } catch (err) {
    console.error('  ✗ Context selector test error:', err.message);
    failedTests++;
  }

  // 3. Test Plugin Marketplace
  console.log('\n• [3/5] Testing Plugin / Extension Marketplace...');
  try {
    const marketRes = await fetch(BASE_URL + '/api/plugins/marketplace');
    assert(marketRes.status === 200, 'GET /api/plugins/marketplace returns 200 OK');
    const marketData = await marketRes.json();
    assert(Array.isArray(marketData.plugins) && marketData.plugins.length >= 2, 'Marketplace lists available plugins');

    const installRes = await fetch(BASE_URL + '/api/plugins/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pluginId: 'either-docker-manager' })
    });
    assert(installRes.status === 200, 'POST /api/plugins/install returns 200 OK');
    const installData = await installRes.json();
    assert(installData.success === true, 'Plugin installed and auto-registered with MCP');
  } catch (err) {
    console.error('  ✗ Plugin Marketplace test error:', err.message);
    failedTests++;
  }

  // 4. Test Real-Time CRDT Collaborative Workspace
  console.log('\n• [4/5] Testing Real-Time CRDT Collaborative Workspace...');
  try {
    const roomRes = await fetch(BASE_URL + '/api/collab/room/alpha-squad');
    assert(roomRes.status === 200, 'GET /api/collab/room/alpha-squad returns 200 OK');
    const roomData = await roomRes.json();
    assert(roomData.room.version >= 1, 'Room state initialized with document version ' + roomData.room.version);

    // Update shared presence (cursor & active file)
    const presenceRes = await fetch(BASE_URL + '/api/collab/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: 'alpha-squad',
        presence: {
          userId: 'user-gaman',
          userName: 'Gaman',
          color: '#6366f1',
          cursor: { line: 12, column: 4 },
          activeFile: 'server.ts'
        }
      })
    });
    assert(presenceRes.status === 200, 'POST /api/collab/presence returns 200 OK');
    const presData = await presenceRes.json();
    assert(presData.room.presence['user-gaman'].userName === 'Gaman', 'Shared awareness cursor synchronized');

    // Apply CRDT document delta
    const deltaRes = await fetch(BASE_URL + '/api/collab/delta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: 'alpha-squad',
        delta: {
          docId: 'main.ts',
          operation: 'insert',
          position: 0,
          text: '// Sovereign Collaboration\n',
          author: 'user-gaman'
        }
      })
    });
    assert(deltaRes.status === 200, 'POST /api/collab/delta returns 200 OK');
    const deltaData = await deltaRes.json();
    assert(deltaData.room.content.startsWith('// Sovereign Collaboration'), 'CRDT delta applied cleanly to document content');
  } catch (err) {
    console.error('  ✗ Collab Workspace test error:', err.message);
    failedTests++;
  }

  // 5. Test Local-First Sovereign Vault & Encrypted Snapshot
  console.log('\n• [5/5] Testing Local-First Architecture & Sovereign Vault...');
  try {
    const manifestRes = await fetch(BASE_URL + '/api/local-first/manifest');
    assert(manifestRes.status === 200, 'GET /api/local-first/manifest returns 200 OK');
    const manifestData = await manifestRes.json();
    assert(manifestData.manifest.encrypted === true, 'Local vault manifest reported encrypted storage');

    const snapRes = await fetch(BASE_URL + '/api/local-first/snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passphrase: 'sovereign-vault-pass' })
    });
    assert(snapRes.status === 200, 'POST /api/local-first/snapshot returns 200 OK');
    const snapData = await snapRes.json();
    assert(typeof snapData.snapshot.hmac === 'string' && snapData.snapshot.hmac.length === 64, 'SHA-256 HMAC snapshot generated');
  } catch (err) {
    console.error('  ✗ Local-first test error:', err.message);
    failedTests++;
  }

  console.log('\n====================================================');
  console.log('  RESULTS: ' + passedTests + ' PASSED, ' + failedTests + ' FAILED (Total: ' + totalTests + ')');
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPhase2Phase3Tests().catch(err => {
  console.error('Fatal test failure:', err);
  process.exit(1);
});