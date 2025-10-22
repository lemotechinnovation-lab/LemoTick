# Docker Troubleshooting Guide

## Problem: "Cannot stop Docker Compose application"

### Error Message:
```
Cannot stop Docker Compose application. Reason: Max retries reached: connect ENOENT \\.\pipe\dockerBackendApiServer
```

### Root Cause:
Docker Desktop is not running on your system.

## Solutions:

### Solution 1: Start Docker Desktop
1. **Search for "Docker Desktop"** in Windows Start Menu
2. **Click to start** Docker Desktop
3. **Wait for Docker to start** (you'll see the Docker icon in system tray)
4. **Then run monitoring commands:**
   ```bash
   docker-compose -f docker-compose.monitoring.yml up -d
   ```

### Solution 2: Run Bot Without Docker (Current Method)
Your bot is already running successfully without Docker:

```bash
# Bot is running on port 8000
python -m src
```

**Access URLs:**
- **Prometheus metrics**: http://localhost:8000/metrics
- **Bot logs**: Check `logs/runtime.log` and `logs/error.log`

### Solution 3: Check Docker Status
```bash
# Check if Docker is running
docker --version
docker ps

# If Docker is not running, you'll see:
# error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.47/containers/json"
```

## Current Bot Status (Without Docker):

### ✅ What's Working:
- **Bot is running** (PID 22088)
- **Connected to Deriv API**
- **Receiving live ticks from 1HZ50V**
- **Prometheus metrics** on port 8000
- **Logs being generated**

### 📊 Access Metrics:
- **Prometheus**: http://localhost:8000/metrics
- **Raw metrics**: http://localhost:8000/metrics (JSON format)

### 📝 View Logs:
```bash
# View recent logs
powershell "Get-Content logs\runtime.log | Select-Object -Last 20"

# View error logs
powershell "Get-Content logs\error.log | Select-Object -Last 10"
```

## To Use Full Monitoring Stack:

1. **Start Docker Desktop**
2. **Wait for it to fully load**
3. **Run monitoring stack:**
   ```bash
   docker-compose -f docker-compose.monitoring.yml up -d
   ```
4. **Access Grafana**: http://localhost:3000

## Alternative: Manual Monitoring

Since your bot is working perfectly, you can monitor it using:

### Direct Metrics Access:
- **URL**: http://localhost:8000/metrics
- **Format**: Prometheus metrics format

### Log Monitoring:
- **Runtime logs**: `logs/runtime.log`
- **Error logs**: `logs/error.log`

### Key Metrics to Watch:
- `lemotick_bot_status` - Bot status (1=running, 0=stopped)
- `lemotick_ticks_processed` - Number of ticks processed
- `lemotick_trades_total` - Total trades executed
- `lemotick_bot_equity` - Current bot equity
