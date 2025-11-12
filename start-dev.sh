#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Racing App Development Servers...${NC}\n"

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${BLUE}Stopping servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${GREEN}Starting Flask backend on port 5000...${NC}"
cd backend
python app.py &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 2

# Start frontend
echo -e "${GREEN}Starting Vite frontend on port 3000...${NC}"
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo -e "\n${GREEN}✓ Servers started successfully!${NC}"
echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
echo -e "${BLUE}Backend:${NC} http://localhost:5000"
echo -e "\nPress Ctrl+C to stop both servers\n"

# Wait for background processes
wait

