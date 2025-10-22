# LemoTick Setup Guide

This guide will help you set up and run the LemoTick trading bot on your system.

## Prerequisites

### System Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **Python**: Version 3.9 or higher
- **Memory**: Minimum 512MB RAM (1GB recommended)
- **Storage**: 100MB free space for data and logs
- **Network**: Stable internet connection for WebSocket streaming

### Required Accounts
- **Deriv Account**: Demo or live trading account
- **Deriv API Token**: Generate from your Deriv account settings

## Installation Options

### Option 1: Docker Deployment (Recommended)

#### 1. Install Docker
- **Windows/Mac**: Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)
- **Linux**: Follow [Docker installation guide](https://docs.docker.com/engine/install/)

#### 2. Clone Repository
```bash
git clone <your-repo-url>
cd LemoTick
```

#### 3. Configure Environment
```bash
# Copy environment template
cp docker/env.example docker/.env

# Edit configuration
nano docker/.env
```

#### 4. Set Your API Token
```bash
# In docker/.env file
DERIV_API_TOKEN=your_actual_api_token_here
```

#### 5. Run with Docker Compose
```bash
# Basic deployment
docker-compose -f docker/docker-compose.yml up --build

# With monitoring (optional)
docker-compose -f docker/docker-compose.yml --profile monitoring up --build
```

### Option 2: Local Python Installation

#### 1. Clone Repository
```bash
git clone <your-repo-url>
cd LemoTick
```

#### 2. Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

#### 3. Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### 4. Configure Environment
```bash
# Copy credentials template
cp config/credentials.env.example config/credentials.env

# Edit configuration
nano config/credentials.env
```

#### 5. Set Your API Token
```bash
# In config/credentials.env file
DERIV_API_TOKEN=your_actual_api_token_here
```

#### 6. Run the Bot
```bash
# Run directly
python -m src

# Or run main module
python src/main.py
```

## Configuration

### Trading Parameters

Edit `config/settings.yaml` to customize trading behavior:

```yaml
# Trading symbol (R_100, R_75, etc.)
trading:
  symbol: "R_100"

# Risk management
risk:
  risk_per_trade: 0.01        # 1% risk per trade
  max_daily_drawdown: 0.05    # 5% max daily drawdown

# Technical indicators
indicators:
  ema_fast_period: 8          # Fast EMA period
  ema_slow_period: 34         # Slow EMA period
  momentum_threshold: 0.0001  # Momentum threshold
```

### API Configuration

Set your Deriv API credentials in `config/credentials.env`:

```bash
DERIV_API_TOKEN=your_token_here
DERIV_WS_URL=wss://ws.derivws.com/websockets/v3
DERIV_APP_ID=1089
```

## VS Code Setup (Recommended)

### 1. Install VS Code Extensions
- **Python**: Microsoft Python extension
- **Python Docstring Generator**: Auto-generate docstrings
- **GitLens**: Enhanced Git capabilities
- **Docker**: Docker support
- **YAML**: YAML file support

### 2. Configure VS Code Settings
Create `.vscode/settings.json`:

```json
{
    "python.defaultInterpreterPath": "./venv/Scripts/python.exe",
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": false,
    "python.linting.flake8Enabled": true,
    "python.formatting.provider": "black",
    "python.testing.pytestEnabled": true,
    "files.exclude": {
        "**/__pycache__": true,
        "**/*.pyc": true
    }
}
```

### 3. Launch Configuration
Create `.vscode/launch.json`:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "LemoTick Bot",
            "type": "python",
            "request": "launch",
            "program": "${workspaceFolder}/src/main.py",
            "console": "integratedTerminal",
            "env": {
                "PYTHONPATH": "${workspaceFolder}"
            }
        }
    ]
}
```

## Verification

### 1. Check Configuration
```bash
# Verify configuration loading
python -c "from src.config import config; print('Config loaded successfully')"
```

### 2. Test API Connection
```bash
# Run with debug mode to see connection details
LOG_LEVEL=DEBUG python -m src
```

### 3. Monitor Logs
```bash
# Docker
docker logs -f lemotick-trading-bot

# Local
tail -f logs/runtime.log
```

## Troubleshooting

### Common Issues

#### 1. API Token Error
```
Error: Authentication failed: InvalidToken
```
**Solution**: Verify your API token is correct and active

#### 2. WebSocket Connection Failed
```
Error: Connection failed: Connection refused
```
**Solution**: Check internet connection and firewall settings

#### 3. Permission Denied (Docker)
```
Error: Permission denied
```
**Solution**: Ensure Docker has proper permissions or run with `sudo`

#### 4. Module Import Error
```
Error: No module named 'src'
```
**Solution**: Ensure you're in the project root directory and PYTHONPATH is set

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Docker
DEBUG_MODE=true docker-compose up

# Local
LOG_LEVEL=DEBUG python -m src
```

### Log Files

- **Runtime Log**: `logs/runtime.log` - All bot activities
- **Error Log**: `logs/error.log` - Errors and critical issues
- **Console Output**: Real-time status and signals

## Next Steps

1. **Test on Demo Account**: Run the bot on Deriv demo account first
2. **Monitor Performance**: Watch logs and trading activity
3. **Adjust Parameters**: Fine-tune strategy parameters based on performance
4. **Scale Gradually**: Start with small stakes and increase over time

## Support

For issues and questions:
- Check the logs for error details
- Review the configuration files
- Consult the documentation in `docs/`
- Create an issue in the repository

## Security Notes

- Keep your API token secure and never commit it to version control
- Use environment variables for sensitive data
- Regularly rotate your API tokens
- Monitor your account for unauthorized activity

