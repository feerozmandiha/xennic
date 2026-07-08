#!/usr/bin/env bash
set -euo pipefail

echo "  Injecting: CPU saturation"
echo "    - Loading CPU to near 100% on host"

stress_test() {
  local cores
  cores=$(nproc 2>/dev/null || echo 2)
  # Use stress-ng if available, fallback to dd
  if command -v stress-ng &>/dev/null; then
    stress-ng --cpu "$cores" --timeout 10s --quiet 2>/dev/null &
  elif command -v stress &>/dev/null; then
    stress --cpu "$cores" --timeout 10 2>/dev/null &
  else
    for _ in $(seq "$cores"); do
      dd if=/dev/zero of=/dev/null &
    done
  fi
  local pid=$!
  sleep 3

  echo "    - Testing: API responsiveness under CPU pressure"
  start_time=$(date +%s%N)
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "http://localhost:3000/api/v1/health" 2>/dev/null || echo "000")
  end_time=$(date +%s%N)
  elapsed_ms=$(( (end_time - start_time) / 1000000 ))

  kill $pid 2>/dev/null || true

  if [ "$status" = "200" ]; then
    echo "    - API responded HTTP 200 in ${elapsed_ms}ms under CPU saturation"
    if [ "$elapsed_ms" -gt 5000 ]; then
      echo "    - ⚠ Latency degraded significantly (${elapsed_ms}ms)"
      exit 2
    fi
    exit 0
  fi
  echo "    - API returned HTTP $status"
  exit 2
}

stress_test
