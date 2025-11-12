"""
Production-Ready Flask App
With security, validation, rate limiting, and async tasks
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_caching import Cache
import json
import os

# Import local modules
from race_simulator import RaceSimulator
from f1_endpoints import f1_bp
from ai_endpoints import ai_bp
from validation import validate_and_sanitize_track, validate_and_sanitize_race
from security import init_limiter, init_security_headers
from async_tasks import celery_app, simulate_race_async, generate_ai_track_async

# Initialize Flask app
app = Flask(__name__)

# CORS configuration
CORS(app, 
     origins=os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(','),
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization', 'X-CSRF-Token'])

# App configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-change-in-production')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max request size

# Cache configuration
cache_config = {
    'CACHE_TYPE': 'redis' if os.getenv('REDIS_URL') else 'simple',
    'CACHE_REDIS_URL': os.getenv('REDIS_URL', 'redis://localhost:6379/1'),
    'CACHE_DEFAULT_TIMEOUT': 300
}
app.config.update(cache_config)
cache = Cache(app)

# Initialize security
limiter = init_limiter(app)
init_security_headers(app)

# Register blueprints
app.register_blueprint(f1_bp)
app.register_blueprint(ai_bp)

# In-memory storage (for development - use database in production)
tracks = []
race_history = []
leaderboard_data = {}


# ============================================================================
# PROTECTED ENDPOINTS WITH VALIDATION
# ============================================================================

@app.route('/api/create-track', methods=['POST'])
@limiter.limit("10 per minute")
def create_track():
    """Create a new race track with validation"""
    try:
        data = request.get_json()
        
        # Validate and sanitize
        validated_data = validate_and_sanitize_track(data)
        
        track = {
            'id': len(tracks) + 1,
            'name': validated_data['name'],
            'length': validated_data.get('length', 5),
            'difficulty': validated_data.get('difficulty', 'medium'),
            'laps': validated_data.get('laps', 3),
            'trackData': validated_data.get('trackData'),
        }
        
        # Check duplicates
        if any(t['name'] == track['name'] for t in tracks):
            return jsonify({'error': 'Track with this name already exists'}), 400
        
        tracks.append(track)
        
        # Clear cache
        cache.delete('all_tracks')
        
        return jsonify({
            'message': 'Track created successfully',
            'track': track
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Validation error: {str(e)}'}), 400


@app.route('/api/tracks')
@cache.cached(timeout=60, key_prefix='all_tracks')
def get_tracks():
    """Get all tracks (cached)"""
    return jsonify({'tracks': tracks}), 200


@app.route('/api/simulate-race', methods=['POST'])
@limiter.limit("5 per minute")
def simulate_race():
    """Simulate race with validation and optional async processing"""
    try:
        data = request.get_json()
        
        # Check if async requested
        use_async = data.get('async', False)
        
        # Validate
        validated_data = validate_and_sanitize_race(data)
        
        track_name = validated_data['track']
        
        # Find track
        track = next((t for t in tracks if t['name'] == track_name), None)
        if not track:
            return jsonify({'error': 'Track not found'}), 404
        
        # Parse track data
        track_data = track
        if 'trackData' in track and track['trackData']:
            try:
                track_data = json.loads(track['trackData']) if isinstance(track['trackData'], str) else track['trackData']
            except:
                pass
        
        # Get parameters
        drivers = validated_data['drivers']
        total_laps = validated_data.get('laps', track.get('laps', 3))
        weather = validated_data.get('weather', 'dry')
        safety_car_prob = validated_data.get('safetyCarProbability', 0.05)
        
        # Use async for long races (>30 laps) or many drivers (>10)
        if use_async or total_laps > 30 or len(drivers) > 10:
            # Queue async task
            task = simulate_race_async.delay(
                track_data, drivers, total_laps, weather, safety_car_prob
            )
            
            return jsonify({
                'task_id': task.id,
                'status': 'processing',
                'message': 'Race simulation queued'
            }), 202
        
        # Synchronous simulation for quick races
        simulator = RaceSimulator(track_data, drivers, total_laps, weather, safety_car_prob)
        results = simulator.simulate_race()
        
        # Update leaderboard
        for result in results['race_results']:
            racer = result['driver']
            if racer not in leaderboard_data:
                leaderboard_data[racer] = {'wins': 0, 'races': 0, 'bestTime': float('inf')}
            
            leaderboard_data[racer]['races'] += 1
            if result['position'] == 1:
                leaderboard_data[racer]['wins'] += 1
            
            if result.get('lap_times'):
                best_lap = min(result['lap_times'])
                if best_lap < leaderboard_data[racer]['bestTime']:
                    leaderboard_data[racer]['bestTime'] = best_lap
        
        # Cache invalidation
        cache.delete('leaderboard')
        
        return jsonify(results), 200
        
    except Exception as e:
        return jsonify({'error': f'Simulation error: {str(e)}'}), 500


@app.route('/api/task/<task_id>')
def get_task_status(task_id):
    """Get async task status"""
    task = celery_app.AsyncResult(task_id)
    
    if task.state == 'PENDING':
        response = {
            'state': task.state,
            'status': 'Task is waiting to be processed'
        }
    elif task.state == 'PROGRESS':
        response = {
            'state': task.state,
            'status': 'Task is in progress',
            'meta': task.info
        }
    elif task.state == 'SUCCESS':
        response = {
            'state': task.state,
            'status': 'Task completed',
            'result': task.result
        }
    else:
        # FAILURE or other states
        response = {
            'state': task.state,
            'status': str(task.info)
        }
    
    return jsonify(response), 200


@app.route('/api/leaderboard')
@cache.cached(timeout=30, key_prefix='leaderboard')
def get_leaderboard():
    """Get leaderboard (cached)"""
    leaderboard = []
    
    for racer, data in leaderboard_data.items():
        win_rate = (data['wins'] / data['races'] * 100) if data['races'] > 0 else 0
        leaderboard.append({
            'racer': racer,
            'wins': data['wins'],
            'races': data['races'],
            'bestTime': data['bestTime'] if data['bestTime'] != float('inf') else 0,
            'winRate': win_rate
        })
    
    leaderboard.sort(key=lambda x: x['wins'], reverse=True)
    
    for i, entry in enumerate(leaderboard):
        entry['rank'] = i + 1
    
    return jsonify({'leaderboard': leaderboard}), 200


@app.route('/api/health')
def health():
    """Health check with service status"""
    health_status = {
        'status': 'healthy',
        'cache': 'connected' if cache else 'unavailable',
        'celery': 'connected' if celery_app else 'unavailable',
        'tracks': len(tracks),
        'races': len(race_history)
    }
    return jsonify(health_status), 200


# Error handlers
@app.errorhandler(400)
def bad_request(e):
    return jsonify({'error': 'Bad request', 'message': str(e)}), 400


@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found', 'message': str(e)}), 404


@app.errorhandler(429)
def rate_limit_exceeded(e):
    return jsonify({'error': 'Rate limit exceeded', 'message': 'Too many requests'}), 429


@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Development server
    app.run(debug=True, host='0.0.0.0', port=5000)

