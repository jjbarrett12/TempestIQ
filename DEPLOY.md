# Deploy TempestIQ to Vercel + Connect Domain

**One guide. Everything you need.**

---

## Get it live (minimal)

Do these in order, then test and iterate.

1. **Create a Postgres DB** – [Neon](https://neon.tech), [Supabase](https://supabase.com), or Vercel Postgres. Copy the connection string (e.g. `postgresql://...`).
2. **Create a Vercel project** – [vercel.com](https://vercel.com) → New Project → Import your GitHub repo (this folder). Don’t deploy yet.
3. **Set environment variables** – In the project → **Settings** → **Environment Variables**, add for **Production**:
   - `DATABASE_URL` = your Postgres connection string  
   - `NEXTAUTH_URL` = `https://your-domain.com` (or the Vercel URL for now, e.g. `https://your-app.vercel.app`)  
   - `NEXTAUTH_SECRET` = run `openssl rand -base64 32` (or use any long random string)  
   - `NEXT_PUBLIC_APP_URL` = same as `NEXTAUTH_URL`
4. **Set Framework to Next.js** – **Settings** → **Framework Preset** (or Framework Settings) → choose **Next.js**. Save.
5. **Deploy** – Push to `main` (or trigger a deploy from Vercel). Wait for the build to succeed.
6. **Run migrations** – In your project folder, set `.env` so `DATABASE_URL` is your **production** DB URL, then run:
   ```powershell
   npm run db:migrate:deploy
   ```
7. **Add your domain** (when ready) – **Settings** → **Domains** → Add your domain, then add the DNS records Vercel shows at your registrar. Wait 5–60 min for DNS.

After step 6, the site is live at your Vercel URL (or your domain once DNS is set). Test, then make changes as needed.

---

## 1. Vercel Build Settings (reference)

In **Vercel Dashboard** → Your Project → **Settings** → **Build & Development** (and **General**):

- **Framework Preset:** **Next.js** — **Required.** In **Settings → Framework Settings**, change **Framework** from **"Other"** to **Next.js**. If it stays "Other", every route returns 404 because Vercel won’t run the Next.js server.
- **Root Directory:** leave **empty** (repo root has `package.json` and `next.config.js`)
- **Build Command:** `npm run build` or leave blank (uses `package.json` script)
- **Output Directory:** leave **empty** (do not set to `.next` — Vercel runs Next.js serverless; a custom output breaks routing)
- **Install Command:** (leave default)
- **Node.js Version:** `24.x` (in **General** → **Node.js Version**)

After changing Framework to Next.js, use **Deployments → … → Redeploy** so the new settings apply.

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

---

## After it’s live

- **Optional:** Redis (Upstash), Xweather, Twilio, SendGrid, Stripe — add env vars in Vercel when you need them. Workers run separately unless you add a worker host.
- Test the site, then make UX or feature changes as needed.
