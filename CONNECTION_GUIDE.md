# If Connection Failed – Start the Server

The dev server **must be started on your PC** (not from Cursor). Use one of these:

## Option 1: Double‑click the batch file (easiest)

1. Open **File Explorer** and go to:  
   `Desktop\Roof Alert`
2. Double‑click **`START_SERVER.bat`**
3. Leave the window open. When you see **"Ready"**, open your browser and go to:  
   **http://localhost:3005/marketing**

## Option 2: Command Prompt

1. Press **Win + R**, type **`cmd`**, press Enter.
2. Run:
   ```bat
   cd /d "%USERPROFILE%\OneDrive - Bear Facility Supply\Desktop\Roof Alert"
   npm run dev
   ```
3. When you see **"Ready"**, go to: **http://localhost:3005/marketing**

## If you still get errors

- **"spawn EPERM"** or **"Permission denied"**  
  Often caused by OneDrive or antivirus. Try:
  - Right‑click `START_SERVER.bat` → **Run as administrator**
  - Or copy the project to a folder **outside** OneDrive (e.g. `C:\Projects\Roof Alert`) and run `npm run dev` from there.

- **"next is not recognized"**  
  From the project folder run:  
  `npm install`  
  then run `START_SERVER.bat` or `npm run dev` again.

- **Port 3005 in use**  
  Close any other app using port 3005, or change the port in `package.json` (e.g. `-p 3006`).
