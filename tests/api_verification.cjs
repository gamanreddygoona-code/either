const http = require('http');

const BASE = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';

async function runTests() {
  console.log('====================================================');
  console.log('  EITHER AI WORKSPACE — INTEGRATION TEST SUITE');
  console.log('  Target Base:', BASE);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name, detail) {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name} — ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  // 1. Health Check
  try {
    const res = await fetch(`${BASE}/api/health`);
    const data = await res.json();
    assert(res.status === 200, 'GET /api/health returns 200 OK');
    assert(data.status === 'ok', 'Health status is "ok"');
    assert(typeof data.hasApiKey === 'boolean', 'Health reports API key presence');
  } catch (err) {
    assert(false, 'GET /api/health', err.message);
  }

  // 2. Connectors Status
  try {
    const res = await fetch(`${BASE}/api/connectors`, {
      headers: { 'x-test-suite': 'either-ai-test' }
    });
    const data = await res.json();
    const connectors = data.connectors || {};
    assert(res.status === 200, 'GET /api/connectors returns 200 OK');
    assert(Object.keys(connectors).length >= 15, 'Connectors catalog contains >= 15 apps', `Found ${Object.keys(connectors).length}`);
    assert(connectors.gmail !== undefined, 'Gmail connector definition exists');
    assert(connectors.github !== undefined, 'GitHub connector definition exists');
  } catch (err) {
    assert(false, 'GET /api/connectors', err.message);
  }

  // 3. Auth & JWT Session Generation
  let authToken = '';
  try {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-suite': 'either-ai-test' },
      body: JSON.stringify({ name: 'Integration Tester', email: 'test@either.local' })
    });
    const data = await res.json();
    assert(res.status === 200, 'POST /api/auth/login returns 200 OK');
    assert(data.success === true, 'Login succeeds');
    assert(typeof data.token === 'string' && data.token.length > 20, 'JWT token returned on login');
    authToken = data.token;
  } catch (err) {
    assert(false, 'POST /api/auth/login', err.message);
  }

  // 4. Chat Endpoint (Movie & Reasoning Detection)
  try {
    const res = await fetch(`${BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-suite': 'either-ai-test' },
      body: JSON.stringify({ prompt: 'make a zombie movie' })
    });
    const data = await res.json();
    assert(res.status === 200, 'POST /api/chat returns 200 OK');
    assert(data.success === true, 'Chat response success is true');
    assert(data.movieProduction !== undefined, 'Movie production payload synthesized');
    assert(data.movieProduction?.scenes?.length === 4, 'Movie breakdown includes 4 distinct scenes');
  } catch (err) {
    assert(false, 'POST /api/chat', err.message);
  }

  // 5. Trading Portfolio & Market Data
  try {
    const res = await fetch(`${BASE}/api/trading/portfolio`, {
      headers: { 'x-test-suite': 'either-ai-test' }
    });
    const data = await res.json();
    assert(res.status === 200, 'GET /api/trading/portfolio returns 200 OK');
    assert(data.portfolio !== undefined, 'Portfolio object returned');
    assert(typeof data.portfolio?.totalEquity === 'number', 'Portfolio totalEquity is a number');

    const mktRes = await fetch(`${BASE}/api/trading/market-data?symbol=BTCUSDT&interval=1h`, {
      headers: { 'x-test-suite': 'either-ai-test' }
    });
    const mktData = await mktRes.json();
    assert(mktRes.status === 200, 'GET /api/trading/market-data returns 200 OK');
    assert(mktData.ticker && mktData.ticker.price > 0, 'Live Binance ticker returned');
    assert(Array.isArray(mktData.candles) && mktData.candles.length > 0, 'Candlestick series returned');
  } catch (err) {
    assert(false, 'Trading API Tests', err.message);
  }

  // 6. Trading Order Validation (Guards against invalid inputs)
  try {
    // Bad amount
    const badRes = await fetch(`${BASE}/api/trading/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`, 'x-test-suite': 'either-ai-test' },
      body: JSON.stringify({ symbol: 'BTCUSDT', side: 'BUY', amount: -5 })
    });
    assert(badRes.status === 400, 'POST /api/trading/order rejects negative amount (400 Bad Request)');

    // Valid order
    const orderRes = await fetch(`${BASE}/api/trading/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`, 'x-test-suite': 'either-ai-test' },
      body: JSON.stringify({ symbol: 'BTCUSDT', side: 'BUY', amount: 0.05, type: 'MARKET' })
    });
    const orderData = await orderRes.json();
    assert(orderRes.status === 200, 'POST /api/trading/order executes valid order (200 OK)');
    assert(orderData.success === true, 'Order execution reported success');
  } catch (err) {
    assert(false, 'Trading Order Execution', err.message);
  }

  // 7. Sandbox Command Injection Guard
  try {
    const injRes = await fetch(`${BASE}/api/sandbox/exec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`, 'x-test-suite': 'either-ai-test' },
      body: JSON.stringify({ command: 'dir & whoami' })
    });
    assert(injRes.status === 400, 'POST /api/sandbox/exec blocks shell chaining operator (&)');
  } catch (err) {
    assert(false, 'Sandbox Injection Guard', err.message);
  }

  console.log('\n====================================================');
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runTests();
