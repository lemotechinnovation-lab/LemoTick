# LemoTick VPS Configuration
# Centralized configuration for all deployment scripts

# VPS Connection Details
$VPS_HOST = "154.66.197.250"  # IP address (more reliable than hostname)
$VPS_HOSTNAME = "build-agent.lemotechinnovations.co.za"  # Friendly hostname for display
$VPS_USER = "root"

# Bot Configuration
$BOT_NAME = "lemotick-bot"
$BOT_USER = "lemotick"
$BOT_HOME = "/opt/lemotick"
$BOT_LOG_DIR = "/var/log/lemotick"
$SERVICE_FILE = "/etc/systemd/system/lemotick-bot.service"

# Monitoring Configuration
$MONITORING_HOME = "/opt/lemotick-monitoring"

# SSH Configuration
$SSH_KEY = "$env:USERPROFILE\.ssh\lemotick_vps_key"

# Service URLs (for display purposes)
$GRAFANA_URL = "http://$VPS_HOST:3000"
$PROMETHEUS_URL = "http://$VPS_HOST:9091"
$LOKI_URL = "http://$VPS_HOST:3100"
$NODE_EXPORTER_URL = "http://$VPS_HOST:9100"
$BOT_METRICS_URL = "http://$VPS_HOST:8000"

# Export all variables for use in other scripts
Export-ModuleMember -Variable *
