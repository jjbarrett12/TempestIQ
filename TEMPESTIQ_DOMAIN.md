# Using tempestIQ.com

Use **tempestiq.com** (lowercase in URLs) as your live site. Keep **localhost:3005** for local development.

---

## 1. Production environment (Vercel)

In **Vercel** → your TempestIQ project → **Settings** → **Environment Variables**, set for **Production**:

| Variable | Value |
|----------|--------|
| `NEXTAUTH_URL` | `https://tempestiq.com` |
| `NEXT_PUBLIC_APP_URL` | `https://tempestiq.com` |
| `DATABASE_URL` | Your Supabase (or production Postgres) connection string |
| `NEXTAUTH_SECRET` | A long random string (e.g. from `openssl rand -base64 32`) |

Add other vars (Stripe, Twilio, etc.) as you need them.

---

## 2. Connect the domain in Vercel

1. **Vercel** → Project → **Settings** → **Domains**
2. **Add** → enter `tempestiq.com` → Add
3. Add `www.tempestiq.com` as well if you want www to work

Vercel will show the DNS records you need.

---

## 3. DNS at your registrar

At the place where you bought **tempestiq.com** (GoDaddy, Namecheap, Cloudflare, etc.):

- Add the **A** and **CNAME** records Vercel shows (usually `@` → `76.76.21.21` and `www` → `cname.vercel-dns.com` or similar).
- Save and wait 5–60 minutes for DNS to update.

---

## 4. Keep local dev on localhost

Leave your **local** `.env` as:

```env
NEXTAUTH_URL="http://localhost:3005"
NEXT_PUBLIC_APP_URL="http://localhost:3005"
```

Use **tempestiq.com** only in Vercel’s environment variables for production. After the domain is connected and DNS has propagated, the app will be live at **https://tempestiq.com**.

More detail: see **DEPLOY.md**.
