@echo off
REM 🛑 Racing App - Stop Script for Windows

echo 🛑 Stopping Racing App...

REM Kill processes by port
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    echo ✅ Backend stopped
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    echo ✅ Frontend stopped
)

echo.
echo ✅ Racing App has been stopped
pause

