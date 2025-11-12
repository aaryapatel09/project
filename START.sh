#!/bin/bash

# 🏁 Racing App - One-Click Starter
# This script starts both the backend and frontend servers automatically

echo "🏁 Starting Racing App..."
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this from the project folder"
    echo "   Drag this file to Terminal, then press Enter"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for Python
if ! command_exists python3; then
    echo "❌ Python is not installed"
    echo "📥 Please install Python from: https://www.python.org/downloads/"
    echo ""
    read -p "Press Enter to open download page..." 
    open "https://www.python.org/downloads/"
    exit 1
fi

# Check for Node.js
if ! command_exists node; then
    echo "❌ Node.js is not installed"
    echo "📥 Please install Node.js from: https://nodejs.org/"
    echo ""
    read -p "Press Enter to open download page..."
    open "https://nodejs.org/"
    exit 1
fi

echo "✅ Python found: $(python3 --version)"
echo "✅ Node.js found: $(node --version)"
echo ""

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing app components (first time only, takes 2-3 minutes)..."
    cd frontend
    npm install
    cd ..
    echo "✅ Installation complete!"
    echo ""
fi

# Start backend in background
echo "🚀 Starting backend server..."
cd backend
python3 app.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Check if backend started successfully
if ! ps -p $BACKEND_PID > /dev/null; then
    echo "❌ Backend failed to start"
    echo "📋 Check backend.log for details"
    exit 1
fi

echo "✅ Backend running (Process ID: $BACKEND_PID)"

# Start frontend in background
echo "🚀 Starting frontend server..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏳ Waiting for app to start (10 seconds)..."
sleep 10

# Check if frontend started successfully
if ! ps -p $FRONTEND_PID > /dev/null; then
    echo "❌ Frontend failed to start"
    echo "📋 Check frontend.log for details"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Frontend running (Process ID: $FRONTEND_PID)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Racing App is ready!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Opening in your browser..."
echo ""

# Save PIDs to file for stopping later
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

# Open browser
sleep 2
if command_exists open; then
    open http://localhost:3000
elif command_exists xdg-open; then
    xdg-open http://localhost:3000
fi

echo "👉 Your browser should open automatically"
echo "   If not, go to: http://localhost:3000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 To stop the app:"
echo "   Run: ./STOP.sh"
echo "   Or press Ctrl+C in this window"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ App is running! Enjoy racing! 🏎️💨"
echo ""

# Keep script running and tail logs
echo "📋 App logs (press Ctrl+C to stop):"
echo ""
tail -f backend.log frontend.log &
TAIL_PID=$!

# Cleanup function
cleanup() {
    echo ""
    echo ""
    echo "🛑 Stopping Racing App..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    kill $TAIL_PID 2>/dev/null
    rm -f .backend.pid .frontend.pid
    echo "✅ App stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Wait for user to stop
wait

