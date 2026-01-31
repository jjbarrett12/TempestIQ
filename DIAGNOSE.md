# Server Can't Be Reached - Diagnosis

## The server isn't starting. Let's find out why:

### Step 1: Check PowerShell Output

When you run `npx next dev -p 3005`, what EXACTLY do you see?

**Good output looks like:**
```
▲ Next.js 14.2.35
- Local:        http://localhost:3005
✓ Ready in 2.5s
```

**Bad output might show:**
- Error messages (red text)
- "Cannot find module"
- "Port already in use"
- Compilation errors

### Step 2: Try Minimal Test

Run this command:
```powershell
cd "c:\Users\jjbarrett\OneDrive - Bear Facility Supply\Desktop\Roof Alert"
npx next dev -p 3005
```

**Then immediately check:**
1. Does PowerShell show "Ready"?
2. Can you visit `http://localhost:3005/simple`?

### Step 3: Check for Errors

Look at the PowerShell window. Do you see:
- ❌ Red error messages?
- ❌ "Failed to compile"?
- ❌ "Module not found"?

**If YES** → Copy the error and share it

**If NO** → Server might be starting but browser can't connect

### Step 4: Test Port

Check if port 3005 is accessible:
```powershell
Test-NetConnection -ComputerName localhost -Port 3005
```

Should show: `TcpTestSucceeded : True`

### Step 5: Try Different Port

If port 3005 is blocked, try 3006:
```powershell
npx next dev -p 3006
```
Then visit: `http://localhost:3006/simple`

## What I Need From You:

1. **Screenshot** of PowerShell window after running `npx next dev -p 3005`
2. **Any error messages** (copy/paste the text)
3. **What happens** when you visit `http://localhost:3005` in browser

This will tell me exactly what's wrong!
