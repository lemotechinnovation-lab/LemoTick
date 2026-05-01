# 🏗️ LemoTick Platform Architecture

Visual overview of the complete LemoTick platform architecture and Docker setup.

---

## 🎯 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        LemoTick Platform                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Frontend       │────▶│   Backend API    │────▶│   PostgreSQL     │
│   (React)        │     │   (.NET 8)       │     │   Database       │
│   Port: 5173     │     │   Port: 5000     │     │   Port: 5433     │
└──────────────────┘     └──────────────────┘     └──────────────────┘
        │                         │                         │
        │                         │                         │
        ▼                         ▼                         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   User Browser   │     │   Swagger UI     │     │    PgAdmin       │
│                  │     │   Port: 5000     │     │    Port: 5050    │
└──────────────────┘     └──────────────────┘     └──────────────────┘

                    ┌──────────────────┐
                    │   Trading Bot    │
                    │   (Python)       │
                    │   Port: 8080     │
                    └──────────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │   Deriv API      │
                    │   (WebSocket)    │
                    └──────────────────┘
```

---

## 🐳 Docker Container Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Docker Host (macOS)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              lemotick-network (bridge)                  │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  lemotick-investor-postgres                      │  │    │
│  │  │  Image: postgres:16-alpine                       │  │    │
│  │  │  Port: 5433:5432                                 │  │    │
│  │  │  Volume: lemotick_investor_postgres_data        │  │    │
│  │  │  Health: pg_isready check                       │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                          ▲                              │    │
│  │                          │                              │    │
│  │  ┌──────────────────────┼──────────────────────────┐  │    │
│  │  │  lemotick-backend    │                          │  │    │
│  │  │  Image: lemotick-backend:latest                 │  │    │
│  │  │  Port: 5000:5000, 5001:5001                     │  │    │
│  │  │  Depends: postgres (healthy)                    │  │    │
│  │  │  Health: curl http://localhost:5000/health      │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  lemotick-pgadmin                                │  │    │
│  │  │  Image: dpage/pgadmin4:latest                    │  │    │
│  │  │  Port: 5050:80                                   │  │    │
│  │  │  Volume: lemotick_pgadmin_data                   │  │    │
│  │  │  Depends: postgres                               │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  lemotick-bot                                    │  │    │
│  │  │  Image: lemotick-bot:latest                      │  │    │
│  │  │  Port: 8080:8080                                 │  │    │
│  │  │  Volumes: config/, logs/                         │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Host Machine (macOS)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Frontend (npm run dev)                                          │
│  ├─ Port: 5173                                                   │
│  ├─ Process: Node.js                                             │
│  └─ Auto-reload: Yes                                             │
│                                                                   │
│  Backend (dotnet run) - Optional                                 │
│  ├─ Port: 5000, 5001                                             │
│  ├─ Process: .NET                                                │
│  └─ Hot-reload: Yes (with dotnet watch)                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### User Registration & Login

```
Browser ──[HTTP]──▶ Frontend ──[HTTPS]──▶ Backend API ──[SQL]──▶ PostgreSQL
                      (5173)                 (5000)                 (5433)
                                                │
                                                ▼
                                          JWT Token Generated
                                                │
                                                ▼
Browser ◀──[HTTP]──── Frontend ◀──[HTTPS]──── Backend API
        (Store Token)
```

### Trading Operations

```
Frontend ──[HTTPS + JWT]──▶ Backend API ──[SQL]──▶ PostgreSQL
  (5173)                       (5000)                (5433)
                                 │
                                 │ Store Trade Data
                                 ▼
                           Database Tables:
                           ├─ Investors
                           ├─ Portfolios
                           ├─ Trades
                           ├─ Transactions
                           └─ PerformanceMetrics
```

### Bot Trading Flow

```
Trading Bot ──[WebSocket]──▶ Deriv API
   (8080)                      (External)
     │
     │ Receive Ticks
     ▼
  Strategy Engine
  ├─ Candlestick Patterns
  ├─ EMA Indicators
  └─ Risk Management
     │
     │ Execute Trade
     ▼
  Deriv API ──[WebSocket]──▶ Trade Execution
     │
     │ Store Results
     ▼
  Backend API ──[HTTPS]──▶ PostgreSQL
    (5000)                   (5433)
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Security Layers                           │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Network Isolation
├─ Docker Network: lemotick-network (bridge)
├─ Containers communicate internally
└─ Only exposed ports accessible from host

Layer 2: Authentication
├─ JWT Token-based authentication
├─ Token expiry: 60 minutes
├─ Refresh token mechanism
└─ Password hashing (BCrypt)

Layer 3: Database Security
├─ PostgreSQL user: lemotick_user
├─ Password-protected access
├─ Port 5433 (non-standard)
└─ Volume encryption (Docker)

Layer 4: API Security
├─ HTTPS (self-signed cert in dev)
├─ CORS configuration
├─ Input validation
└─ SQL injection prevention (EF Core)

Layer 5: Application Security
├─ Environment variables for secrets
├─ No hardcoded credentials
├─ Secure WebSocket connections
└─ Rate limiting (planned)
```

---

## 💾 Data Persistence

```
┌─────────────────────────────────────────────────────────────────┐
│                      Docker Volumes                              │
└─────────────────────────────────────────────────────────────────┘

lemotick_investor_postgres_data
├─ Location: Docker managed volume
├─ Size: Dynamic (grows with data)
├─ Persistence: Survives container restarts
├─ Backup: pg_dump command
└─ Contains: All database tables and data

lemotick_pgadmin_data
├─ Location: Docker managed volume
├─ Size: ~100MB
├─ Persistence: Survives container restarts
└─ Contains: PgAdmin configuration and saved connections

Host Volumes (Bind Mounts)
├─ ./lemotickautostart/config ──▶ /app/config (bot)
├─ ./lemotickautostart/logs ──▶ /app/logs (bot)
└─ ./backend/API/logs ──▶ /app/logs (backend)
```

---

## 🔄 Service Dependencies

```
Start Order:
1. PostgreSQL Database
   └─ Health check: pg_isready
        │
        ▼
2. Backend API
   └─ Depends on: PostgreSQL (healthy)
   └─ Health check: /health endpoint
        │
        ▼
3. Frontend
   └─ Depends on: Backend API (running)
        │
        ▼
4. PgAdmin (Optional)
   └─ Depends on: PostgreSQL (running)
        │
        ▼
5. Trading Bot (Optional)
   └─ Independent (connects to Deriv API)
```

---

## 🌐 Network Ports

```
┌─────────────────────────────────────────────────────────────────┐
│                      Port Mapping                                │
└─────────────────────────────────────────────────────────────────┘

Host Port  │  Container Port  │  Service           │  Protocol
───────────┼──────────────────┼────────────────────┼──────────────
5173       │  5173            │  Frontend          │  HTTP
5000       │  5000            │  Backend API       │  HTTP
5001       │  5001            │  Backend API       │  HTTPS
5433       │  5432            │  PostgreSQL        │  TCP
5050       │  80              │  PgAdmin           │  HTTP
8080       │  8080            │  Trading Bot       │  HTTP
```

---

## 📁 Project Structure

```
LemoTick/
├── backend/                          # .NET Backend
│   ├── API/                          # Web API Layer
│   ├── Application/                  # Business Logic
│   ├── Core/                         # Domain Models
│   ├── Infrastructure/               # Data Access
│   ├── Services/                     # Background Services
│   ├── docker-compose.postgres.yml   # Database setup
│   └── Dockerfile                    # Backend image
│
├── admin-dashboard/                  # React Frontend
│   ├── src/
│   │   ├── components/               # UI Components
│   │   ├── features/                 # Feature modules
│   │   ├── hooks/                    # Custom hooks
│   │   └── pages/                    # Page components
│   └── package.json
│
├── lemotickautostart/                # Python Trading Bot
│   ├── src/                          # Bot source code
│   ├── config/                       # Configuration
│   └── logs/                         # Bot logs
│
├── deployment/                       # Deployment scripts
│   ├── docker/
│   │   └── Dockerfile.bot            # Bot image
│   └── scripts/                      # Deployment scripts
│
├── docker-compose.yml                # Complete stack
├── start-lemotick-mac.sh            # macOS startup script
├── stop-lemotick-mac.sh             # macOS stop script
└── logs/                             # Application logs
```

---

## 🔧 Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                      Technology Stack                            │
└─────────────────────────────────────────────────────────────────┘

Frontend
├─ React 19
├─ TypeScript
├─ Vite
├─ TailwindCSS
├─ React Router
├─ Axios
├─ Chart.js
└─ Deriv Charts

Backend
├─ .NET 8.0
├─ ASP.NET Core
├─ Entity Framework Core
├─ MediatR (CQRS)
├─ AutoMapper
├─ JWT Authentication
├─ Serilog
└─ Swagger/OpenAPI

Database
├─ PostgreSQL 16
└─ PgAdmin 4

Trading Bot
├─ Python 3.11
├─ WebSocket Client
├─ NumPy/Pandas
├─ Technical Indicators
└─ Deriv API

DevOps
├─ Docker
├─ Docker Compose
└─ Bash Scripts
```

---

## 🚀 Deployment Options

```
┌─────────────────────────────────────────────────────────────────┐
│                    Deployment Options                            │
└─────────────────────────────────────────────────────────────────┘

Option 1: Local Development (Recommended)
├─ Database: Docker
├─ Backend: dotnet run (hot reload)
├─ Frontend: npm run dev (hot reload)
└─ Best for: Active development

Option 2: Full Docker
├─ Database: Docker
├─ Backend: Docker
├─ Frontend: Docker (requires Dockerfile)
└─ Best for: Production-like testing

Option 3: Hybrid (Current Setup)
├─ Database: Docker
├─ Backend: Local or Docker
├─ Frontend: Local (npm run dev)
└─ Best for: Development with flexibility

Option 4: VPS Deployment
├─ All services: Docker on remote server
├─ Systemd: Service management
├─ Nginx: Reverse proxy
└─ Best for: Production deployment
```

---

## 📊 Resource Requirements

```
┌─────────────────────────────────────────────────────────────────┐
│                    Resource Requirements                         │
└─────────────────────────────────────────────────────────────────┘

Minimum (Development)
├─ CPU: 2 cores
├─ RAM: 4GB
├─ Disk: 10GB
└─ Docker: 2GB RAM, 2 CPUs

Recommended (Development)
├─ CPU: 4 cores
├─ RAM: 8GB
├─ Disk: 20GB
└─ Docker: 4GB RAM, 4 CPUs

Production
├─ CPU: 8 cores
├─ RAM: 16GB
├─ Disk: 100GB
└─ Docker: 8GB RAM, 6 CPUs

Per Container
├─ PostgreSQL: ~200MB RAM
├─ Backend: ~150MB RAM
├─ PgAdmin: ~100MB RAM
└─ Bot: ~100MB RAM
```

---

## 🔍 Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────────┐
│                    Monitoring Stack                              │
└─────────────────────────────────────────────────────────────────┘

Logs
├─ Backend: ./logs/backend.log
├─ Frontend: ./logs/frontend.log
├─ Database: docker logs lemotick-investor-postgres
└─ Bot: ./lemotickautostart/logs/

Health Checks
├─ Backend: https://localhost:5000/health
├─ Database: pg_isready command
└─ Docker: Health check in compose file

Metrics (Planned)
├─ Prometheus: Metrics collection
├─ Grafana: Visualization
└─ Bot metrics: Trading performance
```

---

## 📚 Quick Reference

| What | Command |
|------|---------|
| **Start All** | `./start-lemotick-mac.sh` |
| **Stop All** | `./stop-lemotick-mac.sh` |
| **View Logs** | `docker compose logs -f` |
| **Check Status** | `docker ps` |
| **Reset DB** | `docker compose down -v` |
| **Backend Health** | `curl -k https://localhost:5000/health` |
| **DB Connect** | `docker exec -it lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb` |

---

**For detailed instructions, see:**
- [macOS Quick Start](MACOS_QUICKSTART.md)
- [Docker Setup Guide](DOCKER_SETUP_GUIDE.md)
- [Docker Commands Summary](DOCKER_COMMANDS_SUMMARY.md)
