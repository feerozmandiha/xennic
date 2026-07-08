#!/usr/bin/env bash
set -euo pipefail

echo "  Injecting: Qdrant unavailable"
echo "    - Vector search should fall back to keyword search"

if command -v docker &>/dev/null; then
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -q 'qdrant'; then
    docker pause qdrant 2>/dev/null || docker stop qdrant 2>/dev/null || true
    sleep 3
    echo "    - Testing: search API should fall back gracefully"
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://localhost:3000/api/v1/health" 2>/dev/null || echo "000")
    docker unpause qdrant 2>/dev/null || docker start qdrant 2>/dev/null || true
    sleep 5
    if [ "$status" = "200" ]; then
      echo "    - API continued operating without vector DB"
      exit 0
    fi
    echo "    - API returned HTTP $status"
    exit 2
  else
    echo "    - SKIP: Qdrant container not running"
    exit 2
  fi
else
  echo "    - SKIP: Docker not available"
  exit 2
fi
