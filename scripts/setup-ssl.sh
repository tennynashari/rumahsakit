#!/bin/bash
# Automatic SSL Setup with Let's Encrypt
# Run this script on your Ubuntu server

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Let's Encrypt SSL Setup"
echo "  Hospital Information System"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root (use sudo)${NC}" 
   exit 1
fi

# Get domain name
echo -e "${YELLOW}Enter your domain name:${NC}"
read -p "Domain (e.g., klinik.example.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}Domain name is required!${NC}"
    exit 1
fi

# Get email
echo -e "${YELLOW}Enter your email for SSL notifications:${NC}"
read -p "Email: " EMAIL

if [ -z "$EMAIL" ]; then
    echo -e "${RED}Email is required!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Configuration:${NC}"
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

read -p "Continue with these settings? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

# Step 1: Check DNS
echo ""
echo -e "${BLUE}[1/6] Checking DNS resolution...${NC}"
if host $DOMAIN > /dev/null 2>&1; then
    DNS_IP=$(host $DOMAIN | grep "has address" | awk '{print $4}' | head -n1)
    SERVER_IP=$(curl -s ifconfig.me)
    
    echo -e "${GREEN}✓ Domain resolves to: $DNS_IP${NC}"
    echo -e "  Server IP: $SERVER_IP"
    
    if [ "$DNS_IP" != "$SERVER_IP" ]; then
        echo -e "${YELLOW}⚠ Warning: DNS IP doesn't match server IP${NC}"
        echo "  This might cause certificate issuance to fail."
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
    fi
else
    echo -e "${RED}✗ Domain doesn't resolve${NC}"
    echo "  Make sure DNS A record points to this server"
    exit 1
fi

# Step 2: Install Certbot
echo ""
echo -e "${BLUE}[2/6] Installing Certbot...${NC}"
apt update
apt install certbot python3-certbot-nginx -y
echo -e "${GREEN}✓ Certbot installed${NC}"

# Step 3: Check Nginx
echo ""
echo -e "${BLUE}[3/6] Checking Nginx...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx is running${NC}"
    
    # Test Nginx config
    if nginx -t > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
    else
        echo -e "${RED}✗ Nginx configuration has errors${NC}"
        nginx -t
        exit 1
    fi
else
    echo -e "${RED}✗ Nginx is not running${NC}"
    exit 1
fi

# Step 4: Check Firewall
echo ""
echo -e "${BLUE}[4/6] Checking firewall...${NC}"
if command -v ufw > /dev/null 2>&1; then
    if ufw status | grep -q "Status: active"; then
        # Check if ports are open
        if ufw status | grep -q "80/tcp"; then
            echo -e "${GREEN}✓ Port 80 is open${NC}"
        else
            echo -e "${YELLOW}Opening port 80...${NC}"
            ufw allow 80/tcp
        fi
        
        if ufw status | grep -q "443/tcp"; then
            echo -e "${GREEN}✓ Port 443 is open${NC}"
        else
            echo -e "${YELLOW}Opening port 443...${NC}"
            ufw allow 443/tcp
        fi
    else
        echo -e "${YELLOW}⚠ UFW is not active${NC}"
    fi
fi

# Step 5: Obtain SSL Certificate
echo ""
echo -e "${BLUE}[5/6] Obtaining SSL certificate...${NC}"
echo "This will:"
echo "  - Get certificate from Let's Encrypt"
echo "  - Configure Nginx automatically"
echo "  - Setup auto-renewal"
echo ""

# Run Certbot
certbot --nginx \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --redirect \
    --hsts \
    --staple-ocsp \
    -d "$DOMAIN"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SSL certificate obtained successfully!${NC}"
else
    echo -e "${RED}✗ Failed to obtain certificate${NC}"
    echo "Check the error messages above"
    exit 1
fi

# Step 6: Test Renewal
echo ""
echo -e "${BLUE}[6/6] Testing auto-renewal...${NC}"
certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Auto-renewal test passed${NC}"
else
    echo -e "${YELLOW}⚠ Auto-renewal test failed${NC}"
fi

# Final summary
echo ""
echo -e "${GREEN}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ SSL Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

echo "Your website is now secured with HTTPS!"
echo ""
echo "📝 Certificate Details:"
certbot certificates | grep -A 5 "$DOMAIN"
echo ""
echo "🌐 Test your website:"
echo "   https://$DOMAIN"
echo ""
echo "🔄 Auto-renewal:"
echo "   Certificates will auto-renew 30 days before expiry"
echo "   Check status: sudo certbot renew --dry-run"
echo ""
echo "📊 SSL Rating:"
echo "   Test at: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo ""
echo "📧 Notifications:"
echo "   Renewal reminders will be sent to: $EMAIL"
echo ""

# Test HTTPS
echo -e "${BLUE}Testing HTTPS connection...${NC}"
if curl -Is https://$DOMAIN | head -1 | grep -q "200"; then
    echo -e "${GREEN}✓ HTTPS is working!${NC}"
else
    echo -e "${YELLOW}⚠ HTTPS test inconclusive, check manually${NC}"
fi

echo ""
echo -e "${GREEN}Done! 🎉${NC}"
