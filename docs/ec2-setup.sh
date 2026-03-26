#!/bin/bash
# =============================================================================
# EC2 Instance Setup Script
# =============================================================================
# Run this on a fresh Amazon Linux 2023 / Ubuntu EC2 instance to prepare it
# for the Plant Care Monitoring System deployment (Python FastAPI backend).
#
# Usage: sudo bash ec2-setup.sh
# =============================================================================

set -euo pipefail

echo "============================================="
echo "  EC2 Setup — Plant Care Monitoring System"
echo "============================================="

# ─────────────────────────────────────────────────
# 1. System Updates
# ─────────────────────────────────────────────────
echo "[1/6] Updating system packages..."
if command -v apt-get &> /dev/null; then
    sudo apt-get update -y && sudo apt-get upgrade -y
    PKG_MANAGER="apt-get"
else
    sudo yum update -y
    PKG_MANAGER="yum"
fi

# ─────────────────────────────────────────────────
# 2. Install Python 3.11
# ─────────────────────────────────────────────────
echo "[2/6] Installing Python 3.11..."
if [ "$PKG_MANAGER" = "apt-get" ]; then
    sudo apt-get install -y python3.11 python3.11-venv python3-pip
else
    sudo yum install -y python3.11 python3.11-pip python3.11-devel gcc
fi
python3.11 --version

# ─────────────────────────────────────────────────
# 3. Install Nginx
# ─────────────────────────────────────────────────
echo "[3/6] Installing Nginx..."
sudo $PKG_MANAGER install -y nginx
sudo systemctl enable nginx

# ─────────────────────────────────────────────────
# 4. Create application directory and user
# ─────────────────────────────────────────────────
echo "[4/6] Creating application directory..."
sudo mkdir -p /opt/plantcare /var/www/plantcare
sudo useradd -r -s /bin/false plantcare 2>/dev/null || true
sudo chown plantcare:plantcare /opt/plantcare

# ─────────────────────────────────────────────────
# 5. Configure Nginx
# ─────────────────────────────────────────────────
echo "[5/6] Configuring Nginx reverse proxy..."
sudo cp /opt/plantcare/nginx.conf /etc/nginx/conf.d/plantcare.conf 2>/dev/null || \
    echo "  Note: Copy nginx.conf manually to /etc/nginx/conf.d/"
sudo nginx -t && sudo systemctl restart nginx

# ─────────────────────────────────────────────────
# 6. Install security audit tools
# ─────────────────────────────────────────────────
echo "[6/6] Installing security tools..."
sudo $PKG_MANAGER install -y lynis clamav chkrootkit 2>/dev/null || \
    echo "  Note: Some security tools may need manual installation"

echo ""
echo "============================================="
echo "  Setup Complete!"
echo "============================================="
echo "  Next steps:"
echo "    1. Copy plantcare.service to /etc/systemd/system/"
echo "    2. Deploy backend to /opt/plantcare/"
echo "    3. Create venv: python3.11 -m venv /opt/plantcare/venv"
echo "    4. Install deps: /opt/plantcare/venv/bin/pip install -r requirements.txt"
echo "    5. Run: sudo systemctl daemon-reload && sudo systemctl start plantcare"
echo "============================================="
