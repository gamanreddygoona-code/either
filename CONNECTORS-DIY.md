# Connectors — Do It Yourself Task List

Work top to bottom. Check off as you go. **Golden rule for `.env`:** open it in Notepad, put each new variable on its OWN line, and press **Enter after the last line** before saving (a missing final newline once fused two lines here and silently broke the Gemini key).

## Universal: after adding any token to `.env`
1. Save `.env` (each var on its own line, trailing newline!)
2. Restart the server: go to the terminal/IDE window running it → **Ctrl+C** → run `npm run dev`
   (If it auto-respawns anyway, close that whole terminal window first, then start fresh.)
3. Verify: open `http://localhost:3000/api/connectors` — your connector should say `"status": "connected"` within ~10s of boot (boot-time live validation).

---

## ☐ 1. Gmail (Google) — 3 minutes
- [ ] console.cloud.google.com/apis/credentials → click client **"tool"**
- [ ] Right panel **Client secrets** → copy the `GOCSPX-…` value
- [ ] Confirm **Authorized redirect URIs** contains exactly `http://localhost:3000/auth/google/callback` → **Save**
- [ ] Google Auth Platform → **Audience** → if Publishing status is *Testing*, add your Gmail under **Test users**
- [ ] `.env`: `GOOGLE_CLIENT_SECRET=GOCSPX-…`
- [ ] Restart → open `http://localhost:3000/auth/google` → choose account → **Advanced → Go to (unsafe) → Allow**
- [ ] Verify: `http://localhost:3000/api/connectors` → gmail `connected` with your address → click **Sync** in the app → your real 8 latest emails appear

## ☐ 2. GitHub login — 30 seconds (already configured)
- [ ] Open `http://localhost:3000/auth/github` → **Authorize**
- [ ] Tab says "✅ Signed in as @gamanreddygoona-code" and auto-closes

## ☐ 3. Notion — 5 minutes
- [ ] notion.so/profile/integrations → **+ New integration** → type **Internal**, name `Littlebird` → Create
- [ ] **Capabilities** tab: enable *Read content*, *Read user info* (incl. email)
- [ ] **Secrets** tab → Copy (`ntn_…`)
- [ ] **CRITICAL:** open every Notion page/database you want connected → `•••` top-right → **Connections** → add `Littlebird` (unshared pages are invisible to the API)
- [ ] `.env`: `NOTION_TOKEN=ntn_…`
- [ ] Restart → verify connector `connected`
- [ ] Manual check: `curl -s http://localhost:3000/api/connectors | grep -A3 notion`

## ☐ 4. Slack — 6 minutes
- [ ] api.slack.com/apps → **Create New App** → *From scratch* → name `Littlebird`, pick your workspace
- [ ] Left menu **OAuth & Permissions** → scroll to **Bot Token Scopes** → add: `channels:history`, `channels:read`, `groups:history`
- [ ] Top of same page → **Install to Workspace** → Allow
- [ ] Copy **Bot User OAuth Token** (`xoxb-…`)
- [ ] `.env`: `SLACK_BOT_TOKEN=xoxb-…`
- [ ] Restart → verify connector `connected`

## ☐ 5. Discord — 4 minutes
- [ ] discord.com/developers/applications → **New Application** → name `Littlebird` → Create
- [ ] **Bot** tab → **Reset Token** → Copy (save it now — shown once)
- [ ] Same tab: enable **Message Content Intent** (needed to read messages)
- [ ] Optional (to read a server): **OAuth2 → URL Generator** → tick `bot` → permissions *View Channels, Read Message History* → open generated URL → add bot to your server
- [ ] `.env`: `DISCORD_BOT_TOKEN=…`
- [ ] Restart → verify connector `connected`

## ☐ 6. Facebook + Instagram (Meta) — 10 minutes
- [ ] developers.facebook.com/apps → **Create App** → type **Business** → name `Littlebird`
- [ ] In the app dashboard add product **Facebook Login** (settings → Valid OAuth Redirect URIs: `http://localhost:3000/` — optional, only for login flows)
- [ ] Go to **Graph API Explorer** (tools menu) → select your `Littlebird` app
- [ ] **Permissions:** add `pages_show_list`, `pages_read_engagement`, `instagram_basic`, `instagram_manage_insights`
- [ ] **Generate Access Token** → log in → Allow pages → Copy (`EAAG…`)
- [ ] `.env`: `META_ACCESS_TOKEN=EAAG…`
- [ ] Restart → verify connector `connected`
- [ ] ⚠️ Explorer tokens die in ~1–2 h. For a lasting token: Business Settings → **Users → System users** → create → Generate token (same permissions, never expires) → use that instead.

## ☐ 7. WhatsApp — needs me first
WhatsApp Cloud API is **not built** into the server yet. Your part when ready:
- [ ] developers.facebook.com/apps → Create App (Business) → add product **WhatsApp** → *API Setup* page shows a **temporary token** + **Phone Number ID**
- Then tell me: "wire WhatsApp with WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID" — I build validation + sync.

## ☐ 8. Google Calendar — needs me first (2 min of console work only)
Your Google client already exists — no new console steps needed. Tell me: "add Calendar" — I extend the Google OAuth scope with `calendar.readonly` and add a sync endpoint. You just re-consent once.

---

## Verification cheat sheet (all runnable in Git Bash)
```bash
# All connector states
curl -s http://localhost:3000/api/connectors | python -m json.tool

# Gmail inbox (after consent)
curl -s -X POST http://localhost:3000/api/connectors/gmail/sync

# GitHub repos
curl -s -X POST http://localhost:3000/api/github/sync

# Chat must answer mode:live
curl -s -X POST http://localhost:3000/api/chat -H "content-type: application/json" \
  -d '{"prompt":"say READY"}'
```

## If a connector refuses to connect
- Read the server terminal — it prints the exact provider error and never fakes success
- `redirect_uri_mismatch` → the URI in the provider console doesn't match exactly (scheme, port, path)
- `401/403 invalid token` → token copied with a space, expired, or missing scope
- Notion sees nothing → pages not shared with the integration
