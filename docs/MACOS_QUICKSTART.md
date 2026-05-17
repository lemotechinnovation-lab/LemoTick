# 🍎 LemoTick Platform - macOS Quick Start

The fastest way to get LemoTick running on your Mac.

## ⚡ Super Quick Start (1 Command)

```bash
./start-lemotick-mac.sh
```

That's it! The script will:
- ✅ Check Docker is running
- ✅ Start PostgreSQL database
- ✅ Setup database schema
- ✅ Start backend API
- ✅ Start frontend dashboard
- ✅ Open browser automatically

**Access your application at:** http://localhost:5173

---

## 🛑 Stop Everything

```bash
./stop-lemotick-mac.sh
```

---

## 📋 Prerequisites

### First Time Setup

1. **Install Docker Desktop for Mac**
   ```bash
   # Download from: https://www.docker.com/products/docker-desktop/
   # Or use Homebrew:
   brew install --cask docker
   ```

2. **Install .NET 8.0 SDK**
   ```bash
   brew install dotnet@8
   ```

3. **Install Node.js 20+**
   ```bash
   brew install node@20
   ```

4. **Make scripts executable** (already done if you cloned the repo)
   ```bash
   chmod +x start-lemotick-mac.sh stop-lemotick-mac.sh
   ```

---

## 🎯 What Gets Started

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Admin Dashboard (React) |
| **Backend API** | https://localhost:5000 | REST API (.NET) |
| **Swagger Docs** | https://localhost:5000/swagger | API Documentation |
| **PgAdmin** | http://localhost:5050 | Database Management |
| **Database** | localhost:5433 | PostgreSQL |

---

## 🔐 Default Credentials

### Database
- **Host:** localhost:5433
- **Database:** InvestorManagementSystemDb
- **Username:** lemotick_user
- **Password:** lemotick_secure_password_123

### PgAdmin
- **Email:** admin@lemotick.com
- **Password:** admin123

---

## 📊 View Logs

```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs
tail -f logs/frontend.log

# Database logs
docker logs -f lemotick-investor-postgres

# All Docker containers
docker compose -f backend/docker-compose.postgres.yml logs -f
```

---

## 🔧 Manual Control

### Start Individual Services

```bash
# Database only
cd backend
docker compose -f docker-compose.postgres.yml up -d

# Backend only
cd backend/API
dotnet run

# Frontend only
cd admin-dashboard
npm run dev
```

### Stop Individual Services

```bash
# Database
cd backend
docker compose -f docker-compose.postgres.yml down

# Backend (find and kill process)
lsof -t -i :5000 | xargs kill

# Frontend (find and kill process)
lsof -t -i :5173 | xargs kill
```

---

## 🐛 Troubleshooting

### Docker Not Running

```bash
# Open Docker Desktop
open -a Docker

# Wait 30 seconds, then try again
```

### Port Already in Use

```bash
# Find what's using the port
lsof -i :5000
lsof -i :5173
lsof -i :5433

# Kill the process (replace PID with actual number)
kill -9 <PID>
```

### Database Connection Failed

```bash
# Restart database
cd backend
docker compose -f docker-compose.postgres.yml restart

# Check database is healthy
docker exec -it lemotick-investor-postgres pg_isready -U lemotick_user
```

### Backend Won't Start

```bash
# Check logs
cat logs/backend.log

# Ensure database is running
docker ps | grep postgres

# Try manual start
cd backend/API
dotnet run
```

### Frontend Won't Start

```bash
# Check logs
cat logs/frontend.log

# Reinstall dependencies
cd admin-dashboard
rm -rf node_modules
npm install

# Try manual start
npm run dev
```

### Reset Everything

```bash
# Stop all services
./stop-lemotick-mac.sh

# Remove database volumes
cd backend
docker compose -f docker-compose.postgres.yml down -v

# Remove logs
rm -rf ../logs/*.log ../logs/*.pid

# Start fresh
cd ..
./start-lemotick-mac.sh
```

---

## 🚀 Using Docker Compose (Alternative)

If you prefer Docker Compose for everything:

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Complete reset
docker compose down -v
```

---

## 📚 More Documentation

- **[Complete Docker Guide](DOCKER_SETUP_GUIDE.md)** - Detailed Docker instructions
- **[Main README](README.md)** - Project overview
- **[Backend README](backend/README.md)** - Backend API documentation
- **[Frontend README](admin-dashboard/README.md)** - Frontend documentation

---

## ✅ Success Checklist

After running `./start-lemotick-mac.sh`, verify:

- [ ] Docker Desktop is running (check menu bar)
- [ ] Database container is running: `docker ps | grep postgres`
- [ ] Backend is responding: `curl -k https://localhost:5000/health`
- [ ] Frontend is accessible: Open http://localhost:5173
- [ ] No errors in logs: `tail logs/backend.log logs/frontend.log`

---

## 💡 Tips

1. **First run takes longer** - Dependencies need to be installed
2. **Browser certificate warning** - Click "Advanced" → "Proceed" (backend uses self-signed cert)
3. **Keep Docker Desktop running** - Required for database
4. **Check logs if issues** - Most problems show up in logs
5. **Use stop script** - Don't just close terminals, use `./stop-lemotick-mac.sh`

---

## 🎉 You're Ready!

Your LemoTick platform is now running. Visit http://localhost:5173 to get started!

**Need help?** Check the troubleshooting section above or see [DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md) for detailed instructions.
