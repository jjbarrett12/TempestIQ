# Troubleshooting Guide

## Site Can't Be Reached

### Step 1: Check if Server is Running

Open a terminal and run:
```powershell
cd "c:\Users\jjbarrett\OneDrive - Bear Facility Supply\Desktop\Roof Alert"
npm run dev
```

You should see output like:
```
- ready started server on 0.0.0.0:3005, url: http://localhost:3005
```

### Step 2: Check Port 3000

If port 3000 is already in use, you'll see an error. Try a different port:

```powershell
$env:PORT=3001; npm run dev
```

Then visit: http://localhost:3005/marketing

### Step 3: Install Dependencies

If you see module errors, install dependencies:

```powershell
npm install
```

### Step 4: Check for Errors

Look for error messages in the terminal. Common issues:

**"Cannot find module"**
- Run: `npm install`

**"Port already in use"**
- Kill the process using port 3000, or use a different port

**"EADDRINUSE"**
- Another app is using port 3000
- Change port: `$env:PORT=3001; npm run dev`

### Step 5: Verify Installation

Check if Next.js is installed:
```powershell
npm list next
```

If not installed:
```powershell
npm install next react react-dom
```

## Quick Fix Commands

```powershell
# Navigate to project
cd "c:\Users\jjbarrett\OneDrive - Bear Facility Supply\Desktop\Roof Alert"

# Install dependencies
npm install

# Start server (default port 3000)
npm run dev

# Start on different port
$env:PORT=3001; npm run dev
```

## Alternative: Use Different Port

Edit `package.json` and change the dev script:

```json
"scripts": {
  "dev": "next dev -p 3001"
}
```

Then run: `npm run dev`

## Check Browser

1. Make sure you're visiting: `http://localhost:3000` (not https)
2. Try a different browser
3. Clear browser cache
4. Try incognito/private mode

## Still Not Working?

1. **Check Windows Firewall** - May be blocking localhost
2. **Check Antivirus** - May be blocking Node.js
3. **Restart Terminal** - Close and reopen
4. **Restart Computer** - Sometimes helps with port issues

## Manual Start

If background process isn't working, start manually:

1. Open PowerShell
2. Navigate to project folder
3. Run: `npm run dev`
4. Keep terminal open
5. Visit http://localhost:3005/marketing
