# Deploy TempestIQ to Vercel + Connect Domain

**One guide. Everything you need.**

---

## 1. Vercel Build Settings

In **Vercel Dashboard** → Your Project → **Settings** → **Build & Development**:

- **Build Command:** `npx prisma generate && npx next build` (or leave blank to use `package.json` script)
- **Output Directory:** `.next` (default)
- **Install Command:** (leave default)
- **Node.js Version:** `24.x` (set in **General** → **Node.js Version**)

---

## 2. Environment Variables (Vercel)

**Settings** → **Environment Variables** → Add these for **Production**:

| Variable | Description | Where to get |
|----------|-------------|--------------|
| `DATABASE_URL` | Postgres connection string | Neon/Supabase/Vercel Postgres |
| `NEXTAUTH_URL` | Your production URL | `https://tempestiq.com` |
| `NEXTAUTH_SECRET` | Random secret | Generate: `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Same as NEXTAUTH_URL | `https://tempestiq.com` |

**Optional (add when ready):**
- `XWEATHER_API_KEY`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `SENDGRID_API_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, etc.

---

## 3. Connect Domain (tempestiq.com)

### Step 1: In Vercel
1. Project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `tempestiq.com`
4. Click **Add**

### Step 2: DNS Records (at your domain registrar)
Vercel will show you DNS records to add. Usually:

**Type A:**
- Name: `@` (or root)
- Value: `76.76.21.21` (Vercel's IP - check Vercel for current)

**Type CNAME:**
- Name: `www`
- Value: `cname.vercel-dns.com` (or what Vercel shows)

**OR** (easier): Use Vercel's nameservers:
- Copy nameservers from Vercel (e.g. `ns1.vercel-dns.com`, `ns2.vercel-dns.com`)
- At your registrar (GoDaddy, Namecheap, etc.), set domain to use those nameservers

### Step 3: Wait
DNS propagation takes 5-60 minutes. Vercel will show "Valid Configuration" when ready.

---

## 4. Database Migrations

After first successful deploy:

```powershell
# Set DATABASE_URL in .env to your production DB URL
npm run db:migrate:deploy
```

This applies the schema to your production database.

---

## 5. Deploy Updates

```powershell
cd "c:\Users\jjbarrett\OneDrive - Bear Facility Supply\Desktop\Roof Alert"
git add .
git commit -m "Your changes"
git push origin main
```

Vercel auto-deploys on push to `main`.

---

## Troubleshooting

**Build fails:**
- Check **Deployments** → Click failed build → **Building** tab → Scroll to bottom for error
- Common: Missing `DATABASE_URL` in Vercel env vars

**Domain not working:**
- Check DNS records match Vercel's instructions exactly
- Wait 30+ minutes for DNS propagation
- Use `dig tempestiq.com` or [whatsmydns.net](https://www.whatsmydns.net) to check propagation

**Database errors:**
- Ensure `DATABASE_URL` in Vercel matches your Neon/Supabase connection string
- Run `npm run db:migrate:deploy` locally with production `DATABASE_URL` in `.env`

---

## Quick Checklist

- [ ] Vercel project created and connected to GitHub repo
- [ ] `DATABASE_URL` set in Vercel Environment Variables
- [ ] `NEXTAUTH_URL` = `https://tempestiq.com` in Vercel
- [ ] `NEXTAUTH_SECRET` generated and set in Vercel
- [ ] Domain added in Vercel → Settings → Domains
- [ ] DNS records updated at registrar (or nameservers changed)
- [ ] Build succeeds (check Deployments)
- [ ] Migrations run: `npm run db:migrate:deploy` (with production DATABASE_URL)
- [ ] Site loads at `https://tempestiq.com`
