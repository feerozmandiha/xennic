# Sprint S2 — Docker Production Readiness Report

## 1. Python Microservice Dockerfiles

### Engineering Service — ✅ Built
- Multi-stage build, `pip install --user`, non-root `xennic` user (UID 1001)
- `HEALTHCHECK` via `curl -f http://localhost:8001/health`
- `.dockerignore` added
- Image size: **574.5 MB**
- Tag: `xennic-engineering:latest`

### AI Service — 🔄 Rebuilding
- Multi-stage build, same pattern as engineering
- `requirements.txt` updated: added `python-multipart==0.0.20`, `minio==7.2.16`
- Previous build failed due to `BrokenPipeError` (transient network issue)
- Retrying with `--network=host`

### Vision Service — 🔄 Rebuilding
- Multi-stage build, same pattern
- `requirements.txt` version bumps: `fastapi==0.115.12`, `uvicorn[standard]==0.34.0`, `pydantic==2.10.6`
- Added `pytesseract`, `tesseract-ocr-fas`
- Previous build failed due to `BrokenPipeError` (transient network issue)
- Retrying with `--network=host`

## 2. PgBouncer Connection Pooling — ✅ Operational

### Issues Fixed
| Issue | Fix |
|-------|-----|
| Port mismatch: PgBouncer listened on 5432, Docker mapped host:6432 → container:6432 | Changed `listen_port = 6432` in `pgbouncer.ini` |
| Auth type: `auth_type = md5` rejected by PostgreSQL 17 (scram-sha-256 default) | Changed to `auth_type = scram-sha-256`, plain password in `userlist.txt` |
| Connection refused after fixes | Full container restart |

### Configuration
- Host: `localhost:6432`
- Auth: `scram-sha-256`
- Pool mode: `transaction`
- Default pool size: 25
- Max client connections: 200
- API URL: `postgresql://xennic:xennic123@localhost:6432/xennic?schema=public&pgbouncer=true`

### Latency Benchmark (50 queries, persistent connection)

| Metric | Direct PostgreSQL | Via PgBouncer | Delta |
|--------|------------------|---------------|-------|
| Average | 0.68 ms | **0.48 ms** | -0.20 ms |
| p50 | 0.48 ms | **0.45 ms** | -0.03 ms |
| p95 | 1.93 ms | **0.73 ms** | -1.20 ms |
| p99 | 4.45 ms | **0.79 ms** | -3.66 ms |

PgBouncer is slightly **faster** for pooled queries due to pre-warmed backend connections.

New connection overhead: ~200-300ms (scram-sha-256 auth through Docker port mapping).

## 3. Qdrant Healthcheck — ✅ Portable

### Change
Replaced bash-specific `/dev/tcp` healthcheck with a portable script.

### Portable script (`workspace/scripts/qdrant-healthcheck.sh`)
- Method 1: `wget` → Alpine default
- Method 2: `curl` → Debian/Ubuntu
- Method 3: `bash /dev/tcp` → fallback for Debian with bash

### Healthcheck endpoint
`GET /healthz` → `200 OK "healthz check passed"`

## 4. NestJS Cold Start — ✅ 1.3s

| Phase | Duration |
|-------|----------|
| Module initialization (NestFactory.create) | 469 ms |
| Swagger setup | 51 ms |
| Route resolution | 426 ms |
| Final startup | 383 ms |
| **Total cold start** | **1,329 ms** |

50+ modules loaded. Well under the 30s estimate.

## 5. Infrastructure Health — ✅ All Services Healthy

| Service | Port | Status |
|---------|------|--------|
| PostgreSQL 17 | 5432 | ✅ healthy |
| Redis 8 | 6380 | ✅ healthy |
| RabbitMQ 4 | 5672 | ✅ healthy |
| MinIO | 9000/9001 | ✅ healthy |
| Qdrant | 6333/6334 | ✅ healthy |
| PgBouncer | 6432 | ✅ healthy |
| NestJS API | 3000 | ✅ running |
| freeLLM API | 3001 | ✅ healthy |
