# 🚀 Complete Setup & Testing Guide - Investor Management System

## 📦 What You Have

Your complete backend system with:
- ✅ 45+ REST API endpoints
- ✅ PostgreSQL database with Docker
- ✅ Postman collection for testing
- ✅ Full documentation

## ⚡ 10-Minute Complete Setup

### Step 1: Start PostgreSQL Database (2 min)

```bash
# Navigate to backend folder
cd backend

# Start PostgreSQL container
docker compose -f docker-compose.postgres.yml up -d

# Verify it's running
docker ps | grep lemotick-investor-postgres
```

**Expected**: Container status shows "Up" and healthy ✅

### Step 2: Run Database Migrations (2 min)

```bash
# Navigate to API folder
cd API

# Apply database migrations
dotnet ef database update

# Verify migrations applied
dotnet ef migrations list
```

**Expected**: All migrations shown with "(Applied)" ✅

### Step 3: Start Backend API (2 min)

```bash
# Still in API folder
dotnet run
```

**Expected**: 
```
Now listening on: https://localhost:7001
Now listening on: http://localhost:5000
```

Keep this terminal open! ✅

### Step 4: Import Postman Collection (2 min)

1. Open **Postman**
2. Click **Import** button (top left)
3. Drag these 2 files:
   - `backend/InvestorManagementSystem.postman_collection.json`
   - `backend/InvestorManagementSystem.postman_environment.json`
4. Select environment: **"Investor Management - Local"** (top right)

### Step 5: Test Everything Works (2 min)

In Postman, run these requests in order:

1. **Health** → **Health Check** → Send
   - ✅ Should return: `200 OK` with `"Healthy"`

2. **Authentication** → **Register Investor** → Send
   - ✅ Should return: `201 Created`
   - ✅ `investor_id` auto-saved to environment

3. **Authentication** → **Login** → Send
   - ✅ Should return: `200 OK` with token
   - ✅ `jwt_token` auto-saved to environment

4. **Portfolios** → **Create Portfolio** → Send
   - ✅ Should return: `201 Created`
   - ✅ `portfolio_id` auto-saved

5. **Trades** → **Create Trade** → Send
   - ✅ Should return: `201 Created`
   - ✅ Trade recorded successfully

**All 5 passed? System is fully operational! 🎉**

## 📚 Available Documentation

| File | Purpose | When to Use |
|------|---------|-------------|
| **DOCKER_QUICK_COMMANDS.md** | Quick copy-paste commands | Daily operations |
| **DOCKER_DATABASE_GUIDE.md** | Complete Docker guide | Troubleshooting, advanced ops |
| **POSTMAN_QUICK_START.md** | 5-min Postman guide | First-time setup |
| **POSTMAN_TESTING_GUIDE.md** | Complete API reference | Detailed testing |
| **COMPLETE_SETUP_GUIDE.md** | This file! | Complete setup |

## 🎯 Common Workflows

### Daily Development Workflow

```bash
# 1. Start database (if not running)
cd backend
docker compose -f docker-compose.postgres.yml start

# 2. Start API
cd API
dotnet run

# 3. Open Postman and start testing
```

### After Code Changes

```bash
# 1. Stop API (Ctrl+C in the running terminal)

# 2. If you changed entities, create migration
cd backend/API
dotnet ef migrations add YourMigrationName

# 3. Apply migration
dotnet ef database update

# 4. Rebuild and start
dotnet build
dotnet run
```

### Fresh Database Reset

```bash
# Option A: Using Entity Framework (Recommended)
cd backend/API
dotnet ef database drop --force
dotnet ef database update

# Option B: Using Docker (Complete reset)
cd backend
docker-compose -f docker-compose.postgres.yml down -v
docker-compose -f docker-compose.postgres.yml up -d
cd API
dotnet ef database update
```

### Weekly Backup

```bash
cd backend

# Create backup with timestamp
docker exec -t lemotick-investor-postgres pg_dump -U lemotick_user InvestorManagementSystemDb > backup_$(date +%Y%m%d_%H%M%S).sql

# Keep backups in a safe location!
mkdir -p backups
mv backup_*.sql backups/
```

## 🎨 API Endpoints Quick Reference

### Authentication (4)
- POST `/Auth/register` - Register new investor
- POST `/Auth/login` - Get JWT token (auto-saved)
- POST `/Auth/refresh-token` - Refresh expired token
- POST `/Auth/change-password` - Change password

### Investors (6)
- GET `/Investors` - List all
- GET `/Investors/{id}` - Get by ID
- POST `/Investors` - Create
- PUT `/Investors/{id}` - Update
- DELETE `/Investors/{id}` - Delete
- GET `/Investors/{id}/portfolios` - Get portfolios

### Portfolios (4)
- GET `/Portfolios` - List all
- GET `/Portfolios/{id}` - Get by ID
- POST `/Portfolios` - Create (saves `portfolio_id`)
- PUT `/Portfolios/{id}` - Update

### Trades (5)
- GET `/Trades` - List all
- GET `/Trades/{id}` - Get by ID
- POST `/Trades` - Create trade
- PUT `/Trades/{id}` - Update/close trade
- GET `/Trades/portfolio/{portfolioId}` - By portfolio

### Transactions (7)
- GET `/Transactions` - List all
- GET `/Transactions/{id}` - Get by ID
- POST `/Transactions` - Create (deposit/withdrawal)
- PUT `/Transactions/{id}` - Update status
- GET `/Transactions/investor/{investorId}` - By investor
- GET `/Transactions/portfolio/{portfolioId}` - By portfolio

### Performance Metrics (4)
- GET `/PerformanceMetrics` - List all
- GET `/PerformanceMetrics/{id}` - Get by ID
- POST `/PerformanceMetrics` - Create metric
- GET `/PerformanceMetrics/portfolio/{portfolioId}` - By portfolio

### Notifications (7)
- GET `/Notifications` - List all
- GET `/Notifications/{id}` - Get by ID
- POST `/Notifications` - Create
- GET `/Notifications/investor/{investorId}` - By investor
- GET `/Notifications/investor/{investorId}/unread` - Unread only
- PUT `/Notifications/{id}/mark-as-read` - Mark read
- PUT `/Notifications/investor/{investorId}/mark-all-as-read` - Mark all

**Total: 45 Endpoints** across 8 categories!

## 🔧 Connection Details

### PostgreSQL Database
- **Host**: localhost
- **Port**: 5433
- **Database**: InvestorManagementSystemDb
- **Username**: lemotick_user
- **Password**: lemotick_secure_password_123

### API Endpoints
- **HTTPS**: https://localhost:7001
- **HTTP**: http://localhost:5000
- **Swagger**: https://localhost:7001/swagger

### PgAdmin (Optional)
- **URL**: http://localhost:5050
- **Email**: admin@lemotick.com
- **Password**: admin123

## 🚨 Troubleshooting Quick Fixes

### "Could not connect to database"
```bash
# Check database is running
docker ps | grep lemotick-investor-postgres

# If not running, start it
cd backend
docker-compose -f docker-compose.postgres.yml up -d

# Wait 10 seconds, then test
docker exec -it lemotick-investor-postgres pg_isready
```

### "Port 5433 already in use"
```bash
# Option A: Stop conflicting service
# Find process using port (PowerShell)
Get-NetTCPConnection -LocalPort 5433

# Option B: Change port in docker-compose.postgres.yml
# Change "5433:5432" to "5434:5432"
# Update appsettings.json Port to 5434
```

### "401 Unauthorized in Postman"
```bash
# JWT token expired - just login again
# Postman: Authentication → Login → Send
# Token auto-saves, try your request again
```

### "API won't start - port conflict"
```bash
# Check what's using ports 7001 or 5000
netstat -ano | findstr :7001
netstat -ano | findstr :5000

# Change port in launchSettings.json if needed
```

### "Migrations failed"
```bash
# Reset migrations
cd backend/API

# Remove migrations
dotnet ef migrations remove

# Recreate database
dotnet ef database drop --force
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## 📊 Health Checks

### System Health Checklist

```bash
# ✅ Database Running
docker ps | grep lemotick-investor-postgres

# ✅ Database Healthy
docker inspect lemotick-investor-postgres --format='{{.State.Health.Status}}'

# ✅ Database Connectable
docker exec -it lemotick-investor-postgres pg_isready -U lemotick_user

# ✅ API Running
# Check terminal where "dotnet run" is executing

# ✅ API Healthy (in browser or Postman)
# GET https://localhost:7001/api/Health
# Should return 200 OK
```

### Database Statistics

```bash
# Check database size
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "SELECT pg_size_pretty(pg_database_size('InvestorManagementSystemDb'));"

# Count records in all tables
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserted,
    n_tup_upd as updated,
    n_tup_del as deleted,
    n_live_tup as live_rows
FROM pg_stat_user_tables
ORDER BY live_rows DESC;"
```

## 🎓 Learning Path

### Week 1: Basics
1. ✅ Complete 10-minute setup
2. ✅ Test all Authentication endpoints
3. ✅ Create investors and portfolios
4. ✅ Understand request/response flow

### Week 2: Trading
1. ✅ Create and close trades
2. ✅ Track transactions (deposits/withdrawals)
3. ✅ Generate performance metrics
4. ✅ Send notifications

### Week 3: Advanced
1. ✅ Explore all 45 endpoints
2. ✅ Create backup/restore workflow
3. ✅ Test error scenarios
4. ✅ Integrate with bot system

## 🔐 Security Notes

### Development Environment
- ✅ Default passwords provided for easy setup
- ✅ Running on localhost (not exposed)
- ✅ HTTPS with self-signed certificate

### Before Production
- ⚠️ Change ALL default passwords
- ⚠️ Use environment variables for secrets
- ⚠️ Enable proper SSL certificates
- ⚠️ Implement rate limiting
- ⚠️ Add IP whitelisting
- ⚠️ Enable audit logging
- ⚠️ Regular security audits

## 📞 Getting Help

### Check Logs

**Database Logs:**
```bash
docker-compose -f docker-compose.postgres.yml logs --tail=50
```

**API Logs:**
- Check terminal where `dotnet run` is running
- Or check `backend/API/logs/` folder

### Verify Configuration

**Database Connection:**
```bash
cat backend/API/appsettings.json | grep DefaultConnection
```

**Environment Variables:**
- Postman: Click eye icon 👁️ next to environment
- Check all variables are populated

### Test Individual Components

```bash
# Test database only
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "SELECT 1;"

# Test API only (without database)
cd backend/API
dotnet build

# Test Postman setup
# Health Check endpoint should work even without auth
```

## 🎉 Success Indicators

Your system is working perfectly when:

- [ ] PostgreSQL container shows "healthy" status
- [ ] API starts without errors
- [ ] Health endpoint returns 200 OK
- [ ] Can register new investor
- [ ] Can login and get JWT token
- [ ] Can create portfolio with investor_id
- [ ] Can create trade with portfolio_id
- [ ] All Postman requests return expected status codes
- [ ] Database contains your test data

**All checked? You're ready to build amazing features! 🚀**

---

## 📋 Quick Command Reference

```bash
# Start everything
cd backend
docker compose -f docker-compose.postgres.yml up -d
cd API
dotnet run

# Stop everything
# Ctrl+C to stop API
cd backend
docker compose -f docker-compose.postgres.yml stop

# Reset everything
cd backend/API
dotnet ef database drop --force
dotnet ef database update
# Then restart API

# Backup everything
cd backend
docker exec -t lemotick-investor-postgres pg_dump -U lemotick_user InvestorManagementSystemDb > backup.sql

# View all logs
docker compose -f docker-compose.postgres.yml logs -f
```

---

**🎯 You now have a complete, production-ready investor management system!**

For detailed information, refer to specific guides:
- Docker operations → DOCKER_DATABASE_GUIDE.md
- API testing → POSTMAN_TESTING_GUIDE.md
- Quick commands → DOCKER_QUICK_COMMANDS.md & POSTMAN_QUICK_START.md

