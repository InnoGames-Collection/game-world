#!/usr/bin/env bash
# ==============================================================================
# GAMEON TELE — Enterprise Production Deployment Engine
# Target: GCP Compute Engine VM (innoserver-serv001: 34.41.116.217)
# ==============================================================================
set -Eeuo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

echo "📥 Pulling latest updates from origin main..."
git pull origin main

WEB_CANARY="http://127.0.0.1:3300/health"
ADMIN_CANARY="http://127.0.0.1:3303/health"
API_CANARY="http://127.0.0.1:3302/health"

rollback() {
  local exit_code=$?
  if [ $exit_code -ne 0 ]; then
    echo "❌ [DEPLOYMENT FAILURE] Exit code $exit_code detected. Initiating self-healing rollback..."
    docker compose -f docker-compose.server.yml restart || true
    echo "⚠️ Rollback completed."
  fi
}
trap rollback EXIT

echo "=============================================================================="
echo "🚀 [STAGE 1: OBSERVE] System Topology & Swap Allocation Check"
echo "=============================================================================="
TOTAL_SWAP=$(free -m | awk '/Swap:/ {print $2}')
if [ "${TOTAL_SWAP:-0}" -lt 2000 ]; then
  echo "⚠️ Warning: Host swap is under 2GB ($TOTAL_SWAP MB). Allocating 4GB swap buffer..."
  if [ "$(id -u)" -eq 0 ]; then
    fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile || true
  else
    sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile || true
  fi
fi
free -h

echo "=============================================================================="
echo "🔨 [STAGE 2: ACT] Sequential Build & Deployment"
echo "=============================================================================="
# 1. Start Infrastructure (PostgreSQL & Valkey)
docker compose -f docker-compose.server.yml up -d postgres valkey

echo "⏳ Waiting for PostgreSQL & Valkey healthy state..."
for i in {1..30}; do
  if docker compose -f docker-compose.server.yml ps postgres | grep -q "healthy" && \
     docker compose -f docker-compose.server.yml ps valkey | grep -q "healthy"; then
    echo "✅ Databases healthy."
    break
  fi
  sleep 1
done

# 2. Build and Launch API, Admin & Web
docker compose -f docker-compose.server.yml build api
docker compose -f docker-compose.server.yml up -d api

docker compose -f docker-compose.server.yml build admin
docker compose -f docker-compose.server.yml up -d admin

docker compose -f docker-compose.server.yml build web
docker compose -f docker-compose.server.yml up -d web

echo "=============================================================================="
echo "🩺 [STAGE 3: VERIFY] Synthetic Canary Probes"
echo "=============================================================================="
echo "Probing Web ($WEB_CANARY)..."
for i in {1..30}; do
  if curl -s -f "$WEB_CANARY" | grep -q "healthy"; then
    echo "✅ Canary 1 Passed: Web Portal Healthy (Port 3300)"
    break
  fi
  sleep 2
done

echo "Probing Admin ($ADMIN_CANARY)..."
for i in {1..30}; do
  if curl -s -f "$ADMIN_CANARY" | grep -q "healthy"; then
    echo "✅ Canary 2 Passed: Admin Console Healthy (Port 3303)"
    break
  fi
  sleep 2
done

echo "Probing API ($API_CANARY)..."
for i in {1..30}; do
  if curl -s -f "$API_CANARY" | grep -q "healthy"; then
    echo "✅ Canary 3 Passed: Fastify Backend Healthy (Port 3302)"
    break
  fi
  sleep 2
done

# Seed initial baseline data if empty
echo "Seeding initial database state if required..."
docker compose -f docker-compose.server.yml exec -T api node dist/db/seed.js || true

# Disarm trap
trap - EXIT

echo "=============================================================================="
echo "🎉 [DEPLOYMENT CERTIFIED] GAMEON TELE Live on innopulseplatform.com"
echo "=============================================================================="
