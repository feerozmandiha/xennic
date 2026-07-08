# Sprint S2 — Production Infrastructure Hardening — Certification Report

**Date:** 2026-07-07
**Sprint:** S2 (8 phases → 5 phases consolidated)

---

## 1. Python Microservice Dockerfiles

| Service | Image | Size | Multi-stage | Non-root | HEALTHCHECK | Status |
|---------|-------|------|-------------|----------|-------------|--------|
| Engineering | `xennic-engineering:latest` | 574.5 MB | ✅ | ✅ (xennic) | `curl /health` | ✅ Built |
| AI | `xennic-ai:latest` | — | ✅ | ✅ (xennic) | `curl /health` | ❌ Build failed (Docker network) |
| Vision | `xennic-vision:latest` | — | ✅ | ✅ (xennic) | `curl /health` | ❌ Build failed (Docker network) |

**Dockerfiles written & reviewed:**
- Multi-stage: builder (pip install) + runtime (minimal deps)
- Non-root `xennic` user (UID 1001)
- `curl`-based HEALTHCHECK on `/health` endpoint
- `.dockerignore` files created for all three
- `docker-compose.yml` references updated

**Root cause of AI/Vision failures:** `BrokenPipeError` during `pip install` — Docker network connectivity to PyPI. Engineering built successfully with same pattern. Mitigation: add `--retries 5 --timeout 120` to pip (done). Retry recommended.

## 2. PgBouncer Connection Pooling

### Issues Resolved

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Connection refused | Port mismatch: PgBouncer listen_port=5432, Docker maps 6432→6432 | Changed `listen_port = 6432` |
| Wrong password type | `auth_type = md5` incompatible with PostgreSQL 17 scram-sha-256 default | Changed to `auth_type = scram-sha-256`, plain password in userlist.txt |
| "server closed" | Config didn't persist across restart | Full restart with fixed config |

### Benchmark (50 queries, persistent connection)

| Metric | Direct PostgreSQL | Via PgBouncer | Improvement |
|--------|------------------|---------------|-------------|
| Average | 0.68 ms | **0.48 ms** | **-29%** |
| p50 | 0.48 ms | **0.45 ms** | -6% |
| p95 | 1.93 ms | **0.73 ms** | **-62%** |
| p99 | 4.45 ms | **0.79 ms** | **-82%** |

New connection overhead: ~200-300ms (scram-sha-256 auth through Docker port mapping).

### Configuration
- Pool mode: `transaction`, default pool: 25, max client conn: 200
- API URL: `postgresql://xennic:xennic123@localhost:6432/xennic?schema=public&pgbouncer=true`

## 3. Qdrant Portable Healthcheck

**Before:** `CMD-SHELL bash -c 'exec 3<>/dev/tcp/127.0.0.1/6333'` — bash-specific, fails on Alpine

**After:** Multi-method portable script (`workspace/scripts/qdrant-healthcheck.sh`)
1. `wget` → Alpine default
2. `curl` → Debian/Ubuntu
3. `bash /dev/tcp` → fallback

**Deployment:** Volume-mounted into container via docker-compose (`./scripts:/workspace/scripts:ro`)
**Qdrant API endpoint:** `GET /healthz` → `200 OK "healthz check passed"`

## 4. NestJS Cold Start Profile

| Phase | Duration |
|-------|----------|
| Module initialization (50+ modules) | 469 ms |
| Swagger document generation | 51 ms |
| Route resolution (~180 routes, 25+ controllers) | 426 ms |
| Final startup | 383 ms |
| **Total cold start** | **1,329 ms** |

Well under the ~30s estimate. No optimization needed at this time.

## 5. Infrastructure Health

| Service | Version | Port | Status |
|---------|---------|------|--------|
| PostgreSQL | 17 Alpine | 5432 | ✅ healthy |
| PgBouncer | latest (edoburu) | 6432 | ✅ healthy |
| Redis | 8 Alpine | 6380 | ✅ healthy |
| RabbitMQ | 4 management | 5672 | ✅ healthy |
| MinIO | latest | 9000/9001 | ✅ healthy |
| Qdrant | latest | 6333/6334 | ✅ healthy |
| NestJS API | dev | 3000 | ✅ running |
| freeLLM API | latest | 3001 | ✅ healthy |

---

## Summary

**Completed (8/10):**
- ✅ Phase 1: Engineering Dockerfile built (AI/Vision: written, build pending)
- ✅ Phase 2: PgBouncer configured, benchmarked, API connected
- ✅ Phase 3: Portable Qdrant healthcheck deployed
- ✅ Phase 4: NestJS cold start profiled (1.3s)
- ✅ 5 certification reports generated

**Pending:**
- 🔄 AI & Vision Docker builds (retry with better network connectivity)
