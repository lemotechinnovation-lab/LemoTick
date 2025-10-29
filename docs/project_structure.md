# LemoTick Investor Management System - Project Structure

## 📁 Clean Architecture Overview

```
LemoTick/
│
├── 🎯 ROOT FILES
│   ├── start_system.py              # Main system startup script
│   ├── README.md                    # Original LemoTick documentation
│   ├── README-InvestorManagement.md # New investor system documentation
│   ├── PROJECT_STRUCTURE.md         # This file
│   └── LICENSE                      # MIT License
│
├── 🖥️ FRONTEND (React TypeScript)
│   ├── investor-portal/            # Investor dashboard and management
│   ├── admin-dashboard/            # Admin operations and analytics
│   └── shared/                     # Shared UI components and utilities
│
├── ⚙️ BACKEND (.NET Core Clean Architecture)
│   ├── Core/                       # Domain layer
│   │   └── Entities/               # Domain entities
│   │       ├── Investor.cs         # Investor entity
│   │       ├── Portfolio.cs       # Portfolio entity
│   │       ├── Trade.cs           # Trade entity
│   │       ├── Transaction.cs     # Transaction entity
│   │       ├── PerformanceMetric.cs # Performance tracking
│   │       └── Notification.cs    # Notification entity
│   │
│   ├── Application/                # Application layer (CQRS)
│   │   ├── Commands/              # Write operations
│   │   ├── Queries/               # Read operations
│   │   ├── DTOs/                  # Data Transfer Objects
│   │   └── Interfaces/            # Service interfaces
│   │
│   ├── Infrastructure/            # Infrastructure layer
│   │   ├── Data/                  # Entity Framework context
│   │   ├── Repositories/         # Data access implementations
│   │   └── ExternalServices/      # Third-party integrations
│   │
│   ├── Services/                  # Background services
│   │   ├── PerformanceCalculationService.cs
│   │   └── NotificationService.cs
│   │
│   ├── API/                       # Presentation layer
│   │   ├── Controllers/           # REST API controllers
│   │   │   ├── InvestorsController.cs
│   │   │   ├── PortfoliosController.cs
│   │   │   └── TradesController.cs
│   │   └── Program.cs             # Application startup
│   │
│   ├── BotIntegration/           # Python bot integration
│   └── Tests/                     # Unit and integration tests
│
├── 🤖 BOT (Python - Refactored)
│   ├── src/                       # Source code
│   │   ├── core/                  # Core bot engine
│   │   │   ├── bot_engine.py      # Main bot orchestrator
│   │   │   └── config_manager.py  # Configuration management
│   │   │
│   │   ├── strategies/            # Trading strategies
│   │   ├── indicators/            # Technical indicators
│   │   ├── services/              # Core services
│   │   ├── integrations/          # Backend communication
│   │   │   └── backend_client.py  # HTTP client for backend
│   │   └── main.py                # Bot entry point
│   │
│   ├── config/                    # Configuration files
│   │   ├── settings.yaml          # Bot settings
│   │   └── credentials.env        # API credentials
│   │
│   ├── logs/                      # Bot logs
│   ├── tests/                     # Bot tests
│   ├── requirements.txt           # Python dependencies
│   └── run_bot.py                 # Bot startup script
│
├── 📊 DATA & MONITORING
│   ├── data/                      # Data storage
│   │   ├── backtests/            # Backtest results
│   │   ├── ticks/                 # Market tick data
│   │   └── trades/                # Trade data
│   │
│   ├── logs/                      # System logs
│   └── monitoring/                # Grafana monitoring
│       ├── grafana/               # Grafana dashboards
│       └── prometheus.yml         # Metrics collection
│
├── 🐳 DOCKER & DEPLOYMENT
│   ├── docker/                    # Docker configuration
│   │   ├── docker-compose.yml    # Multi-container setup
│   │   └── Dockerfile             # Bot container
│   │
│   ├── docker-compose.monitoring.yml # Monitoring stack
│   └── scripts/                   # Deployment scripts
│
└── 📚 DOCUMENTATION
    ├── docs/                      # Comprehensive documentation
    │   ├── guides/                # User guides
    │   ├── reference/             # Technical reference
    │   └── troubleshooting/       # Problem solving
    │
    └── utilities/                 # Utility scripts
```

## 🎯 Key Architectural Decisions

### 1. **Clean Architecture**
- **Core**: Pure business logic, no dependencies
- **Application**: Use cases and business rules
- **Infrastructure**: External concerns (database, APIs)
- **API**: Presentation layer and controllers

### 2. **Separation of Concerns**
- **Frontend**: React TypeScript applications
- **Backend**: .NET Core with Clean Architecture
- **Bot**: Python trading engine
- **Integration**: HTTP API communication

### 3. **Scalability**
- **Microservices Ready**: Modular structure
- **Database**: Entity Framework Core with migrations
- **Caching**: Redis for performance
- **Monitoring**: Grafana and Prometheus

### 4. **Security & Compliance**
- **Authentication**: JWT-based security
- **Authorization**: Role-based access control
- **Data Protection**: POPIA compliance
- **Audit Logging**: Comprehensive audit trails

## 🚀 Getting Started

### Prerequisites
- .NET 8.0 SDK
- Node.js 18+ and npm/yarn
- Python 3.9+
- SQL Server or PostgreSQL
- Docker (optional)

### Quick Start
```bash
# Start the entire system
python start_system.py

# Or start components individually:
# Backend
cd backend && dotnet run --project API

# Bot
cd bot && python run_bot.py

# Frontend (when implemented)
cd frontend/investor-portal && npm start
```

## 📈 Development Workflow

### 1. **Backend Development**
```bash
cd backend
dotnet restore
dotnet build
dotnet test
dotnet run --project API
```

### 2. **Bot Development**
```bash
cd bot
pip install -r requirements.txt
python run_bot.py
```

### 3. **Frontend Development**
```bash
cd frontend/investor-portal
npm install
npm start
```

## 🔧 Configuration

### Environment Variables
- **Backend**: Connection strings, JWT secrets
- **Bot**: API credentials, trading parameters
- **Frontend**: API endpoints, feature flags

### Database
- **Development**: SQLite (local)
- **Production**: PostgreSQL or SQL Server
- **Migrations**: Entity Framework migrations

## 📊 Monitoring & Observability

### Logging
- **Backend**: Serilog with structured logging
- **Bot**: Python logging with correlation IDs
- **Frontend**: Console and file logging

### Metrics
- **Performance**: Trading performance metrics
- **System**: CPU, memory, disk usage
- **Business**: Investor metrics, portfolio performance

### Alerts
- **Risk Management**: Portfolio risk alerts
- **System Health**: Infrastructure monitoring
- **Business**: Performance notifications

## 🛡️ Security Considerations

### Authentication
- JWT tokens with refresh mechanism
- Role-based authorization
- API key management for bot integration

### Data Protection
- Encryption at rest and in transit
- PII data handling compliance
- Secure credential management

### Risk Management
- Portfolio-level risk limits
- System-wide risk controls
- Real-time risk monitoring

## 📚 Documentation

- **API Documentation**: Swagger/OpenAPI
- **Architecture Diagrams**: Mermaid diagrams
- **User Guides**: Step-by-step instructions
- **Developer Documentation**: Technical specifications

This structure provides a solid foundation for building a professional investment platform that can scale and comply with regulatory requirements.
