@echo off
echo Starting Racing App Development Servers...
echo.

echo Starting Flask backend on port 5000...
start "Flask Backend" cmd /k "cd backend && python app.py"

timeout /t 2 /nobreak > nul

echo Starting Vite frontend on port 3000...
start "Vite Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Servers started successfully!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo Close the command windows to stop the servers

