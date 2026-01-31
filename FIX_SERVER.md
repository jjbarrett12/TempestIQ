# Fix: Server Won't Start

## The Problem
The error "'next' is not recognized" means Next.js isn't installed properly.

## Solution: Reinstall Dependencies

**Open PowerShell and run these commands:**

```powershell
# Navigate to project
cd "c:\Users\jjbarrett\OneDrive - Bear Facility Supply\Desktop\Roof Alert"

# Delete node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Reinstall everything
npm install

# Verify Next.js is installed
npm list next

# Start server
npm run dev
```

## Alternative: Use npx

If npm install doesn't work, try using npx directly:

```powershell
cd "c:\Users\jjbarrett\OneDrive - Bear Facility Supply\Desktop\Roof Alert"
npx next dev -p 3005
```

## Check Node.js Version

Make sure you have Node.js 18+:

```powershell
node --version
```

Should show v18.x.x or higher. If not, install from nodejs.org

## Still Not Working?

1. **Close all terminals** and open a fresh PowerShell window
2. **Run:** `npm install` again
3. **Check:** `npm list next` should show next@14.2.35
4. **Start:** `npm run dev`

The server should then be available at: http://localhost:3005/marketing
