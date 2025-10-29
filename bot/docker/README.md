# LemoTick Docker Development Environment

This directory contains Docker configuration for running the LemoTick Investor Management System in a containerized development environment.

## 🏗️ Architecture

The Docker setup includes:

- **PostgreSQL Database**: Primary database for the backend
- **Backend API**: .NET Core Web API with Entity Framework
- **Trading Bot**: Python bot for Deriv API integration
- **Redis** (optional): For distributed state management
- **Prometheus** (optional): For metrics collection
- **Grafana** (optional): For monitoring dashboards

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0+

### 1. Environment Setup

```bash
# Copy the environment template
cp docker.env.example docker.env

# Edit the configuration
# Update DERIV_API_TOKEN and other sensitive values
nano docker.env
```

### 2. Start Development Environment

**Linux/macOS:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

**Windows:**
```cmd
start-dev.bat
```

**Manual:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

### 3. Verify Services

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Test API health
curl http://localhost:5000/health
```

## 🔧 Configuration

### Environment Variables

Key configuration variables in `docker.env`:

```bash
# Database
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=InvestorManagementSystemDb
POSTGRES_USER=lemotick_user

# Deriv API (Required for bot)
DERIV_API_TOKEN=your_deriv_api_token
DERIV_WS_URL=wss://ws.derivws.com/websockets/v3
DERIV_APP_ID=1089

# JWT Authentication
JWT_KEY=YourSuperSecretKeyThatIsAtLeast32CharactersLong!
JWT_ISSUER=InvestorManagementSystem
JWT_AUDIENCE=InvestorManagementSystemUsers
```

### Database Connection

The backend automatically connects to PostgreSQL using:
- **Host**: `postgres` (container name)
- **Port**: `5432`
- **Database**: `InvestorManagementSystemDb`
- **Username**: `lemotick_user`
- **Password**: From `POSTGRES_PASSWORD` environment variable

## 📊 Services

| Service | Port | Description |
|---------|------|-------------|
| Backend API | 5000 (HTTP), 5001 (HTTPS) | .NET Core Web API |
| PostgreSQL | 5432 | Database server |
| Redis | 6379 | Cache (optional) |
| Prometheus | 9090 | Metrics (optional) |
| Grafana | 3000 | Dashboards (optional) |

## 🛠️ Development Commands

### Database Operations

```bash
# Create and run migrations
docker-compose exec backend-api dotnet ef database update

# Generate new migration
docker-compose exec backend-api dotnet ef migrations add MigrationName

# Reset database
docker-compose exec postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

### Logs and Debugging

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend-api
docker-compose logs -f lemotick-bot
docker-compose logs -f postgres

# Access container shell
docker-compose exec backend-api bash
docker-compose exec lemotick-bot bash
```

### Service Management

```bash
# Restart specific service
docker-compose restart backend-api

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ Data loss)
docker-compose down -v

# Rebuild services
docker-compose build --no-cache
```

## 🔍 Monitoring

### Health Checks

- **Backend API**: `http://localhost:5000/health`
- **Readiness**: `http://localhost:5000/health/ready`
- **Liveness**: `http://localhost:5000/health/live`

### Optional Monitoring Stack

Enable monitoring services:

```bash
# Start with monitoring
docker-compose --profile monitoring up -d

# Access Grafana
open http://localhost:3000
# Default credentials: admin/admin
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 5000, 5432, 3000, 9090 are available
2. **Database connection**: Check PostgreSQL container is healthy
3. **API not responding**: Verify backend container is running
4. **Bot not trading**: Check DERIV_API_TOKEN is valid

### Debug Steps

```bash
# Check container status
docker-compose ps

# Check container health
docker inspect lemotick-postgres | grep Health
docker inspect lemotick-backend-api | grep Health

# View detailed logs
docker-compose logs --tail=100 backend-api
```

### Reset Environment

```bash
# Complete reset (⚠️ Removes all data)
docker-compose down -v
docker system prune -f
docker-compose up -d
```

## 📁 File Structure

```
docker/
├── docker-compose.yml          # Base services configuration
├── docker-compose.override.yml # Development overrides
├── docker.env.example         # Environment template
├── start-dev.sh              # Linux/macOS startup script
├── start-dev.bat             # Windows startup script
├── postgres/
│   └── init/
│       └── 01-init-database.sql # Database initialization
└── README.md                  # This file
```

## 🔐 Security Notes

- Change default passwords in production
- Use Docker secrets for sensitive data
- Enable SSL/TLS for production deployments
- Regularly update base images
- Use specific image tags, not `latest`

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [.NET Core Docker Images](https://hub.docker.com/_/microsoft-dotnet)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
