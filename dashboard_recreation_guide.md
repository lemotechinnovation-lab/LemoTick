# Recreate Grafana Dashboard - Simple Guide

## 🎯 **Quick Dashboard Recreation**

### **Step 1: Access Grafana**
- **URL**: http://localhost:3000
- **Username**: admin
- **Password**: admin

### **Step 2: Create New Dashboard**
1. Click **"+"** in left sidebar
2. Select **"Dashboard"**
3. Click **"Add new panel"**

### **Step 3: Configure Data Source**
1. Click **"Add data source"**
2. Select **"Prometheus"**
3. **URL**: `http://prometheus:9090`
4. Click **"Save & Test"**

### **Step 4: Create 5 Complete Panels (All Available Metrics)**

#### **Panel 1: Bot Status**
- **Title**: Bot Status
- **Query**: `up{job="lemotick-bot"}`
- **Visualization**: Stat
- **Position**: Top-left
- **Panel Settings**: No value = "0", Null value mode = "Connected"
- **Expected**: Shows `1` when bot is running, `0` when stopped

#### **Panel 2: Total Profit**
- **Title**: Total Profit
- **Query**: `lemotick_trades_profit_total`
- **Visualization**: Stat
- **Unit**: Currency USD
- **Position**: Top-right
- **Panel Settings**: No value = "0", Null value mode = "Connected"
- **Expected**: Shows `0` until bot executes profitable trades

#### **Panel 3: Total Loss**
- **Title**: Total Loss
- **Query**: `lemotick_trades_loss_total`
- **Visualization**: Stat
- **Unit**: Currency USD
- **Position**: Middle-left
- **Panel Settings**: No value = "0", Null value mode = "Connected"
- **Expected**: Shows `0` until bot executes losing trades

#### **Panel 4: Profit Created**
- **Title**: Profit Created
- **Query**: `lemotick_trades_profit_created`
- **Visualization**: Stat
- **Position**: Middle-right
- **Panel Settings**: No value = "0", Null value mode = "Connected"
- **Expected**: Shows timestamp when profit metric was created
- **Note**: Will show Unix timestamp (e.g., 1760912765)

#### **Panel 5: Loss Created**
- **Title**: Loss Created
- **Query**: `lemotick_trades_loss_created`
- **Visualization**: Stat
- **Position**: Bottom-center
- **Panel Settings**: No value = "0", Null value mode = "Connected"
- **Expected**: Shows timestamp when loss metric was created
- **Note**: Will show Unix timestamp (e.g., 1760912765)

### **Step 5: Configure Panel Settings (IMPORTANT)**

For each panel, you MUST configure these settings to show `0` instead of "No data":

#### **For Each Panel:**
1. **Click on Panel** → **Edit**
2. **Go to Panel Options** → **Field** tab
3. **Set these values:**
   - **No value**: `0`
   - **Null value mode**: `Connected`
   - **Show**: `All values`
4. **Click Apply** → **Save Panel**

#### **Repeat for all 5 panels!**

### **Step 6: Dashboard Settings**
1. **Time Range**: Last 5 minutes
2. **Refresh**: 5 seconds
3. **Save Dashboard**: "LemoTick Trading Bot Dashboard"

## 🔧 **Troubleshooting**

### **If "No Data" Appears:**
1. **Check Bot Status Panel**: Should show "1" if bot is running
2. **Check Prometheus**: http://localhost:9090
3. **Check Bot Metrics**: http://localhost:8000/metrics
4. **Check Bot Logs**: Look for database errors

### **If You Get Regex Errors:**
1. **Error**: `parse error: error parsing regexp: invalid nested repetition operator: *+`
2. **Cause**: Complex queries with mathematical operations
3. **Solution**: Use simple queries only (no +, -, /, * operators)
4. **Working Queries**: `up{job="lemotick-bot"}`, `lemotick_trades_profit_total`, `lemotick_trades_loss_total`

### **If Panels Show "No Data" Instead of Zero:**
1. **Problem**: Metrics exist but show `0` values, Grafana interprets as "No data"
2. **Solution**: Use `or vector(0)` in queries to force zero values
3. **Example**: `lemotick_trades_profit_total or vector(0)`
4. **Alternative**: Configure panel settings:
   - **Panel Options** → **Field** → **No value**: "0"
   - **Null value mode**: "Connected"

### **If Calculated Queries Cause Regex Errors:**
1. **Problem**: Complex queries with `+`, `-`, `/`, `*` may cause regex errors
2. **Solution**: Use simple queries and Grafana transformations instead
3. **Alternative**: Create separate panels for each metric, then use Grafana's built-in math
4. **Fallback**: Use only basic metrics without calculations

### **Expected Behavior:**
- **Bot Status**: Should show `1` (bot running)
- **All Other Panels**: Will show `0` until bot executes trades
- **This is NORMAL** - Dashboard will populate once bot starts trading

### **If Prometheus Shows No Metrics:**
1. **Restart Bot**: `docker-compose -f docker-compose.monitoring.yml restart lemotick-bot`
2. **Check Database Errors**: Look for "database is locked" in logs
3. **Clear Data**: Stop containers, delete data/ and logs/ folders, restart

### **If Bot Status Shows 0:**
1. **Bot is not running** - Check Docker containers
2. **Restart monitoring stack**: `docker-compose -f docker-compose.monitoring.yml up -d`
3. **Check bot logs**: `docker logs lemotick-bot`

### **If All Panels Show 0:**
1. **This is expected** - Bot hasn't executed trades yet
2. **Wait for bot to trade** - Dashboard will populate automatically
3. **Check bot is processing ticks** - Look for tick processing in logs

## 📊 **Expected Results**

### **Before Bot Trades (Current State):**
- **Bot Status**: 1 (Bot running) ✅
- **Total Profit**: $0 (No profitable trades) ✅
- **Total Loss**: $0 (No losing trades) ✅
- **Profit Created**: 0 (No profit metric created yet) ✅
- **Loss Created**: 0 (No loss metric created yet) ✅

### **After Bot Trades (Future State):**
- **Bot Status**: 1 (Bot running) ✅
- **Total Profit**: $X.XX (Real profit from winning trades) ✅
- **Total Loss**: $X.XX (Real loss from losing trades) ✅
- **Profit Created**: Timestamp (When profit metric was created) ✅
- **Loss Created**: Timestamp (When loss metric was created) ✅

## 🎯 **Success Criteria**

Dashboard is working when:
1. All panels load without errors
2. Bot Status shows "1"
3. Other panels show data once bot trades
4. Auto-refresh works
5. Time range selector works

## ⚠️ **Important Notes**

### **Regex Error Fix:**
- **Problem**: Complex queries with `+`, `-`, `/`, `*` cause regex errors
- **Solution**: Use simple queries only (no mathematical operations)
- **Working**: `up{job="lemotick-bot"}`, `lemotick_trades_profit_total`, `lemotick_trades_loss_total`

### **Panel Strategy:**
- **Simple Queries**: Avoid complex calculations in Prometheus queries
- **Multiple Panels**: Use separate panels for different metrics
- **Grafana Transformations**: Use Grafana's built-in math functions if needed

**The dashboard will populate with real data once the bot executes trades!**
