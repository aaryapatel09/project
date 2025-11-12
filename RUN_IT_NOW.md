# 🏁 Run the Racing App Right Now - Step by Step

## 🎯 **Simplest Method: 2 Commands**

Open **TWO terminal windows** and run these:

### Terminal 1 - Backend
```bash
cd /Users/aarya/project/backend
python3 app.py
```

### Terminal 2 - Frontend
```bash
cd /Users/aarya/project/frontend
npm install
npm run dev
```

### Open Your Browser
```
http://localhost:3000
```

**You should see the Racing App!** 🏎️

---

## 📝 **Detailed Step-by-Step**

### Step 1: Open Terminal

Press `Cmd + Space`, type "Terminal", press Enter

### Step 2: Start Backend

Copy and paste this entire block:

```bash
cd /Users/aarya/project/backend
python3 app.py
```

**Expected output:**
```
 * Serving Flask app 'app'
 * Debug mode: on
WARNING: This is a development server.
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.x.x:5000
Press CTRL+C to quit
```

✅ **Backend is running!** Leave this terminal open.

### Step 3: Start Frontend

Open **NEW terminal** (`Cmd + T` for new tab), then:

```bash
cd /Users/aarya/project/frontend
npm install
npm run dev
```

**First time will take ~2 minutes to install dependencies.**

**Expected output:**
```
  VITE v5.0.8  ready in 1234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
  ➜  press h + enter to show help
```

✅ **Frontend is running!** Leave this terminal open too.

### Step 4: Open Browser

1. Open your web browser (Chrome, Safari, Firefox)
2. Go to: **http://localhost:3000**

You'll see:
```
┌─────────────────────────────────────┐
│     🏁 Racing App                   │
│  [Create Track] [Simulate Race]    │
│  [Leaderboard] [Profile]           │
└─────────────────────────────────────┘
```

---

## 🎮 **What to Do Now**

### Try the Track Editor (Most Visual)

1. You're already on "Create Track" page
2. Look for the **"🤖 AI Track Designer"** button on the left
3. Click it
4. Select **"Most Overtakes"** 🏎️
5. Click **"✨ Generate AI Track"**
6. Watch it generate in 2-3 seconds
7. See the track appear with metrics!

**Or manually design:**
1. Click **"➖ Straight"** - a straight appears on canvas
2. Click **"↰ Corner L"** - a corner appears
3. **Drag them** around the canvas
4. **Click one** to select it
5. Use sliders on left to adjust:
   - Length
   - Banking angle
   - Elevation
   - Toggle DRS zone
6. Watch metrics update instantly!

### Simulate a Race (Super Cool)

1. Click **"Simulate Race"** in top navigation
2. Click **"🎬 Launch Race Wizard"**
3. Follow the wizard:
   - Select track
   - Add/configure drivers
   - Set weather
   - Review
4. Click **"🏁 Start Simulation"**
5. Watch **live visualizations**:
   - Gap chart updates
   - Position changes
   - Event popups
   - Race commentary
6. Use **playback controls**:
   - Play/pause
   - Rewind/fast-forward
   - Speed up to 8x!

---

## 🔥 **Quick Feature Demos**

### 1. Real F1 Drivers (30 seconds)
```
1. Go to "Simulate Race"
2. Launch wizard
3. Step 2: Look for "Import Real F1 Drivers" (if component is there)
4. Select 2023 season
5. Check Hamilton, Verstappen, Leclerc
6. Click "Import"
7. They appear with REAL stats!
```

### 2. AI Track Generation (10 seconds)
```
1. Create Track page
2. Click "AI Track Designer"
3. Select target (e.g., "Fastest Lap Possible")
4. Click "Generate"
5. Done! Optimized track ready!
```

### 3. Live Race Visualization (Amazing!)
```
1. Simulate a race
2. Watch the gap chart update
3. See position changes in real-time
4. Pause and rewind
5. Jump to highlights
```

---

## 🛑 **Stopping the App**

### To Stop Servers

In each terminal window, press:
```
Ctrl + C
```

Both servers will stop gracefully.

---

## 🐳 **Alternative: Docker (One Command)**

If the manual method has issues, use Docker:

```bash
cd /Users/aarya/project
docker-compose up --build
```

**Advantages:**
- ✅ No dependency installation needed
- ✅ Everything configured automatically
- ✅ Isolated environment
- ✅ One command

**Access same URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

**To stop:**
```bash
Ctrl + C
# or: docker-compose down
```

---

## 📊 **What You're Running**

### Backend (Python Flask)
- Port: 5000
- API endpoints: 40+
- Features: Race simulation, AI generation, F1 data
- Default tracks: 2 pre-loaded (Speed Circuit, Mountain Pass)

### Frontend (React + TypeScript)
- Port: 3000
- Pages: 4 main routes
- Components: 20+ interactive
- Visualizations: Live charts with Visx

---

## 🎯 **Expected Behavior**

### When Working Correctly

**Backend terminal shows:**
```
* Running on http://127.0.0.1:5000
127.0.0.1 - - [timestamp] "GET /api/tracks HTTP/1.1" 200 -
127.0.0.1 - - [timestamp] "GET /api/health HTTP/1.1" 200 -
```

**Frontend terminal shows:**
```
VITE v5.0.8  ready in 1234 ms
➜  Local:   http://localhost:3000/
```

**Browser shows:**
- Beautiful dark theme with gradients
- Navigation bar with 4 links
- Interactive track editor
- No errors in console (F12 → Console tab)

---

## 🚨 **Common Issues**

### "Module not found" errors

**Backend:**
```bash
cd /Users/aarya/project/backend
pip install Flask Flask-CORS
```

**Frontend:**
```bash
cd /Users/aarya/project/frontend
npm install
```

### Ports already in use

**Find and kill process:**
```bash
# Backend (port 5000)
lsof -ti:5000 | xargs kill -9

# Frontend (port 3000)
lsof -ti:3000 | xargs kill -9
```

### npm install takes forever

This is normal for first time! It's downloading dependencies.
Takes 2-5 minutes. Be patient ☕

### Docker not installed

**Install Docker Desktop:**
- macOS: https://docs.docker.com/desktop/install/mac-install/
- Windows: https://docs.docker.com/desktop/install/windows-install/
- Linux: https://docs.docker.com/engine/install/

---

## ✅ **Success Checklist**

When it's working, you should be able to:

- [ ] Open http://localhost:3000 in browser
- [ ] See "🏁 Racing App" in navigation
- [ ] Click "Create Track" and see track editor
- [ ] Add track elements (straight, corners)
- [ ] See metrics update on the right
- [ ] Click "Simulate Race" and see wizard
- [ ] Click through wizard steps
- [ ] View race results with charts

**If all checked, you're racing!** 🏁✅

---

## 🎊 **You're Ready!**

**Just run these two commands in separate terminals:**

```bash
# Terminal 1
cd /Users/aarya/project/backend && python3 app.py

# Terminal 2 (new terminal)
cd /Users/aarya/project/frontend && npm install && npm run dev
```

**Then open:** http://localhost:3000

**Start designing tracks and simulating races!** 🏎️💨

**Having issues?** Check `QUICKSTART.md` for more detailed troubleshooting.

