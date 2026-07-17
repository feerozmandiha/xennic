# Development Baseline v1

**Sprint:** R2 — Baseline Snapshot & Development Certification
**Date:** 2026-07-17
**Status:** ✅ CERTIFIED
**Git Tag:** `development-baseline-v1`

---

## 1. Git State

| Property       | Value                                           |
| -------------- | ----------------------------------------------- |
| Branch         | main                                            |
| HEAD           | `e1f3c0e9d1d8988c7a6ed98fe20923079a649d4b`      |
| Commit message | `docs: add web runtime qa checklist`            |
| Total commits  | 51                                              |
| Tags           | `development-baseline-v1`                       |
| Status         | 5 modified files (Sprint R1 infra improvements) |

### Uncommitted Changes (Sprint R1)

| File                                                | Change                             | Type           |
| --------------------------------------------------- | ---------------------------------- | -------------- |
| `package.json`                                      | Added `pnpm.onlyBuildDependencies` | Infrastructure |
| `workspace/services/engineering-service/Dockerfile` | venv-based pip install             | Infrastructure |
| `workspace/services/ai-service/Dockerfile`          | venv-based pip install             | Infrastructure |
| `workspace/services/vision-service/Dockerfile`      | venv-based pip install             | Infrastructure |
| `docs/generated/governance-report.md`               | Timestamp update                   | Generated      |

---

## 2. Toolchain Versions

| Tool              | Version  |
| ----------------- | -------- |
| Node.js           | v22.23.1 |
| pnpm              | 10.33.0  |
| Turborepo         | 2.9.16   |
| TypeScript        | 6.0.3    |
| Prisma            | 6.19.3   |
| Python (services) | 3.12.11  |
| Docker            | 29.6.2   |
| Docker Compose    | v5.3.1   |
| Git               | 2.51.0   |
| GCC               | 15.2.0   |

---

## 3. Architecture Snapshot

### Platform Structure

| Component               | Count           |
| ----------------------- | --------------- |
| NestJS modules          | 43              |
| Shared packages         | 5               |
| Applications            | 2 (API + Web)   |
| Python microservices    | 3               |
| Prisma DB models        | 132             |
| REST endpoints          | 366             |
| Controller declarations | 57              |
| Services                | 192             |
| Repositories            | 153             |
| Entities                | 90              |
| DTOs                    | 51              |
| Guards                  | 8               |
| Domain events           | 12              |
| Background workers      | 9               |
| AI providers            | 8 (via Gateway) |
| Architecture rules      | 87              |

### Platform Modules

| Platform                 | Modules    | Files | Tests |
| ------------------------ | ---------- | ----- | ----- |
| Core Business            | 21         | ~400  | ~200  |
| AI Platform              | 3          | ~80   | ~50   |
| Knowledge Platform       | 3          | ~60   | ~40   |
| Calculation Platform     | 1          | ~50   | ~200  |
| Enterprise Intelligence  | 1 (10 sub) | 135   | 237   |
| Enterprise Orchestration | 1 (9 sub)  | ~100  | ~150  |
| Enterprise Platform      | 8          | ~80   | ~50   |
| Infrastructure           | 2          | ~30   | ~20   |
| Integration              | 1          | ~20   | ~10   |

### Database Schema

| Domain                   | Models  |
| ------------------------ | ------- |
| Auth + RBAC              | 8       |
| Workspace                | 4       |
| Billing                  | 8       |
| Projects                 | 4       |
| Engineering              | 3       |
| AI Core                  | 4       |
| Knowledge                | 30      |
| Marketplace              | 5       |
| Storage                  | 2       |
| System                   | 6       |
| Knowledge Graph          | 9       |
| Events                   | 2       |
| AI Providers             | 12      |
| Enterprise Intelligence  | 15      |
| Enterprise Orchestration | 14      |
| Calculation Platform     | 10      |
| **Total**                | **132** |

### Migration History

| #   | Migration                        | Date       |
| --- | -------------------------------- | ---------- |
| 1   | init                             | 2026-06-02 |
| 2   | knowledge_system_phase1          | 2026-06-17 |
| 3   | add_knowledge_workspace_id       | 2026-06-17 |
| 4   | add_search_text_fts              | 2026-06-18 |
| 5   | add_event_outbox_and_process_log | 2026-07-05 |
| 6   | add_provider_management_tables   | 2026-07-07 |

---

## 4. Project Statistics

| Metric              | Value                        |
| ------------------- | ---------------------------- |
| TypeScript LOC      | 95,637                       |
| Python LOC          | 28,294                       |
| Total LOC           | ~129,000                     |
| Source files        | ~2,070                       |
| TypeScript files    | 1,001                        |
| Python files        | 241                          |
| Test files          | 89                           |
| Test cases          | 1,538 (1,401 unit + 137 E2E) |
| Test pass rate      | 100%                         |
| Documentation files | 123                          |
| CI workflows        | 3                            |
| Architecture rules  | 87                           |

---

## 5. Infrastructure

### Docker Containers

| Container       | Image                 | Port       | Status     |
| --------------- | --------------------- | ---------- | ---------- |
| xennic-postgres | postgres:17-alpine    | 5432       | ✅ healthy |
| xennic-redis    | redis:8-alpine        | 6380       | ✅ healthy |
| xennic-rabbitmq | rabbitmq:4-management | 5672/15672 | ✅ healthy |
| xennic-qdrant   | qdrant/qdrant:latest  | 6333/6334  | ✅ healthy |

### Application Services

| Service             | Port | Status     |
| ------------------- | ---- | ---------- |
| NestJS API          | 3000 | ✅ running |
| Next.js Web         | 3001 | ✅ running |
| Engineering Service | 8001 | ✅ running |
| AI Service          | 8002 | ✅ running |
| Vision Service      | 8003 | ✅ running |

---

## 6. Validation Results

| Gate                 | Result                                |
| -------------------- | ------------------------------------- |
| `pnpm typecheck`     | ✅ 9/9 packages (482ms cached)        |
| `pnpm validate:arch` | ✅ 87 rules, 43 modules, 0 violations |
| Unit tests           | ✅ 82 suites, 1,401 tests (100%)      |
| E2E tests            | ✅ 7 suites, 137 tests (100%)         |
| Health endpoints     | ✅ All 5 services responding          |
| Login flow           | ✅ JWT token issued                   |
| Swagger docs         | ✅ Accessible at /api/docs            |

---

## 7. Technical Debt

| ID     | Severity    | Description                               |
| ------ | ----------- | ----------------------------------------- |
| TD-001 | 🔴 Critical | JWT private key in git history            |
| TD-002 | 🔴 Critical | API keys in committed .env files          |
| TD-003 | 🟠 High     | DB passwords in committed .env files      |
| TD-004 | 🟠 High     | Monitoring stack deferred (Docker Hub)    |
| TD-005 | 🟡 Medium   | Deprecated google.generativeai            |
| TD-006 | 🟡 Medium   | Redis compose lacks auth config           |
| TD-007 | 🔵 Low      | workers/\* workspace empty                |
| TD-008 | 🔵 Low      | api-gateway placeholder empty             |
| TD-009 | 🔵 Low      | Python services not containerized for dev |
| TD-010 | 🔵 Low      | Absolute paths in .env files              |

---

## 8. Documents

| Document               | Path                                           |
| ---------------------- | ---------------------------------------------- |
| Dependency Lock Report | `docs/baseline/dependency-lock-report.md`      |
| Runtime Manifest       | `docs/baseline/runtime-manifest.md`            |
| Project Statistics     | `docs/baseline/project-statistics.md`          |
| This Document          | `docs/baseline/development-baseline-v1.md`     |
| Sprint R1 Report       | `docs/recovery/environment-recovery-report.md` |
| Runtime Inventory      | `docs/recovery/runtime-inventory.md`           |

---

## 9. Readiness Score

| Dimension      | Score      | Notes                                          |
| -------------- | ---------- | ---------------------------------------------- |
| Infrastructure | 9/10       | All core services running; monitoring deferred |
| Code Quality   | 9/10       | 0 arch violations, clean typecheck             |
| Test Coverage  | 8/10       | 1,538 tests passing; no coverage % measurement |
| Security       | 4/10       | Committed secrets (known debt)                 |
| Documentation  | 7/10       | 123 docs; some generated                       |
| DevEx          | 8/10       | Full stack operational; Python venvs manual    |
| **Overall**    | **7.5/10** |                                                |

---

## 10. Recommendation

### ✅ GO

The Xennic platform development environment is fully operational and certified at Baseline v1.

- All 9 services running and healthy
- 1,538 tests passing at 100%
- 0 architecture violations
- 0 typecheck errors
- Database seeded with all master data
- Full connectivity matrix verified

**Known constraints:**

- Monitoring stack deferred (Docker Hub rate limit)
- Security debt requires separate remediation sprint
- Python services run via setsid (not Docker Compose)

**Next steps:**

- Feature development may proceed from this baseline
- Security remediation sprint recommended before production
- Monitoring stack deployment when Docker Hub access restores
