#!/usr/bin/env bash
# ==============================================================================
# FairProctor-AI: AWS EC2 Server Bootstrap Script
# ==============================================================================
# Targets: Ubuntu 22.04 LTS / 24.04 LTS on AWS EC2 (t3.small or t3.medium recommended)
# Installs: Docker Engine, Docker Compose Plugin, AWS CLI v2, and prepares ~/fairproctor
# ==============================================================================

set -euo pipefail

echo "=========================================================="
echo "🚀 Bootstrapping FairProctor-AI Environment on AWS EC2..."
echo "=========================================================="

# 1. Update system packages
echo "📦 Updating apt packages..."
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release unzip

# 2. Install Docker & Docker Compose Plugin
echo "🐳 Installing Docker Engine and Compose plugin..."
if ! command -v docker &> /dev/null; then
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

# Enable and start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Add current user (e.g. ubuntu) to docker group to allow non-sudo docker commands
sudo usermod -aG docker "$USER"

# 3. Install AWS CLI v2 if not already present
echo "☁️ Checking AWS CLI v2..."
if ! command -v aws &> /dev/null; then
    echo "Installing AWS CLI v2..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip -q awscliv2.zip
    sudo ./aws/install
    rm -rf awscliv2.zip ./aws
fi

# 4. Prepare application deployment directory
APP_DIR="$HOME/fairproctor"
mkdir -p "$APP_DIR"
chmod 755 "$APP_DIR"

echo "=========================================================="
echo "✅ EC2 Server Bootstrap Complete!"
echo "=========================================================="
echo "• Docker Version:        $(docker --version)"
echo "• Docker Compose:       $(docker compose version)"
echo "• AWS CLI Version:      $(aws --version)"
echo "• Application Directory: $APP_DIR"
echo ""
echo "👉 NOTE: To use Docker without 'sudo' immediately in this session, run:"
echo "   newgrp docker"
echo "=========================================================="
