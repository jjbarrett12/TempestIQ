# Deployment Guide - StormBridge / Roof Alert

## Prerequisites

Before deploying, ensure you have:
- [ ] Production PostgreSQL database (Neon, Supabase, Railway, or self-hosted)
- [ ] Production Redis instance (Upstash, Railway, or self-hosted)
- [ ] All API keys in production env vars (Xweather, Twilio, SendGrid, Stripe)

---

## Option 1: Vercel (Next.js only) + External Services

**Best for:** Quick frontend/API deployment. Workers must run elsewhere.

### Step 1: Initialize Git & Push to GitHub

```powershell
cd "c:\Users\jjbarrett\OneDrive - Bear Facility Supply\Desktop\Roof Alert"
git init
git add .
git commit -m "Initial commit"
# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/roof-alert.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Add environment variables (from `.env.example`) in Vercel Project Settings → Environment Variables
3. Set build command: `npm run build` (or `npx prisma generate && next build`)
4. Add a **Build** step: `prisma generate` in Vercel build settings
5. Deploy

**Note:** Workers (`worker:polling`, `worker:notifications`) do **not** run on Vercel. Deploy them separately (see Option 2 or 3).

---

## Option 2: Railway (Full Stack)

**Best for:** All-in-one deployment (web + workers + Postgres + Redis).

### Step 1: Install Railway CLI

```powershell
npm i -g @railway/cli
railway login
```

### Step 2: Create Project

```powershell
cd "c:\Users\jjbarrett\OneDrive - Bear Facility Supply\Desktop\Roof Alert"
railway init
```

### Step 3: Add Services

1. In [Railway Dashboard](https://railway.app/dashboard):
   - Add **PostgreSQL** plugin
   - Add **Redis** plugin
   - Create a **Web Service** from your repo (or `railway up`)
   - Create **Worker** services for `npm run worker:polling` and `npm run worker:notifications`

2. Link env vars: Railway auto-injects `DATABASE_URL` and `REDIS_URL` when you add the plugins.

### Step 4: Deploy

```powershell
git add .
git commit -m "Deploy to Railway"
git push
# Or: railway up
```

---

## Option 3: Render

**Best for:** Free tier options and straightforward config.

### Web Service

1. Create **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo
3. Build command: `npm install && npx prisma generate && npm run build`
4. Start command: `npx prisma migrate deploy && npm start`
5. Add environment variables

### Background Workers

Create **Background Workers** (separate services):
- **Polling Worker**: `npm run worker:polling`
- **Notification Worker**: `npm run worker:notifications`

### Add PostgreSQL & Redis

- Use Render's **PostgreSQL** and **Redis** add-ons, or external (Neon, Upstash).

---

## Environment Variables (Production)

Set these in your hosting platform:

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection URL |
| `XWEATHER_API_KEY` | ✅ | Xweather API key |
| `TWILIO_ACCOUNT_SID` | ✅ | Twilio |
| `TWILIO_AUTH_TOKEN` | ✅ | Twilio |
| `TWILIO_PHONE_NUMBER` | ✅ | Twilio |
| `SENDGRID_API_KEY` | ✅ | SendGrid |
| `SENDGRID_FROM_EMAIL` | ✅ | SendGrid |
| `STRIPE_SECRET_KEY` | ✅ | Use live key in prod |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Create webhook for production URL |
| `NEXTAUTH_SECRET` | ✅ | Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | Your production URL (e.g. https://yourapp.vercel.app) |
| `NEXT_PUBLIC_APP_URL` | ✅ | Same as NEXTAUTH_URL (see [URL_SETUP.md](./URL_SETUP.md)) |

---

## Post-Deploy: Database Migrations

Run migrations before or as part of deploy:

```bash
npx prisma migrate deploy
```

---

## Post-Deploy: Scheduler & Workers

1. **Initialize scheduler** (one-time): `npm run scheduler:init`
2. **Keep workers running** – Polling and notification workers must run continuously. On Railway/Render, run them as separate services.

---

## Quick Deploy Commands (After Setup)

```powershell
# Build locally to verify
npm run build

# If using git + Vercel
git add .
git commit -m "Deploy"
git push
# Vercel auto-deploys on push
```
