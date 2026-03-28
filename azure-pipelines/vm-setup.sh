#!/usr/bin/env bash
# ==============================================================
# LemoTick – AlmaLinux 10 VM Bootstrap
#
# Tested on: AlmaLinux 10 (DNF 5 / RHEL 10 base)
# Host:      Any server — on-prem, VPS, bare metal (no Azure Portal needed)
# CI/CD:     Azure DevOps (pipelines SSH into this VM to deploy)
#
# Run this ONCE on each VM (dev / qa / prod) BEFORE the first
# Azure DevOps pipeline deployment.
#
# Usage:
#   chmod +x vm-setup.sh
#   sudo ./vm-setup.sh
#
# What it does:
#   1.  System update + essential tools
#   2.  Enable CRB repo (required for Docker dependencies)
#   3.  Install DNF5 plugins (required for dnf config-manager)
#   4.  Install Docker CE (removes conflicting Podman packages)
#   5.  Install Nginx
#   6.  Write Nginx config (SPA + API reverse proxy + SignalR)
#   7.  Fix SELinux contexts so Nginx can read web files & proxy
#   8.  Open firewall ports (22, 80, 443, 5000)
#   9.  Create bot log directory
#   10. Create sudoers rule for deploy user (passwordless sudo)
#   11. Print SSH key instructions for Azure DevOps
# ==============================================================

set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

[[ $EUID -ne 0 ]] && error "Run as root: sudo $0"

# Resolve the actual user who invoked sudo (fallback: azuredevops)
DEPLOY_USER="${SUDO_USER:-azuredevops}"
info "Deploy user: $DEPLOY_USER"

# ─── 1. System update + essential tools ───────────────────────
info "Updating system packages..."
dnf update -y
dnf install -y \
  curl wget git tar unzip \
  ca-certificates \
  firewalld \
  policycoreutils-python-utils \
  selinux-policy-targeted

# ─── 2. Enable CRB (CodeReady Builder) ───────────────────────
# Required for container-selinux and other Docker dependencies on
# RHEL 10 / AlmaLinux 10.
info "Enabling CRB repository..."
dnf config-manager --enable crb 2>/dev/null || \
  dnf config-manager --enable crb-debug 2>/dev/null || \
  warn "CRB repo enable failed — continuing (may already be enabled)."

# ─── 3. Install DNF5 plugins ──────────────────────────────────
# AlmaLinux 10 uses DNF 5; 'dnf config-manager --add-repo' requires
# the dnf5-plugins package (not present by default).
info "Installing dnf5-plugins..."
dnf install -y dnf5-plugins || \
  dnf install -y 'dnf-command(config-manager)' || \
  warn "Could not install dnf5-plugins — config-manager may already be available."

# ─── 4. Install Docker CE ─────────────────────────────────────
info "Installing Docker CE..."

# Remove conflicting packages that ship with AlmaLinux 10.
# --allowerasing is needed because Docker conflicts with Podman's
# docker-compatible shims on RHEL 10 derivatives.
dnf remove -y \
  docker docker-client docker-client-latest \
  docker-common docker-latest docker-latest-logrotate \
  docker-logrotate docker-engine \
  podman-docker 2>/dev/null || true

# Add Docker's official RHEL repository (covers AlmaLinux 10)
dnf config-manager --add-repo \
  https://download.docker.com/linux/rhel/docker-ce.repo

# Install container-selinux first (from CRB) — Docker depends on it
dnf install -y container-selinux

# Install Docker CE — use --allowerasing to resolve any Podman conflicts
dnf install -y --allowerasing \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin

systemctl enable --now docker
info "Docker: $(docker --version)"

# Add deploy user to docker group so pipeline SSH tasks can run
# docker commands without sudo
usermod -aG docker "$DEPLOY_USER"
info "$DEPLOY_USER added to docker group."

# ─── 5. Install Nginx ─────────────────────────────────────────
info "Installing Nginx..."
dnf install -y nginx
systemctl enable --now nginx
info "Nginx: $(nginx -v 2>&1)"

# ─── 6. Write Nginx configuration ─────────────────────────────
info "Configuring Nginx..."
SERVER_IP=$(hostname -I | awk '{print $1}')

# Disable the default server block so our config takes precedence
sed -i 's|include /etc/nginx/conf.d/\*.conf;|include /etc/nginx/conf.d/*.conf;|' \
  /etc/nginx/nginx.conf 2>/dev/null || true

cat > /etc/nginx/conf.d/lemotick.conf <<NGINX
# LemoTick – Nginx (single VM, three environments)
#
#  prod  port 80   →  /var/www/lemotick-prod  →  backend :5000
#  qa    port 8090 →  /var/www/lemotick-qa    →  backend :5002
#  dev   port 8080 →  /var/www/lemotick-dev   →  backend :5001

# ── Shared proxy settings ────────────────────────────────────
map \$http_upgrade \$connection_upgrade {
    default upgrade;
    ''      close;
}

# ════════════════════════════════════════════════════════════
# PRODUCTION  –  port 80
# ════════════════════════════════════════════════════════════
server {
    listen 80 default_server;
    server_name ${SERVER_IP} _;
    root  /var/www/lemotick-prod;
    index index.html;

    location / { try_files \$uri \$uri/ /index.html; }

    location /api/ {
        proxy_pass         http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade      \$http_upgrade;
        proxy_set_header   Connection   \$connection_upgrade;
        proxy_set_header   Host         \$host;
        proxy_set_header   X-Real-IP    \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 90s;
    }
    location /notificationHub {
        proxy_pass http://127.0.0.1:5000/notificationHub;
        proxy_http_version 1.1;
        proxy_set_header Upgrade   \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Host      \$host;
        proxy_read_timeout 3600s;
    }
    location /tradingHub {
        proxy_pass http://127.0.0.1:5000/tradingHub;
        proxy_http_version 1.1;
        proxy_set_header Upgrade   \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Host      \$host;
        proxy_read_timeout 3600s;
    }

    add_header X-Frame-Options        "SAMEORIGIN"    always;
    add_header X-Content-Type-Options "nosniff"       always;
    add_header Referrer-Policy        "strict-origin"  always;
    gzip on; gzip_vary on;
    gzip_types text/plain text/css text/javascript application/json
               application/javascript application/xml image/svg+xml;
}

# ════════════════════════════════════════════════════════════
# QA / STAGING  –  port 8090
# ════════════════════════════════════════════════════════════
server {
    listen 8090;
    server_name ${SERVER_IP} _;
    root  /var/www/lemotick-qa;
    index index.html;

    location / { try_files \$uri \$uri/ /index.html; }

    location /api/ {
        proxy_pass         http://127.0.0.1:5002/api/;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade      \$http_upgrade;
        proxy_set_header   Connection   \$connection_upgrade;
        proxy_set_header   Host         \$host;
        proxy_set_header   X-Real-IP    \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 90s;
    }
    location /notificationHub {
        proxy_pass http://127.0.0.1:5002/notificationHub;
        proxy_http_version 1.1;
        proxy_set_header Upgrade   \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Host      \$host;
        proxy_read_timeout 3600s;
    }
    location /tradingHub {
        proxy_pass http://127.0.0.1:5002/tradingHub;
        proxy_http_version 1.1;
        proxy_set_header Upgrade   \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Host      \$host;
        proxy_read_timeout 3600s;
    }

    add_header X-Frame-Options        "SAMEORIGIN"    always;
    add_header X-Content-Type-Options "nosniff"       always;
    gzip on; gzip_vary on;
    gzip_types text/plain text/css text/javascript application/json
               application/javascript application/xml image/svg+xml;
}

# ════════════════════════════════════════════════════════════
# DEVELOPMENT  –  port 8080
# ════════════════════════════════════════════════════════════
server {
    listen 8080;
    server_name ${SERVER_IP} _;
    root  /var/www/lemotick-dev;
    index index.html;

    location / { try_files \$uri \$uri/ /index.html; }

    location /api/ {
        proxy_pass         http://127.0.0.1:5001/api/;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade      \$http_upgrade;
        proxy_set_header   Connection   \$connection_upgrade;
        proxy_set_header   Host         \$host;
        proxy_set_header   X-Real-IP    \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 90s;
    }
    location /notificationHub {
        proxy_pass http://127.0.0.1:5001/notificationHub;
        proxy_http_version 1.1;
        proxy_set_header Upgrade   \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Host      \$host;
        proxy_read_timeout 3600s;
    }
    location /tradingHub {
        proxy_pass http://127.0.0.1:5001/tradingHub;
        proxy_http_version 1.1;
        proxy_set_header Upgrade   \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Host      \$host;
        proxy_read_timeout 3600s;
    }

    add_header X-Frame-Options        "SAMEORIGIN"    always;
    add_header X-Content-Type-Options "nosniff"       always;
    gzip on; gzip_vary on;
    gzip_types text/plain text/css text/javascript application/json
               application/javascript application/xml image/svg+xml;
}
NGINX

# Create all three web roots with placeholders
for ENV in prod qa dev; do
  mkdir -p /var/www/lemotick-${ENV}
  echo "<h1>LemoTick (${ENV}) — awaiting first deployment…</h1>" \
    > /var/www/lemotick-${ENV}/index.html
  chown -R nginx:nginx /var/www/lemotick-${ENV}
  chmod -R 755 /var/www/lemotick-${ENV}
done

# ─── 7. SELinux contexts ──────────────────────────────────────
# AlmaLinux 10 ships with SELinux enforcing by default.
# Without these, Nginx silently returns 403 or cannot proxy.
info "Applying SELinux contexts..."

# Allow Nginx to make outbound TCP connections (needed for proxy_pass)
setsebool -P httpd_can_network_connect 1

# Label the web root so Nginx can read the static files
chcon -Rt httpd_sys_content_t /var/www/lemotick-dashboard

# Allow Nginx to write to the directory (optional; required only if
# Nginx needs to create/overwrite files itself)
# semanage fcontext -a -t httpd_sys_rw_content_t "/var/www/lemotick-dashboard(/.*)?"
# restorecon -Rv /var/www/lemotick-dashboard

info "SELinux contexts applied."

# ─── 8. Firewall ──────────────────────────────────────────────
info "Configuring firewalld..."
systemctl enable --now firewalld

firewall-cmd --permanent --add-service=ssh         # 22
firewall-cmd --permanent --add-service=http        # 80   (prod dashboard)
firewall-cmd --permanent --add-service=https       # 443
firewall-cmd --permanent --add-port=8080/tcp       # dev  dashboard
firewall-cmd --permanent --add-port=8090/tcp       # qa   dashboard
firewall-cmd --permanent --add-port=5000/tcp       # prod backend (direct)
firewall-cmd --permanent --add-port=5001/tcp       # dev  backend (direct)
firewall-cmd --permanent --add-port=5002/tcp       # qa   backend (direct)
firewall-cmd --reload
info "Firewall rules active."

# ─── 9. Bot log directory ─────────────────────────────────────
info "Creating bot log directories..."
for ENV in prod qa dev; do
  mkdir -p /var/log/lemotick-bot-${ENV}
  chown "${DEPLOY_USER}:${DEPLOY_USER}" /var/log/lemotick-bot-${ENV} 2>/dev/null || \
    chown 1000:1000 /var/log/lemotick-bot-${ENV}
  chmod 755 /var/log/lemotick-bot-${ENV}
done

# ─── 10. Sudoers — passwordless sudo for deploy user ──────────
# The Azure DevOps SSH tasks run commands like:
#   sudo mkdir, sudo chown, sudo chmod, sudo nginx -t,
#   sudo systemctl reload nginx
# The deploy user needs NOPASSWD access to these.
info "Writing sudoers rule for $DEPLOY_USER..."
cat > /etc/sudoers.d/lemotick-deploy <<SUDOERS
# LemoTick CI/CD deploy user — passwordless sudo
# Scoped to only the commands the pipelines need.
${DEPLOY_USER} ALL=(ALL) NOPASSWD: \
  /usr/bin/mkdir, \
  /usr/bin/chown, \
  /usr/bin/chmod, \
  /usr/sbin/nginx, \
  /usr/bin/systemctl reload nginx, \
  /usr/bin/systemctl restart nginx, \
  /usr/bin/systemctl status nginx, \
  /usr/bin/systemctl reload docker, \
  /usr/bin/docker
SUDOERS
chmod 440 /etc/sudoers.d/lemotick-deploy

# Validate the sudoers file — if it's broken, delete it to avoid lockout
visudo -c -f /etc/sudoers.d/lemotick-deploy || {
  warn "sudoers file invalid — removing to prevent lockout."
  rm -f /etc/sudoers.d/lemotick-deploy
}

# ─── Validate Nginx config & reload ───────────────────────────
nginx -t
systemctl reload nginx
info "Nginx validated and reloaded."

# ─── 11. Print next steps ─────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  VM setup complete                                       ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Host : $(hostname)"
echo "║  IP   : $SERVER_IP"
echo "║  User : $DEPLOY_USER"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  NEXT — Add SSH key for Azure DevOps                     ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo ""
echo "  1. Generate a deploy key (do this on YOUR laptop, not VM):"
echo "       ssh-keygen -t ed25519 -C 'lemotick-azuredevops' \\"
echo "                  -f ~/.ssh/lemotick_deploy"
echo ""
echo "  2. Add the public key to this VM:"
echo "       ssh-copy-id -i ~/.ssh/lemotick_deploy.pub \\"
echo "         ${DEPLOY_USER}@${SERVER_IP}"
echo "     Or manually:"
echo "       echo '<contents of lemotick_deploy.pub>' \\"
echo "         >> /home/${DEPLOY_USER}/.ssh/authorized_keys"
echo ""
echo "  3. Create SSH service connection in Azure DevOps:"
echo "       Project Settings → Service Connections → New → SSH"
echo "       Host:         $SERVER_IP"
echo "       Port:         22"
echo "       Username:     $DEPLOY_USER"
echo "       Private key:  (paste contents of ~/.ssh/lemotick_deploy)"
echo "       Name:         lemotick-ssh-dev   ← (or qa / prod)"
echo ""
echo "  4. Re-login as $DEPLOY_USER so docker group takes effect:"
echo "       (Azure DevOps SSH connections always get a fresh session)"
echo "       No action needed — group membership applies on next SSH."
echo ""
echo "  5. Repeat this script on the QA and Prod VMs."
echo "╚══════════════════════════════════════════════════════════╝"
