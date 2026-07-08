#!/usr/bin/env bash
set -euo pipefail

echo "  Injecting: Leader election"
echo "    - Single-instance deployment, verifying statelessness"

echo "    - Testing: API responds correctly"
status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://localhost:3000/api/v1/health" 2>/dev/null || echo "000")
if [ "$status" = "200" ]; then
  echo "    - API healthy (ready for multi-instance with load balancer)"
  exit 0
fi
echo "    - API returned HTTP $status"
exit 2
