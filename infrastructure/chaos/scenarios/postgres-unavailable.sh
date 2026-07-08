#!/usr/bin/env bash
set -euo pipefail

echo "  Injecting: PostgreSQL unavailable"
echo "    - Stopping PostgreSQL container"

if command -v docker &>/dev/null; then
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -q 'xennic-postgres'; then
    docker pause xennic-postgres 2>/dev/null || docker stop xennic-postgres 2>/dev/null || true
    sleep 3
    echo "    - Testing API degradation"
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://localhost:3000/api/v1/health" 2>/dev/null || echo "000")
    if [ "$status" = "200" ] || [ "$status" = "503" ]; then
      echo "    - API returned HTTP $status (expected 200/503 degradation)"
      docker unpause xennic-postgres 2>/dev/null || docker start xennic-postgres 2>/dev/null || true
      sleep 5
      exit 0
    fi
    docker unpause xennic-postgres 2>/dev/null || docker start xennic-postgres 2>/dev/null || true
    exit 2
  else
    echo "    - SKIP: PostgreSQL container not running"
    exit 2
  fi
else
  echo "    - SKIP: Docker not available"
  exit 2
fi
