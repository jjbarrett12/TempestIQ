# Firebase Web Push Setup

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Add a **Web app** (</> icon) to get config

## Step 2: Enable Cloud Messaging

1. Project Settings → Cloud Messaging
2. Under **Web configuration**:
   - Click "Generate key pair" to create **VAPID key** (Web Push certificates)
   - Copy the **Key pair** – you need both public (for client) and private (for server)
   - The public key goes in `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
   - The private key goes in `FIREBASE_ADMIN_PRIVATE_KEY` (or use a service account)

## Step 3: Service Account (for Firebase Admin SDK)

1. Project Settings → Service accounts
2. Click **Generate new private key**
3. Save the JSON – you need:
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `project_id` → `FIREBASE_PROJECT_ID`

## Step 4: Environment Variables

```env
# Client (NEXT_PUBLIC_* are exposed to browser)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=...

# Server only (never expose)
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

For `FIREBASE_ADMIN_PRIVATE_KEY`, keep the `\n` literals in the string; Node will parse them.

## Step 5: Service Worker & PWA icons

Add PWA icons to `public/`:
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)
- `icon-72.png` (72×72, for notification badge)

Run `node scripts/inject-firebase-sw.js` before build to inject Firebase config into the service worker.

The file `public/firebase-messaging-sw.js` must:
- Be at the root of your domain (e.g. `https://yoursite.com/firebase-messaging-sw.js`)
- Use the Firebase Messaging SDK
- Contain your `firebaseConfig` and `messagingSenderId`

Firebase will auto-register this when you call `getToken()` with the correct config.

## Step 6: Vercel Cron

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/xweather-poll",
      "schedule": "*/3 * * * *"
    }
  ]
}
```

In Vercel → Project → Settings → Environment Variables, add:
- `CRON_SECRET` (generate a random string, e.g. `openssl rand -hex 32`)

**Note:** Vercel Cron sends a plain GET request without custom headers. To protect the endpoint:
- Use an external cron (e.g. cron-job.org, EasyCron) to hit `https://yoursite.com/api/cron/xweather-poll` with header `x-cron-secret: YOUR_CRON_SECRET`, or
- Use the query param: `https://yoursite.com/api/cron/xweather-poll?secret=YOUR_CRON_SECRET` (configure this URL in your external cron)

## Step 7: Enable push for assets

For each asset/location you want push alerts, ensure `Subscription.pushEnabled` is true. You can do this via:

- Prisma Studio: `npx prisma studio` → Subscription → set `pushEnabled` to true
- Or add UI in dashboard asset settings to toggle push

The cron sends push only to users whose `Subscription` has `pushEnabled=true` for that asset.

## Step 8: Testing

1. Run `node scripts/inject-firebase-sw.js` to inject Firebase config into the service worker
2. Run the app with HTTPS (or localhost for dev)
3. Sign in
4. Go to Settings → Push alerts
5. Click "Enable alerts", allow notifications
6. Use "Send test" to verify delivery
