# 📚 LemoTick Documentation Index

**Last Updated:** October 25, 2025

## 🎯 Quick Navigation

| I want to... | Go to... |
|--------------|----------|
| Set up the system | [Setup Guide](docs/guides/setup_guide.md) |
| Deploy the bot | [Deployment Instructions](docs/guides/deployment_instructions.md) |
| Go live with real money | [Live Deployment Guide](docs/guides/live_deployment_guide.md) |
| Understand the strategy | [Current Strategy](docs/reference/current_strategy.md) |
| Use candlestick patterns | [Candlestick Pattern Guide](docs/guides/candlestick_pattern_guide.md) |
| Fix a problem | [Troubleshooting](docs/troubleshooting/) |
| Monitor performance | [Monitoring Setup](docs/guides/monitoring_setup_guide.md) |

## 📁 Documentation Structure

```
docs/
├── README.md                          # Documentation hub
├── guides/                            # Step-by-step guides
│   ├── setup_guide.md
│   ├── deployment_instructions.md
│   ├── live_deployment_guide.md
│   ├── live_deployment_checklist.md
│   ├── live_account_toggle.md
│   ├── ready_to_trade.md
│   ├── market_selection_guide.md
│   ├── candlestick_pattern_guide.md  # Candlestick trading + current setup
│   ├── mobile_monitoring_setup.md
│   ├── docker_rebuild_instructions.md
│   ├── monitoring_setup_guide.md
│   ├── grafana_startup_guide.md
│   ├── grafana_logs_guide.md
│   └── BOT_OPTIMIZATION_HIGH_FREQUENCY_WINS.md
│
├── reference/                         # Technical documentation
│   ├── current_strategy.md
│   ├── code_analysis_report.md
│   ├── monitoring_review.md
│   ├── architecture.md
│   ├── risk_manager_md.md
│   ├── critical_safety_fix.md
│   ├── docker_rebuild_required.md
│   ├── STRATEGY_COMPARISON_MATRIX.md
│   └── lemo_tick_bot_blueprint.md
│
├── troubleshooting/                   # Problem-solving guides
│   ├── docker_troubleshooting.md
│   ├── grafana_dashboard_troubleshooting.md
│   ├── fix_no_data_issue.md
│   └── immediate_trading_solution.md
│
├── business requirements document/    # Regulatory compliance
│   └── South_African_Regulatory_Requirements_LemoTick.md
│
├── code_cleanup_summary.md            # Recent cleanup
├── bot_cleanup_summary.md             # Bot-specific cleanup
├── implementation_summary.md          # Feature status
└── project_structure.md               # Repo organization
```

## 🚀 Getting Started Path

### For New Users

1. **[Setup Guide](docs/guides/setup_guide.md)** - Install dependencies and configure
2. **[Market Selection](docs/guides/market_selection_guide.md)** - Choose your trading markets
3. **[Monitoring Setup](docs/guides/monitoring_setup_guide.md)** - Set up Grafana dashboards
4. **[Current Strategy](docs/reference/current_strategy.md)** - Understand the trading logic
5. **[Deployment Instructions](docs/guides/deployment_instructions.md)** - Run the bot

### For Going Live

1. **[Live Deployment Checklist](docs/guides/live_deployment_checklist.md)** - Pre-flight checks
2. **[Live Deployment Guide](docs/guides/live_deployment_guide.md)** - Complete live setup
3. **[Live Account Toggle](docs/guides/live_account_toggle.md)** - Switch to real account
4. **[Ready to Trade](docs/guides/ready_to_trade.md)** - Final verification

### For Troubleshooting

Browse **[docs/troubleshooting/](docs/troubleshooting/)** or check these common issues:

- **Docker not starting**: [Docker Troubleshooting](docs/troubleshooting/docker_troubleshooting.md)
- **No data in Grafana**: [Fix No Data Issue](docs/troubleshooting/fix_no_data_issue.md)
- **Dashboard errors**: [Grafana Troubleshooting](docs/troubleshooting/grafana_dashboard_troubleshooting.md)

## 📖 Core Documentation Files

### In Root Directory

- **[README.md](README.md)** - Project overview and quick start (Trading Bot)
- **[README-InvestorManagement.md](README-InvestorManagement.md)** - Backend system documentation
- **[LICENSE](LICENSE)** - MIT License
- **[pyrightconfig.json](pyrightconfig.json)** - Python type checking config
- **[start_system.py](start_system.py)** - System startup script
- **[test_integration.py](test_integration.py)** - Integration tests

### Bot-Specific Documentation

Located in `bot/` folder:
- **[ACCOUNT_TOGGLE_GUIDE.md](bot/ACCOUNT_TOGGLE_GUIDE.md)** - Demo/Live switching
- **[SMALL_ACCOUNT_GUIDE.md](bot/SMALL_ACCOUNT_GUIDE.md)** - Trading with small capital
- **[STRATEGY_QUICK_REFERENCE.md](bot/STRATEGY_QUICK_REFERENCE.md)** - Strategy cheat sheet

## 🔄 Recent Updates

### October 25, 2025 - Candlestick Pattern Detection Module Added

**New Features:**
- ✅ Added comprehensive candlestick pattern detection (14 patterns)
- ✅ Created trading strategy with trend/momentum filters
- ✅ Added pattern detection examples and integration guide
- ✅ Full documentation in [Candlestick Pattern Guide](docs/guides/candlestick_pattern_guide.md)

**Files Added:**
- `bot/src/indicators/candlestick_patterns.py` - Pattern detector
- `bot/src/strategies/candlestick_strategy.py` - Trading strategy
- `bot/src/examples/candlestick_pattern_example.py` - Usage examples
- `docs/guides/candlestick_pattern_guide.md` - Full documentation

### October 25, 2025 - Documentation Reorganization

**Changes:**
- ✅ All documentation moved to `docs/` folder
- ✅ Created clear folder structure (guides/reference/troubleshooting)
- ✅ Added comprehensive README in docs/
- ✅ Created this navigation index
- ✅ Updated all README files with proper links
- ✅ Removed redundant documentation
- ✅ Standardized file naming (lowercase with underscores)

**Previous Updates:**
- Bot folder cleanup - See [Bot Cleanup Summary](docs/bot_cleanup_summary.md)
- Code quality improvements - See [Code Cleanup Summary](docs/code_cleanup_summary.md)
- Implementation status - See [Implementation Summary](docs/implementation_summary.md)

## 💡 Tips for Navigating

1. **Start with the main [README.md](README.md)** for project overview
2. **Use [docs/README.md](docs/README.md)** as your documentation hub
3. **Bookmark this index** for quick navigation
4. **Use Ctrl+F** to search for specific topics
5. **Check troubleshooting** first when encountering issues

## 🆘 Need Help?

1. **Common Issues**: Check [docs/troubleshooting/](docs/troubleshooting/)
2. **Strategy Questions**: Read [Current Strategy](docs/reference/current_strategy.md)
3. **Setup Problems**: Follow [Setup Guide](docs/guides/setup_guide.md)
4. **Architecture Questions**: See [Architecture](docs/reference/architecture.md)

---

**Note:** This documentation is actively maintained. If you find any broken links or outdated information, please create an issue or submit a pull request.

