# Grafana Dashboard - Values Not Showing Fix

## ✅ System Status Check

All backend systems are working correctly:
- ✅ Bot metrics endpoint is serving data (`http://localhost:8000/metrics`)
- ✅ Prometheus is scraping metrics successfully
- ✅ Grafana is running and accessible
- ✅ All metric values are available:
  - `lemotick_current_equity`: 50
  - `lemotick_current_profit_loss`: Updates in real-time
  - `lemotick_current_win_rate`: Updates in real-time
  - `lemotick_active_trades`: Updates in real-time

## 🔧 Quick Fix Steps

### Method 1: Dashboard Refresh (Fastest)

1. **Open Grafana**: http://localhost:3000
2. **Login** (if needed):
   - Username: `admin`
   - Password: `admin` (or your custom password)
3. **Go to the LemoTick Dashboard**:
   - Click "Dashboards" in the left sidebar
   - Click "LemoTick Trading Dashboard"
4. **Force Refresh**:
   - Click the **Refresh** icon (circular arrow) in the top-right corner
   - Or press `Ctrl + R` on the page
5. **Check Time Range**:
   - Click the time range picker (top-right, shows something like "Last 1 hour")
   - Select **"Last 5 minutes"** or **"Last 15 minutes"**
   - This ensures you're viewing recent data
6. **Verify Auto-Refresh**:
   - In the top-right, there should be a dropdown showing refresh interval
   - Ensure it's set to something like "1s" (1 second) or "5s"
   - If it says "Off", click it and select "1s"

### Method 2: Individual Panel Fix

If specific panels still show "No data":

1. **Click on the panel title** (e.g., "Current Equity")
2. **Select "Edit"** from the dropdown menu
3. **In the Query tab**:
   - Verify "Data source" shows "Prometheus"
   - Check the query (e.g., `lemotick_current_equity{job="lemotick-bot"}`)
   - Click **"Run queries"** button
4. **If data appears**:
   - Click **"Apply"** (top-right)
   - Click **"Save dashboard"** (disk icon, top-right)

### Method 3: Check Panel Transformations

Some panels might have filters that exclude data:

1. **Edit the panel** (as above)
2. **Check the "Transform" tab**:
   - If any transformations are applied, try temporarily disabling them
   - See if data appears
3. **Check the "Options" tab**:
   - Look for "Value mappings" or "Threshold" settings
   - These might be hiding zero/small values

### Method 4: Manual Test Query

Test if Grafana can query Prometheus:

1. In Grafana, click **"Explore"** in the left sidebar (compass icon)
2. Ensure **"Prometheus"** is selected as the data source (top dropdown)
3. Enter this query in the query builder:
   ```
   lemotick_current_equity{job="lemotick-bot"}
   ```
4. Click **"Run query"**
5. You should see the value **50** appear

If this works but the dashboard doesn't, the issue is dashboard-specific configuration.

## 🛠️ Automated Fix Script

Run this script to check system status and get fix instructions:

```bash
cd bot/scripts
fix_grafana_dashboard.bat
```

This will:
- ✅ Verify metrics endpoint is working
- ✅ Verify Prometheus is scraping
- ✅ Verify Grafana is accessible
- ✅ Show current metric values
- ✅ Open the dashboard in your browser

## 🔍 Verify Metrics Manually

### Check Bot Metrics Endpoint
```bash
curl http://localhost:8000/metrics | findstr "lemotick_current"
```

Expected output:
```
lemotick_current_equity 50.0
lemotick_current_profit_loss -0.19
lemotick_current_win_rate 0.0
```

### Check Prometheus Query
```bash
curl "http://localhost:9090/api/v1/query?query=lemotick_current_equity"
```

Expected output:
```json
{
  "status": "success",
  "data": {
    "result": [
      {
        "metric": {
          "__name__": "lemotick_current_equity",
          "job": "lemotick-bot"
        },
        "value": [1761367561, "50"]
      }
    ]
  }
}
```

## 📊 Metrics Reference

These metrics should be visible in your dashboard:

| Metric Name | Description | Current Value |
|------------|-------------|---------------|
| `lemotick_current_equity` | Account equity | 50.0 |
| `lemotick_current_profit_loss` | Total P&L | Updates live |
| `lemotick_current_win_rate` | Win rate % | Updates live |
| `lemotick_active_trades` | Active positions | 0 or 1 |
| `lemotick_trades_total` | Total trades executed | Counter |
| `lemotick_account_type` | Demo (0) or Real (1) | 0 |

## ⚡ Common Issues & Solutions

### Issue: "No data" on all panels
**Solution**:
1. Check if the bot is running (`docker ps` or check running processes)
2. Verify metrics endpoint: `curl http://localhost:8000/metrics`
3. Check Prometheus targets: http://localhost:9090/targets
   - Look for "lemotick-bot" and ensure status is "UP"

### Issue: "Error reading Prometheus"
**Solution**:
1. Check if Prometheus container is running
2. Verify Grafana datasource configuration:
   - Go to Configuration → Data Sources → Prometheus
   - URL should be: `http://prometheus:9090`
   - Click "Save & Test" - should show green "Data source is working"

### Issue: Panels show old data
**Solution**:
1. Clear browser cache (`Ctrl + Shift + Delete`)
2. Hard refresh the page (`Ctrl + F5`)
3. Check dashboard refresh interval is enabled (top-right)

### Issue: Some panels work, others don't
**Solution**:
1. Edit non-working panels
2. Verify query syntax matches working panels
3. Check panel has correct datasource selected (should be "Prometheus")

## 🎯 Expected Dashboard Panels

Your dashboard should show:

1. **Account Type** - Shows "DEMO" or "REAL"
2. **Current Equity** - Shows $50.00 initially
3. **Profit/Loss** - Shows total P&L (positive or negative)
4. **Win Rate** - Shows percentage (0-100%)
5. **Active Trades** - Shows 0 or 1
6. **Equity Over Time** - Line graph showing equity changes
7. **P&L Over Time** - Line graph showing profit/loss
8. **Win Rate Over Time** - Line graph showing win percentage
9. **Trades Counter** - Shows total number of trades
10. **Indicators** - EMA, MACD, RSI values

## 🔄 Reset Dashboard (Last Resort)

If nothing works, reimport the dashboard:

1. Go to Dashboards → Browse
2. Find "LemoTick Trading Dashboard"
3. Click the three dots → Delete
4. Go to Dashboards → Import
5. Click "Upload JSON file"
6. Select: `bot/monitoring/grafana/dashboards/lemotick-dashboard.json`
7. Click "Load"
8. Select "Prometheus" as the datasource
9. Click "Import"

## 📞 Still Having Issues?

1. Check logs:
   - Bot logs: `bot/logs/runtime.log`
   - Prometheus logs: `docker logs prometheus`
   - Grafana logs: `docker logs grafana`

2. Verify containers are running:
   ```bash
   docker ps
   ```
   Should show:
   - grafana
   - prometheus
   - lemotick-bot (or your bot process)

3. Check network connectivity:
   ```bash
   # Test bot → metrics
   curl http://localhost:8000/metrics
   
   # Test Prometheus → scraping
   curl http://localhost:9090/api/v1/targets
   
   # Test Grafana → health
   curl http://localhost:3000/api/health
   ```

All three should return successful responses.

## ✅ Success Checklist

- [ ] Grafana opens at http://localhost:3000
- [ ] Can login to Grafana
- [ ] LemoTick Dashboard exists in dashboard list
- [ ] Dashboard loads without errors
- [ ] "Account Type" panel shows "DEMO" or "REAL"
- [ ] "Current Equity" panel shows $50.00 (or current equity)
- [ ] "Profit/Loss" panel shows a value (even if $0.00)
- [ ] "Win Rate" panel shows a percentage (even if 0%)
- [ ] "Active Trades" panel shows 0 or 1
- [ ] Auto-refresh is enabled (1s or 5s interval)
- [ ] Time range is set to recent data (Last 5m or Last 1h)
- [ ] Panels update when trades are executed

When all items are checked, your dashboard is working correctly!

