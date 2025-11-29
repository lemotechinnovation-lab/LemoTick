# 🐳 Docker Quick Commands - PostgreSQL Database

## ⚡ Essential Commands (Copy & Paste)

### Start Database
```bash
cd backend
docker compose -f docker-compose.postgres.yml up -d
```

### Stop Database
```bash
cd backend
docker compose -f docker-compose.postgres.yml stop
```

### Restart Database
```bash
cd backend
docker compose -f docker-compose.postgres.yml restart
```

### View Logs
```bash
cd backend
docker compose -f docker-compose.postgres.yml logs -f
```

### Check Status
```bash
docker ps | grep lemotick-investor-postgres
```

### Access Database CLI
```bash
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb
```

## 🔄 Complete Restart (If Issues)

```bash
cd backend
docker compose -f docker-compose.postgres.yml down
docker compose -f docker-compose.postgres.yml up -d
```

## 🗑️ Full Reset (Deletes All Data!)

```bash
cd backend
docker compose -f docker-compose.postgres.yml down -v
docker compose -f docker-compose.postgres.yml up -d
cd API
dotnet ef database update
```

## 💾 Backup Database

```bash
cd backend
docker exec -t lemotick-investor-postgres pg_dump -U lemotick_user InvestorManagementSystemDb > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 📥 Restore Database

```bash
cd backend
docker exec -i lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb < backup_20241115_120000.sql
```

## 🌐 Access PgAdmin (Web Interface)

```bash
# Make sure containers are running
cd backend
docker compose -f docker-compose.postgres.yml up -d

# Open browser to: http://localhost:5050
# Email: admin@lemotick.com
# Password: admin123
```

## 🧪 Test Connection

```bash
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "SELECT 1;"
```

## 📊 Common SQL Queries

```bash
# Count investors
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "SELECT COUNT(*) FROM \"Investors\";"

# List all tables
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "\dt"

# Check database size
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "SELECT pg_size_pretty(pg_database_size('InvestorManagementSystemDb'));"
```

## 🚨 Troubleshooting

### Port 5433 Already in Use
```bash
# Find what's using the port (Windows PowerShell)
Get-NetTCPConnection -LocalPort 5433

# Stop that process or change port in docker-compose.postgres.yml
```

### Container Won't Start
```bash
# View error logs
docker logs lemotick-investor-postgres

# Remove and recreate
cd backend
docker compose -f docker-compose.postgres.yml down
docker compose -f docker-compose.postgres.yml up -d
```

### Cannot Connect from API
```bash
# 1. Check container is running
docker ps | grep lemotick-investor-postgres

# 2. Test connection
docker exec -it lemotick-investor-postgres pg_isready -U lemotick_user

# 3. Restart API
cd backend/API
dotnet run
```

## 📋 Daily Workflow

```bash
# Morning - Start everything
cd backend
docker compose -f docker-compose.postgres.yml start
cd API
dotnet run

# Evening - Stop containers (optional, keeps data)
cd backend
docker compose -f docker-compose.postgres.yml stop
```

---

**For detailed documentation, see: DOCKER_DATABASE_GUIDE.md**

