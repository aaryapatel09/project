"""
AI Feature Endpoints - Track Designer and RL Driver
"""
from flask import Blueprint, jsonify, request
from track_ai_designer import generate_ai_track
from ai_driver_rl import AIDriverRL
import os

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

# In-memory AI driver storage
ai_drivers = {}


@ai_bp.route('/generate-track', methods=['POST'])
def generate_track():
    """Generate track using AI designer"""
    data = request.get_json() or {}
    
    target_metric = data.get('target', 'balanced')
    target_value = data.get('value')
    
    valid_targets = ['overtakes', 'speed', 'difficulty', 'safety', 'balanced']
    if target_metric not in valid_targets:
        return jsonify({'error': f'Target must be one of: {valid_targets}'}), 400
    
    try:
        track_data = generate_ai_track(target_metric, target_value)
        
        return jsonify({
            'message': 'Track generated successfully',
            'track': track_data,
            'target_metric': target_metric
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Generation failed: {str(e)}'}), 500


@ai_bp.route('/driver/create', methods=['POST'])
def create_ai_driver():
    """Create a new RL AI driver"""
    data = request.get_json() or {}
    
    name = data.get('name', f'AI Driver {len(ai_drivers) + 1}')
    learning_rate = data.get('learning_rate', 0.1)
    exploration_rate = data.get('exploration_rate', 0.2)
    
    ai_driver = AIDriverRL(
        name=name,
        learning_rate=learning_rate,
        exploration_rate=exploration_rate
    )
    
    # Store in memory
    driver_id = f'ai_{len(ai_drivers) + 1}'
    ai_drivers[driver_id] = ai_driver
    
    return jsonify({
        'message': 'AI driver created',
        'driver_id': driver_id,
        'driver': ai_driver.get_statistics()
    }), 201


@ai_bp.route('/driver/<driver_id>')
def get_ai_driver(driver_id):
    """Get AI driver statistics"""
    if driver_id not in ai_drivers:
        return jsonify({'error': 'AI driver not found'}), 404
    
    ai_driver = ai_drivers[driver_id]
    return jsonify({'driver': ai_driver.get_statistics()}), 200


@ai_bp.route('/driver/<driver_id>/train', methods=['POST'])
def train_ai_driver(driver_id):
    """Train AI driver on race results"""
    if driver_id not in ai_drivers:
        return jsonify({'error': 'AI driver not found'}), 404
    
    data = request.get_json() or {}
    race_results = data.get('race_results', {})
    
    ai_driver = ai_drivers[driver_id]
    ai_driver.train_on_race(race_results)
    
    return jsonify({
        'message': 'Training completed',
        'driver': ai_driver.get_statistics()
    }), 200


@ai_bp.route('/driver/<driver_id>/config')
def get_ai_driver_config(driver_id):
    """Get AI driver as simulation-ready config"""
    if driver_id not in ai_drivers:
        return jsonify({'error': 'AI driver not found'}), 404
    
    ai_driver = ai_drivers[driver_id]
    config = ai_driver.to_driver_config()
    
    return jsonify({'config': config}), 200


@ai_bp.route('/driver/<driver_id>/save', methods=['POST'])
def save_ai_driver(driver_id):
    """Save AI driver model to disk"""
    if driver_id not in ai_drivers:
        return jsonify({'error': 'AI driver not found'}), 404
    
    ai_driver = ai_drivers[driver_id]
    filename = f'{driver_id}_model.pkl'
    
    try:
        ai_driver.save_model(filename)
        return jsonify({
            'message': 'Model saved successfully',
            'filename': filename
        }), 200
    except Exception as e:
        return jsonify({'error': f'Save failed: {str(e)}'}), 500


@ai_bp.route('/driver/load/<filename>', methods=['POST'])
def load_ai_driver(filename):
    """Load AI driver model from disk"""
    try:
        ai_driver = AIDriverRL.load_model(filename)
        
        driver_id = f'ai_loaded_{len(ai_drivers) + 1}'
        ai_drivers[driver_id] = ai_driver
        
        return jsonify({
            'message': 'Model loaded successfully',
            'driver_id': driver_id,
            'driver': ai_driver.get_statistics()
        }), 200
    except Exception as e:
        return jsonify({'error': f'Load failed: {str(e)}'}), 500


@ai_bp.route('/drivers')
def list_ai_drivers():
    """List all AI drivers"""
    drivers_list = []
    for driver_id, ai_driver in ai_drivers.items():
        stats = ai_driver.get_statistics()
        stats['driver_id'] = driver_id
        drivers_list.append(stats)
    
    return jsonify({'drivers': drivers_list}), 200


@ai_bp.route('/driver/<driver_id>/batch-train', methods=['POST'])
def batch_train_ai_driver(driver_id):
    """Train AI driver on multiple races"""
    if driver_id not in ai_drivers:
        return jsonify({'error': 'AI driver not found'}), 404
    
    data = request.get_json() or {}
    num_races = data.get('num_races', 10)
    track_data = data.get('track_data', {})
    
    ai_driver = ai_drivers[driver_id]
    
    # Simulate training races
    training_results = []
    
    for i in range(num_races):
        # Simple training simulation
        # In real implementation, run full race simulation
        mock_result = {
            'final_position': random.randint(1, 10),
            'fastest_lap': random.uniform(85, 95),
            'pit_stops': random.randint(1, 3)
        }
        
        ai_driver.train_on_race(mock_result)
        training_results.append({
            'race': i + 1,
            'position': mock_result['final_position'],
            'q_table_size': len(ai_driver.q_table)
        })
    
    return jsonify({
        'message': f'Trained on {num_races} races',
        'driver': ai_driver.get_statistics(),
        'training_results': training_results
    }), 200

