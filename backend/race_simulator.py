"""
Advanced Race Simulation Engine
Handles lap-by-lap race simulation with tire wear, pit stops, weather, and incidents
"""
import random
import json
from typing import List, Dict, Any, Tuple


class TireCompound:
    """Tire compound characteristics"""
    COMPOUNDS = {
        'soft': {'grip': 1.0, 'wear_rate': 1.5, 'optimal_laps': 15, 'name': 'Soft'},
        'medium': {'grip': 0.85, 'wear_rate': 1.0, 'optimal_laps': 25, 'name': 'Medium'},
        'hard': {'grip': 0.7, 'wear_rate': 0.6, 'optimal_laps': 40, 'name': 'Hard'},
        'intermediate': {'grip': 0.9, 'wear_rate': 0.8, 'optimal_laps': 30, 'name': 'Intermediate'},
        'wet': {'grip': 1.0, 'wear_rate': 0.5, 'optimal_laps': 35, 'name': 'Wet'},
    }


class Driver:
    def __init__(self, name: str, skill: float, aggression: float, car_number: int):
        self.name = name
        self.skill = skill  # 0.0-1.0
        self.aggression = aggression  # 0.0-1.0
        self.car_number = car_number
        self.position = 0
        self.lap_time = 0.0
        self.total_time = 0.0
        self.current_tire = 'medium'
        self.tire_age = 0
        self.tire_condition = 1.0
        self.pit_stops = 0
        self.incidents = []
        self.lap_times = []
        self.positions = []
        self.gaps = []
        self.is_retired = False
        self.retirement_reason = None
        
    def to_dict(self):
        return {
            'name': self.name,
            'car_number': self.car_number,
            'skill': self.skill,
            'aggression': self.aggression,
            'position': self.position,
            'total_time': round(self.total_time, 3),
            'pit_stops': self.pit_stops,
            'tire': self.current_tire,
            'is_retired': self.is_retired,
            'retirement_reason': self.retirement_reason,
        }


class RaceSimulator:
    def __init__(self, track_data: Dict, drivers: List[Dict], total_laps: int, 
                 weather: str = 'dry', safety_car_prob: float = 0.05):
        self.track_data = track_data
        self.total_laps = total_laps
        self.weather = weather
        self.weather_conditions = [weather]  # Track weather per lap
        self.safety_car_prob = safety_car_prob
        self.base_lap_time = track_data.get('metrics', {}).get('estimatedLapTime', 90.0)
        
        # Initialize drivers
        self.drivers = []
        for i, driver_data in enumerate(drivers):
            driver = Driver(
                name=driver_data['name'],
                skill=driver_data.get('skill', 0.7),
                aggression=driver_data.get('aggression', 0.5),
                car_number=i + 1
            )
            self.drivers.append(driver)
        
        # Race state
        self.current_lap = 0
        self.safety_car_active = False
        self.safety_car_laps = 0
        self.race_events = []
        self.commentary = []
        
        # Track characteristics
        self.track_length = track_data.get('metrics', {}).get('totalLength', 5000)
        self.difficulty = track_data.get('metrics', {}).get('difficultyScore', 50)
        self.overtake_difficulty = 100 - track_data.get('metrics', {}).get('possibleOvertakes', 3) * 10
        
    def simulate_race(self) -> Dict[str, Any]:
        """Run the complete race simulation"""
        self.add_commentary("🏁 Race Start!", "race_start")
        
        # Initialize grid positions
        random.shuffle(self.drivers)
        for i, driver in enumerate(self.drivers):
            driver.position = i + 1
            
        self.add_commentary(
            f"Grid: {', '.join([f'P{i+1} {d.name}' for i, d in enumerate(self.drivers)])}",
            "grid"
        )
        
        # Simulate each lap
        for lap in range(1, self.total_laps + 1):
            self.current_lap = lap
            self.simulate_lap()
            
            # Check for race finish
            if lap == self.total_laps:
                self.add_commentary(
                    f"🏁 {self.drivers[0].name} WINS THE RACE! 🏆",
                    "race_finish"
                )
        
        return self.generate_results()
    
    def simulate_lap(self):
        """Simulate a single lap for all drivers"""
        lap = self.current_lap
        
        # Update weather
        self.update_weather()
        
        # Check for safety car
        if not self.safety_car_active and random.random() < self.safety_car_prob:
            self.deploy_safety_car()
        elif self.safety_car_active:
            self.safety_car_laps += 1
            if self.safety_car_laps >= random.randint(2, 4):
                self.clear_safety_car()
        
        # Simulate each driver's lap
        active_drivers = [d for d in self.drivers if not d.is_retired]
        
        for driver in active_drivers:
            # Check for pit stop
            if self.should_pit(driver):
                self.execute_pit_stop(driver)
            
            # Calculate lap time
            lap_time = self.calculate_lap_time(driver)
            driver.lap_time = lap_time
            driver.total_time += lap_time
            driver.lap_times.append(lap_time)
            
            # Update tire condition
            self.update_tire_condition(driver)
            
            # Check for incidents
            self.check_for_incidents(driver)
        
        # Update positions based on total time
        active_drivers.sort(key=lambda d: d.total_time)
        for i, driver in enumerate(active_drivers):
            driver.position = i + 1
            driver.positions.append(i + 1)
            
            # Calculate gap to leader
            if i == 0:
                driver.gaps.append(0.0)
            else:
                gap = driver.total_time - active_drivers[0].total_time
                driver.gaps.append(gap)
        
        # Add retired drivers at the end
        retired_drivers = [d for d in self.drivers if d.is_retired]
        for driver in retired_drivers:
            driver.positions.append(len(active_drivers) + retired_drivers.index(driver) + 1)
            driver.gaps.append(999.0)
        
        # Attempt overtakes
        if not self.safety_car_active:
            self.simulate_overtakes(active_drivers)
        
        # Add lap summary to commentary
        if lap % 5 == 0 or lap == 1 or lap == self.total_laps:
            leader = active_drivers[0] if active_drivers else None
            if leader:
                gap_text = ""
                if len(active_drivers) > 1:
                    gap = active_drivers[1].total_time - leader.total_time
                    gap_text = f" leads by {gap:.1f}s"
                self.add_commentary(
                    f"Lap {lap}/{self.total_laps}: {leader.name}{gap_text}",
                    "lap_summary"
                )
    
    def calculate_lap_time(self, driver: Driver) -> float:
        """Calculate lap time based on driver, tire, weather, and track conditions"""
        base_time = self.base_lap_time
        
        # Driver skill effect (-5% to +5%)
        skill_factor = 1.0 - (driver.skill * 0.1 - 0.05)
        
        # Tire effect
        tire_data = TireCompound.COMPOUNDS[driver.current_tire]
        tire_grip = tire_data['grip']
        tire_factor = 1.0 / (tire_grip * driver.tire_condition)
        
        # Weather effect
        weather_factor = self.get_weather_factor(driver)
        
        # Safety car effect
        if self.safety_car_active:
            base_time *= 1.3  # 30% slower under safety car
        
        # Track difficulty
        difficulty_factor = 1.0 + (self.difficulty / 1000)
        
        # Random variation (0.5% to 1.5%)
        random_factor = random.uniform(0.995, 1.015)
        
        lap_time = base_time * skill_factor * tire_factor * weather_factor * difficulty_factor * random_factor
        
        return lap_time
    
    def update_tire_condition(self, driver: Driver):
        """Update tire wear"""
        driver.tire_age += 1
        tire_data = TireCompound.COMPOUNDS[driver.current_tire]
        wear_rate = tire_data['wear_rate']
        optimal_laps = tire_data['optimal_laps']
        
        # Tire condition degrades faster after optimal window
        if driver.tire_age <= optimal_laps:
            wear_per_lap = 0.02 * wear_rate
        else:
            # Accelerated wear after optimal window
            extra_laps = driver.tire_age - optimal_laps
            wear_per_lap = 0.02 * wear_rate * (1 + extra_laps * 0.05)
        
        # Aggression increases wear
        wear_per_lap *= (1 + driver.aggression * 0.2)
        
        # Weather effects
        if self.weather == 'rain' and driver.current_tire not in ['intermediate', 'wet']:
            wear_per_lap *= 2.0  # Wrong tires wear much faster
        
        driver.tire_condition = max(0.3, driver.tire_condition - wear_per_lap)
        
        # Warn about tire condition
        if driver.tire_condition < 0.5 and driver.tire_age % 5 == 0:
            self.add_commentary(
                f"{driver.name} struggling on {driver.tire_age}-lap old {driver.current_tire} tires",
                "tire_warning"
            )
    
    def should_pit(self, driver: Driver) -> bool:
        """Determine if driver should pit"""
        # Must pit at least once in race
        if driver.pit_stops == 0 and self.current_lap > self.total_laps * 0.7:
            return True
        
        # Tire condition critical
        if driver.tire_condition < 0.4:
            return True
        
        # Strategic window (random element)
        if driver.tire_age > 20 and random.random() < 0.2:
            return True
        
        # Weather change
        if self.weather == 'rain' and driver.current_tire not in ['intermediate', 'wet']:
            return True
        
        if self.weather == 'dry' and driver.current_tire in ['intermediate', 'wet']:
            return True
        
        return False
    
    def execute_pit_stop(self, driver: Driver):
        """Execute a pit stop"""
        # Choose new tire compound
        if self.weather == 'rain':
            new_tire = 'wet' if random.random() > 0.3 else 'intermediate'
        elif self.weather == 'variable':
            new_tire = random.choice(['soft', 'medium', 'intermediate'])
        else:
            # Dry conditions - choose based on race phase
            if self.current_lap < self.total_laps * 0.3:
                new_tire = random.choice(['medium', 'hard'])
            elif self.current_lap < self.total_laps * 0.7:
                new_tire = random.choice(['medium', 'soft', 'hard'])
            else:
                new_tire = random.choice(['soft', 'medium'])
        
        old_tire = driver.current_tire
        driver.current_tire = new_tire
        driver.tire_age = 0
        driver.tire_condition = 1.0
        driver.pit_stops += 1
        
        # Pit stop time loss (20-25 seconds)
        pit_time = random.uniform(20.0, 25.0)
        driver.total_time += pit_time
        
        self.add_commentary(
            f"Lap {self.current_lap}: {driver.name} pits! {old_tire} → {new_tire} (+{pit_time:.1f}s)",
            "pit_stop"
        )
    
    def simulate_overtakes(self, drivers: List[Driver]):
        """Simulate overtaking between nearby drivers"""
        for i in range(len(drivers) - 1):
            driver_behind = drivers[i + 1]
            driver_ahead = drivers[i]
            
            # Only attempt if close enough (within 2 seconds)
            gap = driver_ahead.total_time - driver_behind.total_time
            if abs(gap) > 2.0:
                continue
            
            # Overtake probability based on:
            # - Skill difference
            # - Aggression
            # - Tire condition difference
            # - Track overtake difficulty
            
            skill_diff = driver_behind.skill - driver_ahead.skill
            tire_diff = driver_behind.tire_condition - driver_ahead.tire_condition
            aggression_factor = driver_behind.aggression
            
            overtake_chance = (
                skill_diff * 0.3 +
                tire_diff * 0.3 +
                aggression_factor * 0.2 -
                self.overtake_difficulty / 200
            )
            
            # Random component
            overtake_chance += random.uniform(-0.1, 0.1)
            
            if overtake_chance > 0.3 and random.random() < overtake_chance:
                # Successful overtake - swap positions slightly
                time_advantage = random.uniform(0.3, 0.8)
                driver_behind.total_time -= time_advantage
                
                self.add_commentary(
                    f"Lap {self.current_lap}: {driver_behind.name} overtakes {driver_ahead.name}! 🏎️💨",
                    "overtake"
                )
    
    def check_for_incidents(self, driver: Driver):
        """Check for random incidents (crashes, mechanical failures)"""
        if driver.is_retired:
            return
        
        # Base incident probability (very low)
        incident_prob = 0.005
        
        # Increased by aggression
        incident_prob += driver.aggression * 0.01
        
        # Increased by poor tire condition
        if driver.tire_condition < 0.4:
            incident_prob += 0.02
        
        # Increased by weather
        if self.weather == 'rain':
            incident_prob += 0.015
        
        if random.random() < incident_prob:
            incident_type = random.choice([
                'spin', 'crash', 'mechanical', 'puncture', 'collision'
            ])
            
            if incident_type in ['crash', 'mechanical']:
                # Retirement
                driver.is_retired = True
                driver.retirement_reason = incident_type
                self.add_commentary(
                    f"Lap {self.current_lap}: {driver.name} OUT! {incident_type.upper()}! 💥",
                    "retirement"
                )
                # Chance of safety car
                if random.random() < 0.6:
                    self.deploy_safety_car()
            else:
                # Time penalty
                time_loss = random.uniform(5.0, 15.0)
                driver.total_time += time_loss
                self.add_commentary(
                    f"Lap {self.current_lap}: {driver.name} has a {incident_type}! (+{time_loss:.1f}s)",
                    "incident"
                )
    
    def update_weather(self):
        """Update weather conditions"""
        if self.weather == 'variable':
            # 10% chance of weather change each lap
            if random.random() < 0.1:
                old_weather = self.weather_conditions[-1]
                new_weather = random.choice(['dry', 'rain'])
                if new_weather != old_weather:
                    self.weather_conditions.append(new_weather)
                    self.add_commentary(
                        f"Lap {self.current_lap}: Weather change! Now {new_weather.upper()}! 🌧️" if new_weather == 'rain' else f"Lap {self.current_lap}: Track drying! ☀️",
                        "weather_change"
                    )
                    return
        
        self.weather_conditions.append(self.weather_conditions[-1] if self.weather_conditions else self.weather)
    
    def get_weather_factor(self, driver: Driver) -> float:
        """Get lap time factor based on weather and tire choice"""
        current_weather = self.weather_conditions[-1] if self.weather_conditions else self.weather
        
        if current_weather == 'dry':
            if driver.current_tire in ['intermediate', 'wet']:
                return 1.15  # Wrong tires in dry
            return 1.0
        elif current_weather == 'rain':
            if driver.current_tire == 'wet':
                return 1.05  # Optimal
            elif driver.current_tire == 'intermediate':
                return 1.08  # OK but not ideal
            else:
                return 1.25  # Dangerous in rain on slicks
        
        return 1.0
    
    def deploy_safety_car(self):
        """Deploy safety car"""
        if not self.safety_car_active:
            self.safety_car_active = True
            self.safety_car_laps = 0
            self.add_commentary(
                f"Lap {self.current_lap}: 🚨 SAFETY CAR DEPLOYED! 🚨",
                "safety_car"
            )
    
    def clear_safety_car(self):
        """Clear safety car"""
        self.safety_car_active = False
        self.add_commentary(
            f"Lap {self.current_lap}: 🟢 SAFETY CAR IN! Racing resumes! 🟢",
            "safety_car_in"
        )
    
    def add_commentary(self, text: str, event_type: str):
        """Add commentary and event"""
        self.commentary.append({
            'lap': self.current_lap,
            'text': text,
            'type': event_type
        })
    
    def generate_results(self) -> Dict[str, Any]:
        """Generate final race results"""
        # Sort by position
        self.drivers.sort(key=lambda d: (d.is_retired, d.total_time))
        
        results = []
        for i, driver in enumerate(self.drivers):
            if not driver.is_retired:
                result = {
                    'position': i + 1,
                    'driver': driver.name,
                    'car_number': driver.car_number,
                    'total_time': round(driver.total_time, 3),
                    'gap_to_leader': round(driver.total_time - self.drivers[0].total_time, 3) if i > 0 else 0.0,
                    'lap_times': [round(t, 3) for t in driver.lap_times],
                    'positions': driver.positions,
                    'gaps': [round(g, 3) for g in driver.gaps],
                    'pit_stops': driver.pit_stops,
                    'final_tire': driver.current_tire,
                    'status': 'Finished',
                }
            else:
                result = {
                    'position': i + 1,
                    'driver': driver.name,
                    'car_number': driver.car_number,
                    'total_time': round(driver.total_time, 3),
                    'gap_to_leader': 'DNF',
                    'lap_times': [round(t, 3) for t in driver.lap_times],
                    'positions': driver.positions,
                    'gaps': [round(g, 3) for g in driver.gaps],
                    'pit_stops': driver.pit_stops,
                    'final_tire': driver.current_tire,
                    'status': f'DNF - {driver.retirement_reason}',
                }
            results.append(result)
        
        # Race summary
        winner = self.drivers[0]
        fastest_lap = min([min(d.lap_times) for d in self.drivers if d.lap_times])
        fastest_lap_driver = next(d for d in self.drivers if d.lap_times and min(d.lap_times) == fastest_lap)
        
        return {
            'race_results': results,
            'winner': winner.name,
            'winning_time': round(winner.total_time, 3),
            'total_laps': self.total_laps,
            'fastest_lap': round(fastest_lap, 3),
            'fastest_lap_driver': fastest_lap_driver.name,
            'commentary': self.commentary,
            'safety_car_periods': sum(1 for c in self.commentary if c['type'] == 'safety_car'),
            'weather_summary': self.weather_conditions,
            'track_name': self.track_data.get('name', 'Unknown Track'),
        }

