#!/usr/bin/env bash
set -euo pipefail

echo "  Injecting: AI Service unavailable"
echo "    - AI runtime should cache last known state"

if command -v docker &>/dev/null; then
  container=$(docker ps --format '{{.Names}}' 2>/dev/null | grep 'ai' | head -1 || true)
  if [ -n "$container" ]; then
    docker pause "$container" 2>/dev/null || docker stop "$container" 2>/dev/null || true
    sleep 3
    echo "    - Testing: API AI endpoints should degrade gracefully"
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://localhost:3000/api/v1/health" 2>/dev/null || echo "000")
    docker unpause "$container" 2>/dev/null || docker start "$container" 2>/dev/null || true
    sleep 5
    if [ "$status" = "200" ]; then
      echo "    - API returned HTTP 200 (AI-dependent features degraded)"
      exit 0
    fi
    echo "    - API returned HTTP $status"
    exit 2
  else
    echo "    - SKIP: AI service container not running"
    exit 2
  fi
else
  echo "    - SKIP: Docker not available"
  exit 2
fi
