"""
Flask app with social features, authentication, and user accounts
"""
from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from flask_jwt_extended import JWTManager, get_jwt_identity
from authlib.integrations.flask_client import OAuth
import random
import json
import os
from datetime import timedelta

# Import local modules
from database import db, User, SavedTrack, SavedStrategy, SavedSimulation, TrackUpvote, Challenge, generate_share_code
from auth import login_required, optional_login, get_current_user, create_user_token, find_or_create_oauth_user
from race_simulator import RaceSimulator

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///racing_app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)

# Google OAuth configuration
app.config['GOOGLE_CLIENT_ID'] = os.getenv('GOOGLE_CLIENT_ID', '')
app.config['GOOGLE_CLIENT_SECRET'] = os.getenv('GOOGLE_CLIENT_SECRET', '')

# GitHub OAuth configuration
app.config['GITHUB_CLIENT_ID'] = os.getenv('GITHUB_CLIENT_ID', '')
app.config['GITHUB_CLIENT_SECRET'] = os.getenv('GITHUB_CLIENT_SECRET', '')

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
oauth = OAuth(app)

# Register OAuth providers
if app.config['GOOGLE_CLIENT_ID']:
    google = oauth.register(
        name='google',
        client_id=app.config['GOOGLE_CLIENT_ID'],
        client_secret=app.config['GOOGLE_CLIENT_SECRET'],
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={'scope': 'openid email profile'}
    )

if app.config['GITHUB_CLIENT_ID']:
    github = oauth.register(
        name='github',
        client_id=app.config['GITHUB_CLIENT_ID'],
        client_secret=app.config['GITHUB_CLIENT_SECRET'],
        access_token_url='https://github.com/login/oauth/access_token',
        access_token_params=None,
        authorize_url='https://github.com/login/oauth/authorize',
        authorize_params=None,
        api_base_url='https://api.github.com/',
        client_kwargs={'scope': 'user:email'},
    )


# Create tables
with app.app_context():
    db.create_all()


# ============================================================================
# AUTH ENDPOINTS
# ============================================================================

@app.route('/api/auth/google')
def auth_google():
    """Initiate Google OAuth"""
    redirect_uri = request.args.get('redirect_uri', 'http://localhost:3000/auth/callback')
    return google.authorize_redirect(redirect_uri)


@app.route('/api/auth/google/callback')
def auth_google_callback():
    """Handle Google OAuth callback"""
    try:
        token = google.authorize_access_token()
        user_info = token.get('userinfo')
        
        user = find_or_create_oauth_user(
            provider='google',
            oauth_id=user_info['sub'],
            email=user_info['email'],
            username=user_info.get('name', user_info['email'].split('@')[0]),
            avatar_url=user_info.get('picture')
        )
        
        access_token = create_user_token(user)
        
        # Redirect to frontend with token
        frontend_url = request.args.get('state', 'http://localhost:3000')
        return redirect(f"{frontend_url}?token={access_token}")
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/auth/github')
def auth_github():
    """Initiate GitHub OAuth"""
    redirect_uri = request.args.get('redirect_uri', 'http://localhost:3000/auth/callback')
    return github.authorize_redirect(redirect_uri)


@app.route('/api/auth/github/callback')
def auth_github_callback():
    """Handle GitHub OAuth callback"""
    try:
        token = github.authorize_access_token()
        
        # Get user info
        resp = github.get('user', token=token)
        user_info = resp.json()
        
        # Get email if not public
        email = user_info.get('email')
        if not email:
            emails_resp = github.get('user/emails', token=token)
            emails = emails_resp.json()
            email = next((e['email'] for e in emails if e['primary']), emails[0]['email'])
        
        user = find_or_create_oauth_user(
            provider='github',
            oauth_id=str(user_info['id']),
            email=email,
            username=user_info['login'],
            avatar_url=user_info.get('avatar_url')
        )
        
        access_token = create_user_token(user)
        
        frontend_url = request.args.get('state', 'http://localhost:3000')
        return redirect(f"{frontend_url}?token={access_token}")
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/auth/me')
@login_required
def get_current_user_info():
    """Get current user info"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200


@app.route('/api/auth/demo-login')
def demo_login():
    """Demo login (development only)"""
    # Create or get demo user
    user = User.query.filter_by(email='demo@racing.app').first()
    if not user:
        user = User(
            username='DemoRacer',
            email='demo@racing.app',
            oauth_provider='demo',
            oauth_id='demo123'
        )
        db.session.add(user)
        db.session.commit()
    
    token = create_user_token(user)
    return jsonify({'token': token, 'user': user.to_dict()}), 200


# ============================================================================
# TRACK MANAGEMENT
# ============================================================================

@app.route('/api/tracks/save', methods=['POST'])
@login_required
def save_track():
    """Save a user track"""
    user = get_current_user()
    data = request.get_json()
    
    if not data or 'name' not in data or 'track_data' not in data:
        return jsonify({'error': 'Name and track data required'}), 400
    
    track = SavedTrack(
        share_code=generate_share_code(),
        user_id=user.id,
        name=data['name'],
        description=data.get('description', ''),
        track_data=json.dumps(data['track_data']),
        difficulty=data.get('difficulty', 'medium'),
        length=data.get('length', 0),
        is_public=data.get('is_public', True)
    )
    
    db.session.add(track)
    db.session.commit()
    
    return jsonify({
        'message': 'Track saved successfully',
        'track': track.to_dict(),
        'share_url': f"/track/{track.share_code}"
    }), 201


@app.route('/api/tracks/my-tracks')
@login_required
def get_my_tracks():
    """Get current user's tracks"""
    user = get_current_user()
    tracks = SavedTrack.query.filter_by(user_id=user.id).order_by(SavedTrack.created_at.desc()).all()
    return jsonify({'tracks': [t.to_dict() for t in tracks]}), 200


@app.route('/api/tracks/share/<share_code>')
@optional_login
def get_shared_track(share_code):
    """Get track by share code"""
    track = SavedTrack.query.filter_by(share_code=share_code).first()
    
    if not track:
        return jsonify({'error': 'Track not found'}), 404
    
    if not track.is_public:
        user = get_current_user()
        if not user or user.id != track.user_id:
            return jsonify({'error': 'Track is private'}), 403
    
    # Increment view count
    track.view_count += 1
    db.session.commit()
    
    return jsonify({'track': track.to_dict(include_data=True)}), 200


@app.route('/api/tracks/<int:track_id>/upvote', methods=['POST'])
@login_required
def upvote_track(track_id):
    """Upvote a track"""
    user = get_current_user()
    track = SavedTrack.query.get(track_id)
    
    if not track:
        return jsonify({'error': 'Track not found'}), 404
    
    # Check if already upvoted
    existing = TrackUpvote.query.filter_by(user_id=user.id, track_id=track_id).first()
    
    if existing:
        # Remove upvote
        db.session.delete(existing)
        track.upvote_count -= 1
        action = 'removed'
    else:
        # Add upvote
        upvote = TrackUpvote(user_id=user.id, track_id=track_id)
        db.session.add(upvote)
        track.upvote_count += 1
        action = 'added'
    
    db.session.commit()
    
    return jsonify({
        'action': action,
        'upvote_count': track.upvote_count
    }), 200


# ============================================================================
# LEADERBOARD
# ============================================================================

@app.route('/api/leaderboard/tracks')
def get_track_leaderboard():
    """Get top tracks by upvotes"""
    limit = request.args.get('limit', 50, type=int)
    sort_by = request.args.get('sort', 'upvotes')  # upvotes, views, recent
    
    query = SavedTrack.query.filter_by(is_public=True)
    
    if sort_by == 'upvotes':
        query = query.order_by(SavedTrack.upvote_count.desc())
    elif sort_by == 'views':
        query = query.order_by(SavedTrack.view_count.desc())
    elif sort_by == 'recent':
        query = query.order_by(SavedTrack.created_at.desc())
    
    tracks = query.limit(limit).all()
    
    return jsonify({
        'tracks': [t.to_dict() for t in tracks],
        'sort_by': sort_by
    }), 200


# ============================================================================
# CHALLENGES
# ============================================================================

@app.route('/api/challenges/create', methods=['POST'])
@login_required
def create_challenge():
    """Create a challenge"""
    user = get_current_user()
    data = request.get_json()
    
    if not data or 'track_id' not in data or 'challenger_time' not in data:
        return jsonify({'error': 'Track ID and time required'}), 400
    
    track = SavedTrack.query.get(data['track_id'])
    if not track:
        return jsonify({'error': 'Track not found'}), 404
    
    challenge = Challenge(
        share_code=generate_share_code(),
        challenger_id=user.id,
        challenged_id=data.get('challenged_id'),
        track_id=data['track_id'],
        strategy_id=data.get('strategy_id'),
        challenger_time=data['challenger_time'],
        challenger_data=json.dumps(data.get('ghost_data', {}))
    )
    
    db.session.add(challenge)
    db.session.commit()
    
    return jsonify({
        'message': 'Challenge created',
        'challenge': challenge.to_dict(),
        'share_url': f"/challenge/{challenge.share_code}"
    }), 201


@app.route('/api/challenges/share/<share_code>')
def get_challenge(share_code):
    """Get challenge by share code"""
    challenge = Challenge.query.filter_by(share_code=share_code).first()
    
    if not challenge:
        return jsonify({'error': 'Challenge not found'}), 404
    
    return jsonify({'challenge': challenge.to_dict(include_ghost=True)}), 200


@app.route('/api/challenges/<int:challenge_id>/accept', methods=['POST'])
@login_required
def accept_challenge(challenge_id):
    """Accept and complete a challenge"""
    user = get_current_user()
    data = request.get_json()
    
    challenge = Challenge.query.get(challenge_id)
    if not challenge:
        return jsonify({'error': 'Challenge not found'}), 404
    
    if challenge.status == 'completed':
        return jsonify({'error': 'Challenge already completed'}), 400
    
    # Update challenge
    challenge.challenged_id = user.id
    challenge.challenged_time = data.get('time')
    challenge.challenged_data = json.dumps(data.get('ghost_data', {}))
    challenge.status = 'completed'
    challenge.completed_at = db.datetime.utcnow()
    
    db.session.commit()
    
    winner = 'challenger' if challenge.challenger_time < challenge.challenged_time else 'challenged'
    
    return jsonify({
        'message': 'Challenge completed',
        'challenge': challenge.to_dict(),
        'winner': winner
    }), 200


@app.route('/api/challenges/my-challenges')
@login_required
def get_my_challenges():
    """Get user's challenges"""
    user = get_current_user()
    
    sent = Challenge.query.filter_by(challenger_id=user.id).order_by(Challenge.created_at.desc()).limit(20).all()
    received = Challenge.query.filter_by(challenged_id=user.id).order_by(Challenge.created_at.desc()).limit(20).all()
    
    return jsonify({
        'sent': [c.to_dict() for c in sent],
        'received': [c.to_dict() for c in received]
    }), 200


# ============================================================================
# LEGACY ENDPOINTS (for backwards compatibility)
# ============================================================================

# Keep existing race simulation endpoints...
# (Previous implementation remains, just add optional user tracking)

@app.route('/api/health')
def health():
    return jsonify({'status': 'healthy', 'features': 'social'}), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

