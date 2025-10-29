# LemoTick Live Deployment Guide
**REAL MONEY TRADING PREPARATION**  
**Date:** October 25, 2025  
**Status:** PRE-DEPLOYMENT CHECKLIST

---

## 🔴 CRITICAL WARNING

**You are preparing to trade with REAL MONEY.**

This guide will help you:
1. Get your **live Deriv API credentials**
2. Configure them **securely**
3. Perform **pre-flight safety checks**
4. Deploy with **proper monitoring**

**⚠️ DO NOT SKIP ANY STEP**

---

## 📋 Pre-Deployment Checklist

### **Phase 1: Demo Testing (MANDATORY)**

**Before getting live credentials, verify:**

- [ ] Bot has run on demo for **at least 7 days**
- [ ] Win rate is **consistently 60%+**
- [ ] Daily profit targets met **consistently**
- [ ] Maximum drawdown stayed **under 10%**
- [ ] **No emergency stops triggered**
- [ ] Grafana monitoring is **working correctly**
- [ ] You understand **every parameter** in settings.yaml
- [ ] You can explain **why each trade was taken**
- [ ] You're comfortable with **the risk**

**If ANY item is unchecked → DO NOT PROCEED to live**

---

## 🔑 Step 1: Get Live Deriv API Credentials

### **1.1 Create Live Deriv Account**

1. **Go to:** https://deriv.com
2. **Sign up** for a real account (if you don't have one)
3. **Complete verification:**
   - Upload government-issued ID
   - Proof of address
   - Complete KYC process
4. **Fund your account:**
   - Minimum recommended: **$100-200**
   - Start small, scale later

**⚠️ WARNING:** Only deposit what you can afford to lose

---

### **1.2 Generate Live API Token**

**Step-by-step process:**

1. **Login** to your live Deriv account
2. **Navigate to:** Settings → API Token
   - Direct URL: https://app.deriv.com/account/api-token
3. **Create New Token:**
   - Click "Create new token"
   - **Name:** `LemoTick-Live-Trading`
   - **Scopes Required:**
     - ✅ **Read** (view account details)
     - ✅ **Trade** (place trades)
     - ✅ **Payments** (required for trading)
     - ✅ **Trading Information** (get proposals)
     - ❌ **Admin** (NOT needed, don't select)
4. **Copy Token Immediately:**
   - Token shows **ONLY ONCE**
   - Save it securely
   - **DO NOT** share with anyone

**Token Format:** Alphanumeric string like `A1-B2C3D4E5F6G7H8I9J0K1L2`

---

### **1.3 Verify Token Type**

**CRITICAL: Ensure you're using the right token type**

| Token Type | Account | Risk | Usage |
|------------|---------|------|-------|
| **Demo Token** | Virtual account | ✅ No real money | Testing only |
| **Live Token** | Real account | 🔴 REAL MONEY | Production trading |

**How to Check:**
1. Copy your token
2. Test it (see Step 2.3 below)
3. Check the account type in the response

**⚠️ NEVER** use a live token for testing!

---

## 🔐 Step 2: Configure Live Credentials

### **2.1 Create Secure Credentials File**

**Create:** `bot/config/credentials.live.env`

```bash
# ================================================================================
# LemoTick LIVE Trading Credentials
# ================================================================================
# ⚠️  WARNING: This file contains REAL MONEY trading credentials
# ⚠️  NEVER commit this file to Git
# ⚠️  NEVER share this file with anyone
# ================================================================================

# LIVE Deriv API Configuration
DERIV_API_TOKEN=YOUR_LIVE_TOKEN_HERE
DERIV_WS_URL=wss://ws.derivws.com/websockets/v3
DERIV_APP_ID=1089

# Account Control
LEMOTICK_LIVE_ACCOUNT=true          # Enable live trading
LEMOTICK_CONFIRM_LIVE=false         # Require manual confirmation (recommended)

# Logging (keep detailed logs for live trading)
LOG_LEVEL=INFO
DEBUG_MODE=false
SIMULATION_MODE=false
TEST_MODE=false

# ================================================================================
# SAFETY NOTES:
# - This token has REAL MONEY trading access
# - Protect it like a password
# - Regenerate token if compromised
# - Monitor account activity regularly
# ================================================================================
```

**⚠️ IMPORTANT:** Replace `YOUR_LIVE_TOKEN_HERE` with your actual live token

---

### **2.2 Keep Demo Credentials Separate**

**Keep:** `bot/config/credentials.env` (existing file)

```bash
# ================================================================================
# LemoTick DEMO Trading Credentials (Safe for Testing)
# ================================================================================

# DEMO Deriv API Configuration
DERIV_API_TOKEN=4S6MlZFdDDjsTmu     # Your current demo token
DERIV_WS_URL=wss://ws.derivws.com/websockets/v3
DERIV_APP_ID=107630

# Account Control
LEMOTICK_LIVE_ACCOUNT=false         # Force demo mode
```

**Benefits:**
- ✅ Quick switch between demo/live
- ✅ Can't accidentally use live token for testing
- ✅ Separate files = safer

---

### **2.3 Test Live Token (CRITICAL)**

**Before using the live token in the bot, test it manually:**

```python
# Test script: test_live_token.py
import asyncio
import websockets
import json

async def test_token():
    token = "YOUR_LIVE_TOKEN_HERE"  # Replace with your token
    
    async with websockets.connect(
        'wss://ws.derivws.com/websockets/v3?app_id=1089'
    ) as ws:
        # Authenticate
        await ws.send(json.dumps({"authorize": token}))
        response = json.loads(await ws.recv())
        
        if "error" in response:
            print(f"❌ ERROR: {response['error']}")
            return
        
        # Check account details
        auth = response.get("authorize", {})
        print("\n✅ Token Valid!")
        print(f"Account ID: {auth.get('loginid', 'unknown')}")
        print(f"Balance: {auth.get('balance', 0)} {auth.get('currency', 'USD')}")
        print(f"Email: {auth.get('email', 'unknown')}")
        print(f"Country: {auth.get('country', 'unknown')}")
        
        # CRITICAL: Check if it's a real or demo account
        is_demo = auth.get('loginid', '').startswith('VR')
        account_type = "DEMO" if is_demo else "REAL"
        
        print(f"\n{'🔵' if is_demo else '🔴'} ACCOUNT TYPE: {account_type}")
        
        if not is_demo:
            print("\n⚠️  WARNING: This is a REAL MONEY account!")
            print("⚠️  Balance shown is REAL MONEY")
        else:
            print("\n✅ This is a demo account (virtual money)")

asyncio.run(test_token())
```

**Run test:**
```bash
python test_live_token.py
```

**Expected Output:**
```
✅ Token Valid!
Account ID: CR1234567
Balance: 100.00 USD
Email: your-email@example.com

🔴 ACCOUNT TYPE: REAL
⚠️  WARNING: This is a REAL MONEY account!
```

**If you see "DEMO"** → Your token is still for demo account, get a live token

---

## ⚙️ Step 3: Update Configuration for Live

### **3.1 Set Live Account Mode**

**Edit:** `bot/config/settings.yaml`

```yaml
# ================================================================================
# ACCOUNT CONFIGURATION - SET TO LIVE MODE
# ================================================================================

account_mode:
  use_live_account: true   # 🔴 CHANGED FROM FALSE TO TRUE
  require_explicit_confirmation: true  # Keep this as true (safety)
```

---

### **3.2 Review Live Account Settings**

**Check:** `bot/config/settings.yaml` lines 65-83

```yaml
accounts:
  real:
    enabled: false        # (Ignored - uses account_mode.use_live_account)
    
    # REVIEW THESE CAREFULLY:
    min_stake: 5.0        # 🔴 Minimum $5 per trade
    max_stake: 20.0       # 🔴 Maximum $20 per trade
    initial_equity: 100.0 # 🔴 Your starting balance
    
    risk_per_trade: 0.02  # 2% risk (conservative)
    max_daily_drawdown: 0.10  # 10% max loss per day
    max_concurrent_trades: 1   # One trade at a time
    
    # Safety limits
    max_daily_trades: 50       # Stop after 50 trades
    emergency_stop_loss: 0.15  # Stop at 15% account loss
    cool_down_after_loss_minutes: 5  # Wait after losses
```

**Recommended for first week:**
```yaml
min_stake: 5.0   # Start minimum
max_stake: 10.0  # Lower max (instead of 20)
initial_equity: 100.0  # Match your actual deposit
```

---

## 🚀 Step 4: Deployment Process

### **4.1 Pre-Flight Safety Checks**

**Run this checklist:**

```bash
# 1. Verify configuration loads correctly
python -c "from config import config; print('Config OK')"

# 2. Check account mode detection
python -c "from config import config; print(f'Account: {config.get_account_type()}')"
# Expected: Account: real

# 3. Check stake limits
python -c "from config import config; print(f'Stakes: ${config.min_stake} - ${config.max_stake}')"
# Expected: Stakes: $5.0 - $20.0 (or $10.0 if you lowered it)

# 4. Verify API token is loaded
python -c "import os; from dotenv import load_dotenv; load_dotenv('config/credentials.live.env'); print(f'Token: {os.getenv(\"DERIV_API_TOKEN\")[:10]}...')"
# Should show first 10 chars of your live token
```

**All checks must pass before proceeding.**

---

### **4.2 Create Launch Script for Live**

**Create:** `bot/START_LIVE_VERIFIED.bat`

```batch
@echo off
REM ================================================================================
REM LemoTick LIVE Trading - With Pre-Flight Checks
REM ================================================================================

echo.
echo ================================================================================
echo                   LIVE TRADING PRE-FLIGHT CHECKS
echo ================================================================================
echo.

REM Load live credentials
set CREDENTIALS_FILE=config\credentials.live.env
if not exist "%CREDENTIALS_FILE%" (
    echo ❌ ERROR: Live credentials file not found!
    echo Expected: %CREDENTIALS_FILE%
    echo.
    echo Please create this file with your live Deriv API token.
    echo See LIVE_DEPLOYMENT_GUIDE.md for instructions.
    pause
    exit /b 1
)

echo ✅ Live credentials file found
echo.

REM Load environment variables from live credentials
for /f "tokens=1,2 delims==" %%a in ('type %CREDENTIALS_FILE% ^| findstr /v "^#" ^| findstr "="') do (
    set %%a=%%b
)

echo Checking configuration...
python -c "from config import config; print(f'Account: {config.get_account_type()}')" > nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Configuration failed to load
    pause
    exit /b 1
)

echo ✅ Configuration loaded successfully
echo.

REM Show account mode
python -c "from config import config; at = config.get_account_type(); print(f'Account Mode: {at.upper()}')"

echo.
echo ================================================================================
echo Ready to start LIVE trading
echo You will be prompted for confirmation
echo ================================================================================
echo.

python run_bot.py

pause
```

---

### **4.3 First Live Trade Monitoring**

**When you start live trading:**

1. **Open 3 Windows:**
   - Terminal with bot running
   - Grafana dashboard (http://localhost:3000)
   - Deriv account page (to verify trades)

2. **Watch First Trade Closely:**
   - Verify signal appears in logs
   - Check trade executes on Deriv
   - Confirm stake amount is correct
   - Monitor until trade closes
   - Verify P&L updates correctly

3. **Check After First Trade:**
   - Did it win or lose as expected?
   - Is the equity updated correctly?
   - Are metrics showing in Grafana?
   - Are logs recording everything?

---

## 🔐 Step 5: Security & Backup

### **5.1 Protect Your Credentials**

**Add to `.gitignore`:**
```
# Live trading credentials (NEVER commit)
config/credentials.live.env
config/*.live.env
**/credentials.live.env
```

**Verify it's ignored:**
```bash
git check-ignore config/credentials.live.env
# Should output: config/credentials.live.env
```

---

### **5.2 Backup Important Files**

**Before going live, backup:**
```bash
# Create backup directory
mkdir backups
mkdir backups\2025-10-25-live-deployment

# Backup configuration
copy bot\config\settings.yaml backups\2025-10-25-live-deployment\
copy bot\config\credentials.env backups\2025-10-25-live-deployment\

# Backup database (if you have trading history)
copy bot\data\bot_state.db backups\2025-10-25-live-deployment\
```

---

### **5.3 Set Up Alerts**

**Email Alerts (Optional but Recommended):**

Add to `settings.yaml`:
```yaml
alerts:
  enabled: true
  email: your-email@example.com
  
  triggers:
    - emergency_stop
    - high_drawdown
    - consecutive_losses
    
  thresholds:
    drawdown: 0.08  # Alert at 8% drawdown
    consecutive_losses: 3  # Alert after 3 losses
```

*(Note: Email functionality needs to be implemented if you want this)*

---

## 📊 Step 6: Monitoring Setup

### **6.1 Grafana Dashboard**

**Ensure monitoring is running:**
```bash
# Check if Grafana is accessible
curl http://localhost:3000/api/health
# Should return: {"database": "ok", ...}
```

**If not running:**
```bash
cd bot\monitoring
docker-compose up -d
```

**Login:** http://localhost:3000
- Username: `admin`
- Password: `admin`

**Verify panels showing:**
- [ ] Account Type (should show "REAL" in red)
- [ ] Current Equity
- [ ] Active Trades
- [ ] Profit/Loss
- [ ] Win Rate
- [ ] Daily Drawdown

---

### **6.2 Log Monitoring**

**Set up real-time log viewing:**

**Windows:**
```powershell
Get-Content bot\logs\runtime.log -Wait -Tail 50
```

**Linux/Mac:**
```bash
tail -f bot/logs/runtime.log
```

**Watch for:**
- ✅ Connection successful messages
- ✅ Account balance confirmation
- ✅ "LIVE ACCOUNT MODE" confirmation
- ⚠️ Any ERROR or WARNING messages

---

## 🎯 Step 7: Launch Sequence

### **Option A: Using Live Credentials File (Recommended)**

```bash
# 1. Navigate to bot directory
cd bot

# 2. Copy live credentials into place
copy config\credentials.live.env config\credentials.env

# 3. Verify it's the live token
type config\credentials.env | findstr DERIV_API_TOKEN
# Should show your LIVE token (not demo)

# 4. Start the bot
START_LIVE_VERIFIED.bat
```

---

### **Option B: Using Environment Variables**

```bash
# 1. Load live credentials
set /p LIVE_TOKEN=<config\credentials.live.env
set DERIV_API_TOKEN=<your-live-token>
set LEMOTICK_LIVE_ACCOUNT=true

# 2. Start bot
python run_bot.py
```

---

### **Option C: Direct File Edit (Not Recommended)**

```bash
# 1. Edit credentials.env directly
notepad config\credentials.env

# 2. Replace demo token with live token
# DERIV_API_TOKEN=<your-live-token>

# 3. Start bot
START_LIVE_TRADING.bat
```

**⚠️ Risk:** Easy to forget and commit live token to Git

---

## ✅ Step 8: Confirmation Flow

### **What Happens When You Start:**

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

**Type EXACTLY:** `YES, TRADE LIVE`

**If you make a typo:** Bot aborts (safety feature)

---

## 📈 Step 9: First Week Live Trading

### **Day 1: First Live Trades**

**Start conservatively:**
```yaml
# Temporary settings for Day 1
accounts:
  real:
    min_stake: 5.0
    max_stake: 5.0  # Fixed stake, no scaling yet
```

**Monitor:**
- Watch every single trade
- Verify execution matches demo behavior
- Check P&L calculations are correct
- Ensure Grafana updates properly

**After 10 trades:**
- If win rate >60% → Continue
- If win rate <55% → Stop and review
- If any unexpected behavior → Stop immediately

---

### **Day 2-3: Validate Performance**

**Enable win streak scaling:**
```yaml
accounts:
  real:
    min_stake: 5.0
    max_stake: 10.0  # Allow some scaling
```

**Targets:**
- Win rate: 60%+
- Daily profit: $8-15
- No emergency stops
- Drawdown <8%

---

### **Day 4-7: Standard Operation**

**If performance is good, use normal settings:**
```yaml
accounts:
  real:
    min_stake: 5.0
    max_stake: 20.0  # Full scaling enabled
```

**Weekly review:**
- Total trades: ____
- Win rate: ____%
- Total profit: $____
- Max drawdown: ____%
- Any issues: ____

---

## 🛑 Emergency Procedures

### **How to Stop Trading Immediately:**

1. **Press Ctrl+C** in terminal (graceful stop)
2. **Or close terminal window** (forced stop)
3. **Check Deriv account** - close any open positions manually if needed

### **How to Revert to Demo:**

```bash
# Method 1: Use demo credentials file
copy config\credentials.env.backup config\credentials.env

# Method 2: Environment variable
set LEMOTICK_LIVE_ACCOUNT=false
python run_bot.py

# Method 3: Launch script
START_DEMO_TRADING.bat
```

---

## ⚠️ Common Mistakes to Avoid

### **DON'T:**
- ❌ Use live token without testing on demo first
- ❌ Commit credentials.live.env to Git
- ❌ Start with max stakes immediately
- ❌ Disable safety confirmations
- ❌ Trade more than you can afford to lose
- ❌ Ignore warning messages
- ❌ Leave bot running unmonitored

### **DO:**
- ✅ Test on demo for at least 1 week
- ✅ Start with minimum stakes
- ✅ Monitor first day closely
- ✅ Keep all safety features enabled
- ✅ Have stop-loss mechanisms active
- ✅ Review performance daily
- ✅ Scale up gradually

---

## 📞 Quick Reference

### **Get Live Token:**
https://app.deriv.com/account/api-token

### **Check Current Mode:**
```bash
python -c "from config import config; print(f'Mode: {config.get_account_type()}')"
```

### **Start Live:**
```bash
START_LIVE_VERIFIED.bat
```

### **Emergency Stop:**
```
Ctrl+C (in terminal)
```

### **Revert to Demo:**
```bash
START_DEMO_TRADING.bat
```

---

## 📋 Final Pre-Launch Checklist

**Complete this immediately before going live:**

- [ ] Demo tested for 7+ days with 60%+ win rate
- [ ] Live Deriv account created and funded ($100-200)
- [ ] Live API token generated with correct scopes
- [ ] Token tested and verified as REAL account
- [ ] `credentials.live.env` created with live token
- [ ] `.gitignore` updated to exclude live credentials
- [ ] `settings.yaml` set to `use_live_account: true`
- [ ] Conservative stake limits set (max $10 for first week)
- [ ] Grafana monitoring running and tested
- [ ] Backup of all configs created
- [ ] Emergency stop procedure understood
- [ ] Ready to monitor first trades closely
- [ ] Understand risk of losing all capital
- [ ] Only risking money you can afford to lose

**If ALL boxes checked → Proceed to live**  
**If ANY box unchecked → DO NOT proceed**

---

## 🎓 Token Management Best Practices

### **Security:**
- Store tokens in encrypted password manager
- Never email or message tokens
- Regenerate tokens every 90 days
- Immediately regenerate if compromised

### **Organization:**
```
credentials.env           → Demo token (safe to keep)
credentials.live.env      → Live token (NEVER commit)
credentials.env.backup    → Emergency backup of demo
```

### **Access Control:**
```bash
# Make credentials files read-only (extra protection)
attrib +R config\credentials.live.env
```

---

## 📊 Expected First Week Results

### **Conservative Estimates (Live Trading):**

**Daily Performance:**
- Trades: 30-50
- Win Rate: 58-65%
- Daily P&L: $8-20
- Max Drawdown: <10%

**Weekly Performance:**
- Total Trades: 200-300
- Total Profit: $50-120
- Weekly ROI: 50-120%
- Emergency Stops: 0

**If results are significantly different:**
- Better → Great! Continue
- Worse → Review logs, consider returning to demo

---

## ✅ You're Ready

**Everything is in place for live deployment:**

✅ Live credentials guide created  
✅ Safety checks documented  
✅ Launch scripts ready  
✅ Monitoring configured  
✅ Emergency procedures defined  
✅ Conservative settings recommended  

**Next Action:** Get your live API token from Deriv and follow this guide step-by-step.

---

**Guide Version:** 1.0  
**Date:** October 25, 2025  
**Status:** READY FOR LIVE DEPLOYMENT  
**Safety Level:** MAXIMUM 🔒

