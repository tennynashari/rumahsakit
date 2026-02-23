# 🚀 Panduan Deployment & Update Server

## 📦 Update Aplikasi di Server

### **METHOD 1: Update Tanpa Docker (Recommended untuk Development)**

#### 1️⃣ SSH ke Server
```bash
ssh user@your-server-ip
```

#### 2️⃣ Masuk ke Folder Project
```bash
cd /path/to/rumahsakit
```

#### 3️⃣ Pull Update dari GitHub
```bash
git pull origin master
```

#### 4️⃣ Install Dependencies Baru (jika ada)
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 5️⃣ Build Frontend
```bash
cd frontend
npm run build
```

#### 6️⃣ Restart Services
```bash
# Restart backend (jika menggunakan PM2)
pm2 restart hospital-backend

# Restart frontend (jika menggunakan PM2)
pm2 restart hospital-frontend

# Atau restart dengan systemd
sudo systemctl restart hospital-backend
sudo systemctl restart hospital-frontend
```

---

### **METHOD 2: Update dengan Docker (Recommended untuk Production)**

#### 1️⃣ SSH ke Server
```bash
ssh user@your-server-ip
```

#### 2️⃣ Masuk ke Folder Project
```bash
cd /path/to/rumahsakit
```

#### 3️⃣ Pull Update dari GitHub
```bash
git pull origin master
```

#### 4️⃣ Rebuild dan Restart Docker Containers
```bash
# Stop containers
docker-compose down

# Rebuild images dengan update terbaru
docker-compose build --no-cache

# Start containers
docker-compose up -d
```

**Atau Update Spesifik Service:**
```bash
# Update hanya frontend
docker-compose up -d --build --force-recreate frontend

# Update hanya backend
docker-compose up -d --build --force-recreate backend
```

#### 5️⃣ Check Status
```bash
docker-compose ps
docker-compose logs -f
```

---

### **METHOD 3: Zero Downtime Deployment (Advanced)**

#### Script Otomatis:
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin master

# Build new Docker images
docker-compose build

# Start new containers
docker-compose up -d

# Remove old images
docker image prune -f

echo "✅ Deployment completed!"
```

**Jalankan:**
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🔧 Quick Commands

### Cek Status Aplikasi
```bash
# Docker
docker-compose ps
docker-compose logs -f backend
docker-compose logs -f frontend

# PM2
pm2 status
pm2 logs hospital-backend
pm2 logs hospital-frontend
```

### Database Migration
```bash
# Masuk ke backend container (Docker)
docker-compose exec backend sh
npx prisma migrate deploy

# Atau langsung dari host
docker-compose exec backend npx prisma migrate deploy
```

### Restart Specific Service
```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart postgres
```

### View Logs
```bash
# Semua logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend
```

---

## 📝 Checklist Update di Server

- [ ] **Backup Database** (sebelum update)
  ```bash
  docker-compose exec postgres pg_dump -U rumahsakit rumahsakit > backup_$(date +%Y%m%d).sql
  ```

- [ ] **Pull Latest Code**
  ```bash
  git pull origin master
  ```

- [ ] **Check Environment Variables**
  ```bash
  # Pastikan file .env backend sudah benar
  cat backend/.env
  ```

- [ ] **Run Database Migrations** (jika ada perubahan schema)
  ```bash
  docker-compose exec backend npx prisma migrate deploy
  ```

- [ ] **Rebuild & Restart**
  ```bash
  docker-compose up -d --build
  ```

- [ ] **Verify Services**
  ```bash
  curl http://localhost:5000/health
  curl http://localhost:3000
  ```

- [ ] **Check Logs**
  ```bash
  docker-compose logs -f
  ```

---

## 🌐 Setup Production Server (First Time)

### 1. Install Docker & Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

### 2. Clone Repository
```bash
git clone https://github.com/tennynashari/rumahsakit.git
cd rumahsakit
```

### 3. Setup Environment
```bash
# Buat .env untuk backend
cp backend/.env.example backend/.env
nano backend/.env

# Update dengan database credentials production
```

### 4. Build & Run
```bash
docker-compose up -d --build
```

### 5. Run Initial Migration & Seed
```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run db:seed
```

### 6. Setup Nginx (Reverse Proxy)
```nginx
# /etc/nginx/sites-available/hospital

server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/hospital /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Setup SSL (Optional)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔐 Security Checklist

- [ ] Ganti `JWT_SECRET` di environment variables
- [ ] Ganti password database di production
- [ ] Setup firewall (UFW)
  ```bash
  sudo ufw allow 80
  sudo ufw allow 443
  sudo ufw allow 22
  sudo ufw enable
  ```
- [ ] Disable port 5000 & 3000 dari external access (gunakan Nginx)
- [ ] Setup SSL certificate
- [ ] Enable auto-update security patches

---

## 📊 Monitoring

### Health Check Endpoints
- Backend: `http://your-server:5000/health`
- Frontend: `http://your-server:3000`

### Resource Usage
```bash
# Docker stats
docker stats

# System resources
htop
df -h
free -m
```

---

## 🆘 Troubleshooting

### Container tidak start
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Database connection error
```bash
# Check postgres running
docker-compose ps postgres

# Check connection
docker-compose exec backend npx prisma db push
```

### Port sudah digunakan
```bash
# Check apa yang menggunakan port
sudo lsof -i :5000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Clear everything dan mulai fresh
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

---

## 📞 Support

Repository: https://github.com/tennynashari/rumahsakit
Issues: https://github.com/tennynashari/rumahsakit/issues
