# GitHub Actions CI/CD Setup Guide
# Hospital Information System

## 🎯 Overview

GitHub Actions lebih simple dari GitLab CI/CD karena:
- ✅ **Tidak perlu install Runner** - GitHub provides runners
- ✅ **Free tier generous** - 2000 minutes/month for private repos
- ✅ **Easy secrets management** - Built-in GitHub Secrets
- ✅ **Auto trigger on push** - No manual configuration needed

## 📋 Setup Steps (15 menit total)

### **STEP 1: Setup SSH Key di Server (5 menit)**

```bash
# SSH ke server
ssh username@server-ip

# Switch ke user yang menjalankan aplikasi
su - klinik  # atau su - crm

# Generate SSH key untuk GitHub Actions
ssh-keygen -t rsa -b 4096 -C "github-actions@klinik" -f ~/.ssh/github_actions
# Press Enter (no passphrase untuk automation)

# Add public key ke authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Copy private key (akan dipakai di GitHub Secrets)
cat ~/.ssh/github_actions
# Select all and copy
```

### **STEP 2: Setup GitHub Secrets (5 menit)**

1. Buka repository di GitHub
2. Go to: **Settings** → **Secrets and variables** → **Actions**
3. Klik **New repository secret**
4. Tambahkan secrets berikut:

#### Required Secrets:

| Name | Value | Example |
|------|-------|---------|
| `SERVER_HOST` | IP atau domain server | `192.168.1.50` |
| `SERVER_USER` | Username di server | `klinik` |
| `DEPLOY_PATH` | Path deployment | `/var/www/klinik` |
| `SSH_PRIVATE_KEY` | Private key dari step 1 | `-----BEGIN RSA PRIVATE KEY-----...` |

**Cara add SSH_PRIVATE_KEY:**
- Name: `SSH_PRIVATE_KEY`
- Value: Paste seluruh output dari `cat ~/.ssh/github_actions`
- Harus include `-----BEGIN RSA PRIVATE KEY-----` dan `-----END RSA PRIVATE KEY-----`

#### Optional Secrets (untuk environment variables):
| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | `your-secret-key` |
| `JWT_REFRESH_SECRET` | `your-refresh-secret` |

### **STEP 3: Commit & Push (2 menit)**

```bash
# Di komputer lokal
git add .github/workflows/deploy.yml
git commit -m "feat: add GitHub Actions CI/CD"
git push origin master
```

### **STEP 4: Verifikasi (3 menit)**

1. Buka GitHub repository
2. Klik tab **Actions**
3. Lihat workflow "Deploy to Production" running
4. Wait sampai selesai (2-5 menit)

✅ **Done!** Aplikasi deployed!

## 🚀 Cara Deploy Setelah Setup

**Setiap kali ada perubahan code:**
```bash
git add .
git commit -m "feat: fitur baru"
git push origin master
```

GitHub Actions akan **otomatis**:
1. ✅ Build backend & frontend
2. ✅ Run tests
3. ✅ Deploy ke server
4. ✅ Restart PM2
5. ✅ Health check

**Tidak perlu manual trigger!** 🎉

## 📊 Monitoring

### Lihat Status Deployment
1. GitHub → Repository → **Actions** tab
2. Klik workflow run terakhir
3. Lihat logs setiap step

### Check di Server
```bash
ssh user@server

# Check PM2 status
pm2 status

# Check logs
pm2 logs klinik-backend

# Check health
curl http://localhost:5000/api/health
```

## 🔄 Workflow Branches

### Master/Main Branch (Production)
```bash
git push origin master
# → Auto deploy to production
```

### Develop Branch (Staging)
```bash
git push origin develop
# → Auto deploy to staging (if configured)
```

### Pull Requests
```bash
# Create PR → GitHub Actions will:
# ✅ Build and test
# ❌ Won't deploy (only on merge to master)
```

## 🛠️ Customization

### Enable Manual Deployment Approval

Add to `.github/workflows/deploy.yml`:
```yaml
deploy-production:
  environment:
    name: production
    url: http://${{ secrets.SERVER_HOST }}
  # This requires manual approval in GitHub Settings → Environments
```

Setup:
1. GitHub → Settings → Environments
2. Create "production" environment
3. Enable "Required reviewers"
4. Add reviewers

### Add Slack Notifications

Add step to workflow:
```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

### Add Database Backup Before Deploy

Add step before deployment:
```yaml
- name: Backup Database
  run: |
    ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} \
      "pg_dump -U dbuser dbname > /backup/db_$(date +%Y%m%d_%H%M%S).sql"
```

## 🔐 Security Best Practices

### 1. Protect Secrets
- ✅ Never commit secrets to repository
- ✅ Use GitHub Secrets for sensitive data
- ✅ SSH key without passphrase (for automation)

### 2. Protect Master Branch
GitHub → Settings → Branches → Add rule:
- ✅ Require pull request reviews
- ✅ Require status checks (CI must pass)
- ✅ No direct push to master

### 3. Use Environment Protection
- ✅ Setup "production" environment
- ✅ Require manual approval
- ✅ Restrict to specific branches

### 4. Rotate SSH Keys Regularly
```bash
# Every 90 days
ssh-keygen -t rsa -b 4096 -C "github-actions@klinik" -f ~/.ssh/github_actions_new
# Update GitHub Secret
```

## 🐛 Troubleshooting

### Workflow Fails: "SSH Connection Failed"

**Error:**
```
Permission denied (publickey)
```

**Solution:**
```bash
# Verify SSH key in ~/.ssh/authorized_keys
ssh user@server "cat ~/.ssh/authorized_keys | grep github-actions"

# Test SSH manually
ssh -i ~/.ssh/github_actions user@server

# Re-add to GitHub Secrets if needed
```

### Workflow Fails: "pm2 command not found"

**Error:**
```
bash: pm2: command not found
```

**Solution:**
```bash
# SSH to server
ssh user@server

# Install PM2 globally
sudo npm install -g pm2

# Or add to PATH in .bashrc/.profile
echo 'export PATH=$PATH:/usr/local/bin' >> ~/.bashrc
source ~/.bashrc
```

### Deployment Success but App Not Running

**Check logs:**
```bash
ssh user@server
pm2 logs klinik-backend --lines 50

# Common issues:
# - Database connection error → check .env
# - Port already in use → pm2 restart
# - Permission denied → check file ownership
```

### "rsync: command not found"

GitHub runners already have rsync, but if server doesn't:
```bash
# On server
sudo apt install rsync
```

## 📈 Advanced Features

### Matrix Build (Test Multiple Node Versions)
```yaml
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20, 21]
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
```

### Conditional Deployment
```yaml
# Only deploy on tags
if: startsWith(github.ref, 'refs/tags/v')

# Only deploy certain files changed
- uses: dorny/paths-filter@v2
  with:
    filters: |
      backend:
        - 'backend/**'
```

### Deploy to Multiple Servers
```yaml
strategy:
  matrix:
    server: [server1, server2]
steps:
  - run: ssh user@${{ matrix.server }} "deploy command"
```

## 📝 Tips

### Speed Up Builds
1. **Use caching:**
   ```yaml
   - uses: actions/cache@v3
     with:
       path: ~/.npm
       key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
   ```

2. **Parallel jobs:**
   - Backend & Frontend build simultaneously
   - Tests run in parallel

3. **Artifact reuse:**
   - Build once, deploy to multiple environments

### Cost Optimization (Free Tier)
- GitHub Free: 2000 minutes/month (public repos unlimited)
- Each workflow run ~3-5 minutes
- ~400-600 deployments/month possible

### Debugging Workflows
```yaml
- name: Debug
  run: |
    echo "GitHub Actor: ${{ github.actor }}"
    echo "GitHub Ref: ${{ github.ref }}"
    echo "Working Dir: $(pwd)"
    ls -la
```

Enable debug logs:
- Repository Settings → Secrets → Add `ACTIONS_STEP_DEBUG = true`

## 🆚 GitHub Actions vs GitLab CI/CD

| Feature | GitHub Actions | GitLab CI/CD |
|---------|---------------|--------------|
| Runner Setup | ✅ No setup needed | ❌ Must install runner |
| Free Tier | 2000 min/month | 400 min/month |
| Ease of Use | ⭐⭐⭐⭐⭐ Easy | ⭐⭐⭐ Moderate |
| Marketplace | ✅ 10000+ actions | ⚠️ Limited |
| Self-Hosted | ✅ Optional | ✅ Required for private |

## 📚 Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Available Actions](https://github.com/marketplace?type=actions)

## ✅ Checklist

- [ ] SSH key generated & added to server
- [ ] GitHub Secrets configured
- [ ] `.github/workflows/deploy.yml` pushed
- [ ] Workflow runs successfully
- [ ] Application accessible
- [ ] PM2 running
- [ ] Health check passes

---

**Last Updated:** 2026-02-14  
**Version:** 1.0.0
