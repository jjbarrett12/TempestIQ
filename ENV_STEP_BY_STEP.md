# Step-by-step: Set your database password in .env

If you change the password in `.env` but it doesn’t stick, or the app still can’t connect, follow these steps in order.

---

## Step 1: Get your Supabase connection string (with the correct password)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and open your **TempestIQ** project.
2. Click **Settings** (gear icon in the left sidebar).
3. Click **Database**.
4. Under **Database password**:
   - If you don’t know the password: click **Reset database password**, set a new one, and **copy it somewhere safe** (e.g. Notepad or a password manager).
   - If you already know it: have it ready.
5. Scroll to **Connection string**.
6. Choose the **URI** tab.
7. Copy the full URI. It looks like:
   ```text
   postgresql://postgres.zigapwohafjiqaqqphov:[YOUR-PASSWORD]@db.zigapwohafjiqaqqphov.supabase.co:5432/postgres
   ```
8. In a text editor (Notepad is fine), **paste** that URI and **replace `[YOUR-PASSWORD]`** with your actual database password (the one you set or just reset).  
   Example: if your password is `MyNewPass123`, the line should look like:
   ```text
   postgresql://postgres.zigapwohafjiqaqqphov:MyNewPass123@db.zigapwohafjiqaqqphov.supabase.co:5432/postgres
   ```
9. Copy this **full line** (with the real password in it). You’ll paste it into `.env` in Step 3.

---

## Step 2: Open the correct `.env` file

1. In File Explorer, go to your project folder:
   ```text
   ...\OneDrive - Bear Facility Supply\Desktop\TempestIQ
   ```
2. In that folder you should see a file named **`.env`** (not `.env.example`).
   - If you don’t see it: in File Explorer, click **View** → check **Hidden items** (and **File name extensions** if you want). The file name is exactly `.env` with no other name before the dot.
3. Open `.env` in **Cursor** (or VS Code / Notepad):
   - In Cursor: in the left file list, click **`.env`** under the TempestIQ folder.
   - Or right‑click `.env` → **Open with** → **Cursor** (or Notepad).

**Important:** You must edit **`.env`** in the **TempestIQ** project folder. Do **not** edit `.env.example` — that file is only a template and is not used when the app runs.

---

## Step 3: Put the connection string in `.env`

1. In `.env`, find the line that starts with:
   ```text
   DATABASE_URL="...
   ```
2. **Select the entire line** (from `DATABASE_URL` to the closing `"`).
3. **Replace it** with one line in this form (paste your full connection string from Step 1):
   ```text
   DATABASE_URL="postgresql://postgres.zigapwohafjiqaqqphov:YOUR_ACTUAL_PASSWORD@db.zigapwohafjiqaqqphov.supabase.co:5432/postgres"
   ```
   So the file has:
   - No space before `DATABASE_URL`.
   - One `=` between `DATABASE_URL` and the value.
   - The value in double quotes.
   - The password **inside** the quotes, with no extra spaces.

4. **Save the file:** press **Ctrl+S** (or File → Save).

---

## Step 4: Make sure the change stuck

1. **Close** the `.env` tab (or the app you used to edit it).
2. **Open `.env` again** from the project folder.
3. Look at the `DATABASE_URL` line. It should still show your full connection string with the new password.  
   If it’s back to the old value or `localhost`, the change didn’t stick — see “If the change still doesn’t stick” below.

---

## Step 5: Use the new password (restart and run commands)

The app only reads `.env` when it starts. So after changing `.env`:

1. **Stop** any running dev server (in the terminal where you ran `npm run dev`, press **Ctrl+C**).
2. Open a **new** terminal in the project folder.
3. Run:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
4. If both commands succeed, start the app again:
   ```bash
   npm run dev
   ```
5. Sign in at `/signin` with **demo@example.com** / **password123**.

---

## If the change still doesn’t stick

- **OneDrive:** Your project is in OneDrive. Sometimes OneDrive syncs an old version of a file and overwrites your edit. Try:
  1. Right‑click the TempestIQ folder → **Free up space** or **Always keep on this device** (so the folder is fully local).
  2. Edit `.env` again, save, then wait a few seconds and reopen `.env` to confirm the new `DATABASE_URL` is still there.
- **Wrong file:** Double-check you’re editing **`.env`** in the **TempestIQ** folder, not `.env.example` or a `.env` in another folder.
- **Permissions:** If you get “Access denied” when saving, right‑click `.env` → **Properties** → uncheck **Read-only** (if it’s checked) → OK, then save again.

---

## Quick checklist

- [ ] Password reset in Supabase (if needed) and copied.
- [ ] Full connection string (with that password) copied.
- [ ] Opened **`.env`** (not `.env.example`) in the **TempestIQ** folder.
- [ ] Replaced the whole `DATABASE_URL="..."` line and saved (**Ctrl+S**).
- [ ] Closed and reopened `.env` to confirm the new line is still there.
- [ ] Stopped the dev server, ran `npx prisma db push` and `npm run db:seed` in a new terminal, then `npm run dev`.
