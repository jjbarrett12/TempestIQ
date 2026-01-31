# Fix Git & Deploy

Quick reference for fixing common Git issues and deploying Roof Alert.

---

## Deploy updates (quick)

Run these in PowerShell from the project folder:

```powershell
cd "c:\Users\jjbarrett\OneDrive - Bear Facility Supply\Desktop\Roof Alert"

# 1. Build locally (optional but recommended)
npm run build

# 2. Commit and push (triggers deploy on Vercel/Railway/Render)
git add .
git status
git commit -m "Deploy updates: TempestIQ logo, hero, branding"
git push origin main
```

If you don’t have a remote yet, see **First-time Git setup** below. If the push is rejected, run `git pull origin main` then `git push origin main` again.

---

## Fix Git

### Check status

```powershell
cd "c:\Users\jjbarrett\OneDrive - Bear Facility Supply\Desktop\Roof Alert"
git status
git branch -a
```

### Discard all local changes (reset to last commit)

```powershell
git checkout -- .          # discard changes in tracked files
git clean -fd              # remove untracked files and directories
# Or full reset to match remote:
git fetch origin
git reset --hard origin/main
```

### Fix “detached HEAD”

If you see “You are in 'detached HEAD' state”:

```powershell
git checkout main          # or your branch name
# If you want to keep work done in detached state:
git branch temp-fix
git checkout main
git merge temp-fix
```

### Fix merge conflicts

```powershell
# After a pull or merge that conflicts:
git status                 # see conflicted files
# Edit the files, remove <<<<<<< ======= >>>>>>> markers, then:
git add .
git commit -m "Resolve merge conflicts"
```

### Undo last commit (keep changes)

```powershell
git reset --soft HEAD~1
```

### Undo last commit (discard changes)

```powershell
git reset --hard HEAD~1
```

### Push rejected (remote has new commits)

```powershell
git pull --rebase origin main
git push origin main
# Or merge instead of rebase:
git pull origin main
git push origin main
```

### Add, commit, and push (clean deploy flow)

```powershell
git add .
git status                 # double-check what’s included
git commit -m "Your message here"
git push origin main
```

### First-time Git setup (no remote yet)

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/roof-alert.git
git push -u origin main
```

---

## Deploy

### 1. Build locally (sanity check)

```powershell
cd "c:\Users\jjbarrett\OneDrive - Bear Facility Supply\Desktop\Roof Alert"
npm install
npm run db:generate
npm run build
```

If `npm run build` fails, fix errors before deploying.

### 2. Deploy via Git (Vercel / Railway / Render)

After your code is committed and pushed:

- **Vercel**: Auto-deploys on push to `main`. Ensure env vars are set in Project Settings.
- **Railway**: `railway up` or push to connected repo.
- **Render**: Auto-deploys on push; set build command and env vars in dashboard.

### 3. Environment variables

Set these in your hosting dashboard (see `.env.example` and [DEPLOYMENT.md](./DEPLOYMENT.md)):

- `DATABASE_URL` (required for API/dashboard)
- `REDIS_URL` (for workers; optional for app if you’re not running workers there)
- Stripe, Twilio, SendGrid, Xweather, etc. as needed

### 4. Database migrations (production)

Run once per deployment if schema changed:

```powershell
npx prisma migrate deploy
```

### 5. Workers (optional)

Workers don’t run on Vercel. To run polling/notification workers, use a separate process or host (e.g. Railway/Render). See [DEPLOYMENT.md](./DEPLOYMENT.md) and [RUN_LIVE.md](./RUN_LIVE.md).

---

## Quick checklist

| Step | Command / action |
|------|-------------------|
| 1. Fix Git (if needed) | Use “Fix Git” section above |
| 2. Build locally | `npm run build` |
| 3. Commit & push | `git add .` → `git commit -m "..."` → `git push origin main` |
| 4. Env vars | Set in Vercel/Railway/Render |
| 5. Migrations | `npx prisma migrate deploy` (if DB schema changed) |

For full deployment options and env details, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**. For running locally and avoiding timeouts, see **[RUN_LIVE.md](./RUN_LIVE.md)**.
