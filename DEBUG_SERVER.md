# Debug: Server Not Showing Up

## Step-by-Step Troubleshooting

### 1. Check if Server Actually Started

When you run `npx next dev -p 3005`, you should see:

```
▲ Next.js 14.2.35
- Local:        http://localhost:3005
- Network:      http://192.168.x.x:3005

✓ Ready in X seconds
```

**If you DON'T see "Ready"** → The server didn't start. Look for error messages.

### 2. Common Errors & Fixes

#### Error: "Cannot find module"
**Fix:** Run `npm install` first

#### Error: "Port 3005 is already in use"
**Fix:** Use a different port:
```powershell
npx next dev -p 3006
```

#### Error: "EADDRINUSE"
**Fix:** Kill the process using port 3005:
```powershell
netstat -ano | findstr :3005
taskkill /PID <PID_NUMBER> /F
```

### 3. Test Simple Page First

Try visiting the test page:
```
http://localhost:3005/test
```

If `/test` works but `/marketing` doesn't, there's an error in the marketing page.

### 4. Check Browser

- **Use:** `http://localhost:3005` (NOT https)
- **Try:** Different browser (Chrome, Firefox, Edge)
- **Try:** Incognito/Private mode
- **Clear:** Browser cache (Ctrl+Shift+Delete)

### 5. Check Terminal Output

Look for errors in the PowerShell window where you ran `npx next dev -p 3005`. Common errors:

- **Compilation errors** → Fix the code
- **Module not found** → Run `npm install`
- **Port in use** → Use different port

### 6. Verify Files Exist

Make sure these files exist:
- `src/app/marketing/page.tsx` ✅
- `src/app/layout.tsx` ✅
- `package.json` ✅

### 7. Try Minimal Test

Create a super simple page to test:

**File:** `src/app/simple/page.tsx`
```tsx
export default function Simple() {
  return <h1>Hello World</h1>
}
```

Then visit: `http://localhost:3005/simple`

If this works, Next.js is fine. If not, there's a deeper issue.

## What to Tell Me

Please share:
1. **What you see in PowerShell** when running `npx next dev -p 3005`
2. **Any error messages** (copy/paste them)
3. **What happens** when you visit `http://localhost:3005` in browser
4. **Does `/test` work?** (visit `http://localhost:3005/test`)

This will help me fix the exact issue!
