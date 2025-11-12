"""
AI Track Designer - Procedural Track Generation
Generates tracks optimized for specific metrics using genetic algorithms
"""
import random
import json
from typing import List, Dict, Tuple, Optional
import copy


class TrackElement:
    """Track element for procedural generation"""
    
    def __init__(self, element_type: str, length: int, banking: int = 0, elevation: int = 0):
        self.type = element_type  # 'straight', 'corner-left', 'corner-right'
        self.length = length
        self.banking = banking
        self.elevation = elevation
        self.width = 15
        self.isDRS = False
        self.sectorNumber = None
    
    def to_dict(self, x: int = 0, y: int = 0) -> Dict:
        return {
            'id': f'element-{random.randint(1000000, 9999999)}',
            'type': self.type,
            'x': x,
            'y': y,
            'length': self.length,
            'width': self.width,
            'banking': self.banking,
            'elevation': self.elevation,
            'isDRS': self.isDRS,
            'sectorNumber': self.sectorNumber
        }
    
    def clone(self):
        return TrackElement(self.type, self.length, self.banking, self.elevation)


class TrackMetricsCalculator:
    """Calculate track metrics for optimization"""
    
    @staticmethod
    def calculate_metrics(elements: List[TrackElement]) -> Dict:
        if not elements:
            return {
                'totalLength': 0,
                'estimatedLapTime': 0,
                'difficultyScore': 0,
                'possibleOvertakes': 0,
                'safetyRating': 100,
                'elevationChange': 0,
                'cornerCount': 0,
                'straightCount': 0,
                'drsZoneCount': 0
            }
        
        total_length = sum(e.length for e in elements)
        corner_count = sum(1 for e in elements if 'corner' in e.type)
        straight_count = sum(1 for e in elements if e.type == 'straight')
        drs_count = sum(1 for e in elements if e.isDRS)
        
        elevations = [e.elevation for e in elements]
        elevation_change = max(elevations) - min(elevations)
        
        # Estimate lap time
        lap_time = 0
        for el in elements:
            if el.type == 'straight':
                lap_time += el.length / 50
                if el.isDRS:
                    lap_time -= el.length / 70
            else:
                corner_time = el.length / 30
                banking_reduction = el.banking * 0.01
                lap_time += corner_time * (1 - banking_reduction)
            lap_time += abs(el.elevation) * 0.05
        
        # Calculate difficulty
        difficulty = 0
        difficulty += corner_count * 2
        difficulty += (elevation_change / 10) * 3
        difficulty += (total_length / 1000) * 1
        difficulty -= drs_count * 2
        difficulty = max(0, min(100, difficulty))
        
        # Possible overtakes
        overtakes = 0
        for i in range(len(elements)):
            el = elements[i]
            next_el = elements[(i + 1) % len(elements)]
            
            if el.type == 'straight' and 'corner' in next_el.type:
                if el.length > 300:
                    overtakes += 1
                if el.isDRS:
                    overtakes += 1
            
            if 'corner' in el.type and el.banking < 5:
                overtakes += 0.5
        overtakes = int(overtakes)
        
        # Safety rating
        safety = 100
        for el in elements:
            if 'corner' in el.type and el.length > 200:
                safety -= 5
            if 'corner' in el.type and el.banking < 3:
                safety -= 3
            if abs(el.elevation) > 20:
                safety -= 4
        safety = max(0, min(100, safety))
        
        return {
            'totalLength': total_length,
            'estimatedLapTime': lap_time,
            'difficultyScore': difficulty,
            'possibleOvertakes': overtakes,
            'safetyRating': safety,
            'elevationChange': elevation_change,
            'cornerCount': corner_count,
            'straightCount': straight_count,
            'drsZoneCount': drs_count
        }


class TrackAIDesigner:
    """AI-powered track designer using genetic algorithms"""
    
    def __init__(self, target_metric: str, target_value: Optional[float] = None):
        """
        target_metric: 'overtakes', 'speed', 'difficulty', 'safety', 'balanced'
        target_value: optional specific value for metric
        """
        self.target_metric = target_metric
        self.target_value = target_value
        self.population_size = 20
        self.generations = 50
        self.mutation_rate = 0.2
    
    def generate_random_track(self, min_elements: int = 8, max_elements: int = 15) -> List[TrackElement]:
        """Generate a random valid track"""
        num_elements = random.randint(min_elements, max_elements)
        elements = []
        
        for i in range(num_elements):
            # Choose element type
            element_type = random.choice(['straight', 'straight', 'corner-left', 'corner-right'])
            
            # Set properties based on type
            if element_type == 'straight':
                length = random.randint(200, 800)
                banking = 0
            else:
                length = random.randint(100, 400)
                banking = random.randint(0, 25)
            
            elevation = random.randint(-30, 30)
            
            element = TrackElement(element_type, length, banking, elevation)
            elements.append(element)
        
        return elements
    
    def fitness_function(self, elements: List[TrackElement]) -> float:
        """Calculate fitness score based on target metric"""
        metrics = TrackMetricsCalculator.calculate_metrics(elements)
        
        if self.target_metric == 'overtakes':
            # Maximize overtaking opportunities
            score = metrics['possibleOvertakes'] * 20
            score += metrics['straightCount'] * 5
            score -= abs(metrics['difficultyScore'] - 50) * 0.5
            return score
        
        elif self.target_metric == 'speed':
            # Minimize lap time, maximize straights
            score = metrics['straightCount'] * 10
            score += sum(e.banking for e in elements if 'corner' in e.type) * 2
            score -= metrics['estimatedLapTime']
            score -= metrics['elevationChange'] * 0.2
            return score
        
        elif self.target_metric == 'difficulty':
            # Target specific difficulty or maximize
            target_diff = self.target_value if self.target_value else 80
            score = 100 - abs(metrics['difficultyScore'] - target_diff)
            score += metrics['cornerCount'] * 2
            score += metrics['elevationChange'] * 0.5
            return score
        
        elif self.target_metric == 'safety':
            # Maximize safety rating
            score = metrics['safetyRating']
            score -= metrics['difficultyScore'] * 0.3
            score += metrics['straightCount'] * 2
            return score
        
        elif self.target_metric == 'balanced':
            # Create well-balanced track
            score = 100
            # Prefer 4-6km tracks
            ideal_length = 5000
            score -= abs(metrics['totalLength'] - ideal_length) / 100
            # Prefer 4-6 overtaking points
            score -= abs(metrics['possibleOvertakes'] - 5) * 5
            # Prefer medium difficulty
            score -= abs(metrics['difficultyScore'] - 50) * 0.5
            # Prefer good safety
            score += (metrics['safetyRating'] - 60) * 0.3
            return score
        
        return 0
    
    def crossover(self, parent1: List[TrackElement], parent2: List[TrackElement]) -> List[TrackElement]:
        """Combine two parent tracks"""
        if len(parent1) < 2 or len(parent2) < 2:
            return parent1
        
        crossover_point = random.randint(1, min(len(parent1), len(parent2)) - 1)
        child = parent1[:crossover_point] + parent2[crossover_point:]
        
        # Ensure minimum length
        while len(child) < 6:
            child.append(self.generate_random_track(1, 1)[0])
        
        return child
    
    def mutate(self, elements: List[TrackElement]) -> List[TrackElement]:
        """Randomly mutate track elements"""
        mutated = [e.clone() for e in elements]
        
        for element in mutated:
            if random.random() < self.mutation_rate:
                # Mutate a random property
                mutation_type = random.choice(['length', 'banking', 'elevation', 'type', 'drs'])
                
                if mutation_type == 'length':
                    if element.type == 'straight':
                        element.length = random.randint(200, 800)
                    else:
                        element.length = random.randint(100, 400)
                
                elif mutation_type == 'banking':
                    element.banking = random.randint(0, 25)
                
                elif mutation_type == 'elevation':
                    element.elevation = random.randint(-30, 30)
                
                elif mutation_type == 'type':
                    element.type = random.choice(['straight', 'corner-left', 'corner-right'])
                
                elif mutation_type == 'drs' and element.type == 'straight':
                    element.isDRS = random.random() < 0.3
        
        return mutated
    
    def evolve(self) -> Tuple[List[TrackElement], Dict]:
        """Run genetic algorithm to evolve optimal track"""
        # Initialize population
        population = [self.generate_random_track() for _ in range(self.population_size)]
        
        best_track = None
        best_fitness = float('-inf')
        
        for generation in range(self.generations):
            # Calculate fitness for each track
            fitness_scores = [(track, self.fitness_function(track)) for track in population]
            fitness_scores.sort(key=lambda x: x[1], reverse=True)
            
            # Track best
            if fitness_scores[0][1] > best_fitness:
                best_fitness = fitness_scores[0][1]
                best_track = fitness_scores[0][0]
            
            # Selection - keep top 50%
            survivors = [track for track, _ in fitness_scores[:self.population_size // 2]]
            
            # Reproduction - create new generation
            new_population = survivors.copy()
            
            while len(new_population) < self.population_size:
                parent1 = random.choice(survivors)
                parent2 = random.choice(survivors)
                child = self.crossover(parent1, parent2)
                child = self.mutate(child)
                new_population.append(child)
            
            population = new_population
        
        # Add DRS zones to best track
        best_track = self.optimize_drs_zones(best_track)
        
        # Add sectors
        best_track = self.add_sectors(best_track)
        
        # Calculate final metrics
        final_metrics = TrackMetricsCalculator.calculate_metrics(best_track)
        
        return best_track, final_metrics
    
    def optimize_drs_zones(self, elements: List[TrackElement]) -> List[TrackElement]:
        """Add DRS zones to optimal locations"""
        optimized = [e.clone() for e in elements]
        
        # Add DRS to long straights before corners
        for i in range(len(optimized)):
            el = optimized[i]
            next_el = optimized[(i + 1) % len(optimized)]
            
            if el.type == 'straight' and el.length > 350 and 'corner' in next_el.type:
                el.isDRS = True
        
        return optimized
    
    def add_sectors(self, elements: List[TrackElement]) -> List[TrackElement]:
        """Divide track into 3 sectors"""
        sectored = [e.clone() for e in elements]
        
        sector_size = len(sectored) // 3
        
        for i, el in enumerate(sectored):
            if i < sector_size:
                el.sectorNumber = 1
            elif i < sector_size * 2:
                el.sectorNumber = 2
            else:
                el.sectorNumber = 3
        
        return sectored
    
    def position_elements(self, elements: List[TrackElement]) -> List[Dict]:
        """Position elements in 2D space for visualization"""
        positioned = []
        x, y = 400, 50
        angle = 90  # Start going down
        
        for element in elements:
            element_dict = element.to_dict(x, y)
            positioned.append(element_dict)
            
            # Calculate next position based on element type
            if element.type == 'straight':
                # Continue in current direction
                if angle == 90:  # Down
                    y += element.length / 5
                elif angle == 270:  # Up
                    y -= element.length / 5
                elif angle == 0:  # Right
                    x += element.length / 5
                else:  # Left
                    x -= element.length / 5
            
            elif element.type == 'corner-left':
                # Turn left
                angle = (angle - 90) % 360
                # Adjust position
                offset = element.length / 10
                if angle == 90:
                    y += offset
                elif angle == 270:
                    y -= offset
                elif angle == 0:
                    x += offset
                else:
                    x -= offset
            
            elif element.type == 'corner-right':
                # Turn right
                angle = (angle + 90) % 360
                offset = element.length / 10
                if angle == 90:
                    y += offset
                elif angle == 270:
                    y -= offset
                elif angle == 0:
                    x += offset
                else:
                    x -= offset
            
            # Keep within bounds
            x = max(50, min(750, x))
            y = max(50, min(550, y))
        
        return positioned


def generate_ai_track(target_metric: str, target_value: Optional[float] = None) -> Dict:
    """
    Generate optimized track using AI
    
    target_metric options:
    - 'overtakes': Maximize overtaking opportunities
    - 'speed': Fastest possible lap times
    - 'difficulty': High difficulty/technical track
    - 'safety': Maximum safety rating
    - 'balanced': Well-balanced all-around track
    """
    
    designer = TrackAIDesigner(target_metric, target_value)
    best_elements, metrics = designer.evolve()
    
    # Position elements for visualization
    positioned_elements = designer.position_elements(best_elements)
    
    # Generate track name based on characteristics
    track_names = {
        'overtakes': ['Overtaking Paradise', 'Battle Circuit', 'Racing Arena', 'Duel Track'],
        'speed': ['Speed Demon', 'Velocity Circuit', 'Straight Blast', 'Fast Lane'],
        'difficulty': ['Challenge Circuit', 'Technical Nightmare', 'Expert Track', 'Pro Circuit'],
        'safety': ['Safe Haven', 'Security Circuit', 'Protected Track', 'Guardian Loop'],
        'balanced': ['Perfect Balance', 'Harmony Circuit', 'Equilibrium Track', 'Balanced Beauty']
    }
    
    track_name = random.choice(track_names.get(target_metric, ['AI Generated Track']))
    
    return {
        'name': f"{track_name} (AI)",
        'elements': positioned_elements,
        'metrics': metrics,
        'difficulty': 'easy' if metrics['difficultyScore'] < 25 else 'medium' if metrics['difficultyScore'] < 50 else 'hard' if metrics['difficultyScore'] < 75 else 'extreme',
        'laps': 3,
        'generated_for': target_metric,
        'generation_stats': {
            'generations': designer.generations,
            'population_size': designer.population_size
        }
    }

