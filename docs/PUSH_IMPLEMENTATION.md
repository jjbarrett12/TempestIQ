# Push Notifications Implementation Summary

## A) Supabase SQL Migrations

Run the migration in Supabase SQL Editor:

```bash
# Or via psql:
psql $DATABASE_URL -f supabase/migrations/20250101000000_push_notifications.sql
```

File: `supabase/migrations/20250101000000_push_notifications.sql`

**Tables created:**
- `push_sites` – monitoring locations (synced from Assets)
- `push_site_subscriptions` – user → site subscriptions (optional; cron uses Prisma Subscription)
- `push_device_tokens` – FCM tokens per user
- `push_alert_events` – normalized alerts with fingerprint for dedupe
- `push_rate_limit` – 15-min rate limit per site/type
- `push_notifications_log` – delivery status

## B) Firebase Web Push Setup

See `docs/FIREBASE_PUSH_SETUP.md` for step-by-step:

1. Create Firebase project, enable Cloud Messaging
2. Generate VAPID key pair
3. Create service account for Admin SDK
4. Add env vars to `.env` and Vercel
5. Run `node scripts/inject-firebase-sw.js` before build
6. Add PWA icons (icon-192.png, icon-512.png, icon-72.png)

## C) Files Created/Modified

| File | Purpose |
|------|---------|
| `supabase/migrations/20250101000000_push_notifications.sql` | DB schema |
| `src/lib/firebaseAdmin.ts` | Firebase Admin SDK (server) |
| `src/lib/firebaseClient.ts` | Firebase client + getFCMToken |
| `src/lib/supabaseAdmin.ts` | Supabase service role client |
| `public/firebase-messaging-sw.js` | Service worker (injected at build) |
| `scripts/inject-firebase-sw.js` | Injects Firebase config into SW |
| `public/manifest.json` | PWA manifest |
| `src/app/api/push/register-token/route.ts` | Store FCM token |
| `src/app/api/push/send-test/route.ts` | Send test push |
| `src/app/api/cron/xweather-poll/route.ts` | Poll Xweather, dedupe, send push |
| `src/app/api/alerts/[id]/route.ts` | Fetch alert detail for deep link |
| `src/app/alerts/[id]/page.tsx` | Alert detail page |
| `src/components/EnablePush.tsx` | Enable alerts button + status |
| `vercel.json` | Cron schedule (every 3 min) |
| `src/app/layout.tsx` | Manifest link |
| `src/app/dashboard/settings/page.tsx` | EnablePush section |

## D) Environment Variables

Add to `.env` and Vercel:

```
# Firebase client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Cron (generate: openssl rand -hex 32)
CRON_SECRET=

# Site URL for deep links
NEXT_PUBLIC_SITE_URL=https://tempestiq.com
```

## E) Flow

1. **User enables push:** Settings → Push alerts → Enable → token stored in `push_device_tokens`
2. **Cron runs:** Every 3 min, hits `/api/cron/xweather-poll?secret=CRON_SECRET` (use external cron)
3. **Poll:** For each Asset, fetch Xweather hail/storm threats
4. **Dedupe:** Fingerprint = sha256(site_id|type|severity|time_bucket|provider_id)
5. **Rate limit:** Max 1 push per site/type per 15 min
6. **Send:** Get users with `Subscription.pushEnabled=true`, send via FCM, log to `push_notifications_log`
7. **Deep link:** Payload includes `url` → `/alerts/[id]`

## F) Enabling push per asset

Set `Subscription.pushEnabled = true` for assets you want push alerts. Use Prisma Studio or add UI in asset/subscription settings.
