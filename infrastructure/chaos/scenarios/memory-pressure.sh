#!/usr/bin/env bash
set -euo pipefail

echo "  Injecting: Memory pressure"
echo "    - Allocating memory to trigger pressure"

if command -v stress-ng &>/dev/null; then
  total_mem=$(free -m | awk '/^Mem:/ {print int($2 * 0.8)}' 2>/dev/null || echo 512)
  echo "    - Allocating ${total_mem}MB"

  stress-ng --vm 2 --vm-bytes "${total_mem}M" --timeout 10s --quiet 2>/dev/null &
  local pid=$!
  sleep 3

  echo "    - Testing: API stability under memory pressure"
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "http://localhost:3000/api/v1/health" 2>/dev/null || echo "000")
  kill $pid 2>/dev/null || true

  if [ "$status" = "200" ]; then
    echo "    - API remained operational under memory pressure"
    exit 0
  fi
  echo "    - API returned HTTP $status"
  exit 2
else
  echo "    - SKIP: stress-ng not available"
  exit 2
fi
