# ✅ LemoTick Setup Checklist (macOS)

Use this checklist to ensure everything is properly set up.

---

## 📋 Pre-Setup Checklist

### System Requirements
- [ ] macOS operating system
- [ ] At least 8GB RAM available
- [ ] At least 20GB free disk space
- [ ] Internet connection

### Software Installation
- [ ] Docker Desktop installed
  - Download: https://www.docker.com/products/docker-desktop/
  - Or: `brew install --cask docker`
  - Verify: `docker --version`

- [ ] .NET 8.0 SDK installed
  - Install: `brew install dotnet@8`
  - Verify: `dotnet --version`

- [ ] Node.js 20+ installed
  - Install: `brew install node@20`
  - Verify: `node --version`

### Docker Desktop Configuration
- [ ] Docker Desktop is running (check menu bar icon)
- [ ] Docker has at least 4GB RAM allocated
  - Settings → Resources → Memory: 4GB+
- [ ] Docker has at least 4 CPUs allocated
  - Settings → Resources → CPUs: 4+

---

## 🚀 Setup Steps

### Step 1: Verify Scripts
- [ ] Scripts are executable
  ```bash
  ls -la start-lemotick-mac.sh stop-lemotick-mac.sh
  ```
  - Should show `-rwxr-xr-x` permissions
  - If not: `chmod +x start-lemotick-mac.sh stop-lemotick-mac.sh`

### Step 2: Create Logs Directory
- [ ] Logs directory exists
  ```bash
  mkdir -p logs
  ```

### Step 3: Start Services
- [ ] Run startup script
  ```bash
  ./start-lemotick-mac.sh
  ```

### Step 4: Verify Database
- [ ] Database container is running
  ```bash
  docker ps | grep lemotick-investor-postgres
  ```
  - Should show container with status "Up"

- [ ] Database is healthy
  ```bash
  docker exec -it lemotick-investor-postgres pg_isready -U lemotick_user
  ```
  - Should show "accepting connections"

### Step 5: Verify Backend
- [ ] Backend is running
  ```bash
  lsof -i :5000
  ```
  - Should show process on port 5000

- [ ] Backend health check passes
  ```bash
  curl -k https://localhost:5000/health
  ```
  - Should return "Healthy" status

- [ ] Swagger UI is accessible
  - Open: https://localhost:5000/swagger
  - Should show API documentation

### Step 6: Verify Frontend
- [ ] Frontend is running
  ```bash
  lsof -i :5173
  ```
  - Should show process on port 5173

- [ ] Frontend is accessible
  - Open: http://localhost:5173
  - Should show LemoTick dashboard

### Step 7: Verify PgAdmin (Optional)
- [ ] PgAdmin is accessible
  - Open: http://localhost:5050
  - Login: admin@lemotick.com / admin123

---

## 🧪 Functional Testing

### Test User Registration
- [ ] Navigate to http://localhost:5173
- [ ] Click "Register" or "Sign Up"
- [ ] Fill in registration form
- [ ] Submit registration
- [ ] Verify success message

### Test User Login
- [ ] Navigate to login page
- [ ] Enter credentials
- [ ] Submit login
- [ ] Verify redirect to dashboard

### Test API Endpoints
- [ ] Open Swagger: https://localhost:5000/swagger
- [ ] Try "Health" endpoint
- [ ] Try "Auth/Register" endpoint
- [ ] Try "Auth/Login" endpoint

### Test Database Connection
- [ ] Open PgAdmin: http://localhost:5050
- [ ] Add new server:
  - Name: LemoTick
  - Host: lemotick-investor-postgres
  - Port: 5432
  - Database: InvestorManagementSystemDb
  - Username: lemotick_user
  - Password: lemotick_secure_password_123
- [ ] Connect successfully
- [ ] View tables

---

## 📊 Monitoring Checklist

### Check Logs
- [ ] Backend logs are being written
  ```bash
  tail -f logs/backend.log
  ```

- [ ] Frontend logs are being written
  ```bash
  tail -f logs/frontend.log
  ```

- [ ] Database logs are accessible
  ```bash
  docker logs lemotick-investor-postgres
  ```

### Check Resource Usage
- [ ] Docker containers are not using excessive resources
  ```bash
  docker stats
  ```
  - CPU should be < 50% per container
  - Memory should be < 500MB per container

---

## 🐛 Troubleshooting Checklist

### If Database Won't Start
- [ ] Docker Desktop is running
- [ ] Port 5433 is not in use
  ```bash
  lsof -i :5433
  ```
- [ ] Restart database
  ```bash
  cd backend
  docker compose -f docker-compose.postgres.yml restart
  ```

### If Backend Won't Start
- [ ] Database is running and healthy
- [ ] Port 5000 is not in use
  ```bash
  lsof -i :5000
  ```
- [ ] Check backend logs
  ```bash
  cat logs/backend.log
  ```
- [ ] Database migrations applied
  ```bash
  cd backend/API
  dotnet ef database update
  ```

### If Frontend Won't Start
- [ ] Node modules installed
  ```bash
  cd admin-dashboard
  npm install
  ```
- [ ] Port 5173 is not in use
  ```bash
  lsof -i :5173
  ```
- [ ] Check frontend logs
  ```bash
  cat logs/frontend.log
  ```

### If Services Are Slow
- [ ] Docker has enough resources allocated
  - Settings → Resources → Increase RAM/CPU
- [ ] No other heavy applications running
- [ ] Disk space available
  ```bash
  df -h
  ```

---

## 🔒 Security Checklist

### Development Environment
- [ ] Using default credentials (OK for development)
- [ ] Running on localhost only
- [ ] Self-signed certificate (OK for development)

### Before Production
- [ ] Change all default passwords
- [ ] Use environment variables for secrets
- [ ] Proper SSL certificates
- [ ] Restrict CORS origins
- [ ] Enable rate limiting
- [ ] Set up proper authentication
- [ ] Regular security updates
- [ ] Database backups configured

---

## 📚 Documentation Checklist

### Read Documentation
- [ ] Read MACOS_QUICKSTART.md
- [ ] Bookmark DOCKER_COMMANDS_SUMMARY.md
- [ ] Review DOCKER_SETUP_GUIDE.md
- [ ] Understand ARCHITECTURE_OVERVIEW.md

### Understand System
- [ ] Know how to start services
- [ ] Know how to stop services
- [ ] Know how to view logs
- [ ] Know how to reset database
- [ ] Know where to find help

---

## ✅ Final Verification

### All Services Running
- [ ] Database: `docker ps | grep postgres` ✓
- [ ] Backend: `curl -k https://localhost:5000/health` ✓
- [ ] Frontend: Open http://localhost:5173 ✓
- [ ] PgAdmin: Open http://localhost:5050 ✓

### Can Perform Basic Operations
- [ ] Register new user ✓
- [ ] Login successfully ✓
- [ ] View dashboard ✓
- [ ] API responds to requests ✓

### Know How to Manage
- [ ] Can start services: `./start-lemotick-mac.sh` ✓
- [ ] Can stop services: `./stop-lemotick-mac.sh` ✓
- [ ] Can view logs: `tail -f logs/*.log` ✓
- [ ] Can troubleshoot issues ✓

---

## 🎉 Success!

If all items are checked, your LemoTick platform is fully set up and ready to use!

### Next Steps
1. Explore the frontend dashboard
2. Test API endpoints in Swagger
3. Create test portfolios and trades
4. Review the documentation for advanced features

### Quick Commands
```bash
# Start everything
./start-lemotick-mac.sh

# Stop everything
./stop-lemotick-mac.sh

# View logs
tail -f logs/backend.log logs/frontend.log

# Check status
docker ps
```

---

## 📞 Need Help?

If any items are not checked:
1. Review the troubleshooting section above
2. Check [MACOS_QUICKSTART.md](MACOS_QUICKSTART.md) → Troubleshooting
3. Check [DOCKER_COMMANDS_SUMMARY.md](DOCKER_COMMANDS_SUMMARY.md) → Troubleshooting
4. Review logs for error messages

---

**Last Updated:** 2025
**Platform:** macOS
**Docker Version:** Latest
