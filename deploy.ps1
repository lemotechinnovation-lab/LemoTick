# LemoTick Bot Deployment Manager
# Main entry point for all deployment operations

param(
    [Parameter(Position=0)]
    [ValidateSet("vps", "local", "docker", "monitoring", "help")]
    [string]$Target = "help",
    
    [Parameter(Position=1)]
    [ValidateSet("deploy", "start", "stop", "restart", "status", "logs", "update", "health")]
    [string]$Action = "deploy"
)

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
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-ColorOutput "[$timestamp] $Message" "Green"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "[INFO] $Message" "Cyan"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "[ERROR] $Message" "Red"
}

# Show help
function Show-Help {
    Write-Log "LemoTick Bot Deployment Manager"
    Write-Host ""
    Write-Info "Usage: .\deploy.ps1 <target> <action>"
    Write-Host ""
    Write-Info "Targets:"
    Write-Host "  vps         - Deploy to VPS (AlmaLinux 10)"
    Write-Host "  local       - Deploy locally (Windows)"
    Write-Host "  docker      - Deploy using Docker"
    Write-Host "  monitoring  - Deploy monitoring stack to VPS"
    Write-Host "  help        - Show this help"
    Write-Host ""
    Write-Info "Actions:"
    Write-Host "  deploy  - Deploy/install the bot"
    Write-Host "  start   - Start the bot service"
    Write-Host "  stop    - Stop the bot service"
    Write-Host "  restart - Restart the bot service"
    Write-Host "  status  - Check service status"
    Write-Host "  logs    - View bot logs"
    Write-Host "  update  - Update bot code"
    Write-Host "  health  - Health check"
    Write-Host ""
    Write-Info "Examples:"
    Write-Host "  .\deploy.ps1 vps deploy        # Deploy to VPS"
    Write-Host "  .\deploy.ps1 local start       # Start local bot"
    Write-Host "  .\deploy.ps1 vps logs          # View VPS logs"
    Write-Host "  .\deploy.ps1 docker deploy     # Deploy with Docker"
    Write-Host "  .\deploy.ps1 monitoring deploy # Deploy monitoring to VPS"
    Write-Host ""
    Write-Info "For detailed documentation, see: deployment\docs\"
}

# Execute deployment based on target
switch ($Target) {
    "vps" {
        Write-Log "Deploying to VPS..."
        & "deployment\scripts\deploy-to-vps.ps1" $Action
    }
    "local" {
        Write-Log "Deploying locally..."
        & "deployment\scripts\deploy-lemotick.ps1" $Action
    }
    "monitoring" {
        Write-Log "Deploying monitoring stack to VPS..."
        & "deployment\scripts\deploy-monitoring-vps.ps1" $Action
    }
    "help" {
        Show-Help
    }
    default {
        Write-Error "Invalid target: $Target"
        Show-Help
    }
}
