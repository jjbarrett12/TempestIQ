# Running the Site Live (Avoiding Timeouts)

If the site keeps timing out or hanging, it’s usually because the **database or Redis is unreachable or slow**. The app now fails fast and shows content instead of hanging forever.

## What we did to reduce timeouts

- **Dashboard**: Customer API request has a **5s timeout**; if it fails or times out, the dashboard still loads with default plan (sales features visible for demo).
- **Health** (`/api/health`): Database and Redis checks each have a **3s timeout**; the route returns “degraded” instead of hanging.
- **Customer API** (`/api/customers/[id]`): Database query has a **5s timeout**; returns 503 so the client can fall back.

## Run the site locally (dev)

```bash
npm install
cp .env.example .env
# Fill in at least DATABASE_URL (required for API routes that use DB)
npm run db:generate
npx prisma migrate dev   # if you have a DB and want to apply migrations
npm run dev
```

- Open **http://localhost:3005** (or the port in your `package.json`).
- If `DATABASE_URL` is missing or wrong, **API routes that use the DB will time out** after 5s and the dashboard will still load with fallback plan.
- Optional: set `REDIS_URL`; if unset, health shows Redis as degraded (workers need Redis).

## Run the site live (production build)

```bash
npm run build
npm start
```

- Set **PORT** (default 3000) and **env vars** in the environment (e.g. `DATABASE_URL`, `REDIS_URL`, Stripe, Twilio, SendGrid as needed).
- Use a process manager (e.g. **PM2**) or a host that runs Node (Railway, Render, Fly.io, VPS) so the process stays up.

## Deploy to Vercel (or similar)

- Set **environment variables** in the project (at least `DATABASE_URL`; others as needed).
- **Redis and workers** (BullMQ) do **not** run on Vercel; run workers elsewhere (e.g. a small Node server, Railway, Render) that shares the same Redis and DB.
- The **marketing page** and **static routes** don’t need the DB; only dashboard/API routes that hit Prisma need a working DB. If the DB is down, those API routes will return 503 or timeout and the app will use fallbacks where implemented.

## Checklist when the site “keeps timing out”

1. **Database**: Is `DATABASE_URL` set and correct? Can the DB be reached from where the app runs (no firewall blocking, correct host/port)?
2. **Redis** (if you use workers/health): Is `REDIS_URL` set and Redis reachable?
3. **First load**: Cold starts (e.g. serverless) can be slow; the 5s timeout prevents indefinite hang. If you need longer, increase `DB_TIMEOUT_MS` in `src/app/api/customers/[id]/route.ts` and the timeout in `src/app/dashboard/layout.tsx` (and consider your platform’s max execution time, e.g. 10s on Vercel Hobby).
4. **Production URL**: If you’re opening the site over the internet, ensure the process is actually running and the port is open (or the host’s reverse proxy points to it).
