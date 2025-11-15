# ================================================================================
# LemoTick Bot VPS Deployment Script (PowerShell)
# ================================================================================
# PowerShell script for deploying LemoTick bot to AlmaLinux 10 VPS
# Usage: .\deploy-to-vps.ps1 [deploy|start|stop|restart|status|logs|update]
# ================================================================================

param(
    [Parameter(Position = 0)]
    [ValidateSet("deploy", "start", "stop", "restart", "status", "logs", "update", "health")]
    [string]$Action = "deploy"
)

# VPS Configuration
$VPS_HOST = "154.66.197.250"  # IP address (more reliable than hostname)
$VPS_USER = "root"  # Change to your VPS username
$VPS_HOSTNAME = "build-agent.lemotechinnovations.co.za"  # Friendly hostname for display
$BOT_NAME = "lemotick-bot"
$BOT_USER = "lemotick"
$BOT_HOME = "/opt/lemotick"
$BOT_LOG_DIR = "/var/log/lemotick"
$SERVICE_FILE = "/etc/systemd/system/lemotick-bot.service"
$SSH_KEY = "$env:USERPROFILE\.ssh\lemotick_vps_key"

# Project paths
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = (Get-Item $SCRIPT_DIR).Parent.Parent.FullName
$BOT_SOURCE_DIR = Join-Path $PROJECT_ROOT "bot"

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

# Check SSH connection
function Test-SSHConnection {
    Write-Log "Checking SSH connection to VPS..."
    
    try {
        $result = ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o BatchMode=yes "$VPS_USER@$VPS_HOST" "echo 'SSH connection successful'" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "SSH connection verified"
            return $true
        }
        else {
            Write-Error "Cannot connect to VPS at $VPS_HOST"
            Write-Error "Please ensure:"
            Write-Error "1. SSH key is configured"
            Write-Error "2. VPS is accessible"
            Write-Error "3. Username is correct: $VPS_USER"
            return $false
        }
    }
    catch {
        Write-Error "SSH connection failed: $_"
        return $false
    }
}

# Install dependencies on VPS
function Install-Dependencies {
    Write-Log "Installing dependencies on VPS..."
    
    $commands = @(
        "dnf update -y",
        "dnf install -y python3 python3-pip python3-devel git curl wget tmux nginx firewalld logrotate systemd rsync unzip gcc gcc-c++ make",
        "python3 -m pip install --upgrade pip",
        "systemctl enable firewalld",
        "systemctl start firewalld",
        "echo 'Dependencies installed successfully'"
    )
    
    foreach ($cmd in $commands) {
        Write-Info "Running: $cmd"
        ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" $cmd
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to run: $cmd"
            exit 1
        }
    }
    
    Write-Log "Dependencies installation completed"
}

# Create bot user and directories
function Setup-UserAndDirectories {
    Write-Log "Setting up bot user and directories on VPS..."
    
    $commands = @(
        "if ! id '${BOT_USER}' &>/dev/null; then useradd -r -s /bin/bash -d '${BOT_HOME}' -m '${BOT_USER}'; echo 'Created bot user: ${BOT_USER}'; else echo 'Bot user already exists: ${BOT_USER}'; fi",
        "mkdir -p '${BOT_HOME}'",
        "mkdir -p '${BOT_LOG_DIR}'",
        "mkdir -p '${BOT_HOME}/config'",
        "mkdir -p '${BOT_HOME}/data'",
        "mkdir -p '${BOT_HOME}/backups'",
        "chown -R '${BOT_USER}:${BOT_USER}' '${BOT_HOME}'",
        "chown -R '${BOT_USER}:${BOT_USER}' '${BOT_LOG_DIR}'",
        "chmod 755 '${BOT_HOME}'",
        "chmod 755 '${BOT_LOG_DIR}'",
        "echo 'User and directories setup complete'"
    )
    
    foreach ($cmd in $commands) {
        Write-Info "Running: $cmd"
        ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" $cmd
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to run: $cmd"
            exit 1
        }
    }
    
    Write-Log "User and directories setup completed"
}

# Deploy bot code to VPS
function Deploy-BotCode {
    Write-Log "Deploying bot code to VPS..."
    
    # Create temporary directory for bot files
    $tempDir = [System.IO.Path]::GetTempPath() + [System.Guid]::NewGuid().ToString()
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    
    try {
        # Copy bot files to temp directory
        Copy-Item -Path "$BOT_SOURCE_DIR\*" -Destination $tempDir -Recurse -Force
        
        # Remove unnecessary files
        Get-ChildItem -Path $tempDir -Recurse -Name "__pycache__" | ForEach-Object { Remove-Item -Path (Join-Path $tempDir $_) -Recurse -Force -ErrorAction SilentlyContinue }
        Get-ChildItem -Path $tempDir -Recurse -Filter "*.pyc" | Remove-Item -Force -ErrorAction SilentlyContinue
        Get-ChildItem -Path $tempDir -Recurse -Filter ".env" | Remove-Item -Force -ErrorAction SilentlyContinue
        Remove-Item -Path (Join-Path $tempDir "logs") -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path (Join-Path $tempDir "data") -Recurse -Force -ErrorAction SilentlyContinue
        
        # Copy to VPS using scp -i "$SSH_KEY"
        Write-Info "Uploading bot files to VPS..."
        scp -i "$SSH_KEY" -r "$tempDir\*" "$VPS_USER@$VPS_HOST`:$BOT_HOME/"
        
        if ($LASTEXITCODE -eq 0) {
            # Set ownership on VPS
            ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "chown -R ${BOT_USER}:${BOT_USER} ${BOT_HOME}"
            Write-Log "Bot code deployed successfully"
        }
        else {
            Write-Error "Failed to upload bot files to VPS"
            exit 1
        }
    }
    finally {
        # Cleanup
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Setup Python virtual environment on VPS
function Setup-PythonEnvironment {
    Write-Log "Setting up Python virtual environment on VPS..."
    
    $commands = @(
        "sudo -u '${BOT_USER}' python3 -m venv '${BOT_HOME}/venv'",
        "sudo -u '${BOT_USER}' bash -c 'source ${BOT_HOME}/venv/bin/activate && pip install --upgrade pip'",
        "sudo -u '${BOT_USER}' bash -c 'source ${BOT_HOME}/venv/bin/activate && pip install -r ${BOT_HOME}/requirements.txt'",
        "echo 'Python environment setup complete'"
    )
    
    foreach ($cmd in $commands) {
        Write-Info "Running: $cmd"
        ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" $cmd
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to run: $cmd"
            exit 1
        }
    }
    
    Write-Log "Python environment setup completed"
}

# Create systemd service on VPS
function Create-SystemdService {
    Write-Log "Creating systemd service on VPS..."
    
    $serviceContent = @"
[Unit]
Description=LemoTick Trading Bot
After=network.target
Wants=network.target

[Service]
Type=simple
User=$BOT_USER
Group=$BOT_USER
WorkingDirectory=$BOT_HOME
Environment=PATH=$BOT_HOME/venv/bin
ExecStart=$BOT_HOME/venv/bin/python3 $BOT_HOME/run_bot.py
ExecReload=/bin/kill -HUP `$MAINPID
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=lemotick-bot

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$BOT_HOME $BOT_LOG_DIR
CapabilityBoundingSet=
AmbientCapabilities=
SystemCallFilter=@system-service
SystemCallErrorNumber=EPERM

# Resource limits
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
"@

    # Create service file on VPS
    $serviceFileContent = $serviceContent -replace '"', '\"'
    ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "cat > '$SERVICE_FILE' << 'EOF'
$serviceContent
EOF"
    
    if ($LASTEXITCODE -eq 0) {
        # Reload systemd and enable service
        ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "systemctl daemon-reload"
        ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "systemctl enable '$BOT_NAME'"
        Write-Log "Systemd service created and enabled"
    }
    else {
        Write-Error "Failed to create systemd service"
        exit 1
    }
}

# Setup firewall on VPS
function Setup-Firewall {
    Write-Log "Setting up firewall on VPS..."
    
    $commands = @(
        "firewall-cmd --permanent --add-service=ssh",
        "firewall-cmd --permanent --add-service=http",
        "firewall-cmd --permanent --add-service=https",
        "firewall-cmd --permanent --add-port=8000/tcp",
        "firewall-cmd --reload",
        "echo 'Firewall configured'"
    )
    
    foreach ($cmd in $commands) {
        Write-Info "Running: $cmd"
        ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" $cmd
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to run: $cmd"
            exit 1
        }
    }
    
    Write-Log "Firewall configured"
}

# Main deployment function
function Deploy-Bot {
    Write-Log "Starting LemoTick Bot deployment to VPS..."
    Write-Log "Target VPS: $VPS_HOST ($VPS_HOSTNAME)"
    
    if (!(Test-SSHConnection)) {
        exit 1
    }
    
    Install-Dependencies
    Setup-UserAndDirectories
    Deploy-BotCode
    Setup-PythonEnvironment
    Create-SystemdService
    Setup-Firewall
    
    Write-Log "Deployment completed successfully!"
    Write-Info "Bot is ready to start. Use: .\deploy-to-vps.ps1 start"
}

# Service management functions
function Start-BotService {
    Write-Log "Starting LemoTick Bot service on VPS..."
    
    ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "systemctl start '${BOT_NAME}'"
    Start-Sleep -Seconds 3
    
    $result = ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "systemctl is-active --quiet '${BOT_NAME}'"
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Bot started successfully on VPS"
    }
    else {
        Write-Error "Failed to start bot on VPS"
        ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "systemctl status '${BOT_NAME}'"
        exit 1
    }
}

function Stop-BotService {
    Write-Log "Stopping LemoTick Bot service on VPS..."
    
    ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "systemctl stop '${BOT_NAME}'"
    Start-Sleep -Seconds 3
    
    $result = ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "systemctl is-active --quiet '${BOT_NAME}'"
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Bot stopped successfully on VPS"
    }
    else {
        Write-Error "Failed to stop bot on VPS"
        exit 1
    }
}

function Restart-BotService {
    Write-Log "Restarting LemoTick Bot service on VPS..."
    
    ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "systemctl restart '${BOT_NAME}'"
    Start-Sleep -Seconds 3
    
    $result = ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "systemctl is-active --quiet '${BOT_NAME}'"
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Bot restarted successfully on VPS"
    }
    else {
        Write-Error "Failed to restart bot on VPS"
        ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "systemctl status '${BOT_NAME}'"
        exit 1
    }
}

function Show-BotStatus {
    Write-Log "Checking LemoTick Bot service status on VPS..."
    
    # Service status
    ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "systemctl status '$BOT_NAME'"
    
    Write-Host ""
    Write-Info "Recent logs:"
    ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "journalctl -u '${BOT_NAME}' --no-pager -n 20"
}

function Show-BotLogs {
    param([int]$Lines = 50)
    
    Write-Log "Showing last $Lines lines of bot logs from VPS:"
    Write-Host ""
    ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "journalctl -u '${BOT_NAME}' --no-pager -n $Lines -f"
}

function Update-Bot {
    Write-Log "Updating LemoTick Bot on VPS..."
    
    # Stop bot if running
    $result = ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "systemctl is-active --quiet '${BOT_NAME}'"
    if ($LASTEXITCODE -eq 0) {
        Write-Warning "Stopping bot for update..."
        ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "systemctl stop '${BOT_NAME}'"
    }
    
    # Update code
    Write-Info "Updating bot code..."
    Deploy-BotCode
    
    # Update Python dependencies
    Write-Info "Updating Python dependencies..."
    ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "sudo -u '${BOT_USER}' bash -c 'source ${BOT_HOME}/venv/bin/activate && pip install --upgrade pip && pip install -r ${BOT_HOME}/requirements.txt'"
    
    # Restart bot
    Write-Info "Restarting bot..."
    ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "systemctl start '${BOT_NAME}'"
    
    Start-Sleep -Seconds 3
    $result = ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "systemctl is-active --quiet '${BOT_NAME}'"
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Bot updated and restarted successfully on VPS"
    }
    else {
        Write-Error "Failed to restart bot after update on VPS"
        ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "systemctl status '${BOT_NAME}'"
        exit 1
    }
}

function Test-BotHealth {
    Write-Log "Performing health check on VPS..."
    
    # Check service status
    $result = ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "systemctl is-active --quiet '${BOT_NAME}'"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Service: Running" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Service: Not running" -ForegroundColor Red
        return
    }
    
    # Check memory usage
    $memoryUsage = ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "ps -o pid,ppid,cmd,%mem,%cpu --sort=-%mem -C python3.9 | head -2 | tail -1 | awk '{print `$4}'"
    if ([double]$memoryUsage -lt 80) {
        Write-Host "✅ Memory: ${memoryUsage}% (OK)" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ Memory: ${memoryUsage}% (High)" -ForegroundColor Yellow
    }
    
    # Check disk space
    $diskUsage = ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "df / | tail -1 | awk '{print `$5}' | sed 's/%//'"
    if ([int]$diskUsage -lt 85) {
        Write-Host "✅ Disk: ${diskUsage}% (OK)" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ Disk: ${diskUsage}% (High)" -ForegroundColor Yellow
    }
    
    # Check recent errors
    $errorCount = ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "journalctl -u '${BOT_NAME}' --since '1 hour ago' | grep -i error | wc -l"
    if ([int]$errorCount -eq 0) {
        Write-Host "✅ Errors: None in last hour" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ Errors: $errorCount in last hour" -ForegroundColor Yellow
    }
    
    Write-Log "Health check completed"
}

# Show help
function Show-Help {
    Write-Host "LemoTick Bot VPS Manager (PowerShell)"
    Write-Host ""
    Write-Host "Usage: .\deploy-to-vps.ps1 [command]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  deploy    - Deploy bot to VPS"
    Write-Host "  start     - Start the bot service on VPS"
    Write-Host "  stop      - Stop the bot service on VPS"
    Write-Host "  restart   - Restart the bot service on VPS"
    Write-Host "  status    - Show bot status on VPS"
    Write-Host "  logs      - Show live logs from VPS (Ctrl+C to exit)"
    Write-Host "  logs N    - Show last N lines of logs from VPS"
    Write-Host "  update    - Update bot code and restart on VPS"
    Write-Host "  health    - Quick health check on VPS"
    Write-Host "  help      - Show this help message"
    Write-Host ""
    Write-Host "VPS Configuration:"
    Write-Host "  Host: $VPS_HOST"
    Write-Host "  User: $VPS_USER"
    Write-Host "  Hostname: $VPS_HOSTNAME"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\deploy-to-vps.ps1 deploy         # Deploy to VPS"
    Write-Host "  .\deploy-to-vps.ps1 start         # Start bot on VPS"
    Write-Host "  .\deploy-to-vps.ps1 logs 100     # Show last 100 lines"
    Write-Host "  .\deploy-to-vps.ps1 health       # Check bot health"
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
    "update" {
        Update-Bot
    }
    "health" {
        Test-BotHealth
    }
    "help" {
        Show-Help
    }
    default {
        Show-Help
    }
}