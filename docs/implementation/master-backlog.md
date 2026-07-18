# Master Backlog — Xennic Platform

**Generated:** 2026-07-02
**Source:** Gap Registry (100 gaps extracted from 25 audit documents)
**Order:** P0 first, then by dependency and priority

---

## P0 — Critical

| ID           | Title                                                    | Category       | Priority | Depends On                 | Effort (h) | Complexity | Risk     | Team Size | Sprint |
| ------------ | -------------------------------------------------------- | -------------- | -------- | -------------------------- | ---------- | ---------- | -------- | --------- | ------ |
| XEN-GAP-0001 | Secrets Committed to Git (JWT Keys, API Keys, Passwords) | Security       | P0       | —                          | 4          | Low        | Critical | 1         | S0     |
| XEN-GAP-0002 | UserController Has Zero Authentication Guards            | Security       | P0       | —                          | 1          | Low        | High     | 1         | S0     |
| XEN-GAP-0003 | SSRF Vulnerability in Webhook Delivery                   | Security       | P0       | —                          | 2          | Medium     | Critical | 1         | S0     |
| XEN-GAP-0004 | Hard Delete Endpoints Public with No Ownership Check     | Security       | P0       | —                          | 1          | Low        | High     | 1         | S0     |
| XEN-GAP-0005 | No Helmet/Security Headers                               | Security       | P0       | —                          | 1          | Low        | Medium   | 1         | S0     |
| XEN-GAP-0006 | Prompt Injection Vulnerability in AI Service             | Security       | P0       | —                          | 4          | Medium     | High     | 1         | S0     |
| XEN-GAP-0007 | Python AI Agent Never Calls LLM (Hardcoded Responses)    | AI             | P0       | —                          | 8          | Medium     | High     | 1         | S0     |
| XEN-GAP-0008 | NestJS Execution Pipeline Is a Mock Echo                 | AI             | P0       | XEN-GAP-0007               | 8          | Medium     | High     | 1         | S0     |
| XEN-GAP-0009 | Dummy Embeddings All Identical (Broken RAG)              | AI             | P0       | —                          | 2          | Low        | Critical | 1         | S0     |
| XEN-GAP-0010 | No Graceful Shutdown Handling                            | Runtime        | P0       | —                          | 2          | Low        | Medium   | 1         | S1     |
| XEN-GAP-0011 | No Environment Variable Validation                       | Infrastructure | P0       | —                          | 4          | Low        | High     | 1         | S1     |
| XEN-GAP-0012 | Unbounded In-Memory Stores (OOM Risk)                    | Performance    | P0       | —                          | 16         | High       | High     | 1         | S1     |
| XEN-GAP-0013 | No Prisma Transactions (Data Inconsistency)              | Database       | P0       | —                          | 12         | Medium     | High     | 1         | S1     |
| XEN-GAP-0014 | No Idempotency on POST Endpoints                         | API            | P0       | —                          | 8          | Medium     | High     | 1         | S1     |
| XEN-GAP-0015 | Mock Fallback in LlmProvider (Silent Data Corruption)    | AI             | P0       | —                          | 2          | Low        | High     | 1         | S0     |
| XEN-GAP-0016 | DB Errors Silently Swallowed (AiRepository)              | Database       | P0       | —                          | 2          | Low        | High     | 1         | S0     |
| XEN-GAP-0017 | Timer Leaks in Engineering and Vision Client Services    | Runtime        | P0       | —                          | 2          | Low        | Medium   | 1         | S0     |
| XEN-GAP-0018 | No Readiness/Liveness Probes for Kubernetes              | Infrastructure | P0       | —                          | 4          | Medium     | Medium   | 1         | S1     |
| XEN-GAP-0019 | Consultations Module Missing Workspace Isolation         | Security       | P0       | —                          | 1          | Low        | High     | 1         | S0     |
| XEN-GAP-0020 | No Redis Caching Layer                                   | Performance    | P0       | —                          | 20         | High       | Medium   | 2         | S1     |
| XEN-GAP-0021 | Fake Streaming (No Real SSE)                             | AI             | P0       | XEN-GAP-0007, XEN-GAP-0008 | 12         | High       | Medium   | 1         | S5     |

## P1 — High

| ID           | Title                                                 | Category     | Priority | Depends On                 | Effort (h) | Complexity | Risk      | Team Size | Sprint |
| ------------ | ----------------------------------------------------- | ------------ | -------- | -------------------------- | ---------- | ---------- | --------- | --------- | ------ |
| XEN-GAP-0022 | PermissionsGuard Fail-Open (Security Bypass)          | Security     | P1       | —                          | 2          | Low        | Medium    | 1         | S2     |
| XEN-GAP-0023 | Duplicate `analyze_document()` Method Override        | AI           | P1       | —                          | 0.5        | Low        | Low       | 1         | S0     |
| XEN-GAP-0024 | `req.workspaceId` Typo in ai-runtime Controller       | AI           | P1       | —                          | 0.2        | Low        | Medium    | 1         | S0     |
| XEN-GAP-0025 | No Cross-Encoder Re-Ranking in RAG                    | AI           | P1       | XEN-GAP-0026               | 8          | Medium     | Low       | 1         | S5     |
| XEN-GAP-0026 | No Hybrid Search (Dense + Sparse)                     | AI           | P1       | XEN-GAP-0009               | 12         | High       | Medium    | 1         | S5     |
| XEN-GAP-0027 | No RAG Context Injection in Chat                      | AI           | P1       | XEN-GAP-0007, XEN-GAP-0026 | 8          | Medium     | Medium    | 1         | S5     |
| XEN-GAP-0028 | All Python Tool Functions Are Dead Code               | AI           | P1       | XEN-GAP-0007               | 8          | Medium     | Medium    | 1         | S5     |
| XEN-GAP-0029 | No Citation Engine                                    | AI           | P1       | XEN-GAP-0027               | 12         | High       | Medium    | 1         | S5     |
| XEN-GAP-0030 | No Hallucination Guardrails                           | AI           | P1       | XEN-GAP-0027               | 16         | High       | High      | 1         | S5     |
| XEN-GAP-0031 | No Evidence Chain / Provenance Tracking               | AI           | P1       | XEN-GAP-0029               | 8          | Medium     | Low       | 1         | S5     |
| XEN-GAP-0032 | No Confidence Engine                                  | AI           | P1       | XEN-GAP-0030               | 12         | High       | Medium    | 1         | S5     |
| XEN-GAP-0033 | No Conflict Resolution for RAG Sources                | AI           | P1       | XEN-GAP-0031               | 12         | High       | Low       | 1         | S5     |
| XEN-GAP-0034 | No Token-Aware Chunking                               | AI           | P1       | —                          | 6          | Medium     | Low       | 1         | S5     |
| XEN-GAP-0035 | N+1 Query Patterns                                    | Performance  | P1       | —                          | 8          | Medium     | Medium    | 1         | S3     |
| XEN-GAP-0036 | 30+ `SELECT *` in Raw SQL Queries                     | Performance  | P1       | —                          | 4          | Low        | Low       | 1         | S3     |
| XEN-GAP-0037 | Manual UPSERT Instead of Prisma Native                | Performance  | P1       | —                          | 2          | Low        | Low       | 1         | S3     |
| XEN-GAP-0038 | Raw SQL Instead of Prisma Client (AiRepository)       | Database     | P1       | —                          | 8          | Medium     | Medium    | 1         | S3     |
| XEN-GAP-0039 | Sequential Multi-Collection RAG Retrieval             | Performance  | P1       | —                          | 2          | Low        | Low       | 1         | S5     |
| XEN-GAP-0040 | Synchronous File I/O in Async Context (file_store.py) | Performance  | P1       | —                          | 2          | Low        | Low       | 1         | S3     |
| XEN-GAP-0041 | Full Content Loaded in List Views                     | Performance  | P1       | —                          | 2          | Low        | Low       | 1         | S3     |
| XEN-GAP-0042 | Qdrant `wait=True` on Every Upsert                    | Performance  | P1       | —                          | 1          | Low        | Low       | 1         | S3     |
| XEN-GAP-0043 | Missing Cascade Deletes on 20+ Prisma Relations       | Database     | P1       | —                          | 8          | Medium     | High      | 1         | S3     |
| XEN-GAP-0044 | 49+ String Fields Should Be Prisma Enums              | Database     | P1       | —                          | 16         | Medium     | Medium    | 1         | S6     |
| XEN-GAP-0045 | UUIDs Stored as TEXT Instead of `@db.Uuid`            | Database     | P1       | XEN-GAP-0043               | 24         | High       | Very High | 1         | S5     |
| XEN-GAP-0046 | Missing Foreign Key Indexes (10+ FKs)                 | Performance  | P1       | —                          | 2          | Low        | Low       | 1         | S3     |
| XEN-GAP-0055 | Prisma Client Leaked into Application Layer           | Architecture | P1       | —                          | 12         | Medium     | Medium    | 1         | S4     |
| XEN-GAP-0059 | No CI/CD Pipeline                                     | DevOps       | P1       | XEN-GAP-0060               | 16         | High       | Low       | 1         | S7     |
| XEN-GAP-0060 | Lint Broken for 4 of 6 Packages                       | DevOps       | P1       | —                          | 8          | Medium     | Low       | 1         | S7     |
| XEN-GAP-0061 | 95 Bare `catch` Blocks Silently Swallowing Errors     | Code Quality | P1       | —                          | 8          | Low        | Medium    | 1         | S4     |
| XEN-GAP-0062 | 54 `console.*` Calls Instead of Structured Logger     | Code Quality | P1       | —                          | 4          | Low        | Low       | 1         | S4     |
| XEN-GAP-0063 | 50+ `as any` Casts Bypassing Type Safety              | Code Quality | P1       | —                          | 20         | Medium     | Medium    | 1         | S4     |
| XEN-GAP-0064 | 6 Classes Over 300 Lines (SRP Violations)             | Code Quality | P1       | —                          | 24         | High       | Medium    | 1         | S4     |
| XEN-GAP-0066 | CORS `["*"]` in Python Microservices                  | Security     | P1       | —                          | 1          | Low        | Medium    | 1         | S2     |
| XEN-GAP-0081 | 15 Python Tests Failing in Engineering Service        | Testing      | P1       | —                          | 8          | Medium     | Medium    | 1         | S0     |
| XEN-GAP-0082 | 21 of 27 API Modules Have Zero Tests                  | Testing      | P1       | —                          | 200        | High       | Low       | 2         | S6     |
| XEN-GAP-0083 | No Frontend Tests (apps/web)                          | Testing      | P1       | —                          | 40         | Medium     | Low       | 1         | S6     |

## P2 — Medium

| ID           | Title                                                               | Category       | Priority | Depends On   | Effort (h) | Complexity | Risk   | Team Size | Sprint |
| ------------ | ------------------------------------------------------------------- | -------------- | -------- | ------------ | ---------- | ---------- | ------ | --------- | ------ |
| XEN-GAP-0047 | Missing Composite Indexes for Common Query Patterns                 | Database       | P2       | —            | 2          | Low        | Low    | 1         | S3     |
| XEN-GAP-0048 | Missing `@updatedAt` on Mutable Models                              | Database       | P2       | —            | 4          | Low        | Low    | 1         | S6     |
| XEN-GAP-0049 | In-Memory Analytics Sorting (CPU Hotspot)                           | Performance    | P2       | —            | 2          | Low        | Low    | 1         | S3     |
| XEN-GAP-0050 | No Circuit Breaker for External Services                            | Runtime        | P2       | —            | 8          | Medium     | Low    | 1         | S3     |
| XEN-GAP-0051 | OpenAPI Regenerated on Every Build                                  | DevOps         | P2       | —            | 2          | Low        | Low    | 1         | S7     |
| XEN-GAP-0052 | Cross-Module Coupling Causing Eager Loading                         | Architecture   | P2       | —            | 4          | Medium     | Low    | 1         | S4     |
| XEN-GAP-0053 | Pretty-Printed JSON in LLM Prompts                                  | Performance    | P2       | —            | 1          | Low        | Low    | 1         | S3     |
| XEN-GAP-0054 | `health` Module Flat Structure (No DDD)                             | Architecture   | P2       | —            | 2          | Low        | Low    | 1         | S8     |
| XEN-GAP-0056 | `AiService` Depends on `LlmProvider` Directly (Infrastructure Leak) | Architecture   | P2       | —            | 3          | Low        | Low    | 1         | S4     |
| XEN-GAP-0057 | 5 Enterprise Stub Modules Empty                                     | Architecture   | P2       | —            | 80         | High       | Low    | 2         | S4     |
| XEN-GAP-0058 | `@nestjs/platform-express` Dead Dependency                          | Infrastructure | P2       | —            | 0.2        | Low        | Low    | 1         | S1     |
| XEN-GAP-0065 | Pagination Boilerplate Duplicated ~25 Times                         | Code Quality   | P2       | —            | 4          | Low        | Low    | 1         | S4     |
| XEN-GAP-0067 | `password_reset_tokens` Has No Relation to `users`                  | Database       | P2       | —            | 0.5        | Low        | Low    | 1         | S3     |
| XEN-GAP-0068 | `user_roles` Has No Relation to `workspace`                         | Database       | P2       | —            | 0.5        | Low        | Low    | 1         | S3     |
| XEN-GAP-0070 | No MFA/2FA Support                                                  | Security       | P2       | —            | 12         | Medium     | Low    | 1         | S2     |
| XEN-GAP-0071 | No Account Lockout After Failed Attempts                            | Security       | P2       | —            | 4          | Medium     | Low    | 1         | S2     |
| XEN-GAP-0072 | No Audit Trail for Security Events                                  | Security       | P2       | —            | 4          | Low        | Low    | 1         | S2     |
| XEN-GAP-0073 | No Request ID / Distributed Tracing                                 | Observability  | P2       | —            | 4          | Low        | Low    | 1         | S7     |
| XEN-GAP-0074 | Magic Numbers / Hardcoded Constants Scattered                       | Code Quality   | P2       | —            | 4          | Low        | Low    | 1         | S4     |
| XEN-GAP-0075 | No Pre-Commit Hooks                                                 | DevOps         | P2       | —            | 2          | Low        | Low    | 1         | S7     |
| XEN-GAP-0076 | `venv/` Not in `.gitignore` (Git Pollution)                         | DevOps         | P2       | —            | 0.2        | Low        | Low    | 1         | S0     |
| XEN-GAP-0077 | Backpressure Not Handled for Streaming                              | Runtime        | P2       | —            | 12         | Medium     | Low    | 1         | S1     |
| XEN-GAP-0078 | No `OnModuleDestroy` Lifecycle Hooks                                | Runtime        | P2       | XEN-GAP-0010 | 4          | Low        | Low    | 1         | S1     |
| XEN-GAP-0079 | No Retry Policy for External HTTP Calls                             | Runtime        | P2       | —            | 6          | Low        | Low    | 1         | S1     |
| XEN-GAP-0080 | No `@nestjs/config` Initialized                                     | Infrastructure | P2       | —            | 6          | Low        | Medium | 1         | S1     |
| XEN-GAP-0084 | No Integration/E2E Tests for Core Flows                             | Testing        | P2       | XEN-GAP-0082 | 40         | Medium     | Low    | 1         | S6     |
| XEN-GAP-0085 | No Concurrency/Race Condition Tests                                 | Testing        | P2       | XEN-GAP-0082 | 16         | Medium     | Low    | 1         | S6     |
| XEN-GAP-0086 | `README.md` Is a Security Document (Misleading)                     | Documentation  | P2       | —            | 4          | Low        | Low    | 1         | S8     |
| XEN-GAP-0089 | `packages/shared` and `packages/types` Underutilized                | Code Quality   | P2       | —            | 8          | Low        | Low    | 1         | S4     |
| XEN-GAP-0090 | Spec Files Excluded from tsconfig (ESLint Errors)                   | Code Quality   | P2       | —            | 1          | Low        | Low    | 1         | S1     |
| XEN-GAP-0091 | No Security Headers (Helmet) in Python Services                     | Security       | P2       | —            | 2          | Low        | Low    | 1         | S2     |
| XEN-GAP-0092 | AuthThrottlerGuard Not Applied to Auth Controller                   | Security       | P2       | —            | 0.5        | Low        | Low    | 1         | S2     |
| XEN-GAP-0093 | No Token-Aware Chunking / Hierarchical Chunking                     | AI             | P2       | —            | 6          | Medium     | Low    | 1         | S5     |
| XEN-GAP-0094 | Document Deduplication Not Implemented                              | AI             | P2       | —            | 3          | Low        | Low    | 1         | S5     |
| XEN-GAP-0095 | RAG Cache Unbounded with No TTL                                     | Performance    | P2       | —            | 4          | Low        | Low    | 1         | S5     |
| XEN-GAP-0096 | No Bull/Queue for Background Jobs                                   | Infrastructure | P2       | —            | 24         | High       | Low    | 1         | S7     |
| XEN-GAP-0099 | No Global `X-Request-ID` Tracing                                    | Observability  | P2       | —            | 4          | Low        | Low    | 1         | S7     |
| XEN-GAP-0100 | `@nestjs/throttler` in devDependencies Instead of dependencies      | Infrastructure | P2       | —            | 0.2        | Low        | Low    | 1         | S0     |

## P3 — Low

| ID           | Title                                                                | Category      | Priority | Depends On | Effort (h) | Complexity | Risk   | Team Size | Sprint |
| ------------ | -------------------------------------------------------------------- | ------------- | -------- | ---------- | ---------- | ---------- | ------ | --------- | ------ |
| XEN-GAP-0069 | Missing `@map`/`@@schema` Annotations for Better Schema Organization | Database      | P3       | —          | 2          | Low        | Low    | 1         | S8     |
| XEN-GAP-0087 | No ADR (Architecture Decision Records)                               | Documentation | P3       | —          | 4          | Low        | Low    | 1         | S8     |
| XEN-GAP-0088 | Stale `.eslintrc.cjs` Coexists with `eslint.config.mjs`              | Code Quality  | P3       | —          | 0.2        | Low        | Low    | 1         | S1     |
| XEN-GAP-0097 | No `.nvmrc` or `.node-version` Files                                 | DevOps        | P3       | —          | 0.2        | Low        | Low    | 1         | S8     |
| XEN-GAP-0098 | `is_admin` Duplicates RBAC System                                    | Architecture  | P3       | —          | 8          | Medium     | Medium | 1         | S6     |

---

## Summary

| Priority  | Count   | Total Effort (h) |
| --------- | ------- | ---------------- |
| P0        | 21      | 116              |
| P1        | 35      | 496              |
| P2        | 39      | 269              |
| P3        | 5       | 14               |
| **Total** | **100** | **~895**         |

## Sprint Plan

| Sprint | Theme                                         | Gaps                                                        | Hours |
| ------ | --------------------------------------------- | ----------------------------------------------------------- | ----- |
| S0     | Stop the Bleeding (Security + Critical fixes) | 0001-0007, 0015-0017, 0019, 0023-0024, 0076, 0081, 0100     | 35    |
| S1     | Foundation (Production Readiness)             | 0010-0014, 0018, 0020, 0058, 0077-0080, 0088, 0090          | 93    |
| S2     | Security Hardening                            | 0022, 0066, 0070-0072, 0091-0092                            | 27    |
| S3     | Data Layer (Schema + Indexes)                 | 0035-0038, 0040-0043, 0046-0047, 0049-0050, 0053, 0067-0068 | 43    |
| S4     | Code Quality                                  | 0052, 0055-0057, 0061-0065, 0089                            | 139   |
| S5     | AI Quality                                    | 0008, 0021, 0025-0034, 0039, 0093-0095                      | 103   |
| S6     | Testing                                       | 0044, 0082-0085, 0098                                       | 281   |
| S7     | DevOps                                        | 0051, 0059-0060, 0073, 0075, 0096, 0099                     | 58    |
| S8     | Polish                                        | 0048, 0054, 0069, 0086-0087, 0097                           | 13    |

---

**Dependency Graph (Key Chains):**

- AI Pipeline: XEN-GAP-0007 → XEN-GAP-0008 → XEN-GAP-0021 → XEN-GAP-0028
- RAG Quality: XEN-GAP-0009 → XEN-GAP-0026 → XEN-GAP-0027 → XEN-GAP-0029 → XEN-GAP-0030 → XEN-GAP-0031 → XEN-GAP-0032 → XEN-GAP-0033
- Database: XEN-GAP-0043 → XEN-GAP-0045
- Runtime: XEN-GAP-0010 → XEN-GAP-0078
- Testing: XEN-GAP-0082 → XEN-GAP-0084, XEN-GAP-0085
- DevOps: XEN-GAP-0060 → XEN-GAP-0059
