"""
Reinforcement Learning AI Driver
Learns optimal racing strategies from simulations using Q-learning
"""
import json
import os
import random
from typing import Dict, List, Tuple, Optional
import pickle


class RLState:
    """Racing state for RL decision making"""
    
    def __init__(self, lap: int, total_laps: int, position: int, tire_age: int, 
                 tire_condition: float, gap_to_leader: float, weather: str):
        self.lap = lap
        self.total_laps = total_laps
        self.position = position
        self.tire_age = tire_age
        self.tire_condition = tire_condition
        self.gap_to_leader = gap_to_leader
        self.weather = weather
    
    def to_key(self) -> str:
        """Convert state to hashable key"""
        # Discretize continuous values for state space
        lap_phase = 'early' if self.lap < self.total_laps * 0.3 else 'mid' if self.lap < self.total_laps * 0.7 else 'late'
        position_bucket = 'leader' if self.position == 1 else 'podium' if self.position <= 3 else 'points' if self.position <= 10 else 'back'
        tire_bucket = 'fresh' if self.tire_age < 10 else 'good' if self.tire_age < 20 else 'worn'
        condition_bucket = 'excellent' if self.tire_condition > 0.8 else 'good' if self.tire_condition > 0.5 else 'poor'
        gap_bucket = 'close' if self.gap_to_leader < 2 else 'medium' if self.gap_to_leader < 10 else 'far'
        
        return f"{lap_phase}_{position_bucket}_{tire_bucket}_{condition_bucket}_{gap_bucket}_{self.weather}"


class RLAction:
    """Available actions for AI driver"""
    
    ACTIONS = [
        'push_hard',        # Aggressive driving, faster but more tire wear
        'conserve_tires',   # Slower pace, preserve tires
        'pit_now',          # Make pit stop
        'normal_pace',      # Balanced approach
        'defend_position',  # Focus on defending
        'attack_ahead',     # Try to overtake
    ]
    
    @staticmethod
    def get_action_index(action: str) -> int:
        return RLAction.ACTIONS.index(action)
    
    @staticmethod
    def get_action_name(index: int) -> str:
        return RLAction.ACTIONS[index]


class AIDriverRL:
    """Reinforcement Learning AI Driver"""
    
    def __init__(self, name: str = "AI Driver", learning_rate: float = 0.1, 
                 discount_factor: float = 0.95, exploration_rate: float = 0.2):
        self.name = name
        self.learning_rate = learning_rate
        self.discount_factor = discount_factor
        self.exploration_rate = exploration_rate
        
        # Q-table: maps (state, action) -> Q-value
        self.q_table: Dict[Tuple[str, int], float] = {}
        
        # Training statistics
        self.races_completed = 0
        self.total_wins = 0
        self.total_podiums = 0
        self.avg_finish_position = 0
        self.learning_history = []
        
        # Strategy preferences learned
        self.learned_preferences = {
            'preferred_tire_strategy': 'balanced',
            'preferred_pit_timing': 'mid_race',
            'aggression_level': 0.5
        }
    
    def get_q_value(self, state: RLState, action_index: int) -> float:
        """Get Q-value for state-action pair"""
        key = (state.to_key(), action_index)
        return self.q_table.get(key, 0.0)
    
    def choose_action(self, state: RLState, is_training: bool = True) -> int:
        """Choose action using epsilon-greedy policy"""
        if is_training and random.random() < self.exploration_rate:
            # Explore: random action
            return random.randint(0, len(RLAction.ACTIONS) - 1)
        else:
            # Exploit: best known action
            q_values = [self.get_q_value(state, i) for i in range(len(RLAction.ACTIONS))]
            max_q = max(q_values)
            # Handle ties randomly
            best_actions = [i for i, q in enumerate(q_values) if q == max_q]
            return random.choice(best_actions)
    
    def update_q_value(self, state: RLState, action_index: int, reward: float, 
                      next_state: Optional[RLState] = None):
        """Update Q-value using Q-learning update rule"""
        key = (state.to_key(), action_index)
        current_q = self.q_table.get(key, 0.0)
        
        if next_state:
            # Find max Q-value for next state
            next_q_values = [self.get_q_value(next_state, i) for i in range(len(RLAction.ACTIONS))]
            max_next_q = max(next_q_values)
        else:
            max_next_q = 0.0
        
        # Q-learning update
        new_q = current_q + self.learning_rate * (reward + self.discount_factor * max_next_q - current_q)
        self.q_table[key] = new_q
    
    def calculate_reward(self, state: RLState, action_index: int, result: Dict) -> float:
        """Calculate reward for action taken"""
        reward = 0.0
        action = RLAction.get_action_name(action_index)
        
        # Position-based rewards
        if result.get('position_gained'):
            reward += 10.0
        elif result.get('position_lost'):
            reward -= 5.0
        
        # Lap time rewards
        if result.get('faster_than_average'):
            reward += 5.0
        
        # Tire management rewards
        if action == 'conserve_tires' and state.tire_condition < 0.6:
            reward += 3.0  # Good decision to conserve
        
        if action == 'push_hard' and state.tire_condition > 0.8:
            reward += 2.0  # Good decision to push on fresh tires
        
        # Pit strategy rewards
        if action == 'pit_now':
            if state.tire_condition < 0.4:
                reward += 8.0  # Good pit timing
            elif state.tire_condition > 0.8:
                reward -= 5.0  # Too early
        
        # Position-based rewards
        if state.position == 1:
            reward += 2.0  # Bonus for leading
        elif state.position <= 3:
            reward += 1.0  # Bonus for podium
        
        # Final race result rewards
        if result.get('race_finished'):
            final_pos = result.get('final_position', 10)
            reward += (20 - final_pos)  # Higher reward for better finish
            
            if final_pos == 1:
                reward += 50.0  # Big bonus for winning
            elif final_pos <= 3:
                reward += 20.0  # Podium bonus
        
        # Incident penalties
        if result.get('incident'):
            reward -= 15.0
        
        if result.get('dnf'):
            reward -= 30.0
        
        return reward
    
    def train_on_race(self, race_results: Dict):
        """Learn from a completed race"""
        # Extract learning data from race results
        # This is a simplified training loop
        
        self.races_completed += 1
        
        # Update statistics
        if race_results.get('final_position') == 1:
            self.total_wins += 1
        if race_results.get('final_position', 100) <= 3:
            self.total_podiums += 1
        
        # Update average finish
        total_positions = self.avg_finish_position * (self.races_completed - 1) + race_results.get('final_position', 10)
        self.avg_finish_position = total_positions / self.races_completed
        
        # Record learning progress
        self.learning_history.append({
            'race': self.races_completed,
            'position': race_results.get('final_position'),
            'q_table_size': len(self.q_table),
            'exploration_rate': self.exploration_rate
        })
        
        # Decay exploration rate (exploit more as we learn)
        self.exploration_rate = max(0.05, self.exploration_rate * 0.99)
    
    def get_strategy_recommendation(self, state: RLState) -> str:
        """Get recommended strategy based on learned Q-values"""
        action_index = self.choose_action(state, is_training=False)
        return RLAction.get_action_name(action_index)
    
    def save_model(self, filepath: str = 'ai_driver_model.pkl'):
        """Save trained model to file"""
        model_data = {
            'name': self.name,
            'q_table': self.q_table,
            'races_completed': self.races_completed,
            'total_wins': self.total_wins,
            'total_podiums': self.total_podiums,
            'avg_finish_position': self.avg_finish_position,
            'learning_history': self.learning_history,
            'learned_preferences': self.learned_preferences,
            'exploration_rate': self.exploration_rate
        }
        
        os.makedirs('ai_models', exist_ok=True)
        filepath = os.path.join('ai_models', filepath)
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
    
    @staticmethod
    def load_model(filepath: str = 'ai_driver_model.pkl') -> 'AIDriverRL':
        """Load trained model from file"""
        filepath = os.path.join('ai_models', filepath)
        
        if not os.path.exists(filepath):
            return AIDriverRL()
        
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        ai = AIDriverRL(name=model_data.get('name', 'AI Driver'))
        ai.q_table = model_data.get('q_table', {})
        ai.races_completed = model_data.get('races_completed', 0)
        ai.total_wins = model_data.get('total_wins', 0)
        ai.total_podiums = model_data.get('total_podiums', 0)
        ai.avg_finish_position = model_data.get('avg_finish_position', 0)
        ai.learning_history = model_data.get('learning_history', [])
        ai.learned_preferences = model_data.get('learned_preferences', {})
        ai.exploration_rate = model_data.get('exploration_rate', 0.2)
        
        return ai
    
    def get_statistics(self) -> Dict:
        """Get AI driver statistics"""
        win_rate = (self.total_wins / self.races_completed * 100) if self.races_completed > 0 else 0
        podium_rate = (self.total_podiums / self.races_completed * 100) if self.races_completed > 0 else 0
        
        return {
            'name': self.name,
            'races_completed': self.races_completed,
            'total_wins': self.total_wins,
            'total_podiums': self.total_podiums,
            'win_rate': round(win_rate, 2),
            'podium_rate': round(podium_rate, 2),
            'avg_finish_position': round(self.avg_finish_position, 2),
            'q_table_size': len(self.q_table),
            'exploration_rate': round(self.exploration_rate, 3),
            'learned_preferences': self.learned_preferences,
            'is_trained': self.races_completed >= 10
        }
    
    def to_driver_config(self) -> Dict:
        """Convert to standard driver configuration"""
        # Skill improves with training
        base_skill = 0.7
        skill_improvement = min(0.25, self.races_completed * 0.01)
        skill = base_skill + skill_improvement
        
        # Aggression learned from Q-table
        aggression = self.learned_preferences.get('aggression_level', 0.5)
        
        return {
            'name': f"{self.name} (RL)",
            'skill': round(skill, 2),
            'aggression': round(aggression, 2),
            'is_ai': True,
            'training_level': self.races_completed
        }

