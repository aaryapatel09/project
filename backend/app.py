from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import time
import json
from race_simulator import RaceSimulator
from f1_endpoints import f1_bp
from ai_endpoints import ai_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(f1_bp)
app.register_blueprint(ai_bp)

# In-memory storage
tracks = []
race_history = []
leaderboard_data = {}

@app.route('/api/create-track', methods=['POST'])
def create_track():
    """Create a new race track"""
    data = request.get_json()
    
    if not data or 'name' not in data:
        return jsonify({'error': 'Track name is required'}), 400
    
    track = {
        'id': len(tracks) + 1,
        'name': data['name'],
        'length': data.get('length', 5),
        'difficulty': data.get('difficulty', 'medium'),
        'laps': data.get('laps', 3),
        'trackData': data.get('trackData', None),  # Store full track data if provided
    }
    
    # Check if track name already exists
    if any(t['name'] == track['name'] for t in tracks):
        return jsonify({'error': 'Track with this name already exists'}), 400
    
    tracks.append(track)
    
    return jsonify({
        'message': 'Track created successfully',
        'track': track
    }), 201

@app.route('/api/tracks', methods=['GET'])
def get_tracks():
    """Get all tracks"""
    return jsonify({'tracks': tracks}), 200

@app.route('/api/tracks/<int:track_id>', methods=['GET'])
def get_track(track_id):
    """Get a specific track with full data"""
    track = next((t for t in tracks if t['id'] == track_id), None)
    
    if not track:
        return jsonify({'error': 'Track not found'}), 404
    
    return jsonify({'track': track}), 200

@app.route('/api/simulate-race', methods=['POST'])
def simulate_race():
    """Advanced race simulation with tire strategy, weather, and lap-by-lap data"""
    data = request.get_json()
    
    if not data or 'track' not in data:
        return jsonify({'error': 'Track name is required'}), 400
    
    track_name = data['track']
    
    # Find the track
    track = next((t for t in tracks if t['name'] == track_name), None)
    
    if not track:
        return jsonify({'error': 'Track not found'}), 404
    
    # Parse track data if available
    track_data = track
    if 'trackData' in track and track['trackData']:
        try:
            if isinstance(track['trackData'], str):
                track_data = json.loads(track['trackData'])
            else:
                track_data = track['trackData']
        except:
            pass
    
    # Get drivers with stats
    drivers_input = data.get('drivers', data.get('racers', []))
    if not drivers_input:
        return jsonify({'error': 'At least one driver is required'}), 400
    
    # Convert simple racer names to driver objects with stats
    drivers = []
    for driver in drivers_input:
        if isinstance(driver, str):
            # Simple racer name - add default stats
            drivers.append({
                'name': driver,
                'skill': random.uniform(0.6, 0.95),
                'aggression': random.uniform(0.3, 0.8)
            })
        else:
            # Driver object with stats
            drivers.append({
                'name': driver.get('name', f'Driver {len(drivers) + 1}'),
                'skill': driver.get('skill', 0.75),
                'aggression': driver.get('aggression', 0.5)
            })
    
    # Get race parameters
    total_laps = data.get('laps', track.get('laps', 3))
    weather = data.get('weather', 'dry')  # dry, rain, variable
    safety_car_prob = data.get('safetyCarProbability', 0.05)
    
    # Create and run simulation
    try:
        simulator = RaceSimulator(
            track_data=track_data,
            drivers=drivers,
            total_laps=total_laps,
            weather=weather,
            safety_car_prob=safety_car_prob
        )
        
        race_results = simulator.simulate_race()
        
        # Update leaderboard with results
        for result in race_results['race_results']:
            racer = result['driver']
            if racer not in leaderboard_data:
                leaderboard_data[racer] = {
                    'wins': 0,
                    'races': 0,
                    'bestTime': float('inf')
                }
            
            leaderboard_data[racer]['races'] += 1
            if result['position'] == 1:
                leaderboard_data[racer]['wins'] += 1
            
            # Update best lap time
            if result['lap_times']:
                best_lap = min(result['lap_times'])
                if best_lap < leaderboard_data[racer]['bestTime']:
                    leaderboard_data[racer]['bestTime'] = best_lap
        
        # Store in race history (simplified format for compatibility)
        race_history.append({
            'track': track_name,
            'winner': race_results['winner'],
            'time': race_results['winning_time'],
            'participants': [d['name'] for d in drivers],
            'results': race_results['race_results'],
            'full_data': race_results  # Store full simulation data
        })
        
        return jsonify(race_results), 200
        
    except Exception as e:
        return jsonify({'error': f'Simulation error: {str(e)}'}), 500

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get the leaderboard"""
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
    
    # Sort by wins
    leaderboard.sort(key=lambda x: x['wins'], reverse=True)
    
    # Add ranks
    for i, entry in enumerate(leaderboard):
        entry['rank'] = i + 1
    
    return jsonify({'leaderboard': leaderboard}), 200

@app.route('/api/race-history', methods=['GET'])
def get_race_history():
    """Get race history"""
    return jsonify({'history': race_history}), 200

@app.route('/api/user/stats', methods=['GET'])
def get_user_stats():
    """Get user statistics"""
    if not leaderboard_data:
        return jsonify({
            'stats': {
                'totalRaces': 0,
                'totalWins': 0,
                'totalPodiums': 0,
                'winRate': 0,
                'bestTime': 0,
                'averagePosition': 0,
                'favoriteTrack': 'N/A'
            },
            'recentRaces': []
        }), 200
    
    # Aggregate all racers' data
    total_races = sum(data['races'] for data in leaderboard_data.values())
    total_wins = sum(data['wins'] for data in leaderboard_data.values())
    
    # Count podium finishes (top 3)
    total_podiums = 0
    for race in race_history:
        results = race.get('results', [])
        for result in results[:3]:
            # Handle both 'racer' (old format) and 'driver' (new format)
            driver_name = result.get('driver') or result.get('racer')
            if driver_name and driver_name in leaderboard_data:
                total_podiums += 1
    
    # Calculate stats
    win_rate = (total_wins / total_races * 100) if total_races > 0 else 0
    best_time = min((data['bestTime'] for data in leaderboard_data.values() 
                     if data['bestTime'] != float('inf')), default=0)
    
    # Calculate average position
    positions = []
    for race in race_history:
        positions.extend([result['position'] for result in race['results']])
    average_position = sum(positions) / len(positions) if positions else 0
    
    # Find favorite track
    track_counts = {}
    for race in race_history:
        track = race['track']
        track_counts[track] = track_counts.get(track, 0) + 1
    favorite_track = max(track_counts.items(), key=lambda x: x[1])[0] if track_counts else 'N/A'
    
    # Get recent races (last 10)
    recent_races = []
    for i, race in enumerate(reversed(race_history[-10:])):
        results = race.get('results', [])
        for result in results:
            recent_races.append({
                'track': race['track'],
                'position': result.get('position', 0),
                'time': result.get('total_time') or result.get('time', 0),
                'date': f'{10 - i} races ago'
            })
    
    return jsonify({
        'stats': {
            'totalRaces': total_races,
            'totalWins': total_wins,
            'totalPodiums': total_podiums,
            'winRate': win_rate,
            'bestTime': best_time,
            'averagePosition': average_position,
            'favoriteTrack': favorite_track
        },
        'recentRaces': recent_races[:10]
    }), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'tracks': len(tracks),
        'races': len(race_history),
        'racers': len(leaderboard_data)
    }), 200

if __name__ == '__main__':
    # Add some default tracks for testing
    tracks.append({
        'id': 1,
        'name': 'Speed Circuit',
        'length': 5,
        'difficulty': 'medium',
        'laps': 3
    })
    tracks.append({
        'id': 2,
        'name': 'Mountain Pass',
        'length': 8,
        'difficulty': 'hard',
        'laps': 2
    })
    
    app.run(debug=True, host='0.0.0.0', port=5000)

