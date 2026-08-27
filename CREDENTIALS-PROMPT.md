# Master Prompt — Connect Every Littlebird Plugin

Copy everything below the line and paste it to your AI assistant.

---

You are configuring **Littlebird AI Workspace** (project root: `Littlebird-AI-Workspace`, server: Express on port 3000, started with `npm run dev`).

**Your job:** guide me step-by-step to obtain every missing credential, then for each one: add it to `.env` safely, restart the server, validate it against the LIVE provider API, and prove the connector flipped to `connected` with real data. Never simulate, never fake success, never mark anything connected without a passing live API call.

## Rules
- Add secrets to `.env` via a script that appends with a trailing-newline guard (this file previously fused lines and silently broke the Gemini key — check for that bug every time).
- After each `.env` change: fully restart the server (kill the process tree holding port 3000, including the tsx watcher parent, then `npm run dev` again).
- Verify each credential with the real validation endpoint before claiming success. Show me the proof.
- Never print full secrets back to me — show only first 6 chars + length.
- `.oauth/` must stay gitignored. Tokens saved there are local-only.

## Credentials to collect (in this order)

### 1. GOOGLE_CLIENT_SECRET — completes Gmail OAuth (ID already in .env)
- I created OAuth client "tool" (Web application) in Google Cloud project `plasma-cascade-497416-a3`.
- Redirect URI `http://localhost:3000/auth/google/callback` must be in "Authorized redirect URIs" and SAVED.
- Gmail API enabled; my account added as Test user if consent screen is in Testing mode.
- Get the `GOCSPX-…` secret from the client's "Client secrets" panel.
- **Test:** open `http://localhost:3000/auth/google` → real Google consent → callback auto-closes → `GET /api/connectors` shows gmail `connected` with my real address → `POST /api/connectors/gmail/sync` returns my latest 8 real emails.

### 2. NOTION_TOKEN
- Create at notion.so/profile/integrations → New integration → copy Internal Integration Secret (`ntn_…`/`secret_…`).
- Remind me: share target Notion pages with the integration (••• → Connections), or the API sees nothing.
- **Validate:** `GET https://api.notion.com/v1/users/me` with `Authorization: Bearer <token>` and `Notion-Version` header.

### 3. SLACK_BOT_TOKEN
- Create at api.slack.com/apps → New App → OAuth & Permissions → add `channels:history`, `channels:read` scopes → Install to Workspace → copy `xoxb-…`.
- **Validate:** `POST https://slack.com/api/auth.test` with `Authorization: Bearer xoxb-…`.

### 4. DISCORD_BOT_TOKEN
- Create at discord.com/developers/applications → New Application → Bot → Reset Token.
- **Validate:** `GET https://discord.com/api/v10/users/@me` with `Authorization: Bot <token>`.

### 5. META_ACCESS_TOKEN — covers Facebook + Instagram
- Create at developers.facebook.com/apps → Business app → Graph API Explorer → add `pages_show_list`, `pages_read_engagement`, `instagram_basic`, `instagram_manage_insights` → Generate Access Token (`EAAG…`).
- **Validate:** `GET https://graph.facebook.com/v21.0/me?fields=name` with the token.
- Note: short-lived tokens expire ~1-2h; walk me through exchanging for a long-lived Page token.

### 6. GitHub OAuth login — already configured, just finish it
- Client ID/secret are in `.env`; callback `http://localhost:3000/auth/github/callback` is registered.
- Open `http://localhost:3000/auth/github` in a browser, authorize, confirm `.oauth/github-user.json` is written and the session is authenticated.

## Already live (verify, don't redo)
- `GEMINI_API_KEY` (model `gemini-2.5-flash-lite`) — chat must answer in `mode: live`
- `GITHUB_TOKEN` — connector connected via PAT with real repos
- Server binds `127.0.0.1`; folder-inspect guard active — keep it that way.

## Optional (ask me if I want them)
- `FIREBASE_API_KEY` — flips Firebase status from "local-only" to real
- `LITTLEBIRD_ADMIN_TOKEN` — lets me inspect folders outside the project via `x-lb-token` header
- `LITTLEBIRD_VPS_HOST` / `LITTLEBIRD_VPS_PORT` — adds a real second server node
- WhatsApp Cloud API (`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`) and Google Calendar (`calendar.readonly` scope + sync endpoint) are NOT built yet — offer to implement them with real validation before asking for their tokens.

## Finish line
When everything is in, print a final table: connector → env var → validation endpoint → HTTP result → connector status, and tell me which items (if any) are still pending and exactly why.
