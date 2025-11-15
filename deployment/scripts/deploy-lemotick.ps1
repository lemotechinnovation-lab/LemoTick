# ================================================================================
# LemoTick Bot Windows Deployment Script
# ================================================================================
# PowerShell script for deploying LemoTick bot on Windows
# Usage: .\deploy-lemotick.ps1 [deploy|start|stop|restart|status]
# ================================================================================

param(
    [Parameter(Position=0)]
    [ValidateSet("deploy", "start", "stop", "restart", "status", "logs", "health")]
    [string]$Action = "deploy"
)

# Configuration
$BotName = "LemoTickBot"
$BotHome = "C:\LemoTick"
$LogDir = "C:\LemoTick\logs"
$ServiceName = "LemoTickBot"
$PythonVersion = "3.9"

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

# Install Python and dependencies
function Install-Dependencies {
    Write-Log "Installing dependencies..."
    
    # Check if Python is installed
    try {
        $pythonVersion = python --version 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Python not found. Please install Python 3.9+ first."
            Write-Info "Download from: https://www.python.org/downloads/"
            exit 1
        }
        Write-Log "Python found: $pythonVersion"
    }
    catch {
        Write-Warning "Python not found. Please install Python 3.9+ first."
        exit 1
    }
    
    # Install pip packages
    Write-Log "Installing Python packages..."
    pip install --upgrade pip
    pip install -r "bot\requirements.txt"
    
    Write-Log "Dependencies installed successfully"
}

# Create directories and setup
function Setup-Directories {
    Write-Log "Setting up directories..."
    
    # Create directories
    $directories = @($BotHome, $LogDir, "$BotHome\config", "$BotHome\data", "$BotHome\backups")
    foreach ($dir in $directories) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Log "Created directory: $dir"
        }
    }
    
    Write-Log "Directories setup complete"
}

# Deploy bot code
function Deploy-BotCode {
    Write-Log "Deploying bot code..."
    
    # Copy bot files
    Copy-Item -Path "bot\*" -Destination $BotHome -Recurse -Force
    
    # Copy config if it doesn't exist
    if (!(Test-Path "$BotHome\config\settings.yaml")) {
        Copy-Item -Path "bot\config\settings.yaml" -Destination "$BotHome\config\" -Force
        Write-Log "Configuration file copied"
    }
    
    Write-Log "Bot code deployed successfully"
}

# Create Windows Service
function Create-WindowsService {
    Write-Log "Creating Windows Service..."
    
    # Check if service already exists
    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($service) {
        Write-Warning "Service $ServiceName already exists"
        return
    }
    
    # Create service using sc.exe
    $servicePath = "python.exe `"$BotHome\run_bot.py`""
    
    try {
        # Create the service
        sc.exe create $ServiceName binPath= $servicePath start= auto DisplayName= "LemoTick Trading Bot"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Windows Service created successfully"
        } else {
            Write-Error "Failed to create Windows Service"
            exit 1
        }
    }
    catch {
        Write-Error "Error creating Windows Service: $_"
        exit 1
    }
}

# Create management scripts
function Create-ManagementScripts {
    Write-Log "Creating management scripts..."
    
    # Create start script
    $startScript = @"
@echo off
echo Starting LemoTick Bot...
sc start $ServiceName
if %errorlevel% equ 0 (
    echo Bot started successfully
) else (
    echo Failed to start bot
)
pause
"@
    $startScript | Out-File -FilePath "$BotHome\start-bot.bat" -Encoding ASCII
    
    # Create stop script
    $stopScript = @"
@echo off
echo Stopping LemoTick Bot...
sc stop $ServiceName
if %errorlevel% equ 0 (
    echo Bot stopped successfully
) else (
    echo Failed to stop bot
)
pause
"@
    $stopScript | Out-File -FilePath "$BotHome\stop-bot.bat" -Encoding ASCII
    
    # Create restart script
    $restartScript = @"
@echo off
echo Restarting LemoTick Bot...
sc stop $ServiceName
timeout /t 3 /nobreak >nul
sc start $ServiceName
if %errorlevel% equ 0 (
    echo Bot restarted successfully
) else (
    echo Failed to restart bot
)
pause
"@
    $restartScript | Out-File -FilePath "$BotHome\restart-bot.bat" -Encoding ASCII
    
    # Create status script
    $statusScript = @"
@echo off
echo LemoTick Bot Status:
sc query $ServiceName
echo.
echo Recent logs:
powershell -Command "Get-EventLog -LogName Application -Source '$ServiceName' -Newest 10 | Format-Table TimeGenerated, EntryType, Message -Wrap"
pause
"@
    $statusScript | Out-File -FilePath "$BotHome\status-bot.bat" -Encoding ASCII
    
    Write-Log "Management scripts created"
}

# Main deployment function
function Deploy-Bot {
    Write-Log "Starting LemoTick Bot deployment..."
    
    if (!(Test-Administrator)) {
        Write-Error "This script must be run as Administrator"
        Write-Info "Right-click PowerShell and select 'Run as Administrator'"
        exit 1
    }
    
    Install-Dependencies
    Setup-Directories
    Deploy-BotCode
    Create-WindowsService
    Create-ManagementScripts
    
    Write-Log "Deployment completed successfully!"
    Write-Info "Bot is ready to start. Use: .\start-bot.bat"
}

# Service management functions
function Start-BotService {
    Write-Log "Starting LemoTick Bot service..."
    
    try {
        Start-Service -Name $ServiceName
        Start-Sleep -Seconds 3
        
        $service = Get-Service -Name $ServiceName
        if ($service.Status -eq "Running") {
            Write-Log "✅ Bot started successfully"
        } else {
            Write-Error "❌ Failed to start bot"
            Get-Service -Name $ServiceName
            exit 1
        }
    }
    catch {
        Write-Error "Error starting service: $_"
        exit 1
    }
}

function Stop-BotService {
    Write-Log "Stopping LemoTick Bot service..."
    
    try {
        Stop-Service -Name $ServiceName -Force
        Start-Sleep -Seconds 3
        
        $service = Get-Service -Name $ServiceName
        if ($service.Status -eq "Stopped") {
            Write-Log "✅ Bot stopped successfully"
        } else {
            Write-Error "❌ Failed to stop bot"
            exit 1
        }
    }
    catch {
        Write-Error "Error stopping service: $_"
        exit 1
    }
}

function Restart-BotService {
    Write-Log "Restarting LemoTick Bot service..."
    
    try {
        Restart-Service -Name $ServiceName
        Start-Sleep -Seconds 3
        
        $service = Get-Service -Name $ServiceName
        if ($service.Status -eq "Running") {
            Write-Log "✅ Bot restarted successfully"
        } else {
            Write-Error "❌ Failed to restart bot"
            Get-Service -Name $ServiceName
            exit 1
        }
    }
    catch {
        Write-Error "Error restarting service: $_"
        exit 1
    }
}

function Show-BotStatus {
    Write-Log "LemoTick Bot Status:"
    Write-Host ""
    
    # Service status
    Get-Service -Name $ServiceName
    Write-Host ""
    
    # Process info
    Write-Info "Process Information:"
    Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*run_bot.py*" }
    Write-Host ""
    
    # Memory usage
    Write-Info "Memory Usage:"
    Get-Process -Name "python" -ErrorAction SilentlyContinue | Select-Object ProcessName, Id, WorkingSet, CPU | Format-Table
    Write-Host ""
    
    # Recent logs
    Write-Info "Recent Activity:"
    try {
        Get-EventLog -LogName Application -Source $ServiceName -Newest 10 -ErrorAction SilentlyContinue | Format-Table TimeGenerated, EntryType, Message -Wrap
    }
    catch {
        Write-Warning "No event log entries found"
    }
}

function Show-BotLogs {
    param([int]$Lines = 50)
    
    Write-Log "Showing last $Lines lines of bot logs:"
    Write-Host ""
    
    $logFile = "$LogDir\runtime.log"
    if (Test-Path $logFile) {
        Get-Content $logFile -Tail $Lines
    } else {
        Write-Warning "Log file not found: $logFile"
    }
}

function Test-BotHealth {
    Write-Log "Performing health check..."
    
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
    
    Write-Log "Health check completed"
}

# Main script logic
switch ($Action) {
    "deploy" {
        Deploy-Bot
    }
    "start" {
        Start-BotService
    }
    "stop" {
        Stop-BotService
    }
    "restart" {
        Restart-BotService
    }
    "status" {
        Show-BotStatus
    }
    "logs" {
        Show-BotLogs
    }
    "health" {
        Test-BotHealth
    }
    default {
        Write-Host "LemoTick Bot Windows Deployment Script"
        Write-Host ""
        Write-Host "Usage: .\deploy-lemotick.ps1 [command]"
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  deploy   - Deploy the bot (default)"
        Write-Host "  start    - Start the bot service"
        Write-Host "  stop     - Stop the bot service"
        Write-Host "  restart  - Restart the bot service"
        Write-Host "  status   - Show bot status and logs"
        Write-Host "  logs     - Show bot logs"
        Write-Host "  health   - Quick health check"
        Write-Host ""
        Write-Host "Examples:"
        Write-Host "  .\deploy-lemotick.ps1 deploy    # Deploy the bot"
        Write-Host "  .\deploy-lemotick.ps1 start     # Start the bot"
        Write-Host "  .\deploy-lemotick.ps1 status    # Check status"
    }
}
