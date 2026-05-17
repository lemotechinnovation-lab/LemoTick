# 🐳 Docker Commands Summary for macOS

Quick reference for all Docker commands needed to run LemoTick platform.

---

## 🚀 Easiest Way (Recommended)

```bash
# Start everything
./start-lemotick-mac.sh

# Stop everything
./stop-lemotick-mac.sh
```

---

## 📝 Step-by-Step Manual Commands

### 1️⃣ Start Database

```bash
cd backend
docker compose -f docker-compose.postgres.yml up -d
```

**Verify:**
```bash
docker ps | grep postgres
docker exec -it lemotick-investor-postgres pg_isready -U lemotick_user
```

---

### 2️⃣ Setup Database Schema

```bash
cd backend/API
dotnet ef database update
```

**Verify:**
```bash
dotnet ef migrations list
```

---

### 3️⃣ Start Backend API

```bash
cd backend/API
dotnet run
```

**Verify (in new terminal):**
```bash
curl -k https://localhost:5000/health
```

---

### 4️⃣ Start Frontend

```bash
cd admin-dashboard
npm install  # First time only
npm run dev
```

**Verify:**
Open http://localhost:5173 in browser

---

## 🐳 Docker Compose (All Services)

### Start All Services

```bash
# From project root
docker compose up -d
```

### View Logs

```bash
docker compose logs -f
```

### Stop All Services

```bash
docker compose down
```

### Complete Reset

```bash
docker compose down -v
```

---

## 🔍 Monitoring Commands

### Check Running Containers

```bash
docker ps
```

### Check All Containers (including stopped)

```bash
docker ps -a
```

### View Container Logs

```bash
# Database
docker logs -f lemotick-investor-postgres

# Backend (if running in Docker)
docker logs -f lemotick-backend

# Bot (if running in Docker)
docker logs -f lemotick-bot
```

### Check Container Health

```bash
docker inspect lemotick-investor-postgres --format='{{.State.Health.Status}}'
```

### View Resource Usage

```bash
docker stats
```

---

## 🛠️ Management Commands

### Restart Services

```bash
# Restart database
docker restart lemotick-investor-postgres

# Restart all
docker compose restart
```

### Stop Services

```bash
# Stop database
docker compose -f backend/docker-compose.postgres.yml stop

# Stop all
docker compose stop
```

### Remove Containers

```bash
# Remove specific container
docker rm -f lemotick-investor-postgres

# Remove all stopped containers
docker container prune
```

### Remove Volumes (Complete Data Reset)

```bash
# Remove specific volume
docker volume rm lemotick_investor_postgres_data

# Remove all unused volumes
docker volume prune
```

---

## 🔧 Database Commands

### Connect to Database

```bash
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb
```

### Run SQL Query

```bash
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "SELECT version();"
```

### Backup Database

```bash
docker exec -t lemotick-investor-postgres pg_dump -U lemotick_user InvestorManagementSystemDb > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
docker exec -i lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb < backup_20240101_120000.sql
```

### View Database Tables

```bash
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "\dt"
```

---

## 🐛 Troubleshooting Commands

### Check Docker is Running

```bash
docker info
```

### Find Process Using Port

```bash
# macOS
lsof -i :5000
lsof -i :5173
lsof -i :5433
```

### Kill Process on Port

```bash
# Find PID
lsof -t -i :5000

# Kill process
kill -9 $(lsof -t -i :5000)
```

### Check Docker Networks

```bash
docker network ls
docker network inspect lemotick-network
```

### Clean Up Everything

```bash
# Stop all containers
docker stop $(docker ps -aq)

# Remove all containers
docker rm $(docker ps -aq)

# Remove all volumes
docker volume prune -f

# Remove all networks
docker network prune -f

# Remove all images
docker image prune -a -f
```

---

## 🏗️ Build Commands

### Build Backend Image

```bash
cd backend
docker build -t lemotick-backend:latest -f Dockerfile .
```

### Build Bot Image

```bash
cd deployment/docker
docker build -t lemotick-bot:latest -f Dockerfile.bot ../../lemotickautostart
```

### Rebuild with No Cache

```bash
docker compose build --no-cache
```

---

## 📊 Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | Register first |
| Backend API | https://localhost:5000 | N/A |
| Swagger | https://localhost:5000/swagger | N/A |
| PgAdmin | http://localhost:5050 | admin@lemotick.com / admin123 |
| Database | localhost:5433 | lemotick_user / lemotick_secure_password_123 |

---

## 🎯 Common Workflows

### Daily Development

```bash
# Start
./start-lemotick-mac.sh

# Work on code...

# Stop
./stop-lemotick-mac.sh
```

### Reset Database

```bash
cd backend
docker compose -f docker-compose.postgres.yml down -v
docker compose -f docker-compose.postgres.yml up -d
sleep 10
cd API
dotnet ef database update
```

### Update Backend Code

```bash
# If running locally
cd backend/API
# Stop with Ctrl+C
dotnet run

# If running in Docker
docker compose build backend
docker compose up -d backend
```

### Update Frontend Code

```bash
# Frontend auto-reloads, no restart needed
# If needed:
cd admin-dashboard
# Stop with Ctrl+C
npm run dev
```

### View All Logs

```bash
# Terminal 1: Database
docker logs -f lemotick-investor-postgres

# Terminal 2: Backend
tail -f logs/backend.log

# Terminal 3: Frontend
tail -f logs/frontend.log
```

---

## 💡 Pro Tips

1. **Use Docker Desktop GUI** - Easier to manage containers visually
2. **Keep Docker Desktop running** - Required for all Docker commands
3. **Check logs first** - Most issues show up in logs
4. **Use health checks** - Verify services before testing
5. **Clean up regularly** - Remove unused containers/volumes

---

## 🆘 Emergency Commands

### Everything is Broken

```bash
# Nuclear option - reset everything
./stop-lemotick-mac.sh
cd backend
docker compose -f docker-compose.postgres.yml down -v
cd ..
rm -rf logs/*.log logs/*.pid
docker system prune -a -f
./start-lemotick-mac.sh
```

### Docker Desktop Issues

```bash
# Restart Docker Desktop
osascript -e 'quit app "Docker"'
sleep 5
open -a Docker
sleep 30
```

### Port Conflicts

```bash
# Kill all processes on LemoTick ports
kill -9 $(lsof -t -i :5000) 2>/dev/null
kill -9 $(lsof -t -i :5173) 2>/dev/null
kill -9 $(lsof -t -i :5433) 2>/dev/null
```

---

## 📚 More Help

- **[macOS Quick Start](MACOS_QUICKSTART.md)** - Detailed macOS guide
- **[Docker Setup Guide](DOCKER_SETUP_GUIDE.md)** - Complete Docker documentation
- **[Main README](README.md)** - Project overview

---

**Quick Start:** `./start-lemotick-mac.sh` 🚀
