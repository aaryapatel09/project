"""
Real-world F1 Data Integration
Fetches data from Ergast API and FastF1 for realistic comparisons
"""
import requests
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import pickle

try:
    import fastf1
    import pandas as pd
    FASTF1_AVAILABLE = True
except ImportError:
    FASTF1_AVAILABLE = False
    print("FastF1 not available. Install with: pip install fastf1")


class F1DataCache:
    """Simple file-based cache for F1 data"""
    
    def __init__(self, cache_dir='f1_cache'):
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)
    
    def get(self, key: str, max_age_hours: int = 24):
        """Get cached data if not expired"""
        cache_file = os.path.join(self.cache_dir, f"{key}.pkl")
        
        if os.path.exists(cache_file):
            # Check age
            file_age = datetime.now() - datetime.fromtimestamp(os.path.getmtime(cache_file))
            if file_age < timedelta(hours=max_age_hours):
                with open(cache_file, 'rb') as f:
                    return pickle.load(f)
        return None
    
    def set(self, key: str, data):
        """Cache data"""
        cache_file = os.path.join(self.cache_dir, f"{key}.pkl")
        with open(cache_file, 'wb') as f:
            pickle.dump(data, f)


cache = F1DataCache()


class ErgastAPI:
    """Ergast F1 API client"""
    
    BASE_URL = 'http://ergast.com/api/f1'
    
    @staticmethod
    def get_seasons(limit: int = 10) -> List[Dict]:
        """Get recent F1 seasons"""
        cache_key = f'seasons_{limit}'
        cached = cache.get(cache_key, max_age_hours=168)  # 1 week
        if cached:
            return cached
        
        url = f'{ErgastAPI.BASE_URL}/seasons.json?limit={limit}&offset=0'
        response = requests.get(url, timeout=10)
        data = response.json()
        
        seasons = []
        for season in data['MRData']['SeasonTable']['Seasons']:
            seasons.append({
                'season': int(season['season']),
                'url': season['url']
            })
        
        seasons.sort(key=lambda x: x['season'], reverse=True)
        cache.set(cache_key, seasons)
        return seasons
    
    @staticmethod
    def get_races(season: int) -> List[Dict]:
        """Get races for a season"""
        cache_key = f'races_{season}'
        cached = cache.get(cache_key, max_age_hours=168)
        if cached:
            return cached
        
        url = f'{ErgastAPI.BASE_URL}/{season}.json'
        response = requests.get(url, timeout=10)
        data = response.json()
        
        races = []
        for race in data['MRData']['RaceTable']['Races']:
            races.append({
                'round': int(race['round']),
                'name': race['raceName'],
                'circuit': race['Circuit']['circuitName'],
                'country': race['Circuit']['Location']['country'],
                'date': race['date'],
                'url': race['url']
            })
        
        cache.set(cache_key, races)
        return races
    
    @staticmethod
    def get_race_results(season: int, round_num: int) -> Dict:
        """Get detailed race results"""
        cache_key = f'race_results_{season}_{round_num}'
        cached = cache.get(cache_key, max_age_hours=168)
        if cached:
            return cached
        
        url = f'{ErgastAPI.BASE_URL}/{season}/{round_num}/results.json'
        response = requests.get(url, timeout=10)
        data = response.json()
        
        if not data['MRData']['RaceTable']['Races']:
            return None
        
        race = data['MRData']['RaceTable']['Races'][0]
        
        results = {
            'race_name': race['raceName'],
            'circuit': race['Circuit']['circuitName'],
            'date': race['date'],
            'results': []
        }
        
        for result in race['Results']:
            driver_data = {
                'position': int(result['position']),
                'driver': f"{result['Driver']['givenName']} {result['Driver']['familyName']}",
                'driver_code': result['Driver'].get('code', ''),
                'constructor': result['Constructor']['name'],
                'laps': int(result['laps']),
                'status': result['status'],
                'points': float(result['points'])
            }
            
            # Add time if finished
            if 'Time' in result:
                driver_data['time'] = result['Time']['millis'] / 1000.0  # Convert to seconds
            
            # Add fastest lap if available
            if 'FastestLap' in result:
                driver_data['fastest_lap'] = result['FastestLap']['Time']['time']
                driver_data['fastest_lap_rank'] = int(result['FastestLap']['rank'])
            
            results['results'].append(driver_data)
        
        cache.set(cache_key, results)
        return results
    
    @staticmethod
    def get_driver_standings(season: int) -> List[Dict]:
        """Get driver championship standings"""
        cache_key = f'driver_standings_{season}'
        cached = cache.get(cache_key, max_age_hours=24)
        if cached:
            return cached
        
        url = f'{ErgastAPI.BASE_URL}/{season}/driverStandings.json'
        response = requests.get(url, timeout=10)
        data = response.json()
        
        standings = []
        for standing in data['MRData']['StandingsTable']['StandingsLists'][0]['DriverStandings']:
            standings.append({
                'position': int(standing['position']),
                'points': float(standing['points']),
                'wins': int(standing['wins']),
                'driver': f"{standing['Driver']['givenName']} {standing['Driver']['familyName']}",
                'driver_code': standing['Driver'].get('code', ''),
                'constructor': standing['Constructors'][0]['name']
            })
        
        cache.set(cache_key, standings)
        return standings
    
    @staticmethod
    def get_lap_times(season: int, round_num: int, lap: int) -> List[Dict]:
        """Get lap times for specific lap"""
        cache_key = f'lap_times_{season}_{round_num}_{lap}'
        cached = cache.get(cache_key, max_age_hours=168)
        if cached:
            return cached
        
        url = f'{ErgastAPI.BASE_URL}/{season}/{round_num}/laps/{lap}.json?limit=30'
        response = requests.get(url, timeout=10)
        data = response.json()
        
        if not data['MRData']['RaceTable']['Races']:
            return []
        
        lap_data = []
        for timing in data['MRData']['RaceTable']['Races'][0]['Laps'][0]['Timings']:
            lap_data.append({
                'driver_id': timing['driverId'],
                'position': int(timing['position']),
                'time': timing['time']
            })
        
        cache.set(cache_key, lap_data)
        return lap_data


class FastF1Integration:
    """FastF1 library integration for detailed telemetry"""
    
    @staticmethod
    def get_session_data(season: int, round_num: int, session_type: str = 'R') -> Optional[Dict]:
        """
        Get detailed session data
        session_type: 'R' (Race), 'Q' (Qualifying), 'FP1', 'FP2', 'FP3'
        """
        if not FASTF1_AVAILABLE:
            return None
        
        cache_key = f'fastf1_{season}_{round_num}_{session_type}'
        cached = cache.get(cache_key, max_age_hours=168)
        if cached:
            return cached
        
        try:
            # Enable cache
            fastf1.Cache.enable_cache('f1_cache/fastf1_cache')
            
            # Load session
            session = fastf1.get_session(season, round_num, session_type)
            session.load()
            
            # Extract data
            data = {
                'event_name': session.event['EventName'],
                'circuit': session.event['Location'],
                'date': str(session.event['EventDate']),
                'weather': {
                    'air_temp': float(session.weather_data['AirTemp'].mean()) if 'AirTemp' in session.weather_data else None,
                    'track_temp': float(session.weather_data['TrackTemp'].mean()) if 'TrackTemp' in session.weather_data else None,
                    'rainfall': bool(session.weather_data['Rainfall'].any()) if 'Rainfall' in session.weather_data else False
                },
                'drivers': []
            }
            
            # Get driver data
            for driver_num in session.drivers:
                driver = session.get_driver(driver_num)
                laps = session.laps.pick_driver(driver_num)
                
                if len(laps) == 0:
                    continue
                
                driver_data = {
                    'driver_number': driver_num,
                    'abbreviation': driver['Abbreviation'],
                    'team': driver['TeamName'],
                    'total_laps': len(laps),
                    'fastest_lap': float(laps['LapTime'].min().total_seconds()) if len(laps) > 0 else None,
                    'avg_lap_time': float(laps['LapTime'].mean().total_seconds()) if len(laps) > 0 else None
                }
                
                data['drivers'].append(driver_data)
            
            cache.set(cache_key, data)
            return data
            
        except Exception as e:
            print(f"FastF1 error: {e}")
            return None


class F1DataCalibration:
    """Calibrate simulation parameters from real F1 data"""
    
    @staticmethod
    def get_driver_skill_from_real_data(driver_name: str, season: int = 2023) -> float:
        """Calculate driver skill rating from championship position"""
        try:
            standings = ErgastAPI.get_driver_standings(season)
            
            # Find driver
            for standing in standings:
                if driver_name.lower() in standing['driver'].lower():
                    # Normalize position to 0.5-1.0 range
                    # Position 1 = 1.0, Position 20 = 0.5
                    max_position = len(standings)
                    position = standing['position']
                    skill = 1.0 - ((position - 1) / (max_position - 1)) * 0.5
                    return round(skill, 2)
            
            # Default if not found
            return 0.75
        except:
            return 0.75
    
    @staticmethod
    def get_realistic_lap_time(circuit_name: str, season: int = 2023) -> Optional[float]:
        """Get realistic lap time for a circuit"""
        try:
            races = ErgastAPI.get_races(season)
            
            # Find matching race
            for race in races:
                if circuit_name.lower() in race['circuit'].lower() or circuit_name.lower() in race['name'].lower():
                    results = ErgastAPI.get_race_results(season, race['round'])
                    
                    if results and results['results']:
                        # Find fastest lap from results
                        fastest = None
                        for result in results['results']:
                            if 'fastest_lap' in result:
                                # Parse time string (e.g., "1:32.123")
                                time_str = result['fastest_lap']
                                parts = time_str.split(':')
                                if len(parts) == 2:
                                    minutes = int(parts[0])
                                    seconds = float(parts[1])
                                    total_seconds = minutes * 60 + seconds
                                    
                                    if fastest is None or total_seconds < fastest:
                                        fastest = total_seconds
                        
                        return fastest
            
            return None
        except:
            return None
    
    @staticmethod
    def get_incident_probability(circuit_name: str, season: int = 2023) -> float:
        """Calculate incident probability based on real race data"""
        try:
            races = ErgastAPI.get_races(season)
            
            for race in races:
                if circuit_name.lower() in race['circuit'].lower():
                    results = ErgastAPI.get_race_results(season, race['round'])
                    
                    if results and results['results']:
                        total_drivers = len(results['results'])
                        dnf_count = sum(1 for r in results['results'] if r['status'] != 'Finished')
                        
                        # Calculate incident probability per lap
                        # Assuming 50-70 laps average
                        avg_laps = 60
                        incident_prob = (dnf_count / total_drivers) / avg_laps
                        
                        return round(incident_prob, 4)
            
            return 0.005  # Default
        except:
            return 0.005
    
    @staticmethod
    def compare_simulation_to_real(simulated_results: Dict, real_race_data: Dict) -> Dict:
        """Compare simulated race results to real race data"""
        comparison = {
            'realism_score': 0.0,
            'lap_time_accuracy': 0.0,
            'position_changes': 0,
            'dnf_comparison': {},
            'insights': []
        }
        
        # Compare lap times
        if 'fastest_lap' in simulated_results and real_race_data.get('results'):
            sim_fastest = simulated_results['fastest_lap']
            real_fastest = min([r.get('fastest_lap', 999) for r in real_race_data['results'] if 'fastest_lap' in r], default=None)
            
            if real_fastest:
                # Convert real time if string
                if isinstance(real_fastest, str):
                    parts = real_fastest.split(':')
                    if len(parts) == 2:
                        real_fastest = int(parts[0]) * 60 + float(parts[1])
                
                difference = abs(sim_fastest - real_fastest)
                accuracy = max(0, 100 - (difference / real_fastest * 100))
                comparison['lap_time_accuracy'] = round(accuracy, 2)
                
                if accuracy > 95:
                    comparison['insights'].append('Excellent lap time realism!')
                elif accuracy > 85:
                    comparison['insights'].append('Good lap time accuracy')
                else:
                    comparison['insights'].append(f'Lap times off by {difference:.1f}s')
        
        # Compare DNFs
        if 'race_results' in simulated_results:
            sim_dnfs = sum(1 for r in simulated_results['race_results'] if r.get('status') != 'Finished')
            real_dnfs = sum(1 for r in real_race_data.get('results', []) if r.get('status') != 'Finished')
            
            comparison['dnf_comparison'] = {
                'simulated': sim_dnfs,
                'real': real_dnfs,
                'difference': abs(sim_dnfs - real_dnfs)
            }
        
        # Calculate overall realism score
        scores = [comparison['lap_time_accuracy']]
        comparison['realism_score'] = round(sum(scores) / len(scores), 2)
        
        return comparison


def get_real_driver_profile(driver_name: str, season: int = 2023) -> Dict:
    """Get complete real driver profile"""
    profile = {
        'name': driver_name,
        'skill': F1DataCalibration.get_driver_skill_from_real_data(driver_name, season),
        'aggression': 0.6,  # Default, could be calibrated from overtake stats
        'championship_position': None,
        'points': None,
        'wins': None
    }
    
    try:
        standings = ErgastAPI.get_driver_standings(season)
        for standing in standings:
            if driver_name.lower() in standing['driver'].lower():
                profile['championship_position'] = standing['position']
                profile['points'] = standing['points']
                profile['wins'] = standing['wins']
                profile['constructor'] = standing['constructor']
                break
    except:
        pass
    
    return profile

