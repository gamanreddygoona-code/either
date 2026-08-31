/**
 * EITHER AI WORKSPACE — ADVANCED FOUNDATION SYSTEMS TEST SUITE
 * 
 * 1. Model Context Protocol (MCP) Server Hub (Filesystem, Git, Threat Intel, Browser)
 * 2. Context Engine & Vector RAG with GraphRAG entity extraction
 * 3. Multi-Layer Memory Engine (Episodic, Semantic, Procedural, Working with TTL)
 * 4. Stateful LangGraph Agent Orchestrator with Checkpoints & Human-In-The-Loop
 * 5. Multi-Model Router (Gemini 3.5, Gemini 2.5 Pro, Ollama local-first)
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

async function runFoundationTests() {
  console.log('====================================================');
  console.log('  EITHER AI — ADVANCED FOUNDATIONS TEST SUITE');
  console.log('  Target Base: ' + BASE_URL);
  console.log('====================================================\n');

  // 1. Test Model Context Protocol (MCP) Hub
  console.log('• [1/5] Testing Model Context Protocol (MCP) Standard Server Hub...');
  try {
    const toolsRes = await fetch(BASE_URL + '/api/mcp/tools', { headers: { 'x-test-suite': 'either-ai-test' } });
    assert(toolsRes.status === 200, 'GET /api/mcp/tools returns 200 OK');
    const toolsData = await toolsRes.json();
    assert(Array.isArray(toolsData.tools), 'MCP tools list returned');
    assert(toolsData.tools.length >= 7, 'MCP registered ' + toolsData.tools.length + ' standard tools (Filesystem, Git, Threat Intel, Browser, DB)');
    
    // Call MCP Tool: fs_read_file
    const readRes = await fetch(BASE_URL + '/api/mcp/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-suite': 'either-ai-test' },
      body: JSON.stringify({ name: 'fs_read_file', arguments: { path: 'package.json' } })
    });
    assert(readRes.status === 200, 'POST /api/mcp/call (fs_read_file) returns 200 OK');
    const readData = await readRes.json();
    assert(readData.success === true, 'fs_read_file executed successfully');
    assert(readData.result.content[0].text.includes('react-example') || readData.result.content[0].text.includes('version'), 'File content read correctly via MCP');
  } catch (err) {
    console.error('  ✗ MCP Hub test error:', err.message);
    failedTests++;
  }

  // 2. Test Vector RAG & Graph Engine
  console.log('\n• [2/5] Testing Vector RAG & Graph Knowledge Engine...');
  try {
    // Index a sample technical document
    const indexRes = await fetch(BASE_URL + '/api/rag/index', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-suite': 'either-ai-test' },
      body: JSON.stringify({
        source: 'docs/architecture_sample.md',
        content: 'Either AI Workspace incorporates a sovereign AI Firewall, LangGraph orchestration, and Binance trading engine.'
      })
    });
    assert(indexRes.status === 200, 'POST /api/rag/index returns 200 OK');
    const indexData = await indexRes.json();
    assert(indexData.indexedChunks > 0, 'Vector engine indexed ' + indexData.indexedChunks + ' chunks into high-dimensional space');

    // Search with semantic similarity
    const searchRes = await fetch(BASE_URL + '/api/rag/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-suite': 'either-ai-test' },
      body: JSON.stringify({ query: 'Binance trading engine architecture', topK: 3 })
    });
    assert(searchRes.status === 200, 'POST /api/rag/search returns 200 OK');
    const searchData = await searchRes.json();
    assert(searchData.count > 0, 'Vector RAG matched ' + searchData.count + ' relevant chunks by cosine similarity');
    assert(searchData.results[0].score > 0.3, 'Top result score: ' + searchData.results[0].score);
  } catch (err) {
    console.error('  ✗ Vector RAG test error:', err.message);
    failedTests++;
  }

  // 3. Test Multi-Layer Persistent Memory Engine (Cognee / Mem0-style)
  console.log('\n• [3/5] Testing Multi-Layer Persistent Memory Engine...');
  try {
    const statsRes = await fetch(BASE_URL + '/api/memory/stats', { headers: { 'x-test-suite': 'either-ai-test' } });
    assert(statsRes.status === 200, 'GET /api/memory/stats returns 200 OK');
    const statsData = await statsRes.json();
    assert(typeof statsData.stats.semanticFacts === 'number', 'Semantic memory facts count present');
    assert(typeof statsData.stats.proceduralWorkflows === 'number', 'Procedural memory playbooks count present');

    const semRes = await fetch(BASE_URL + '/api/memory/semantic', { headers: { 'x-test-suite': 'either-ai-test' } });
    assert(semRes.status === 200, 'GET /api/memory/semantic returns 200 OK');
    const semData = await semRes.json();
    assert(semData.facts.length > 0, 'Semantic memory contains structured knowledge graph facts');
  } catch (err) {
    console.error('  ✗ Memory Engine test error:', err.message);
    failedTests++;
  }

  // 4. Test Stateful LangGraph-Style Agent Orchestrator with Checkpoints & Human-in-the-Loop
  console.log('\n• [4/5] Testing Stateful LangGraph Agent Orchestrator & Checkpoints...');
  try {
    // Run pipeline for standard query
    const graphRes = await fetch(BASE_URL + '/api/agent/graph/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-suite': 'either-ai-test' },
      body: JSON.stringify({ query: 'analyze security vulnerabilities in code' })
    });
    assert(graphRes.status === 200, 'POST /api/agent/graph/run returns 200 OK');
    const graphData = await graphRes.json();
    assert(graphData.success === true, 'Graph execution success is true');
    assert(graphData.state.currentNode === 'COMPLETED', 'State machine transitioned to COMPLETED');
    assert(graphData.state.history.length >= 4, 'Graph recorded ' + graphData.state.history.length + ' state transitions');

    // Test High-Risk Action triggering Human-In-The-Loop gate
    const riskRes = await fetch(BASE_URL + '/api/agent/graph/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-suite': 'either-ai-test' },
      body: JSON.stringify({ query: 'buy btc with 5000 USD and reset portfolio' })
    });
    const riskData = await riskRes.json();
    assert(riskData.state.currentNode === 'HUMAN_APPROVAL', 'High-risk action paused at HUMAN_APPROVAL node');
    assert(riskData.state.humanApprovalRequired === true, 'humanApprovalRequired flagged true');

    // Resume Human Approval
    const approveRes = await fetch(BASE_URL + '/api/agent/graph/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-suite': 'either-ai-test' },
      body: JSON.stringify({ executionId: riskData.state.executionId, approve: true })
    });
    assert(approveRes.status === 200, 'POST /api/agent/graph/approve returns 200 OK');
    const approveData = await approveRes.json();
    assert(approveData.state.currentNode === 'COMPLETED', 'Human approval resumed and transitioned state to COMPLETED');
  } catch (err) {
    console.error('  ✗ Agent Graph test error:', err.message);
    failedTests++;
  }

  // 5. Test Multi-Model Router
  console.log('\n• [5/5] Testing Sovereign Multi-Model Router...');
  try {
    const provRes = await fetch(BASE_URL + '/api/models/providers', { headers: { 'x-test-suite': 'either-ai-test' } });
    assert(provRes.status === 200, 'GET /api/models/providers returns 200 OK');
    const provData = await provRes.json();
    assert(provData.providers.gemini.available === true, 'Gemini provider available');
    assert(provData.providers.ollama.available === true, 'Ollama local-first provider available');
    
    const genRes = await fetch(BASE_URL + '/api/models/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-suite': 'either-ai-test' },
      body: JSON.stringify({ prompt: 'Say hello in 3 words' })
    });
    assert(genRes.status === 200, 'POST /api/models/generate returns 200 OK');
    const genData = await genRes.json();
    assert(genData.success === true && genData.result.content.length > 0, 'Multi-model generator returned valid synthesis');
  } catch (err) {
    console.error('  ✗ Multi-Model test error:', err.message);
    failedTests++;
  }

  console.log('\n====================================================');
  console.log('  RESULTS: ' + passedTests + ' PASSED, ' + failedTests + ' FAILED (Total: ' + totalTests + ')');
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runFoundationTests().catch(err => {
  console.error('Fatal test failure:', err);
  process.exit(1);
});