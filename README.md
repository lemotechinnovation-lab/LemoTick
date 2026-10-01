# LemoTick

### Trading automation, real-time visibility, and investor management.

**LemoTick** is a trading automation and investor management project developed by **Leonard Masina** under **LemoTech Innovations**. It combines a Python trading bot, a C#/.NET backend, and a React administration dashboard.

The project explores the complete flow from market data and strategy signals to execution, trade records, and management interfaces.

## Project scope

- **Trading bot:** Deriv API integration, real-time streaming, indicator calculations, strategy signals, and position management.
- **Backend API:** authentication, investors, portfolios, trades, transactions, performance metrics, and notifications.
- **Administration dashboard:** management interfaces, charts, and trading visibility.
- **Component communication:** backend clients and SignalR-related integration.
- **Deployment tooling:** Azure pipeline definitions, PowerShell deployment tooling, and backend Docker configuration.

The project is under development. Strategy performance, integration completeness, and production readiness require independent validation.

## Technology stack

| Area | Technologies |
| --- | --- |
| Trading bot | Python 3.9+, asyncio, WebSockets, pandas, NumPy, Pydantic |
| Trading integration | Deriv API |
| Backend API | C#, ASP.NET Core, .NET 8 |
| Data access | Entity Framework Core; PostgreSQL and SQL Server provider references |
| Backend patterns and tooling | MediatR, AutoMapper, JWT authentication, Serilog, Swagger/OpenAPI |
| Dashboard | React, TypeScript, Vite, Material UI, charting libraries |
| Real-time communication | SignalR and WebSocket clients |
| Deployment | Azure Pipelines, Docker, PowerShell |

## Repository guide

| Directory or file | Purpose |
| --- | --- |
| [lemotickautostart/](lemotickautostart/) | Python bot package, configuration template, and bot documentation |
| [backend/API/](backend/API/) | ASP.NET Core application and API endpoints |
| [backend/Application/](backend/Application/) | Application logic |
| [backend/Core/](backend/Core/) | Core models and abstractions |
| [backend/Infrastructure/](backend/Infrastructure/) | Data access and infrastructure |
| [backend/Services/](backend/Services/) | Service implementations |
| [backend/BotIntegration/](backend/BotIntegration/) | Bot integration components |
| [backend/Tests/](backend/Tests/) | Backend test project |
| [admin-dashboard/](admin-dashboard/) | React administration dashboard |
| [azure-pipelines/](azure-pipelines/) | Backend, dashboard, and bot pipeline definitions |
| [deploy.ps1](deploy.ps1) | Deployment script |

## Strategy and configuration

The Python package includes indicator calculations for RSI, MACD, Bollinger Bands, and EMA, alongside a strategy module named `macd_rsi_realtime.py`.

Review the current source and environment configuration for the actual strategy behaviour. Earlier documentation may describe different folder layouts, indicators, or defaults. No fixed win rate or profitability claim is made here.

## Getting started

### Prerequisites

- Git.
- Python 3.9 or later for the bot.
- .NET 8 SDK for the backend.
- Node.js and npm compatible with the dashboard's package requirements.
- PostgreSQL, or Docker for the supplied PostgreSQL setup.
- A Deriv demo account and API configuration for bot evaluation.

### Clone the repository

```bash
git clone https://github.com/lemotechinnovation-lab/LemoTick.git
cd LemoTick
```

### Backend API

Start with the [backend setup documentation](backend/README.md). Configure the development database connection, authentication settings, and required integrations before launching the API.

From the repository root:

```bash
dotnet restore backend/InvestorManagementSystem.sln
dotnet run --project backend/API/InvestorManagementSystem.API.csproj
```

The backend also includes [PostgreSQL Docker configuration](backend/docker-compose.postgres.yml) and Postman collection/environment files. Check connection settings and migration requirements before applying database changes.

### Administration dashboard

From the repository root:

```bash
cd admin-dashboard
npm install
cp .env.example .env
```

Set the API and real-time connection values for your local backend, then start the dashboard:

```bash
npm run dev
```

On Windows, you can copy the configuration template using File Explorer or PowerShell's `Copy-Item`.

### Python trading bot

The bot lives in **`lemotickautostart/`**. Review its [documentation](lemotickautostart/README.md), [dependency metadata](lemotickautostart/pyproject.toml), and `.env.example` before running it.

Use an isolated Python environment, install dependencies from the current package metadata, and configure a demo account. The existing bot README references a `requirements.txt` file that is absent from the current tree, so verify the package setup rather than relying on that older command.

Do not assume the backend, dashboard, and bot will connect without configuration. Validate each component and its integration points separately.

## Development checks

- Backend: `dotnet test backend/InvestorManagementSystem.sln`.
- Dashboard: `npm run type-check`, `npm run lint`, and `npm run build` from `admin-dashboard/`.
- Bot: development and test dependencies are declared in `pyproject.toml`; check available tests before using the configured pytest commands.

These checks are available development entry points. This README does not certify that the project passes them in a fresh environment.

## Trading risk

Trading can result in loss of capital. This software does not guarantee returns and is not investment advice. Evaluate strategies with a demo account, review risk settings, and verify execution behaviour before considering live use.

## Feedback and contributions

Open an issue with the component, reproduction steps, and relevant logs with sensitive values removed. Submit focused pull requests explaining the change and how it was validated.

## About the creator

Created by **Leonard Masina**, combining backend engineering, full-stack development, and trading automation experimentation.

**Organisation:** [LemoTech Innovations](https://github.com/lemotechinnovation-lab)  
**Related project:** [LemoTechs — service and operations platform](https://github.com/lemotechinnovation-lab/LemoTechs)
