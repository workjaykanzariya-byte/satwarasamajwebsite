#!/bin/bash
set -e

echo "🚀 Starting Production Deployment for Satvara Samaj Website..."

DEPLOY_PATH="/var/www/satwaramahamandal/Satvara Samaj Website"
PUBLIC_HTML="/home/satwaramahamandal.org/public_html"
PM2_APP_NAME="satwara-backend"

# 1. Validate Directories
if [ ! -d "$DEPLOY_PATH/backend" ]; then
  echo "❌ Error: Backend directory not found at $DEPLOY_PATH/backend"
  exit 1
fi

if [ ! -d "$DEPLOY_PATH/frontend" ]; then
  echo "❌ Error: Frontend directory not found at $DEPLOY_PATH/frontend"
  exit 1
fi

if [ ! -d "$PUBLIC_HTML" ]; then
  echo "❌ Error: Live public_html directory not found at $PUBLIC_HTML"
  exit 1
fi

# 2. Preserve Backend .env Check
if [ ! -f "$DEPLOY_PATH/backend/.env" ]; then
  echo "⚠️ Warning: Production backend .env does not exist at $DEPLOY_PATH/backend/.env!"
fi

# 3. Backend Deployment
echo "📦 Installing Backend Dependencies & Generating Prisma Client..."
cd "$DEPLOY_PATH/backend"

if [ -f "package-lock.json" ]; then
  npm ci --omit=dev || npm install --production
else
  npm install --production
fi

npx prisma generate

# 4. Frontend Build
echo "🏗️ Building React Frontend..."
cd "$DEPLOY_PATH/frontend"

if [ -f "package-lock.json" ]; then
  npm ci || npm install
else
  npm install
fi

npm run build

if [ ! -d "dist" ]; then
  echo "❌ Error: Frontend build failed, dist directory not found!"
  exit 1
fi

# 5. Synchronize Frontend Build to Live public_html (preserving .htaccess)
echo "🌐 Publishing Frontend dist/ to $PUBLIC_HTML (with deletion sync)..."
rsync -avz --delete --exclude='.htaccess' dist/ "$PUBLIC_HTML/"

# 6. PM2 Restart & Verification
echo "🔄 Restarting PM2 Application: $PM2_APP_NAME..."
pm2 restart "$PM2_APP_NAME" || pm2 start src/index.js --name "$PM2_APP_NAME"

sleep 3

echo "📊 Checking PM2 Status..."
pm2 status "$PM2_APP_NAME"

# 7. Health Check
echo "🔍 Running Health Checks..."

HEALTH_CHECK_URL="http://127.0.0.1:5000/api/v1/health"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_CHECK_URL" || echo "000")

if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Local Backend API Health Check PASSED (HTTP 200 at $HEALTH_CHECK_URL)"
else
  echo "❌ Local Backend API Health Check FAILED! Returned HTTP status $HTTP_STATUS"
  exit 1
fi

LIVE_STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" "https://satwaramahamandal.org/" || echo "000")
echo "🌐 Live Public Website Status: HTTP $LIVE_STATUS"

echo "🎉 Production Deployment Completed Successfully!"
