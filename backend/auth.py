"""
Authentication utilities
"""
from flask import jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, verify_jwt_in_request
from functools import wraps
from database import db, User
import os


def login_required(f):
    """Decorator to require JWT authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Authentication required'}), 401
    return decorated_function


def optional_login(f):
    """Decorator for optional authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request(optional=True)
        except:
            pass
        return f(*args, **kwargs)
    return decorated_function


def get_current_user():
    """Get the currently authenticated user"""
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id:
            return User.query.get(user_id)
    except:
        pass
    return None


def create_user_token(user):
    """Create JWT token for user"""
    return create_access_token(identity=user.id)


def find_or_create_oauth_user(provider, oauth_id, email, username, avatar_url=None):
    """Find or create user from OAuth data"""
    # Try to find by OAuth ID
    user = User.query.filter_by(oauth_provider=provider, oauth_id=oauth_id).first()
    
    if user:
        # Update user info
        user.email = email
        user.username = username
        if avatar_url:
            user.avatar_url = avatar_url
        db.session.commit()
        return user
    
    # Try to find by email
    user = User.query.filter_by(email=email).first()
    if user:
        # Link OAuth to existing user
        user.oauth_provider = provider
        user.oauth_id = oauth_id
        if avatar_url:
            user.avatar_url = avatar_url
        db.session.commit()
        return user
    
    # Create new user
    # Ensure unique username
    base_username = username
    counter = 1
    while User.query.filter_by(username=username).first():
        username = f"{base_username}{counter}"
        counter += 1
    
    user = User(
        username=username,
        email=email,
        oauth_provider=provider,
        oauth_id=oauth_id,
        avatar_url=avatar_url
    )
    db.session.add(user)
    db.session.commit()
    
    return user

