# 🚀 START HERE - Get Racing App Running in 5 Minutes

## ⚡ Fastest Way to Run (Recommended)

### Option 1: Docker (Easiest - No Setup Needed)

```bash
# From /Users/aarya/project
docker-compose up --build
```

**That's it!** Then open:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

Press `Ctrl+C` to stop.

---

## 🛠️ Option 2: Run Locally (More Control)

### Prerequisites Check

```bash
# Check you have these installed:
python3 --version  # Need 3.8+
node --version     # Need 18+
npm --version      # Should come with node
```

If missing:
- **Python**: Download from https://python.org
- **Node.js**: Download from https://nodejs.org

### Backend Setup (Terminal 1)

```bash
# 1. Navigate to backend
cd /Users/aarya/project/backend

# 2. Create virtual environment
python3 -m venv venv

# 3. Activate it
source venv/bin/activate  # macOS/Linux
# or: venv\Scripts\activate  # Windows

# 4. Install dependencies
pip install Flask Flask-CORS

# 5. Run the server
python app.py
```

**You'll see:**
```
 * Running on http://0.0.0.0:5000
 * Debug mode: on
```

✅ Backend is running!

### Frontend Setup (Terminal 2 - New Window)

```bash
# 1. Navigate to frontend
cd /Users/aarya/project/frontend

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

**You'll see:**
```
  VITE v5.0.8  ready in 1234 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

✅ Frontend is running!

### Open Your Browser

Go to: **http://localhost:3000**

You should see the Racing App! 🏁

---

## 🎮 What to Try First

### 1. Design a Track (2 minutes)

1. You'll land on the **"Create Track"** page
2. Click **"➖ Straight"** button to add a straight section
3. Click **"↰ Corner L"** to add a left corner
4. **Drag** the elements to position them
5. **Click** an element to edit its properties:
   - Adjust length slider
   - Change banking angle
   - Set elevation
   - Toggle DRS zone
6. Watch the **metrics update in real-time** on the right:
   - Total length
   - Estimated lap time
   - Difficulty score
   - Overtaking points
   - Safety rating

### 2. Try AI Track Generator (30 seconds)

1. Click **"🤖 AI Track Designer"** button (left sidebar)
2. Select a target: **"Most Overtakes"** 🏎️
3. Click **"✨ Generate AI Track"**
4. Wait 2-3 seconds
5. **AI-generated track appears!**
6. It's automatically optimized for overtaking!

### 3. Simulate a Race (1 minute)

1. Click **"Simulate Race"** in navigation
2. Click **"🎬 Launch Race Wizard"**
3. **Step 1**: Select a track (use the AI one you just made!)
4. **Step 2**: Configure drivers (default drivers are fine)
   - Adjust skill/aggression sliders if you want
5. **Step 3**: Set weather (try "Variable" for chaos!)
6. **Step 4**: Review and click **"🏁 Start Simulation"**
7. Watch the race unfold with:
   - Live gap chart
   - Position changes
   - Event popups
   - Race commentary
8. Use **playback controls** to pause, rewind, fast-forward!

### 4. Explore Features

- **Leaderboard**: See global rankings
- **Profile**: View your stats
- **Import Real F1 Drivers**: Get actual 2023 F1 lineup!
- **Compare to Real Races**: See how realistic your simulation is

---

## 🧪 Running Tests

### Quick Test

```bash
# Backend tests (from /Users/aarya/project/backend)
pip install pytest
python -m pytest tests/test_api.py::test_health_check -v

# Frontend tests (from /Users/aarya/project/frontend)
npm test
```

### Full Test Suite

```bash
# From project root
cd /Users/aarya/project
./run-all-tests.sh
```

**Expected**: 85+ tests pass ✅

---

## 🐛 Troubleshooting

### Backend Won't Start

**Issue**: "No module named 'flask_cors'"
**Fix**: 
```bash
pip install Flask Flask-CORS
```

**Issue**: "Port 5000 already in use"
**Fix**:
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Frontend Won't Start

**Issue**: Dependencies not installed
**Fix**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Issue**: "Port 3000 already in use"
**Fix**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Both Won't Start

**Try Docker instead:**
```bash
cd /Users/aarya/project
docker-compose up --build
```

---

## 🎯 What You Can Do (No Setup Needed)

### Without OAuth (Works Immediately)
✅ Design custom tracks
✅ Run race simulations
✅ Generate AI tracks
✅ View leaderboards
✅ Check profile stats
✅ Import real F1 drivers
✅ Compare to real races
✅ Train AI drivers

### With OAuth (Requires Setup)
🔐 Login with Google/GitHub
🔐 Save tracks to database
🔐 Share tracks with URLs
🔐 Upvote community tracks
🔐 Create ghost challenges

**You can use 90% of features without any OAuth setup!**

---

## 📋 Quick Commands Cheat Sheet

```bash
# Start everything with Docker
docker-compose up

# Start backend manually
cd backend && source venv/bin/activate && python app.py

# Start frontend manually
cd frontend && npm run dev

# Run tests
./run-all-tests.sh

# Stop Docker
docker-compose down

# Check what's running
lsof -i :3000  # Frontend
lsof -i :5000  # Backend
```

---

## 🎊 Ready to Race!

**Simplest path:**
```bash
cd /Users/aarya/project
docker-compose up --build
```

**Then open:** http://localhost:3000

**Start designing tracks and racing!** 🏁🏎️

---

## 📚 More Help

- **Quick Start**: Read `QUICKSTART.md`
- **Features Guide**: Read `FEATURES.md`
- **Track Editor**: Read `TRACK_EDITOR.md`
- **Race Simulation**: Read `RACE_SIMULATION.md`
- **Troubleshooting**: Check `README.md`

**Everything is documented!**

