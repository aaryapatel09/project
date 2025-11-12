#!/bin/bash

# 🛑 Racing App - Stop Script

echo "🛑 Stopping Racing App..."

# Check if PID files exist
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID
        echo "✅ Backend stopped"
    fi
    rm -f .backend.pid
fi

if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID
        echo "✅ Frontend stopped"
    fi
    rm -f .frontend.pid
fi

# Also try to kill by port (backup method)
BACKEND_PORT_PID=$(lsof -ti:5000 2>/dev/null)
if [ ! -z "$BACKEND_PORT_PID" ]; then
    kill $BACKEND_PORT_PID 2>/dev/null
    echo "✅ Cleaned up port 5000"
fi

FRONTEND_PORT_PID=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$FRONTEND_PORT_PID" ]; then
    kill $FRONTEND_PORT_PID 2>/dev/null
    echo "✅ Cleaned up port 3000"
fi

echo ""
echo "✅ Racing App has been stopped"

