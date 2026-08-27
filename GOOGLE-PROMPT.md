# Google Prompt — Finish Gmail OAuth End to End

Copy everything below the line and paste it to your AI assistant.

---

You are finishing **Google/Gmail OAuth** for **Littlebird AI Workspace** (Express server, port 3000, `npm run dev`). Guide me click-by-click through Google Cloud Console, then wire and verify everything for real. Never fake success — every step ends with a live proof.

## Already done (verify, don't redo)
- OAuth client **"tool"** (Web application) exists in Google Cloud project **`plasma-cascade-497416-a3`**
- Client ID `810900156116-ndfmds7g6c1c88jllf4uhtigjm70g40s.apps.googleusercontent.com` is already in `.env` as `GOOGLE_CLIENT_ID`
- `http://localhost:3000/auth/google/callback` was typed into "Authorized redirect URIs" — confirm it was **Saved**
- Server routes exist: `GET /auth/google` (consent redirect) and `GET /auth/google/callback` (code exchange), scopes `gmail.readonly` + `userinfo.email`, `access_type=offline`

## Step 1 — Console checklist (walk me through each)
1. **Client secret**: console.cloud.google.com/apis/credentials → click client "tool" → right panel **Client secrets** → copy the `GOCSPX-…` value.
2. **Gmail API enabled**: console.cloud.google.com/apis/library/gmail.googleapis.com (project selector must show `plasma-cascade-497416-a3`) — if not enabled, enable it.
3. **Consent screen**: Google Auth Platform → Audience → if Publishing status is **Testing**, my Gmail address must be in **Test users**, else consent is blocked.
4. Warn me: during first consent Google shows **"Google hasn't verified this app"** — that is expected for a personal localhost app; click **Advanced → Go to (app) (unsafe)**. The app only requests read-only Gmail scope.

## Step 2 — Wire it
- Add `GOOGLE_CLIENT_SECRET=<GOCSPX-…>` to `.env` with a trailing-newline-safe append (this file previously fused lines and corrupted the Gemini key — check for that bug every time).
- Never print the full secret; show first 6 chars + length only.
- Fully restart the server: kill the process tree holding port 3000 (including the tsx watcher parent), then `npm run dev`.
- Verify with `node -e "require('dotenv').config(); console.log(!!process.env.GOOGLE_CLIENT_ID, !!process.env.GOOGLE_CLIENT_SECRET)"` → must print `true true`.

## Step 3 — Live consent flow (with me in the loop)
1. `curl -s -o /dev/null -w "%{http_code} %{redirect_url}" http://localhost:3000/auth/google` must show **302 → accounts.google.com** with my client_id in the URL. If it shows a setup page instead, diagnose which env var is missing.
2. Have me open that URL in my browser → choose account → Advanced → Allow.
3. On callback: confirm the success page renders, `.oauth/gmail.json` is written (gitignored — keep it that way), and `GET /api/connectors` shows gmail `connected` with my real email address.

## Step 4 — Prove real data
- `POST http://localhost:3000/api/connectors/gmail/sync` → must return my latest 8 real messages (From / Subject / Date) from the live Gmail API.
- If it fails with `SERVICE_DISABLED` → Gmail API isn't enabled; if `invalid_grant` → consent/test-user problem; report the exact provider error, never paper over it.

## Step 5 — Report
Final status line: Gmail → env var → consent → token stored → sync result (real message count). Tell me anything pending and exactly why.
