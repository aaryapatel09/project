"""
F1 Real Data API Endpoints
"""
from flask import Blueprint, jsonify, request
from f1_data_integration import ErgastAPI, FastF1Integration, F1DataCalibration, get_real_driver_profile

f1_bp = Blueprint('f1', __name__, url_prefix='/api/f1')


@f1_bp.route('/seasons')
def get_seasons():
    """Get recent F1 seasons"""
    limit = request.args.get('limit', 10, type=int)
    
    try:
        seasons = ErgastAPI.get_seasons(limit)
        return jsonify({'seasons': seasons}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@f1_bp.route('/races/<int:season>')
def get_races(season):
    """Get races for a season"""
    try:
        races = ErgastAPI.get_races(season)
        return jsonify({'races': races, 'season': season}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@f1_bp.route('/race/<int:season>/<int:round_num>')
def get_race_results(season, round_num):
    """Get detailed race results"""
    try:
        results = ErgastAPI.get_race_results(season, round_num)
        
        if not results:
            return jsonify({'error': 'Race not found'}), 404
        
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@f1_bp.route('/standings/<int:season>')
def get_standings(season):
    """Get driver championship standings"""
    try:
        standings = ErgastAPI.get_driver_standings(season)
        return jsonify({'standings': standings, 'season': season}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@f1_bp.route('/driver-profile')
def get_driver_profile():
    """Get real driver profile with calibrated stats"""
    driver_name = request.args.get('name')
    season = request.args.get('season', 2023, type=int)
    
    if not driver_name:
        return jsonify({'error': 'Driver name required'}), 400
    
    try:
        profile = get_real_driver_profile(driver_name, season)
        return jsonify({'profile': profile}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@f1_bp.route('/compare')
def compare_to_real():
    """Compare simulation results to real race"""
    try:
        # Get parameters
        season = request.args.get('season', type=int)
        round_num = request.args.get('round', type=int)
        simulated_data = request.get_json() or {}
        
        if not season or not round_num:
            return jsonify({'error': 'Season and round required'}), 400
        
        # Get real race data
        real_data = ErgastAPI.get_race_results(season, round_num)
        
        if not real_data:
            return jsonify({'error': 'Real race data not found'}), 404
        
        # Compare
        comparison = F1DataCalibration.compare_simulation_to_real(simulated_data, real_data)
        
        return jsonify({
            'comparison': comparison,
            'real_data': real_data,
            'simulated_data': simulated_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@f1_bp.route('/calibrate-track')
def calibrate_track():
    """Get realistic parameters for a circuit"""
    circuit_name = request.args.get('circuit')
    season = request.args.get('season', 2023, type=int)
    
    if not circuit_name:
        return jsonify({'error': 'Circuit name required'}), 400
    
    try:
        # Get realistic lap time
        lap_time = F1DataCalibration.get_realistic_lap_time(circuit_name, season)
        
        # Get incident probability
        incident_prob = F1DataCalibration.get_incident_probability(circuit_name, season)
        
        calibration = {
            'circuit': circuit_name,
            'season': season,
            'realistic_lap_time': lap_time,
            'incident_probability': incident_prob,
            'recommended_settings': {
                'base_lap_time': lap_time if lap_time else 90.0,
                'safety_car_prob': max(0.03, incident_prob * 10),
                'difficulty_multiplier': 1.0
            }
        }
        
        return jsonify(calibration), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@f1_bp.route('/import-real-drivers/<int:season>')
def import_real_drivers(season):
    """Get real driver lineup with calibrated stats"""
    try:
        standings = ErgastAPI.get_driver_standings(season)
        
        drivers = []
        for standing in standings[:20]:  # Top 20 drivers
            skill = F1DataCalibration.get_driver_skill_from_real_data(standing['driver'], season)
            
            # Estimate aggression from wins ratio
            aggression = min(1.0, (standing['wins'] / max(1, season - 2020)) * 0.3 + 0.4)
            
            drivers.append({
                'name': standing['driver'],
                'code': standing['driver_code'],
                'team': standing['constructor'],
                'skill': skill,
                'aggression': round(aggression, 2),
                'championship_position': standing['position'],
                'points': standing['points'],
                'wins': standing['wins']
            })
        
        return jsonify({'drivers': drivers, 'season': season}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

