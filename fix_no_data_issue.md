# Fix "No Data" Issue in Grafana Dashboard

## 🔍 **Problem Identified:**

The metrics exist in Prometheus but show `0` values:
- `lemotick_trades_profit_total`: `0` ✅ (exists)
- `lemotick_trades_loss_total`: `0` ✅ (exists)  
- `up{job="lemotick-bot"}`: `1` ✅ (bot running)

**Grafana shows "No data" instead of `0` because:**
1. The metrics have `0` values
2. Grafana's default behavior treats `0` as "no data"
3. Need to configure panels to show `0` values

## ✅ **Solution: Configure Panels to Show Zero Values**

### **Step 1: Update Panel Settings**

For each panel in Grafana:

1. **Go to Panel Options** → **Field** tab
2. **Set "No value" behavior**: 
   - Change from "No value" to "0"
   - Or use "Last non-null value"
3. **Set "Null value mode"**: "Connected" or "Null as zero"

### **Step 2: Alternative - Use Default Values**

Add default values to queries:

#### **Working Queries with Defaults:**

1. **Bot Status**: `up{job="lemotick-bot"} or vector(0)`
2. **Total Profit**: `lemotick_trades_profit_total or vector(0)`
3. **Total Loss**: `lemotick_trades_loss_total or vector(0)`
4. **Active Trades**: `lemotick_trades_active or vector(0)`

### **Step 3: Panel Configuration**

#### **For Stat Panels:**
```yaml
# Panel Options → Field
No value: "0"
Null value mode: "Connected"
Show: "All values"
```

#### **For Time Series:**
```yaml
# Panel Options → Field  
No value: "0"
Null value mode: "Connected"
Fill: "Connected"
```

## 🎯 **Quick Fix - Update Dashboard Guide**

Replace the current queries with these "zero-safe" versions:

### **Panel 1: Bot Status**
- **Query**: `up{job="lemotick-bot"} or vector(0)`
- **Expected**: Shows `1` (bot running) or `0` (bot stopped)

### **Panel 2: Total Profit**  
- **Query**: `lemotick_trades_profit_total or vector(0)`
- **Expected**: Shows `0` (no trades yet) or actual profit

### **Panel 3: Total Loss**
- **Query**: `lemotick_trades_loss_total or vector(0)`  
- **Expected**: Shows `0` (no trades yet) or actual loss

### **Panel 4: Active Trades**
- **Query**: `lemotick_trades_active or vector(0)`
- **Expected**: Shows `0` (no active trades) or count

## 🔧 **Alternative: Use Transformations**

Instead of modifying queries, use Grafana transformations:

1. **Add Transformation**: "Add field from calculation"
2. **Operation**: "Binary operations" → "Add"
3. **Field A**: Your metric
4. **Field B**: Constant `0`
5. **Result**: Will always show a value

## 📊 **Expected Results After Fix:**

- **Bot Status**: `1` ✅ (instead of "No data")
- **Total Profit**: `0` ✅ (instead of "No data")  
- **Total Loss**: `0` ✅ (instead of "No data")
- **Active Trades**: `0` ✅ (instead of "No data")

**The dashboard will now show `0` values instead of "No data"!** 🎉
