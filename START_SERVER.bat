@echo off
title StormBridge - Dev Server
echo ========================================
echo StormBridge - Start Server
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Node.js...
node --version 2>nul
if errorlevel 1 (
    echo ERROR: Node.js not found! Install from https://nodejs.org/
    goto :end
)
echo OK
echo.

echo Checking dependencies...
if not exist "node_modules\next" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Installation failed!
        goto :end
    )
)
echo OK
echo.

echo Generating Prisma client (if needed)...
call npm run db:generate 2>nul
if errorlevel 1 (
    echo WARNING: Prisma generate failed. If you see ".prisma/client" errors, run: npm run db:generate
) else (
    echo OK
)
echo.

echo Starting server on port 3005...
echo Once you see "Ready", visit: http://localhost:3005/marketing
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

REM Use npm run dev (uses node path from package.json - works with spaces in path)
call npm run dev

echo.
echo Server stopped.
echo.

:end
echo.
pause
