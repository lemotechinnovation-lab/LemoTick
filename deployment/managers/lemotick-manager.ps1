# ================================================================================
# LemoTick Bot Windows Management Script
# ================================================================================
# PowerShell script for easy bot management
# Usage: .\lemotick-manager.ps1 [start|stop|restart|status|logs|health]
# ================================================================================

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "status", "logs", "health", "deploy")]
    [string]$Action = "status"
)

# Configuration
$BotName = "LemoTickBot"
$ServiceName = "LemoTickBot"
$BotHome = "C:\LemoTick"
$LogDir = "C:\LemoTick\logs"

# Colors for output
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

# Check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Start the bot
function Start-Bot {
    Write-Log "Starting LemoTick Bot..."
    
    if (!(Test-Administrator)) {
        Write-Error "This script must be run as Administrator"
        Write-Info "Right-click PowerShell and select 'Run as Administrator'"
        return
    }
    
    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if (!$service) {
        Write-Error "Service $ServiceName not found. Please run deployment first."
        return
    }
    
    if ($service.Status -eq "Running") {
        Write-Warning "Bot is already running"
        return
    }
    
    try {
        Start-Service -Name $ServiceName
        Start-Sleep -Seconds 3
        
        $service = Get-Service -Name $ServiceName
        if ($service.Status -eq "Running") {
            Write-Log "✅ Bot started successfully"
            Write-Info "Bot is now running and trading"
        } else {
            Write-Error "❌ Failed to start bot"
            Get-Service -Name $ServiceName
        }
    }
    catch {
        Write-Error "Error starting service: $_"
    }
}

# Stop the bot
function Stop-Bot {
    Write-Log "Stopping LemoTick Bot..."
    
    if (!(Test-Administrator)) {
        Write-Error "This script must be run as Administrator"
        Write-Info "Right-click PowerShell and select 'Run as Administrator'"
        return
    }
    
    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if (!$service) {
        Write-Error "Service $ServiceName not found"
        return
    }
    
    if ($service.Status -eq "Stopped") {
        Write-Warning "Bot is not running"
        return
    }
    
    try {
        Stop-Service -Name $ServiceName -Force
        Start-Sleep -Seconds 3
        
        $service = Get-Service -Name $ServiceName
        if ($service.Status -eq "Stopped") {
            Write-Log "✅ Bot stopped successfully"
            Write-Info "Bot is now stopped and not trading"
        } else {
            Write-Error "❌ Failed to stop bot"
        }
    }
    catch {
        Write-Error "Error stopping service: $_"
    }
}

# Restart the bot
function Restart-Bot {
    Write-Log "Restarting LemoTick Bot..."
    
    if (!(Test-Administrator)) {
        Write-Error "This script must be run as Administrator"
        Write-Info "Right-click PowerShell and select 'Run as Administrator'"
        return
    }
    
    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if (!$service) {
        Write-Error "Service $ServiceName not found. Please run deployment first."
        return
    }
    
    try {
        Restart-Service -Name $ServiceName
        Start-Sleep -Seconds 3
        
        $service = Get-Service -Name $ServiceName
        if ($service.Status -eq "Running") {
            Write-Log "✅ Bot restarted successfully"
            Write-Info "Bot is now running with updated configuration"
        } else {
            Write-Error "❌ Failed to restart bot"
            Get-Service -Name $ServiceName
        }
    }
    catch {
        Write-Error "Error restarting service: $_"
    }
}

# Show bot status
function Show-Status {
    Write-Log "LemoTick Bot Status:"
    Write-Host ""
    
    # Service status
    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($service) {
        Write-Info "Service Status:"
        $service | Format-Table Name, Status, StartType -AutoSize
        Write-Host ""
    } else {
        Write-Warning "Service $ServiceName not found"
        Write-Host ""
    }
    
    # Process info
    Write-Info "Process Information:"
    $processes = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*run_bot.py*" }
    if ($processes) {
        $processes | Select-Object ProcessName, Id, WorkingSet, CPU | Format-Table -AutoSize
    } else {
        Write-Warning "No bot processes found"
    }
    Write-Host ""
    
    # Memory usage
    Write-Info "Memory Usage:"
    Get-Process -Name "python" -ErrorAction SilentlyContinue | Select-Object ProcessName, Id, @{Name="Memory(MB)";Expression={[math]::Round($_.WorkingSet/1MB,2)}}, CPU | Format-Table -AutoSize
    Write-Host ""
    
    # Recent logs
    Write-Info "Recent Logs:"
    $logFile = "$LogDir\runtime.log"
    if (Test-Path $logFile) {
        Get-Content $logFile -Tail 10
    } else {
        Write-Warning "Log file not found: $logFile"
    }
}

# Show logs
function Show-Logs {
    param([int]$Lines = 50)
    
    Write-Log "Showing last $Lines lines of bot logs:"
    Write-Host ""
    
    $logFile = "$LogDir\runtime.log"
    if (Test-Path $logFile) {
        Get-Content $logFile -Tail $Lines -Wait
    } else {
        Write-Warning "Log file not found: $logFile"
    }
}

# Health check
function Test-Health {
    Write-Log "Performing health check..."
    Write-Host ""
    
    # Check service status
    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($service -and $service.Status -eq "Running") {
        Write-Host "✅ Service: Running" -ForegroundColor Green
    } else {
        Write-Host "❌ Service: Not running" -ForegroundColor Red
        return
    }
    
    # Check memory usage
    $processes = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*run_bot.py*" }
    if ($processes) {
        $memoryMB = [math]::Round($processes.WorkingSet / 1MB, 2)
        if ($memoryMB -lt 500) {
            Write-Host "✅ Memory: ${memoryMB}MB (OK)" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Memory: ${memoryMB}MB (High)" -ForegroundColor Yellow
        }
    }
    
    # Check disk space
    $disk = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
    $freeSpaceGB = [math]::Round($disk.FreeSpace / 1GB, 2)
    if ($freeSpaceGB -gt 5) {
        Write-Host "✅ Disk: ${freeSpaceGB}GB free (OK)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Disk: ${freeSpaceGB}GB free (Low)" -ForegroundColor Yellow
    }
    
    # Check recent errors
    $logFile = "$LogDir\runtime.log"
    if (Test-Path $logFile) {
        $errorCount = (Get-Content $logFile | Select-String -Pattern "ERROR|Exception" | Measure-Object).Count
        if ($errorCount -eq 0) {
            Write-Host "✅ Errors: None in recent logs" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Errors: $errorCount found in recent logs" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Log "Health check completed"
}

# Deploy bot
function Deploy-Bot {
    Write-Log "Starting bot deployment..."
    
    if (!(Test-Administrator)) {
        Write-Error "This script must be run as Administrator"
        Write-Info "Right-click PowerShell and select 'Run as Administrator'"
        return
    }
    
    # Run the main deployment script
    if (Test-Path "deploy-lemotick.ps1") {
        & ".\deploy-lemotick.ps1" deploy
    } else {
        Write-Error "deploy-lemotick.ps1 not found"
        Write-Info "Please ensure the deployment script is in the current directory"
    }
}

# Show help
function Show-Help {
    Write-Host "LemoTick Bot Windows Manager"
    Write-Host ""
    Write-Host "Usage: .\lemotick-manager.ps1 [command]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  start     - Start the bot service"
    Write-Host "  stop      - Stop the bot service"
    Write-Host "  restart   - Restart the bot service"
    Write-Host "  status    - Show detailed status information"
    Write-Host "  logs      - Show live logs (Ctrl+C to exit)"
    Write-Host "  health    - Quick health check"
    Write-Host "  deploy    - Deploy the bot"
    Write-Host "  help      - Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\lemotick-manager.ps1 start     # Start the bot"
    Write-Host "  .\lemotick-manager.ps1 status    # Check status"
    Write-Host "  .\lemotick-manager.ps1 health    # Health check"
    Write-Host ""
    Write-Host "Note: Most commands require Administrator privileges"
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
    "health" {
        Test-Health
    }
    "deploy" {
        Deploy-Bot
    }
    "help" {
        Show-Help
    }
    default {
        Show-Help
    }
}
