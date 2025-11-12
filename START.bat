@echo off
REM 🏁 Racing App - One-Click Starter for Windows

echo 🏁 Starting Racing App...
echo.

REM Check if we're in the right directory
if not exist "backend" (
    echo ❌ Error: Please run this from the project folder
    echo    Right-click START.bat and select "Run as Administrator"
    pause
    exit /b 1
)

REM Check for Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed
    echo 📥 Please install Python from: https://www.python.org/downloads/
    echo.
    pause
    start https://www.python.org/downloads/
    exit /b 1
)

REM Check for Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed
    echo 📥 Please install Node.js from: https://nodejs.org/
    echo.
    pause
    start https://nodejs.org/
    exit /b 1
)

echo ✅ Python found
echo ✅ Node.js found
echo.

REM Install frontend dependencies if needed
if not exist "frontend\node_modules" (
    echo 📦 Installing app components (first time only, takes 2-3 minutes)...
    cd frontend
    call npm install
    cd ..
    echo ✅ Installation complete!
    echo.
)

REM Start backend
echo 🚀 Starting backend server...
cd backend
start "Racing App Backend" cmd /k python app.py
cd ..

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🚀 Starting frontend server...
cd frontend
start "Racing App Frontend" cmd /k npm run dev
cd ..

REM Wait for frontend to start
echo ⏳ Waiting for app to start (15 seconds)...
timeout /t 15 /nobreak >nul

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✨ Racing App is ready!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🌐 Opening in your browser...
echo.

REM Open browser
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo 👉 Your browser should open automatically
echo    If not, go to: http://localhost:3000
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📝 To stop the app:
echo    Close both "Racing App" windows
echo    Or run: STOP.bat
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ✅ App is running! Enjoy racing! 🏎️💨
echo.
pause

