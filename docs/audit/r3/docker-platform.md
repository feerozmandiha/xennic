# Docker Platform Audit — Sprint R3.0

**Date:** 2026-07-18

## Summary: ⚠️ CONDITIONAL PASS

### Compose Files

| File                                                      | Services                                                      | Status                  |
| --------------------------------------------------------- | ------------------------------------------------------------- | ----------------------- |
| `infrastructure/docker/compose/base/docker-compose.yml`   | 6 (postgres, redis, rabbitmq, engineering, ai, vision)        | ✅ Valid                |
| `workspace/docker-compose.yml`                            | 1 (qdrant)                                                    | ✅ Valid                |
| `infrastructure/monitoring/docker-compose.monitoring.yml` | 9 (prometheus, grafana, loki, tempo, alertmanager, exporters) | ✅ Valid, never started |

### Service Matrix

| Service             | Image                          | Port        | User              | Healthcheck               | Restart        | Resource Limits |
| ------------------- | ------------------------------ | ----------- | ----------------- | ------------------------- | -------------- | --------------- |
| postgres            | postgres:17-alpine             | 5432        | default (root)    | pg_isready                | unless-stopped | None            |
| redis               | redis:8-alpine                 | 6380→6379   | default           | redis-cli ping            | unless-stopped | None            |
| rabbitmq            | rabbitmq:4-management          | 5672, 15672 | default           | rabbitmq-diagnostics ping | unless-stopped | None            |
| qdrant              | qdrant/qdrant:latest           | 6333-6334   | default           | custom script             | unless-stopped | None            |
| engineering-service | python:3.12-slim (multi-stage) | 8001        | xennic (non-root) | curl /health              | unless-stopped | None            |
| ai-service          | python:3.12-slim (multi-stage) | 8002        | xennic (non-root) | curl /health              | unless-stopped | None            |
| vision-service      | python:3.12-slim (multi-stage) | 8003        | xennic (non-root) | curl /health              | unless-stopped | 2GB memory      |

### Dependency Graph

```
engineering-service
    └── ai-service (depends_on: healthy)
postgres, redis, rabbitmq, qdrant: independent
```

### Network Topology

Single flat bridge network: `xennic-network` — all services share one network with no segmentation.

### Volumes

9 named volumes for persistence (postgres_data, redis_data, rabbitmq_data, qdrant_storage, prometheus_data, grafana_data, loki_data, tempo_data, alertmanager_data).

### Critical Gaps

1. **No NestJS API Dockerfile** — not containerized
2. **No Next.js Web Dockerfile** — not containerized
3. **No network segmentation** — all services on flat bridge
4. **No resource limits** on 6 of 7 services
5. **No monitoring healthchecks** — 9 monitoring containers lack healthchecks
6. **Flat network** — no inter-service isolation

### Image Sizes

| Image                    | Size    |
| ------------------------ | ------- |
| base-engineering-service | 883 MB  |
| base-ai-service          | 844 MB  |
| base-vision-service      | 1.53 GB |
| postgres:17-alpine       | 424 MB  |
| rabbitmq:4-management    | 391 MB  |
| qdrant/qdrant:latest     | 270 MB  |
| redis:8-alpine           | 155 MB  |
