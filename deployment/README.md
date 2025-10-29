# LemoTick Bot Deployment Structure

This directory contains all deployment-related files organized for easy management and maintenance.

## 📁 Directory Structure

```
deployment/
├── scripts/           # Deployment scripts
├── docker/            # Docker-related files
├── docs/              # Deployment documentation
├── managers/          # Service management scripts
└── README.md          # This file
```

## 🚀 Quick Start

### Main Deployment Script
Use the main deployment script for all operations:

```powershell
# Deploy to VPS
.\deploy.ps1 vps deploy

# Start local bot
.\deploy.ps1 local start

# View VPS logs
.\deploy.ps1 vps logs

# Docker deployment
.\deploy.ps1 docker deploy
```

## 📂 Scripts Directory

### VPS Deployment (`scripts/`)
- `deploy-to-vps.ps1` - PowerShell VPS deployment (Windows → AlmaLinux)
- `deploy-to-vps.sh` - Bash VPS deployment (Linux → AlmaLinux)
- `deploy-lemotick.ps1` - Local Windows deployment
- `deploy-lemotick.sh` - Local Linux deployment
- `deploy-simple.sh` - Simplified VPS deployment
- `deploy-docker.sh` - Docker-based VPS deployment
- `deploy-docker-lemotick.sh` - Docker deployment with full setup
- `create-deployment-package.bat` - Create deployment package (Windows)
- `create-deployment-package.sh` - Create deployment package (Linux)

### Docker Directory (`docker/`)
- `Dockerfile.bot` - Main bot Dockerfile

### Documentation (`docs/`)
- `DEPLOYMENT_GUIDE.md` - Comprehensive deployment guide
- `VPS_DEPLOYMENT_GUIDE.md` - VPS-specific deployment guide

### Managers (`managers/`)
- `lemotick-manager.ps1` - Windows service manager
- `lemotick-manager.bat` - Windows batch manager
- `lemotick-manager.sh` - Linux service manager
- `vps-manager.ps1` - VPS management from Windows
- `vps-manager.sh` - VPS management from Linux

## 🎯 Deployment Targets

### 1. VPS Deployment (AlmaLinux 10)
```powershell
# Full deployment
.\deploy.ps1 vps deploy

# Management
.\deploy.ps1 vps start
.\deploy.ps1 vps stop
.\deploy.ps1 vps restart
.\deploy.ps1 vps status
.\deploy.ps1 vps logs
.\deploy.ps1 vps health
```

### 2. Local Deployment (Windows)
```powershell
# Install as Windows Service
.\deploy.ps1 local deploy

# Service management
.\deploy.ps1 local start
.\deploy.ps1 local stop
.\deploy.ps1 local restart
.\deploy.ps1 local status
```

### 3. Docker Deployment
```powershell
# Deploy with Docker
.\deploy.ps1 docker deploy

# Management
.\deploy.ps1 docker start
.\deploy.ps1 docker stop
.\deploy.ps1 docker restart
.\deploy.ps1 docker status
```

## 🔧 Configuration

### Credentials
- Demo: `bot/config/credentials.demo.env`
- Live: `bot/config/credentials.live.env`
- Active: `bot/config/credentials.env`

### Settings
- Main config: `bot/config/settings.yaml`
- Contract amounts, timing, risk management

## 📊 Monitoring

### Health Checks
```powershell
# VPS health
.\deploy.ps1 vps health

# Local health
.\deploy.ps1 local health
```

### Logs
```powershell
# VPS logs
.\deploy.ps1 vps logs

# Local logs
.\deploy.ps1 local logs
```

## 🚨 Troubleshooting

### Common Issues
1. **SSH Connection**: Ensure SSH key is configured
2. **Authentication**: Check credentials in config files
3. **Service Status**: Use `status` command to check
4. **Logs**: Use `logs` command for debugging

### Support Files
- Check `docs/` directory for detailed guides
- Use `managers/` scripts for advanced management

## 📝 Notes

- All scripts are designed to be idempotent (safe to run multiple times)
- VPS deployment requires SSH key setup
- Local deployment requires Administrator privileges
- Docker deployment requires Docker installed

## 🔄 Updates

To update the bot:
```powershell
# Update VPS deployment
.\deploy.ps1 vps update

# Update local deployment
.\deploy.ps1 local update
```

This will pull latest code and restart services automatically.
