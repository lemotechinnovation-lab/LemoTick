# Grafana Startup Guide - Fix Connection Refused Error

## 🚨 **Current Issue:**
Grafana is failing to load at `localhost:3001` with "ERR_CONNECTION_REFUSED" because Docker Desktop is not running.

## 🔧 **Solution Steps:**

### **Step 1: Start Docker Desktop**
1. **Find Docker Desktop** in your Start Menu
2. **Right-click** on Docker Desktop
3. **Select "Run as administrator"**
4. **Wait 30-60 seconds** for Docker to fully start

### **Step 2: Verify Docker is Running**
```bash
docker ps
```
You should see output (not an error).

### **Step 3: Start Monitoring Stack**
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

### **Step 4: Check Services**
```bash
docker-compose -f docker-compose.monitoring.yml ps
```

### **Step 5: Access Grafana**
- **URL**: http://localhost:3001
- **Username**: admin
- **Password**: admin

## 🚀 **Quick Start Commands:**

### **Option 1: Manual Docker Desktop Start**
1. Start Docker Desktop manually (as administrator)
2. Wait for it to fully load
3. Run: `docker-compose -f docker-compose.monitoring.yml up -d`
4. Open: http://localhost:3001

### **Option 2: Use the Startup Script**
```bash
python start_grafana_standalone.py
```

## 🔍 **Troubleshooting:**

### **If Docker Desktop Won't Start:**
1. **Check if Docker Desktop is installed**
2. **Try running as administrator**
3. **Restart your computer**
4. **Check Windows services** for Docker

### **If Services Won't Start:**
```bash
# Check what's running
docker ps

# Check logs
docker-compose -f docker-compose.monitoring.yml logs

# Restart services
docker-compose -f docker-compose.monitoring.yml down
docker-compose -f docker-compose.monitoring.yml up -d
```

### **If Grafana Still Won't Load:**
1. **Check if port 3001 is free**: `netstat -ano | findstr :3001`
2. **Try different port**: Modify `docker-compose.monitoring.yml`
3. **Check firewall settings**

## 📊 **Expected Services:**

After successful startup, you should have:
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100
- **Redis**: http://localhost:6379

## 🎯 **Quick Fix Summary:**

1. **Start Docker Desktop** (as administrator)
2. **Wait for Docker to load** (30-60 seconds)
3. **Run monitoring stack**: `docker-compose -f docker-compose.monitoring.yml up -d`
4. **Access Grafana**: http://localhost:3001 (admin/admin)

**The connection refused error will be resolved once Docker Desktop is running!**
