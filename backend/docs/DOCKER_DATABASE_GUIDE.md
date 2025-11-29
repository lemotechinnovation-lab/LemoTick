# 🐳 PostgreSQL Docker Database Guide

## 📦 Overview

This guide covers managing the PostgreSQL database container for the Investor Management System.

### Configuration Details
- **Database**: PostgreSQL 16 (Alpine)
- **Host**: localhost
- **Port**: 5433 (mapped from container's 5432)
- **Database Name**: InvestorManagementSystemDb
- **Username**: lemotick_user
- **Password**: lemotick_secure_password_123
- **Container Name**: lemotick-investor-postgres

## 🚀 Quick Start

### 1. Start PostgreSQL Container

```bash
# Navigate to backend directory
cd backend

# Start the PostgreSQL container
docker-compose -f docker-compose.postgres.yml up -d
```

Expected output:
```
Creating network "lemotick-network" with driver "bridge"
Creating volume "lemotick_investor_postgres_data" with default driver
Creating lemotick-investor-postgres ... done
```

### 2. Verify Container is Running

```bash
docker ps | grep lemotick-investor-postgres
```

Should show:
```
CONTAINER ID   IMAGE                  STATUS         PORTS                    NAMES
xxxxx          postgres:16-alpine     Up 2 seconds   0.0.0.0:5433->5432/tcp   lemotick-investor-postgres
```

### 3. Test Database Connection

```bash
# Test connection using psql
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "SELECT version();"
```

## 🔄 Managing the Database Container

### Start Container
```bash
# Start container (if stopped)
docker-compose -f docker-compose.postgres.yml start

# Or start and recreate if needed
docker-compose -f docker-compose.postgres.yml up -d
```

### Stop Container
```bash
# Stop container (preserves data)
docker-compose -f docker-compose.postgres.yml stop

# Or stop and remove (data persists in volume)
docker-compose -f docker-compose.postgres.yml down
```

### Restart Container
```bash
# Restart container
docker-compose -f docker-compose.postgres.yml restart

# Or restart with recreation
docker-compose -f docker-compose.postgres.yml down && docker-compose -f docker-compose.postgres.yml up -d
```

### View Container Logs
```bash
# View all logs
docker-compose -f docker-compose.postgres.yml logs

# Follow logs in real-time
docker-compose -f docker-compose.postgres.yml logs -f

# View last 100 lines
docker-compose -f docker-compose.postgres.yml logs --tail=100
```

### Check Container Status
```bash
# Show running containers
docker-compose -f docker-compose.postgres.yml ps

# Show container health
docker inspect lemotick-investor-postgres --format='{{.State.Health.Status}}'
```

## 🗄️ Database Operations

### Access PostgreSQL CLI

```bash
# Connect to PostgreSQL using psql
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb
```

Inside psql:
```sql
-- List all databases
\l

-- List all tables
\dt

-- Describe a table
\d Investors

-- Run queries
SELECT * FROM Investors;

-- Exit
\q
```

### Execute SQL Commands

```bash
# Run single SQL command
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "SELECT COUNT(*) FROM Investors;"

# Run SQL file
docker exec -i lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb < backup.sql
```

### Database Backup

```bash
# Create backup
docker exec -t lemotick-investor-postgres pg_dump -U lemotick_user InvestorManagementSystemDb > backup_$(date +%Y%m%d_%H%M%S).sql

# Create compressed backup
docker exec -t lemotick-investor-postgres pg_dump -U lemotick_user InvestorManagementSystemDb | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Database Restore

```bash
# Restore from backup
docker exec -i lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb < backup_20241115_120000.sql

# Restore from compressed backup
gunzip -c backup_20241115_120000.sql.gz | docker exec -i lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb
```

### Reset Database (Clean Start)

```bash
# Method 1: Drop and recreate using Entity Framework
cd API
dotnet ef database drop --force
dotnet ef database update

# Method 2: Drop database in PostgreSQL
docker exec -it lemotick-investor-postgres psql -U lemotick_user -c "DROP DATABASE IF EXISTS InvestorManagementSystemDb;"
docker exec -it lemotick-investor-postgres psql -U lemotick_user -c "CREATE DATABASE InvestorManagementSystemDb;"

# Then run migrations
cd API
dotnet ef database update
```

## 🧹 Cleanup Operations

### Stop and Remove Container (Keep Data)

```bash
# Stop and remove containers (volumes persist)
docker-compose -f docker-compose.postgres.yml down
```

### Remove Container and Data (Complete Reset)

```bash
# CAUTION: This will delete ALL data!
docker-compose -f docker-compose.postgres.yml down -v

# Verify volumes are removed
docker volume ls | grep lemotick
```

### Remove Everything (Nuclear Option)

```bash
# DANGER: Complete cleanup - removes containers, volumes, networks
docker-compose -f docker-compose.postgres.yml down -v --remove-orphans

# Remove dangling volumes
docker volume prune -f

# Remove unused networks
docker network prune -f
```

## 🔧 PgAdmin (Optional Web Interface)

The docker-compose includes PgAdmin for easy database management.

### Access PgAdmin

1. Start containers (if not already running):
   ```bash
   docker-compose -f docker-compose.postgres.yml up -d
   ```

2. Open browser: **http://localhost:5050**

3. Login credentials:
   - **Email**: admin@lemotick.com
   - **Password**: admin123

### Add Server in PgAdmin

1. Right-click **Servers** → **Register** → **Server**
2. **General tab**:
   - Name: `LemoTick Investor DB`
3. **Connection tab**:
   - Host: `postgres` (or `lemotick-investor-postgres`)
   - Port: `5432`
   - Database: `InvestorManagementSystemDb`
   - Username: `lemotick_user`
   - Password: `lemotick_secure_password_123`
4. Click **Save**

## 🚨 Troubleshooting

### Container Won't Start

```bash
# Check container logs
docker logs lemotick-investor-postgres

# Check if port 5433 is already in use
netstat -ano | findstr :5433

# On Linux/Mac
lsof -i :5433

# If port is in use, stop the conflicting service or change port in docker-compose.yml
```

### Connection Refused Error

```bash
# 1. Check container is running
docker ps | grep lemotick-investor-postgres

# 2. Check container health
docker inspect lemotick-investor-postgres --format='{{.State.Health.Status}}'

# 3. Test connection inside container
docker exec -it lemotick-investor-postgres pg_isready -U lemotick_user

# 4. Check PostgreSQL is listening
docker exec -it lemotick-investor-postgres netstat -tuln | grep 5432
```

### Cannot Connect from API

```bash
# 1. Verify connection string in appsettings.json
# Should be: Host=localhost;Port=5433;Database=InvestorManagementSystemDb;Username=lemotick_user;Password=lemotick_secure_password_123

# 2. Test connection from host
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "SELECT 1;"

# 3. Check firewall/antivirus isn't blocking port 5433
```

### Database Locked or Corrupted

```bash
# 1. Stop all connections
docker-compose -f docker-compose.postgres.yml restart

# 2. If still issues, recreate container (data persists)
docker-compose -f docker-compose.postgres.yml down
docker-compose -f docker-compose.postgres.yml up -d

# 3. Check data integrity
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "VACUUM FULL;"
```

### Out of Disk Space

```bash
# Check volume size
docker system df -v

# Clean up unused volumes
docker volume prune

# Remove old images
docker image prune -a
```

### Password Authentication Failed

```bash
# 1. Verify credentials match appsettings.json
# 2. Recreate container with correct credentials
docker-compose -f docker-compose.postgres.yml down -v
docker-compose -f docker-compose.postgres.yml up -d
```

## 📊 Monitoring

### Check Database Size

```bash
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "
SELECT 
    pg_database.datname as database_name,
    pg_size_pretty(pg_database_size(pg_database.datname)) as size
FROM pg_database
WHERE datname = 'InvestorManagementSystemDb';"
```

### Check Table Sizes

```bash
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "
SELECT 
    relname as table_name,
    pg_size_pretty(pg_total_relation_size(relid)) as size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;"
```

### Check Active Connections

```bash
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query
FROM pg_stat_activity
WHERE datname = 'InvestorManagementSystemDb';"
```

### Check Container Resource Usage

```bash
# Real-time stats
docker stats lemotick-investor-postgres

# One-time check
docker stats --no-stream lemotick-investor-postgres
```

## 🔐 Security Best Practices

### Change Default Password

1. Edit `docker-compose.postgres.yml`:
   ```yaml
   environment:
     POSTGRES_PASSWORD: your_strong_password_here
   ```

2. Update `appsettings.json`:
   ```json
   "DefaultConnection": "Host=localhost;Port=5433;Database=InvestorManagementSystemDb;Username=lemotick_user;Password=your_strong_password_here"
   ```

3. Recreate container:
   ```bash
   docker-compose -f docker-compose.postgres.yml down -v
   docker-compose -f docker-compose.postgres.yml up -d
   ```

### Restrict Network Access

Edit `docker-compose.postgres.yml` to bind to localhost only:
```yaml
ports:
  - "127.0.0.1:5433:5432"
```

### Enable SSL (Production)

Add to `docker-compose.postgres.yml`:
```yaml
command: >
  -c ssl=on
  -c ssl_cert_file=/etc/ssl/certs/server.crt
  -c ssl_key_file=/etc/ssl/private/server.key
volumes:
  - ./ssl/server.crt:/etc/ssl/certs/server.crt
  - ./ssl/server.key:/etc/ssl/private/server.key
```

## 🎯 Common Workflows

### Daily Development Workflow

```bash
# Morning: Start containers
docker-compose -f docker-compose.postgres.yml start

# Run your API
cd API
dotnet run

# Evening: Stop containers (optional)
docker-compose -f docker-compose.postgres.yml stop
```

### Before Testing

```bash
# 1. Ensure database is running
docker-compose -f docker-compose.postgres.yml ps

# 2. Check database health
docker inspect lemotick-investor-postgres --format='{{.State.Health.Status}}'

# 3. Run migrations if needed
cd API
dotnet ef database update

# 4. Start API
dotnet run
```

### Weekly Maintenance

```bash
# 1. Create backup
docker exec -t lemotick-investor-postgres pg_dump -U lemotick_user InvestorManagementSystemDb > backup_$(date +%Y%m%d).sql

# 2. Vacuum database
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "VACUUM ANALYZE;"

# 3. Check logs for issues
docker-compose -f docker-compose.postgres.yml logs --tail=100
```

## 📝 Quick Reference

| Command | Description |
|---------|-------------|
| `docker-compose -f docker-compose.postgres.yml up -d` | Start containers |
| `docker-compose -f docker-compose.postgres.yml down` | Stop & remove containers |
| `docker-compose -f docker-compose.postgres.yml restart` | Restart containers |
| `docker-compose -f docker-compose.postgres.yml logs -f` | Follow logs |
| `docker-compose -f docker-compose.postgres.yml ps` | Show status |
| `docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb` | Access psql CLI |
| `docker-compose -f docker-compose.postgres.yml down -v` | Remove everything (including data) |

## 🆘 Getting Help

### Check Container Health
```bash
docker inspect lemotick-investor-postgres --format='{{json .State.Health}}'
```

### View Full Container Configuration
```bash
docker inspect lemotick-investor-postgres
```

### Test Connection String
```bash
# From PowerShell
$env:ConnectionStrings__DefaultConnection = "Host=localhost;Port=5433;Database=InvestorManagementSystemDb;Username=lemotick_user;Password=lemotick_secure_password_123"
cd API
dotnet ef database update
```

---

## 🎉 Success Checklist

- [ ] Docker and Docker Compose installed
- [ ] PostgreSQL container running (`docker ps`)
- [ ] Container is healthy (green status)
- [ ] Can connect via psql
- [ ] PgAdmin accessible at localhost:5050 (optional)
- [ ] API can connect to database
- [ ] Migrations applied successfully
- [ ] Backup strategy in place

**All checked? Your database is ready! 🚀**

---

For additional help, check:
- PostgreSQL logs: `docker-compose -f docker-compose.postgres.yml logs`
- API logs: Console where `dotnet run` is executing
- Docker status: `docker ps -a`

