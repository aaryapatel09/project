# Quick Start Guide

This guide will help you get the Racing App up and running in minutes.

## Installation

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Option 1: Start Both Servers at Once

**macOS/Linux:**
```bash
./start-dev.sh
```

**Windows:**
```bash
start-dev.bat
```

### Option 2: Start Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Access the Application

Once both servers are running:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Testing the Features

### 1. Create a Track
1. Navigate to "Create Track"
2. Use the interactive track builder:
   - Click "Straight", "Corner L", or "Corner R" to add elements
   - Drag elements to position them on the canvas
   - Select an element to edit its properties:
     - Length (50-1000m)
     - Banking angle (0-30°)
     - Elevation (-50m to +50m)
     - Toggle DRS zone
     - Assign sector number
   - Watch real-time metrics update (lap time, difficulty, safety, etc.)
3. Enter a track name
4. Set number of laps
5. Click "Save Track to Database"
6. Use Ctrl+Z/Y for undo/redo
7. Export as JSON for backup or sharing

### 2. Simulate a Race
1. Navigate to "Simulate Race"
2. Select a track from the dropdown
3. Add racers (you can keep the default ones or add new ones)
4. Click "Start Race Simulation"
5. View the race results with positions and times

### 3. View Leaderboard
1. Navigate to "Leaderboard"
2. View rankings sorted by:
   - Total wins
   - Win rate percentage
   - Best lap time
3. Click "Refresh" to update the data

### 4. Check Your Profile
1. Navigate to "Profile"
2. Edit your username if desired
3. View your personal statistics:
   - Total races and wins
   - Win rate and podium finishes
   - Best time and average position
   - Favorite track
4. Review recent race history

## Troubleshooting

### Backend won't start
- Make sure you activated the virtual environment
- Check if port 5000 is available
- Verify Python 3.8+ is installed: `python --version`

### Frontend won't start
- Make sure you ran `npm install`
- Check if port 3000 is available
- Verify Node.js is installed: `node --version`

### API calls fail
- Ensure both servers are running
- Check browser console for errors
- Verify backend is accessible at http://localhost:5000/api/health

## Default Tracks

The backend comes with two pre-configured tracks for testing:
- **Speed Circuit**: 5km, Medium difficulty, 3 laps
- **Mountain Pass**: 8km, Hard difficulty, 2 laps

You can create additional tracks through the UI!

## Next Steps

- Create custom tracks with different configurations
- Simulate races with multiple racers
- Compare racer performance on the leaderboard
- Experiment with different difficulty levels

## Docker Alternative

Want to run with Docker instead?

```bash
# Development mode
docker-compose up --build

# Production mode
docker-compose -f docker-compose.prod.yml up --build -d
```

See [DOCKER.md](DOCKER.md) for complete Docker documentation.

## Code Quality

The project includes linting and formatting tools:

**Frontend:**
```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
npm run format        # Format code
```

**Backend:**
```bash
black .               # Format Python code
flake8 .              # Check for issues
```

Enjoy racing! 🏁

