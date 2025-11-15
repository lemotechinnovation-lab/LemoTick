# LemoTick Bot VPS Deployment Guide

This guide provides multiple deployment options for your LemoTick trading bot to the VPS server `build-agent.lemotechinnovations.co.za`.

## VPS Server Details
- **Hostname**: build-agent.lemotechinnovations.co.za
- **IP Address**: 154.66.197.250 (build-agent.lemotechinnovations.co.za)
- **Operating System**: AlmaLinux 10
- **Status**: Online
- **Access**: SSH as root user

## Prerequisites

### Local Machine Requirements
- SSH access to the VPS
- Docker (for Docker deployment option)
- tar/gzip utilities

### VPS Requirements
- Python 3.11+
- Node.js 20+
- pip3
- systemd (for service management)
- Docker (optional, for containerized deployment)

## Deployment Options

### Option 1: Simple Direct Deployment (Recommended)

This is the quickest and most straightforward deployment method.

```bash
# Make the script executable
chmod +x deploy-simple.sh

# Run the deployment
./deploy-simple.sh
```

**What it does:**
- Creates a deployment package with all bot files
- Installs Python and Node.js dependencies on VPS
- Sets up a systemd service for automatic startup
- Deploys and starts the bot service

### Option 2: Docker Deployment

For better isolation and easier management.

```bash
# Make the script executable
chmod +x deploy-docker.sh

# Run the Docker deployment
./deploy-docker.sh
```

**What it does:**
- Builds a Docker image locally
- Uploads the image to VPS
- Runs the bot in a Docker container
- Sets up automatic restart policies

### Option 3: Full Production Deployment

For production environments with comprehensive monitoring.

```bash
# Make the script executable
chmod +x deploy-to-vps.sh

# Run the full deployment
./deploy-to-vps.sh
```

**What it does:**
- Comprehensive dependency installation
- Backup of existing deployments
- PM2 process management setup
- Detailed logging and monitoring
- Health checks and verification

## Post-Deployment Management

### Service Management (Systemd)

```bash
# Check bot status
ssh root@build-agent.lemotechinnovations.co.za 'systemctl status lemotick-bot'

# Start the bot
ssh root@build-agent.lemotechinnovations.co.za 'systemctl start lemotick-bot'

# Stop the bot
ssh root@build-agent.lemotechinnovations.co.za 'systemctl stop lemotick-bot'

# Restart the bot
ssh root@build-agent.lemotechinnovations.co.za 'systemctl restart lemotick-bot'

# View logs
ssh root@build-agent.lemotechinnovations.co.za 'journalctl -u lemotick-bot -f'
```

### Docker Management

```bash
# Check container status
ssh root@build-agent.lemotechinnovations.co.za 'docker ps'

# View logs
ssh root@build-agent.lemotechinnovations.co.za 'docker logs lemotick-bot -f'

# Restart container
ssh root@build-agent.lemotechinnovations.co.za 'docker restart lemotick-bot'

# Stop container
ssh root@build-agent.lemotechinnovations.co.za 'docker stop lemotick-bot'
```

## Configuration

### Bot Configuration
The bot configuration is located at `/opt/lemotick-bot/config/settings.yaml` on the VPS.

Key settings that were optimized:
- **Early closure disabled**: `early_closure_enabled: false`
- **Trade duration**: 15 minutes for proper candlestick timing
- **Cooldown periods**: Reduced to 2 seconds for faster trading
- **Signal thresholds**: Lowered for more trading opportunities

### Environment Variables
The bot runs with these environment variables:
- `PYTHONPATH=/opt/lemotick-bot/src`
- `NODE_ENV=production`
- `LOG_LEVEL=INFO`

## Monitoring and Logs

### Log Locations
- **Systemd logs**: `journalctl -u lemotick-bot`
- **Bot logs**: `/opt/lemotick-bot/logs/`
- **Docker logs**: `docker logs lemotick-bot`

### Health Monitoring
```bash
# Check if bot is running
ssh root@build-agent.lemotechinnovations.co.za 'systemctl is-active lemotick-bot'

# Check recent activity
ssh root@build-agent.lemotechinnovations.co.za 'journalctl -u lemotick-bot --since "1 hour ago"'
```

## Troubleshooting

### Common Issues

1. **Bot not starting**
   ```bash
   # Check service status
   ssh root@build-agent.lemotechinnovations.co.za 'systemctl status lemotick-bot'
   
   # Check logs for errors
   ssh root@build-agent.lemotechinnovations.co.za 'journalctl -u lemotick-bot -n 50'
   ```

2. **Permission issues**
   ```bash
   # Fix permissions
   ssh root@build-agent.lemotechinnovations.co.za 'chown -R root:root /opt/lemotick-bot'
   ```

3. **Dependencies missing**
   ```bash
   # Reinstall dependencies
   ssh root@build-agent.lemotechinnovations.co.za 'cd /opt/lemotick-bot && pip3 install -r requirements.txt'
   ```

### Performance Optimization

The bot has been optimized for:
- **Faster trade execution**: Reduced cooldowns and disabled blocking systems
- **Proper timing**: 15-minute contracts with candlestick-based closure
- **More signals**: Lowered confidence thresholds
- **No early closure**: Trades only close after 2nd candlestick completes

## Security Considerations

- The bot runs as root user (adjust if needed)
- SSH key authentication recommended
- Firewall rules may be needed for external connections
- Regular security updates for the VPS

## Backup and Recovery

### Backup Bot Configuration
```bash
# Backup current configuration
ssh root@build-agent.lemotechinnovations.co.za 'cp -r /opt/lemotick-bot /opt/lemotick-backup-$(date +%Y%m%d)'
```

### Restore from Backup
```bash
# Restore from backup
ssh root@build-agent.lemotechinnovations.co.za 'cp -r /opt/lemotick-backup-YYYYMMDD /opt/lemotick-bot'
```

## Next Steps

After successful deployment:

1. **Monitor the bot** for the first few hours
2. **Check logs** for any errors or warnings
3. **Verify trading activity** matches your expectations
4. **Adjust settings** in `settings.yaml` if needed
5. **Set up monitoring alerts** for critical events

The bot should now:
- ✅ Place trades faster (2-second cooldowns)
- ✅ Close trades after exactly 2 candlesticks complete
- ✅ Generate more trading signals (lower thresholds)
- ✅ Run continuously with automatic restart
