# LemoTick Account Toggle Guide

## 🎯 Quick Start

### Option 1: Use Launch Scripts (Recommended)

**Demo Trading (Safe):**
```batch
# Windows
START_DEMO_TRADING.bat

# Linux/Mac
./start_demo_trading.sh
```

**Live Trading (Real Money):**
```batch
# Windows
START_LIVE_TRADING.bat

# Linux/Mac
./start_live_trading.sh
```

---

## ⚙️ Configuration Methods

### Method 1: Environment Variable (Highest Priority)

Set environment variable before running:

```bash
# Enable LIVE trading (real money)
export LEMOTICK_LIVE_ACCOUNT=true
python run_bot.py

# Force DEMO mode (safe)
export LEMOTICK_LIVE_ACCOUNT=false
python run_bot.py
```

**Windows:**
```batch
set LEMOTICK_LIVE_ACCOUNT=true
python run_bot.py
```

---

### Method 2: Configuration File

Edit `bot/config/settings.yaml`:

```yaml
account_mode:
  use_live_account: false  # Set to true for LIVE trading
  require_explicit_confirmation: true  # Safety feature
```

**Settings:**
- `use_live_account: false` → Demo mode (default, safe)
- `use_live_account: true` → Live mode (real money)
- `require_explicit_confirmation: true` → Requires typing "YES, TRADE LIVE"
- `require_explicit_confirmation: false` → Skips confirmation (dangerous!)

---

## 🔒 Safety Features

### 1. Explicit Confirmation Required

When starting in LIVE mode, you'll see:

```
================================================================================
🔴 WARNING: LIVE ACCOUNT MODE DETECTED!
================================================================================
Account Type: REAL / LIVE
Risk Level: ⚠️  REAL MONEY TRADING ENABLED
================================================================================
Min Stake: $5.00
Max Stake: $20.00
Initial Equity: $100.00
Risk Per Trade: 2.0%
================================================================================
🛑 EXPLICIT CONFIRMATION REQUIRED
================================================================================
You are about to start trading with REAL MONEY.
Type 'YES, TRADE LIVE' to confirm, or anything else to abort.
================================================================================
Confirm live trading: _
```

**You must type exactly:** `YES, TRADE LIVE`

**Any other input will abort the bot.**

---

### 2. Auto-Confirmation (Advanced Users Only)

To skip interactive confirmation (NOT RECOMMENDED):

```bash
export LEMOTICK_CONFIRM_LIVE=true
export LEMOTICK_LIVE_ACCOUNT=true
python run_bot.py
```

**⚠️ WARNING:** Only use this for automated deployments where you're 100% certain you want live trading.

---

### 3. Configuration Priority

The bot checks account mode in this order:

1. **Environment Variable** `LEMOTICK_LIVE_ACCOUNT` (highest priority)
2. **Config File** `account_mode.use_live_account`
3. **Legacy** `development.demo_account` (backward compatibility)
4. **Default** Demo mode (safe fallback)

---

## 📊 Account-Specific Settings

### Demo Account Settings

Located in `settings.yaml` under `accounts.demo`:

```yaml
accounts:
  demo:
    min_stake: 3.0        # Lower risk for testing
    max_stake: 5.0        # Lower limits
    initial_equity: 50.0  # Smaller account
    risk_per_trade: 0.03  # 3% risk (aggressive for testing)
    max_daily_drawdown: 0.15  # 15% drawdown limit
```

### Live Account Settings

Located in `settings.yaml` under `accounts.real`:

```yaml
accounts:
  real:
    min_stake: 5.0        # 🔴 REAL MONEY
    max_stake: 20.0       # 🔴 Higher limits for scaling
    initial_equity: 100.0 # 🔴 Larger account
    risk_per_trade: 0.02  # 2% risk (more conservative)
    max_daily_drawdown: 0.10  # 10% drawdown limit (stricter)
    
    # Additional safety for live trading
    max_daily_trades: 50
    emergency_stop_loss: 0.15
    cool_down_after_loss_minutes: 5
```

**Key Differences:**
- Live account has **more conservative** risk settings
- Live account has **stricter** drawdown limits
- Live account has **additional** safety mechanisms

---

## 🧪 Testing Before Live

### Recommended Testing Process:

1. **Test on Demo Account:**
   ```bash
   ./START_DEMO_TRADING.bat
   ```

2. **Run for at least 1 week** on demo:
   - Track win rate (target: 60%+)
   - Monitor drawdowns (should be <10%)
   - Verify all features work correctly

3. **Start Small on Live:**
   - Set `min_stake: 5.0` and `max_stake: 10.0` initially
   - Trade for 1 week with small stakes
   - Gradually increase limits as confidence grows

4. **Scale Up Gradually:**
   - Only increase stakes after proven success
   - Never risk more than you can afford to lose

---

## 🛠️ Troubleshooting

### Bot Won't Start in Live Mode

**Check:**
1. Is `use_live_account` set to `true`?
2. Did you confirm with "YES, TRADE LIVE"?
3. Are environment variables set correctly?

**Debug:**
```bash
# Check what mode the bot detects
python -c "from config import config; print(f'Account type: {config.get_account_type()}')"
```

---

### Force Demo Mode

**Quick override to demo mode:**
```bash
export LEMOTICK_LIVE_ACCOUNT=false
python run_bot.py
```

This overrides ALL config file settings.

---

## 📈 Monitoring Account Mode

### Check Current Mode in Grafana

The **Account Type panel** shows:
- `DEMO` (blue) = Demo account
- `REAL` (red) = Live account

### Check in Logs

Look for startup messages:
```
🔵 DEMO ACCOUNT MODE ACTIVE
Account Type: DEMO (Paper Trading)
Risk Level: SAFE - No real money at risk
```

or

```
🔴 WARNING: LIVE ACCOUNT MODE DETECTED!
Account Type: REAL / LIVE
Risk Level: ⚠️  REAL MONEY TRADING ENABLED
```

---

## ⚠️ Important Warnings

### DO NOT:
- ❌ Enable live trading without thorough demo testing
- ❌ Disable `require_explicit_confirmation` unless you know what you're doing
- ❌ Use live account with aggressive risk settings
- ❌ Trade with money you can't afford to lose

### ALWAYS:
- ✅ Test thoroughly on demo first
- ✅ Start with small stakes on live
- ✅ Monitor performance closely
- ✅ Keep `require_explicit_confirmation: true`
- ✅ Have stop-loss mechanisms enabled

---

## 📞 Support

If you encounter issues:
1. Check the logs in `bot/logs/runtime.log`
2. Verify configuration with the debug command above
3. Review this guide carefully
4. Start with demo mode if uncertain

---

**Last Updated:** October 25, 2025  
**Version:** 2.0  
**Status:** Production-ready with safety features

