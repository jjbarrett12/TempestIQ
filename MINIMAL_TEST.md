# Minimal Test - Get Server Running

## The server won't start. Let's test step by step:

### Step 1: Test if Next.js Works at All

Create a super simple page to test:

**File:** `src/app/minimal/page.tsx`
```tsx
export default function Minimal() {
  return <h1>Hello World</h1>
}
```

Then run:
```powershell
cd "c:\Users\jjbarrett\OneDrive - Bear Facility Supply\Desktop\Roof Alert"
npx next dev -p 3005
```

Visit: `http://localhost:3005/minimal`

**If this works** → Next.js is fine, marketing page has an error
**If this doesn't work** → Next.js isn't installed or configured correctly

### Step 2: Check PowerShell Output

When you run `npx next dev -p 3005`, what do you see?

**Good:**
```
▲ Next.js 14.2.35
- Local:        http://localhost:3005
✓ Ready in 2.5s
```

**Bad (common errors):**
- `Error: Cannot find module` → Run `npm install`
- `Port 3005 is already in use` → Use port 3006
- `Failed to compile` → There's a code error
- Nothing happens / hangs → Node.js issue

### Step 3: Share the Error

Please copy/paste:
1. **The last 20 lines** from PowerShell after running `npx next dev -p 3005`
2. **Any red error messages**
3. **What happens** when you visit `http://localhost:3005` in browser

This will tell me exactly what's wrong!
