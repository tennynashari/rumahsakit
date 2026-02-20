# Deployment Scripts

Collection of scripts for deployment and CI/CD setup.

## 📜 Available Scripts

### 1. `setup-gitlab-runner.sh`
**Purpose:** Install and setup GitLab Runner on Ubuntu server

**Usage:**
```bash
# On server
wget https://raw.githubusercontent.com/your-repo/scripts/setup-gitlab-runner.sh
chmod +x setup-gitlab-runner.sh
./setup-gitlab-runner.sh
```

**What it does:**
- Installs GitLab Runner
- Provides step-by-step registration instructions

---

### 2. `pre-deploy-check.sh`
**Purpose:** Verify project is ready for deployment

**Usage:**
```bash
# On local machine, in project root
bash scripts/pre-deploy-check.sh
```

**Checks:**
- ✓ .env file exists
- ✓ Environment variables configured
- ✓ Dependencies installed
- ✓ Prisma schema valid
- ✓ GitLab CI config exists
- ✓ Git status clean

---

### 3. `manual-deploy.sh`
**Purpose:** Manual deployment without CI/CD (alternative method)

**Usage:**
```bash
# Set environment variables
export SERVER_USER="klinik"
export SERVER_HOST="your-server-ip"
export DEPLOY_PATH="/var/www/klinik"

# Run deployment
bash scripts/manual-deploy.sh
```

**What it does:**
1. Tests SSH connection
2. Syncs backend files
3. Installs dependencies
4. Runs Prisma migrations
5. Builds and deploys frontend
6. Restarts PM2 services
7. Runs health check

---

## 🚀 Quick Start

### For GitLab CI/CD Setup:

1. **On Server:**
   ```bash
   # Install GitLab Runner
   bash scripts/setup-gitlab-runner.sh
   
   # Follow the prompts to register runner
   ```

2. **On GitLab:**
   - Add CI/CD variables (see GITLAB_CI_DEPLOYMENT.md)
   - Push code to trigger pipeline

3. **Deploy:**
   ```bash
   git push origin master
   # Go to GitLab → CI/CD → Pipelines → Click play on deploy:production
   ```

### For Manual Deployment:

```bash
# 1. Check if ready
bash scripts/pre-deploy-check.sh

# 2. Deploy
export SERVER_USER="klinik"
export SERVER_HOST="192.168.1.50"
bash scripts/manual-deploy.sh
```

---

## 📋 Prerequisites

All scripts require:
- Ubuntu 24.04 LTS server
- Node.js 20+
- PostgreSQL 16+
- PM2 installed
- SSH access to server

---

## 🔧 Customization

Edit variables at the top of each script:
```bash
# In manual-deploy.sh
SERVER_USER="your-username"
SERVER_HOST="your-server-ip"
DEPLOY_PATH="/path/to/deployment"
```

---

## 📚 Documentation

- **Full CI/CD Guide:** [GITLAB_CI_DEPLOYMENT.md](../GITLAB_CI_DEPLOYMENT.md)
- **Server Setup:** [DEPLOYMENT_UBUNTU.md](../DEPLOYMENT_UBUNTU.md)

---

## 🐛 Troubleshooting

**Script permission denied:**
```bash
chmod +x scripts/*.sh
```

**SSH connection failed:**
```bash
# Test SSH manually
ssh username@server-ip

# Check SSH config
cat ~/.ssh/config
```

**Deployment fails:**
```bash
# Check server logs
ssh user@server
pm2 logs klinik-backend --lines 50
```

---

## 🔐 Security Notes

- Never commit `.env` files
- Use SSH keys without passphrase for automation
- Keep private keys secure
- Use GitLab CI/CD masked variables for secrets

---

Last Updated: 2026-02-14
