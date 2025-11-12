# Social Racing Platform - Complete Implementation Guide

## 🎉 Overview

Complete social racing platform with user accounts, OAuth2 authentication, shareable tracks, leaderboards, upvoting, and ghost race challenges.

## 🏗️ Architecture

### Backend Stack
- **Flask**: Web framework
- **Flask-SQLAlchemy**: ORM for database
- **Flask-JWT-Extended**: JWT token management
- **Authlib**: OAuth2 client
- **SQLite/PostgreSQL**: Database

### Frontend Stack
- **React + TypeScript**: UI framework
- **JWT Storage**: LocalStorage/Cookies
- **OAuth2 Flow**: Social login
- **Share URLs**: Unique code generation

## 📦 Database Schema

### Users Table
```sql
- id: Primary key
- username: Unique username
- email: Unique email
- avatar_url: Profile picture
- oauth_provider: google, github, etc.
- oauth_id: Provider user ID
- created_at: Timestamp
```

### Saved Tracks Table
```sql
- id: Primary key
- share_code: 12-char unique code
- user_id: Foreign key to users
- name: Track name
- description: Track description
- track_data: JSON track elements
- difficulty: easy/medium/hard/extreme
- length: Track length in meters
- is_public: Boolean visibility
- upvote_count: Integer
- view_count: Integer
- created_at, updated_at: Timestamps
```

### Saved Strategies Table
```sql
- id: Primary key
- share_code: 12-char unique code
- user_id: Foreign key to users
- track_id: Optional foreign key
- name: Strategy name
- description: Strategy description
- strategy_data: JSON driver configs
- is_public: Boolean
- created_at: Timestamp
```

### Saved Simulations Table
```sql
- id: Primary key
- user_id: Foreign key
- track_id: Optional foreign key
- strategy_id: Optional foreign key
- result_data: JSON race results
- winning_time: Float
- fastest_lap: Float
- created_at: Timestamp
```

### Track Upvotes Table
```sql
- id: Primary key
- user_id: Foreign key
- track_id: Foreign key
- created_at: Timestamp
- UNIQUE(user_id, track_id)
```

### Challenges Table
```sql
- id: Primary key
- share_code: 12-char unique code
- challenger_id: Foreign key to users
- challenged_id: Optional foreign key to users
- track_id: Foreign key to tracks
- strategy_id: Optional foreign key
- challenger_time: Float (ghost time)
- challenger_data: JSON (ghost lap times, positions)
- challenged_time: Optional float
- challenged_data: Optional JSON
- status: pending/accepted/completed
- created_at, completed_at: Timestamps
```

## 🔐 Authentication Flow

### OAuth2 Social Login

#### Google Login Flow
```
1. User clicks "Login with Google"
2. Frontend → GET /api/auth/google
3. Redirect to Google OAuth consent
4. User approves
5. Google → GET /api/auth/google/callback?code=xxx
6. Backend exchanges code for user info
7. Backend creates/updates user in database
8. Backend generates JWT token
9. Redirect to frontend with token
10. Frontend stores JWT
```

#### GitHub Login Flow
```
Same as Google, using /api/auth/github endpoints
```

#### JWT Token Structure
```json
{
  "identity": user_id,
  "exp": expiration_timestamp,
  "iat": issued_at_timestamp
}
```

### Protected Routes
```python
@login_required  # Requires valid JWT
@optional_login  # JWT optional, user might be None
```

## 🛣️ API Endpoints

### Authentication
```
GET  /api/auth/google              - Initiate Google OAuth
GET  /api/auth/google/callback     - Handle Google callback
GET  /api/auth/github              - Initiate GitHub OAuth
GET  /api/auth/github/callback     - Handle GitHub callback
GET  /api/auth/me                  - Get current user (requires JWT)
GET  /api/auth/demo-login          - Demo login (development)
```

### Track Management
```
POST /api/tracks/save              - Save track (requires JWT)
GET  /api/tracks/my-tracks         - Get user's tracks (requires JWT)
GET  /api/tracks/share/:code       - Get track by share code
POST /api/tracks/:id/upvote        - Toggle upvote (requires JWT)
```

### Leaderboard
```
GET  /api/leaderboard/tracks       - Get top tracks
     ?sort=upvotes|views|recent
     &limit=50
```

### Challenges
```
POST /api/challenges/create        - Create challenge (requires JWT)
GET  /api/challenges/share/:code   - Get challenge by code
POST /api/challenges/:id/accept    - Accept challenge (requires JWT)
GET  /api/challenges/my-challenges - Get user's challenges (requires JWT)
```

## 🔗 Share URL System

### Track Sharing
```
Share Code: ABCD1234EFGH (12 characters)
URL: https://racing.app/track/ABCD1234EFGH
Frontend loads track data via /api/tracks/share/ABCD1234EFGH
```

### Strategy Sharing
```
Share Code: WXYZ5678IJKL
URL: https://racing.app/strategy/WXYZ5678IJKL
Frontend loads strategy + track data
```

### Challenge Sharing
```
Share Code: MNOP9012QRST
URL: https://racing.app/challenge/MNOP9012QRST
Frontend loads challenge with ghost data
Shows challenger's time and ghost laps
User can accept and race against ghost
```

## 👥 Social Features

### Public Leaderboard

**Track Leaderboard:**
- Sort by upvotes (most popular)
- Sort by views (most viewed)
- Sort by recent (newest)
- Display:
  - Track name
  - Creator username + avatar
  - Upvote count
  - View count
  - Difficulty
  - Length
  - Created date

**Implementation:**
```typescript
const response = await fetch('/api/leaderboard/tracks?sort=upvotes&limit=50')
const { tracks } = await response.json()
// Display in table/grid
```

### Upvote System

**How it works:**
- Users can upvote tracks they like
- One upvote per user per track
- Toggle upvote (click again to remove)
- Upvote count displayed on track cards
- Used for leaderboard ranking

**Implementation:**
```typescript
const upvoteTrack = async (trackId: number) => {
  const response = await fetch(`/api/tracks/${trackId}/upvote`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt_token}`
    }
  })
  const { action, upvote_count } = await response.json()
  // action: 'added' or 'removed'
}
```

### Ghost Race Challenges

**Challenge Creation:**
1. User completes race on a track
2. Their lap times and positions saved as "ghost data"
3. User creates challenge with their time
4. Gets shareable URL
5. Can send to specific user or make public

**Challenge Acceptance:**
1. Challenged user opens share URL
2. Sees challenger's time
3. Races on same track
4. Ghost data shows challenger's position each lap
5. System compares times
6. Winner determined

**Ghost Data Structure:**
```json
{
  "lap_times": [90.1, 89.5, 88.9, ...],
  "positions": [1, 1, 2, 1, ...],
  "gaps": [0, 0, 0.234, -0.156, ...],
  "pit_laps": [15, 45],
  "tire_compounds": ["medium", "soft"]
}
```

**Ghost Visualization:**
- Show ghost position on timeline
- Display gap to ghost each lap
- Highlight when you pass ghost
- Show final comparison

## 🎨 Frontend Components

### AuthProvider.tsx
```typescript
interface AuthContextType {
  user: User | null
  token: string | null
  login: (provider: 'google' | 'github') => void
  logout: () => void
  isAuthenticated: boolean
}

// Provides authentication state to entire app
// Stores JWT in localStorage
// Auto-refresh on mount
```

### LoginButton.tsx
```typescript
// Social login buttons
// Google, GitHub options
// Redirects to OAuth flow
// Handles callback with token
```

### ShareButton.tsx
```typescript
// Generates share URL
// Copies to clipboard
// Shows QR code option
// Social media sharing
```

### TrackCard.tsx
```typescript
// Display track info
// Upvote button
// View count
// Creator info
// Share button
// Preview thumbnail
```

### Leaderboard.tsx
```typescript
// Tab navigation: Tracks, Strategies, Users
// Sort options: Popular, Recent, Views
// Search and filter
// Pagination
// Responsive grid/table
```

### ChallengePanel.tsx
```typescript
// Create challenge button
// Challenge list (sent/received)
// Challenge status badges
// Accept/Decline buttons
// View ghost data
```

### GhostRaceVisualization.tsx
```typescript
// Real-time ghost comparison
// Gap indicator
// Position overlay on timeline
// Split times comparison
// Highlight overtaking moments
```

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Database
DATABASE_URL=sqlite:///racing_app.db
# or for production:
# DATABASE_URL=postgresql://user:pass@host:5432/racing_db

# JWT
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3000
```

### OAuth Setup

#### Google OAuth
1. Go to Google Cloud Console
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - http://localhost:5000/api/auth/google/callback
   - https://yourdomain.com/api/auth/google/callback
6. Copy Client ID and Secret to .env

#### GitHub OAuth
1. Go to GitHub Settings → Developer settings
2. New OAuth App
3. Set Authorization callback URL:
   - http://localhost:5000/api/auth/github/callback
4. Copy Client ID and Secret to .env

## 📊 Usage Examples

### Save Track
```typescript
const saveTrack = async (trackData) => {
  const response = await fetch('/api/tracks/save', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'My Awesome Track',
      description: 'A challenging street circuit',
      track_data: trackData,
      difficulty: 'hard',
      length: 5200,
      is_public: true
    })
  })
  
  const { track, share_url } = await response.json()
  // Share URL: /track/ABCD1234EFGH
  navigator.clipboard.writeText(`${window.location.origin}${share_url}`)
}
```

### Load Shared Track
```typescript
const loadTrack = async (shareCode) => {
  const response = await fetch(`/api/tracks/share/${shareCode}`)
  const { track } = await response.json()
  
  // Load track into editor
  loadTrackIntoEditor(JSON.parse(track.track_data))
}
```

### Create Challenge
```typescript
const createChallenge = async (raceResults) => {
  const response = await fetch('/api/challenges/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      track_id: trackId,
      challenger_time: raceResults.winning_time,
      ghost_data: {
        lap_times: raceResults.lap_times,
        positions: raceResults.positions,
        gaps: raceResults.gaps
      }
    })
  })
  
  const { challenge, share_url } = await response.json()
  // Share: /challenge/MNOP9012QRST
}
```

### Accept Challenge
```typescript
const acceptChallenge = async (challengeId, myResults) => {
  const response = await fetch(`/api/challenges/${challengeId}/accept`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      time: myResults.winning_time,
      ghost_data: {
        lap_times: myResults.lap_times,
        positions: myResults.positions
      }
    })
  })
  
  const { winner } = await response.json()
  // Display winner announcement
}
```

## 🚀 Deployment Considerations

### Database
- Development: SQLite (included)
- Production: PostgreSQL (recommended)
- Migrations: Use Flask-Migrate or Alembic

### OAuth Redirects
- Update OAuth apps with production URLs
- HTTPS required for production OAuth
- Set FRONTEND_URL environment variable

### Security
- Use strong SECRET_KEY and JWT_SECRET_KEY
- Enable HTTPS in production
- Set secure cookie flags
- Implement rate limiting
- Add CSRF protection

### Scaling
- Use Redis for session storage
- CDN for static assets
- Database connection pooling
- Caching for leaderboards

## 🎯 Future Enhancements

- [ ] Twitter/Discord OAuth
- [ ] User profiles with stats
- [ ] Friend system
- [ ] Private messages
- [ ] Tournament system
- [ ] Achievement badges
- [ ] Track collections
- [ ] Collaborative editing
- [ ] Replay system
- [ ] Video recording
- [ ] Twitch integration
- [ ] Discord bot
- [ ] Mobile app (React Native)

## 📝 Development Notes

### Running with Social Features

1. **Set up environment:**
```bash
cp .env.example .env
# Edit .env with your OAuth credentials
```

2. **Install dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

3. **Initialize database:**
```bash
python
>>> from app_social import app, db
>>> with app.app_context():
>>>     db.create_all()
```

4. **Run backend:**
```bash
python app_social.py
```

5. **Run frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Testing Social Features

- Use demo login for testing: GET /api/auth/demo-login
- Create multiple demo users with different emails
- Test sharing with incognito windows
- Verify OAuth redirects work correctly

## 🔍 Troubleshooting

### OAuth Not Working
- Check client IDs and secrets
- Verify redirect URLs match exactly
- Ensure OAuth apps are enabled
- Check CORS configuration

### JWT Token Issues
- Verify token is stored correctly
- Check token expiration
- Ensure Authorization header format: `Bearer <token>`
- Validate JWT_SECRET_KEY matches

### Database Errors
- Run db.create_all() to create tables
- Check database URL is correct
- Ensure write permissions
- Check for migration conflicts

## 📚 API Documentation

Full API documentation available at:
- Swagger UI: http://localhost:5000/docs
- Postman Collection: `/docs/postman_collection.json`
- OpenAPI Spec: `/docs/openapi.yaml`

## 🏁 Conclusion

Complete social racing platform with:
- OAuth2 authentication (Google, GitHub)
- JWT-based authorization
- User account management
- Track saving and sharing
- Strategy sharing
- Public leaderboards
- Upvoting system
- Ghost race challenges
- Shareable URLs
- Database persistence

Ready for deployment with proper OAuth configuration!

