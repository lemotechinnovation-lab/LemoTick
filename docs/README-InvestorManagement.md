# LemoTick Investor Management System

## 🏗️ Enterprise-Grade Architecture

This is the transformation of LemoTick from an educational trading bot into a comprehensive investor management platform. The system follows enterprise-grade patterns with clear separation of concerns and scalability in mind.

## 📁 Project Structure

```
LemoTick/
│
├── frontend/                    # React TypeScript applications
│   ├── investor-portal/        # Investor dashboard and management
│   ├── admin-dashboard/         # Admin operations and analytics
│   └── shared/                 # Shared UI components and utilities
│
├── backend/                    # .NET Core backend with Clean Architecture
│   ├── Application/            # Business logic, CQRS, DTOs
│   ├── Core/                   # Domain entities, enums, interfaces
│   ├── Infrastructure/         # Data access, external integrations
│   ├── Services/               # Background services and jobs
│   ├── API/                    # REST API controllers and endpoints
│   ├── Tests/                  # Unit and integration tests
│   └── BotIntegration/         # Python bot integration layer
│
├── bot/                        # Python trading bot (refactored)
│   ├── src/
│   │   ├── strategies/          # Trading strategies
│   │   ├── indicators/         # Technical indicators
│   │   ├── core/               # Core bot engine and utilities
│   │   ├── services/           # WebSocket, API connectors
│   │   └── integrations/       # Backend communication
│   ├── config/                 # Configuration files
│   ├── logs/                   # Bot logs
│   └── tests/                  # Bot tests
│
├── docs/                       # Documentation and architecture
├── scripts/                    # Deployment and CI/CD scripts
└── docker/                     # Containerization setup
```

## 🎯 Key Features

### Investor Management
- **Investor Registration & KYC**: Complete investor onboarding process
- **Portfolio Management**: Multiple portfolios per investor with risk controls
- **Performance Tracking**: Real-time performance metrics and reporting
- **Transaction Management**: Deposits, withdrawals, profit distributions

### Trading Bot Integration
- **Real-time Trading**: Live market data processing and trade execution
- **Risk Management**: Portfolio-level and system-wide risk controls
- **Performance Analytics**: Comprehensive performance tracking
- **Notification System**: Real-time alerts and updates

### Security & Compliance
- **Authentication & Authorization**: JWT-based security
- **Data Protection**: POPIA compliance for South African operations
- **Audit Logging**: Comprehensive audit trails
- **Risk Controls**: Multi-level risk management

## 🚀 Getting Started

### Prerequisites
- .NET 8.0 SDK
- Node.js 18+ and npm/yarn
- Python 3.9+
- SQL Server or PostgreSQL
- Docker (optional)

### Backend Setup (.NET Core)
```bash
cd backend
dotnet restore
dotnet build
dotnet run --project API
```

### Frontend Setup (React)
```bash
cd frontend/investor-portal
npm install
npm start

cd frontend/admin-dashboard
npm install
npm start
```

### Bot Setup (Python)
```bash
cd bot
pip install -r requirements.txt
python src/main.py
```

## 🏛️ Architecture Patterns

### Clean Architecture
- **Core**: Domain entities and business rules
- **Application**: Use cases and business logic
- **Infrastructure**: Data access and external services
- **API**: Presentation layer and controllers

### CQRS (Command Query Responsibility Segregation)
- **Commands**: Write operations (Create, Update, Delete)
- **Queries**: Read operations (Get, List, Search)
- **Handlers**: Business logic implementation

### Domain-Driven Design
- **Entities**: Core business objects
- **Value Objects**: Immutable objects
- **Aggregates**: Consistency boundaries
- **Repositories**: Data access abstraction

## 🔧 Technology Stack

### Backend (.NET Core)
- **Framework**: .NET 8.0
- **ORM**: Entity Framework Core
- **Authentication**: JWT Bearer tokens
- **Logging**: Serilog
- **API Documentation**: Swagger/OpenAPI

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit
- **UI Library**: Material-UI or Ant Design
- **Charts**: Chart.js or D3.js
- **Routing**: React Router

### Bot (Python)
- **Framework**: asyncio for async operations
- **WebSocket**: websockets for real-time data
- **HTTP Client**: aiohttp for API communication
- **Data Processing**: pandas, numpy
- **Logging**: Python logging with structured logging

## 📊 Database Schema

### Core Entities
- **Investors**: User accounts and profiles
- **Portfolios**: Investment portfolios with risk settings
- **Trades**: Individual trade records
- **Transactions**: Financial transactions
- **PerformanceMetrics**: Performance tracking data
- **Notifications**: System notifications

### Relationships
- Investor → Portfolios (1:many)
- Portfolio → Trades (1:many)
- Investor → Transactions (1:many)
- Portfolio → PerformanceMetrics (1:many)

## 🔐 Security Considerations

### Authentication
- JWT-based authentication
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

## 📈 Performance Monitoring

### Metrics
- Trading performance
- System performance
- User engagement
- Risk metrics

### Logging
- Structured logging with Serilog
- Audit trails for compliance
- Error tracking and monitoring

## 🚀 Deployment

### Docker Support
- Multi-container setup
- Environment-specific configurations
- Health checks and monitoring

### CI/CD Pipeline
- Automated testing
- Code quality checks
- Deployment automation

## 📚 Documentation

- **API Documentation**: Swagger/OpenAPI
- **Architecture Diagrams**: Mermaid diagrams
- **User Guides**: Step-by-step instructions
- **Developer Documentation**: Technical specifications

## 🤝 Contributing

1. Follow the established architecture patterns
2. Write comprehensive tests
3. Document all public APIs
4. Follow security best practices
5. Ensure compliance requirements

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Legal Disclaimer

This software is for educational and research purposes only. Trading involves substantial risk of loss. Test thoroughly on demo accounts before live trading. Users should never risk more than they can afford to lose.
