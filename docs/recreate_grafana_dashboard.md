# Recreate Grafana Dashboard - Complete Guide

## 🎯 **Step-by-Step Dashboard Recreation**

### **Step 1: Access Grafana**
1. **Open Grafana**: http://localhost:3000
2. **Login**: 
   - Username: `admin`
   - Password: `admin`

### **Step 2: Create New Dashboard**
1. **Click "+"** in the left sidebar
2. **Select "Dashboard"**
3. **Click "Add new panel"**

### **Step 3: Configure Data Source**
1. **Click "Add data source"** (if not already configured)
2. **Select "Prometheus"**
3. **URL**: `http://prometheus:9090`
4. **Click "Save & Test"**

### **Step 4: Create Dashboard Panels**

#### **Panel 1: Bot Status**
- **Title**: "Bot Status"
- **Query**: `up{job="lemotick-bot"}`
- **Visualization**: Stat
- **Value**: Last (not null)
- **Thresholds**: 
  - Green: 1 (Bot running)
  - Red: 0 (Bot down)

#### **Panel 2: Total Trades**
- **Title**: "Total Trades"
- **Query**: `lemotick_trades_total`
- **Visualization**: Stat
- **Value**: Last (not null)
- **Unit**: Short

#### **Panel 3: Total Profit**
- **Title**: "Total Profit"
- **Query**: `lemotick_trades_profit_total`
- **Visualization**: Stat
- **Value**: Last (not null)
- **Unit**: Currency USD

#### **Panel 4: Total Loss**
- **Title**: "Total Loss"
- **Query**: `lemotick_trades_loss_total`
- **Visualization**: Stat
- **Value**: Last (not null)
- **Unit**: Currency USD

#### **Panel 5: Net P&L**
- **Title**: "Net P&L"
- **Query**: `lemotick_trades_profit_total - lemotick_trades_loss_total`
- **Visualization**: Stat
- **Value**: Last (not null)
- **Unit**: Currency USD
- **Thresholds**:
  - Green: > 0 (Profit)
  - Red: < 0 (Loss)

#### **Panel 6: Win/Loss Ratio**
- **Title**: "Win/Loss Ratio"
- **Query**: `lemotick_trades_profit_total / (lemotick_trades_loss_total + 0.001)`
- **Visualization**: Stat
- **Value**: Last (not null)
- **Unit**: Short
- **Decimals**: 2

#### **Panel 7: Active Trades**
- **Title**: "Active Trades"
- **Query**: `lemotick_trades_active`
- **Visualization**: Stat
- **Value**: Last (not null)
- **Unit**: Short

#### **Panel 8: Current Equity**
- **Title**: "Current Equity"
- **Query**: `lemotick_bot_equity`
- **Visualization**: Stat
- **Value**: Last (not null)
- **Unit**: Currency USD

### **Step 5: Dashboard Layout**
1. **Arrange panels** in 2x4 grid
2. **Set time range** to "Last 5 minutes"
3. **Enable auto-refresh** to 5 seconds
4. **Save dashboard** as "LemoTick Trading Bot Dashboard"

### **Step 6: Test Dashboard**
1. **Check if panels show data**
2. **If "No data" appears**:
   - Verify Prometheus is scraping bot metrics
   - Check bot is running without database errors
   - Wait for bot to execute trades

## 🔧 **Troubleshooting**

### **If Dashboard Shows "No Data":**
1. **Check Prometheus**: http://localhost:9090
2. **Check Bot Metrics**: http://localhost:8000/metrics
3. **Check Bot Logs**: Look for database errors
4. **Restart Bot**: If database errors persist

### **If Prometheus Shows No Metrics:**
1. **Check bot is running**: `docker ps`
2. **Check bot logs**: `docker logs lemotick-bot`
3. **Restart monitoring stack**: `docker-compose -f docker-compose.monitoring.yml restart`

## 📊 **Expected Dashboard Behavior**

### **Before Bot Trades:**
- Bot Status: 1 ✅
- Total Trades: No data ❌
- Total Profit: No data ❌
- Total Loss: No data ❌

### **After Bot Trades:**
- Bot Status: 1 ✅
- Total Trades: 5+ ✅
- Total Profit: $X.XX ✅
- Total Loss: $X.XX ✅
- Net P&L: $X.XX ✅
- Win/Loss Ratio: X.XX ✅

## 🎯 **Success Criteria**

Dashboard is working correctly when:
1. **All panels load** without errors
2. **Bot Status shows 1** (bot is running)
3. **Other panels show data** once bot starts trading
4. **Auto-refresh works** (updates every 5 seconds)
5. **Time range selector works** (Last 5 minutes, etc.)

**The dashboard will populate with real data once the bot executes trades!** 🚀
