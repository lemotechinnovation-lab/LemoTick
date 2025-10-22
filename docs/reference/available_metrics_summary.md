# Available LemoTick Metrics Summary

## ✅ **Available Metrics (Confirmed Working):**

### **Bot Status Metrics:**
- `up{job="lemotick-bot"}` - Bot running status (1 = running, 0 = stopped)

### **Trading Metrics:**
- `lemotick_trades_profit_total` - Total profit from winning trades
- `lemotick_trades_loss_total` - Total loss from losing trades
- `lemotick_trades_profit_created` - Timestamp when profit metric was created
- `lemotick_trades_loss_created` - Timestamp when loss metric was created

## ❌ **NOT Available (Don't Use):**
- `lemotick_trades_active` - This metric does not exist
- `lemotick_trades_total` - This metric does not exist
- `lemotick_bot_equity` - This metric does not exist
- `lemotick_ema_fast` - This metric does not exist
- `lemotick_ema_slow` - This metric does not exist
- `lemotick_momentum` - This metric does not exist
- `lemotick_volatility` - This metric does not exist
- `lemotick_rsi` - This metric does not exist

## 🎯 **Working Dashboard Panels:**

### **Panel 1: Bot Status**
- **Query**: `up{job="lemotick-bot"}`
- **Shows**: 1 (running) or 0 (stopped)

### **Panel 2: Total Profit**
- **Query**: `lemotick_trades_profit_total`
- **Shows**: 0 (no trades) or actual profit amount

### **Panel 3: Total Loss**
- **Query**: `lemotick_trades_loss_total`
- **Shows**: 0 (no trades) or actual loss amount

### **Panel 4: Bot Running (Duplicate)**
- **Query**: `up{job="lemotick-bot"}`
- **Shows**: 1 (running) or 0 (stopped)

### **Panel 5: Profit Trades (Duplicate)**
- **Query**: `lemotick_trades_profit_total`
- **Shows**: 0 (no trades) or actual profit amount

### **Panel 6: Loss Trades (Duplicate)**
- **Query**: `lemotick_trades_loss_total`
- **Shows**: 0 (no trades) or actual loss amount

### **Panel 7: Trading Activity (Duplicate)**
- **Query**: `lemotick_trades_profit_total`
- **Shows**: 0 (no trades) or actual profit amount

### **Panel 8: System Health (Duplicate)**
- **Query**: `up{job="lemotick-bot"}`
- **Shows**: 1 (running) or 0 (stopped)

## 📊 **Current Status:**
- **Bot is running**: ✅ (up{job="lemotick-bot"} = 1)
- **No trades yet**: ✅ (all trade metrics = 0)
- **Metrics are being scraped**: ✅ (Prometheus can see them)
- **Dashboard will show 0 values**: ✅ (not "No data")

## 🔧 **Key Points:**
1. **Only 2 unique metrics available**: `up` and `lemotick_trades_profit_total`/`lemotick_trades_loss_total`
2. **No active trades metric**: Use `up` status as proxy
3. **No technical indicators**: Not implemented yet
4. **Dashboard will have duplicates**: This is normal with limited metrics
5. **All panels will work**: No "No data" issues with proper configuration

**The dashboard will work with these available metrics!** 🎉
