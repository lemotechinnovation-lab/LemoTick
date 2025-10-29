# LemoTick VPS Monitoring Deployment Script (PowerShell)
# Deploys Prometheus, Grafana, Loki, and Promtail to monitor the bot

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("deploy", "start", "stop", "restart", "status", "logs", "update")]
    [string]$Action = "deploy"
)

$VPS_HOST = "154.66.197.250"  # IP address (more reliable than hostname)
$VPS_USER = "root"
$BOT_HOME = "/opt/lemotick"
$MONITORING_HOME = "/opt/lemotick-monitoring"
$SSH_KEY = "$env:USERPROFILE\.ssh\lemotick_vps_key"

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message"
}

function Write-Info {
    param([string]$Message)
    Write-Host "📋 $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Run-VPSCommand {
    param([string]$Command)
    Write-Info "Running: $Command"
    ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" $Command
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Command failed: $Command"
        exit 1
    }
}

function Copy-ToVPS {
    param([string]$LocalPath, [string]$RemotePath)
    Write-Info "Copying: $LocalPath -> $RemotePath"
    scp -i "$SSH_KEY" "$LocalPath" "$VPS_USER@$VPS_HOST`:$RemotePath"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Copy failed: $LocalPath"
        exit 1
    }
}

function Deploy-Monitoring {
    Write-Log "🚀 Deploying LemoTick Monitoring Stack to VPS..."
    
    Write-Info "Step 1: Installing Docker on VPS..."
    $commands = @(
        "dnf install -y docker docker-compose",
        "systemctl enable docker",
        "systemctl start docker"
    )
    foreach ($cmd in $commands) {
        Run-VPSCommand $cmd
    }
    
    Write-Info "Step 2: Creating monitoring directory..."
    Run-VPSCommand "mkdir -p $MONITORING_HOME"
    
    Write-Info "Step 3: Copying monitoring configuration files..."
    Copy-ToVPS "bot/monitoring/docker-compose.monitoring.yml" "$MONITORING_HOME/docker-compose.yml"
    Copy-ToVPS "bot/monitoring/prometheus-vps.yml" "$MONITORING_HOME/prometheus.yml"
    Copy-ToVPS "bot/monitoring/lemotick_rules.yml" "$MONITORING_HOME/lemotick_rules.yml"
    Copy-ToVPS "bot/monitoring/loki.yml" "$MONITORING_HOME/loki.yml"
    Copy-ToVPS "bot/monitoring/promtail.yml" "$MONITORING_HOME/promtail.yml"
    
    Write-Info "Step 4: Copying Grafana configuration..."
    Run-VPSCommand "mkdir -p $MONITORING_HOME/grafana/dashboards"
    Run-VPSCommand "mkdir -p $MONITORING_HOME/grafana/datasources"
    
    Copy-ToVPS "bot/monitoring/grafana/dashboards/dashboard.yml" "$MONITORING_HOME/grafana/dashboards/"
    Copy-ToVPS "bot/monitoring/grafana/datasources/prometheus.yml" "$MONITORING_HOME/grafana/datasources/"
    Copy-ToVPS "bot/monitoring/grafana/datasources/loki.yml" "$MONITORING_HOME/grafana/datasources/"
    
    Write-Info "Step 5: Updating Prometheus config for VPS..."
    Run-VPSCommand "sed -i 's/host.docker.internal:8000/localhost:8000/g' $MONITORING_HOME/prometheus.yml"
    
    Write-Info "Step 6: Starting monitoring stack..."
    Run-VPSCommand "cd $MONITORING_HOME; docker-compose up -d"
    
    Write-Info "Step 7: Installing Node Exporter for system metrics..."
    Run-VPSCommand "docker run -d --name node-exporter --restart unless-stopped -p 9100:9100 prom/node-exporter"
    
    Write-Info "Step 8: Opening firewall ports..."
    $ports = @("3000/tcp", "9090/tcp", "3100/tcp", "9100/tcp")
    foreach ($port in $ports) {
        Run-VPSCommand "firewall-cmd --permanent --add-port=$port"
    }
    Run-VPSCommand "firewall-cmd --reload"
    
    Write-Success "Monitoring stack deployed successfully!"
    Write-Host ""
    Write-Host "🌐 Access URLs:" -ForegroundColor Yellow
    Write-Host "   Grafana:    http://154.66.197.250:3000 (admin/lemotick2024)" -ForegroundColor Green
    Write-Host "   Prometheus: http://154.66.197.250:9091" -ForegroundColor Green
    Write-Host "   Loki:       http://154.66.197.250:3100" -ForegroundColor Green
    Write-Host "   Node Exporter: http://154.66.197.250:9100" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Bot Metrics: http://154.66.197.250:8000" -ForegroundColor Cyan
}

function Start-Monitoring {
    Write-Log "Starting monitoring stack..."
    Run-VPSCommand "cd $MONITORING_HOME; docker-compose up -d"
    Write-Success "Monitoring stack started!"
}

function Stop-Monitoring {
    Write-Log "Stopping monitoring stack..."
    Run-VPSCommand "cd $MONITORING_HOME; docker-compose down"
    Write-Success "Monitoring stack stopped!"
}

function Restart-Monitoring {
    Write-Log "Restarting monitoring stack..."
    Run-VPSCommand "cd $MONITORING_HOME; docker-compose restart"
    Write-Success "Monitoring stack restarted!"
}

function Get-MonitoringStatus {
    Write-Log "Checking monitoring stack status..."
    Run-VPSCommand "cd $MONITORING_HOME; docker-compose ps"
}

function Get-MonitoringLogs {
    Write-Log "Showing monitoring stack logs..."
    Run-VPSCommand "cd $MONITORING_HOME; docker-compose logs -f"
}

function Update-Monitoring {
    Write-Log "Updating monitoring stack..."
    Run-VPSCommand "cd $MONITORING_HOME; docker-compose pull; docker-compose up -d"
    Write-Success "Monitoring stack updated!"
}

# Main execution
switch ($Action) {
    "deploy" { Deploy-Monitoring }
    "start" { Start-Monitoring }
    "stop" { Stop-Monitoring }
    "restart" { Restart-Monitoring }
    "status" { Get-MonitoringStatus }
    "logs" { Get-MonitoringLogs }
    "update" { Update-Monitoring }
    default {
        Write-Error "Invalid action: $Action"
        Write-Host "Valid actions: deploy, start, stop, restart, status, logs, update"
        exit 1
    }
}