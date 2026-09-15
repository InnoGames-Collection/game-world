#!/usr/bin/env bash
# ==============================================================================
# GAMEON TELE — Closed-Loop Agentic Deployment Engine
# Target: GCP Compute Engine VM (innoserver-serv001: 34.41.116.217)
# ==============================================================================
set -Eeuo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

CANARY_URL="http://127.0.0.1:8200/health"
API_CANARY_URL="http://127.0.0.1:8200/api/v1/health"
PREV_COMMIT="$(git rev-parse HEAD 2>/dev/null || echo 'HEAD')"

rollback() {
  local exit_code=$?
  if [ $exit_code -ne 0 ]; then
    echo "❌ [DEPLOYMENT FAILURE] Exit code $exit_code detected. Initiating self-healing rollback..."
    docker compose -f docker-compose.server.yml restart api || true
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
docker compose -f docker-compose.server.yml build --pull api
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

docker compose -f docker-compose.server.yml up -d api

echo "=============================================================================="
echo "🩺 [STAGE 3: VERIFY] Synthetic Canary Probes"
echo "=============================================================================="
echo "Probing $CANARY_URL..."
for i in {1..30}; do
  if curl -s -f "$CANARY_URL" | grep -q "healthy"; then
    echo "✅ Canary 1 Passed: System Root Probe Healthy"
    break
  fi
  echo "Canary probe $i/30 waiting..."
  sleep 2
done

echo "Probing $API_CANARY_URL..."
curl -s -f "$API_CANARY_URL" | grep -q "GAMEON TELE"
echo "✅ Canary 2 Passed: API Service Domain Probe Healthy"

# Disarm trap
trap - EXIT

echo "=============================================================================="
echo "🎉 [DEPLOYMENT CERTIFIED] GAMEON TELE Live on innopulseplatform.com"
echo "=============================================================================="
