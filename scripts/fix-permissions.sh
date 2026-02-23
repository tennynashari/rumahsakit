#!/bin/bash
# Fix File Permissions Script
# Run this after deployment to set correct ownership and permissions

# Configuration
PROJECT_DIR="/var/www/klinik"
APP_USER="klinik"
WEB_USER="www-data"

echo "🔐 Hospital Information System - Permission Fixer"
echo "=================================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root: sudo ./fix-permissions.sh"
    exit 1
fi

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory not found: $PROJECT_DIR"
    echo "💡 Please update PROJECT_DIR in this script"
    exit 1
fi

echo "📁 Project Directory: $PROJECT_DIR"
echo "👤 Application User: $APP_USER"
echo "🌐 Web Server User: $WEB_USER"
echo ""

# 1. Base ownership - everything to klinik:klinik
echo "1️⃣  Setting base ownership to $APP_USER:$APP_USER..."
chown -R $APP_USER:$APP_USER $PROJECT_DIR
echo "   ✅ Done"

# 2. Base permissions - 755 for directories, 644 for files
echo "2️⃣  Setting base permissions..."
find $PROJECT_DIR -type d -exec chmod 755 {} \;
find $PROJECT_DIR -type f -exec chmod 644 {} \;
echo "   ✅ Done"

# 3. Secure sensitive files
echo "3️⃣  Securing sensitive files (.env)..."
if [ -f "$PROJECT_DIR/backend/.env" ]; then
    chmod 600 $PROJECT_DIR/backend/.env
    echo "   ✅ backend/.env → 600"
else
    echo "   ⚠️  backend/.env not found"
fi

if [ -f "$PROJECT_DIR/frontend/.env" ]; then
    chmod 600 $PROJECT_DIR/frontend/.env
    echo "   ✅ frontend/.env → 600"
fi

# 4. Uploads folder - shared with nginx
echo "4️⃣  Setting uploads folder permissions..."
mkdir -p $PROJECT_DIR/backend/uploads/{profiles,documents,attachments}
chown -R $APP_USER:$WEB_USER $PROJECT_DIR/backend/uploads
chmod -R 775 $PROJECT_DIR/backend/uploads

# Set SGID bit so new files inherit group
find $PROJECT_DIR/backend/uploads -type d -exec chmod g+s {} \;
echo "   ✅ uploads/ → $APP_USER:$WEB_USER (775)"

# 5. Frontend dist folder - owned by nginx
echo "5️⃣  Setting frontend dist permissions..."
if [ -d "$PROJECT_DIR/frontend/dist" ]; then
    chown -R $WEB_USER:$WEB_USER $PROJECT_DIR/frontend/dist
    find $PROJECT_DIR/frontend/dist -type d -exec chmod 755 {} \;
    find $PROJECT_DIR/frontend/dist -type f -exec chmod 644 {} \;
    echo "   ✅ dist/ → $WEB_USER:$WEB_USER (755/644)"
else
    echo "   ⚠️  dist/ not found (not built yet)"
fi

# 6. Logs folder
echo "6️⃣  Setting logs permissions..."
mkdir -p $PROJECT_DIR/logs
chown -R $APP_USER:$APP_USER $PROJECT_DIR/logs
chmod -R 755 $PROJECT_DIR/logs
echo "   ✅ logs/ → $APP_USER:$APP_USER (755)"

# 7. Make node binaries executable
echo "7️⃣  Setting executable permissions for node binaries..."
find $PROJECT_DIR -path "*/node_modules/.bin/*" -type f -exec chmod +x {} \; 2>/dev/null || true
echo "   ✅ Done"

# 8. Git hooks (if any)
if [ -d "$PROJECT_DIR/.git/hooks" ]; then
    echo "8️⃣  Setting git hooks permissions..."
    find $PROJECT_DIR/.git/hooks -type f -exec chmod +x {} \; 2>/dev/null || true
    echo "   ✅ Done"
fi

echo ""
echo "=================================================="
echo "✅ Permission fix completed!"
echo ""
echo "📋 Summary:"
echo "   • Base files: $APP_USER:$APP_USER (755/644)"
echo "   • .env files: $APP_USER:$APP_USER (600)"
echo "   • uploads/: $APP_USER:$WEB_USER (775)"
echo "   • dist/: $WEB_USER:$WEB_USER (755/644)"
echo "   • logs/: $APP_USER:$APP_USER (755)"
echo ""
echo "🔍 Verify with:"
echo "   ls -la $PROJECT_DIR/backend/.env"
echo "   ls -la $PROJECT_DIR/backend/uploads"
echo "   ls -la $PROJECT_DIR/frontend/dist"
echo ""
