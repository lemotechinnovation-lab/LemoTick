# LemoTick Bot Configuration

This directory contains configuration files for the LemoTick trading bot.

## Configuration Files

### Main Configuration
- **`settings.yaml`** - Main bot configuration
  - Trading parameters
  - Risk management settings
  - Strategy configuration
  - Account-specific settings (demo/real)
  - Indicator parameters
  - Monitoring and logging settings

### Credential Files

#### Active Credentials (Not in Git)
- **`credentials.demo.env`** - Demo account credentials
  - Virtual money trading
  - Safe for testing
  - API token with demo account access
  
- **`credentials.live.env`** - Live account credentials
  - **⚠️ REAL MONEY TRADING**
  - Contains live Deriv API token
  - Protected - not committed to Git
  - Requires explicit confirmation to use

#### Example Templates
- **`credentials.env.example`** - Basic credential template
  - Copy to create new credential files
  - Shows required environment variables
  - Safe to commit to Git
  
- **`credentials.live.env.example`** - Live trading template
  - Comprehensive documentation
  - Safety warnings and instructions
  - Step-by-step setup guide
  - Security best practices

## Usage

### For Demo Trading (Virtual Money)
The bot uses `credentials.demo.env` by default:
```bash
# Demo credentials are already configured
python run_bot.py
```

### For Live Trading (Real Money)
**⚠️ WARNING: Real money at risk!**

1. Ensure `credentials.live.env` exists with your live token
2. Set environment variable or update settings:
```bash
# Method 1: Environment variable
set LEMOTICK_LIVE_ACCOUNT=true

# Method 2: Use live trading script
START_LIVE_TRADING.bat
```

3. The bot will require explicit confirmation before live trading

## Security Notes

### Protected Files (Not in Git)
These files contain sensitive API tokens:
- `credentials.demo.env` ⚠️
- `credentials.live.env` ⚠️

**Never commit these files to version control!**

### Safe Files (Can be in Git)
These are example templates without real credentials:
- `credentials.env.example` ✅
- `credentials.live.env.example` ✅
- `settings.yaml` ✅ (no secrets)

## Configuration Quick Reference

### Switching Between Accounts

#### Demo Account
```yaml
# In settings.yaml:
account_mode:
  use_live_account: false
```

#### Live Account  
```yaml
# In settings.yaml:
account_mode:
  use_live_account: true
  require_explicit_confirmation: true
```

Or use environment variable (overrides config):
```bash
LEMOTICK_LIVE_ACCOUNT=true
```

### Key Settings in settings.yaml

#### Account-Specific Settings
```yaml
accounts:
  demo:
    min_stake: 3.0
    max_stake: 5.0
    initial_equity: 50.0
    risk_per_trade: 0.03  # 3%
    
  real:
    min_stake: 0.35
    max_stake: 1.0
    initial_equity: 50.0
    risk_per_trade: 0.0035  # 0.35% (ultra-conservative)
```

#### Trading Parameters
```yaml
trading:
  contract_duration: 5  # minutes
  symbol: R_100
  contract_basis: stake
```

#### Strategy Configuration
```yaml
strategy:
  exponential_ema_strategy: true
  mean_reversion_enabled: true
  tick_pattern_enabled: true
  signal_quality_min_score: 0.70
```

#### Risk Management
```yaml
risk_management:
  max_concurrent_trades: 1
  max_daily_trades: 20
  max_daily_drawdown: 0.05  # 5%
  cooldown_seconds: 5.0
```

## Environment Variables

### Required
- `DERIV_API_TOKEN` - Your Deriv API token
- `DERIV_APP_ID` - Deriv application ID

### Optional
- `LEMOTICK_LIVE_ACCOUNT` - Enable live trading (true/false)
- `LEMOTICK_CONFIRM_LIVE` - Auto-confirm live mode (true/false)
- `LOG_LEVEL` - Logging level (DEBUG/INFO/WARNING/ERROR)
- `DEBUG_MODE` - Enable debug mode (true/false)

## File Structure
```
bot/config/
├── README.md                       # This file
├── settings.yaml                   # Main configuration
├── credentials.demo.env            # Demo credentials (not in Git)
├── credentials.live.env            # Live credentials (not in Git)
├── credentials.env.example         # Basic template
└── credentials.live.env.example    # Live template with docs
```

## Safety Features

### Account Validation
The bot validates account configuration before starting:
- Checks if live account is being used
- Requires explicit user confirmation
- Displays account type and risk parameters
- Prevents accidental live trading

### Risk Protections
- Maximum daily drawdown limits
- Maximum consecutive loss protection
- Emergency stop-loss triggers
- Trade cooldown periods
- Strict position sizing

### Monitoring
- Real-time metrics via Prometheus
- Dashboard visualization via Grafana
- Log aggregation via Loki
- Alert system for errors and drawdowns

## Getting Started

1. **Copy example credentials:**
   ```bash
   cp credentials.env.example credentials.demo.env
   ```

2. **Add your demo token:**
   Edit `credentials.demo.env` and add your Deriv demo API token

3. **Review settings:**
   Check `settings.yaml` and adjust parameters as needed

4. **Start demo trading:**
   ```bash
   python run_bot.py
   ```

5. **Monitor performance:**
   Open Grafana dashboard at http://localhost:3000

## Support

For issues or questions:
- Check logs in `bot/logs/`
- Review documentation in `docs/`
- Consult troubleshooting guides in `docs/troubleshooting/`

---

**⚠️ IMPORTANT:** Always test thoroughly on demo account before enabling live trading!

