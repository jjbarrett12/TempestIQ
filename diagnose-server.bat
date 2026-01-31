@echo off
echo ========================================
echo Roof Alert - Server Diagnostics
echo ========================================
echo.

cd /d "%~dp0"
echo [1/5] Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Please install from https://nodejs.org/
    pause
    exit /b 1
)
echo OK
echo.

echo [2/5] Checking npm...
npm --version
if errorlevel 1 (
    echo ERROR: npm not found!
    pause
    exit /b 1
)
echo OK
echo.

echo [3/5] Checking if dependencies are installed...
if not exist "node_modules\next" (
    echo WARNING: Dependencies not found!
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed!
        pause
        exit /b 1
    )
) else (
    echo OK - Dependencies found
)
echo.

echo [4/5] Checking port 3005...
netstat -ano | findstr :3005 >nul
if errorlevel 1 (
    echo OK - Port 3005 is available
) else (
    echo WARNING: Port 3005 is in use!
    echo Trying port 3006 instead...
    set PORT=3006
)
echo.

echo [5/5] Starting server...
echo.
echo ========================================
echo Server starting...
echo Visit: http://localhost:3005
echo ========================================
echo.
echo If you see "Ready" below, server is working!
echo If you see errors, copy them and share.
echo.
echo Press Ctrl+C to stop
echo.

npx next dev -p 3005

pause
