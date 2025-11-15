# LemoTick Project Structure

## 📁 Root Directory

```
LemoTick/
├── backend/                    # .NET Backend (Investor Management)
├── bot/                       # Python Trading Bot
├── frontend/                  # React Frontend
├── deployment/                # Deployment Scripts & Docs
├── docs/                      # Project Documentation
├── deploy.ps1                 # Main Deployment Manager
├── README.md                  # Main Project README
└── LICENSE                    # Project License
```

## 🤖 Bot Directory (`bot/`)

```
bot/
├── src/                       # Bot Source Code
│   ├── core/                 # Core bot functionality
│   ├── engine/               # Trading engine
│   ├── strategies/           # Trading strategies
│   ├── indicators/           # Technical indicators
│   ├── integrations/         # External integrations
│   └── utils/                # Utility functions
├── config/                   # Configuration Files
│   ├── settings.yaml        # Main bot settings
│   ├── credentials.demo.env  # Demo account credentials
│   ├── credentials.live.env  # Live account credentials
│   └── credentials.env       # Active credentials
├── scripts/                  # Bot Management Scripts
├── data/                     # Trading Data
├── logs/                     # Bot Logs
├── monitoring/               # Monitoring Configuration
└── requirements.txt          # Python Dependencies
```

## 🚀 Deployment Directory (`deployment/`)

```
deployment/
├── scripts/                  # Deployment Scripts
│   ├── deploy-to-vps.ps1     # VPS deployment (PowerShell)
│   ├── deploy-to-vps.sh      # VPS deployment (Bash)
│   ├── deploy-lemotick.ps1   # Local deployment (PowerShell)
│   ├── deploy-lemotick.sh     # Local deployment (Bash)
│   └── deploy-docker-*.sh    # Docker deployments
├── docker/                   # Docker Files
│   └── Dockerfile.bot        # Bot Dockerfile
├── docs/                     # Deployment Documentation
│   ├── DEPLOYMENT_GUIDE.md   # General deployment guide
│   └── VPS_DEPLOYMENT_GUIDE.md # VPS-specific guide
├── managers/                 # Service Management
│   ├── lemotick-manager.*    # Local service managers
│   └── vps-manager.*         # VPS managers
└── README.md                 # Deployment documentation
```

## 🏗️ Backend Directory (`backend/`)

```
backend/
├── API/                      # Web API
├── Application/              # Application Layer
├── Core/                     # Domain Models
├── Infrastructure/           # Data Access
├── Services/                 # Business Services
├── BotIntegration/           # Bot Integration
└── Tests/                    # Unit Tests
```

## 📚 Documentation Directory (`docs/`)

```
docs/
├── guides/                   # User Guides
├── reference/                # Technical Reference
├── troubleshooting/          # Troubleshooting Guides
├── business requirements document/ # Business Requirements
└── README.md                 # Documentation Index
```

## 🎯 Key Files

### Main Entry Points
- `deploy.ps1` - Main deployment manager
- `bot/run_bot.py` - Bot entry point
- `backend/API/Program.cs` - Backend entry point

### Configuration Files
- `bot/config/settings.yaml` - Bot settings
- `bot/config/credentials.env` - Active credentials
- `backend/API/appsettings.json` - Backend settings

### Documentation
- `README.md` - Main project README
- `deployment/README.md` - Deployment guide
- `docs/README.md` - Documentation index

## 🔧 Development Workflow

### Bot Development
1. Edit code in `bot/src/`
2. Update config in `bot/config/`
3. Test locally: `.\deploy.ps1 local deploy`
4. Deploy to VPS: `.\deploy.ps1 vps deploy`

### Backend Development
1. Edit code in `backend/`
2. Run tests in `backend/Tests/`
3. Deploy API to server

### Frontend Development
1. Edit code in `frontend/`
2. Build and deploy to web server

## 📊 Monitoring & Logs

### Bot Monitoring
- Logs: `bot/logs/`
- Monitoring: `bot/monitoring/`
- Data: `bot/data/`

### Backend Monitoring
- Logs: `backend/API/logs/`
- Health checks via API endpoints

## 🚀 Deployment Workflow

### Development
1. Local testing with `deploy.ps1 local`
2. Demo testing with demo credentials
3. VPS testing with `deploy.ps1 vps`

### Production
1. Switch to live credentials
2. Deploy to VPS: `deploy.ps1 vps deploy`
3. Monitor with `deploy.ps1 vps logs`

## 🔒 Security

### Credentials Management
- Demo credentials: `bot/config/credentials.demo.env`
- Live credentials: `bot/config/credentials.live.env`
- Never commit live credentials to version control

### SSH Keys
- VPS access: `~/.ssh/lemotick_vps_key`
- Secure deployment to remote servers

This structure provides clear separation of concerns and easy navigation for development and deployment.
