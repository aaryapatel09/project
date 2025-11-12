# Racing App

A full-stack web application for creating race tracks, simulating races, and viewing leaderboards.

---

## ⚡ **QUICK START** (Non-Technical Users)

👉 **Read `README_SIMPLE.md` or `HOW_TO_RUN.md` for simple instructions!**

### **One-Click Start:**
- **Mac:** Right-click `START.sh` → Open With → Terminal
- **Windows:** Double-click `START.bat`
- Wait 10-20 seconds → Browser opens automatically at http://localhost:3000 🎉

### **First Time?** 
Need Python & Node.js installed first:
- Python: https://www.python.org/downloads/
- Node.js: https://nodejs.org/

**Developers:** Continue reading below for technical documentation.

---

## Features

- **Interactive Track Builder**: Advanced SVG-based editor with drag-and-drop functionality
  - Real-time metrics calculation
  - Banking control, elevation, sectors, and DRS zones
  - Undo/redo support (50 states)
  - JSON export/import
  - Visual tooltips and feedback
- **Race Simulation Studio**: Professional race scenario creator with live visualization
  - 4-step configuration wizard
  - Per-driver AI traits and strategies (skill, aggression, tire/pit strategy)
  - Weather profiles and race conditions
  - Live Visx/D3.js charts (gap charts, position timelines)
  - Full playback controls (pause/rewind/fast-forward, speed control)
  - Event popups and highlights system
  - Realistic lap-by-lap simulation with tire wear and pit strategy
- **Social Racing Platform**: Community features with OAuth2 authentication
  - User accounts (Google, GitHub OAuth)
  - Save and share tracks with unique URLs
  - Public leaderboard with upvoting system
  - Ghost race challenges
  - Strategy sharing
  - User profiles and statistics
- **Real F1 Data Integration**: Authentic racing data from Ergast API and FastF1
  - Import real F1 drivers with calibrated skill ratings
  - Compare simulations to historic races
  - Circuit calibration from real lap times
  - Realistic incident probabilities
  - Historic race data explorer
  - Realism scoring and validation
- **AI-Powered Features**: Advanced machine learning capabilities
  - Track AI Designer with genetic algorithms (procedural generation)
  - Optimize for target metrics (overtakes, speed, difficulty, safety)
  - RL AI Driver with Q-learning (learns from races)
  - Adaptive strategy across multiple simulations
  - Batch training system
  - Model persistence and loading
- **Production-Ready**: Enterprise-grade testing, security, and performance
  - Comprehensive test suites (Pytest, Vitest)
  - CI/CD pipeline (GitHub Actions)
  - Input validation and sanitization (Marshmallow, Bleach)
  - XSS/CSRF protection
  - Rate limiting (Flask-Limiter)
  - Async task queue (Celery + Redis)
  - Caching layer (Redis)
  - Security headers and monitoring
- **Leaderboard**: View rankings based on wins, win rate, and best times
- **Profile**: View personal racing statistics, history, and achievements
- **Docker Support**: Ready-to-use Docker configuration for both development and production
- **Code Quality**: Pre-configured ESLint and Prettier for clean, consistent code

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for development and building
- Tailwind CSS for styling
- React Router for navigation
- ESLint + Prettier for code quality

### Backend
- Python Flask REST API
- Flask-CORS for cross-origin requests
- SQLAlchemy ORM with SQLite/PostgreSQL
- JWT authentication with OAuth2
- Gunicorn for production deployment
- FastF1 and Ergast API integration
- Black + Flake8 for code formatting

### DevOps
- Docker multi-stage builds
- Docker Compose for orchestration
- Development and production configurations
- Nginx for frontend production serving

## Project Structure

```
project/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── CreateTrack.tsx
│   │   │   ├── SimulateRace.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   └── Profile.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── .eslintrc.cjs
│   ├── .prettierrc.json
│   ├── Dockerfile
│   └── nginx.conf
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .flake8
│   ├── .pylintrc
│   └── pyproject.toml
├── .vscode/
│   ├── settings.json
│   └── extensions.json
├── docker-compose.yml
├── docker-compose.prod.yml
├── .editorconfig
├── .gitignore
├── start-dev.sh
├── start-dev.bat
├── README.md
├── QUICKSTART.md
├── DOCKER.md
├── TRACK_EDITOR.md
├── FEATURES.md
└── PROJECT_STRUCTURE.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python 3.8 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Flask server:
```bash
python app.py
```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

### Quick Start (Both Servers)

For convenience, you can use the provided start scripts to run both servers simultaneously:

**On macOS/Linux:**
```bash
./start-dev.sh
```

**On Windows:**
```bash
start-dev.bat
```

## Running with Docker

### Development Mode

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the application:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Production Mode

```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

Access the application:
- Frontend: http://localhost (port 80)
- Backend: http://localhost:5000

## Code Quality

### Frontend Linting & Formatting

```bash
cd frontend

# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

### Backend Linting & Formatting

```bash
cd backend

# Format with Black
black .

# Lint with Flake8
flake8 .

# Lint with Pylint
pylint app.py
```

## API Endpoints

- `POST /api/create-track` - Create a new race track
- `GET /api/tracks` - Get all tracks
- `GET /api/tracks/<id>` - Get specific track with full data
- `POST /api/simulate-race` - Advanced race simulation (with tire strategy, weather, incidents)
- `GET /api/leaderboard` - Get leaderboard data
- `GET /api/race-history` - Get race history
- `GET /api/user/stats` - Get user profile statistics
- `GET /api/health` - Health check

## Usage

1. **Create a Track**: Use the interactive track builder to design custom tracks
   - Drag-and-drop corners and straights
   - Set banking, elevation, and DRS zones
   - Monitor real-time metrics (lap time, difficulty, safety, overtakes)
   - Export/import tracks as JSON
   - Undo/redo with keyboard shortcuts
2. **Simulate a Race**: Select a track, add racers, and run a simulation
3. **View Leaderboard**: Check out the rankings and statistics
4. **Check Profile**: View your personal racing stats and history

See [TRACK_EDITOR.md](TRACK_EDITOR.md) for complete track editor documentation.
See [RACE_SIMULATION.md](RACE_SIMULATION.md) for race simulation details.
See [RACE_WIZARD.md](RACE_WIZARD.md) for the Race Simulation Studio guide.
See [SOCIAL_FEATURES.md](SOCIAL_FEATURES.md) for social platform documentation.
See [F1_DATA_INTEGRATION.md](F1_DATA_INTEGRATION.md) for real F1 data integration.
See [AI_FEATURES.md](AI_FEATURES.md) for AI track designer and RL driver guide.
See [TESTING_SECURITY_OPTIMIZATION.md](TESTING_SECURITY_OPTIMIZATION.md) for production readiness.

## Testing

### Run All Tests
```bash
./run-all-tests.sh
```

### Backend Tests (Pytest)
```bash
cd backend
pytest --cov=. --cov-report=html --cov-report=term-missing
open htmlcov/index.html
```

### Frontend Tests (Vitest)
```bash
cd frontend
npm run test:coverage
open coverage/index.html
```

**Test Coverage:**
- Backend: 89% (55+ test cases)
- Frontend: 90% (30+ test cases)
- Total: 85+ comprehensive tests

See [TEST_COVERAGE.md](TEST_COVERAGE.md) for complete test documentation.
See [HOW_TO_TEST.md](HOW_TO_TEST.md) for testing guide.

## Development

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

The build output will be in `frontend/dist/`

## License

MIT

