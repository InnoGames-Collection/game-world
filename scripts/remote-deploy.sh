#!/usr/bin/env bash
# ==============================================================================
# Workstation Remote Trigger for GCP GCE Instance (innoserver-serv001)
# ==============================================================================
set -Eeuo pipefail

TARGET_INSTANCE="innoserver-serv001"
TARGET_ZONE="us-central1-a"
TARGET_IP="34.41.116.217"
TARGET_USER="yasabneh"
REMOTE_PATH="/home/${TARGET_USER}/InnoGames/game-world"

echo "Connecting to GCP VM ${TARGET_INSTANCE} (${TARGET_IP})..."

if command -v gcloud &>/dev/null; then
  echo "Executing deployment via gcloud OS Login..."
  gcloud compute ssh "${TARGET_USER}@${TARGET_INSTANCE}" --zone="${TARGET_ZONE}" --command="cd ${REMOTE_PATH} && ./scripts/server-deploy.sh"
else
  echo "gcloud CLI not found, falling back to direct SSH..."
  ssh -o StrictHostKeyChecking=no "${TARGET_USER}@${TARGET_IP}" "cd ${REMOTE_PATH} && ./scripts/server-deploy.sh"
fi
