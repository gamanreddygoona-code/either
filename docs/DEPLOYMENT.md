# 🚀 Either AI Workspace — Production Deployment Guide

This guide provides comprehensive deployment and packaging instructions for Either AI across **Vercel (Cloud)**, **Electron Builder (Windows / Desktop)**, and **Chrome Extension (Browser Companion)**.

---

## 1. ☁️ Vercel Deployment (Fullstack API + Frontend)

Either AI is deployed as a hybrid application: Vite SPA static frontend with an Express API bundled as a Vercel serverless function.

### A. Required Environment Variables on Vercel
Set the following in your Vercel Project Dashboard (**Settings -> Environment Variables**):
- `GEMINI_API_KEY`: Google Gemini API key from AI Studio.
- `GEMINI_MODEL`: Model override (recommended: `gemini-3.5-flash`).
- `SESSION_SECRET`: 32-byte secret key for signing user JWT session tokens.
- `EITHER_ADMIN_TOKEN`: Secure admin token required for privileged actions.
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google Cloud OAuth credentials.
- `GITHUB_TOKEN`: GitHub Personal Access Token (`repo`, `user` scopes).
- `NOTION_TOKEN`: Notion Internal Integration Secret (`ntn_...`).
- `SLACK_BOT_TOKEN`: Slack Bot OAuth Token (`xoxb-...`).
- `DISCORD_BOT_TOKEN`: Discord Application Bot Token.

### B. Build and Deploy Commands
```bash
# 1. Compile frontend and bundle backend serverless functions
npm run build

# 2. Deploy to Vercel Production
npx vercel --prod --yes

# 3. Assign Custom Domain Alias
npx vercel alias set <deployment-url> either-ai.vercel.app
```

### C. Live Production Health Verification
```bash
curl https://either-ai.vercel.app/api/health
```

---

## 2. 🖥️ Electron Desktop Application (Windows, macOS, Linux)

Either AI Desktop runs Electron 44 with Multi-Process Chromium Sandboxing, Content Security Policy headers, and safe IPC communication.

### A. Local Development
```bash
npm run desktop:dev
```

### B. Production Installer Packaging (Windows NSIS & Standalone .exe)
```bash
# 1. Compile web bundle
npm run build

# 2. Build Windows NSIS Installer (.exe with auto-update support)
npm run dist:desktop

# 3. Build Portable Windows Standalone Executable
npm run dist:desktop:portable
```

### C. Generated Binaries Location
- `dist-electron/Either AI Workspace Setup.exe`
- `dist-electron/Either AI Workspace Portable.exe`

### D. Security Controls in Desktop Application
1. **Sandbox Enforced**: `webPreferences.sandbox = true` (zero `no-sandbox` switch).
2. **Strict CSP**: Enforces `default-src 'self'` and restricts network connects exclusively to allowlisted endpoints.
3. **Navigation Interceptor**: `will-navigate` blocks unallowlisted domain redirects, delegating external links to `shell.openExternal`.

---

## 3. 🧩 Chrome Extension (Browser Sidecar Companion)

The Either AI Chrome Extension allows users to execute browser agent tasks, summarize tabs, and discover tokens directly in Chrome, Brave, and Edge.

### A. Extension Architecture
- `manifest.json`: Manifest V3 specification with `activeTab`, `storage`, and `scripting` permissions.
- `background.js`: Background service worker communicating with `http://127.0.0.1:3000` or `https://either-ai.vercel.app`.
- `popup.html` & `popup.js`: Interactive popup UI for running instant AI routines.

### B. Installing in Google Chrome / Brave
1. Open `chrome://extensions`.
2. Enable **Developer mode** toggle in top-right.
3. Click **Load unpacked** button.
4. Choose the `extension` folder inside the workspace.

---

## 4. 🧪 Automated Integration Verification Suite

Execute the automated test suite locally or in CI/CD:
```bash
node tests/api_verification.cjs
```
