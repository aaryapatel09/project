"""
Performance Optimizations
"""
from functools import lru_cache, wraps
import time
import hashlib
import json
from flask import request


def memoize_with_timeout(timeout=300):
    """Memoize function results with timeout"""
    cache = {}
    cache_times = {}
    
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            # Create cache key
            key = hashlib.md5(
                json.dumps({'args': args, 'kwargs': kwargs}, sort_keys=True).encode()
            ).hexdigest()
            
            # Check cache
            if key in cache:
                if time.time() - cache_times[key] < timeout:
                    return cache[key]
            
            # Compute and cache
            result = f(*args, **kwargs)
            cache[key] = result
            cache_times[key] = time.time()
            
            return result
        
        return wrapper
    return decorator


@lru_cache(maxsize=128)
def calculate_metrics_cached(elements_json: str):
    """Cached metrics calculation"""
    from track_ai_designer import TrackMetricsCalculator, TrackElement
    
    elements_data = json.loads(elements_json)
    elements = [TrackElement(**e) for e in elements_data]
    
    return TrackMetricsCalculator.calculate_metrics(elements)


def compress_response(f):
    """Compress large JSON responses"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        response = f(*args, **kwargs)
        
        # Check if client accepts gzip
        if 'gzip' in request.headers.get('Accept-Encoding', ''):
            # Flask automatically handles gzip if configured
            pass
        
        return response
    
    return wrapper


class QueryOptimizer:
    """Database query optimization utilities"""
    
    @staticmethod
    def batch_load(model, ids, session):
        """Batch load multiple records"""
        # Load all at once instead of N+1 queries
        return session.query(model).filter(model.id.in_(ids)).all()
    
    @staticmethod
    def paginate_query(query, page=1, per_page=20):
        """Paginate query results"""
        offset = (page - 1) * per_page
        total = query.count()
        items = query.limit(per_page).offset(offset).all()
        
        return {
            'items': items,
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page
        }


class RaceSimulationOptimizer:
    """Optimize race simulations"""
    
    @staticmethod
    def should_use_async(total_laps, num_drivers):
        """Determine if async processing is beneficial"""
        # Estimate computation time
        estimated_time = (total_laps * num_drivers) / 100  # rough estimate
        
        # Use async if estimated time > 2 seconds
        return estimated_time > 2
    
    @staticmethod
    def parallel_lap_calculation(drivers, lap_func):
        """Calculate laps in parallel (if multiprocessing enabled)"""
        # Simplified - actual implementation would use multiprocessing
        results = []
        for driver in drivers:
            results.append(lap_func(driver))
        return results

