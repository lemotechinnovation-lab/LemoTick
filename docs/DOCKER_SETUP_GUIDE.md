# 🐳 Complete Docker Setup Guide for LemoTick Platform (macOS)

This guide provides step-by-step Docker commands to run the entire LemoTick application stack on **macOS**.

## 📋 Prerequisites

Before starting, ensure you have installed:
- **Docker Desktop for Mac** (includes Docker Compose)
- **.NET 8.0 SDK** (for backend)
- **Node.js 20+** (for frontend)

### Installation on macOS

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop/
# Or use Homebrew:
brew install --cask docker

# Install .NET 8.0 SDK
brew install dotnet@8

# Install Node.js
brew install node@20

# Verify installations
docker --version
docker compose version
dotnet --version
node --version
npm --version
```

---

## 🍎 macOS Quick Start (Copy & Paste)

**Complete setup in 5 minutes:**

```bash
# 1. Ensure Docker Desktop is running (check menu bar icon)

# 2. Start database
cd backend
docker compose -f docker-compose.postgres.yml up -d

# 3. Wait for database to be ready (10 seconds)
sleep 10

# 4. Setup database schema
cd API
dotnet ef database update

# 5. Start backend API (in current terminal)
dotnet run &

# 6. Open new terminal and start frontend
cd ../../admin-dashboard
npm install
npm run dev
```

**Access your application:**
- Frontend: http://localhost:5173
- Backend API: https://localhost:5000
- Swagger Docs: https://localhost:5000/swagger
- PgAdmin: http://localhost:5050

---

## 🚀 Quick Start (All Components)

### Step 1: Start PostgreSQL Database

```bash
# Navigate to backend directory
cd backend

# Start PostgreSQL and PgAdmin containers
docker compose -f docker-compose.postgres.yml up -d

# Verify containers are running
docker ps

# Check database health
docker exec -it lemotick-investor-postgres pg_isready -U lemotick_user -d InvestorManagementSystemDb
```

**Expected Output:**
- Container `lemotick-investor-postgres` running on port 5433
- Container `lemotick-pgadmin` running on port 5050

**Wait 10 seconds** for database to fully initialize.

---

### Step 2: Setup Backend Database Schema

```bash
# Navigate to API project
cd API

# Run database migrations (creates tables)
dotnet ef database update

# Verify migration succeeded
dotnet ef migrations list
```

**Expected Output:**
- Migration applied successfully
- Tables created in database

---

### Step 3: Start Backend API

**Option A: Run Locally (Recommended for Development)**
```bash
# From backend/API directory
dotnet run
```

**Option B: Run with Docker**
```bash
# From backend directory
docker build -t lemotick-backend:latest -f Dockerfile .

docker run -d \
  --name lemotick-backend \
  --network lemotick-network \
  -p 5000:5000 \
  -p 5001:5001 \
  -e ConnectionStrings__DefaultConnection="Host=lemotick-investor-postgres;Port=5432;Database=InvestorManagementSystemDb;Username=lemotick_user;Password=lemotick_secure_password_123" \
  lemotick-backend:latest

# Check logs
docker logs -f lemotick-backend
```

> **macOS Note:** Docker Desktop must be running before executing Docker commands. Check the Docker icon in your menu bar.

**Access Points:**
- API: https://localhost:5000 or https://localhost:5001
- Swagger: https://localhost:5000/swagger
- Health Check: https://localhost:5000/health

---

### Step 4: Start Frontend (Admin Dashboard)

```bash
# Navigate to admin-dashboard directory
cd admin-dashboard

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Access Point:**
- Frontend: http://localhost:5173

---

### Step 5: Start Trading Bot (Optional)

```bash
# Navigate to deployment directory
cd deployment/docker

# Build bot image (macOS - use $PWD instead of $(pwd))
docker build -t lemotick-bot:latest -f Dockerfile.bot ../../lemotickautostart

# Run bot container
docker run -d \
  --name lemotick-bot \
  --network lemotick-network \
  -p 8080:8080 \
  -v $PWD/../../lemotickautostart/config:/app/config \
  -v $PWD/../../lemotickautostart/logs:/app/logs \
  lemotick-bot:latest

# Check logs
docker logs -f lemotick-bot
```

> **macOS Note:** Use `$PWD` for current directory path in volume mounts.

---

## 🎯 Complete Docker Compose Setup

For a unified setup, create this `docker-compose.yml` in the root directory:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: lemotick-investor-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: InvestorManagementSystemDb
      POSTGRES_USER: lemotick_user
      POSTGRES_PASSWORD: lemotick_secure_password_123
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - lemotick-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lemotick_user -d InvestorManagementSystemDb"]
      interval: 10s
      timeout: 5s
      retries: 5

  # PgAdmin (Database Management UI)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: lemotick-pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@lemotick.com
      PGADMIN_DEFAULT_PASSWORD: admin123
      PGADMIN_LISTEN_PORT: 80
    ports:
      - "5050:80"
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    networks:
      - lemotick-network
    depends_on:
      - postgres

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: lemotick-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
      - "5001:5001"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:5000;https://+:5001
      - ConnectionStrings__DefaultConnection=Host=postgres;Port=5432;Database=InvestorManagementSystemDb;Username=lemotick_user;Password=lemotick_secure_password_123
    networks:
      - lemotick-network
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Trading Bot
  bot:
    build:
      context: ./lemotickautostart
      dockerfile: ../deployment/docker/Dockerfile.bot
    container_name: lemotick-bot
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - ./lemotickautostart/config:/app/config
      - ./lemotickautostart/logs:/app/logs
    networks:
      - lemotick-network
    environment:
      - PYTHONPATH=/app/src/lemotickautostart
      - LOG_LEVEL=INFO

volumes:
  postgres_data:
    name: lemotick_investor_postgres_data
  pgadmin_data:
    name: lemotick_pgadmin_data

networks:
  lemotick-network:
    name: lemotick-network
    driver: bridge
```

### Using the Complete Docker Compose

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Check status
docker compose ps

# Stop all services
docker compose down

# Stop and remove volumes (complete reset)
docker compose down -v
```

---

## 📊 Service Access URLs

Once all services are running:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | N/A (register first) |
| **Backend API** | https://localhost:5000 | N/A |
| **Swagger Docs** | https://localhost:5000/swagger | N/A |
| **PgAdmin** | http://localhost:5050 | admin@lemotick.com / admin123 |
| **Database** | localhost:5433 | lemotick_user / lemotick_secure_password_123 |
| **Trading Bot** | http://localhost:8080 | N/A |

---

## 🔍 Verification Commands

### Check All Containers
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Check Database Connection
```bash
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "SELECT version();"
```

### Check Backend Health
```bash
curl -k https://localhost:5000/health
```

### View Container Logs
```bash
# Database logs
docker logs lemotick-investor-postgres

# Backend logs
docker logs lemotick-backend

# Bot logs
docker logs lemotick-bot

# Follow logs in real-time
docker logs -f lemotick-backend
```

---

## 🛠️ Management Commands

### Restart Services
```bash
# Restart database
docker restart lemotick-investor-postgres

# Restart backend
docker restart lemotick-backend

# Restart bot
docker restart lemotick-bot

# Restart all
docker compose restart
```

### Stop Services
```bash
# Stop specific service
docker stop lemotick-backend

# Stop all
docker compose stop
```

### Remove Containers
```bash
# Remove specific container
docker rm -f lemotick-backend

# Remove all containers
docker compose down

# Remove containers and volumes (complete cleanup)
docker compose down -v
```

### View Resource Usage
```bash
docker stats
```

---

## 🐛 Troubleshooting

### macOS-Specific Issues

**Problem:** "Cannot connect to Docker daemon"

**Solution:**
```bash
# Ensure Docker Desktop is running
open -a Docker

# Wait for Docker to start (check menu bar icon)
# Then retry your command
```

**Problem:** Permission denied errors

**Solution:**
```bash
# Docker Desktop on macOS handles permissions automatically
# If you see permission errors, restart Docker Desktop:
# Click Docker icon in menu bar → Restart

# Or reset Docker Desktop:
# Docker icon → Troubleshoot → Reset to factory defaults
```

**Problem:** Slow performance on macOS

**Solution:**
```bash
# Increase Docker Desktop resources:
# 1. Click Docker icon in menu bar
# 2. Go to Settings → Resources
# 3. Increase CPUs to 4+ and Memory to 8GB+
# 4. Click "Apply & Restart"
```

### Database Connection Issues

**Problem:** Backend can't connect to database

**Solution:**
```bash
# Check if database is running
docker ps | grep postgres

# Check database logs
docker logs lemotick-investor-postgres

# Restart database
docker restart lemotick-investor-postgres

# Wait 10 seconds and try again
```

### Port Already in Use

**Problem:** Port 5433 or 5000 already in use

**Solution (macOS):**
```bash
# Find process using port
lsof -i :5433
lsof -i :5000

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or change port in docker-compose.yml
# Example: Change "5433:5432" to "5434:5432"
```

### Backend Migration Errors

**Problem:** Database tables not created

**Solution:**
```bash
cd backend/API

# Drop and recreate database
dotnet ef database drop --force
dotnet ef database update

# Or reset everything
docker compose down -v
docker compose up -d
# Wait 10 seconds
cd backend/API
dotnet ef database update
```

### Container Won't Start

**Problem:** Container exits immediately

**Solution:**
```bash
# Check logs for errors
docker logs lemotick-backend

# Inspect container
docker inspect lemotick-backend

# Remove and recreate
docker rm -f lemotick-backend
docker compose up -d backend
```

### Frontend Can't Connect to Backend

**Problem:** API calls failing from frontend

**Solution:**
1. Check backend is running: `curl -k https://localhost:5000/health`
2. Check CORS settings in backend
3. Verify API URL in frontend config
4. Check browser console for errors

---

## 🔄 Update and Rebuild

### Rebuild After Code Changes

```bash
# Rebuild specific service
docker compose build backend
docker compose up -d backend

# Rebuild all services
docker compose build
docker compose up -d

# Force rebuild (no cache)
docker compose build --no-cache
docker compose up -d
```

### Update Database Schema

```bash
# Create new migration
cd backend/API
dotnet ef migrations add MigrationName

# Apply migration
dotnet ef database update

# If using Docker backend, restart container
docker restart lemotick-backend
```

---

## 💾 Backup and Restore

### Backup Database

```bash
# Create backup (macOS)
docker exec -t lemotick-investor-postgres pg_dump -U lemotick_user InvestorManagementSystemDb > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh backup_*.sql
```

### Restore Database

```bash
# Restore from backup (macOS)
docker exec -i lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb < backup_20240101_120000.sql
```

> **macOS Note:** Backups are saved in your current directory. Use `pwd` to check location.

---

## 🎯 Development Workflow

### Typical Development Session

```bash
# 1. Start infrastructure
docker compose up -d postgres pgadmin

# 2. Start backend (local for hot reload)
cd backend/API
dotnet watch run

# 3. Start frontend (local for hot reload)
cd admin-dashboard
npm run dev

# 4. Make changes and test

# 5. Stop everything when done
docker compose down
```

### Production Deployment

```bash
# 1. Build all images
docker compose build

# 2. Start all services
docker compose up -d

# 3. Check health
docker compose ps
curl -k https://localhost:5000/health

# 4. Monitor logs
docker compose logs -f
```

---

## 📝 Notes

- **Frontend** runs best locally with `npm run dev` for hot reload
- **Backend** can run locally or in Docker (local recommended for development)
- **Database** should always run in Docker
- **Bot** can run locally or in Docker

---

## 🆘 Getting Help

If you encounter issues:

1. Check container logs: `docker logs <container-name>`
2. Check container status: `docker ps -a`
3. Check network: `docker network inspect lemotick-network`
4. Review backend logs: `backend/API/logs/`
5. Check database connection: `docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb`

---

## ✅ Success Checklist

- [ ] Docker Desktop installed and running
- [ ] All containers started: `docker ps` shows 3+ containers
- [ ] Database healthy: `docker exec -it lemotick-investor-postgres pg_isready`
- [ ] Backend responding: `curl -k https://localhost:5000/health`
- [ ] Frontend accessible: http://localhost:5173
- [ ] PgAdmin accessible: http://localhost:5050
- [ ] No errors in logs: `docker compose logs`

---

**Ready to start? Run these commands:**

```bash
# Quick start (recommended)
cd backend
docker compose -f docker-compose.postgres.yml up -d
cd API
dotnet ef database update
dotnet run

# In another terminal
cd admin-dashboard
npm install
npm run dev
```

**Access your application at http://localhost:5173** 🎉
