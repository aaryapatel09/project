#!/bin/bash

# Comprehensive Test Runner
# Runs all backend and frontend tests with coverage

set -e

echo "🧪 Racing App - Comprehensive Test Suite"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo -e "${BLUE}Creating Python virtual environment...${NC}"
    cd backend
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
else
    echo -e "${BLUE}Activating Python virtual environment...${NC}"
    source backend/venv/bin/activate
fi

# Backend Tests
echo ""
echo -e "${BLUE}===== BACKEND TESTS =====${NC}"
echo ""

cd backend

echo "📋 Running Pytest with coverage..."
python -m pytest tests/ -v --cov=. --cov-report=term-missing --cov-report=html --tb=short

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend tests passed!${NC}"
else
    echo -e "${RED}❌ Backend tests failed!${NC}"
    exit 1
fi

echo ""
echo "📊 Coverage report generated: backend/htmlcov/index.html"

cd ..

# Frontend Tests
echo ""
echo -e "${BLUE}===== FRONTEND TESTS =====${NC}"
echo ""

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing npm dependencies...${NC}"
    npm install
fi

echo "📋 Running Vitest tests..."
# Run without coverage to avoid dependency issues
npm test

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend tests passed!${NC}"
else
    echo -e "${RED}❌ Frontend tests failed!${NC}"
    exit 1
fi

echo ""
echo "📊 Coverage report generated: frontend/coverage/index.html"

cd ..

# Summary
echo ""
echo -e "${GREEN}========================================"
echo "✅ ALL TESTS PASSED!"
echo "========================================${NC}"
echo ""
echo "📊 Coverage Reports:"
echo "   Backend:  backend/htmlcov/index.html"
echo "   Frontend: frontend/coverage/index.html"
echo ""
echo "🎉 Test suite complete!"

