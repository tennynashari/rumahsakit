#!/bin/bash
# Pre-deployment checks
# Run this before deploying to ensure everything is ready

set -e

echo "🔍 Running pre-deployment checks..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_pass() {
    echo -e "${GREEN}✓ $1${NC}"
}

check_fail() {
    echo -e "${RED}✗ $1${NC}"
}

check_warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# 1. Check if .env file exists in backend
echo "1. Checking backend .env file..."
if [ -f "backend/.env" ]; then
    check_pass ".env file exists"
    
    # Check required variables
    if grep -q "DATABASE_URL" backend/.env && \
       grep -q "JWT_SECRET" backend/.env && \
       grep -q "JWT_REFRESH_SECRET" backend/.env; then
        check_pass "Required environment variables present"
    else
        check_fail "Missing required environment variables"
        echo "   Required: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET"
    fi
else
    check_fail ".env file not found in backend/"
    echo "   Copy backend/.env.example to backend/.env"
fi
echo ""

# 2. Check if node_modules exist
echo "2. Checking dependencies..."
if [ -d "backend/node_modules" ]; then
    check_pass "Backend dependencies installed"
else
    check_warn "Backend node_modules not found (will be installed during deployment)"
fi

if [ -d "frontend/node_modules" ]; then
    check_pass "Frontend dependencies installed"
else
    check_warn "Frontend node_modules not found (will be installed during deployment)"
fi
echo ""

# 3. Check if Prisma is configured
echo "3. Checking Prisma..."
if [ -f "backend/prisma/schema.prisma" ]; then
    check_pass "Prisma schema found"
else
    check_fail "Prisma schema not found"
fi
echo ""

# 4. Check if GitLab CI config exists
echo "4. Checking GitLab CI configuration..."
if [ -f ".gitlab-ci.yml" ]; then
    check_pass ".gitlab-ci.yml exists"
else
    check_fail ".gitlab-ci.yml not found"
fi
echo ""

# 5. Check Git status
echo "5. Checking Git status..."
if [ -d ".git" ]; then
    check_pass "Git repository initialized"
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        check_warn "Uncommitted changes detected"
        echo "   Run: git status"
    else
        check_pass "No uncommitted changes"
    fi
    
    # Check current branch
    BRANCH=$(git branch --show-current)
    echo "   Current branch: $BRANCH"
else
    check_fail "Not a Git repository"
fi
echo ""

# 6. Check if package.json exists
echo "6. Checking package.json..."
if [ -f "backend/package.json" ] && [ -f "frontend/package.json" ]; then
    check_pass "package.json files found"
else
    check_fail "package.json missing"
fi
echo ""

# 7. Check if critical files are not in .gitignore
echo "7. Checking .gitignore..."
if [ -f ".gitignore" ]; then
    check_pass ".gitignore exists"
    
    if grep -q ".env" .gitignore; then
        check_pass ".env is ignored (good for security)"
    else
        check_warn ".env not in .gitignore (potential security risk)"
    fi
    
    if grep -q "node_modules" .gitignore; then
        check_pass "node_modules is ignored"
    else
        check_warn "node_modules not in .gitignore"
    fi
else
    check_fail ".gitignore not found"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Pre-deployment Check Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If all checks passed, you're ready to deploy!"
echo ""
echo "Next steps:"
echo "1. Commit and push your changes:"
echo "   git add ."
echo "   git commit -m 'chore: prepare for deployment'"
echo "   git push origin master"
echo ""
echo "2. Go to GitLab → CI/CD → Pipelines"
echo "3. Click play button ▶️  on 'deploy:production' job"
echo ""
echo "Or test locally first:"
echo "   cd backend && npm install && npm start"
echo "   cd frontend && npm install && npm run dev"
echo ""
