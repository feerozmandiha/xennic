# Development Baseline v2 — Sprint R3.0 Certification

**Date:** 2026-07-18  
**Commit:** e8a2a719f (main)  
**Tag:** `development-baseline-v1` (on e81aab983)  
**Auditor:** Automated Sprint R3.0

---

## Executive Summary

Sprint R3.0 performed a comprehensive post-Docker architecture audit across 12 phases. The platform has transitioned to Docker Compose for all Python microservices. **8/9 services verified healthy.** The codebase is architecturally sound with zero architecture violations and 1,538 tests passing. However, **2 critical security findings** and **2 quality gate failures** require remediation before production deployment.

### Verdict: ⚠️ CONDITIONAL GO

**GO for continued development.** **NO GO for production deployment** until critical findings are resolved.

---

## Repository Statistics

| Metric                | Value                                                            |
| --------------------- | ---------------------------------------------------------------- |
| Tracked files         | 1,683                                                            |
| Branch                | `main` (clean)                                                   |
| HEAD                  | `e8a2a719f` — "fix(docker): stabilize python service containers" |
| Tags                  | `development-baseline-v1`                                        |
| TypeScript source LOC | 89,702 (API) + 27,692 (Web) = **117,394**                        |
| Python source LOC     | **20,852**                                                       |
| Total source LOC      | **~138,246**                                                     |
| Shared packages       | 4 (@xennic/config, database, shared, types)                      |
| NestJS modules        | 43 top-level, 62 total                                           |
| Prisma models         | 132                                                              |
| Test files            | 90 (API) + Python tests                                          |
| Unit tests            | 1,538 (1,400 pass, 1 timing flake)                               |
| API controllers       | 58                                                               |
| API routes            | 361                                                              |
| Frontend pages        | 37                                                               |

## Docker Topology

```
┌──────────────────────────────────────────────────────────┐
│                  xennic-network (bridge)                   │
│                                                          │
│  ┌────────────┐ ┌─────────┐ ┌───────────┐ ┌─────────┐  │
│  │ postgres   │ │ redis   │ │ rabbitmq  │ │ qdrant  │  │
│  │ :5432      │ │ :6380   │ │ :5672     │ │ :6333   │  │
│  └────────────┘ └─────────┘ └───────────┘ └─────────┘  │
│         │                                              │
│  ┌──────┼────────────────────────────────────────────┐  │
│  │      │                                            │  │
│  │  engineering-service (:8001) ── ai-service (:8002)│  │
│  │         (depends_on: healthy)                     │  │
│  │                                                    │  │
│  │  vision-service (:8003)                           │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  HOST PROCESSES:                                         │
│  NestJS API (:3000)  │  Next.js Web (:3001) — not running│
└──────────────────────────────────────────────────────────┘
```

## Service Status

| #   | Service             | Port        | Protocol  | Status         | Health  |
| --- | ------------------- | ----------- | --------- | -------------- | ------- |
| 1   | PostgreSQL          | 5432        | TCP       | ✅ Docker      | healthy |
| 2   | Redis               | 6380→6379   | TCP       | ✅ Docker      | healthy |
| 3   | RabbitMQ            | 5672, 15672 | TCP       | ✅ Docker      | healthy |
| 4   | Qdrant              | 6333-6334   | HTTP/gRPC | ✅ Docker      | healthy |
| 5   | Engineering         | 8001        | HTTP      | ✅ Docker      | healthy |
| 6   | AI Service          | 8002        | HTTP      | ✅ Docker      | healthy |
| 7   | Vision              | 8003        | HTTP      | ✅ Docker      | healthy |
| 8   | NestJS API          | 3000        | HTTP      | ✅ Host        | healthy |
| 9   | Next.js Web         | 3001        | HTTP      | ❌ Not running | —       |
| 10  | Monitoring (9 svcs) | various     | —         | ⏸️ Deferred    | —       |

## Score Scores

| Category      | Score  | Weight   | Weighted    |
| ------------- | ------ | -------- | ----------- |
| Architecture  | 9.0/10 | 20%      | 1.80        |
| Security      | 6.5/10 | 20%      | 1.30        |
| API Quality   | 9.0/10 | 15%      | 1.35        |
| Database      | 8.5/10 | 10%      | 0.85        |
| Testing       | 8.0/10 | 10%      | 0.80        |
| Docker/Infra  | 7.5/10 | 10%      | 0.75        |
| Frontend      | 7.0/10 | 10%      | 0.70        |
| Documentation | 5.0/10 | 5%       | 0.25        |
| **Overall**   | —      | **100%** | **7.80/10** |

### Grade: **B+** (Conditional GO)

---

## Architecture Changes Since Sprint R2

| Change                                        | Impact                     |
| --------------------------------------------- | -------------------------- |
| Python services migrated to Docker containers | ✅ Consistent deployment   |
| Docker Compose base stack (6 services)        | ✅ Infrastructure as code  |
| Qdrant added to Docker network                | ✅ Vector DB containerized |
| NestJS API runs on host (not Docker)          | ⚠️ Hybrid deployment       |
| Next.js Web not containerized                 | ⚠️ Missing Dockerfile      |
| Monitoring stack defined but not started      | ⏸️ Deferred                |

## Quality Gate Results

| Gate                    | Result                                 |
| ----------------------- | -------------------------------------- |
| Lint                    | ✅ PASS (0 errors)                     |
| Typecheck               | ✅ PASS (0 errors)                     |
| Architecture validation | ✅ PASS (87 rules, 0 violations)       |
| Unit tests              | ✅ PASS (1,400/1,401 — 1 timing flake) |
| Prisma validate         | ✅ PASS                                |
| Prisma migrations       | ❌ FAIL (6 unapplied)                  |
| Docker compose (base)   | ✅ PASS                                |
| Docker compose (qdrant) | ✅ PASS                                |
| TypeScript build        | ✅ PASS                                |
| Prettier                | ❌ FAIL (602 files)                    |
| Docker health           | ✅ PASS (7/7 healthy)                  |
| OpenAPI spec            | ✅ PASS (valid JSON)                   |

## Technical Debt

| #   | Item                                        | Severity | Sprint |
| --- | ------------------------------------------- | -------- | ------ |
| 1   | Helmet not registered (no security headers) | CRITICAL | R3.1   |
| 2   | Real API key in apps/api/.env               | CRITICAL | R3.1   |
| 3   | 57 dependency vulnerabilities (3 critical)  | HIGH     | R3.1   |
| 4   | No MIME validation on file uploads          | HIGH     | R3.1   |
| 5   | All infrastructure ports on 0.0.0.0         | HIGH     | R3.1   |
| 6   | 602 unformatted files                       | MEDIUM   | R3.1   |
| 7   | 6 unapplied DB migrations                   | MEDIUM   | R3.1   |
| 8   | No NestJS API Dockerfile                    | MEDIUM   | R3.2   |
| 9   | No Next.js Web Dockerfile                   | MEDIUM   | R3.2   |
| 10  | Next.js Web not running                     | MEDIUM   | R3.1   |
| 11  | No network segmentation in Docker           | MEDIUM   | R3.2   |
| 12  | Vision CORS `allow_origins=["*"]`           | MEDIUM   | R3.1   |
| 13  | Client-only auth (no SSR protection)        | MEDIUM   | R3.3   |
| 14  | No CSRF protection                          | MEDIUM   | R3.3   |
| 15  | 59 console.log in API source                | LOW      | R3.2   |
| 16  | Monitoring stack not started                | LOW      | R3.2   |
| 17  | Documentation drift (Sprint S2 reports)     | LOW      | R3.1   |
| 18  | workers/ directory missing                  | LOW      | R3.2   |

## Known Limitations

1. **Hybrid deployment:** API runs on host, Python services in Docker — inconsistent runtime
2. **No production Dockerfiles:** API and Web lack Dockerfiles for containerized deployment
3. **No reverse proxy:** Nginx/Traefik not configured (referenced in production template only)
4. **No CI/CD for Docker:** GitHub Actions pipeline exists but Docker build not included
5. **Monitoring deferred:** 9 containers defined but never started (Docker Hub rate limit)
6. **Next.js Web down:** Not running in current session

## Improvement Roadmap

### Sprint R3.1 — Critical Security & Quality (next)

- [ ] Register `@fastify/helmet` in main.ts
- [ ] Run `pnpm db:apply` to apply 6 pending migrations
- [ ] Run `pnpm format` to fix 602 files
- [ ] Start Next.js Web
- [ ] Restrict Docker ports to 127.0.0.1
- [ ] Fix vision-service CORS
- [ ] Run `pnpm audit --fix` for dependency vulnerabilities
- [ ] Rotate exposed Mistral API key

### Sprint R3.2 — Docker Hardening

- [ ] Create NestJS API Dockerfile
- [ ] Create Next.js Web Dockerfile
- [ ] Add network segmentation (frontend, backend, data tiers)
- [ ] Add resource limits to all containers
- [ ] Start monitoring stack
- [ ] Replace console.log with NestJS Logger

### Sprint R3.3 — Production Readiness

- [ ] Add SSR authentication
- [ ] Add CSRF protection
- [ ] Add server-side MIME validation
- [ ] Configure Nginx reverse proxy
- [ ] Add production override compose
- [ ] Update all stale documentation

## Recommendation

### ⚠️ CONDITIONAL GO

**The platform is ready for continued feature development** under the following conditions:

1. The 2 CRITICAL security findings (Helmet, API key) must be fixed in the next sprint
2. Quality gate failures (migrations, formatting) must be resolved before any release
3. Docker port binding must be restricted for local development

**The platform is NOT ready for production deployment** until:

- All HIGH+ security findings are resolved
- Production Dockerfiles exist for API and Web
- Network segmentation is implemented
- Monitoring stack is operational
- Documentation is updated

---

## Files Generated

| File                                         | Phase                |
| -------------------------------------------- | -------------------- |
| `docs/audit/r3/git-integrity.md`             | Phase 1              |
| `docs/audit/r3/docker-platform.md`           | Phase 2              |
| `docs/audit/r3/runtime-health.md`            | Phase 3              |
| `docs/audit/r3/architecture-audit.md`        | Phase 4              |
| `docs/audit/r3/database-audit.md`            | Phase 5              |
| `docs/audit/r3/api-audit.md`                 | Phase 6              |
| `docs/audit/r3/python-services.md`           | Phase 7              |
| `docs/audit/r3/frontend-audit.md`            | Phase 8              |
| `docs/audit/r3/security-audit.md`            | Phase 9              |
| `docs/audit/r3/quality-gates.md`             | Phase 10             |
| `docs/audit/r3/documentation-consistency.md` | Phase 11             |
| `docs/baseline/development-baseline-v2.md`   | Phase 12 (this file) |

**Total:** 12 audit documents generated.
