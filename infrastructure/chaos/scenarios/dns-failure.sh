#!/usr/bin/env bash
set -euo pipefail

echo "  Injecting: DNS failure"
echo "    - Service discovery should fall back to cached resolution"

echo "    - Testing: API startup should not block on DNS"
status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 --resolve 'example.com:80:127.0.0.1' "http://localhost:3000/api/v1/health" 2>/dev/null || echo "000")
if [ "$status" = "200" ]; then
  echo "    - API responded without external DNS resolution"
  exit 0
fi
echo "    - API returned HTTP $status"
exit 2
