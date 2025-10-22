# How to Access Logs in Grafana

## Quick Start

### 1. Start Monitoring Stack
```bash
# Start Docker Desktop first, then:
docker-compose -f docker-compose.monitoring.yml up -d
```

### 2. Access Grafana
- **URL**: http://localhost:3000
- **Username**: admin
- **Password**: admin

### 3. View Logs in Grafana

#### Option A: Using Explore (Recommended)
1. Go to **"Explore"** in the left sidebar
2. Select **"Loki"** as the data source
3. Use these queries:

**All LemoTick logs:**
```
{app="lemotick"}
```

**Error logs only:**
```
{app="lemotick"} |= "ERROR"
```

**Info logs only:**
```
{app="lemotick"} |= "INFO"
```

**Recent logs (last 1 hour):**
```
{app="lemotick"} |= "INFO" |= "ERROR"
```

#### Option B: Using Dashboard
1. Go to **"Dashboards"** → **"LemoTick Dashboard"**
2. Look for the **"Logs"** panel
3. View real-time log stream

## Log Query Examples

### Filter by Log Level
```
# ERROR logs only
{app="lemotick"} |= "ERROR"

# INFO logs only  
{app="lemotick"} |= "INFO"

# DEBUG logs only
{app="lemotick"} |= "DEBUG"
```

### Filter by Component
```
# Authentication logs
{app="lemotick"} |= "authentication"

# Trading logs
{app="lemotick"} |= "trade"

# Connection logs
{app="lemotick"} |= "connection"
```

### Time-based Queries
```
# Last 5 minutes
{app="lemotick"} |= "INFO" |= "ERROR"

# Last 1 hour
{app="lemotick"} |= "INFO" |= "ERROR"

# Last 24 hours
{app="lemotick"} |= "INFO" |= "ERROR"
```

## Troubleshooting

### If Grafana Shows "No Data"
1. Check if Loki is running: `docker ps | grep loki`
2. Check Loki logs: `docker logs loki`
3. Verify log files exist: `ls logs/`

### If Logs Don't Appear
1. Ensure bot is running: `python -m src`
2. Check log files: `python view_logs.py`
3. Verify Loki configuration in `monitoring/loki.yml`

## Direct Log Access (Without Grafana)

### View Current Logs
```bash
python view_logs.py
```

### View Specific Log Files
```bash
# Runtime logs
type logs\runtime.log

# Error logs  
type logs\error.log

# Last 20 lines
powershell "Get-Content logs\runtime.log | Select-Object -Last 20"
```

## Log Levels Explained

- **ERROR**: Critical issues that need attention
- **WARNING**: Potential issues or important notices
- **INFO**: General information about bot operation
- **DEBUG**: Detailed debugging information

## Monitoring Bot Health

### Key Log Patterns to Watch
1. **Authentication**: `"Successfully authenticated"`
2. **Connection**: `"Stream handler started"`
3. **Trading**: `"Performance metrics updated"`
4. **Errors**: `"ERROR"` level messages

### Alert Conditions
- Multiple authentication failures
- Connection timeouts
- Trading errors
- Performance degradation
