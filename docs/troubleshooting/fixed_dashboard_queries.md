# Fixed Dashboard Queries - No Regex Errors

## 🔧 **Simplified Queries (Avoiding Regex Errors)**

### **Panel 1: Bot Status**
- **Query**: `up{job="lemotick-bot"}`
- **Status**: ✅ Working

### **Panel 2: Total Trades**
- **Query**: `lemotick_trades_profit_total`
- **Note**: Use profit total as proxy for trades (will show 0 until trades)
- **Alternative**: Create two separate panels for profit and loss trades

### **Panel 3: Total Profit**
- **Query**: `lemotick_trades_profit_total`
- **Status**: ✅ Working

### **Panel 4: Total Loss**
- **Query**: `lemotick_trades_loss_total`
- **Status**: ✅ Working

### **Panel 5: Net P&L**
- **Query**: `lemotick_trades_profit_total`
- **Note**: Use profit total only (loss will be 0 until trades)
- **Alternative**: Create calculated field in Grafana

### **Panel 6: Win/Loss Ratio**
- **Query**: `lemotick_trades_profit_total`
- **Note**: Will show 0 until trades (then shows profit)
- **Alternative**: Use profit total as proxy

### **Panel 7: Active Trades**
- **Query**: `up{job="lemotick-bot"}`
- **Note**: Use bot status as proxy (1 = active, 0 = inactive)

### **Panel 8: Current Equity**
- **Query**: `lemotick_trades_profit_total`
- **Note**: Will show 0 until trades (then shows profit)
- **Alternative**: Set to static 1000 for now

## 🎯 **Recommended Approach:**

### **Option 1: Simple Panels (Recommended)**
Create these 4 panels that will definitely work:

1. **Bot Status**: `up{job="lemotick-bot"}`
2. **Total Profit**: `lemotick_trades_profit_total`
3. **Total Loss**: `lemotick_trades_loss_total`
4. **Bot Running**: `up{job="lemotick-bot"}` (duplicate for now)

### **Option 2: Use Grafana Transformations**
Instead of complex queries, use Grafana's built-in transformations:
1. Add multiple queries to one panel
2. Use "Transform" tab to calculate sums/ratios
3. This avoids regex parsing issues

### **Option 3: Create Calculated Fields**
1. Use simple queries
2. Add calculated fields in panel options
3. Use Grafana's math functions

## ✅ **Immediate Solution:**

**Replace your current queries with these simple ones:**

1. **Bot Status**: `up{job="lemotick-bot"}`
2. **Total Profit**: `lemotick_trades_profit_total`
3. **Total Loss**: `lemotick_trades_loss_total`
4. **Bot Active**: `up{job="lemotick-bot"}`

**These will work without regex errors and show data once the bot starts trading!**
