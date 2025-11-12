"""
Input Validation and Sanitization
"""
from marshmallow import Schema, fields, validates, ValidationError, EXCLUDE
import bleach
import re


def sanitize_html(text: str) -> str:
    """Remove any HTML/script tags"""
    if not text:
        return ''
    # Strip all HTML tags
    return bleach.clean(text, tags=[], strip=True)


def sanitize_string(text: str, max_length: int = 200) -> str:
    """Sanitize string input"""
    if not text:
        return ''
    # Remove HTML
    text = sanitize_html(text)
    # Truncate
    text = text[:max_length]
    # Remove control characters
    text = ''.join(char for char in text if char.isprintable() or char in '\n\r\t')
    return text.strip()


def validate_share_code(code: str) -> bool:
    """Validate share code format"""
    if not code:
        return False
    # 12 uppercase letters and digits
    pattern = r'^[A-Z0-9]{12}$'
    return bool(re.match(pattern, code))


class TrackSchema(Schema):
    """Track creation validation"""
    name = fields.Str(required=True, validate=lambda x: 1 <= len(x) <= 200)
    description = fields.Str(missing='', validate=lambda x: len(x) <= 1000)
    length = fields.Float(validate=lambda x: 0.1 <= x <= 50)
    difficulty = fields.Str(validate=lambda x: x in ['easy', 'medium', 'hard', 'extreme'])
    laps = fields.Int(validate=lambda x: 1 <= x <= 100)
    trackData = fields.Str(missing=None)
    is_public = fields.Bool(missing=True)
    
    class Meta:
        unknown = EXCLUDE
    
    @validates('name')
    def validate_name(self, value):
        sanitized = sanitize_string(value, 200)
        if len(sanitized) < 1:
            raise ValidationError('Name must not be empty after sanitization')


class DriverSchema(Schema):
    """Driver configuration validation"""
    name = fields.Str(required=True, validate=lambda x: 1 <= len(x) <= 100)
    skill = fields.Float(validate=lambda x: 0.0 <= x <= 1.0, missing=0.75)
    aggression = fields.Float(validate=lambda x: 0.0 <= x <= 1.0, missing=0.5)
    tireStrategy = fields.Str(validate=lambda x: x in ['conservative', 'balanced', 'aggressive'], missing='balanced')
    pitStrategy = fields.Str(validate=lambda x: x in ['one-stop', 'two-stop', 'three-stop', 'adaptive'], missing='two-stop')
    riskLevel = fields.Str(validate=lambda x: x in ['safe', 'normal', 'risky'], missing='normal')
    preferredTire = fields.Str(validate=lambda x: x in ['soft', 'medium', 'hard'], missing='medium')
    undercut = fields.Bool(missing=False)
    
    class Meta:
        unknown = EXCLUDE


class RaceSimulationSchema(Schema):
    """Race simulation request validation"""
    track = fields.Str(required=True, validate=lambda x: 1 <= len(x) <= 200)
    drivers = fields.List(fields.Nested(DriverSchema), required=True, validate=lambda x: 2 <= len(x) <= 30)
    laps = fields.Int(validate=lambda x: 1 <= x <= 200, missing=None)
    weather = fields.Str(validate=lambda x: x in ['dry', 'rain', 'variable'], missing='dry')
    safetyCarProbability = fields.Float(validate=lambda x: 0.0 <= x <= 0.5, missing=0.05)
    
    class Meta:
        unknown = EXCLUDE


class UserSchema(Schema):
    """User data validation"""
    username = fields.Str(required=True, validate=lambda x: 3 <= len(x) <= 50)
    email = fields.Email(required=True)
    
    class Meta:
        unknown = EXCLUDE
    
    @validates('username')
    def validate_username(self, value):
        # Only alphanumeric, underscore, hyphen
        if not re.match(r'^[a-zA-Z0-9_-]+$', value):
            raise ValidationError('Username can only contain letters, numbers, underscore, and hyphen')


def validate_and_sanitize_track(data: dict) -> dict:
    """Validate and sanitize track data"""
    schema = TrackSchema()
    validated = schema.load(data)
    
    # Sanitize strings
    validated['name'] = sanitize_string(validated['name'], 200)
    if 'description' in validated:
        validated['description'] = sanitize_string(validated.get('description', ''), 1000)
    
    return validated


def validate_and_sanitize_race(data: dict) -> dict:
    """Validate and sanitize race simulation data"""
    schema = RaceSimulationSchema()
    validated = schema.load(data)
    
    # Sanitize track name
    validated['track'] = sanitize_string(validated['track'], 200)
    
    # Sanitize driver names
    for driver in validated['drivers']:
        driver['name'] = sanitize_string(driver['name'], 100)
    
    return validated


def validate_pagination(page: int, per_page: int) -> tuple:
    """Validate pagination parameters"""
    page = max(1, min(1000, page))
    per_page = max(1, min(100, per_page))
    return page, per_page

