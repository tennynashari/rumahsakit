# GitLab CI/CD Deployment Guide
# Hospital Information System

## 🎯 Overview

Pipeline ini akan otomatis:
1. Build backend & frontend
2. Run tests
3. Deploy ke server production
4. Restart PM2
5. Health check

## 📋 Checklist Setup

### ✅ Pre-requisites
- [ ] GitLab repository created
- [ ] Server dengan Node.js, PostgreSQL, PM2, Nginx installed
- [ ] GitLab Runner installed di server
- [ ] SSH key generated untuk deployment

### ✅ GitLab Configuration

#### 1. Register GitLab Runner (Di Server)
```bash
sudo gitlab-runner register
# URL: https://gitlab.com/
# Token: (dari GitLab Settings → CI/CD → Runners)
# Description: Production Server Runner
# Tags: production,nodejs,deploy
# Executor: shell
```

#### 2. Setup CI/CD Variables (Di GitLab)
Go to: Project → Settings → CI/CD → Variables

```
SERVER_HOST       = your-server-ip-or-domain
SERVER_USER       = klinik
SSH_PRIVATE_KEY   = (paste private key dari ~/.ssh/gitlab_ci)
DATABASE_URL      = postgresql://user:pass@localhost:5432/dbname
JWT_SECRET        = your-jwt-secret
JWT_REFRESH_SECRET = your-refresh-secret
```

#### 3. Setup .env di Server
```bash
# Di server: /var/www/klinik/backend/.env
DATABASE_URL="postgresql://rumahsakit:password@localhost:5432/rumahsakit"
JWT_SECRET="your-secret-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"
PORT=5000
NODE_ENV=production
```

## 🚀 How to Deploy

### Manual Deploy (Recommended for Production)
1. Commit & push code ke branch `master`:
   ```bash
   git add .
   git commit -m "feat: new feature"
   git push origin master
   ```

2. Go to GitLab → CI/CD → Pipelines

3. Klik manual play button ▶️ pada job `deploy:production`

4. Wait for completion (biasanya 2-5 menit)

### Auto Deploy (Staging)
- Push ke branch `develop` akan otomatis deploy ke staging

## 🔄 Pipeline Stages

### Stage 1: Build (Auto)
- `build:backend` - Install dependencies, generate Prisma
- `build:frontend` - Build React dengan Vite

### Stage 2: Test (Auto)
- `test:backend` - Run backend tests
- `test:frontend` - Run frontend tests
- `lint:check` - Code quality check

### Stage 3: Deploy (Manual/Auto)
- `deploy:production` - Deploy ke production (manual trigger)
- `deploy:staging` - Deploy ke staging (auto on develop)

### Stage 4: Post (Auto)
- Notifications (success/failure)

## 🔙 Rollback

Jika deployment bermasalah:

1. Go to GitLab → CI/CD → Pipelines
2. Klik manual play button pada `rollback:production`
3. Ini akan revert ke commit sebelumnya

Atau manual di server:
```bash
ssh user@server
cd /var/www/klinik
git reset --hard HEAD~1
cd backend && npm ci && npx prisma generate
cd ../frontend && npm ci && npm run build
pm2 restart klinik-backend
```

## 📊 Monitoring

### Check Pipeline Status
```bash
# Di GitLab UI
Project → CI/CD → Pipelines

# Atau via CLI (install gitlab-ci-local)
gitlab-ci-trace
```

### Check Deployment Logs
```bash
# SSH ke server
ssh user@server

# Check PM2 logs
pm2 logs klinik-backend

# Check PM2 status
pm2 status

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Health Check
```bash
# Check backend health
curl http://server-ip:5000/api/health

# Check frontend
curl http://server-ip
```

## 🐛 Troubleshooting

### Pipeline Fails at Build Stage
```
Error: npm ci failed
Solution: 
- Check package.json valid
- Clear runner cache: GitLab → CI/CD → Pipelines → Clear runner caches
```

### Pipeline Fails at Deploy Stage
```
Error: SSH connection failed
Solution:
- Verify SSH_PRIVATE_KEY variable correct
- Check server firewall allows SSH (port 22)
- Verify SERVER_HOST and SERVER_USER correct
```

### Deployment Success but App Not Running
```
Error: PM2 process crashed
Solution:
ssh user@server
pm2 logs klinik-backend --lines 100
# Check for errors, usually database connection or env variables
```

### Database Migration Fails
```
Error: Prisma migrate failed
Solution:
ssh user@server
cd /var/www/klinik/backend
npx prisma migrate deploy
# Check for migration conflicts
```

## 🔐 Security Best Practices

1. **Never commit sensitive data**
   - Use GitLab CI/CD Variables for secrets
   - Add `.env` to `.gitignore`

2. **Use SSH keys without passphrase**
   - Required for automated deployment
   - Keep private key secure in GitLab Variables (masked)

3. **Protect branches**
   - Master branch → Protected, require approval
   - Develop branch → Semi-protected

4. **Manual deploy to production**
   - Always review changes before deploy
   - Use `when: manual` for production jobs

5. **Regular backups**
   - Database backup before each deploy (add to pipeline)
   - Keep rollback capability ready

## 📈 Advanced Features (Optional)

### Add Database Backup Before Deploy
Add to `.gitlab-ci.yml` before deploy:
```yaml
  before_script:
    # ... existing before_script
    - ssh $SERVER_USER@$SERVER_HOST "pg_dump -U dbuser dbname > /backup/db_$(date +%Y%m%d_%H%M%S).sql"
```

### Add Slack/Discord Notifications
```yaml
notify:slack:
  script:
    - 'curl -X POST -H "Content-type: application/json" --data "{\"text\":\"Deployment successful!\"}" https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
```

### Add Blue-Green Deployment
Run old and new version simultaneously, switch traffic after verification.

### Add Smoke Tests After Deploy
```yaml
  after_script:
    - curl -f http://$SERVER_HOST/api/health || exit 1
    - curl -f http://$SERVER_HOST/api/patients || exit 1
```

## 📝 Notes

- Pipeline runs on every commit to master/develop
- Production deploy requires manual trigger
- Artifacts kept for 1 hour
- Cache speeds up subsequent builds
- Health check ensures app is running after deploy

## 🆘 Support

If issues persist:
1. Check GitLab CI/CD logs in pipeline details
2. Check server logs: `pm2 logs`, nginx logs
3. Verify all environment variables set correctly
4. Test SSH connection manually from GitLab runner

---

**Last Updated:** 2026-02-14
**Version:** 1.0.0
