# 🚀 Deploy Either AI to aai.gamanimpex.com

## Prerequisites
- GoDaddy domain: `gamanimpex.com`
- Vercel account (already logged in as `gamanreddygoona-8276`)
- Either AI project built and ready

---

## Step 1: Add Domain in Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **either-ai** project → **Settings** → **Domains**
3. Type: `aai.gamanimpex.com`
4. Click **Add**
5. Vercel will show you **2 CNAME records** to add — copy them

---

## Step 2: Configure DNS in GoDaddy

1. Go to [dcc.godaddy.com](https://dcc.godaddy.com)
2. Click **gamanimpex.com** → **DNS** → **Manage DNS**
3. Add these records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| **CNAME** | `aai` | `cname.vercel-dns.com` | 600 |
| **CNAME** | `aai` | `cname.vercel-dns.com` | 600 |

> ⚠️ Delete any existing `A` or `CNAME` records for `aai` first

4. Click **Save**

---

## Step 3: Verify Domain

1. Back in Vercel → **Domains** → `aai.gamanimpex.com`
2. Wait 5-30 minutes for DNS propagation
3. Status should change to **Valid Configuration** ✅
4. SSL certificate auto-provisions (Let's Encrypt)

---

## Step 4: Set Environment Variables in Vercel

In Vercel dashboard → **either-ai** → **Settings** → **Environment Variables**:

```bash
GEMINI_API_KEY=your_key
GITHUB_TOKEN=your_token
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
NOTION_TOKEN=your_token
```

> Click **Deployments** → **Redeploy** after adding variables

---

## Step 5: Update OAuth Redirect URIs

### Google OAuth
1. [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Click your OAuth client → **Authorized redirect URIs**
3. Add: `https://aai.gamanimpex.com/auth/google/callback`
4. Save

### GitHub OAuth
1. [github.com/settings/developers](https://github.com/settings/developers)
2. Click your OAuth App → **Authorization callback URL**
3. Add: `https://aai.gamanimpex.com/auth/github/callback`
4. Update

---

## Step 6: Deploy

```bash
vercel deploy --prod --yes
```

Or push to GitHub — Vercel auto-deploys from main branch.

---

## Step 7: Verify

1. Open **https://aai.gamanimpex.com**
2. Check health: **https://aai.gamanimpex.com/api/health**
3. Test GitHub login: Click **Sign In** → **Continue with GitHub**
4. Test Gmail: Click **Connect** on Gmail → Google consent

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| DNS not resolving | Wait 30 min, check `dig aai.gamanimpex.com` |
| SSL error | Vercel auto-provisions — wait 5 min after DNS |
| OAuth redirect mismatch | Add `https://aai.gamanimpex.com/auth/...` to provider console |
| 404 on API | Check `vercel.json` rewrites are correct |
| Env vars missing | Redeploy after adding in Vercel dashboard |

---

## Quick Commands

```bash
# Deploy
vercel deploy --prod --yes

# Check status
curl -s https://aai.gamanimpex.com/api/health

# View logs
vercel logs https://aai.gamanimpex.com

# Force redeploy
vercel --prod --force
```

---

*Deploy date: August 26, 2026*
