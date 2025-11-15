# LemoTick - Intelligent Trading Bot

A production-ready algorithmic trading bot for Deriv API featuring **Candlestick Pattern Strategy** with advanced risk management and real-time monitoring.

## 🎯 Current Strategy: Candlestick Pattern Detection

**Active Configuration** (5-minute R_100 scalping):
- **Pattern Detection**: Hammer, Doji, Engulfing patterns
- **EMA Confirmation**: 6/18 EMA trend validation
- **Contract Duration**: 15 minutes (ensures 2-candlestick timing)
- **Signal Quality**: 50%+ threshold with candlestick confidence
- **Position Sizing**: Fixed $0.05 contracts with $0.10 stop loss
- **Timing**: Trades close after exactly 2 candlesticks complete

## ✨ Core Features

- **Candlestick Strategy**: Pattern-based signal generation
- **Precise Timing**: Trades close after 2nd candlestick completion
- **Low Risk**: $0.05 contracts with $0.10 stop loss
- **Real-time Monitoring**: Prometheus + Grafana dashboards
- **Smart Risk Management**: Dynamic drawdown protection
- **Multi-Environment**: Demo and Live trading support
- **VPS Deployment**: Production-ready AlmaLinux deployment
- **WebSocket Streaming**: Sub-second tick processing from Deriv API
- **Early Closure Detection**: Tick-based SL/TP system for optimal exits
- **Docker Ready**: Full containerization with monitoring stack

## 📐 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│   Deriv WS      │───▶│  Stream Handler │───▶│ Triple EMA       │
│   Tick Feed     │    │  (Real-time)    │    │ + MACD Engine    │
└─────────────────┘    └─────────────────┘    └──────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│  Prometheus     │◀───│  Risk Manager   │◀───│  Trade Executor  │
│  Metrics        │    │  (Win Scaling)  │    │  (Deriv API)     │
└─────────────────┘    └─────────────────┘    └──────────────────┘
         │
         ▼
┌─────────────────┐
│    Grafana      │
│   Dashboards    │
└─────────────────┘
```

## 📚 Documentation

**[📖 Complete Documentation](docs/README.md)** | **[🗺️ Documentation Index](DOCUMENTATION_INDEX.md)**

Quick Links:
- **[Setup Guide](docs/guides/setup_guide.md)** - Get started
- **[Deployment Guide](docs/guides/deployment_instructions.md)** - Deploy the bot
- **[Live Trading Guide](docs/guides/live_deployment_guide.md)** - Go live with real money
- **[Current Strategy](docs/reference/current_strategy.md)** - Active strategy details
- **[Troubleshooting](docs/troubleshooting/)** - Fix common issues

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Deriv API account
- Windows/Linux environment

### Installation

#### Option 1: Main Deployment Manager (Recommended)
```powershell
# Deploy to VPS (AlmaLinux)
.\deploy.ps1 vps deploy

# Deploy locally (Windows)
.\deploy.ps1 local deploy

# Deploy with Docker
.\deploy.ps1 docker deploy
```

#### Option 2: Manual Installation
1. Clone repository
2. Install dependencies: `pip install -r bot/requirements.txt`
3. Configure credentials in `bot/config/credentials.env`
4. Run: `python bot/run_bot.py`

### Management
```powershell
# Check status
.\deploy.ps1 vps status

# View logs
.\deploy.ps1 vps logs

# Restart service
.\deploy.ps1 vps restart
```

## ⚙️ Configuration

### Single Source of Truth: `bot/config/settings.yaml`

**Key Parameters:**
```yaml
trading:
  symbol: R_100                    # Volatility 100 Index
  contract_duration: 5             # Minutes (adaptive)
  min_stake: 1.0                   # Minimum position size
  max_stake: 5.0                   # Maximum (for win-streak scaling)

strategy:
  ema_short_period: 3              # Fast EMA
  ema_medium_period: 8             # Medium EMA
  ema_long_period: 21              # Long EMA
  macd_fast_period: 3
  macd_slow_period: 8
  signal_quality_min_score: 0.70   # 70% quality threshold
  
risk_management:
  max_concurrent_trades: 1         # One trade at a time
  win_streak_bonus: 0.15           # 15% increase per win
  loss_penalty: 0.25               # 25% reduction per loss
  emergency_stop_drawdown: 0.15    # Stop at 15% drawdown
```

**Credentials:** `bot/config/credentials.env`

## 📊 Monitoring & Metrics

**Prometheus Metrics** (http://localhost:8000/metrics):
- Active trades count
- Real-time profit/loss
- Win rate percentage
- Account equity
- EMA/MACD indicator values
- Trade execution times

**Grafana Dashboards** (http://localhost:3000):
- Trading performance overview
- Risk management metrics
- Technical indicator charts
- System health monitoring

## 🧪 Development

**Technology Stack:**
- Python 3.9+ with asyncio
- WebSocket for real-time data
- Prometheus + Grafana for monitoring
- Docker for deployment
- SQLite for data persistence

**Code Quality:**
- Type hints throughout
- Modular architecture
- Comprehensive logging
- Clean code principles

## 📁 Project Structure

```
LemoTick/
├── bot/                          # Python trading bot
│   ├── src/                      # Source code
│   │   ├── core/                 # Bot engine & config
│   │   ├── strategy_engine.py    # Triple EMA + MACD
│   │   ├── risk_manager.py       # Risk management
│   │   ├── trade_executor.py     # Deriv API integration
│   │   └── metrics.py            # Prometheus metrics
│   ├── config/                   # Configuration
│   │   ├── settings.yaml         # Strategy parameters
│   │   └── credentials.env       # API credentials
│   ├── monitoring/               # Grafana dashboards
│   └── docker-compose.yml        # Container setup
├── backend/                      # .NET investor management (future)
├── docs/                         # Documentation
│   ├── guides/                   # How-to guides
│   ├── reference/                # Technical docs
│   └── troubleshooting/          # Problem solving
├── README.md                     # This file
├── README-InvestorManagement.md  # Backend docs
└── CODE_CLEANUP_SUMMARY.md       # Cleanup history
```

## 📚 Documentation

- **[Setup Guide](docs/guides/setup_guide.md)** - Complete installation
- **[Monitoring Guide](docs/guides/monitoring_setup_guide.md)** - Grafana setup
- **[Deployment](DEPLOYMENT_INSTRUCTIONS.md)** - Production deployment
- **[Project Structure](PROJECT_STRUCTURE.md)** - Architecture overview
- **[Cleanup Summary](CODE_CLEANUP_SUMMARY.md)** - Recent code cleanup

## ⚠️ Risk Disclaimer

**This software is for educational purposes only.** Trading involves substantial risk of loss. Always:
- Test thoroughly on **demo accounts** before live trading
- Never risk more than you can afford to lose
- Understand the strategy before deploying
- Monitor performance regularly

**Current Configuration:** Demo account with $50 initial equity

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Follow existing code style
4. Add tests for new features
5. Submit a pull request

---

**Status:** ✅ Production-ready | 🔄 Active Development  
**Version:** 2.0 (Triple EMA + MACD)  
**Last Updated:** December 2024

