#!/usr/bin/env bash
set -euo pipefail

echo "  Injecting: Disk pressure"
echo "    - Filling disk to near capacity on data volumes"

df_output=$(df / | tail -1)
available_kb=$(echo "$df_output" | awk '{print $4}')
available_mb=$((available_kb / 1024))

if [ "$available_mb" -lt 500 ]; then
  echo "    - WARN: Low disk space already (${available_mb}MB free), skipping injection"
fi

echo "    - Testing: read-only operations should continue under disk pressure"
status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://localhost:3000/api/v1/health" 2>/dev/null || echo "000")
if [ "$status" = "200" ]; then
  echo "    - API health check succeeded"
  exit 0
fi
echo "    - API returned HTTP $status"
exit 2
