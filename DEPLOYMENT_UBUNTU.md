# Panduan Deployment di Ubuntu 24.04

## Prasyarat
- Ubuntu 24.04 LTS
- Node.js (v18 atau lebih tinggi)
- PostgreSQL (v14 atau lebih tinggi)
- Nginx
- PM2 (untuk process management)

## 1. Persiapan Awal

### Pilihan User untuk Deployment

Anda punya 2 opsi:

#### **Opsi A: Pakai User yang Sama (crm)** ✅ Recommended untuk simplicity
**Kelebihan:**
- Setup lebih cepat dan simple
- Tidak perlu setup SSH key/permission baru
- PM2, Node.js, PostgreSQL sudah siap pakai
- Management lebih mudah (satu user untuk semua)

**Kekurangan:**
- Kurang isolated (jika satu app bermasalah, bisa affect yang lain)
- Security agak kurang (shared permissions)

```bash
# Login sebagai user crm (yang sudah ada)
su - crm

# Buat direktori untuk klinik
mkdir -p ~/apps/klinik
cd ~/apps/klinik
# Upload atau clone aplikasi Anda ke sini
```

#### **Opsi B: Buat User Baru (klinik)** ✅ Recommended untuk security
**Kelebihan:**
- Isolasi lebih baik antar aplikasi
- Security lebih baik (separate permissions)
- Jika satu app compromised, yang lain tetap aman
- Audit trail lebih jelas
- Production best practice

**Kekurangan:**
- Setup sedikit lebih lama
- Perlu manage multiple users

```bash
# Buat user baru untuk klinik
sudo adduser klinik

# Add ke sudo group (optional, jika butuh sudo access)
sudo usermod -aG sudo klinik

# Login sebagai user klinik
su - klinik

# Buat direktori untuk aplikasi di /var/www
sudo mkdir -p /var/www/klinik
sudo chown klinik:klinik /var/www/klinik
cd /var/www/klinik
# Upload atau clone aplikasi Anda ke sini
```

**CATATAN PENTING:** Node.js, PostgreSQL, dan Nginx yang sudah terinstall secara GLOBAL bisa dipakai oleh semua user. Anda tidak perlu install ulang!

### Install PM2 Global (jika belum)
```bash
sudo npm install -g pm2
```

### Recommended: Setup dengan /var/www
Setup di `/var/www/klinik` dengan user klinik:
```bash
# Pastikan sudah login sebagai user klinik
su - klinik

# Buat direktori di /var/www
sudo mkdir -p /var/www/klinik
sudo chown klinik:klinik /var/www/klinik
cd /var/www/klinik
# Upload atau clone aplikasi Anda ke sini
```

## 2. Setup Database PostgreSQL

**CATATAN:** PostgreSQL yang sudah terinstall bisa diakses dari user manapun (crm atau klinik). Database dan user PostgreSQL terpisah dari user Linux.

### Buat Database dan User PostgreSQL
```bash
# Bisa dijalankan dari user manapun (crm atau klinik)
sudo -u postgres psql
```

Di dalam PostgreSQL prompt:
```sql
CREATE DATABASE klinik;
CREATE USER klinik WITH ENCRYPTED PASSWORD 'klinik_secure_password_123';
GRANT ALL PRIVILEGES ON DATABASE klinik TO klinik;

-- Grant permission untuk schema public (PENTING untuk Prisma migrations)
\c klinik
GRANT ALL ON SCHEMA public TO klinik;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO klinik;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO klinik;

-- Alternatif: Jadikan klinik sebagai owner database
ALTER DATABASE klinik OWNER TO klinik;

-- Verifikasi
\l                          -- List databases
\du                         -- List users
\q                          -- Quit
```

### Update PostgreSQL untuk Accept Connections

**CATATAN:** Jika file `/etc/postgresql/*/main/pg_hba.conf` sudah memiliki setting berikut, Anda **TIDAK PERLU** mengedit apapun:
```
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             0.0.0.0/0               scram-sha-256
```

Setting di atas sudah mengizinkan semua database dan semua user untuk connect. **Skip langkah ini dan langsung test koneksi.**

**Jika belum ada setting di atas**, edit file:
```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
# atau untuk PostgreSQL versi lain, sesuaikan path-nya
```

Tambahkan salah satu baris berikut:
```
# Option 1: Specific untuk database klinik saja (lebih secure)
host    klinik          klinik          127.0.0.1/32            scram-sha-256

# Option 2: Untuk semua database (jika ingin flexible)
host    all             all             127.0.0.1/32            scram-sha-256
```

**Test Koneksi:**
```bash
# Jika sudah ada setting di atas, langsung test tanpa restart:
psql -U klinik -d klinik -h localhost
# Enter password: klinik_secure_password_123

# Jika baru mengedit pg_hba.conf, restart dulu:
sudo systemctl restart postgresql
psql -U klinik -d klinik -h localhost
```

## 3. Setup Backend

**CATATAN:** Jalankan semua command di bawah sebagai user klinik.

### Install Dependencies
```bash
# Masuk ke direktori backend aplikasi
cd /var/www/klinik/backend
npm install
```

### Setup Environment Variables
Buat file `.env` di folder backend:
```bash
nano .env
```

Isi dengan:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://klinik:klinik_secure_password_123@localhost:5432/klinik?schema=public
JWT_SECRET=ganti-dengan-secret-key-yang-aman-minimal-32-karakter
JWT_REFRESH_SECRET=ganti-dengan-refresh-secret-key-yang-aman-minimal-32-karakter
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://your-domain.com
```

### Run Prisma Migrations
```bash
npx prisma generate
npx prisma migrate deploy
```

**Jika muncul error "permission denied for schema public"**, lihat bagian Troubleshooting untuk solusinya. Singkatnya, jalankan:
```bash
sudo -u postgres psql -c "ALTER DATABASE klinik OWNER TO klinik;"
```

### Seed Database (Optional)
```bash
npm run seed
```

### Test Backend
```bash
npm start
```
Akses http://localhost:5000/health untuk verifikasi.

### Setup PM2 untuk Backend

**PENTING:** PM2 state adalah per-user!
- PM2 milik user `crm` dan user `klinik` adalah terpisah
- `pm2 list` akan menampilkan apps dari user yang sedang login saja
- Apps dari user berbeda tidak akan conflict

```bash
# Start backend dengan PM2
pm2 start src/server.js --name klinik-backend

# Save PM2 state
pm2 save

# Setup auto-start saat server reboot
pm2 startup
# Jalankan perintah yang diberikan oleh pm2 startup
```

**Verifikasi:**
```bash
# Cek status
pm2 list

# Cek logs
pm2 logs klinik-backend

# Jika pakai user berbeda dan ingin cek apps user lain:
# Login sebagai user tersebut terlebih dahulu
```

**Multiple Users dengan PM2:**
```bash
# User crm:
su - crm
pm2 list  # Akan tampil apps milik crm saja

# User klinik:
su - klinik
pm2 list  # Akan tampil apps milik klinik saja
```

Jalankan perintah yang diberikan oleh `pm2 startup` untuk auto-start.

## 4. Setup Frontend

### Install Dependencies
```bash
# Masuk ke direktori frontend
cd /var/www/klinik/frontend
npm install
```

### Setup Environment Variables
Buat file `.env` di folder frontend:
```bash
nano .env
```

Isi dengan:
```env
VITE_API_URL=http://your-domain.com/api
```

### Build Frontend
```bash
npm run build
```

Hasil build akan ada di folder `dist/`.

## 5. Setup Nginx

### Buat Nginx Configuration

**CATATAN:** Jika Anda sudah punya aplikasi lain di server yang sama, tidak masalah! Nginx dapat melayani multiple aplikasi dengan domain berbeda pada port 80 yang sama. Nginx akan mem-route berdasarkan `server_name`.

Contoh struktur untuk multiple aplikasi:
```
/etc/nginx/sites-available/
├── aplikasi-lain          # Aplikasi existing (CRM)
├── klinik                # Aplikasi klinik (baru)
└── default               # Default nginx
```

```bash
sudo nano /etc/nginx/sites-available/klinik
```

Isi dengan:
```nginx
# HTTP Server (Redirect to HTTPS - Optional)
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Untuk sementara serve langsung (tanpa SSL)
    # Jika ingin pakai SSL, uncomment baris di bawah
    # return 301 https://$server_name$request_uri;

    # Root directory untuk frontend klinik
    root /var/www/klinik/frontend/dist;
    index index.html;

    # Frontend - React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
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
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Max upload size (untuk file uploads)
    client_max_body_size 10M;
}

# HTTPS Server (Optional - jika pakai SSL)
# server {
#     listen 443 ssl http2;
#     server_name your-domain.com www.your-domain.com;
# 
#     ssl_certificate /etc/nginx/ssl/your-domain.crt;
#     ssl_certificate_key /etc/nginx/ssl/your-domain.key;
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers HIGH:!aNULL:!MD5;
# 
#     # Root directory untuk frontend klinik
#     root /var/www/klinik/frontend/dist;
#     index index.html;
# 
#     location / {
#         try_files $uri $uri/ /index.html;
#     }
# 
#     location /api {
#         proxy_pass http://localhost:5000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#     }
# 
#     location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
#         expires 1y;
#         add_header Cache-Control "public, immutable";
#     }
# 
#     add_header X-Frame-Options "SAMEORIGIN" always;
#     add_header X-XSS-Protection "1; mode=block" always;
#     add_header X-Content-Type-Options "nosniff" always;
# 
#     client_max_body_size 10M;
# }
```

### Enable Site dan Restart Nginx
```bash
sudo ln -s /etc/nginx/sites-available/klinik /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Multiple Applications pada Server yang Sama

Jika Anda sudah punya aplikasi lain running di Nginx, tambahkan config klinik sebagai server block tambahan:

**Contoh Setup:**
```
Server IP: 192.168.1.100
Port: 80

Aplikasi 1: crm.example.com   → /var/www/crm (Existing)
Aplikasi 2: klinik.example.com → /var/www/klinik (NEW)
```

**Yang Perlu Diperhatikan:**
1. Setiap aplikasi harus punya domain/subdomain berbeda
2. Setiap aplikasi punya file config terpisah di `/etc/nginx/sites-available/`
3. `server_name` di setiap config harus unik
4. Pastikan DNS domain sudah pointing ke IP server

**Verifikasi Multiple Sites:**
```bash
# List all enabled sites
ls -la /etc/nginx/sites-enabled/

# Test all configurations
sudo nginx -t

# View all server blocks
grep -r "server_name" /etc/nginx/sites-enabled/
```

## 6. Setup Firewall (UFW)

```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS (jika pakai SSL)
sudo ufw enable
```

## 7. Setup SSL dengan Let's Encrypt (Optional)

### Install Certbot
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

### Generate SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certbot akan otomatis mengkonfigurasi Nginx untuk SSL.

### Auto-renewal
```bash
sudo certbot renew --dry-run
```

## 8. Monitoring dan Management

### PM2 Commands
```bash
# Lihat status
pm2 status

# Lihat logs
pm2 logs klinik-backend

# Restart
pm2 restart klinik-backend

# Stop
pm2 stop klinik-backend

# Monitor real-time
pm2 monit
```

### Nginx Commands
```bash
# Test configuration
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 9. Update Aplikasi

### Backend Update
```bash
cd /var/www/klinik/backend
git pull  # atau upload file baru
npm install
npx prisma generate
npx prisma migrate deploy
pm2 restart klinik-backend
```

### Frontend Update
```bash
cd /var/www/klinik/frontend
git pull  # atau upload file baru
npm install
npm run build
```

Tidak perlu restart Nginx karena static files sudah di-update.

## 10. Backup

### Database Backup
```bash
# Buat backup
pg_dump -U klinik klinik > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore dari backup
psql -U klinik klinik < backup_20260212_100000.sql
```

### Aplikasi Backup
```bash
# Backup seluruh aplikasi
sudo tar -czf klinik_backup_$(date +%Y%m%d).tar.gz /var/www/klinik
```

## 11. Troubleshooting

### Prisma Migration Error: "permission denied for schema public"

**Error:**
```
Error: ERROR: permission denied for schema public
```

**Penyebab:** User PostgreSQL tidak punya permission untuk schema `public`.

**Solusi Lengkap (Jalankan semua command ini):**
```bash
# Login ke PostgreSQL sebagai postgres
sudo -u postgres psql

# Di dalam psql prompt, copy-paste semua baris ini:
\c klinik

-- Jadikan klinik sebagai owner database
ALTER DATABASE klinik OWNER TO klinik;

-- Grant permission untuk schema public
GRANT ALL ON SCHEMA public TO klinik;
GRANT CREATE ON SCHEMA public TO klinik;

-- Grant permission untuk semua table dan sequence yang ada
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO klinik;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO klinik;

-- PENTING: Grant permission untuk table/sequence yang akan dibuat di masa depan
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO klinik;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO klinik;

-- Alternatif: Jadikan klinik sebagai superuser (untuk development/testing)
-- ALTER USER klinik WITH SUPERUSER;

-- Verifikasi permission
\l klinik
\dn+ public
\q
```

**Atau gunakan single command (quick fix):**
```bash
sudo -u postgres psql -d klinik -c "ALTER DATABASE klinik OWNER TO klinik; GRANT ALL ON SCHEMA public TO klinik; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO klinik; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO klinik;"
```

**Setelah itu, coba lagi:**
```bash
cd /var/www/klinik/backend
npx prisma migrate deploy
```

**Jika masih error, coba dengan sudo:**
```bash
# Kadang npx butuh permission khusus
sudo -u klinik npx prisma migrate deploy

# Atau pastikan .env readable
chmod 644 .env
npx prisma migrate deploy
```

### Multiple Domain/Apps - Conflict Issues
- Pastikan `server_name` unik untuk setiap aplikasi
- Jika domain tidak resolve, cek DNS settings
- Test dengan curl: `curl -H "Host: klinik.example.com" http://localhost`
- Cek mana aplikasi yang menjawab request: `sudo tail -f /var/log/nginx/access.log`

### Backend tidak bisa connect ke database
- Periksa DATABASE_URL di file .env
- Periksa status PostgreSQL: `sudo systemctl status postgresql`
- Periksa pg_hba.conf untuk authentication

### Nginx 502 Bad Gateway
- Periksa apakah backend running: `pm2 status`
- Periksa logs: `pm2 logs klinik-backend`
- Periksa port 5000: `sudo netstat -tulpn | grep 5000`

### Frontend tidak bisa akses API
- Periksa VITE_API_URL di .env saat build
- Rebuild frontend setelah mengubah .env
- Periksa Nginx proxy_pass configuration

### Permission Issues
```bash
sudo chown -R klinik:klinik /var/www/klinik
chmod -R 755 /var/www/klinik
```

## 12. Security Checklist

- [ ] Ganti JWT_SECRET dan JWT_REFRESH_SECRET dengan nilai yang aman
- [ ] Ganti password database PostgreSQL
- [ ] Setup firewall (UFW)
- [ ] Install SSL certificate (Let's Encrypt)
- [ ] Disable PostgreSQL remote access jika tidak diperlukan
- [ ] Setup automatic backups
- [ ] Update sistem secara berkala: `sudo apt update && sudo apt upgrade`
- [ ] Monitor logs secara regular

## 13. Performance Optimization

### Enable Gzip di Nginx
Tambahkan di `/etc/nginx/nginx.conf`:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
```

### PM2 Cluster Mode (untuk multi-core)
```bash
pm2 start src/server.js -i max --name klinik-backend
```

## Kontak Support
Untuk pertanyaan atau issue, hubungi tim development.
