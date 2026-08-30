# Either AI Workspace

> **The Sovereign AI Canvas, Multi-Agent OS & Desktop App**
> React 19 • Vite 6 • Electron 44 • Express 4 • TypeScript 5.8 • Google Gemini API

---

## 📊 Current Status & Feature Matrix

| Feature Component | Status | Details |
| :--- | :--- | :--- |
| **Google Gemini AI Core** | 🟢 **Operational** | Integrated via `@google/genai` (`gemini-3.5-flash` / `gemini-2.5-pro`) |
| **Model Context Protocol (MCP)** | 🟢 **Operational** | Standard 2024-11-05 spec with 11 tools (FS, Git, Threat Intel, Browser, DB) |
| **Vector RAG & GraphRAG** | 🟢 **Operational** | 128-d cosine space, token chunking, AST entity relations, hybrid BM25 |
| **Multi-Layer Agent Memory** | 🟢 **Operational** | Episodic, Semantic, Procedural, and Working memory with persistence |
| **Multi-Agent Swarm Orchestrator** | 🟢 **Operational** | Stateful graph, checkpoints, human-in-the-loop gates, parallel agents |
| **Context Selector** | 🟢 **Operational** | Token budget optimization and multi-source priority packing |
| **Plugin Marketplace** | 🟢 **Operational** | Sandboxed manifests (`fs:read`, `mcp:use`), dynamic MCP registration |
| **Real-Time CRDT Collaboration**| 🟢 **Operational** | Yjs-style CRDT delta sync, multi-user cursor presence, shared rooms |
| **Local-First Sovereign Vault** | 🟢 **Operational** | Encrypted local storage with SHA-256 HMAC snapshot generation |
| **Threat Intelligence & OSINT** | 🟢 **Operational** | Live HIBP k-anonymity (free), CISA KEV zero-day feed, Ahmia Tor gateway |
| **Live Binance Trading Engine** | 🟢 **Operational** | Real-time Binance spot market data, candlestick charts, portfolio ledger |
| **15 Service Connectors** | 🟡 **DIY Setup** | Connector definitions included for 15 services. Each requires manual OAuth/API key setup. See `CONNECTORS-DIY.md` |
| **Wi-Fi / CCTV Camera Hub** | 🟢 **Operational** | Live TCP socket reachability test & RTSP stream handshake. Real errors returned when cameras are offline |

---

## ⚡ Quick Start & Installation

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **Google Gemini API Key**: [Get a free API key](https://aistudio.google.com/app/apikey)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/gamanreddygoona-code/either.git
cd either
npm install
```

### 2. Environment Configuration
Copy the template and set your `GEMINI_API_KEY`:
```bash
cp .env.example .env
```

Edit `.env` and add your key:
```env
GEMINI_API_KEY=AIzaSy...
PORT=3000
```

### 3. Build & Run
```bash
# Build Vite frontend & Express server
npm run build

# Start server
npm start
```

Open your browser at [http://127.0.0.1:3000](http://127.0.0.1:3000) or launch Electron desktop app:
```bash
npm run electron
```

---

## 🧪 Testing

Run the automated integration test suites (101 passing tests):
```bash
npm test
```

---

## 🔒 Security Architecture
* **Sandboxed Electron**: `enable-sandbox` enabled, `nodeIntegration: false`, `contextIsolation: true`.
* **Path-Jail Validation**: Blocks path traversal (`..`) and directory escape.
* **Authentication**: Authorization Bearer session tokens with rate-limiting and HTML stripping.
* **Tamper-Proof Audit Ledger**: SHA-256 hash chains for all sensitive operations.

---

## 🌐 Deployments
* **Primary Production**: [https://either-ai.vercel.app](https://either-ai.vercel.app)
* **Mirror Production**: [https://littlebird-ai.vercel.app](https://littlebird-ai.vercel.app)
