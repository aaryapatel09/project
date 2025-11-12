"""
Security Middleware and Protection
"""
from flask import request, jsonify, session
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from functools import wraps
import secrets
import hashlib


def get_rate_limit_key():
    """Get rate limit key (IP or user ID)"""
    # Try to get user ID from JWT if available
    try:
        from flask_jwt_extended import get_jwt_identity
        user_id = get_jwt_identity()
        if user_id:
            return f"user:{user_id}"
    except:
        pass
    
    # Fall back to IP address
    return get_remote_address()


def init_limiter(app):
    """Initialize rate limiter"""
    limiter = Limiter(
        app=app,
        key_func=get_rate_limit_key,
        default_limits=["200 per day", "50 per hour"],
        storage_uri="memory://"  # Use Redis in production: redis://localhost:6379
    )
    return limiter


def init_csrf_protection(app):
    """Initialize CSRF protection"""
    app.config['WTF_CSRF_ENABLED'] = True
    app.config['WTF_CSRF_TIME_LIMIT'] = None
    
    @app.before_request
    def csrf_protect():
        """CSRF protection for state-changing requests"""
        if request.method in ['POST', 'PUT', 'DELETE', 'PATCH']:
            # Skip CSRF for API endpoints with JWT (JWT provides protection)
            if request.path.startswith('/api/'):
                # Check for JWT token
                auth_header = request.headers.get('Authorization')
                if auth_header and auth_header.startswith('Bearer '):
                    return  # JWT-protected, skip CSRF
            
            # For non-JWT requests, check CSRF token
            csrf_token = request.headers.get('X-CSRF-Token')
            session_token = session.get('csrf_token')
            
            if not csrf_token or csrf_token != session_token:
                # For development, allow if no session token exists yet
                if not session_token:
                    session['csrf_token'] = secrets.token_hex(32)
                    return
                
                return jsonify({'error': 'CSRF token missing or invalid'}), 403


def init_security_headers(app):
    """Add security headers to responses"""
    @app.after_request
    def set_security_headers(response):
        # Prevent XSS
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        
        # Content Security Policy
        response.headers['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' http://localhost:* https:;"
        )
        
        # HSTS (only in production with HTTPS)
        if not app.debug:
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        return response


def require_api_key(f):
    """Decorator to require API key (optional feature)"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        valid_api_key = app.config.get('API_KEY')
        
        if valid_api_key and api_key != valid_api_key:
            return jsonify({'error': 'Invalid API key'}), 401
        
        return f(*args, **kwargs)
    return decorated_function


def hash_password(password: str) -> str:
    """Hash password securely"""
    import bcrypt
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    import bcrypt
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

