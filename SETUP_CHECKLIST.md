# StormBridge setup checklist

Use this list to get from zero to a running, billable product. Do the **Must-have** items first; **Full product** when you want live alerts and payments; **Before launch** when you’re ready for real users.

---

## Must-have (run the app)

| # | Task | Notes |
|---|------|--------|
| 1 | **Copy `.env`** | `cp .env.example .env` and fill in at least the items below. |
| 2 | **PostgreSQL** | Set `DATABASE_URL` in `.env`. Use local Postgres, [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app). |
| 3 | **Run migrations** | `npm run db:generate` then `npx prisma migrate dev` (or `npx prisma db push` if you don’t use migrations). |
| 4 | **Install deps** | `npm install` (includes Stripe, bcryptjs). |
| 5 | **Start the app** | Double-click `START_SERVER.bat` or run `npm run dev`. Open http://localhost:3005/marketing. |

At this point you can use the marketing site, survey, and signup. Database and UI work; alerts and payments need the next sections.

---

## Full product (alerts + payments)

| # | Task | Notes |
|---|------|--------|
| 6 | **Redis** | Set `REDIS_URL` in `.env` (e.g. `redis://localhost:6379`). Use [Upstash](https://upstash.com) for a hosted Redis. Required for the background workers that poll weather and send notifications. |
| 7 | **Xweather** | Get an API key from [Xweather](https://www.xweather.com). Set `XWEATHER_API_KEY` and optionally `XWEATHER_BASE_URL`. |
| 8 | **Stripe** | Follow `STRIPE_SETUP.md`: create products/prices, set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_*`, and `STRIPE_WEBHOOK_SECRET`. Use Stripe CLI for local webhook: `stripe listen --forward-to localhost:3005/api/webhooks/stripe`. |
| 9 | **Twilio (SMS)** | Sign up at [Twilio](https://www.twilio.com). Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`. |
| 10 | **SendGrid (email)** | Sign up at [SendGrid](https://sendgrid.com). Set `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL`. Verify the sender domain in SendGrid. |
| 11 | **Scheduler + workers** | Run `npm run scheduler:init` once. Then in a second terminal run `npm run worker:all` so polling and notification workers run. |

After this, signup → Stripe checkout works, and workers can fetch weather and send SMS/email (once customers have assets and subscriptions).

---

## Before launch (real users)

| # | Task | Notes |
|---|------|--------|
| 12 | **Sign-in / session** | Dashboard is linked but there’s no login yet. Add auth (e.g. [NextAuth.js](https://next-auth.js.org) with credentials or magic link) so users sign in with the email/password they used at signup. |
| 13 | **App URL** | Set `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` (if using NextAuth) to your real domain, e.g. `https://app.stormbridge.com`. |
| 14 | **Stripe live mode** | Create live products/prices, switch to `sk_live_*` and live price IDs, and add the production webhook URL in Stripe. |
| 15 | **Domain + SSL** | Deploy (Vercel, Railway, etc.) and point a domain. Use HTTPS so Stripe and cookies work correctly. |
| 16 | **Env in production** | Put all `.env` values in your host’s environment (no `.env` file in production). |

---

## Optional (nice to have)

| Task | Notes |
|------|--------|
| **HOW_TO_GET_API_KEYS.md** | If it exists, use it for step-by-step Xweather, Twilio, SendGrid. |
| **Test APIs** | Run `npm run test:apis` to verify DB, Redis, Xweather, Twilio, SendGrid. |
| **Seed data** | `npm run db:seed` creates a test customer for local testing. |
| **Prisma Studio** | `npm run db:studio` to view/edit DB in the browser. |
| **Monitoring** | Add error tracking (e.g. Sentry) and uptime checks for API and workers. |
| **Terms & Privacy** | Add `/terms` and `/privacy` and link them from signup and footer. |

---

## Quick reference: `.env` minimum

```env
# Required for app + DB
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="http://localhost:3005"

# Required for subscriptions
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_STARTER="price_..."
STRIPE_PRICE_PROFESSIONAL="price_..."
STRIPE_PRICE_BUSINESS="price_..."

# Required for full product (alerts)
REDIS_URL="redis://..."
XWEATHER_API_KEY="..."
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1..."
SENDGRID_API_KEY="..."
SENDGRID_FROM_EMAIL="..."
```

Start with **Must-have**, then add **Full product** when you’re ready for live weather and payments.
