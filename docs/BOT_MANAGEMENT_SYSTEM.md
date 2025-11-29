# 🤖 Bot Management System

**Complete integration between Frontend, Backend API, and Trading Bot**

---

## 📋 Overview

A comprehensive system for managing and configuring the LemoTick trading bot directly from the web interface. This system enables:

✅ **Bot Control** - Start, stop, restart the bot remotely  
✅ **Real-time Monitoring** - View bot status, metrics, and performance  
✅ **Configuration Management** - Edit bot settings (settings.yaml) from the UI  
✅ **Live Updates** - Auto-refreshing status every 5 seconds  

---

## 🏗️ Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend   │────────▶│  Trading    │
│   (React)   │  REST   │   (.NET 8)  │ Process │    Bot      │
│             │◀────────│     API     │  Mgmt   │  (Python)   │
└─────────────┘         └─────────────┘         └─────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ settings.yaml│
                        │ (Bot Config) │
                        └──────────────┘
```

---

## 📁 Files Created

### Backend

#### Services (Application Layer)
- `backend/Application/Services/BotManagementService.cs`
  - Bot lifecycle management (start/stop/restart)
  - Process management and monitoring
  - Prometheus metrics integration
  
- `backend/Application/Services/BotConfigurationService.cs`
  - Read/write bot configuration (settings.yaml)
  - YAML serialization/deserialization
  - Configuration backup and restore

#### Controllers (API Layer)
- `backend/API/Controllers/BotManagementController.cs`
  - `GET /api/botmanagement/status` - Get bot status
  - `POST /api/botmanagement/start` - Start bot
  - `POST /api/botmanagement/stop` - Stop bot
  - `POST /api/botmanagement/restart` - Restart bot
  - `GET /api/botmanagement/metrics` - Get bot metrics

- `backend/API/Controllers/BotConfigurationController.cs`
  - `GET /api/botconfiguration` - Get structured config
  - `GET /api/botconfiguration/raw` - Get raw YAML
  - `PUT /api/botconfiguration` - Update configuration
  - `POST /api/botconfiguration/reset` - Reset to backup

#### Configuration
- Added `YamlDotNet` NuGet package to `InvestorManagementSystem.Application.csproj`
- Registered services in `backend/Application/DependencyInjection.cs`
- Added bot settings to `backend/API/appsettings.json`:
  ```json
  "Bot": {
    "Directory": "../../bot",
    "PythonExecutable": "python"
  }
  ```

### Frontend

#### Services
- `frontend/src/features/bot/services/botService.ts`
  - API client for bot management endpoints
  - TypeScript interfaces for all data types
  - Separate services for management and configuration

#### Pages
- `frontend/src/features/bot/pages/BotManagementPage.tsx`
  - Bot control panel (start/stop/restart buttons)
  - Real-time status display
  - Live metrics dashboard (trades, win rate, profit/loss, balance)
  - Auto-refresh every 5 seconds

- `frontend/src/features/bot/pages/BotConfigurationPage.tsx`
  - YAML configuration editor
  - View/edit modes
  - Configuration backup and restore
  - Validation and error handling

#### Configuration
- Updated `frontend/src/config/constants.ts`:
  - Added `BOT_MANAGEMENT` and `BOT_CONFIGURATION` routes
  - Added `BOT_STATUS` and `BOT_CONFIG` query keys
  
- Updated `frontend/src/App.tsx`:
  - Added routes for bot management pages
  
- Updated `frontend/src/layouts/Sidebar.tsx`:
  - Added navigation items for bot pages

---

## 🚀 Features

### 1. Bot Control
- **Start Bot**: Launch the trading bot as a background process
- **Stop Bot**: Gracefully shutdown the bot
- **Restart Bot**: Stop and start in one action
- **Status Monitoring**: Real-time bot status (running/stopped/healthy)

### 2. Live Metrics Dashboard
Display real-time bot performance:
- **Total Trades**: Number of trades executed
- **Win Rate**: Percentage of winning trades (W/L breakdown)
- **Total Profit**: Cumulative profits in ZAR
- **Total Loss**: Cumulative losses in ZAR
- **Current Balance**: Bot's current account balance
- **Active Trades**: Number of open positions

### 3. Configuration Management
- **View Mode**: Read-only YAML display
- **Edit Mode**: Live YAML editor with syntax highlighting
- **Backup System**: Automatic backup before changes
- **Reset Function**: Restore previous configuration
- **Validation**: Error handling for invalid YAML

### 4. Real-time Updates
- **Auto-refresh**: Status updates every 5 seconds
- **Toast Notifications**: Success/error feedback
- **Process ID Display**: Show running bot process ID
- **Health Checks**: Backend monitors bot health

---

## 🔧 Technical Details

### Backend Implementation

#### Process Management
The backend starts the bot as a subprocess:
```csharp
var startInfo = new ProcessStartInfo
{
    FileName = "python",
    Arguments = "run_bot.py",
    WorkingDirectory = botDirectory,
    UseShellExecute = false,
    RedirectStandardOutput = true,
    RedirectStandardError = true,
    CreateNoWindow = true
};

_botProcess = new Process { StartInfo = startInfo };
_botProcess.Start();
```

#### Metrics Collection
Fetches metrics from bot's Prometheus endpoint (port 8000):
```csharp
var response = await httpClient.GetAsync("http://localhost:8000/metrics");
var metrics = ParsePrometheusMetrics(content);
```

#### Configuration Management
Uses YamlDotNet for YAML serialization:
```csharp
var deserializer = new DeserializerBuilder()
    .WithNamingConvention(UnderscoredNamingConvention.Instance)
    .Build();
    
var config = deserializer.Deserialize<Dictionary<string, object>>(yaml);
```

### Frontend Implementation

#### State Management
Uses TanStack Query for data fetching:
```typescript
const { data: status, refetch } = useQuery({
  queryKey: QUERY_KEYS.BOT_STATUS,
  queryFn: () => botService.getStatus(),
  refetchInterval: 5000, // Auto-refresh
})
```

#### Mutations
Uses TanStack Query mutations for actions:
```typescript
const startMutation = useMutation({
  mutationFn: () => botService.startBot(),
  onSuccess: (result) => {
    toast.success(result.message)
    refetch()
  },
})
```

---

## 📊 API Endpoints

### Bot Management

#### Get Status
```http
GET /api/botmanagement/status
Authorization: Bearer {token}

Response:
{
  "isRunning": true,
  "isHealthy": true,
  "processId": 12345,
  "currentMetrics": {
    "totalTrades": 150,
    "winningTrades": 95,
    "losingTrades": 55,
    "winRate": 0.633,
    "totalProfit": 4500.00,
    "totalLoss": 2100.00,
    "currentBalance": 12400.00,
    "activeTrades": 2
  }
}
```

#### Start Bot
```http
POST /api/botmanagement/start
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Bot started successfully (PID: 12345)"
}
```

#### Stop Bot
```http
POST /api/botmanagement/stop
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Bot stopped successfully"
}
```

#### Restart Bot
```http
POST /api/botmanagement/restart
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Bot started successfully (PID: 12346)"
}
```

### Bot Configuration

#### Get Configuration (Raw YAML)
```http
GET /api/botconfiguration/raw
Authorization: Bearer {token}

Response:
{
  "yaml": "# LemoTick Trading Bot Configuration\nbot:\n  name: \"LemoTick\"\n..."
}
```

#### Update Configuration
```http
PUT /api/botconfiguration
Authorization: Bearer {token}
Content-Type: application/json

{
  "bot": {
    "name": "LemoTick",
    "version": "2.0"
  },
  "trading": {
    "symbol": "R_100",
    "contract_duration": 5
  }
}

Response:
{
  "success": true,
  "message": "Configuration updated successfully. Restart bot for changes to take effect."
}
```

#### Reset Configuration
```http
POST /api/botconfiguration/reset
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Configuration reset successfully"
}
```

---

## 🎨 UI Components

### Bot Management Page

**Controls**:
- Green "Start Bot" button (when stopped)
- Red "Stop Bot" button (when running)
- Blue "Restart Bot" button (when running)

**Status Indicator**:
- 🟢 Green dot = Running
- 🔴 Red dot = Stopped

**Metrics Cards**:
1. **Total Trades** - Bar chart icon (blue)
2. **Win Rate** - Activity icon (green) + W/L breakdown
3. **Total Profit** - Trending up icon (green)
4. **Total Loss** - Trending down icon (red)
5. **Current Balance** - Dollar sign icon (yellow)
6. **Active Trades** - Activity icon (purple)

### Bot Configuration Page

**Controls**:
- "Edit Configuration" button (primary)
- "Reset to Backup" button (secondary)
- "Save Changes" button (when editing)
- "Cancel" button (when editing)

**Editor**:
- View mode: Read-only code block with syntax highlighting
- Edit mode: Full-height textarea with monospace font
- Warning banner: Reminds to restart bot after changes

---

## 🔐 Security

### Authentication
- All endpoints require JWT bearer token
- Uses existing `[Authorize]` attribute

### Process Management
- Bot runs as child process of backend
- Output/error streams captured and logged
- Graceful shutdown with process tree termination

### Configuration Safety
- Automatic backup before any changes
- Reset function to restore previous state
- Validation on backend before saving

---

## 🧪 Testing

### Backend Testing
```bash
# Start backend
cd backend/API
dotnet run

# Test endpoints
curl -X GET http://localhost:7001/api/botmanagement/status \
  -H "Authorization: Bearer YOUR_TOKEN"

curl -X POST http://localhost:7001/api/botmanagement/start \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Testing
```bash
# Start frontend
cd frontend
npm run dev

# Navigate to:
http://localhost:5173/bot-management
http://localhost:5173/bot-configuration
```

### Integration Testing
1. Login to the portal
2. Go to "Bot Management" in sidebar
3. Click "Start Bot" - bot should start
4. Verify status shows as running with metrics
5. Go to "Bot Configuration"
6. Edit a setting (e.g., change contract_duration)
7. Save changes
8. Restart bot for changes to take effect

---

## 📝 Usage

### Starting the Bot
1. Navigate to **Bot Management** page
2. Click **Start Bot** button
3. Wait 2-3 seconds for bot to initialize
4. Status will show green dot + "Bot is Running"
5. Metrics will populate within 30 seconds

### Stopping the Bot
1. Navigate to **Bot Management** page
2. Click **Stop Bot** button
3. Bot will shutdown gracefully
4. Status will show red dot + "Bot is Stopped"

### Editing Configuration
1. Navigate to **Bot Configuration** page
2. Click **Edit Configuration** button
3. Modify YAML in the editor
4. Click **Save Changes**
5. Go back to Bot Management
6. Click **Restart Bot** for changes to apply

### Monitoring
- Bot status auto-refreshes every 5 seconds
- Metrics update in real-time
- Toast notifications for all actions
- Process ID displayed when running

---

## 🐛 Troubleshooting

### Bot Won't Start
**Symptoms**: Start button clicked but bot shows as stopped

**Solutions**:
1. Check Python is installed: `python --version`
2. Check bot directory path in `appsettings.json`
3. Check bot dependencies: `pip install -r requirements.txt`
4. View backend logs for detailed error messages
5. Ensure port 8000 (Prometheus) is not in use

### Metrics Not Showing
**Symptoms**: Bot running but no metrics displayed

**Solutions**:
1. Wait 30-60 seconds after starting
2. Check bot's Prometheus endpoint: `http://localhost:8000/metrics`
3. Verify bot has executed at least one trade
4. Check backend logs for HTTP errors

### Configuration Changes Not Applied
**Symptoms**: Changed settings but bot behavior unchanged

**Solutions**:
1. Verify you clicked "Save Changes"
2. Check for error toast notifications
3. **Restart the bot** - changes require restart
4. Review `bot/config/settings.yaml` to confirm changes saved

### Permission Errors
**Symptoms**: "Access denied" or "Forbidden" errors

**Solutions**:
1. Ensure you're logged in
2. Check JWT token is valid
3. Verify Authorization header in requests
4. Check backend logs for authentication errors

---

## 🔄 Future Enhancements

### Planned Features
- [ ] Bot logs viewer in UI
- [ ] Real-time trade history stream
- [ ] Performance charts and analytics
- [ ] Configuration templates
- [ ] Multi-bot management
- [ ] Schedule bot start/stop times
- [ ] Email/SMS alerts for bot events
- [ ] Advanced configuration wizard

### Potential Improvements
- Add bot health monitoring alerts
- Implement configuration validation UI
- Add syntax highlighting for YAML editor
- Create configuration diff viewer
- Add rollback to specific backup version
- Implement bot performance benchmarking

---

## 📚 Related Documentation

- [Backend API Documentation](../backend/README-InvestorManagement.md)
- [Frontend Documentation](../frontend/README.md)
- [Bot Configuration Guide](../bot/config/README.md)
- [Deployment Guide](../deployment/README.md)

---

## ✅ Summary

**What was built:**
- ✅ Complete Backend API for bot control (4 controllers, 2 services)
- ✅ Frontend bot management interface (2 pages, 1 service)
- ✅ Real-time status monitoring with auto-refresh
- ✅ Live metrics dashboard
- ✅ YAML configuration editor
- ✅ Backup and restore functionality
- ✅ Process management and health checks

**Communication Flow:**
Frontend (React) → Backend (.NET API) → Bot (Python Process) + settings.yaml

**Result:**
Full control of the trading bot directly from the web interface! 🎉

---

**Last Updated**: November 18, 2025  
**Version**: 1.0.0

