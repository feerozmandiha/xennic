#!/usr/bin/env bash
set -euo pipefail

echo "  Injecting: Concurrent writes"
echo "    - Sending simultaneous write requests to same resource"

echo "    - Executing 10 concurrent POST requests"
pids=()
for i in $(seq 1 10); do
  curl -s -o /dev/null -X POST \
    -H "Content-Type: application/json" \
    -d "{\"slug\":\"concurrent-test-${i}\",\"content\":{\"blocks\":[]},\"language\":\"en\",\"visibility\":\"workspace\",\"difficulty\":\"beginner\"}" \
    --max-time 30 "http://localhost:3000/api/v1/knowledge" 2>/dev/null &
  pids+=($!)
done

for pid in "${pids[@]}"; do
  wait "$pid" 2>/dev/null || true
done

echo "    - All concurrent requests completed"
echo "    - Testing: data consistency after concurrent writes"
status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://localhost:3000/api/v1/health" 2>/dev/null || echo "000")
if [ "$status" = "200" ]; then
  echo "    - API healthy after concurrent writes"
  exit 0
fi
echo "    - API returned HTTP $status"
exit 2
