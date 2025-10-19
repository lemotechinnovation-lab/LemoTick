# LemoTick - Deriv API Trading Bot

A comprehensive, production-ready tick-level trading bot for Deriv API with real-time signal generation, risk management, and automated execution.

## Features

- **Real-time Tick Streaming**: WebSocket-based tick data processing with incremental indicators
- **Advanced Signal Engine**: EMA-based signals with momentum and volatility filters
- **Risk Management**: Position sizing, daily loss limits, cooldown mechanisms
- **Robust Execution**: Deriv API integration with proposal/buy flow and retry logic
- **Data Persistence**: SQLite database for trades and CSV files for tick data
- **Backtesting**: Historical data replay for strategy validation
- **Monitoring**: Comprehensive logging and performance metrics
- **Docker Ready**: Containerized deployment with docker-compose

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Deriv WS      │───▶│  Stream Handler │───▶│ Strategy Engine │
│   Tick Feed     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Store    │◀───│  Risk Manager   │◀───│ Trade Executor  │
│   (SQLite/CSV)  │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Quick Start

1. **Clone and Setup**
   ```bash
   git clone <your-repo>
   cd LemoTick
   ```

2. **Configure Environment**
   ```bash
   cp config/credentials.env.example config/credentials.env
   # Edit config/credentials.env with your Deriv API token
   ```

3. **Run with Docker**
   ```bash
   docker-compose up --build
   ```

4. **Or Run Locally**
   ```bash
   pip install -r requirements.txt
   python -m src
   ```

## Configuration

- `config/settings.yaml`: Trading parameters, thresholds, and strategy settings
- `config/credentials.env`: API tokens and sensitive configuration
- Environment variables for Docker deployment

## Development

Built with VS Code in mind. Includes:
- Comprehensive type hints
- Modular architecture for easy testing
- Extensive logging and monitoring
- Unit tests for all components

## Risk Disclaimer

This software is for educational purposes. Trading involves substantial risk of loss. Test thoroughly on demo accounts before live trading.

## License

MIT License - see LICENSE file for details.

