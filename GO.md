# Go — run the app locally

Run these **on your PC** (not from Cursor), in order.

## 1. Open Command Prompt

- Press **Win + R**, type **cmd**, Enter.

## 2. Go to the project folder

```bat
cd /d "%USERPROFILE%\OneDrive - Bear Facility Supply\Desktop\Roof Alert"
```

## 3. (Optional) Install dependencies

Only if you haven’t already or you added new packages:

```bat
npm install
```

If you get **"cache mode is 'only-if-cached'"**, run:

```bat
npm config delete prefer-offline
npm config delete offline
npm install
```

## 4. (Optional) Generate Prisma client

Only if you get **"Cannot find module '.prisma/client'"** or after pulling schema changes:

```bat
npm run db:generate
```

## 5. Start the server

**Option A — batch file (easiest)**  
Double‑click **START_SERVER.bat** in File Explorer (in the Roof Alert folder).

**Option B — from Command Prompt**

```bat
npm run dev
```

## 6. Open the app

When you see **"Ready"** in the window:

- **Marketing:** http://localhost:3005/marketing  
- **Survey:** http://localhost:3005/survey  
- **Sign up:** http://localhost:3005/signup  
- **Dashboard:** http://localhost:3005/dashboard  

---

**If the server still won’t start:** see [CONNECTION_GUIDE.md](./CONNECTION_GUIDE.md) or [START_SERVER.md](./START_SERVER.md).
