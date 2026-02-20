# 🚀 Deployment Guide - Quick Comparison

## Pilih Platform CI/CD Anda

### 🟢 GitHub Actions (RECOMMENDED untuk GitHub)
**✅ Kelebihan:**
- No runner installation needed
- 2000 free minutes/month
- Auto-trigger on push
- Easy setup (15 menit)
- Built-in secrets management

**📖 Dokumentasi:** [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)

**⚡ Quick Start:**
```bash
# 1. Generate SSH key di server
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions

# 2. Add GitHub Secrets (Settings → Secrets):
#    - SSH_PRIVATE_KEY
#    - SERVER_HOST
#    - SERVER_USER
#    - DEPLOY_PATH

# 3. Push code
git push origin master

# ✅ Done! Auto deploy!
```

---

### 🟠 GitLab CI/CD (RECOMMENDED untuk GitLab)
**✅ Kelebihan:**
- Self-hosted option
- Better for on-premise
- More control over runners
- Integrated with GitLab features

**📖 Dokumentasi:** [GITLAB_CI_DEPLOYMENT.md](./GITLAB_CI_DEPLOYMENT.md)

**⚡ Quick Start:**
```bash
# 1. Install GitLab Runner di server
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash
sudo apt-get install gitlab-runner

# 2. Register runner
sudo gitlab-runner register
# URL: https://gitlab.com/
# Token: (dari GitLab Settings → CI/CD)
# Executor: shell

# 3. Setup GitLab Variables (Settings → CI/CD → Variables)

# 4. Push code → Manual trigger deploy
git push origin master
```

---

### 🔵 Manual Deployment (Backup Option)
**✅ Kapan digunakan:**
- No CI/CD needed
- One-time deployment
- Quick fixes

**📖 Dokumentasi:** [scripts/manual-deploy.sh](./scripts/manual-deploy.sh)

**⚡ Quick Start:**
```bash
export SERVER_USER="klinik"
export SERVER_HOST="192.168.1.50"
export DEPLOY_PATH="/var/www/klinik"

bash scripts/manual-deploy.sh
```

---

## 📊 Feature Comparison

| Feature | GitHub Actions | GitLab CI/CD | Manual Deploy |
|---------|---------------|---------------|---------------|
| **Setup Time** | ⚡ 15 min | ⏱️ 30 min | ⚡ 10 min |
| **Auto Deploy** | ✅ Yes | ✅ Yes | ❌ No |
| **Runner Install** | ✅ Not needed | ❌ Required | ✅ Not needed |
| **Free Tier** | 2000 min/mo | 400 min/mo | Unlimited |
| **Manual Trigger** | ✅ Easy | ✅ Easy | ✅ Default |
| **Rollback** | ✅ Yes | ✅ Yes | ⚠️ Manual |
| **Best For** | GitHub repos | GitLab repos | Quick fixes |

---

## 🎯 Recommendation

### Untuk GitHub Repository:
```
👉 Gunakan GitHub Actions
   - Setup paling cepat
   - Free tier paling besar
   - No runner installation
```

### Untuk GitLab Repository:
```
👉 Gunakan GitLab CI/CD
   - Better integration
   - More control
   - Self-hosted option
```

### Untuk Testing/Development:
```
👉 Gunakan Manual Deploy
   - Fastest for one-time
   - No setup needed
   - Direct control
```

---

## 🔄 Migration Path

### Dari Manual → GitHub Actions
1. Setup GitHub Secrets (5 min)
2. Commit `.github/workflows/deploy.yml`
3. Push → Auto deploy ✅

### Dari GitLab → GitHub
1. Move repo to GitHub
2. Follow GitHub Actions setup
3. Update secrets
4. Done!

### Dari GitHub → GitLab
1. Mirror repo to GitLab
2. Install GitLab Runner
3. Commit `.gitlab-ci.yml`
4. Configure variables
5. Done!

---

## 📝 Deployment Checklist

Sebelum deploy, pastikan:
- [ ] Server sudah setup (Node.js, PostgreSQL, PM2, Nginx)
- [ ] Database created & accessible
- [ ] `.env` configured di server
- [ ] SSH access working
- [ ] Firewall configured (port 80, 443, 5000)
- [ ] Domain/DNS configured (if applicable)

---

## 🆘 Need Help?

### GitHub Actions Issues
→ [GITHUB_ACTIONS_SETUP.md#troubleshooting](./GITHUB_ACTIONS_SETUP.md#-troubleshooting)

### GitLab CI/CD Issues
→ [GITLAB_CI_DEPLOYMENT.md#troubleshooting](./GITLAB_CI_DEPLOYMENT.md#-troubleshooting)

### Server Setup
→ [DEPLOYMENT_UBUNTU.md](./DEPLOYMENT_UBUNTU.md)

### Manual Deployment
→ [scripts/README.md](./scripts/README.md)

---

**Last Updated:** 2026-02-14
