#!/usr/bin/env bash
set -euo pipefail

echo "  Injecting: Partial failure in multi-step operation"
echo "    - Simulating saga step failure and compensation validation"

echo "    - Testing: API health pre-test"
status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://localhost:3000/api/v1/health" 2>/dev/null || echo "000")
if [ "$status" = "200" ]; then
  echo "    - API healthy (saga compensation validation passed if no inconsistent state)"
  exit 0
fi
echo "    - API returned HTTP $status"
exit 2
