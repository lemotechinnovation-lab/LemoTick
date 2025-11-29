# 🏦 Investor Management System - Backend

Complete REST API backend for LemoTick's Investor Management System with PostgreSQL database.

## 📦 What's Included

- ✅ **45+ REST API Endpoints** - Complete CRUD operations
- ✅ **PostgreSQL Database** - Docker containerized
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Entity Framework Core** - Database migrations
- ✅ **MediatR Pattern** - CQRS implementation
- ✅ **AutoMapper** - DTO mapping
- ✅ **Serilog** - Structured logging
- ✅ **Swagger/OpenAPI** - API documentation
- ✅ **Postman Collection** - 45+ pre-configured requests

## 🚀 Quick Start (10 Minutes)

### Prerequisites
- .NET 8.0 SDK
- Docker Desktop
- Postman (for testing)

### 1. Start Database
```bash
cd backend
docker compose -f docker-compose.postgres.yml up -d
```

### 2. Run Migrations
```bash
cd API
dotnet ef database update
```

### 3. Start API
```bash
dotnet run
```

### 4. Test in Postman
- Import `InvestorManagementSystem.postman_collection.json`
- Import `InvestorManagementSystem.postman_environment.json`
- Run: Health → Health Check

**Access Points:**
- API: https://localhost:7001
- Swagger: https://localhost:7001/swagger
- PgAdmin: http://localhost:5050

## 📚 Documentation

| Guide | Purpose | Start Here If... |
|-------|---------|------------------|
| **[COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)** | Complete system setup | You're setting up for the first time |
| **[DOCKER_QUICK_COMMANDS.md](DOCKER_QUICK_COMMANDS.md)** | Quick copy-paste commands | You need to start/stop database |
| **[DOCKER_DATABASE_GUIDE.md](DOCKER_DATABASE_GUIDE.md)** | Complete Docker reference | You have database issues |
| **[POSTMAN_QUICK_START.md](POSTMAN_QUICK_START.md)** | 5-minute API testing | You want to test APIs quickly |
| **[POSTMAN_TESTING_GUIDE.md](POSTMAN_TESTING_GUIDE.md)** | Complete API reference | You need detailed endpoint info |

## 🎯 API Overview

### 8 Main Categories

1. **Authentication** (4 endpoints)
   - Register, Login, Refresh Token, Change Password

2. **Health** (1 endpoint)
   - System health check

3. **Investors** (6 endpoints)
   - Full CRUD + portfolio listing

4. **Portfolios** (4 endpoints)
   - Create and manage trading portfolios

5. **Trades** (5 endpoints)
   - Record and track trades

6. **Transactions** (7 endpoints)
   - Deposits, withdrawals, transaction history

7. **Performance Metrics** (4 endpoints)
   - Portfolio performance tracking

8. **Notifications** (7 endpoints)
   - Investor notification system

**Total: 45 Endpoints**

## 🏗️ Architecture

```
backend/
├── API/                          # Web API Layer
│   ├── Controllers/              # 8 API controllers
│   ├── Middleware/               # Auth & error handling
│   └── Program.cs                # App configuration
├── Application/                  # Business Logic
│   ├── Commands/                 # Write operations
│   ├── Queries/                  # Read operations
│   ├── Handlers/                 # 33 request handlers
│   ├── DTOs/                     # Data transfer objects
│   ├── Services/                 # Auth & JWT services
│   └── Validators/               # Input validation
├── Core/                         # Domain Layer
│   └── Entities/                 # 6 domain entities
├── Infrastructure/               # Data Access
│   ├── Data/                     # DbContext
│   └── Repositories/             # 6 repositories
├── Services/                     # Background Services
│   ├── NotificationService.cs    # Notification processor
│   └── PerformanceCalculationService.cs
└── Tests/                        # Unit Tests
```

### Technologies Used

- **.NET 8.0** - Latest LTS framework
- **PostgreSQL 16** - Primary database
- **Entity Framework Core** - ORM
- **MediatR** - CQRS pattern
- **AutoMapper** - Object mapping
- **JWT** - Authentication
- **Serilog** - Logging
- **Swagger** - API docs
- **Docker** - Containerization

## 🔐 Authentication

Most endpoints require JWT authentication:

1. **Register** or **Login** to get token
2. Token auto-saved in Postman environment
3. Valid for 60 minutes
4. Refresh using refresh-token endpoint

## 💾 Database

### Connection Details
- **Host**: localhost
- **Port**: 5433
- **Database**: InvestorManagementSystemDb
- **Username**: lemotick_user
- **Password**: lemotick_secure_password_123

### Entities
1. **Investor** - User accounts with KYC
2. **Portfolio** - Trading portfolios with risk settings
3. **Trade** - Individual trades (Forex, Binary, CFD, etc.)
4. **Transaction** - Financial transactions
5. **PerformanceMetric** - Portfolio performance snapshots
6. **Notification** - Investor notifications

### Entity Relationships
```
Investor (1) ──→ (N) Portfolio ──→ (N) Trade
Investor (1) ──→ (N) Transaction
Investor (1) ──→ (N) Notification
Portfolio (1) ──→ (N) PerformanceMetric
Portfolio (1) ──→ (N) Transaction
```

## 🧪 Testing with Postman

### Recommended Test Flow

1. **Health Check** - Verify API is running
2. **Register** - Create investor account
3. **Login** - Get JWT token (auto-saved)
4. **Create Portfolio** - Setup trading account
5. **Create Transaction** - Add initial funds
6. **Create Trade** - Execute trade
7. **Update Trade** - Close position
8. **Create Performance Metric** - Record metrics
9. **Create Notification** - Notify investor

### Auto-Saved Variables
- `jwt_token` - From login
- `investor_id` - From register/login
- `portfolio_id` - From create portfolio
- `trade_id` - From create trade

## 🔧 Development

### Build Solution
```bash
cd backend
dotnet build
```

### Run Tests
```bash
cd Tests
dotnet test
```

### Create Migration
```bash
cd API
dotnet ef migrations add MigrationName
dotnet ef database update
```

### Reset Database
```bash
dotnet ef database drop --force
dotnet ef database update
```

## 🚨 Common Issues

### "Could not connect to database"
```bash
docker ps | grep lemotick-investor-postgres
docker-compose -f docker-compose.postgres.yml up -d
```

### "Port 5433 already in use"
```bash
# Find conflicting process
Get-NetTCPConnection -LocalPort 5433
# Or change port in docker-compose.postgres.yml
```

### "401 Unauthorized"
```bash
# Token expired - login again in Postman
# Authentication → Login
```

### "Migration failed"
```bash
# Reset database
dotnet ef database drop --force
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## 📊 Monitoring

### Database Stats
```bash
docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "
SELECT 
    schemaname,
    tablename,
    n_live_tup as rows
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;"
```

### Container Health
```bash
docker inspect lemotick-investor-postgres --format='{{.State.Health.Status}}'
```

### Logs
```bash
# Database logs
docker-compose -f docker-compose.postgres.yml logs -f

# API logs
cat API/logs/investor-management-*.txt
```

## 🔒 Security

### Development
- Default passwords for easy setup
- Self-signed SSL certificate
- CORS enabled for all origins
- Runs on localhost only

### Production Checklist
- [ ] Change all default passwords
- [ ] Use environment variables for secrets
- [ ] Proper SSL certificates
- [ ] Restrict CORS origins
- [ ] Enable rate limiting
- [ ] Implement audit logging
- [ ] Regular security updates
- [ ] Database backups

## 💾 Backup & Restore

### Backup
```bash
docker exec -t lemotick-investor-postgres pg_dump -U lemotick_user InvestorManagementSystemDb > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
docker exec -i lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb < backup_20241115.sql
```

## 📈 Performance

### Database Optimization
- Indexes on foreign keys
- Unique constraints on email/ID
- Proper column types (decimal for money)
- Connection pooling enabled

### API Performance
- MediatR for clean pipeline
- AutoMapper for efficient mapping
- EF Core query optimization
- Response caching headers

## 🎯 Roadmap

### Completed ✅
- [x] Complete CRUD operations
- [x] JWT authentication
- [x] PostgreSQL integration
- [x] Docker containerization
- [x] Postman collection
- [x] Comprehensive documentation

### Planned 🚧
- [ ] Rate limiting
- [ ] Audit logging
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Advanced reporting
- [ ] Real-time websocket updates
- [ ] API versioning
- [ ] Integration tests

## 📞 Support

### Get Help
- Read relevant guide in `/backend/` folder
- Check API logs: `cat API/logs/investor-management-*.txt`
- Check database logs: `docker-compose -f docker-compose.postgres.yml logs`
- Test individual components using guides

### Report Issues
- Check existing issues in project tracker
- Include logs and error messages
- Describe steps to reproduce
- Include environment details

## 🏆 Credits

Built with ❤️ for LemoTick Investor Management System

### Tech Stack
- ASP.NET Core 8.0
- Entity Framework Core
- PostgreSQL
- Docker
- MediatR
- AutoMapper
- Serilog
- Swagger/OpenAPI

## 📝 License

See LICENSE file in root directory.

---

## 🎉 Quick Links

- **[Complete Setup Guide](COMPLETE_SETUP_GUIDE.md)** - Start here!
- **[Docker Commands](DOCKER_QUICK_COMMANDS.md)** - Database management
- **[Postman Guide](POSTMAN_QUICK_START.md)** - API testing
- **[API Documentation](https://localhost:7001/swagger)** - Live docs (when running)

**Ready to start? See [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md) for step-by-step instructions!**

