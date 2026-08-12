#!/bin/bash
set -e

echo "🚀 Running Satvara Samaj Website Production Deployment Script..."

DEPLOY_PATH="/var/www/satwaramahamandal/Satvara Samaj Website"
PUBLIC_HTML="/home/satwaramahamandal.org/public_html"
PM2_APP_NAME="satwara-backend"

# 1. Directory Checks
if [ ! -d "$DEPLOY_PATH/backend" ]; then
  echo "❌ Error: Backend directory not found at $DEPLOY_PATH/backend"
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

# 3. Backend Production Installation & Prisma Generate
echo "📦 Installing Production Backend Dependencies..."
cd "$DEPLOY_PATH/backend"
npm ci --omit=dev || npm install --production

echo "⚙️ Generating Prisma Client..."
npx prisma generate

# 4. PM2 Process Restart
echo "🔄 Restarting PM2 Application: $PM2_APP_NAME..."
pm2 restart "$PM2_APP_NAME" --update-env || pm2 start src/index.js --name "$PM2_APP_NAME"
pm2 save

sleep 3

# 5. Verification & Health Checks
echo "🔍 Running Health Checks..."

echo "A. Checking PM2 status..."
pm2 status "$PM2_APP_NAME"

echo "B. Checking Port 5000..."
ss -ltnp | grep :5000

echo "C. Checking local backend health route..."
HEALTH_CHECK_URL="http://127.0.0.1:5000/api/v1/health"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_CHECK_URL" || echo "000")

if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Local Backend API Health Check PASSED (HTTP 200 at $HEALTH_CHECK_URL)"
else
  echo "❌ Local Backend API Health Check FAILED! Returned HTTP status $HTTP_STATUS"
  exit 1
fi

echo "D. Checking public HTTPS domain..."
LIVE_STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" "https://satwaramahamandal.org/" || echo "000")
echo "🌐 Live Public Website Status: HTTP $LIVE_STATUS"

echo "🎉 Deployment Script Executed Successfully!"
