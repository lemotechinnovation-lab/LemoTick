# ================================================================================
# LemoTick Bot VPS Management Script (PowerShell)
# ================================================================================
# Simple PowerShell script for managing the LemoTick bot on VPS
# Usage: .\vps-manager.ps1 [start|stop|restart|status|logs|deploy|update]
# ================================================================================

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "status", "logs", "deploy", "update", "health")]
    [string]$Action = "status"
)

# VPS Configuration
$VPS_HOST = "154.66.197.250"  # IP address (more reliable than hostname)
$VPS_USER = "root"  # Change to your VPS username
$BOT_NAME = "lemotick-bot"

# Colors
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Log {
    param([string]$Message)
    Write-ColorOutput "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" "Green"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "[ERROR] $Message" "Red"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "[WARNING] $Message" "Yellow"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "[INFO] $Message" "Cyan"
}

# Check SSH connection
function Test-SSHConnection {
    try {
        $result = ssh -o ConnectTimeout=5 -o BatchMode=yes "$VPS_USER@$VPS_HOST" "echo 'SSH OK'" 2>$null
        if ($LASTEXITCODE -eq 0) {
            return $true
        } else {
            Write-Error "Cannot connect to VPS at $VPS_HOST"
            Write-Error "Please check SSH configuration"
            return $false
        }
    }
    catch {
        Write-Error "SSH connection failed: $_"
        return $false
    }
}

# Start the bot
function Start-Bot {
    Write-Log "Starting LemoTick Bot on VPS..."
    
    if (!(Test-SSHConnection)) {
        exit 1
    }
    
    $result = ssh "$VPS_USER@$VPS_HOST" "systemctl is-active --quiet $BOT_NAME"
    if ($LASTEXITCODE -eq 0) {
        Write-Warning "Bot is already running on VPS"
        return
    }
    
    ssh "$VPS_USER@$VPS_HOST" "systemctl start $BOT_NAME"
    Start-Sleep -Seconds 3
    
    $result = ssh "$VPS_USER@$VPS_HOST" "systemctl is-active --quiet $BOT_NAME"
    if ($LASTEXITCODE -eq 0) {
        Write-Log "✅ Bot started successfully on VPS"
        Write-Info "Bot is now running and trading on $VPS_HOST"
    } else {
        Write-Error "❌ Failed to start bot on VPS"
        ssh "$VPS_USER@$VPS_HOST" "systemctl status $BOT_NAME"
        exit 1
    }
}

# Stop the bot
function Stop-Bot {
    Write-Log "Stopping LemoTick Bot on VPS..."
    
    if (!(Test-SSHConnection)) {
        exit 1
    }
    
    $result = ssh "$VPS_USER@$VPS_HOST" "systemctl is-active --quiet $BOT_NAME"
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Bot is not running on VPS"
        return
    }
    
    ssh "$VPS_USER@$VPS_HOST" "systemctl stop $BOT_NAME"
    Start-Sleep -Seconds 3
    
    $result = ssh "$VPS_USER@$VPS_HOST" "systemctl is-active --quiet $BOT_NAME"
    if ($LASTEXITCODE -ne 0) {
        Write-Log "✅ Bot stopped successfully on VPS"
        Write-Info "Bot is now stopped and not trading"
    } else {
        Write-Error "❌ Failed to stop bot on VPS"
        exit 1
    }
}

# Restart the bot
function Restart-Bot {
    Write-Log "Restarting LemoTick Bot on VPS..."
    
    if (!(Test-SSHConnection)) {
        exit 1
    }
    
    ssh "$VPS_USER@$VPS_HOST" "systemctl restart $BOT_NAME"
    Start-Sleep -Seconds 3
    
    $result = ssh "$VPS_USER@$VPS_HOST" "systemctl is-active --quiet $BOT_NAME"
    if ($LASTEXITCODE -eq 0) {
        Write-Log "✅ Bot restarted successfully on VPS"
        Write-Info "Bot is now running with updated configuration"
    } else {
        Write-Error "❌ Failed to restart bot on VPS"
        ssh "$VPS_USER@$VPS_HOST" "systemctl status $BOT_NAME"
        exit 1
    }
}

# Show bot status
function Show-Status {
    Write-Log "LemoTick Bot Status on VPS:"
    Write-Host ""
    
    # Service status
    ssh "$VPS_USER@$VPS_HOST" "systemctl status $BOT_NAME"
    Write-Host ""
    
    # Process info
    Write-Info "Process Information:"
    ssh "$VPS_USER@$VPS_HOST" "ps aux | grep -E '(python.*run_bot|lemotick)' | grep -v grep || echo 'No bot processes found'"
    Write-Host ""
    
    # Memory usage
    Write-Info "Memory Usage:"
    ssh "$VPS_USER@$VPS_HOST" "ps -o pid,ppid,cmd,%mem,%cpu --sort=-%mem -C python3.9 | head -5"
    Write-Host ""
    
    # Disk usage
    Write-Info "Disk Usage:"
    ssh "$VPS_USER@$VPS_HOST" "df -h /opt/lemotick 2>/dev/null || echo 'Bot directory not found'"
    Write-Host ""
    
    # Recent activity
    Write-Info "Recent Activity (last 10 lines):"
    ssh "$VPS_USER@$VPS_HOST" "journalctl -u $BOT_NAME --no-pager -n 10"
}

# Show logs
function Show-Logs {
    param([int]$Lines = 50)
    
    Write-Log "Showing last $Lines lines of bot logs from VPS:"
    Write-Host ""
    ssh "$VPS_USER@$VPS_HOST" "journalctl -u $BOT_NAME --no-pager -n $Lines -f"
}

# Deploy bot
function Deploy-Bot {
    Write-Log "Deploying LemoTick Bot to VPS..."
    
    if (Test-Path "deploy-to-vps.ps1") {
        & ".\deploy-to-vps.ps1" deploy
    } else {
        Write-Error "deploy-to-vps.ps1 not found"
        Write-Error "Please ensure the deployment script is in the current directory"
        exit 1
    }
}

# Update bot
function Update-Bot {
    Write-Log "Updating LemoTick Bot on VPS..."
    
    if (Test-Path "deploy-to-vps.ps1") {
        & ".\deploy-to-vps.ps1" update
    } else {
        Write-Error "deploy-to-vps.ps1 not found"
        Write-Error "Please ensure the deployment script is in the current directory"
        exit 1
    }
}

# Quick health check
function Test-Health {
    Write-Log "Performing health check on VPS..."
    
    if (!(Test-SSHConnection)) {
        exit 1
    }
    
    # Check service status
    $result = ssh "$VPS_USER@$VPS_HOST" "systemctl is-active --quiet $BOT_NAME"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Service: Running" -ForegroundColor Green
    } else {
        Write-Host "❌ Service: Not running" -ForegroundColor Red
        return
    }
    
    # Check memory usage
    $memoryUsage = ssh "$VPS_USER@$VPS_HOST" "ps -o pid,ppid,cmd,%mem,%cpu --sort=-%mem -C python3.9 | head -2 | tail -1 | awk '{print `$4}'"
    if ([double]$memoryUsage -lt 80) {
        Write-Host "✅ Memory: ${memoryUsage}% (OK)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Memory: ${memoryUsage}% (High)" -ForegroundColor Yellow
    }
    
    # Check disk space
    $diskUsage = ssh "$VPS_USER@$VPS_HOST" "df / | tail -1 | awk '{print `$5}' | sed 's/%//'"
    if ([int]$diskUsage -lt 85) {
        Write-Host "✅ Disk: ${diskUsage}% (OK)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Disk: ${diskUsage}% (High)" -ForegroundColor Yellow
    }
    
    # Check recent errors
    $errorCount = ssh "$VPS_USER@$VPS_HOST" "journalctl -u $BOT_NAME --since '1 hour ago' | grep -i error | wc -l"
    if ([int]$errorCount -eq 0) {
        Write-Host "✅ Errors: None in last hour" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Errors: $errorCount in last hour" -ForegroundColor Yellow
    }
    
    Write-Log "Health check completed"
}

# Show help
function Show-Help {
    Write-Host "LemoTick Bot VPS Manager (PowerShell)"
    Write-Host ""
    Write-Host "Usage: .\vps-manager.ps1 [command]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  start     - Start the bot service on VPS"
    Write-Host "  stop      - Stop the bot service on VPS"
    Write-Host "  restart   - Restart the bot service on VPS"
    Write-Host "  status    - Show detailed status information"
    Write-Host "  logs      - Show live logs from VPS (Ctrl+C to exit)"
    Write-Host "  logs N    - Show last N lines of logs from VPS"
    Write-Host "  deploy    - Deploy bot to VPS"
    Write-Host "  update    - Update bot code and restart on VPS"
    Write-Host "  health    - Quick health check"
    Write-Host "  help      - Show this help message"
    Write-Host ""
    Write-Host "VPS Configuration:"
    Write-Host "  Host: $VPS_HOST"
    Write-Host "  User: $VPS_USER"
    Write-Host "  Bot Name: $BOT_NAME"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\vps-manager.ps1 deploy         # Deploy to VPS"
    Write-Host "  .\vps-manager.ps1 start         # Start the bot"
    Write-Host "  .\vps-manager.ps1 logs 100     # Show last 100 lines"
    Write-Host "  .\vps-manager.ps1 health       # Check bot health"
}

# Main script logic
switch ($Action) {
    "start" {
        Start-Bot
    }
    "stop" {
        Stop-Bot
    }
    "restart" {
        Restart-Bot
    }
    "status" {
        Show-Status
    }
    "logs" {
        Show-Logs
    }
    "deploy" {
        Deploy-Bot
    }
    "update" {
        Update-Bot
    }
    "health" {
        Test-Health
    }
    "help" {
        Show-Help
    }
    default {
        Show-Help
    }
}
