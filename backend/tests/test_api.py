"""
API Integration Tests
"""
import pytest
import json
from app import app


@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_health_check(client):
    """Test health endpoint"""
    response = client.get('/api/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'


def test_create_track(client):
    """Test track creation"""
    track_data = {
        'name': 'Test Circuit',
        'length': 5,
        'difficulty': 'medium',
        'laps': 3
    }
    
    response = client.post(
        '/api/create-track',
        data=json.dumps(track_data),
        content_type='application/json'
    )
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['track']['name'] == 'Test Circuit'
    assert 'id' in data['track']


def test_create_duplicate_track(client):
    """Test duplicate track rejection"""
    track_data = {
        'name': 'Duplicate Track',
        'length': 5,
        'difficulty': 'medium',
        'laps': 3
    }
    
    # Create first track
    client.post(
        '/api/create-track',
        data=json.dumps(track_data),
        content_type='application/json'
    )
    
    # Try to create duplicate
    response = client.post(
        '/api/create-track',
        data=json.dumps(track_data),
        content_type='application/json'
    )
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'already exists' in data['error'].lower()


def test_get_tracks(client):
    """Test getting all tracks"""
    response = client.get('/api/tracks')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'tracks' in data
    assert isinstance(data['tracks'], list)


def test_simulate_race(client):
    """Test race simulation"""
    # Create track first
    track_data = {
        'name': 'Test Race Track',
        'length': 5,
        'difficulty': 'medium',
        'laps': 3
    }
    client.post(
        '/api/create-track',
        data=json.dumps(track_data),
        content_type='application/json'
    )
    
    # Simulate race
    race_data = {
        'track': 'Test Race Track',
        'racers': ['Driver 1', 'Driver 2', 'Driver 3']
    }
    
    response = client.post(
        '/api/simulate-race',
        data=json.dumps(race_data),
        content_type='application/json'
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'winner' in data
    assert 'race_results' in data


def test_simulate_race_insufficient_drivers(client):
    """Test race simulation with too few drivers"""
    race_data = {
        'track': 'Test Track',
        'racers': ['Driver 1']
    }
    
    response = client.post(
        '/api/simulate-race',
        data=json.dumps(race_data),
        content_type='application/json'
    )
    
    # Should fail validation
    assert response.status_code in [400, 404]


def test_leaderboard(client):
    """Test leaderboard endpoint"""
    response = client.get('/api/leaderboard')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'leaderboard' in data
    assert isinstance(data['leaderboard'], list)


def test_user_stats(client):
    """Test user stats endpoint"""
    response = client.get('/api/user/stats')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'stats' in data
    assert 'recentRaces' in data


def test_invalid_json(client):
    """Test handling of invalid JSON"""
    response = client.post(
        '/api/create-track',
        data='invalid json',
        content_type='application/json'
    )
    assert response.status_code in [400, 500]


def test_missing_required_fields(client):
    """Test validation of required fields"""
    response = client.post(
        '/api/create-track',
        data=json.dumps({}),
        content_type='application/json'
    )
    assert response.status_code == 400

