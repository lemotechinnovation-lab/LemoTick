# LemoTick Bot VPS Deployment Guide

## 🚀 **VPS Deployment Ready!**

Your LemoTick bot is now ready to be deployed to your AlmaLinux 10 VPS at `154.66.197.250` (build-agent.lemotechinnovations.co.za).

### **📋 VPS Information:**
- **IP Address**: `154.66.197.250` (primary connection method)
- **Hostname**: `build-agent.lemotechinnovations.co.za` (display name)
- **OS**: AlmaLinux 10
- **Status**: Online (0% CPU, 0GB/100GB disk usage)

### **🔧 Prerequisites:**

1. **SSH Access**: Ensure you have SSH access to your VPS
2. **SSH Key**: Configure SSH key authentication (recommended)
3. **Local Bot**: Ensure your bot code is ready locally

### **📦 Available Scripts:**

#### **1. `deploy-to-vps.sh`** - Full VPS Deployment
Complete deployment script that:
- Installs all dependencies (Python 3.9, system tools)
- Creates bot user and directories
- Deploys bot code
- Sets up Python virtual environment
- Creates systemd service
- Configures monitoring and backups
- Sets up firewall and security

#### **2. `vps-manager.sh`** - Simple VPS Management
Easy management script for:
- Start/stop/restart bot
- Check status and logs
- Health monitoring
- Quick operations

### **🚀 Quick Start:**

#### **Step 1: Deploy Bot to VPS**
```bash
./deploy-to-vps.sh deploy
```

This will:
- Connect to your VPS
- Install all dependencies
- Deploy bot code
- Set up systemd service
- Configure monitoring

#### **Step 2: Start Bot**
```bash
./vps-manager.sh start
```

#### **Step 3: Check Status**
```bash
./vps-manager.sh status
```

### **🎛️ Management Commands:**

#### **Start/Stop Control:**
```bash
# Start bot on VPS
./vps-manager.sh start

# Stop bot on VPS
./vps-manager.sh stop

# Restart bot on VPS
./vps-manager.sh restart

# Check status
./vps-manager.sh status

# View live logs
./vps-manager.sh logs

# Health check
./vps-manager.sh health
```

#### **Advanced Operations:**
```bash
# Full deployment
./deploy-to-vps.sh deploy

# Update bot code
./deploy-to-vps.sh update

# Show detailed logs
./deploy-to-vps.sh logs 100
```

### **🔒 Security Features:**

- **Dedicated User**: Bot runs as `lemotick` user
- **Systemd Service**: Proper service management
- **Firewall**: Configured for SSH, HTTP, HTTPS, metrics
- **Fail2ban**: Protection against brute force attacks
- **Log Rotation**: Automatic log management
- **Backups**: Daily automated backups

### **📊 Monitoring:**

- **Service Monitoring**: Every 5 minutes
- **Health Checks**: Memory, disk, errors
- **Log Rotation**: 30-day retention
- **Prometheus Metrics**: Port 8000
- **Systemd Logs**: `journalctl -u lemotick-bot`

### **📁 VPS File Structure:**
```
/opt/lemotick/
├── config/
│   └── settings.yaml
├── src/
├── logs/
├── data/
├── backups/
├── venv/
├── run_bot.py
└── requirements.txt
```

### **🔧 Configuration:**

#### **Bot Settings** (`/opt/lemotick/config/settings.yaml`):
- Account credentials
- Risk management settings
- Trading strategies
- Candlestick timing parameters

#### **Service Configuration**:
- **Service Name**: `lemotick-bot.service`
- **User**: `lemotick`
- **Directory**: `/opt/lemotick`
- **Logs**: `/var/log/lemotick`
- **Startup**: Automatic

### **📈 What Happens After Deployment:**

1. **Bot Connects**: To Deriv WebSocket
2. **Authenticates**: With your trading account
3. **Subscribes**: To market data feeds
4. **Analyzes**: Candlestick patterns
5. **Trades**: Based on signals
6. **Closes**: After exactly 2 candlesticks

### **🔄 Updates:**

#### **Code Updates:**
```bash
./deploy-to-vps.sh update
```

#### **Configuration Updates:**
1. Edit `/opt/lemotick/config/settings.yaml` on VPS
2. Restart bot: `./vps-manager.sh restart`

### **🆘 Troubleshooting:**

#### **Common Issues:**

1. **SSH Connection Failed**
   ```bash
   # Check SSH key
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   ssh-copy-id root@154.66.197.250
   ```

2. **Bot Won't Start**
   ```bash
   # Check service status
   ./vps-manager.sh status
   
   # Check logs
   ./vps-manager.sh logs
   ```

3. **Permission Errors**
   ```bash
   # Fix permissions on VPS
   ssh root@154.66.197.250 "chown -R lemotick:lemotick /opt/lemotick"
   ```

4. **Python Dependencies**
   ```bash
   # Update dependencies
   ssh root@154.66.197.250 "sudo -u lemotick bash -c 'source /opt/lemotick/venv/bin/activate && pip install -r /opt/lemotick/requirements.txt'"
   ```

### **📞 Support:**

- **VPS Logs**: `./vps-manager.sh logs`
- **Service Status**: `./vps-manager.sh status`
- **Health Check**: `./vps-manager.sh health`
- **System Logs**: `ssh root@154.66.197.250 "journalctl -u lemotick-bot"`

### **🎯 Next Steps:**

1. **Deploy**: `./deploy-to-vps.sh deploy`
2. **Configure**: Edit settings on VPS
3. **Start**: `./vps-manager.sh start`
4. **Monitor**: `./vps-manager.sh logs`
5. **Trade**: Bot will start trading automatically!

---

**Your bot is ready for VPS deployment! 🚀**

The bot will run 24/7 on your VPS, automatically trading based on candlestick patterns and closing trades after exactly 2 candlesticks complete, just as you requested.
