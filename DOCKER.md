# Docker Guide

Complete guide for running the Racing App with Docker.

## Quick Start

### Development Mode
```bash
docker-compose up --build
```

### Production Mode
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

## Architecture

### Multi-Stage Builds

Both frontend and backend use multi-stage Docker builds for optimal image sizes:

#### Frontend Stages
1. **Development**: Hot-reload enabled, development dependencies included
2. **Build**: Compiles TypeScript and bundles assets
3. **Production**: Serves static files with Nginx, minimal image size

#### Backend Stages
1. **Development**: Flask development server with auto-reload
2. **Production**: Gunicorn WSGI server with 4 workers

## Development Configuration

### docker-compose.yml

Services:
- **backend**: Flask API on port 5000
- **frontend**: Vite dev server on port 3000

Features:
- Volume mounting for hot-reload
- Automatic restart on crashes
- Bridge networking between services

### Commands

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild images
docker-compose build

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Execute commands in running container
docker-compose exec backend bash
docker-compose exec frontend sh

# Scale services (not recommended for this app)
docker-compose up --scale backend=2
```

## Production Configuration

### docker-compose.prod.yml

Differences from development:
- Nginx serves frontend on port 80
- Gunicorn runs backend with 4 workers
- No volume mounting
- Health checks enabled
- Always restart policy

### Health Checks

Both services include health checks:
- **Backend**: Checks `/api/health` endpoint
- **Frontend**: Checks root `/` endpoint

Configuration:
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3
- Start period: 40 seconds

### Production Commands

```bash
# Start production services
docker-compose -f docker-compose.prod.yml up -d

# View status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop services
docker-compose -f docker-compose.prod.yml down
```

## Building Individual Images

### Backend
```bash
cd backend

# Development image
docker build --target development -t racing-backend:dev .

# Production image
docker build --target production -t racing-backend:prod .

# Run standalone
docker run -p 5000:5000 racing-backend:dev
```

### Frontend
```bash
cd frontend

# Development image
docker build --target development -t racing-frontend:dev .

# Production image
docker build --target production -t racing-frontend:prod .

# Run standalone (development)
docker run -p 3000:3000 racing-frontend:dev

# Run standalone (production)
docker run -p 80:80 racing-frontend:prod
```

## Environment Variables

### Backend

Development:
- `FLASK_APP=app.py`
- `FLASK_ENV=development`
- `FLASK_DEBUG=True`

Production:
- `FLASK_APP=app.py`
- `FLASK_ENV=production`

### Frontend

Development:
- `VITE_API_URL=http://localhost:5000`

Production:
- API proxied through Nginx (no env var needed)

## Networking

### Development Network

Services communicate via Docker bridge network named `racing-network`.

Internal URLs:
- Backend: `http://backend:5000`
- Frontend: `http://frontend:3000`

External URLs:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

### Production Network

Same network setup, but:
- Frontend served on port 80
- Nginx proxies `/api` to backend
- Frontend makes API calls to same origin

## Volumes

### Development Volumes

```yaml
frontend:
  volumes:
    - ./frontend:/app           # Source code hot-reload
    - /app/node_modules         # Anonymous volume for dependencies

backend:
  volumes:
    - ./backend:/app            # Source code hot-reload
```

### Production Volumes

No volumes mounted - images are self-contained.

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change ports in docker-compose.yml
ports:
  - "3001:3000"  # Host:Container
```

### Container Keeps Restarting

```bash
# Check logs
docker-compose logs backend

# Check container status
docker ps -a

# Remove and rebuild
docker-compose down
docker-compose up --build
```

### Frontend Can't Connect to Backend

Development:
- Check if backend is running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`
- Verify network: `docker network inspect project_racing-network`

Production:
- Check Nginx configuration
- Verify backend health: `curl http://localhost:5000/api/health`

### Build Failures

```bash
# Clean build cache
docker-compose build --no-cache

# Remove all containers and images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose up --build --force-recreate
```

### Permission Issues

Linux users may encounter permission issues:

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again
```

## Optimization Tips

### Image Size Reduction

1. Use `.dockerignore` files
2. Multi-stage builds (already implemented)
3. Minimize layers
4. Use alpine base images where possible

### Build Speed

```bash
# Use BuildKit
DOCKER_BUILDKIT=1 docker-compose build

# Cache dependencies
# (Already optimized with layer ordering)
```

### Production Performance

Backend:
- Gunicorn workers = 2-4 × CPU cores
- Adjust in `backend/Dockerfile`

Frontend:
- Nginx gzip compression enabled
- Static asset caching configured
- SPA fallback routing setup

## Security Considerations

### Production Checklist

- [ ] Use specific image versions (not `latest`)
- [ ] Scan images for vulnerabilities: `docker scan <image>`
- [ ] Don't run as root user
- [ ] Use secrets for sensitive data
- [ ] Enable HTTPS (add SSL certificates)
- [ ] Restrict network access
- [ ] Regular security updates

### Example: Running as Non-Root User

```dockerfile
# Add to Dockerfile
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build Docker Images

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build images
        run: docker-compose build
      - name: Run tests
        run: docker-compose run backend pytest
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Multi-stage Builds](https://docs.docker.com/develop/develop-images/multistage-build/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)

