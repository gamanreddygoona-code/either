# Littlebird AI Workspace — Desktop

Native Windows desktop app — no website, no Google, no cloud. Runs 100% on your machine.

**Download & Run:**
1. Download `Littlebird-Setup.exe` from the landing page or `release/` folder
2. Double-click to install — creates Desktop shortcut
3. Or run directly: `npm run desktop` (requires Node) or double-click `Littlebird Desktop — Native.lnk` on Desktop

**Live Connectors (15):** Gmail, Drive, Calendar, GitHub, Notion, Slack, Discord, Linear, Asana, Dropbox, Zapier, Hugging Face, Instagram, Facebook, WhatsApp — all validated live.

**Movie Swarm:** Script → 10s scenes → 4 variants per scene → pick 1 → Editor syncs final timeline.

**Dev:**
```
npm install
# set GEMINI_API_KEY in .env
npm run build   # builds dist + server.cjs
npm start       # runs at http://127.0.0.1:3000 (desktop window)
npm run desktop # Electron native window
```
