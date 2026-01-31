# URL setup

Use these so auth, checkout, and email links point to the right place.

**Production domain:** **tempestiq.com**

---

## Production values for tempestiq.com

In your host’s environment variables (Vercel, Railway, or Render), set:

| Variable | Value |
|----------|--------|
| `NEXTAUTH_URL` | `https://tempestiq.com` |
| `NEXT_PUBLIC_APP_URL` | `https://tempestiq.com` |

No trailing slash. After you add the domain **tempestiq.com** in your host’s dashboard, point your registrar’s DNS (A/CNAME) to the host’s instructions so the site loads at that URL.

---

## Variables

| Variable | Purpose |
|----------|--------|
| **NEXTAUTH_URL** | Base URL for auth callbacks and links in emails (e.g. “View Dashboard”). |
| **NEXT_PUBLIC_APP_URL** | Base URL for Stripe checkout success/cancel redirects and any client-side links. |

Both should be the **full URL** of your app (with `https://` in production, no trailing slash).

---

## Local development

In `.env`:

```env
NEXTAUTH_URL="http://localhost:3005"
NEXT_PUBLIC_APP_URL="http://localhost:3005"
```

Use the same port as your dev server (e.g. `npm run dev` uses **3005** in this project).

---

## Production (Vercel / Railway / Render)

Set both to your live site URL.

**Examples:**

- **Your domain:** `https://tempestiq.com` (use this once the domain is connected to your host)
- Vercel: `https://your-project.vercel.app` or `https://tempestiq.com`
- Railway: `https://your-app.up.railway.app` or `https://tempestiq.com`
- Render: `https://your-service.onrender.com` or `https://tempestiq.com`

**Where to set them:**

1. **Vercel:** Project → Settings → Environment Variables  
   Add `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` with your production URL.
2. **Railway:** Project → Variables  
   Add both variables.
3. **Render:** Service → Environment  
   Add both variables.

Use the **exact** URL people use to open your site (including `https://`).

---

## Checklist

- [ ] **Local:** `.env` has `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` set to `http://localhost:3005` (or your dev port).
- [ ] **Production:** In your host’s dashboard, set both variables to **`https://tempestiq.com`** (no trailing slash).
- [ ] **Stripe:** Webhook and checkout success/cancel URLs use `https://tempestiq.com` (Stripe dashboard → Webhooks, and your app’s checkout flow).
- [ ] **Domain at host:** In Vercel/Railway/Render, add the domain **tempestiq.com** (and **www.tempestiq.com** if you want) and point your registrar’s DNS to the host’s instructions.

---

## Fix “Invalid Configuration” on Vercel (tempestiq.com)

If **tempestiq.com** or **www.tempestiq.com** show **Invalid Configuration** in Vercel → Domains, the domain isn’t pointing to Vercel yet. Do this at your **domain registrar** (where you bought tempestiq.com):

**1. Apex domain (tempestiq.com)**  
Add an **A** record:

| Type | Name / Host | Value / Points to |
|------|-------------|--------------------|
| A    | `@` (or leave blank) | `76.76.21.21` |

**2. www subdomain (www.tempestiq.com)**  
Add a **CNAME** record:

| Type  | Name / Host | Value / Points to        |
|-------|-------------|---------------------------|
| CNAME | `www`       | `cname.vercel-dns.com`    |

**3. In Vercel**  
- Domains → select the domain → **Refresh** (or wait a few minutes).  
- DNS can take up to 24–48 hours to propagate; after that, status should change from Invalid Configuration to a checkmark.

**4. “No Deployment” on tempest-iq.vercel.app**  
That usually means no production deployment has been built yet. Push to your main branch (or run a deploy) so Vercel builds and assigns it to Production; then the Vercel subdomain will work too.

---

## Using the domain to check changes

Once DNS is correct and the domain shows as valid in Vercel, use **https://tempestiq.com** (or https://www.tempestiq.com) to check updates:

1. Make your code changes and push to `main` (or trigger a deploy).
2. Wait for Vercel to finish the build (1–2 minutes).
3. Open **https://tempestiq.com** — you’ll see the latest production deployment.

You can use the domain from now on instead of the Vercel preview URL; both serve the same production site after each deploy.
