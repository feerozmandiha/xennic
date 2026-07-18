# MODULE COMPLETENESS MATRIX

**Date:** 2026-07-02
**Method:** Source-code verified

---

## Registered Modules (23)

| Module        | Files | LOC   | Controllers | Services | Repos | Entities | DTOs | Tests | Complete% | Status          |
| ------------- | ----- | ----- | ----------- | -------- | ----- | -------- | ---- | ----- | --------- | --------------- |
| health        | 5     | 73    | 1           | 1        | 0     | 0        | 0    | 2     | 100%      | ✅              |
| workspace     | 26    | 2,487 | 4           | 3        | 3     | 4        | 6    | 2     | 100%      | ✅              |
| user          | 10    | 978   | 1           | 2        | 1     | 1        | 1    | 0     | 100%      | ✅              |
| auth          | 14    | 1,091 | 1           | 2        | 2     | 2        | 1    | 0     | 100%      | ✅              |
| rbac          | 23    | 2,052 | 2           | 3        | 3     | 3        | 2    | 0     | 100%      | ✅              |
| project       | 7     | 1,257 | 1           | 1        | 1     | 1        | 1    | 0     | 100%      | ✅              |
| engineering   | 8     | 1,103 | 1           | 2        | 1     | 1        | 1    | 0     | 100%      | ✅              |
| subscription  | 8     | 857   | 1           | 1        | 1     | 2        | 1    | 0     | 100%      | ✅              |
| storage       | 8     | 885   | 1           | 2        | 1     | 1        | 1    | 0     | 100%      | ✅              |
| notification  | 7     | 667   | 1           | 1        | 1     | 1        | 1    | 0     | 90%       | ⚠️ (queue TODO) |
| ai            | 8     | 1,029 | 1           | 1        | 1     | 1        | 1    | 0     | 100%      | ✅              |
| consultations | 5     | 346   | 1           | 1        | 1     | 1        | 0    | 0     | 100%      | ✅              |
| billing       | 14    | 1,986 | 2           | 2        | 1     | 4        | 1    | 0     | 100%      | ✅              |
| admin         | 8     | 1,310 | 3           | 1        | 0     | 0        | 1    | 1     | 100%      | ✅              |
| search        | 7     | 483   | 1           | 1        | 1     | 1        | 1    | 0     | 100%      | ✅              |
| knowledge     | 14    | 3,487 | 4           | 1        | 1     | 1        | 1    | 3     | 100%      | ✅              |
| standards     | 7     | 448   | 1           | 1        | 1     | 1        | 1    | 0     | 100%      | ✅              |
| marketplace   | 15    | 1,228 | 3           | 3        | 1     | 3        | 3    | 0     | 100%      | ✅              |
| api-keys      | 7     | 502   | 1           | 1        | 1     | 1        | 1    | 0     | 100%      | ✅              |
| webhooks      | 7     | 624   | 1           | 1        | 1     | 1        | 1    | 0     | 100%      | ✅              |
| email         | 10    | 539   | 1           | 2        | 1     | 1        | 1    | 0     | 100%      | ✅              |
| feature-flags | 10    | 543   | 2           | 1        | 1     | 1        | 1    | 0     | 100%      | ✅              |
| vision        | 4     | 288   | 1           | 2        | 0     | 0        | 0    | 0     | 100%      | ✅              |

## Empty Modules (5 — Not Registered)

| Module                 | Location                          | Status                       |
| ---------------------- | --------------------------------- | ---------------------------- |
| knowledge-factory      | `modules/knowledge-factory/`      | **0%** — Empty DDD structure |
| enterprise-background  | `modules/enterprise-background/`  | **0%** — Empty DDD structure |
| enterprise-backup      | `modules/enterprise-backup/`      | **0%** — Empty DDD structure |
| enterprise-config      | `modules/enterprise-config/`      | **0%** — Empty DDD structure |
| enterprise-performance | `modules/enterprise-performance/` | **0%** — Empty DDD structure |

## Python Services

| Service             | Files | Port | Status                                     |
| ------------------- | ----- | ---- | ------------------------------------------ |
| engineering-service | ~99   | 8001 | 90% — 51 calculators, 15 tests fail        |
| ai-service          | ~30   | 8002 | 40% — RAG exists, 2/7 agents, tests broken |
| vision-service      | ~32   | 8003 | 60% — Pipeline exists, 16/16 tests pass    |

## Dependency Graph

```
health (standalone)
auth ── user ── rbac
workspace ── workspace-members ── workspace-settings ── dashboard
    └── project ── engineering ── engineering-service (HTTP)
    └── knowledge ── ai ── ai-service (HTTP)
    └── vision ── vision-service (HTTP)
    └── billing ── subscription
    └── marketplace ── storage ── MinIO (external)
    └── notification ── (future: RabbitMQ)
    └── admin (all modules for audit logging)
    └── search (all modules for global query)
```
