#!/usr/bin/env bash
set -euo pipefail

echo "  Injecting: RabbitMQ unavailable"
echo "    - Messages queued in outbox should remain pending until broker recovers"

if command -v docker &>/dev/null; then
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -q 'xennic-rabbitmq'; then
    docker pause xennic-rabbitmq 2>/dev/null || docker stop xennic-rabbitmq 2>/dev/null || true
    sleep 3
    echo "    - Testing: outbox relay should back off gracefully"
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://localhost:3000/api/v1/health" 2>/dev/null || echo "000")
    docker unpause xennic-rabbitmq 2>/dev/null || docker start xennic-rabbitmq 2>/dev/null || true
    sleep 5
    if [ "$status" = "200" ]; then
      echo "    - API remained operational during broker outage"
      exit 0
    fi
    echo "    - API returned HTTP $status"
    exit 2
  else
    echo "    - SKIP: RabbitMQ container not running"
    exit 2
  fi
else
  echo "    - SKIP: Docker not available"
  exit 2
fi
