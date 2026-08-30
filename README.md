# 🛡️ Either AI Workspace — Sovereign Autonomous AI OS

[![Integration Tests](https://img.shields.io/badge/Integration%20Tests-24%2F24%20Passing-brightgreen)](tests/api_verification.cjs)
[![Threat Intel & OSINT](https://img.shields.io/badge/OSINT%20%26%20DarkWeb-25%2F25%20Passing-blue)](tests/threat_intel.test.cjs)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

Either AI Workspace is a sovereign, privacy-first AI operating system featuring autonomous agent swarms, real-time dark web OSINT threat intelligence, live Binance trading desk, Playwright autonomous browser automation, and unbypassable AI Firewall security.

**Live Production URLs:**
* [https://either-ai.vercel.app](https://either-ai.vercel.app)
* [https://littlebird-ai.vercel.app](https://littlebird-ai.vercel.app)

---

## 🧅 Dark Web OSINT & Threat Intelligence Architecture

Either AI includes an enterprise-grade, defensive threat intelligence engine built for security researchers, SOC analysts, and privacy enthusiasts:

### 1. 🔍 Tor Onion Crawler & Auto-Discovery
* **Multi-Port Probing:** Automatically detects active Tor daemons on standard port `9050` (Tor SOCKS5H service) or port `9150` (Tor Browser bundle).
* **Clearnet Gateway Fallback:** If no local Tor binary is running, queries are seamlessly routed through defensive Ahmia clearnet indexes without timeout failures.
* **Ahmia .onion Crawler:** Live anti-bot session negotiation and query execution over Ahmia Tor index.

### 2. 🔑 100% Free HaveIBeenPwned (HIBP) k-Anonymity
* **Zero API Key Required:** Queries the public HaveIBeenPwned k-anonymity SHA-1 range API (`https://api.pwnedpasswords.com/range/{hash5}`).
* **Zero Secret Leakage:** Only the first 5 characters of SHA-1 hash digests are transmitted over TLS, preserving complete credential privacy.
* **Optional Paid HIBP Key:** Setting `HIBP_API_KEY` in `.env` enriches results with specific breached database identities.

### 3. 🚨 Live Vulnerability & IOC Feeds
* **CISA Known Exploited Vulnerabilities (KEV):** Real-time federal zero-day vulnerability catalog queries.
* **Abuse.ch ThreatFox:** Live malware and ransomware IOC indicator telemetry.
* **Cryptographic Tamper-Proof Audit Ledger:** Every defensive research query is cryptographically hashed with SHA-256 and appended to the blockchain audit log.

---

## 🤖 Playwright Autonomous Browser Agent
* **Headless Chromium Execution:** Automated DOM navigation and form inspection.
* **Developer Key Discovery:** Automatically discovers developer tokens (Linear, GitHub, Notion, Slack, Zapier) and persists them securely into `.env`.
* **Visual Snapshots:** Preserves full viewport evidence screenshots into `.browser-snapshots/`.

---

## 📈 Real-Time AI Trading Desk
* **Binance Spot API:** Real candlestick and order book streaming.
* **Technical Analysis Engine:** Computes RSI (14), EMA (20), Bollinger Bands, and MACD.
* **Autonomous Trading Bot:** Algorithmic execution with risk stops and maximum position caps.

---

## 🧪 Comprehensive Automated Test Suites

### 1. Core API & Security Hardening (24/24 Passed)
```bash
node tests/api_verification.cjs
```

### 2. Dark Web OSINT & Threat Intelligence (25/25 Passed)
```bash
node tests/threat_intel.test.cjs
```

---

## 💻 Quickstart

```bash
# 1. Install dependencies & Playwright browser
npm install
npx playwright install chromium

# 2. Configure environment
cp .env.example .env

# 3. Build & Run
npm run build
npm start
```
