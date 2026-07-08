#!/usr/bin/env bash
set -euo pipefail

echo "  Injecting: Engineering Service unavailable"
echo "    - Circuit breaker should open after threshold failures"

if command -v docker &>/dev/null; then
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -q 'xennic-engineering-service'; then
    engineering_container=$(docker ps --format '{{.Names}}' 2>/dev/null | grep 'engineering' | head -1)
    docker pause "$engineering_container" 2>/dev/null || docker stop "$engineering_container" 2>/dev/null || true
    sleep 2

    echo "    - Sending requests to trigger circuit breaker"
    fail_count=0
    for i in 1 2 3 4 5; do
      status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://localhost:3000/api/v1/engineering/health" 2>/dev/null || echo "000")
      if [ "$status" = "503" ]; then
        fail_count=$((fail_count + 1))
      fi
      sleep 1
    done

    docker unpause "$engineering_container" 2>/dev/null || docker start "$engineering_container" 2>/dev/null || true
    sleep 5

    if [ "$fail_count" -ge 3 ]; then
      echo "    - Circuit breaker correctly opened (received 503 for $fail_count/5 requests)"
      exit 0
    fi
    echo "    - Circuit breaker did not open consistently ($fail_count/5)"
    exit 2
  else
    echo "    - SKIP: Engineering service container not running"
    exit 2
  fi
else
  echo "    - SKIP: Docker not available"
  exit 2
fi
