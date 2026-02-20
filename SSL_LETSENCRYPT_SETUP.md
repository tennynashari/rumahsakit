# Let's Encrypt SSL Setup Guide
# Hospital Information System - HTTPS Configuration

## 🔐 Overview

Let's Encrypt menyediakan SSL certificate **GRATIS** dengan auto-renewal. Panduan ini akan setup HTTPS untuk aplikasi Anda.

## 📋 Prerequisites

**PENTING:** Sebelum mulai, pastikan:
- ✅ Domain terdaftar (e.g., `klinik.example.com`)
- ✅ DNS A record pointing ke server IP Anda
- ✅ Port 80 dan 443 terbuka di firewall
- ✅ Nginx sudah installed dan running
- ✅ Aplikasi accessible via HTTP (port 80)

**Verifikasi DNS:**
```bash
# Test apakah domain resolve ke server Anda
nslookup klinik.example.com

# Atau
dig klinik.example.com
```

## 🚀 Installation Steps

### **STEP 1: Install Certbot (5 menit)**

```bash
# SSH ke server
ssh username@server-ip

# Install Certbot dan Nginx plugin
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Verify installation
certbot --version
```

### **STEP 2: Obtain SSL Certificate (3 menit)**

#### Option A: Automatic Nginx Configuration (Recommended)

Certbot akan otomatis configure Nginx untuk Anda:

```bash
# Replace dengan domain Anda
sudo certbot --nginx -d klinik.example.com

# Untuk multiple domains/subdomains:
sudo certbot --nginx -d klinik.example.com -d www.klinik.example.com
```

**Pertanyaan yang akan ditanya:**
1. **Email address:** (untuk renewal notifications)
2. **Agree to Terms:** Yes (A)
3. **Share email with EFF:** Your choice (Y/N)
4. **Redirect HTTP to HTTPS:** **Yes (2)** ← Pilih ini!

#### Option B: Manual Configuration

Jika Anda ingin configure Nginx sendiri:

```bash
sudo certbot certonly --nginx -d klinik.example.com

# Certificate akan disimpan di:
# /etc/letsencrypt/live/klinik.example.com/fullchain.pem
# /etc/letsencrypt/live/klinik.example.com/privkey.pem
```

### **STEP 3: Verify SSL Certificate**

```bash
# Test SSL certificate
sudo certbot certificates

# Output akan show:
# - Certificate Name
# - Domains covered
# - Expiry Date (90 days from issue)
# - Certificate Path
```

### **STEP 4: Test Website**

```bash
# Test HTTPS
curl -I https://klinik.example.com

# Should return: HTTP/2 200
```

**Di browser:** `https://klinik.example.com`
- ✅ Harus show padlock icon 🔒
- ✅ Certificate valid
- ✅ No security warnings

### **STEP 5: Configure Auto-Renewal**

Let's Encrypt certificates expire setiap 90 hari. Certbot auto-renewal sudah di-setup via systemd timer.

```bash
# Test auto-renewal (dry run)
sudo certbot renew --dry-run

# Check renewal timer
sudo systemctl status certbot.timer

# Enable timer (should already be enabled)
sudo systemctl enable certbot.timer
```

**Renewal akan jalan otomatis 2x sehari.**

## 📝 Nginx Configuration Examples

### For Single Page Application (Frontend Only)

Jika Anda serve frontend + backend separately:

```nginx
# /etc/nginx/sites-available/klinik

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name klinik.example.com;

    # Certbot needs this for renewal
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name klinik.example.com;

    # SSL Certificate (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/klinik.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/klinik.example.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend (React app)
    root /var/www/klinik/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy to Backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### For Multiple Subdomains

Jika Anda punya api.klinik.example.com terpisah:

```nginx
# Frontend: klinik.example.com
server {
    listen 443 ssl http2;
    server_name klinik.example.com;
    
    ssl_certificate /etc/letsencrypt/live/klinik.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/klinik.example.com/privkey.pem;
    
    root /var/www/klinik/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Backend API: api.klinik.example.com
server {
    listen 443 ssl http2;
    server_name api.klinik.example.com;
    
    ssl_certificate /etc/letsencrypt/live/api.klinik.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.klinik.example.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Obtain certificates untuk multiple domains:**
```bash
sudo certbot --nginx -d klinik.example.com -d api.klinik.example.com
```

## 🔧 Backend Configuration Updates

### Update .env (Jika Perlu)

```bash
# Di /var/www/klinik/backend/.env

# Update CORS allowed origins
CORS_ORIGIN=https://klinik.example.com

# Update NODE_ENV
NODE_ENV=production

# Cookie security (jika pakai cookies)
COOKIE_SECURE=true
```

### Update Backend Code (Jika Perlu)

Jika Anda pakai cookies atau CORS strict:

```javascript
// backend/src/server.js

const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://klinik.example.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Jika pakai cookies
app.use(cookieParser());
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only
  sameSite: 'strict',
  maxAge: 3600000
});
```

After changes:
```bash
pm2 restart klinik-backend
```

## 🧪 Testing & Verification

### 1. SSL Labs Test

```bash
# Test SSL configuration quality
# Visit: https://www.ssllabs.com/ssltest/
# Enter: klinik.example.com
# Should get A or A+ rating
```

### 2. Manual Testing

```bash
# Test HTTP redirect to HTTPS
curl -I http://klinik.example.com
# Should return: HTTP/1.1 301 Moved Permanently
# Location: https://klinik.example.com/

# Test HTTPS
curl -I https://klinik.example.com
# Should return: HTTP/2 200

# Test certificate expiry
openssl s_client -connect klinik.example.com:443 -servername klinik.example.com < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

### 3. Browser Testing

Open `https://klinik.example.com`:
- ✅ Click padlock icon → Certificate valid
- ✅ No mixed content warnings
- ✅ All assets load over HTTPS
- ✅ API calls work correctly

## 🔄 Renewal Process

### Automatic Renewal

Certbot renew timer checks 2x daily:
```bash
# Check timer status
sudo systemctl status certbot.timer

# View renewal logs
sudo journalctl -u certbot.renew.service
```

### Manual Renewal

```bash
# Renew all certificates
sudo certbot renew

# Renew specific certificate
sudo certbot renew --cert-name klinik.example.com

# Renew and reload Nginx
sudo certbot renew --deploy-hook "systemctl reload nginx"
```

### Renewal Notification

Let's Encrypt will email you:
- 20 days before expiry (warning)
- 10 days before expiry (urgent)
- If renewal fails

## 🐛 Troubleshooting

### Error: "Failed authorization procedure"

**Cause:** Domain tidak resolve ke server atau port 80 blocked.

**Solution:**
```bash
# Check DNS
nslookup klinik.example.com

# Check if port 80 accessible
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check Nginx running
sudo systemctl status nginx

# Test HTTP access
curl http://klinik.example.com
```

### Error: "Too many certificates already issued"

**Cause:** Let's Encrypt rate limit (5 certs per domain per week).

**Solution:**
- Wait 1 week, atau
- Use staging server untuk testing:
```bash
sudo certbot --nginx --staging -d klinik.example.com
```

### Error: "Certificate not trusted"

**Check certificate chain:**
```bash
openssl s_client -connect klinik.example.com:443 -showcerts

# Should show full chain including Let's Encrypt root CA
```

### Mixed Content Warnings

**Cause:** Page loads over HTTPS but assets over HTTP.

**Solution:**
```javascript
// Di frontend, pastikan semua URLs pakai HTTPS
const API_URL = process.env.REACT_APP_API_URL || 'https://klinik.example.com/api';

// Atau relative URLs
fetch('/api/patients') // Will use same protocol as page
```

### Renewal Fails

**Check logs:**
```bash
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Common issue: Nginx not reloading after renewal
sudo systemctl reload nginx
```

## 🔐 Security Best Practices

### 1. Strong SSL Configuration

Certbot automatically creates strong config, but verify:
```bash
cat /etc/letsencrypt/options-ssl-nginx.conf
```

Should include:
- TLS 1.2 and 1.3 only
- Strong cipher suites
- OCSP stapling

### 2. Security Headers

Add to Nginx:
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

### 3. Firewall Rules

```bash
# Allow only necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP (for cert renewal)
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

### 4. Regular Updates

```bash
# Update Certbot
sudo apt update
sudo apt upgrade certbot python3-certbot-nginx

# Check for security updates
sudo apt update && sudo apt upgrade
```

## 📊 Monitoring

### Certificate Expiry Monitoring

Add to crontab:
```bash
# Check cert expiry daily and alert if < 30 days
0 8 * * * certbot certificates | grep -A 1 "Expiry Date" | grep -q "29 days\|28 days\|27 days" && echo "Certificate expiring soon!" | mail -s "SSL Alert" admin@example.com
```

### Nginx Status

```bash
# Add to monitoring
curl -I https://klinik.example.com
if [ $? -ne 0 ]; then
    echo "HTTPS down!" | mail -s "Alert" admin@example.com
fi
```

## ✅ Post-Installation Checklist

- [ ] SSL certificate obtained successfully
- [ ] HTTP automatically redirects to HTTPS
- [ ] Padlock icon visible in browser
- [ ] No mixed content warnings
- [ ] Auto-renewal tested (`certbot renew --dry-run`)
- [ ] Firewall allows ports 80 and 443
- [ ] Security headers configured
- [ ] Backend CORS updated (if needed)
- [ ] SSL Labs test shows A or A+ rating
- [ ] Monitoring/alerting setup for cert expiry

## 📝 Quick Reference

```bash
# Common Certbot commands
sudo certbot certificates          # List all certificates
sudo certbot renew                 # Renew all certificates
sudo certbot renew --dry-run       # Test renewal
sudo certbot delete --cert-name example.com  # Delete certificate
sudo certbot revoke --cert-path /etc/letsencrypt/live/example.com/cert.pem  # Revoke

# Nginx commands
sudo nginx -t                      # Test config
sudo systemctl reload nginx        # Reload without downtime
sudo systemctl restart nginx       # Full restart

# Check SSL
openssl s_client -connect example.com:443 -servername example.com
curl -I https://example.com

# Logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

## 🆘 Support

### Official Documentation
- Let's Encrypt: https://letsencrypt.org/docs/
- Certbot: https://certbot.eff.org/

### Community
- Let's Encrypt Community: https://community.letsencrypt.org/

---

**Last Updated:** 2026-02-20  
**Let's Encrypt Rate Limits:** https://letsencrypt.org/docs/rate-limits/  
**Certificate Lifetime:** 90 days (auto-renewed at 30 days)
