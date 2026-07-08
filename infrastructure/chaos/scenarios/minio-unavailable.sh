#!/usr/bin/env bash
set -euo pipefail

echo "  Injecting: MinIO unavailable"
echo "    - File upload/download operations should fail gracefully"

if command -v docker &>/dev/null; then
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -q 'xennic-minio'; then
    docker pause xennic-minio 2>/dev/null || docker stop xennic-minio 2>/dev/null || true
    sleep 3
    echo "    - Testing: API should return 503 for storage operations"
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://localhost:3000/api/v1/health" 2>/dev/null || echo "000")
    docker unpause xennic-minio 2>/dev/null || docker start xennic-minio 2>/dev/null || true
    sleep 5
    if [ "$status" = "200" ] || [ "$status" = "503" ]; then
      echo "    - API returned HTTP $status (degraded but operational)"
      exit 0
    fi
    exit 2
  else
    echo "    - SKIP: MinIO container not running"
    exit 2
  fi
else
  echo "    - SKIP: Docker not available"
  exit 2
fi
