#!/bin/bash
# Manual Deployment Script (Alternative to GitLab CI/CD)
# Use this if GitLab CI/CD is not available

set -e

# Configuration
SERVER_USER="${SERVER_USER:-klinik}"
SERVER_HOST="${SERVER_HOST:-your-server-ip}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/klinik}"

echo "🚀 Manual Deployment Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Server: $SERVER_USER@$SERVER_HOST"
echo "Path: $DEPLOY_PATH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we can connect to server
echo "1. Testing SSH connection..."
if ssh -o ConnectTimeout=5 $SERVER_USER@$SERVER_HOST "echo 'Connection successful'" 2>/dev/null; then
    echo "✓ SSH connection successful"
else
    echo "✗ SSH connection failed"
    echo "Please check SERVER_USER and SERVER_HOST variables"
    exit 1
fi
echo ""

# Deploy Backend
echo "2. Deploying backend..."
echo "   - Syncing files..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude 'dist' \
    --exclude '.git' \
    backend/ $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/backend/

echo "   - Installing dependencies..."
ssh $SERVER_USER@$SERVER_HOST "cd $DEPLOY_PATH/backend && npm ci --production"

echo "   - Generating Prisma Client..."
ssh $SERVER_USER@$SERVER_HOST "cd $DEPLOY_PATH/backend && npx prisma generate"

echo "   - Running database migrations..."
ssh $SERVER_USER@$SERVER_HOST "cd $DEPLOY_PATH/backend && npx prisma migrate deploy"

echo "✓ Backend deployed"
echo ""

# Deploy Frontend
echo "3. Deploying frontend..."
echo "   - Building frontend locally..."
cd frontend
npm ci
npm run build
cd ..

echo "   - Syncing built files..."
rsync -avz --delete \
    frontend/dist/ $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/frontend/dist/

echo "✓ Frontend deployed"
echo ""

# Restart Services
echo "4. Restarting services..."
ssh $SERVER_USER@$SERVER_HOST "pm2 restart klinik-backend || pm2 start $DEPLOY_PATH/backend/src/server.js --name klinik-backend"
echo "✓ Backend restarted"
echo ""

# Health Check
echo "5. Running health check..."
sleep 3  # Wait for service to start
if ssh $SERVER_USER@$SERVER_HOST "curl -f http://localhost:5000/api/health" >/dev/null 2>&1; then
    echo "✓ Health check passed"
else
    echo "⚠ Health check failed - check logs with: ssh $SERVER_USER@$SERVER_HOST 'pm2 logs klinik-backend'"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Check status:"
echo "   ssh $SERVER_USER@$SERVER_HOST 'pm2 status'"
echo ""
echo "📝 View logs:"
echo "   ssh $SERVER_USER@$SERVER_HOST 'pm2 logs klinik-backend'"
echo ""
echo "🌐 Access application:"
echo "   http://$SERVER_HOST"
echo ""
