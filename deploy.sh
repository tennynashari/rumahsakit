#!/bin/bash

# Script Deploy untuk Ubuntu 24.04
# Jalankan dengan: bash deploy.sh

set -e

echo "========================================="
echo "Deploy Klinik Information System"
echo "========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
APP_DIR="/var/www/klinik"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Jangan jalankan script ini sebagai root!${NC}"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo ""
echo "1. Checking Prerequisites..."
echo "--------------------------------"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found!"
    echo "Install Node.js first: https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found!"
    exit 1
fi

# Check PostgreSQL
if command_exists psql; then
    PG_VERSION=$(psql --version | awk '{print $3}')
    echo -e "${GREEN}✓${NC} PostgreSQL: $PG_VERSION"
else
    echo -e "${RED}✗${NC} PostgreSQL not found!"
    echo "Install PostgreSQL first: sudo apt install postgresql"
    exit 1
fi

# Check Nginx
if command_exists nginx; then
    NGINX_VERSION=$(nginx -v 2>&1 | awk -F'/' '{print $2}')
    echo -e "${GREEN}✓${NC} Nginx: $NGINX_VERSION"
else
    echo -e "${RED}✗${NC} Nginx not found!"
    echo "Install Nginx first: sudo apt install nginx"
    exit 1
fi

# Check PM2
if command_exists pm2; then
    PM2_VERSION=$(pm2 -v)
    echo -e "${GREEN}✓${NC} PM2: $PM2_VERSION"
else
    echo -e "${YELLOW}!${NC} PM2 not found. Installing..."
    sudo npm install -g pm2
    echo -e "${GREEN}✓${NC} PM2 installed"
fi

echo ""
echo "2. Setup Backend..."
echo "--------------------------------"

cd $BACKEND_DIR

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}!${NC} Backend .env not found!"
    echo "Please create .env file based on .env.example"
    echo "Path: $BACKEND_DIR/.env"
    exit 1
fi

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Run Prisma
echo "Generating Prisma Client..."
npx prisma generate

echo "Running database migrations..."
npx prisma migrate deploy

# Optional: Seed database
read -p "Do you want to seed the database? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run seed
fi

# Start with PM2
echo "Starting backend with PM2..."
pm2 delete klinik-backend 2>/dev/null || true
pm2 start src/server.js --name klinik-backend
pm2 save

echo -e "${GREEN}✓${NC} Backend deployed successfully"

echo ""
echo "3. Setup Frontend..."
echo "--------------------------------"

cd $FRONTEND_DIR

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}!${NC} Frontend .env not found!"
    echo "Please create .env file based on .env.example"
    echo "Path: $FRONTEND_DIR/.env"
    exit 1
fi

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Build
echo "Building frontend..."
npm run build

echo -e "${GREEN}✓${NC} Frontend built successfully"

echo ""
echo "4. Setup Nginx..."
echo "--------------------------------"

# Check if Nginx config exists
if [ ! -f /etc/nginx/sites-available/klinik ]; then
    echo -e "${YELLOW}!${NC} Nginx configuration not found!"
    echo "Please create Nginx config at /etc/nginx/sites-available/klinik"
    echo "See DEPLOYMENT_UBUNTU.md for configuration example"
else
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/klinik /etc/nginx/sites-enabled/
    
    # Test Nginx config
    echo "Testing Nginx configuration..."
    sudo nginx -t
    
    # Reload Nginx
    echo "Reloading Nginx..."
    sudo systemctl reload nginx
    
    echo -e "${GREEN}✓${NC} Nginx configured successfully"
fi

echo ""
echo "========================================="
echo -e "${GREEN}Deployment Completed!${NC}"
echo "========================================="
echo ""
echo "Services Status:"
pm2 status
echo ""
echo "Backend API: http://localhost:5000"
echo "Frontend: Check your domain or http://localhost"
echo ""
echo "Useful commands:"
echo "- pm2 status              : Check backend status"
echo "- pm2 logs klinik-backend : View backend logs"
echo "- pm2 restart klinik-backend : Restart backend"
echo "- sudo systemctl status nginx : Check Nginx status"
echo ""
echo "For more information, see DEPLOYMENT_UBUNTU.md"
