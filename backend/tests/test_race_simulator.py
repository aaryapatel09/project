"""
Race Simulator Unit Tests
"""
import pytest
from race_simulator import RaceSimulator, Driver, TireCompound


def test_driver_creation():
    """Test driver object creation"""
    driver = Driver(name="Test Driver", skill=0.85, aggression=0.6, car_number=1)
    
    assert driver.name == "Test Driver"
    assert driver.skill == 0.85
    assert driver.aggression == 0.6
    assert driver.position == 0
    assert driver.total_time == 0.0
    assert driver.is_retired == False


def test_tire_compounds():
    """Test tire compound data"""
    assert 'soft' in TireCompound.COMPOUNDS
    assert 'medium' in TireCompound.COMPOUNDS
    assert 'hard' in TireCompound.COMPOUNDS
    
    soft = TireCompound.COMPOUNDS['soft']
    assert soft['grip'] == 1.0
    assert soft['wear_rate'] > 1.0


def test_race_simulator_initialization():
    """Test race simulator initialization"""
    track_data = {
        'name': 'Test Track',
        'metrics': {
            'estimatedLapTime': 90.0,
            'totalLength': 5000,
            'difficultyScore': 50,
            'possibleOvertakes': 3
        }
    }
    
    drivers = [
        {'name': 'Driver 1', 'skill': 0.8, 'aggression': 0.5},
        {'name': 'Driver 2', 'skill': 0.75, 'aggression': 0.6}
    ]
    
    simulator = RaceSimulator(track_data, drivers, total_laps=10)
    
    assert len(simulator.drivers) == 2
    assert simulator.total_laps == 10
    assert simulator.current_lap == 0


def test_race_simulation_completes():
    """Test that race simulation runs to completion"""
    track_data = {
        'name': 'Test Track',
        'metrics': {
            'estimatedLapTime': 90.0,
            'totalLength': 5000,
            'difficultyScore': 50,
            'possibleOvertakes': 3
        }
    }
    
    drivers = [
        {'name': 'Driver 1', 'skill': 0.8, 'aggression': 0.5},
        {'name': 'Driver 2', 'skill': 0.75, 'aggression': 0.6}
    ]
    
    simulator = RaceSimulator(track_data, drivers, total_laps=5)
    results = simulator.simulate_race()
    
    assert 'race_results' in results
    assert 'winner' in results
    assert len(results['race_results']) == 2
    assert results['total_laps'] == 5


def test_tire_degradation():
    """Test tire condition degrades over laps"""
    driver = Driver(name="Test", skill=0.8, aggression=0.5, car_number=1)
    driver.current_tire = 'soft'
    driver.tire_condition = 1.0
    driver.tire_age = 0
    
    # Simulate wear
    initial_condition = driver.tire_condition
    
    for _ in range(10):
        driver.tire_age += 1
        wear_rate = TireCompound.COMPOUNDS['soft']['wear_rate']
        driver.tire_condition -= 0.02 * wear_rate
    
    assert driver.tire_condition < initial_condition
    assert driver.tire_age == 10


def test_race_results_structure():
    """Test race results have correct structure"""
    track_data = {
        'name': 'Test',
        'metrics': {'estimatedLapTime': 90.0, 'totalLength': 5000, 'difficultyScore': 50, 'possibleOvertakes': 3}
    }
    drivers = [{'name': 'D1', 'skill': 0.8, 'aggression': 0.5}, {'name': 'D2', 'skill': 0.75, 'aggression': 0.6}]
    
    simulator = RaceSimulator(track_data, drivers, total_laps=3)
    results = simulator.simulate_race()
    
    # Check structure
    assert 'race_results' in results
    assert 'winner' in results
    assert 'total_laps' in results
    assert 'fastest_lap' in results
    assert 'commentary' in results
    
    # Check each result
    for result in results['race_results']:
        assert 'position' in result
        assert 'driver' in result
        assert 'total_time' in result
        assert 'lap_times' in result
        assert 'pit_stops' in result

