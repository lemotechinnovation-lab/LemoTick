# Docker Container Rebuild Instructions

## Issue Fixed
**Missing Dependency:** The Docker container was missing the `aiohttp` package, which is required for the backend client integration.

## What Was Changed
Added `aiohttp>=3.9.0` to `bot/requirements.txt`:
```python
# API and HTTP
requests>=2.31.0
aiohttp>=3.9.0  # ← NEW: Required for backend client
```

## Rebuild Instructions

### Option 1: Full Rebuild (Recommended)
Rebuild the Docker image from scratch to ensure all dependencies are installed:

```bash
# Stop and remove existing containers
docker-compose down

# Remove old images to force rebuild
docker-compose rm -f
docker rmi lemotick-bot

# Rebuild and start fresh
docker-compose build --no-cache
docker-compose up -d
```

### Option 2: Quick Rebuild
If you just updated requirements.txt:

```bash
# Stop existing containers
docker-compose down

# Rebuild with cached layers
docker-compose build
docker-compose up -d
```

### Option 3: Background Rebuild
Rebuild without downtime (if you have other services running):

```bash
# Rebuild specific service
docker-compose build lemotick-bot

# Restart just the bot service
docker-compose up -d lemotick-bot
```

## Verify the Fix

### Check Container Logs
```bash
# View real-time logs
docker-compose logs -f lemotick-bot

# Check for errors
docker-compose logs lemotick-bot | grep -i error
```

### Expected Output
You should see successful startup without `ModuleNotFoundError`:
```
✅ [2025-10-25 12:XX:XX] INFO [LemoTick] Logger initialized successfully
✅ [2025-10-25 12:XX:XX] WARNING [LemoTick] Mean reversion strategy not available
✅ [2025-10-25 12:XX:XX] WARNING [LemoTick] scikit-learn not available, ML-based scoring disabled
✅ [2025-10-25 12:XX:XX] INFO [LemoTick] Starting LemoTick Bot...
✅ [2025-10-25 12:XX:XX] INFO [LemoTick] Validating account configuration...
```

### Verify Dependencies
Check that aiohttp is installed in the container:
```bash
docker-compose exec lemotick-bot pip list | grep aiohttp
```

Expected output:
```
aiohttp    3.9.x
```

## Complete Docker Commands Reference

### Start Services
```bash
# Start all services
docker-compose up -d

# Start and view logs
docker-compose up

# Start specific service
docker-compose up -d lemotick-bot
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop but keep volumes
docker-compose stop

# Stop specific service
docker-compose stop lemotick-bot
```

### View Status
```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs lemotick-bot

# Follow logs in real-time
docker-compose logs -f lemotick-bot

# View last 100 lines
docker-compose logs --tail=100 lemotick-bot
```

### Rebuild Commands
```bash
# Rebuild everything
docker-compose build

# Rebuild without cache
docker-compose build --no-cache

# Rebuild specific service
docker-compose build lemotick-bot

# Rebuild and start
docker-compose up -d --build
```

### Clean Up
```bash
# Remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Remove containers, volumes, and images
docker-compose down -v --rmi all

# Remove unused images
docker image prune -a
```

## Troubleshooting

### Container Keeps Restarting
```bash
# Check logs for errors
docker-compose logs lemotick-bot

# Check container status
docker-compose ps
```

### Build Fails
```bash
# Clear build cache
docker builder prune

# Rebuild without cache
docker-compose build --no-cache
```

### Dependencies Not Installing
```bash
# Check Python version in container
docker-compose exec lemotick-bot python --version

# Manually install in running container (temporary)
docker-compose exec lemotick-bot pip install aiohttp

# Check pip version
docker-compose exec lemotick-bot pip --version
```

### Network Issues
```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up -d
```

## Monitoring Stack

After rebuilding, verify all services are running:

```bash
# Check all containers
docker-compose ps

# Should show:
# - lemotick-bot (port 8000)
# - prometheus (port 9090)
# - grafana (port 3000)
# - loki (port 3100)
# - promtail
# - postgres (port 5433)
# - redis (port 6379)
```

### Access Services
- **Bot Metrics:** http://localhost:8000/metrics
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3000 (admin/admin)
- **PostgreSQL:** localhost:5433

## Updated Requirements.txt

The complete `bot/requirements.txt` now includes:

```python
# LemoTick Bot Requirements

# Core dependencies
websocket-client>=1.6.0
pyyaml>=6.0.0
python-dotenv>=1.0.0
pandas>=2.0.0
numpy>=1.24.0

# API and HTTP
requests>=2.31.0
aiohttp>=3.9.0          # ← NEW: For async HTTP in backend client

# Metrics and Monitoring  
prometheus-client>=0.17.0

# Database
sqlalchemy>=2.0.0

# Logging
structlog>=23.1.0
colorama>=0.4.6
```

## Next Steps

1. ✅ Rebuild Docker containers using commands above
2. ✅ Verify bot starts without errors
3. ✅ Check Grafana dashboard is accessible
4. ✅ Monitor logs for any issues
5. ✅ Test bot functionality in demo mode

## Quick Start After Rebuild

```bash
# Full clean rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Watch logs
docker-compose logs -f lemotick-bot

# Check all services
docker-compose ps
```

---

**Status:** Docker configuration fixed with aiohttp dependency ✅

**Action Required:** Rebuild Docker containers to apply changes

