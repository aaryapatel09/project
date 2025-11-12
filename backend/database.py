"""
Database models for Racing App
"""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()


class User(db.Model):
    """User account model"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    avatar_url = db.Column(db.String(500))
    oauth_provider = db.Column(db.String(50))  # google, github, etc.
    oauth_id = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    tracks = db.relationship('SavedTrack', backref='owner', lazy=True, cascade='all, delete-orphan')
    strategies = db.relationship('SavedStrategy', backref='owner', lazy=True, cascade='all, delete-orphan')
    simulations = db.relationship('SavedSimulation', backref='owner', lazy=True, cascade='all, delete-orphan')
    upvotes = db.relationship('TrackUpvote', backref='user', lazy=True, cascade='all, delete-orphan')
    challenges_sent = db.relationship('Challenge', foreign_keys='Challenge.challenger_id', backref='challenger', lazy=True)
    challenges_received = db.relationship('Challenge', foreign_keys='Challenge.challenged_id', backref='challenged', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'avatar_url': self.avatar_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class SavedTrack(db.Model):
    """User-created tracks"""
    __tablename__ = 'saved_tracks'
    
    id = db.Column(db.Integer, primary_key=True)
    share_code = db.Column(db.String(12), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    track_data = db.Column(db.Text, nullable=False)  # JSON string
    difficulty = db.Column(db.String(50))
    length = db.Column(db.Float)
    is_public = db.Column(db.Boolean, default=True)
    upvote_count = db.Column(db.Integer, default=0)
    view_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    upvotes = db.relationship('TrackUpvote', backref='track', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, include_data=False):
        result = {
            'id': self.id,
            'share_code': self.share_code,
            'user_id': self.user_id,
            'username': self.owner.username if self.owner else None,
            'avatar_url': self.owner.avatar_url if self.owner else None,
            'name': self.name,
            'description': self.description,
            'difficulty': self.difficulty,
            'length': self.length,
            'is_public': self.is_public,
            'upvote_count': self.upvote_count,
            'view_count': self.view_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_data:
            result['track_data'] = json.loads(self.track_data) if self.track_data else None
        return result


class SavedStrategy(db.Model):
    """User race strategies"""
    __tablename__ = 'saved_strategies'
    
    id = db.Column(db.Integer, primary_key=True)
    share_code = db.Column(db.String(12), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    track_id = db.Column(db.Integer, db.ForeignKey('saved_tracks.id'))
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    strategy_data = db.Column(db.Text, nullable=False)  # JSON string
    is_public = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    track = db.relationship('SavedTrack', backref='strategies')
    
    def to_dict(self, include_data=False):
        result = {
            'id': self.id,
            'share_code': self.share_code,
            'user_id': self.user_id,
            'username': self.owner.username if self.owner else None,
            'track_id': self.track_id,
            'track_name': self.track.name if self.track else None,
            'name': self.name,
            'description': self.description,
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        if include_data:
            result['strategy_data'] = json.loads(self.strategy_data) if self.strategy_data else None
        return result


class SavedSimulation(db.Model):
    """Saved race results"""
    __tablename__ = 'saved_simulations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    track_id = db.Column(db.Integer, db.ForeignKey('saved_tracks.id'))
    strategy_id = db.Column(db.Integer, db.ForeignKey('saved_strategies.id'))
    result_data = db.Column(db.Text, nullable=False)  # JSON string
    winning_time = db.Column(db.Float)
    fastest_lap = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    track = db.relationship('SavedTrack', backref='simulations')
    strategy = db.relationship('SavedStrategy', backref='simulations')
    
    def to_dict(self, include_data=False):
        result = {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.owner.username if self.owner else None,
            'track_id': self.track_id,
            'track_name': self.track.name if self.track else None,
            'strategy_id': self.strategy_id,
            'winning_time': self.winning_time,
            'fastest_lap': self.fastest_lap,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        if include_data:
            result['result_data'] = json.loads(self.result_data) if self.result_data else None
        return result


class TrackUpvote(db.Model):
    """Track upvotes"""
    __tablename__ = 'track_upvotes'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    track_id = db.Column(db.Integer, db.ForeignKey('saved_tracks.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'track_id', name='unique_upvote'),)


class Challenge(db.Model):
    """User challenges"""
    __tablename__ = 'challenges'
    
    id = db.Column(db.Integer, primary_key=True)
    share_code = db.Column(db.String(12), unique=True, nullable=False, index=True)
    challenger_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    challenged_id = db.Column(db.Integer, db.ForeignKey('users.id'))  # Can be null for open challenges
    track_id = db.Column(db.Integer, db.ForeignKey('saved_tracks.id'), nullable=False)
    strategy_id = db.Column(db.Integer, db.ForeignKey('saved_strategies.id'))
    challenger_time = db.Column(db.Float, nullable=False)
    challenger_data = db.Column(db.Text)  # Ghost data
    challenged_time = db.Column(db.Float)
    challenged_data = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending, accepted, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    track = db.relationship('SavedTrack', backref='challenges')
    strategy = db.relationship('SavedStrategy', backref='challenges')
    
    def to_dict(self, include_ghost=False):
        result = {
            'id': self.id,
            'share_code': self.share_code,
            'challenger_id': self.challenger_id,
            'challenger_name': self.challenger.username if self.challenger else None,
            'challenger_avatar': self.challenger.avatar_url if self.challenger else None,
            'challenged_id': self.challenged_id,
            'challenged_name': self.challenged.username if self.challenged else None,
            'challenged_avatar': self.challenged.avatar_url if self.challenged else None,
            'track_id': self.track_id,
            'track_name': self.track.name if self.track else None,
            'strategy_id': self.strategy_id,
            'challenger_time': self.challenger_time,
            'challenged_time': self.challenged_time,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
        }
        if include_ghost:
            result['challenger_data'] = json.loads(self.challenger_data) if self.challenger_data else None
            result['challenged_data'] = json.loads(self.challenged_data) if self.challenged_data else None
        return result


def generate_share_code():
    """Generate a unique 12-character share code"""
    import random
    import string
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=12))

