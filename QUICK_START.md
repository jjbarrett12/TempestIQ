# 🚀 Quick Start - Get the Site Running

## The server isn't running. Here's the easiest way to start it:

### Method 1: Double-Click (Easiest!)

1. **Find the file:** `start-server.bat` in your project folder
2. **Double-click it**
3. **Wait for:** "Ready in X seconds"
4. **Open browser:** http://localhost:3005/marketing

### Method 2: PowerShell Commands

1. **Open PowerShell** (Press Windows key, type "PowerShell", press Enter)

2. **Copy and paste these 3 commands:**

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
   - Local: http://localhost:3000
   ```

4. **Open your browser** and go to: **http://localhost:3005/marketing**

## ⚠️ Important Notes

- **Keep the terminal window open** - Closing it stops the server
- **Don't close PowerShell** while using the site
- The server runs until you press `Ctrl+C` or close the window

## 🔍 Troubleshooting

### "Port 3000 is already in use"
Use port 3001 instead:
```powershell
$env:PORT=3001; npm run dev
```
Then visit: http://localhost:3005/marketing

### "Cannot find module"
Run: `npm install`

### Still not working?
Check `START_SERVER.md` or `TROUBLESHOOTING.md` for more help.

## ✅ Success Looks Like:

When working, you'll see:
```
▲ Next.js 14.2.35
- Local:        http://localhost:3005
✓ Ready in 2.5s
```

Then the site works at: **http://localhost:3005/marketing**
