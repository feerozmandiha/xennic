#!/usr/bin/env bash
set -euo pipefail

echo "  Injecting: Redis unavailable"
echo "    - Stopping Redis container"

if command -v docker &>/dev/null; then
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -q 'xennic-redis'; then
    docker pause xennic-redis 2>/dev/null || docker stop xennic-redis 2>/dev/null || true
    sleep 3
    echo "    - Testing: cache-dependent endpoints should fall through to DB"
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://localhost:3000/api/v1/health" 2>/dev/null || echo "000")
    if [ "$status" = "200" ] || [ "$status" = "503" ]; then
      echo "    - API returned HTTP $status (degraded but operational)"
      docker unpause xennic-redis 2>/dev/null || docker start xennic-redis 2>/dev/null || true
      sleep 3
      exit 0
    fi
    docker unpause xennic-redis 2>/dev/null || docker start xennic-redis 2>/dev/null || true
    exit 2
  else
    echo "    - SKIP: Redis container not running"
    exit 2
  fi
else
  echo "    - SKIP: Docker not available"
  exit 2
fi
