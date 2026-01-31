# Quick Test - Is Server Running?

## Test 1: Check Server Output

When you run `npx next dev -p 3005`, you should see:

```
▲ Next.js 14.2.35
- Local:        http://localhost:3005
✓ Ready in 2.5s
```

**If you see this** → Server is running! Go to step 2.

**If you DON'T see "Ready"** → Server didn't start. Copy the error and share it.

## Test 2: Try These URLs

Open your browser and try these URLs one by one:

1. **http://localhost:3005/test**
   - Should show: "✅ Next.js is Working!"
   - If this works → Next.js is fine, marketing page has an issue

2. **http://localhost:3005**
   - Should redirect to `/marketing`
   - If you see an error → Share the error message

3. **http://localhost:3005/marketing**
   - Should show the marketing website
   - If blank/error → Share what you see

## Test 3: Check Browser Console

1. Open browser (Chrome/Firefox)
2. Press **F12** (opens Developer Tools)
3. Go to **Console** tab
4. Visit `http://localhost:3005/marketing`
5. **Look for red errors** → Copy and share them

## Test 4: Check Network Tab

1. Press **F12** → **Network** tab
2. Visit `http://localhost:3005/marketing`
3. Look for failed requests (red)
4. Click on failed request → Share the error

## Still Not Working?

Share:
1. Screenshot of PowerShell output
2. Screenshot of browser (what you see)
3. Any error messages from browser console (F12)
