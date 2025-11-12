"""
Async Task Queue for Compute-Heavy Operations
Uses Celery with Redis for distributed task processing
"""
from celery import Celery
import os
import json

# Initialize Celery
celery_app = Celery(
    'racing_app',
    broker=os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes max
    worker_prefetch_multiplier=4,
    worker_max_tasks_per_child=1000,
)


@celery_app.task(name='tasks.simulate_race_async', bind=True)
def simulate_race_async(self, track_data, drivers, total_laps, weather='dry', safety_car_prob=0.05):
    """
    Asynchronous race simulation
    Runs in background worker for heavy computations
    """
    from race_simulator import RaceSimulator
    
    # Update progress
    self.update_state(state='PROGRESS', meta={'stage': 'initializing'})
    
    try:
        simulator = RaceSimulator(
            track_data=track_data,
            drivers=drivers,
            total_laps=total_laps,
            weather=weather,
            safety_car_prob=safety_car_prob
        )
        
        self.update_state(state='PROGRESS', meta={'stage': 'simulating'})
        
        results = simulator.simulate_race()
        
        return {
            'status': 'completed',
            'results': results
        }
        
    except Exception as e:
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise


@celery_app.task(name='tasks.generate_ai_track_async', bind=True)
def generate_ai_track_async(self, target_metric, target_value=None):
    """
    Asynchronous AI track generation
    Runs genetic algorithm in background
    """
    from track_ai_designer import generate_ai_track
    
    # Update progress through generations
    self.update_state(state='PROGRESS', meta={'stage': 'evolving', 'generation': 0})
    
    try:
        track_data = generate_ai_track(target_metric, target_value)
        
        return {
            'status': 'completed',
            'track': track_data
        }
        
    except Exception as e:
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise


@celery_app.task(name='tasks.train_ai_driver_async', bind=True)
def train_ai_driver_async(self, driver_id, num_races, track_data):
    """
    Asynchronous AI driver training
    Runs multiple race simulations for training
    """
    from ai_driver_rl import AIDriverRL
    
    try:
        # Load or create AI driver
        ai_driver = AIDriverRL.load_model(f'{driver_id}_model.pkl')
        
        for race_num in range(num_races):
            # Update progress
            progress = (race_num / num_races) * 100
            self.update_state(
                state='PROGRESS',
                meta={'stage': 'training', 'race': race_num + 1, 'progress': progress}
            )
            
            # Simulate training race
            # (simplified - actual implementation would run full simulation)
            mock_result = {
                'final_position': (race_num % 10) + 1,  # Simulated improvement
                'fastest_lap': 90 - (race_num * 0.1)
            }
            
            ai_driver.train_on_race(mock_result)
        
        # Save model
        ai_driver.save_model(f'{driver_id}_model.pkl')
        
        return {
            'status': 'completed',
            'statistics': ai_driver.get_statistics()
        }
        
    except Exception as e:
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise


@celery_app.task(name='tasks.batch_process_f1_data', bind=True)
def batch_process_f1_data(self, season, rounds):
    """
    Batch process F1 data for multiple races
    """
    from f1_data_integration import ErgastAPI
    
    results = []
    
    for round_num in rounds:
        progress = (rounds.index(round_num) / len(rounds)) * 100
        self.update_state(
            state='PROGRESS',
            meta={'stage': 'fetching', 'round': round_num, 'progress': progress}
        )
        
        try:
            race_data = ErgastAPI.get_race_results(season, round_num)
            results.append(race_data)
        except:
            results.append(None)
    
    return {
        'status': 'completed',
        'results': results
    }

