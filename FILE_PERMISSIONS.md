# 🔐 File Permissions Guide - Ubuntu 24.04

## 📂 Struktur Permission Project

### **Ownership: `klinik:klinik`** (Majority)

Sebagian besar file aplikasi harus dimiliki oleh user `klinik`:

```bash
/var/www/klinik/
├── backend/                    # klinik:klinik (755)
│   ├── src/                   # klinik:klinik (755)
│   ├── prisma/                # klinik:klinik (755)
│   ├── node_modules/          # klinik:klinik (755)
│   ├── package.json           # klinik:klinik (644)
│   ├── .env                   # klinik:klinik (600) ⚠️ SENSITIVE
│   └── Dockerfile             # klinik:klinik (644)
│
├── frontend/                   # klinik:klinik (755)
│   ├── src/                   # klinik:klinik (755)
│   ├── node_modules/          # klinik:klinik (755)
│   ├── package.json           # klinik:klinik (644)
│   └── vite.config.js         # klinik:klinik (644)
│
├── .git/                      # klinik:klinik (755)
├── .gitignore                 # klinik:klinik (644)
├── docker-compose.yml         # klinik:klinik (644)
├── package.json               # klinik:klinik (644)
└── README.md                  # klinik:klinik (644)
```

---

### **Ownership: `www-data:www-data`** (Nginx Served)

Folder yang dilayani oleh Nginx (jika tidak pakai Docker untuk frontend):

```bash
/var/www/klinik/
└── frontend/
    └── dist/                  # www-data:www-data (755)
        ├── index.html         # www-data:www-data (644)
        ├── assets/            # www-data:www-data (755)
        └── *.js, *.css        # www-data:www-data (644)
```

---

### **Ownership: `klinik:www-data`** (Shared Access)

Folder yang ditulis oleh aplikasi tapi dibaca oleh Nginx:

```bash
/var/www/klinik/
└── backend/
    └── uploads/               # klinik:www-data (775)
        ├── profiles/          # klinik:www-data (775)
        ├── documents/         # klinik:www-data (775)
        └── attachments/       # klinik:www-data (775)
```

---

## 🔧 Setup Commands

### **1. Set Base Ownership (Semua ke klinik)**

```bash
# Set semua file ke klinik:klinik
sudo chown -R klinik:klinik /var/www/klinik

# Set permission dasar
sudo find /var/www/klinik -type d -exec chmod 755 {} \;
sudo find /var/www/klinik -type f -exec chmod 644 {} \;
```

### **2. Set Executable Scripts**

```bash
# Make scripts executable
sudo chmod +x /var/www/klinik/backend/node_modules/.bin/*
sudo chmod +x /var/www/klinik/frontend/node_modules/.bin/*
```

### **3. Secure sensitive files**

```bash
# .env files (read only for owner)
sudo chmod 600 /var/www/klinik/backend/.env
sudo chmod 600 /var/www/klinik/frontend/.env 2>/dev/null || true

# SSH keys (if any)
sudo chmod 600 /var/www/klinik/deploy_key 2>/dev/null || true
```

### **4. Set Upload Folder (Shared dengan Nginx)**

```bash
# Create uploads directory if not exists
sudo mkdir -p /var/www/klinik/backend/uploads/{profiles,documents,attachments}

# Set ownership ke klinik:www-data
sudo chown -R klinik:www-data /var/www/klinik/backend/uploads

# Set permission 775 (owner & group bisa write)
sudo chmod -R 775 /var/www/klinik/backend/uploads

# Set SGID bit (file baru inherit group)
sudo find /var/www/klinik/backend/uploads -type d -exec chmod g+s {} \;
```

### **5. Set Frontend Build Output (untuk Nginx)**

**Jika menggunakan Nginx untuk serve static files:**

```bash
# Build frontend
cd /var/www/klinik/frontend
sudo -u klinik npm run build

# Set ownership dist ke www-data
sudo chown -R www-data:www-data /var/www/klinik/frontend/dist

# Set permission
sudo find /var/www/klinik/frontend/dist -type d -exec chmod 755 {} \;
sudo find /var/www/klinik/frontend/dist -type f -exec chmod 644 {} \;
```

### **6. Set Log Files (jika ada)**

```bash
# Create logs directory
sudo mkdir -p /var/www/klinik/logs

# Set ownership
sudo chown -R klinik:klinik /var/www/klinik/logs

# Set permission (writable)
sudo chmod -R 755 /var/www/klinik/logs
```

---

## 📋 Permission Checklist Script

Buat script untuk automasi:

```bash
#!/bin/bash
# /var/www/klinik/scripts/fix-permissions.sh

PROJECT_DIR="/var/www/klinik"

echo "🔐 Setting file permissions..."

# 1. Base ownership
echo "📁 Setting base ownership to klinik:klinik..."
sudo chown -R klinik:klinik $PROJECT_DIR

# 2. Base permissions
echo "📁 Setting base permissions..."
sudo find $PROJECT_DIR -type d -exec chmod 755 {} \;
sudo find $PROJECT_DIR -type f -exec chmod 644 {} \;

# 3. Secure sensitive files
echo "🔒 Securing sensitive files..."
sudo chmod 600 $PROJECT_DIR/backend/.env 2>/dev/null || true

# 4. Uploads folder
echo "📤 Setting uploads folder permissions..."
sudo mkdir -p $PROJECT_DIR/backend/uploads/{profiles,documents,attachments}
sudo chown -R klinik:www-data $PROJECT_DIR/backend/uploads
sudo chmod -R 775 $PROJECT_DIR/backend/uploads
sudo find $PROJECT_DIR/backend/uploads -type d -exec chmod g+s {} \;

# 5. Frontend dist (if exists)
if [ -d "$PROJECT_DIR/frontend/dist" ]; then
    echo "🌐 Setting frontend dist permissions..."
    sudo chown -R www-data:www-data $PROJECT_DIR/frontend/dist
    sudo find $PROJECT_DIR/frontend/dist -type d -exec chmod 755 {} \;
    sudo find $PROJECT_DIR/frontend/dist -type f -exec chmod 644 {} \;
fi

# 6. Logs (if exists)
if [ -d "$PROJECT_DIR/logs" ]; then
    echo "📝 Setting logs permissions..."
    sudo chown -R klinik:klinik $PROJECT_DIR/logs
    sudo chmod -R 755 $PROJECT_DIR/logs
fi

# 7. Node binaries
echo "⚙️ Setting executable permissions..."
sudo find $PROJECT_DIR -path "*/node_modules/.bin/*" -type f -exec chmod +x {} \; 2>/dev/null || true

echo "✅ Permissions fixed!"
```

**Jalankan:**
```bash
sudo chmod +x /var/www/klinik/scripts/fix-permissions.sh
sudo /var/www/klinik/scripts/fix-permissions.sh
```

---

## 🎯 Recommended Setup

### **Skenario 1: Docker Deployment** (Recommended)

```bash
# Semua file milik klinik
sudo chown -R klinik:klinik /var/www/klinik

# Hanya uploads yang shared
sudo chown -R klinik:www-data /var/www/klinik/backend/uploads
sudo chmod -R 775 /var/www/klinik/backend/uploads
```

**Kenapa?** Docker container berjalan sebagai user di dalam container, jadi permission host cukup `klinik:klinik`.

---

### **Skenario 2: Manual Deployment dengan PM2 + Nginx**

```bash
# Base: klinik:klinik
sudo chown -R klinik:klinik /var/www/klinik

# Uploads: klinik:www-data (aplikasi write, nginx read)
sudo chown -R klinik:www-data /var/www/klinik/backend/uploads
sudo chmod -R 775 /var/www/klinik/backend/uploads

# Frontend dist: www-data:www-data (nginx serve)
sudo chown -R www-data:www-data /var/www/klinik/frontend/dist
```

**Kenapa?** 
- PM2 run sebagai `klinik` → butuh akses ke source code
- Nginx serve static sebagai `www-data` → butuh akses ke `dist`
- Upload files shared antara app (write) dan nginx (read)

---

## 🚫 Common Mistakes

### ❌ **JANGAN:**

```bash
# JANGAN chmod 777 (terlalu permissive)
sudo chmod -R 777 /var/www/klinik  # ❌ BERBAHAYA!

# JANGAN chown semua ke www-data
sudo chown -R www-data:www-data /var/www/klinik  # ❌ PM2 tidak bisa akses

# JANGAN 644 untuk .env
sudo chmod 644 /var/www/klinik/backend/.env  # ❌ Terlalu terbuka
```

### ✅ **LAKUKAN:**

```bash
# Base permission yang aman
sudo find /var/www/klinik -type d -exec chmod 755 {} \;
sudo find /var/www/klinik -type f -exec chmod 644 {} \;

# Secure .env
sudo chmod 600 /var/www/klinik/backend/.env

# Shared uploads dengan proper group
sudo chown -R klinik:www-data /var/www/klinik/backend/uploads
sudo chmod -R 775 /var/www/klinik/backend/uploads
```

---

## 🔍 Verify Permissions

### Check Current Permissions:

```bash
# Check ownership
ls -la /var/www/klinik

# Check uploads
ls -la /var/www/klinik/backend/uploads

# Check dist (if exists)
ls -la /var/www/klinik/frontend/dist

# Check .env permission
ls -l /var/www/klinik/backend/.env
```

### Expected Output:

```bash
# Base directory
drwxr-xr-x  klinik klinik  /var/www/klinik

# Uploads
drwxrwxr-x  klinik www-data  /var/www/klinik/backend/uploads

# .env
-rw-------  klinik klinik  /var/www/klinik/backend/.env

# Frontend dist
drwxr-xr-x  www-data www-data  /var/www/klinik/frontend/dist
```

---

## 🛡️ Security Tips

1. **Never use 777 permission** - Too permissive, security risk
2. **.env files should be 600** - Only owner can read
3. **Add klinik user to www-data group** (optional):
   ```bash
   sudo usermod -aG www-data klinik
   ```
4. **Use SGID on upload directories** - New files inherit group:
   ```bash
   sudo chmod g+s /var/www/klinik/backend/uploads
   ```

---

## 📞 Troubleshooting

### "Permission denied" saat npm install

```bash
# Solution: Set ownership ke klinik
sudo chown -R klinik:klinik /var/www/klinik
```

### "Permission denied" saat upload file

```bash
# Solution: Set uploads folder ke 775 dengan group www-data
sudo chown -R klinik:www-data /var/www/klinik/backend/uploads
sudo chmod -R 775 /var/www/klinik/backend/uploads
```

### Nginx cannot serve static files

```bash
# Solution: Set dist ke www-data
sudo chown -R www-data:www-data /var/www/klinik/frontend/dist
```

### PM2 cannot start application

```bash
# Solution: Ensure klinik owns the files
sudo chown -R klinik:klinik /var/www/klinik
sudo chmod +x /var/www/klinik/backend/node_modules/.bin/*
```

---

## 📝 Post-Deployment Permission Check

Setelah deploy, jalankan:

```bash
# Run permission fix script
sudo /var/www/klinik/scripts/fix-permissions.sh

# Verify
ls -la /var/www/klinik/backend/.env
ls -la /var/www/klinik/backend/uploads
ls -la /var/www/klinik/frontend/dist

# Test application
pm2 restart all
curl http://localhost:5000/health
```

---

## 🎯 Quick Summary

| Path | Owner | Group | Permission | Reason |
|------|-------|-------|------------|--------|
| `/var/www/klinik/*` | klinik | klinik | 755/644 | Base ownership |
| `backend/.env` | klinik | klinik | **600** | Sensitive data |
| `backend/uploads/` | klinik | **www-data** | **775** | App write, Nginx read |
| `frontend/dist/` | **www-data** | **www-data** | 755/644 | Nginx serve static |
| `node_modules/.bin/*` | klinik | klinik | **755** | Executable scripts |
| `logs/` | klinik | klinik | 755 | Application logs |

---

**🔑 Golden Rule:** 
- **klinik:klinik** → Application source code
- **www-data:www-data** → Nginx static files  
- **klinik:www-data + 775** → Shared upload folders
