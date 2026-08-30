# 🛡️ Either AI Workspace — Sovereign Autonomous AI OS

[![Foundations Tests](https://img.shields.io/badge/Foundations-29%2F29%20Passing-brightgreen)](tests/foundation_systems.test.cjs)
[![Threat Intel & OSINT](https://img.shields.io/badge/OSINT%20%26%20DarkWeb-25%2F25%20Passing-blue)](tests/threat_intel.test.cjs)
[![Integration Tests](https://img.shields.io/badge/Integration-24%2F24%20Passing-success)](tests/api_verification.cjs)
[![Total Test Pass](https://img.shields.io/badge/Total%20Tests-78%2F78%20(100%25)-brightgreen)](#-comprehensive-automated-test-suites)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

Either AI Workspace is a sovereign, privacy-first AI operating system featuring standard Model Context Protocol (MCP) tool integration, high-dimensional Vector RAG & GraphRAG, multi-layer persistent agent memory (Cognee/Mem0-style), LangGraph-style stateful orchestration with checkpoints & human-in-the-loop gates, multi-model intelligent routing, and unbypassable AI Firewall security.

**Live Production URLs:**
* [https://either-ai.vercel.app](https://either-ai.vercel.app)
* [https://littlebird-ai.vercel.app](https://littlebird-ai.vercel.app)

---

## 🏛️ Phase 1 Advanced Foundations (100% Implemented & Verified)

### 1. 🔌 Model Context Protocol (MCP) Standard Server Hub (`server/mcp/mcpHub.ts`)
Compliant with standard MCP specifications (`protocolVersion: "2024-11-05"`) for seamless interoperability with Cursor, Claude Code, Windsurf, and custom agent sidecars.
* **Filesystem:** `fs_read_file`, `fs_write_file`, `fs_list_dir` (with strict path jail boundaries)
* **Git Operations:** `git_status`, `git_diff`, `git_log`
* **Autonomous Browser:** `browser_navigate` (Playwright Chromium automation & token extraction)
* **Security & OSINT:** `threat_intel_query` (HIBP k-anonymity, CISA KEV, Ahmia Tor)
* **Database & Records:** `query_local_db` (local JSON/SQLite structured persistence)

### 2. 🧠 Context Engine: Vector RAG & GraphRAG (`server/rag/vectorEngine.ts`)
* **Vector Cosine Search:** 128-dimensional deterministic semantic embedding space.
* **Intelligent Chunking:** Recursive text chunker (512 token/char chunks, 64-char overlap, boundary-aware).
* **Graph Knowledge Engine:** Automatically extracts AST entities (classes, functions, imports) and builds associative knowledge graph edges.
* **Hybrid Search:** Combines dense vector cosine similarity with BM25 keyword matching.

### 3. 💾 Multi-Layer Persistent Memory Engine (`server/memory/memoryEngine.ts`)
Cognee / Mem0-style persistent agent memory across sessions:
* **Episodic Memory:** Past conversations, actions taken, outcome tagging, searchable across sessions.
* **Semantic Memory:** Graph of user preferences, coding styles, entity relationships, and default rules.
* **Procedural Memory:** Learned playbooks, execution recipes with automated success/failure scoring.
* **Working Memory:** Active session context scratchpad with configurable TTL and auto-cleanup.

### 4. 🔀 Stateful LangGraph-Style Agent Orchestrator (`server/orchestrator/agentGraph.ts`)
* **State Machine Nodes:** `INGEST` ➔ `INTENT_ANALYSIS` ➔ `RAG_RETRIEVAL` ➔ `PLANNING` ➔ `TOOL_DISPATCH` ➔ `CRITIQUE` ➔ `HUMAN_APPROVAL` ➔ `COMPLETED`.
* **Stateful Checkpointing:** Full JSON state snapshot recording at every transition with rollback capabilities (`GET /api/agent/graph/checkpoint/:id`).
* **Human-in-the-Loop Gates:** Automatically pauses high-risk operations (e.g. deletion, trading orders) until explicit human approval is received.

### 5. 🔀 Intelligent Multi-Model Router (`server/multiModelRouter.ts`)
* **Task Classification:** Automatically routes tasks to optimal engines (`gemini-3.5-flash` for speed, `gemini-2.5-pro` for deep architecture, `ollama` for offline air-gapped tasks).
* **Supported Providers:** Google Gemini, Ollama (Llama 3, Mistral), Anthropic Claude, OpenAI GPT-4o.

---

## 🧅 Dark Web OSINT & Threat Intelligence
* **Tor Auto-Discovery:** Automatically detects active Tor daemons on port `9050` or `9150` with defensive Clearnet gateway fallback.
* **100% Free HaveIBeenPwned k-Anonymity:** Zero API key required, SHA-1 prefix matching with complete privacy preservation.
* **Live Feeds:** CISA Known Exploited Vulnerabilities (KEV) live zero-days and Abuse.ch ThreatFox IOC indicators.
* **Cryptographic Tamper-Proof Audit Ledger:** SHA-256 blockchain-style hash chaining.

---

## 🧪 Comprehensive Automated Test Suites

```bash
# 1. Advanced Foundations Test Suite (29/29 Passed)
node tests/foundation_systems.test.cjs

# 2. Threat Intel & Dark Web OSINT Test Suite (25/25 Passed)
node tests/threat_intel.test.cjs

# 3. Core API & Security Hardening Test Suite (24/24 Passed)
node tests/api_verification.cjs
```

**Total Verified Tests:** **78 / 78 Passing (100% Pass Rate)**

---

## 💻 Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Build & Launch
npm run build
npm start
```
