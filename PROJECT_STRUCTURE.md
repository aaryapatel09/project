# Project Structure

```
project/
│
├── frontend/                          # React + TypeScript Frontend
│   ├── src/
│   │   ├── pages/                     # Page Components
│   │   │   ├── CreateTrack.tsx        # Create race tracks
│   │   │   ├── SimulateRace.tsx       # Simulate races
│   │   │   └── Leaderboard.tsx        # View rankings
│   │   ├── App.tsx                    # Main app with routing
│   │   ├── main.tsx                   # Entry point
│   │   ├── index.css                  # Tailwind styles
│   │   └── vite-env.d.ts              # Type definitions
│   ├── index.html                     # HTML template
│   ├── package.json                   # Dependencies
│   ├── vite.config.ts                 # Vite configuration
│   ├── tailwind.config.js             # Tailwind configuration
│   ├── postcss.config.js              # PostCSS configuration
│   ├── tsconfig.json                  # TypeScript config
│   └── tsconfig.node.json             # Node TypeScript config
│
├── backend/                           # Flask Backend
│   ├── app.py                         # Flask REST API
│   ├── requirements.txt               # Python dependencies
│   └── .env.example                   # Environment variables template
│
├── start-dev.sh                       # Start script (Unix)
├── start-dev.bat                      # Start script (Windows)
├── README.md                          # Main documentation
├── QUICKSTART.md                      # Quick start guide
├── PROJECT_STRUCTURE.md               # This file
└── .gitignore                         # Git ignore rules
```

## Component Breakdown

### Frontend Components

#### CreateTrack.tsx
- Form for creating custom race tracks
- Configurable parameters: name, length, difficulty, laps
- Sends POST request to `/api/create-track`
- Beautiful gradient UI with Tailwind CSS

#### SimulateRace.tsx
- Select track from dropdown
- Add/remove racers dynamically
- Simulate race with realistic time calculations
- Display results with podium styling
- Sends POST request to `/api/simulate-race`

#### Leaderboard.tsx
- Display racer statistics
- Sortable by wins, win rate, and best time
- Medal icons for top 3 positions
- Real-time refresh capability
- Fetches data from `/api/leaderboard`

#### Profile.tsx
- Personal user statistics dashboard
- Editable username (stored in localStorage)
- Comprehensive racing stats
- Recent race history
- Favorite track analysis
- Fetches data from `/api/user/stats`

### Backend API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/create-track` | POST | Create a new race track |
| `/api/tracks` | GET | Get all available tracks |
| `/api/simulate-race` | POST | Run a race simulation |
| `/api/leaderboard` | GET | Get racer rankings |
| `/api/race-history` | GET | Get past race results |
| `/api/user/stats` | GET | Get user profile statistics |
| `/api/health` | GET | Health check endpoint |

## Features

### 🎨 Modern UI
- Gradient backgrounds
- Glass-morphism effects
- Smooth transitions
- Responsive design
- Dark theme

### 🏎️ Race Simulation
- Realistic time calculations
- Difficulty-based multipliers
- Random variance for excitement
- Multi-racer support

### 📊 Statistics Tracking
- Win/loss records
- Best lap times
- Win rate percentages
- Race history

### 🔧 Developer Experience
- TypeScript for type safety
- Hot module replacement (Vite)
- Clean component architecture
- Easy-to-understand code
- Comprehensive documentation

## Technology Choices

### Why Vite?
- Lightning-fast hot module replacement
- Optimized production builds
- Native ES modules support
- Better developer experience than CRA

### Why Tailwind CSS?
- Utility-first approach
- Rapid prototyping
- Consistent design system
- Small production bundle size

### Why Flask?
- Lightweight and simple
- Perfect for REST APIs
- Easy to understand
- Python's rich ecosystem

## File Organization Philosophy

- **Pages as Components**: Each route is a self-contained component
- **Separation of Concerns**: Frontend and backend are completely separate
- **Type Safety**: TypeScript interfaces for all data structures
- **RESTful API**: Clean, predictable endpoints
- **Documentation First**: Multiple docs for different purposes

