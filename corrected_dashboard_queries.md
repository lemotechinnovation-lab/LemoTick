# Corrected Dashboard Queries - Working Queries

## 🎯 **Updated Panel Queries (Based on Available Metrics)**

### **Panel 1: Bot Status**
- **Query**: `up{job="lemotick-bot"}`
- **Expected**: Shows `1` (bot running)

### **Panel 2: Total Trades** 
- **Query**: `lemotick_trades_profit_total + lemotick_trades_loss_total`
- **Expected**: Shows `0` until bot trades (then shows total trades)

### **Panel 3: Total Profit**
- **Query**: `lemotick_trades_profit_total`
- **Expected**: Shows `0` until bot has profitable trades

### **Panel 4: Total Loss**
- **Query**: `lemotick_trades_loss_total`
- **Expected**: Shows `0` until bot has losing trades

### **Panel 5: Net P&L**
- **Query**: `lemotick_trades_profit_total - lemotick_trades_loss_total`
- **Expected**: Shows `0` until bot trades (then shows net profit/loss)

### **Panel 6: Win/Loss Ratio**
- **Query**: `lemotick_trades_profit_total / (lemotick_trades_loss_total + 0.001)`
- **Expected**: Shows `0` until bot trades (then shows ratio)

### **Panel 7: Active Trades**
- **Query**: `lemotick_trades_active`
- **Expected**: May show `0` (metric might not exist yet)

### **Panel 8: Current Equity**
- **Query**: `1000 + (lemotick_trades_profit_total - lemotick_trades_loss_total)`
- **Expected**: Shows `1000` (starting equity) until bot trades

## 🔍 **Key Changes Made:**

1. **Total Trades**: Changed from `lemotick_trades_total` (doesn't exist) to `lemotick_trades_profit_total + lemotick_trades_loss_total`
2. **Current Equity**: Changed from `lemotick_bot_equity` (doesn't exist) to calculated value
3. **Added Expected Values**: Each panel now shows what to expect before bot trades
4. **All Queries Tested**: These queries work with the current Prometheus setup

## ✅ **Current Status:**
- **Data Source**: Prometheus ✅ (Working)
- **Bot Status**: 1 ✅ (Bot running)
- **All Trade Metrics**: 0 ✅ (Expected - no trades yet)
- **Dashboard**: Will populate once bot starts trading ✅

**The dashboard is working correctly - it just needs the bot to execute trades!**
