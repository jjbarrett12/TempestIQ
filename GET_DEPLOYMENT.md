# Get Your First Deployment (Vercel)

Follow these steps to get a deployment so **tempestiq.com** (and the Vercel URL) work.

---

## Step 1: Put your code in Git and push to GitHub

In **PowerShell**, from your project folder:

```powershell
cd "c:\Users\jjbarrett\OneDrive - Bear Facility Supply\Desktop\Roof Alert"

# Initialize Git (skip if you already have .git)
git init

# Stage everything
git add .

# First commit
git commit -m "TempestIQ: logo, branding, URL setup"
```

**Create a repo on GitHub:**

1. Go to [github.com](https://github.com) → **New repository**.
2. Name it (e.g. `tempestiq` or `roof-alert`).
3. Leave it **empty** (no README, no .gitignore).
4. Copy the repo URL (e.g. `https://github.com/YOUR_USERNAME/tempestiq.git`).

**Connect and push:**

```powershell
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `REPO_NAME` with your GitHub username and repo name. If it asks for login, use a **Personal Access Token** (GitHub → Settings → Developer settings → Personal access tokens) as the password.

---

## Step 2: Import the repo in Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (use **Continue with GitHub** if you can).
2. Click **Add New…** → **Project**.
3. **Import** the repo you just pushed (e.g. `tempestiq` or `roof-alert`).
4. **Configure Project** (you can leave most defaults):
   - **Framework Preset:** Next.js (should be auto-detected).
   - **Build Command:** `npm run build` (or `npx prisma generate && npx next build` if the build fails).
   - **Output Directory:** leave default.
   - **Install Command:** `npm install` (default).
5. **Environment Variables:** Click **Add** and add at least:
   - `NEXTAUTH_URL` = `https://tempestiq.com`
   - `NEXT_PUBLIC_APP_URL` = `https://tempestiq.com`
   - Add others from `.env.example` when you’re ready (e.g. `DATABASE_URL`, Stripe, etc.). You can deploy without a DB first to get the site live.
6. Click **Deploy**.

Vercel will run the build. If it **fails**, open the deployment → **Building** / **Logs** and fix the error (often Prisma or a missing env var).

---

## Step 3: Assign your domain

1. In Vercel → your project → **Settings** → **Domains**.
2. Add **tempestiq.com** and **www.tempestiq.com** (if you haven’t already).
3. At your domain registrar, ensure DNS is set as in [URL_SETUP.md](./URL_SETUP.md) (A record for apex, CNAME for www).

After the first deployment **succeeds**, you’ll have:

- A **Production** deployment (green checkmark).
- **tempest-iq.vercel.app** (or your Vercel URL) working.
- **tempestiq.com** working once DNS has propagated.

---

## Step 4: Later deployments

After the project is connected:

```powershell
git add .
git commit -m "Describe your change"
git push origin main
```

Vercel will build and deploy automatically. Check **Deployments** for status, then open **https://tempestiq.com** to see the update.

---

## Troubleshooting

| Problem | What to do |
|--------|------------|
| **Build fails on Prisma** | In Vercel → Project → Settings → General, set **Build Command** to `npx prisma generate && npx next build`. Ensure Prisma is in `dependencies` in package.json. |
| **Build fails (missing env)** | Add the required variables in Project → Settings → Environment Variables. For a first deploy you can start with just `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`. |
| **“No Deployment”** | Make sure you clicked **Deploy** after importing, and that the build completed (green checkmark). |
| **404 on tempestiq.com** | Confirm the domain is assigned to this project and DNS is correct; see [FIX_404.md](./FIX_404.md). |
