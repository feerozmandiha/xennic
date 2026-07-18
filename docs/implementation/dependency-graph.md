# Xennic — Complete Dependency Graph for RC1

> Generated from 25 audit reports in `docs/audit/`
> Target: Release Candidate 1 (RC1)
> Estimated: ~28 weeks, 14 sprints

---

## Gap Inventory (All Gaps to Close for RC1)

### Level 0 — No Dependencies (Can start Sprint 1)

| ID           | Title                                                     | Depends On | Blocks       | Blocked By | Parallel With | Critical Path |
| ------------ | --------------------------------------------------------- | ---------- | ------------ | ---------- | ------------- | :-----------: |
| XEN-GAP-0010 | `.gitignore` missing `venv/`, `__pycache__`, `*.pyc`      | —          | —            | —          | All Level 0   |      No       |
| XEN-GAP-0008 | `@nestjs/throttler` misclassified as devDependency        | —          | —            | —          | All Level 0   |      No       |
| XEN-GAP-0018 | `@xennic/shared` has no build step                        | —          | —            | —          | All Level 0   |      No       |
| XEN-GAP-0019 | `README.md` is security doc, not project overview         | —          | —            | —          | All Level 0   |      No       |
| XEN-GAP-0076 | `@nestjs/platform-express` in deps (Fastify adapter)      | —          | —            | —          | All Level 0   |      No       |
| XEN-GAP-0077 | Stale `.eslintrc.cjs` coexists with flat config           | —          | —            | —          | All Level 0   |      No       |
| XEN-GAP-0005 | Lint broken for 4/6 packages                              | —          | XEN-GAP-0004 | —          | All Level 0   |    **Yes**    |
| XEN-GAP-0007 | ai-service tests fail — missing `openai` in venv          | —          | XEN-GAP-0003 | —          | All Level 0   |      No       |
| XEN-GAP-0020 | No pre-commit hooks                                       | —          | —            | —          | All Level 0   |      No       |
| XEN-GAP-0032 | UserController has NO guards (anyone can CRUD users)      | —          | —            | —          | All Level 0   |    **Yes**    |
| XEN-GAP-0034 | Hard delete endpoints public (user + workspace)           | —          | —            | —          | All Level 0   |    **Yes**    |
| XEN-GAP-0033 | SSRF via webhooks — no IP validation                      | —          | —            | —          | All Level 0   |    **Yes**    |
| XEN-GAP-0014 | No Helmet/CSP security headers (Fastify)                  | —          | —            | —          | All Level 0   |      No       |
| XEN-GAP-0040 | No CSRF protection middleware                             | —          | —            | —          | All Level 0   |      No       |
| XEN-GAP-0069 | CORS wildcard `["*"]` in Python services                  | —          | —            | —          | All Level 0   |      No       |
| XEN-GAP-0035 | Encryption master key hardcoded in `.env`                 | —          | —            | —          | All Level 0   |    **Yes**    |
| XEN-GAP-0037 | Missing workspace isolation in ConsultationsController    | —          | —            | —          | All Level 0   |    **Yes**    |
| XEN-GAP-0038 | PermissionsGuard fail-open (returns true on error)        | —          | —            | —          | All Level 0   |      No       |
| XEN-GAP-0036 | Prompt injection vulnerability (user input in LLM prompt) | —          | —            | —          | All Level 0   |      No       |
| XEN-GAP-0040 | No CSRF protection                                        | —          | —            | —          | All Level 0   |      No       |

### Level 1 — Depends on Level 0

| ID           | Title                                                      | Depends On   | Blocks                     | Blocked By | Parallel With | Critical Path |
| ------------ | ---------------------------------------------------------- | ------------ | -------------------------- | ---------- | ------------- | :-----------: |
| XEN-GAP-0041 | No graceful shutdown (SIGTERM/SIGINT)                      | XEN-GAP-0010 | XEN-GAP-0049               | —          | All L1        |    **Yes**    |
| XEN-GAP-0042 | No env validation (process.env everywhere)                 | XEN-GAP-0010 | XEN-GAP-0044, XEN-GAP-0045 | —          | All L1        |    **Yes**    |
| XEN-GAP-0006 | 15 Python tests failing (engineering-service)              | XEN-GAP-0010 | XEN-GAP-0003               | —          | All L1        |      No       |
| XEN-GAP-0009 | Web build hangs (Next.js timeout)                          | XEN-GAP-0010 | —                          | —          | All L1        |      No       |
| XEN-GAP-0062 | Fake streaming — real SSE not implemented                  | XEN-GAP-0010 | XEN-GAP-0054               | —          | All L1        |      No       |
| XEN-GAP-0065 | 95 bare catch blocks (silent error swallowing)             | XEN-GAP-0010 | XEN-GAP-0039               | —          | All L1        |      No       |
| XEN-GAP-0066 | 54 `console.log`/`console.error` instead of Logger         | XEN-GAP-0010 | —                          | —          | All L1        |      No       |
| XEN-GAP-0014 | No Helmet/CSP headers                                      | XEN-GAP-0010 | —                          | —          | All L1        |      No       |
| XEN-GAP-0051 | Timer leaks in engineering-client/vision-client            | XEN-GAP-0010 | —                          | —          | All L1        |      No       |
| XEN-GAP-0057 | `req.workspaceId` typo in ai-runtime controller            | XEN-GAP-0010 | XEN-GAP-0055               | —          | All L1        |    **Yes**    |
| XEN-GAP-0058 | Duplicate `analyze_document()` method                      | XEN-GAP-0010 | XEN-GAP-0054               | —          | All L1        |      No       |
| XEN-GAP-0059 | Python tools dead code (not registered in agents)          | XEN-GAP-0010 | XEN-GAP-0013               | —          | All L1        |      No       |
| XEN-GAP-0056 | Dummy embeddings all identical (seed bug)                  | XEN-GAP-0010 | XEN-GAP-0012               | —          | All L1        |    **Yes**    |
| XEN-GAP-0054 | Electrical Engineer Agent never calls LLM                  | XEN-GAP-0010 | XEN-GAP-0013, XEN-GAP-0062 | —          | All L1        |    **Yes**    |
| XEN-GAP-0055 | Execution pipeline echoes input (mock LLM)                 | XEN-GAP-0010 | XEN-GAP-0013               | —          | All L1        |    **Yes**    |
| XEN-GAP-0043 | Unbounded in-memory stores (OOM risk)                      | XEN-GAP-0010 | XEN-GAP-0061               | —          | All L1        |      No       |
| XEN-GAP-0044 | No Prisma `$transaction` usage                             | XEN-GAP-0042 | —                          | —          | XEN-GAP-0045  |    **Yes**    |
| XEN-GAP-0045 | No idempotency on POST endpoints                           | XEN-GAP-0042 | —                          | —          | XEN-GAP-0044  |      No       |
| XEN-GAP-0067 | 6 classes >300 lines (SRP violations)                      | XEN-GAP-0010 | —                          | —          | All L1        |      No       |
| XEN-GAP-0068 | Pagination boilerplate duplicated ~25x                     | XEN-GAP-0010 | —                          | —          | All L1        |      No       |
| XEN-GAP-0017 | 85 files use `any` type                                    | XEN-GAP-0010 | —                          | —          | All L1        |      No       |
| XEN-GAP-0070 | Missing cascade deletes on 20+ relations                   | XEN-GAP-0010 | XEN-GAP-0072               | —          | All L1        |    **Yes**    |
| XEN-GAP-0071 | `password_reset_tokens` has no relation to `users`         | XEN-GAP-0010 | —                          | —          | All L1        |      No       |
| XEN-GAP-0046 | LlmProvider falls back to mock in production               | XEN-GAP-0010 | XEN-GAP-0063               | —          | All L1        |    **Yes**    |
| XEN-GAP-0047 | DB errors silently swallowed in `ai.repository.ts`         | XEN-GAP-0010 | —                          | —          | All L1        |      No       |
| XEN-GAP-0049 | No readiness/liveness probes                               | XEN-GAP-0041 | —                          | —          | All L1        |      No       |
| XEN-GAP-0052 | No `OnModuleDestroy` lifecycle hooks                       | XEN-GAP-0041 | —                          | —          | All L1        |      No       |
| XEN-GAP-0050 | No retry policy on external HTTP calls                     | XEN-GAP-0010 | —                          | —          | All L1        |      No       |
| XEN-GAP-0004 | No CI/CD pipeline                                          | XEN-GAP-0005 | —                          | —          | All L1        |    **Yes**    |
| XEN-GAP-0053 | Rate limits not configurable via env                       | XEN-GAP-0042 | —                          | —          | All L1        |      No       |
| XEN-GAP-0063 | Mock mode gives plausible but incorrect engineering advice | XEN-GAP-0046 | —                          | —          | All L1        |      No       |
| XEN-GAP-0080 | No Redis caching layer (hot path perf)                     | XEN-GAP-0042 | —                          | —          | All L1        |      No       |
| XEN-GAP-0081 | N+1 query patterns (5 instances)                           | XEN-GAP-0010 | —                          | —          | All L1        |      No       |
| XEN-GAP-0082 | `SELECT *` in 30+ raw SQL queries                          | XEN-GAP-0010 | —                          | —          | All L1        |      No       |
| XEN-GAP-0083 | Manual UPSERT (2 round-trips instead of 1)                 | XEN-GAP-0010 | —                          | —          | All L1        |      No       |
| XEN-GAP-0084 | Synchronous file I/O in async context (ai-service)         | XEN-GAP-0010 | —                          | —          | All L1        |      No       |
| XEN-GAP-0085 | Sequential multi-collection RAG retrieval                  | XEN-GAP-0010 | —                          | —          | All L1        |      No       |
| XEN-GAP-0064 | Prisma client imported in application layer                | XEN-GAP-0010 | —                          | —          | All L1        |      No       |

### Level 2 — Depends on Level 0–1

| ID           | Title                                                       | Depends On                                             | Blocks       | Blocked By   | Parallel With                            | Critical Path |
| ------------ | ----------------------------------------------------------- | ------------------------------------------------------ | ------------ | ------------ | ---------------------------------------- | :-----------: |
| XEN-GAP-0001 | Knowledge Factory module (empty — 0% implemented)           | XEN-GAP-0012, XEN-GAP-0056, XEN-GAP-0054               | —            | XEN-GAP-0012 | XEN-GAP-0011, XEN-GAP-0015, XEN-GAP-0016 |      No       |
| XEN-GAP-0012 | No RAG pipeline integration (knowledge → ai-service bridge) | XEN-GAP-0056, XEN-GAP-0054                             | XEN-GAP-0001 | XEN-GAP-0056 | XEN-GAP-0015, XEN-GAP-0016               |      No       |
| XEN-GAP-0013 | No multi-agent orchestration                                | XEN-GAP-0054, XEN-GAP-0055                             | —            | XEN-GAP-0054 | XEN-GAP-0015                             |      No       |
| XEN-GAP-0015 | No agent memory/safety/guardrails                           | XEN-GAP-0043, XEN-GAP-0054                             | —            | XEN-GAP-0054 | XEN-GAP-0013, XEN-GAP-0016               |      No       |
| XEN-GAP-0016 | No provenance/citation tracking                             | XEN-GAP-0054                                           | —            | XEN-GAP-0054 | XEN-GAP-0013, XEN-GAP-0015               |      No       |
| XEN-GAP-0039 | No MFA/account lockout                                      | XEN-GAP-0042                                           | —            | —            | XEN-GAP-0040                             |      No       |
| XEN-GAP-0029 | 215 Pydantic deprecation warnings (engineering-service)     | XEN-GAP-0006                                           | —            | —            | All L2                                   |      No       |
| XEN-GAP-0060 | No source grounding in chat responses (RAG context)         | XEN-GAP-0056                                           | —            | —            | XEN-GAP-0061                             |      No       |
| XEN-GAP-0061 | All memory in-memory (ephemeral state)                      | XEN-GAP-0043                                           | —            | —            | XEN-GAP-0060                             |      No       |
| XEN-GAP-0073 | Missing indexes on 10+ foreign-key columns                  | XEN-GAP-0070                                           | —            | —            | XEN-GAP-0074, XEN-GAP-0075               |      No       |
| XEN-GAP-0074 | 49+ String status fields should be Prisma enums             | XEN-GAP-0070                                           | —            | —            | XEN-GAP-0073, XEN-GAP-0075               |      No       |
| XEN-GAP-0075 | Missing `@updatedAt` on 15+ mutable models                  | XEN-GAP-0070                                           | —            | —            | XEN-GAP-0073, XEN-GAP-0074               |      No       |
| XEN-GAP-0079 | `is_admin` duplicates RBAC role system                      | XEN-GAP-0074                                           | —            | —            | All L2                                   |      No       |
| XEN-GAP-0080 | No Redis caching (subscription plan, permissions)           | XEN-GAP-0042                                           | —            | —            | All L2                                   |      No       |
| XEN-GAP-0003 | 20+ modules have zero tests (8.72% coverage)                | XEN-GAP-0006, XEN-GAP-0007, XEN-GAP-0065, XEN-GAP-0066 | —            | —            | All L2                                   |    **Yes**    |
| XEN-GAP-0021 | No feature branches (git workflow)                          | XEN-GAP-0004                                           | —            | —            | All L2                                   |      No       |
| XEN-GAP-0022 | No semantic versioning                                      | XEN-GAP-0004                                           | —            | —            | All L2                                   |      No       |
| XEN-GAP-0023 | No CHANGELOG.md                                             | XEN-GAP-0004                                           | —            | —            | All L2                                   |      No       |
| XEN-GAP-0024 | No CONTRIBUTING.md                                          | XEN-GAP-0019                                           | —            | —            | All L2                                   |      No       |
| XEN-GAP-0025 | No LICENSE.md                                               | XEN-GAP-0019                                           | —            | —            | All L2                                   |      No       |
| XEN-GAP-0026 | STATUS_REPORT.md stale                                      | XEN-GAP-0019                                           | —            | —            | All L2                                   |      No       |
| XEN-GAP-0027 | 9 knowledge/ subdirs empty                                  | XEN-GAP-0001                                           | —            | —            | All L2                                   |      No       |
| XEN-GAP-0028 | diagrams/ directory empty                                   | XEN-GAP-0019                                           | —            | —            | All L2                                   |      No       |
| XEN-GAP-0030 | Mixed test tooling (ts-jest vs tsx)                         | XEN-GAP-0005                                           | —            | —            | All L2                                   |      No       |

### Level 3 — Depends on Level 0–2

| ID           | Title                                                                | Depends On                 | Blocks | Blocked By | Parallel With | Critical Path |
| ------------ | -------------------------------------------------------------------- | -------------------------- | ------ | ---------- | ------------- | :-----------: |
| XEN-GAP-0011 | 5 enterprise modules empty (background, backup, config, performance) | XEN-GAP-0044, XEN-GAP-0070 | —      | —          | XEN-GAP-0001  |      No       |
| XEN-GAP-0072 | UUIDs stored as TEXT → native `@db.Uuid` (~40 tables)                | XEN-GAP-0070               | —      | —          | All L3        |      No       |
| XEN-GAP-0031 | JWT private key committed to git (rotate + remove)                   | XEN-GAP-0042               | —      | —          | All L3        |    **Yes**    |

### Level 4 — Depends on Level 0–3

| ID           | Title                                  | Depends On   | Blocks | Blocked By | Parallel With | Critical Path |
| ------------ | -------------------------------------- | ------------ | ------ | ---------- | ------------- | :-----------: |
| XEN-GAP-0078 | No ADR (Architecture Decision Records) | XEN-GAP-0019 | —      | —          | All L4        |      No       |

### Level 5 — Depends on Level 0–4

| ID           | Title                                         | Depends On                         | Blocks | Blocked By | Parallel With | Critical Path |
| ------------ | --------------------------------------------- | ---------------------------------- | ------ | ---------- | ------------- | :-----------: |
| XEN-GAP-0002 | 98 `throw new Error` → NestJS HTTP exceptions | Through XEN-GAP-0064, XEN-GAP-0065 | —      | —          | All L5        |      No       |

---

## Mermaid.js Dependency Graph

```mermaid
graph TD
  %% Level 0
  G010[XEN-GAP-0010: .gitignore venv]
  G008[XEN-GAP-0008: throttler devDep]
  G018[XEN-GAP-0018: shared no build]
  G019[XEN-GAP-0019: README wrong]
  G076[XEN-GAP-0076: platform-express]
  G077[XEN-GAP-0077: stale eslintrc]
  G005[XEN-GAP-0005: Lint broken]
  G007[XEN-GAP-0007: ai-service missing openai]
  G020[XEN-GAP-0020: pre-commit hooks]
  G032[XEN-GAP-0032: UserController no guards]
  G034[XEN-GAP-0034: Hard delete public]
  G033[XEN-GAP-0033: SSRF webhooks]
  G014[XEN-GAP-0014: No Helmet/CSP]
  G040[XEN-GAP-0040: No CSRF]
  G069[XEN-GAP-0069: CORS wildcard]
  G035[XEN-GAP-0035: encryption key]
  G037[XEN-GAP-0037: consultations isolation]
  G038[XEN-GAP-0038: PermissionsGuard fail-open]
  G036[XEN-GAP-0036: prompt injection]

  %% Level 1
  G041[XEN-GAP-0041: no graceful shutdown]
  G042[XEN-GAP-0042: no env validation]
  G006[XEN-GAP-0006: 15 Python tests fail]
  G009[XEN-GAP-0009: web build hangs]
  G062[XEN-GAP-0062: fake streaming]
  G065[XEN-GAP-0065: bare catch blocks]
  G066[XEN-GAP-0066: console.log]
  G051[XEN-GAP-0051: timer leaks]
  G057[XEN-GAP-0057: workspaceId typo]
  G058[XEN-GAP-0058: duplicate method]
  G059[XEN-GAP-0059: tools dead code]
  G056[XEN-GAP-0056: broken embeddings]
  G054[XEN-GAP-0054: agent no LLM]
  G055[XEN-GAP-0055: pipeline echo]
  G043[XEN-GAP-0043: unbounded stores]
  G044[XEN-GAP-0044: no transactions]
  G045[XEN-GAP-0045: no idempotency]
  G067[XEN-GAP-0067: large classes]
  G068[XEN-GAP-0068: pagination dup]
  G017[XEN-GAP-0017: any types]
  G070[XEN-GAP-0070: missing cascade]
  G071[XEN-GAP-0071: pwd_reset relation]
  G046[XEN-GAP-0046: mock production]
  G047[XEN-GAP-0047: ai repo silent]
  G049[XEN-GAP-0049: no probes]
  G052[XEN-GAP-0052: no OnModuleDestroy]
  G050[XEN-GAP-0050: no retry]
  G004[XEN-GAP-0004: no CI/CD]
  G053[XEN-GAP-0053: rate limit config]
  G063[XEN-GAP-0063: mock advice]
  G080[XEN-GAP-0080: no Redis cache]
  G081[XEN-GAP-0081: N+1 queries]
  G082[XEN-GAP-0082: SELECT *]
  G083[XEN-GAP-0083: manual UPSERT]
  G084[XEN-GAP-0084: sync file I/O]
  G085[XEN-GAP-0085: sequential RAG]
  G064[XEN-GAP-0064: prisma app layer]

  %% Level 2
  G001[XEN-GAP-0001: Knowledge Factory]
  G012[XEN-GAP-0012: RAG pipeline bridge]
  G013[XEN-GAP-0013: multi-agent orchestration]
  G015[XEN-GAP-0015: agent memory/safety]
  G016[XEN-GAP-0016: citation/provenance]
  G039[XEN-GAP-0039: MFA/account lockout]
  G029[XEN-GAP-0029: Pydantic warnings]
  G060[XEN-GAP-0060: no source grounding]
  G061[XEN-GAP-0061: memory ephemeral]
  G073[XEN-GAP-0073: missing indexes]
  G074[XEN-GAP-0074: string enums]
  G075[XEN-GAP-0075: missing updatedAt]
  G079[XEN-GAP-0079: is_admin dupe]
  G003[XEN-GAP-0003: zero tests 21 modules]

  %% Level 3
  G011[XEN-GAP-0011: enterprise modules empty]
  G072[XEN-GAP-0072: UUID as TEXT]
  G031[XEN-GAP-0031: JWT keys committed]

  %% Level 4
  G078[XEN-GAP-0078: no ADRs]
  G002[XEN-GAP-0002: throw Error]

  %% Dependencies
  G041 --> G010
  G042 --> G010
  G006 --> G010
  G009 --> G010
  G062 --> G010
  G065 --> G010
  G066 --> G010
  G051 --> G010
  G057 --> G010
  G058 --> G010
  G059 --> G010
  G056 --> G010
  G054 --> G010
  G055 --> G010
  G043 --> G010
  G044 --> G042
  G045 --> G042
  G067 --> G010
  G068 --> G010
  G017 --> G010
  G070 --> G010
  G071 --> G010
  G046 --> G010
  G047 --> G010
  G049 --> G041
  G052 --> G041
  G050 --> G010
  G004 --> G005
  G053 --> G042
  G063 --> G046
  G080 --> G042
  G081 --> G010
  G082 --> G010
  G083 --> G010
  G084 --> G010
  G085 --> G010
  G064 --> G010

  G001 --> G012
  G001 --> G056
  G001 --> G054
  G012 --> G056
  G012 --> G054
  G013 --> G054
  G013 --> G055
  G015 --> G043
  G015 --> G054
  G016 --> G054
  G039 --> G042
  G029 --> G006
  G060 --> G056
  G061 --> G043
  G073 --> G070
  G074 --> G070
  G075 --> G070
  G079 --> G074
  G003 --> G006
  G003 --> G007
  G003 --> G065
  G003 --> G066

  G011 --> G044
  G011 --> G070
  G072 --> G070
  G031 --> G042

  G078 --> G019
  G002 --> G064
  G002 --> G065

  %% Styling
  classDef critical fill:#ff4444,color:#fff
  classDef high fill:#ff8800,color:#fff
  classDef medium fill:#ffcc00,color:#000
  classDef low fill:#88ccff,color:#000
  class G032,G034,G033,G035,G037,G041,G042,G044,G046,G054,G055,G056,G057,G070,G031,G003,G005,G004 critical
  class G014,G036,G038,G065,G043,G045,G062,G064,G002,G012,G013,G015,G016,G060,G061 high
  class G039,G067,G068,G017,G073,G074,G075,G080,G081,G082,G083,G084,G085,G050,G053 medium
  class G010,G008,G018,G019,G076,G077,G007,G020,G040,G069,G009,G058,G059,G006,G047,G051,G052,G063,G029,G071,G079,G011,G072,G078,G066 low
```

---

## Dependency Level Summary

| Level | Count | Description                                      | Earliest Sprint |
| ----- | ----- | ------------------------------------------------ | --------------- |
| 0     | 20    | No dependencies — can start immediately          | Sprint 1        |
| 1     | 36    | Depends on Level 0 items (gitignore, lint, etc.) | Sprint 1–2      |
| 2     | 16    | Depends on Level 0–1 items                       | Sprint 3–4      |
| 3     | 3     | Depends on Level 0–2 items                       | Sprint 5        |
| 4     | 1     | Depends on Level 0–3 items                       | Sprint 6        |
| 5     | 1     | Depends on Level 0–4 items                       | Sprint 7        |

---

## Critical Path Gaps (Shortest Path to RC1)

The following gaps must be completed **in order** to reach RC1:

1. **XEN-GAP-0010** → `.gitignore` fix (foundation for all work)
2. **XEN-GAP-0005** → Lint working (enables CI/CD)
3. **XEN-GAP-0004** → CI/CD pipeline (enables automated verification)
4. **XEN-GAP-0032** → UserController guards (immediate security)
5. **XEN-GAP-0034** → Hard delete protection (immediate security)
6. **XEN-GAP-0033** → SSRF fix (immediate security)
7. **XEN-GAP-0035** → Encryption key management (immediate security)
8. **XEN-GAP-0037** → Workspace isolation (tenant security)
9. **XEN-GAP-0041** → Graceful shutdown (production reliability)
10. **XEN-GAP-0042** → Env validation (configuration reliability)
11. **XEN-GAP-0044** → Prisma transactions (data integrity)
12. **XEN-GAP-0046** → Remove mock fallback (AI safety)
13. **XEN-GAP-0057** → Fix workspaceId typo (AI functionality)
14. **XEN-GAP-0056** → Fix embeddings (RAG correctness)
15. **XEN-GAP-0054** → Real LLM calls (AI functionality)
16. **XEN-GAP-0055** → Real pipeline execution (AI functionality)
17. **XEN-GAP-0070** → Cascade deletes (data integrity)
18. **XEN-GAP-0003** → Test coverage (quality gate)
19. **XEN-GAP-0031** → Remove JWT from git (final security cleanup)

**Total Critical Path: ~19 gaps across 14 sprints**
