# Final Fix - Server Connection Failed

## Quick Diagnostic Steps

### 1. Verify Node.js is Installed
```powershell
node --version
```
Should show v18+ or v20+. If not, install from nodejs.org

### 2. Verify npm Works
```powershell
npm --version
```

### 3. Check if Dependencies Are Installed
```powershell
cd "c:\Users\jjbarrett\OneDrive - Bear Facility Supply\Desktop\Roof Alert"
Test-Path "node_modules\next"
```
Should return `True`

### 4. Try Clean Install
```powershell
cd "c:\Users\jjbarrett\OneDrive - Bear Facility Supply\Desktop\Roof Alert"
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install
```

### 5. Test Minimal Page
```powershell
npx next dev -p 3005
```

Then visit: `http://localhost:3005/minimal`

## What to Share

Please run these commands and share the output:

```powershell
cd "c:\Users\jjbarrett\OneDrive - Bear Facility Supply\Desktop\Roof Alert"
node --version
npm --version
npx next dev -p 3005
```

**Copy the FULL output** from PowerShell (especially any errors) and share it.

## Alternative: Use Different Port

If port 3005 is blocked:
```powershell
npx next dev -p 3006
```
Then visit: `http://localhost:3006/minimal`

## Still Not Working?

The issue is likely:
1. **Node.js not installed** → Install from nodejs.org
2. **Dependencies not installed** → Run `npm install`
3. **Port blocked** → Try port 3006 or 3007
4. **Firewall blocking** → Check Windows Firewall
5. **Code error** → Share the compilation error

**Please share the PowerShell output** so I can see the exact error!
