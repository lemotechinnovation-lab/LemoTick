# 📚 LemoTick Docker Setup - Complete Guide Index

Your complete guide to running LemoTick platform with Docker on macOS.

---

## 🚀 Quick Start (Choose Your Path)

### 🍎 **I'm on macOS and want the easiest way**
→ **[macOS Quick Start](MACOS_QUICKSTART.md)**
- One command to start everything
- Automated setup script
- macOS-specific instructions

### ⚡ **I want to understand Docker commands**
→ **[Docker Commands Summary](DOCKER_COMMANDS_SUMMARY.md)**
- All Docker commands in one place
- Quick reference guide
- Common workflows

### 📖 **I want detailed Docker documentation**
→ **[Docker Setup Guide](DOCKER_SETUP_GUIDE.md)**
- Complete step-by-step instructions
- Troubleshooting section
- Advanced configurations

### 🏗️ **I want to understand the architecture**
→ **[Architecture Overview](ARCHITECTURE_OVERVIEW.md)**
- System architecture diagrams
- Data flow visualization
- Technology stack details

---

## 📋 What You'll Find in Each Guide

### [MACOS_QUICKSTART.md](MACOS_QUICKSTART.md)
```
✅ One-command startup
✅ macOS-specific setup
✅ Troubleshooting for Mac
✅ Default credentials
✅ Quick tips
```

**Best for:** First-time users on macOS who want to get started immediately.

---

### [DOCKER_COMMANDS_SUMMARY.md](DOCKER_COMMANDS_SUMMARY.md)
```
✅ All Docker commands
✅ Step-by-step manual setup
✅ Monitoring commands
✅ Management commands
✅ Emergency procedures
```

**Best for:** Developers who want command-line control and understanding.

---

### [DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md)
```
✅ Complete Docker setup
✅ docker-compose.yml explained
✅ Service configuration
✅ Detailed troubleshooting
✅ Backup and restore
```

**Best for:** Users who want comprehensive documentation and advanced features.

---

### [ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md)
```
✅ System architecture
✅ Container relationships
✅ Data flow diagrams
✅ Security architecture
✅ Resource requirements
```

**Best for:** Understanding how everything fits together.

---

## 🎯 Common Scenarios

### "I just want to run the app"
1. Read: [MACOS_QUICKSTART.md](MACOS_QUICKSTART.md)
2. Run: `./start-lemotick-mac.sh`
3. Open: http://localhost:5173

### "I need to debug an issue"
1. Check: [DOCKER_COMMANDS_SUMMARY.md](DOCKER_COMMANDS_SUMMARY.md) → Troubleshooting
2. View logs: `docker compose logs -f`
3. Check health: `curl -k https://localhost:5000/health`

### "I want to customize the setup"
1. Read: [DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md)
2. Edit: `docker-compose.yml`
3. Rebuild: `docker compose build`

### "I need to understand the system"
1. Read: [ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md)
2. Review: System diagrams
3. Explore: Technology stack

---

## 📁 File Structure

```
LemoTick/
├── 📄 MACOS_QUICKSTART.md           ← Start here (macOS users)
├── 📄 DOCKER_COMMANDS_SUMMARY.md    ← Command reference
├── 📄 DOCKER_SETUP_GUIDE.md         ← Complete guide
├── 📄 ARCHITECTURE_OVERVIEW.md      ← System architecture
├── 📄 DOCKER_SETUP_INDEX.md         ← This file
│
├── 🐳 docker-compose.yml            ← Complete stack config
├── 🚀 start-lemotick-mac.sh        ← Startup script
├── 🛑 stop-lemotick-mac.sh         ← Stop script
│
├── backend/
│   ├── docker-compose.postgres.yml  ← Database only
│   └── Dockerfile                   ← Backend image
│
└── deployment/
    └── docker/
        └── Dockerfile.bot           ← Bot image
```

---

## 🔧 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Docker Desktop** installed and running
  - Download: https://www.docker.com/products/docker-desktop/
  - Or: `brew install --cask docker`

- [ ] **.NET 8.0 SDK** installed
  - Install: `brew install dotnet@8`
  - Verify: `dotnet --version`

- [ ] **Node.js 20+** installed
  - Install: `brew install node@20`
  - Verify: `node --version`

- [ ] **Scripts executable**
  - Run: `chmod +x start-lemotick-mac.sh stop-lemotick-mac.sh`

---

## 🎓 Learning Path

### Beginner
1. Start with [MACOS_QUICKSTART.md](MACOS_QUICKSTART.md)
2. Run `./start-lemotick-mac.sh`
3. Explore the application
4. When issues arise, check troubleshooting section

### Intermediate
1. Read [DOCKER_COMMANDS_SUMMARY.md](DOCKER_COMMANDS_SUMMARY.md)
2. Practice individual Docker commands
3. Understand service dependencies
4. Learn to read logs and debug

### Advanced
1. Study [DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md)
2. Review [ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md)
3. Customize `docker-compose.yml`
4. Optimize for production

---

## 🆘 Getting Help

### Quick Fixes

| Problem | Solution |
|---------|----------|
| Docker not running | `open -a Docker` |
| Port in use | `lsof -i :5000` then `kill -9 <PID>` |
| Database won't start | `docker compose -f backend/docker-compose.postgres.yml restart` |
| Backend error | Check `logs/backend.log` |
| Frontend error | Check `logs/frontend.log` |

### Where to Look

1. **Startup issues** → [MACOS_QUICKSTART.md](MACOS_QUICKSTART.md) → Troubleshooting
2. **Docker issues** → [DOCKER_COMMANDS_SUMMARY.md](DOCKER_COMMANDS_SUMMARY.md) → Troubleshooting
3. **Configuration issues** → [DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md) → Configuration
4. **Architecture questions** → [ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md)

---

## 📊 Service URLs Reference

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Register first |
| **Backend API** | https://localhost:5000 | N/A |
| **Swagger Docs** | https://localhost:5000/swagger | N/A |
| **PgAdmin** | http://localhost:5050 | admin@lemotick.com / admin123 |
| **Database** | localhost:5433 | lemotick_user / lemotick_secure_password_123 |
| **Trading Bot** | http://localhost:8080 | N/A |

---

## 🎯 Common Commands

```bash
# Start everything
./start-lemotick-mac.sh

# Stop everything
./stop-lemotick-mac.sh

# View all logs
docker compose logs -f

# Check status
docker ps

# Reset database
docker compose -f backend/docker-compose.postgres.yml down -v

# Backend health check
curl -k https://localhost:5000/health

# Connect to database
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb
```

---

## 💡 Pro Tips

1. **Always start Docker Desktop first** - Check the menu bar icon
2. **Use the startup script** - It handles dependencies automatically
3. **Check logs when debugging** - Most issues show up in logs
4. **Keep Docker Desktop updated** - Latest version has best performance
5. **Allocate enough resources** - 4GB RAM, 4 CPUs minimum for Docker

---

## 🚀 Ready to Start?

### Absolute Beginner
```bash
./start-lemotick-mac.sh
```
Then open http://localhost:5173

### Want to Learn
Read [MACOS_QUICKSTART.md](MACOS_QUICKSTART.md) first, then run the script.

### Need Full Control
Read [DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md) and use manual commands.

---

## 📚 Additional Resources

- **[Main README](README.md)** - Project overview
- **[Backend README](backend/README.md)** - Backend API documentation
- **[Frontend README](admin-dashboard/README.md)** - Frontend documentation
- **[Deployment Guide](deployment/docs/DEPLOYMENT_GUIDE.md)** - VPS deployment

---

## ✅ Success Checklist

After running the startup script, verify:

- [ ] Docker Desktop is running (menu bar icon)
- [ ] Database container is running: `docker ps | grep postgres`
- [ ] Backend is responding: `curl -k https://localhost:5000/health`
- [ ] Frontend is accessible: Open http://localhost:5173
- [ ] No errors in logs: `tail logs/backend.log logs/frontend.log`
- [ ] Can register a new user in the frontend
- [ ] Can login successfully

---

## 🎉 You're All Set!

Choose your guide and get started:

- 🍎 **macOS users** → [MACOS_QUICKSTART.md](MACOS_QUICKSTART.md)
- ⚡ **Command reference** → [DOCKER_COMMANDS_SUMMARY.md](DOCKER_COMMANDS_SUMMARY.md)
- 📖 **Complete guide** → [DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md)
- 🏗️ **Architecture** → [ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md)

**Quick start:** `./start-lemotick-mac.sh` 🚀

---

*Last updated: 2025*
