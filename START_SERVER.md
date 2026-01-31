# How to Start the Server

## The server isn't running. Here's how to start it:

### Option 1: Quick Start (Recommended)

1. **Open PowerShell** (Right-click Start → Windows PowerShell)

2. **Copy and paste these commands one at a time:**

```powershell
cd "c:\Users\jjbarrett\OneDrive - Bear Facility Supply\Desktop\Roof Alert"
```

```powershell
npm install
```

```powershell
npm run dev
```

3. **Wait for this message:**
   ```
   ✓ Ready in X seconds
   - Local: http://localhost:3005
   ```

4. **Open your browser** and go to: http://localhost:3005/marketing

### Option 2: If Port 3000 is Busy

If you get "Port 3000 is already in use", use port 3001:

```powershell
cd "c:\Users\jjbarrett\OneDrive - Bear Facility Supply\Desktop\Roof Alert"
$env:PORT=3001
npm run dev
```

Then visit: http://localhost:3005/marketing

### Option 3: Check What's Wrong

If you see errors, check:

1. **Node.js is installed:**
   ```powershell
   node --version
   ```
   Should show v18 or higher. If not, install Node.js from nodejs.org

2. **npm is installed:**
   ```powershell
   npm --version
   ```

3. **Dependencies are installed:**
   ```powershell
   cd "c:\Users\jjbarrett\OneDrive - Bear Facility Supply\Desktop\Roof Alert"
   npm install
   ```

## Common Errors & Fixes

### Error: "Cannot find module 'next'"
**Fix:** Run `npm install`

### Error: "Port 3000 is already in use"
**Fix:** Use port 3001: `$env:PORT=3001; npm run dev`

### Error: "EADDRINUSE"
**Fix:** Kill the process using port 3000:
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Error: "Missing script: dev"
**Fix:** Make sure you're in the correct directory

## Keep Terminal Open!

**Important:** Keep the PowerShell window open while the server is running. Closing it will stop the server.

## Verify It's Working

Once you see:
```
✓ Ready in X seconds
- Local: http://localhost:3005
```

The server is running! Visit http://localhost:3005/marketing in your browser.
