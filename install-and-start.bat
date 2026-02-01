@echo off
echo ========================================
echo Roof Alert - Installing Dependencies
echo ========================================
echo.

cd /d "%~dp0"
echo Current directory: %CD%
echo.

echo Step 1: Removing old node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo   Old node_modules removed
) else (
    echo   No old node_modules found
)

echo.
echo Step 2: Installing dependencies...
echo   This may take 2-3 minutes...
call npm install

if errorlevel 1 (
    echo.
    echo ERROR: npm install failed!
    echo.
    echo Troubleshooting:
    echo   1. Make sure Node.js is installed (node --version)
    echo   2. Check your internet connection
    echo   3. Try: npm cache clean --force
    pause
    exit /b 1
)

echo.
echo Step 3: Verifying installation...
call npm list next

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Step 4: Starting server...
echo   Server will be at: http://localhost:3005
echo   Keep this window open!
echo.
call npm run dev

pause
