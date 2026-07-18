# Quality Gates — Xennic Platform Implementation

**Version:** 1.0
**Last Updated:** 2026-07-02
**Authority:** Program Architecture Board
**Scope:** All modules, services, and deliverables in the Xennic monorepo

---

## Table of Contents

1. [Purpose & Principles](#1-purpose--principles)
2. [Gate Overview](#2-gate-overview)
3. [Gate 1 — Architecture Gate](#3-gate-1--architecture-gate)
4. [Gate 2 — Security Gate](#4-gate-2--security-gate)
5. [Gate 3 — Performance Gate](#5-gate-3--performance-gate)
6. [Gate 4 — AI Gate](#6-gate-4--ai-gate)
7. [Gate 5 — Testing Gate](#7-gate-5--testing-gate)
8. [Gate 6 — Documentation Gate](#8-gate-6--documentation-gate)
9. [Gate 7 — Release Gate (Final)](#9-gate-7--release-gate-final)
10. [Gate Passport Template](#10-gate-passport-template)
11. [Appendices](#11-appendices)

---

## 1. Purpose & Principles

### 1.1 Why Quality Gates

Quality gates are mandatory, phase-gated checkpoints that every deliverable must pass before proceeding to the next implementation phase. They prevent defect propagation, enforce architectural consistency, and ensure that the Xennic platform meets production-grade standards at every milestone.

### 1.2 Governing Principles

| Principle                  | Description                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Gate before phase**      | No phase begins until its preceding gate passes. Exceptions require Architecture Board override (see §11.4).                    |
| **Evidence-based**         | Every check requires objective evidence (tool output, scan report, peer-reviewed document). Self-attestation is not sufficient. |
| **No retroactive waiver**  | A failing criterion cannot be waived because "it will be fixed later." The gate fails; the fix must happen now.                 |
| **Single source of truth** | All gate results are recorded in the Gate Passport (§10). No parallel tracking.                                                 |
| **Audit trail**            | Every gate produces an immutable artifact stored in `docs/governance/gates/<gate-name>/<date>-result.md`.                       |
| **Escalation path**        | Blocked teams escalate via the appeal process (§11.4), not by bypassing the gate.                                               |

### 1.3 Gate Lifecycle

```
Planned → In Review → Passed / Failed → (if Failed) Remediation → Re-check → Passed
```

---

## 2. Gate Overview

| #   | Gate                 | Checked Before                              | Threshold                            | Review Board               |
| --- | -------------------- | ------------------------------------------- | ------------------------------------ | -------------------------- |
| 1   | Architecture Gate    | Phase 1 Start, Phase 5 AI Start             | ≥70% architecture score              | Architecture Board         |
| 2   | Security Gate        | Phase 2 Security Sprint, Phase 3 Data Layer | ZERO open CRITICAL issues            | Security Review Board      |
| 3   | Performance Gate     | Phase 3 Data Layer, Phase 6 Testing         | ≥60% performance score               | Performance Review Board   |
| 4   | AI Gate              | Phase 5 AI Implementation                   | AI pipeline end-to-end verified      | AI Review Board            |
| 5   | Testing Gate         | Phase 6 Testing Sprint, Phase 8 Release     | ≥60% module coverage, 100% pass rate | QA Review Board            |
| 6   | Documentation Gate   | Phase 8 Release                             | No gaps in required documentation    | Documentation Review Board |
| 7   | Release Gate (Final) | RC1                                         | 100% of gates pass                   | Program Architecture Board |

### 2.1 Phase-to-Gate Map

```
Phase 0 (Foundation)
  ↓
[Architecture Gate]
  ↓
Phase 1 (Core Implementation)
  ↓
[Security Gate]
  ↓
Phase 2 (Security Sprint)
  ↓
Phase 3 (Data Layer) ──→ [Performance Gate]
  ↓
[Security Gate] (re-check)
  ↓
Phase 4 (Engineering & Refinement)
  ↓
[Architecture Gate] (re-check) ──→ [AI Gate]
  ↓
Phase 5 (AI Implementation)
  ↓
[Testing Gate] ──→ [Performance Gate] (re-check)
  ↓
Phase 6 (Testing Sprint)
  ↓
Phase 7 (Hardening)
  ↓
[Documentation Gate] ──→ [Testing Gate] (re-check)
  ↓
Phase 8 (Release Preparation)
  ↓
[Release Gate]
  ↓
RC1
```

---

## 3. Gate 1 — Architecture Gate

### 3.1 Identification

| Field                     | Value                                                         |
| ------------------------- | ------------------------------------------------------------- |
| **Gate ID**               | GATE-ARCH-001                                                 |
| **Gate Name**             | Architecture Gate                                             |
| **Checked Before**        | Phase 1 Implementation Start, Phase 5 AI Implementation Start |
| **Review Board**          | Architecture Board (see §3.6)                                 |
| **Passing Threshold**     | ≥70% architecture score                                       |
| **Re-check Timing**       | 5 working days after remediation submission                   |
| **Max Re-check Attempts** | 3                                                             |

### 3.2 Detailed Checklist (25 items)

#### Domain-Driven Design Compliance (6 items)

- [ ] ARCH-01: All modules follow DDD structure: `domain/`, `application/`, `infrastructure/`, `presentation/` layers
- [ ] ARCH-02: Domain layer has zero dependencies on infrastructure (no imports from `infrastructure/`, `typeorm`, `prisma`, `http`)
- [ ] ARCH-03: All domain entities use Ubiquitous Language matching the Xennic Domain Glossary
- [ ] ARCH-04: Domain services contain business logic; application services contain orchestration only
- [ ] ARCH-05: Aggregates enforce consistency boundaries — cross-aggregate operations use domain events
- [ ] ARCH-06: Value objects are immutable; no setters on value objects

#### Module Isolation (5 items)

- [ ] ARCH-07: Each module is independently instantiable via its own `Module` definition
- [ ] ARCH-08: No circular imports between modules (verified via `madge` or dependency-cruiser)
- [ ] ARCH-09: Module boundary tested — removing the module does not break other modules (compilation test)
- [ ] ARCH-10: Shared kernel is extracted to `@xennic/common` or equivalent shared package
- [ ] ARCH-11: Cross-module communication uses events/messages, not direct service imports

#### Dependency Direction (4 items)

- [ ] ARCH-12: Dependency graph is acyclic at the module level (verified via `depcruise`)
- [ ] ARCH-13: Upper-layer modules depend on lower-layer modules only (Presentation → Application → Domain)
- [ ] ARCH-14: `infrastructure/` depends on `domain/` only — never the reverse
- [ ] ARCH-15: External library dependencies are abstracted behind ports (interfaces) in the domain layer

#### Infrastructure Leakage (5 items)

- [ ] ARCH-16: No framework decorators in domain entities (`@Entity`, `@Column`, `@ObjectType` are in infrastructure)
- [ ] ARCH-17: No HTTP request/response objects cross the application boundary into domain services
- [ ] ARCH-18: Database transactions are managed at application layer, not in domain logic
- [ ] ARCH-19: Serialization/deserialization is handled by infrastructure adapters, not domain models
- [ ] ARCH-20: All external API calls go through port interfaces; implementations live in `infrastructure/adapters/`

#### Interface Purity (5 items)

- [ ] ARCH-21: All ports (interfaces) are defined in the domain layer under `domain/ports/`
- [ ] ARCH-22: Port interfaces are persistence-technology-agnostic (no Prisma types, no ORM-specific return types)
- [ ] ARCH-23: Controllers inject application service interfaces, not concrete implementations
- [ ] ARCH-24: Repository interfaces return domain aggregates, not ORM entities
- [ ] ARCH-25: Interface segregation applied — no fat interfaces; clients depend only on methods they use

### 3.3 Scoring Methodology

| Dimension              | Weight   | Items  | Score Calculation           |
| ---------------------- | -------- | ------ | --------------------------- |
| DDD Compliance         | 30%      | 6      | `(passed / 6) × 30`         |
| Module Isolation       | 25%      | 5      | `(passed / 5) × 25`         |
| Dependency Direction   | 20%      | 4      | `(passed / 4) × 20`         |
| Infrastructure Leakage | 15%      | 5      | `(passed / 5) × 15`         |
| Interface Purity       | 10%      | 5      | `(passed / 5) × 10`         |
| **Total**              | **100%** | **25** | **Sum of dimension scores** |

**Partial credit per item:** 0 or 1. No half points. An item passes only when all sub-requirements are met.

**Tool-assisted verification:**

| Check               | Tool / Method                            |
| ------------------- | ---------------------------------------- |
| Cyclic dependencies | `depcruise` or `madge`                   |
| Layer violations    | `dependency-cruiser` with custom rules   |
| Framework leakage   | Manual code review + `ts-morph` AST scan |
| Module isolation    | Compilation test: remove module, rebuild |
| Interface purity    | Manual review with Architecture Board    |

### 3.4 Pass / Fail Rules

| Score  | Result                                                                         |
| ------ | ------------------------------------------------------------------------------ |
| ≥70%   | **PASS** — proceed to next phase                                               |
| 50–69% | **CONDITIONAL PASS** — pass with corrective action plan; re-check at next gate |
| <50%   | **FAIL** — stop; remediation plan required; re-check in 5 working days         |

### 3.5 Consequences of Failure

- Phase start is blocked until the gate passes.
- Architecture Board issues a formal Architecture Remediation Order (ARO).
- failed items are logged in the Technical Debt Register with CRITICAL severity.
- Sprint planning must allocate capacity to address ARO items before any new feature work.

### 3.6 Review Board Composition

| Role                               | Person / Team             | Vote Weight |
| ---------------------------------- | ------------------------- | ----------- |
| Chief Architect (Chair)            | TBD                       | 2           |
| Domain Architect (per module)      | TBD                       | 1           |
| Senior Engineer (peer, non-module) | TBD                       | 1           |
| Quality Assurance Representative   | TBD                       | 1           |
| **Minimum quorum**                 | 3 members including Chair | —           |

### 3.7 How to Document Gate Results

Each gate review produces an artifact at:

```
docs/governance/gates/architecture/<YYYY-MM-DD>-result.md
```

**Template:**

```markdown
# Architecture Gate Result — <YYYY-MM-DD>

**Module(s) Reviewed:** <module names>
**Review Lead:** <name>
**Review Date:** <date>
**Pass/Fail:** <PASS | CONDITIONAL PASS | FAIL>

## Score Summary

| Dimension              | Items Passed | Total Items | Weight   | Score |
| ---------------------- | ------------ | ----------- | -------- | ----- |
| DDD Compliance         |              | /6          | 30%      |       |
| Module Isolation       |              | /5          | 25%      |       |
| Dependency Direction   |              | /4          | 20%      |       |
| Infrastructure Leakage |              | /5          | 15%      |       |
| Interface Purity       |              | /5          | 10%      |       |
| **Total**              |              | **/25**     | **100%** | **%** |

## Item Detail

- [x] ARCH-01: passed
- [ ] ARCH-02: FAILED — domain layer imports from @nestjs/common
      ...

## Issues Found

| ID      | Item                     | Severity | Owner | Due        |
| ------- | ------------------------ | -------- | ----- | ---------- |
| ARCH-02 | Domain imports framework | CRITICAL | @user | YYYY-MM-DD |

## Remediation Plan (if failed)

...
```

### 3.8 Appeal Process

See §11.4 (Appendices — Appeal Process).

---

## 4. Gate 2 — Security Gate

### 4.1 Identification

| Field                     | Value                                              |
| ------------------------- | -------------------------------------------------- |
| **Gate ID**               | GATE-SEC-001                                       |
| **Gate Name**             | Security Gate                                      |
| **Checked Before**        | Phase 2 Security Sprint, Phase 3 Data Layer Sprint |
| **Review Board**          | Security Review Board (see §4.6)                   |
| **Passing Threshold**     | ZERO open CRITICAL issues                          |
| **Re-check Timing**       | 3 working days after remediation submission        |
| **Max Re-check Attempts** | 3                                                  |

### 4.2 Detailed Checklist (25 items)

#### Authentication & Authorization (6 items)

- [ ] SEC-01: All endpoints have authentication guards; no endpoint is publicly accessible without explicit justification documented in ADR
- [ ] SEC-02: Guards are fail-closed — any error in guard evaluation results in denial, not access
- [ ] SEC-03: Workspace isolation enforced via WorkspaceGuard on all multi-tenant endpoints
- [ ] SEC-04: Role-based access control uses least privilege; no role has `*` permissions unless explicitly approved
- [ ] SEC-05: JWT tokens rotated on refresh; access tokens have short expiry (≤15 minutes); refresh tokens have reasonable expiry (≤7 days)
- [ ] SEC-06: Password policies enforced: minimum length ≥12, hashed with Argon2id, no plaintext logging

#### Vulnerability Management (5 items)

- [ ] SEC-07: All CRITICAL and HIGH severity vulnerabilities from `npm audit`, `pnpm audit`, and `pip-audit` are resolved
- [ ] SEC-08: No known CVEs in production dependencies (verified via `snyk test --all-projects` or equivalent)
- [ ] SEC-09: Static Application Security Testing (SAST) scan passed with zero CRITICAL findings (SonarQube / Semgrep)
- [ ] SEC-10: Secrets detection scan passed (truffleHog / GitLeaks) — no keys, tokens, or passwords in codebase
- [ ] SEC-11: Software Bill of Materials (SBOM) generated and reviewed for prohibited licenses

#### Input Validation & Sanitization (5 items)

- [ ] SEC-12: All endpoints use DTO validation with `whitelist: true` and `forbidNonWhitelisted: true`
- [ ] SEC-13: No raw user input is passed to database queries (parameterized queries / Prisma prepared statements only)
- [ ] SEC-14: File upload endpoints validate MIME type, file size (≤10 MB), and scan with ClamAV or equivalent
- [ ] SEC-15: Prompt injection guardrails in place for all LLM-facing endpoints (input sanitization, rate limiting, role enforcement)
- [ ] SEC-16: All redirect URLs are validated against an allowlist; open redirects are prohibited

#### Data Protection (5 items)

- [ ] SEC-17: Personally Identifiable Information (PII) fields are identified and tagged in the data model
- [ ] SEC-18: PII is encrypted at rest; encryption keys stored in secrets manager, not in code
- [ ] SEC-19: All API responses exclude sensitive fields (passwords, tokens, secrets) — verified via response audit
- [ ] SEC-20: Database connection strings, API keys, and secrets are injected via environment variables — no hardcoded values
- [ ] SEC-21: Audit logging for all auth-related events (login, logout, password change, permission change)

#### Operational Security (4 items)

- [ ] SEC-22: Rate limiting is configured on all auth endpoints (login, register, forgot-password) — ThrottlerModule active
- [ ] SEC-23: CORS is restricted to known origins; no `Access-Control-Allow-Origin: *` in production
- [ ] SEC-24: Helmet or equivalent HTTP header security middleware is enabled in production
- [ ] SEC-25: Health check and debug endpoints are disabled or authenticated in production builds

### 4.3 Scoring Methodology

**Binary gate — all items must pass.** This is not a scored gate.

| Criterion                    | Result          |
| ---------------------------- | --------------- |
| All CRITICAL issues resolved | Mandatory       |
| All HIGH issues resolved     | Mandatory       |
| Zero secrets in codebase     | Mandatory       |
| No fail-open guards          | Mandatory       |
| **Any item failing**         | **GATE FAILED** |

For MEDIUM/LOW issues: logged in Technical Debt Register but do not block the gate.

### 4.4 Pass / Fail Rules

| Result                                         | Action                                     |
| ---------------------------------------------- | ------------------------------------------ |
| ZERO open CRITICAL items, ZERO open HIGH items | **PASS**                                   |
| Any open CRITICAL item                         | **FAIL** — stop immediately                |
| Any open HIGH item                             | **FAIL** — stop immediately                |
| ZERO CRITICAL/HIGH but any fail-open guard     | **FAIL** — security architecture violation |

### 4.5 Consequences of Failure

- All feature work in the affected module stops.
- Security Review Board issues a Security Remediation Order (SRO).
- The vulnerability must be patched within 48 hours for CRITICAL, 5 working days for HIGH.
- Escalation to CISO if remediation exceeds timeline.

### 4.6 Review Board Composition

| Role                          | Person / Team             | Vote Weight           |
| ----------------------------- | ------------------------- | --------------------- |
| Security Lead (Chair)         | TBD                       | 2                     |
| Infrastructure Engineer       | TBD                       | 1                     |
| Application Security Engineer | TBD                       | 1                     |
| Module Lead (affected module) | TBD                       | 1 (advisory, no vote) |
| **Minimum quorum**            | 3 members including Chair | —                     |

### 4.7 How to Document Gate Results

```
docs/governance/gates/security/<YYYY-MM-DD>-result.md
```

Includes: scan reports, vulnerability list, remediation assignments, re-check date.

### 4.8 Appeal Process

See §11.4. Security appeals have expedited handling — response within 24 hours.

---

## 5. Gate 3 — Performance Gate

### 5.1 Identification

| Field                     | Value                                       |
| ------------------------- | ------------------------------------------- |
| **Gate ID**               | GATE-PERF-001                               |
| **Gate Name**             | Performance Gate                            |
| **Checked Before**        | Phase 3 Data Layer, Phase 6 Testing         |
| **Review Board**          | Performance Review Board (see §5.6)         |
| **Passing Threshold**     | ≥60% performance score                      |
| **Re-check Timing**       | 5 working days after remediation submission |
| **Max Re-check Attempts** | 3                                           |

### 5.2 Detailed Checklist (20 items)

#### Query Optimization (5 items)

- [ ] PERF-01: No N+1 query patterns detected (verified via Prisma query logging in development, or dedicated profile run)
- [ ] PERF-02: All database columns used in `WHERE`, `ORDER BY`, `JOIN`, and `GROUP BY` clauses have appropriate indexes
- [ ] PERF-03: No `SELECT *` in production queries — all Prisma `select` / `include` statements enumerate fields explicitly
- [ ] PERF-04: Pagination implemented on all list endpoints using cursor-based or offset-based pagination with sane defaults (≤100 per page)
- [ ] PERF-05: Eager loading used where relationships are needed; lazy loading disabled or explicitly managed

#### Data Access Patterns (4 items)

- [ ] PERF-06: Read-heavy endpoints use Redis caching with appropriate TTL (verified: cache-aside pattern implemented)
- [ ] PERF-07: Cache invalidation is implemented for write operations that affect cached data
- [ ] PERF-08: No synchronous computation in request path that exceeds 100ms (identified via tracing or profiling)
- [ ] PERF-09: Bulk operations use batched queries, not row-by-row processing

#### Streaming & Real-Time (4 items)

- [ ] PERF-10: Streaming endpoints use real SSE (Server-Sent Events) — verified: no simulated word-by-word setTimeout patterns
- [ ] PERF-11: Backpressure handling implemented — client disconnect properly cleans up stream resources
- [ ] PERF-12: Streaming responses have configurable timeouts and heartbeat keep-alives
- [ ] PERF-13: WebSocket connections (if used) have max connection limits and per-client rate limits

#### Memory & Resource Management (4 items)

- [ ] PERF-14: No unbounded in-memory data structures; all collections have max size limits or use bounded caches
- [ ] PERF-15: File uploads use streaming to disk/object store — no `Buffer.from()` on entire file in memory
- [ ] PERF-16: Large dataset processing uses streaming or chunked processing — not loading everything into RAM
- [ ] PERF-17: Graceful shutdown handles in-flight requests; `OnModuleDestroy` cleans up connections

#### Tooling & Benchmarks (3 items)

- [ ] PERF-18: `clinic.js` or equivalent profiling shows no memory leaks over 10-minute sustained load
- [ ] PERF-19: k6/artillery benchmark exists for top 5 critical endpoints with baseline measurements
- [ ] PERF-20: P95 response time for API endpoints is under 500ms (under normal load); streaming TTFB under 200ms

### 5.3 Scoring Methodology

| Dimension              | Weight   | Items  | Score Calculation           |
| ---------------------- | -------- | ------ | --------------------------- |
| Query Optimization     | 30%      | 5      | `(passed / 5) × 30`         |
| Data Access Patterns   | 25%      | 4      | `(passed / 4) × 25`         |
| Streaming & Real-Time  | 20%      | 4      | `(passed / 4) × 20`         |
| Memory & Resource Mgmt | 15%      | 4      | `(passed / 4) × 15`         |
| Tooling & Benchmarks   | 10%      | 3      | `(passed / 3) × 10`         |
| **Total**              | **100%** | **20** | **Sum of dimension scores** |

**Tool-assisted verification:**

| Check                  | Tool / Method                                                      |
| ---------------------- | ------------------------------------------------------------------ |
| N+1 detection          | Prisma `log: ['query']` + manual review of query count per request |
| Index analysis         | `EXPLAIN ANALYZE` on top 10 slow queries                           |
| Memory profiling       | `clinic.js`, `--inspect` heap snapshots                            |
| Streaming verification | Code review: no `setTimeout` per-word simulation patterns          |
| Caching audit          | Redis `MONITOR` or cache hit-rate metrics                          |

### 5.4 Pass / Fail Rules

| Score  | Result                                                              |
| ------ | ------------------------------------------------------------------- |
| ≥60%   | **PASS**                                                            |
| 40–59% | **CONDITIONAL PASS** — must address each failed item in next sprint |
| <40%   | **FAIL** — performance architecture review required                 |

### 5.5 Consequences of Failure

- Data layer deployment blocked.
- Performance Review Board issues Performance Remediation Order (PRO).
- Failed items are classified as PERFORMANCE_CRITICAL and must be resolved before the next gate re-check.
- Benchmark baseline must be re-established after remediation.

### 5.6 Review Board Composition

| Role                          | Person / Team             | Vote Weight |
| ----------------------------- | ------------------------- | ----------- |
| Performance Architect (Chair) | TBD                       | 2           |
| Senior Backend Engineer       | TBD                       | 1           |
| Database Administrator / DBA  | TBD                       | 1           |
| SRE / Infrastructure Engineer | TBD                       | 1           |
| **Minimum quorum**            | 3 members including Chair | —           |

### 5.7 How to Document Gate Results

```
docs/governance/gates/performance/<YYYY-MM-DD>-result.md
```

Must include: benchmark results, profile outputs, query analysis, cache hit-rate, and each item's evidence artifact.

### 5.8 Appeal Process

See §11.4.

---

## 6. Gate 4 — AI Gate

### 6.1 Identification

| Field                     | Value                                                     |
| ------------------------- | --------------------------------------------------------- |
| **Gate ID**               | GATE-AI-001                                               |
| **Gate Name**             | AI Gate                                                   |
| **Checked Before**        | Phase 5 AI Implementation                                 |
| **Review Board**          | AI Review Board (see §6.6)                                |
| **Passing Threshold**     | AI pipeline end-to-end verified with production-like data |
| **Re-check Timing**       | 5 working days after remediation submission               |
| **Max Re-check Attempts** | 3                                                         |

### 6.2 Detailed Checklist (22 items)

#### Real LLM Integration (5 items)

- [ ] AI-01: LLM provider integration calls a real LLM API (OpenAI / Azure / Anthropic) — verified by disabling mock and observing network call
- [ ] AI-02: Mock/fallback responses are never returned silently; all mock paths are explicitly flagged in logs
- [ ] AI-03: Prompt Engine sends real prompts to LLM and returns real responses (not echoed input)
- [ ] AI-04: LLM provider has retry + fallback logic (at least 3 retries with exponential backoff, circuit breaker pattern)
- [ ] AI-05: LLM calls have timeouts configured (connect ≤10s, read ≤60s for streaming, ≤30s for non-streaming)

#### Real Streaming (4 items)

- [ ] AI-06: SSE streaming is real — bytes arrive from LLM wire and are forwarded via SSE without artificial buffering
- [ ] AI-07: No `setTimeout` / `setInterval` loops simulating word-by-word output (confirmed via code search)
- [ ] AI-08: Client disconnect properly aborts the upstream LLM call (stream is cancelled, not leaked)
- [ ] AI-09: Backpressure implemented — slow consumers do not OOM the server; server applies flow control

#### Real Embeddings (4 items)

- [ ] AI-10: Embedding generation calls a real embedding model (text-embedding-3-small or equivalent) — verified: vectors differ per input
- [ ] AI-11: No dummy embeddings — confirmed: cosine similarity between random inputs is near 0, not near 1
- [ ] AI-12: Embeddings are stored in Qdrant or equivalent vector store with appropriate index configuration
- [ ] AI-13: Embedding cache implemented to avoid recomputing identical inputs within TTL

#### RAG Pipeline (5 items)

- [ ] AI-14: Knowledge documents are chunked, embedded, and indexed in the vector store (verified: query returns chunks from indexed docs)
- [ ] AI-15: Hybrid search implemented (semantic + keyword) — not just pure vector search
- [ ] AI-16: Retrieved chunks are injected into LLM context window with source attribution
- [ ] AI-17: RAG response cites sources — response includes document IDs, chunk positions, and relevance scores
- [ ] AI-18: Hallucination guardrails active — response confidence scoring against retrieved sources; "I don't know" triggered below threshold

#### AI Agents & Tool Use (4 items)

- [ ] AI-19: All AI agents have a real implementation (no agent returns hardcoded responses) — at minimum: Electrical Engineer agent calls LLM with engineering context
- [ ] AI-20: Agent tool registry is populated with real tool implementations — no dead code tools
- [ ] AI-21: Tool execution has timeout, rate limiting, and result validation
- [ ] AI-22: Memory system (conversation history, summary, facts) is persisted to database — not in-memory only

### 6.3 Scoring Methodology

**Binary / end-to-end verification.** The AI gate is evaluated holistically, not as a point score.

| Criterion                     | Method                            | Result    |
| ----------------------------- | --------------------------------- | --------- |
| Real LLM call confirmed       | Network capture + code review     | Pass/Fail |
| Real SSE streaming confirmed  | Wire-level inspection             | Pass/Fail |
| Real embeddings confirmed     | Cosine similarity test            | Pass/Fail |
| RAG returns accurate results  | Test queries against indexed docs | Pass/Fail |
| No simulated/placeholder code | Full codebase scan                | Pass/Fail |

**Threshold:** All five criteria must pass. No partial credit.

### 6.4 Pass / Fail Rules

| Result                                       | Action                                                    |
| -------------------------------------------- | --------------------------------------------------------- |
| All 5 criteria pass + all 22 items ≥90%      | **PASS**                                                  |
| All 5 criteria pass but checklist items <90% | **CONDITIONAL PASS** — items tracked in AI Technical Debt |
| Any of 5 criteria fails                      | **FAIL** — AI pipeline incomplete                         |

### 6.5 Consequences of Failure

- AI implementation phase does not start / continues only for non-AI work.
- AI Review Board issues AI Remediation Order (AIRO).
- Simulated/mocked components are elevated to P0 blockers.
- Until AI gate passes, AI endpoints remain behind feature flag and return 503 with `"X-AI-Status: unavailable"`.

### 6.6 Review Board Composition

| Role                           | Person / Team             | Vote Weight |
| ------------------------------ | ------------------------- | ----------- |
| AI Architect / ML Lead (Chair) | TBD                       | 2           |
| Senior AI Engineer             | TBD                       | 1           |
| Backend Engineer (AI module)   | TBD                       | 1           |
| QA Engineer (AI testing)       | TBD                       | 1           |
| **Minimum quorum**             | 3 members including Chair | —           |

### 6.7 How to Document Gate Results

```
docs/governance/gates/ai/<YYYY-MM-DD>-result.md
```

Must include:

- Network trace showing real LLM call + real streaming
- Embedding cosine similarity test results
- RAG test queries with source-attributed responses
- Agent-by-agent verification table

### 6.8 Appeal Process

See §11.4.

---

## 7. Gate 5 — Testing Gate

### 7.1 Identification

| Field                     | Value                                       |
| ------------------------- | ------------------------------------------- |
| **Gate ID**               | GATE-TEST-001                               |
| **Gate Name**             | Testing Gate                                |
| **Checked Before**        | Phase 6 Testing Sprint, Phase 8 Release     |
| **Review Board**          | QA Review Board (see §7.6)                  |
| **Passing Threshold**     | ≥60% module coverage, 100% pass rate        |
| **Re-check Timing**       | 3 working days after remediation submission |
| **Max Re-check Attempts** | 3                                           |

### 7.2 Detailed Checklist (22 items)

#### Coverage Requirements (5 items)

- [ ] TEST-01: Overall unit test line coverage ≥60% (measured via Jest `--coverage` / pytest `--cov-report`)
- [ ] TEST-02: Each module has its own test directory with at least one test file per layer (domain, application, infrastructure, presentation)
- [ ] TEST-03: NestJS modules have controller tests, service tests, and repository tests (or equivalent per architecture)
- [ ] TEST-04: Python microservices have tests per endpoint (at minimum: 200 response, 4xx validation, 5xx error path)
- [ ] TEST-05: Coverage reports include branch coverage, not just line coverage — branch ≥50%

#### Test Quality (5 items)

- [ ] TEST-06: No test files are empty or contain placeholder `it.todo('...')` without implementation
- [ ] TEST-07: Tests assert on behavior, not implementation — no mocking of internal implementation details unless necessary
- [ ] TEST-08: Integration tests for all critical paths (auth flow, workspace CRUD, project CRUD, RBAC enforcement)
- [ ] TEST-09: Edge cases covered: null inputs, empty collections, malformed requests, duplicate keys, concurrent writes
- [ ] TEST-10: Tests are deterministic — no flaky tests due to timing, random data, or test ordering dependencies

#### Test Infrastructure (4 items)

- [ ] TEST-11: Test suite runs cleanly with `pnpm test` from monorepo root — no configuration errors
- [ ] TEST-12: Test database uses isolated test containers or in-memory database — no shared state between test runs
- [ ] TEST-13: CI pipeline runs full test suite; test failure blocks deployment
- [ ] TEST-14: E2E tests exist for top 10 user journeys and pass consistently

#### Python Microservice Tests (4 items)

- [ ] TEST-15: Each Python service has pytest with ≥80% coverage (`--cov=src --cov-report=term-missing`)
- [ ] TEST-16: FastAPI endpoint tests use `TestClient`; dependency overrides used for external services
- [ ] TEST-17: Async tests use pytest-asyncio with `asyncio_mode=auto`
- [ ] TEST-18: Engineering calculator tests cover at least all BASIC and CABLE calculation types

#### AI Module Tests (4 items)

- [ ] TEST-19: LLM provider tests use real API responses recorded via VCR/cassettes (not mocks that bypass actual SDK)
- [ ] TEST-20: RAG pipeline tested end-to-end with real vector store and real embedding model
- [ ] TEST-21: Streaming tested with SSE client simulator — verifies chunk ordering, completion, error propagation
- [ ] TEST-22: Agent tests verify tool selection, parameter extraction, and result formatting

### 7.3 Scoring Methodology

| Dimension                 | Weight   | Items  | Score Calculation           |
| ------------------------- | -------- | ------ | --------------------------- |
| Coverage Requirements     | 30%      | 5      | `(passed / 5) × 30`         |
| Test Quality              | 30%      | 5      | `(passed / 5) × 30`         |
| Test Infrastructure       | 20%      | 4      | `(passed / 4) × 20`         |
| Python Microservice Tests | 10%      | 4      | `(passed / 4) × 10`         |
| AI Module Tests           | 10%      | 4      | `(passed / 4) × 10`         |
| **Total**                 | **100%** | **22** | **Sum of dimension scores** |

**Override:** If pass rate is below 100%, gate fails regardless of score.

### 7.4 Pass / Fail Rules

| Result                                  | Action                                   |
| --------------------------------------- | ---------------------------------------- |
| ≥60% module coverage AND 100% pass rate | **PASS**                                 |
| <60% coverage                           | **FAIL** — increase coverage             |
| <100% pass rate                         | **FAIL** — fix failing tests first       |
| >10 flaky tests identified              | **FAIL** — flakiness is a quality defect |

### 7.5 Consequences of Failure

- No deployment to any environment beyond development.
- QA Review Board issues Testing Remediation Order (TRO).
- Failing tests must be fixed within 2 working days; untested modules must achieve minimum coverage within next sprint.
- Repeated gate failure (3 attempts) triggers formal audit of the module's development process.

### 7.6 Review Board Composition

| Role                              | Person / Team             | Vote Weight  |
| --------------------------------- | ------------------------- | ------------ |
| QA Lead (Chair)                   | TBD                       | 2            |
| Test Automation Engineer          | TBD                       | 1            |
| Module Lead (module under review) | TBD                       | 1 (advisory) |
| Release Manager                   | TBD                       | 1            |
| **Minimum quorum**                | 3 members including Chair | —            |

### 7.7 How to Document Gate Results

```
docs/governance/gates/testing/<YYYY-MM-DD>-result.md
```

Must include: coverage report summary, test run output (pass/fail count), flaky test list, per-module coverage table.

### 7.8 Appeal Process

See §11.4.

---

## 8. Gate 6 — Documentation Gate

### 8.1 Identification

| Field                     | Value                                       |
| ------------------------- | ------------------------------------------- |
| **Gate ID**               | GATE-DOC-001                                |
| **Gate Name**             | Documentation Gate                          |
| **Checked Before**        | Phase 8 Release                             |
| **Review Board**          | Documentation Review Board (see §8.6)       |
| **Passing Threshold**     | No gaps in required documentation           |
| **Re-check Timing**       | 3 working days after remediation submission |
| **Max Re-check Attempts** | 2                                           |

### 8.2 Detailed Checklist (20 items)

#### API Documentation (5 items)

- [ ] DOC-01: OpenAPI specification (`packages/openapi/v1/openapi.json`) is auto-generated and current — matches actual endpoints
- [ ] DOC-02: Every endpoint has a summary, description, request body schema, and response schema in OpenAPI
- [ ] DOC-03: All DTOs are reflected in OpenAPI with correct types, required fields, and validation rules
- [ ] DOC-04: OpenAPI spec passes `swagger-cli validate` with zero warnings
- [ ] DOC-05: Postman / Bruno collection exists and is tested against a running instance

#### Architecture Decision Records (4 items)

- [ ] DOC-06: ADR directory exists at `docs/adr/` with index
- [ ] DOC-07: Every architectural change made during this phase has a corresponding ADR (status: accepted, proposed, or deprecated)
- [ ] DOC-08: ADRs follow standard template (title, status, context, decision, consequences, compliance)
- [ ] DOC-09: No pending ADRs in "proposed" status for longer than 2 weeks without review

#### Deployment & Operations (5 items)

- [ ] DOC-10: Deployment guide exists covering: prerequisites, env variables, build steps, database migration, startup sequence
- [ ] DOC-11: Environment configuration documented — all env vars listed with purpose, type, default value, and required/optional status
- [ ] DOC-12: Docker Compose files are documented with service descriptions, ports, volumes, and dependencies
- [ ] DOC-13: Runbook exists for each microservice covering: start, stop, health check, log access, restart procedure, common failure modes
- [ ] DOC-14: Database migration guide exists: how to apply, rollback, and verify migrations

#### Code & Module Documentation (4 items)

- [ ] DOC-15: Every NestJS module has a `README.md` explaining purpose, structure, dependencies, and how to extend
- [ ] DOC-16: Python service has README with setup, test, and usage instructions
- [ ] DOC-17: Public API interfaces and domain services have JSDoc / docstrings describing contract, params, returns, and exceptions
- [ ] DOC-18: Complex business logic (engineering calculators, AI pipelines) has inline documentation explaining the algorithm

#### Program Documentation (2 items)

- [ ] DOC-19: Status report updated reflecting current phase completion and next steps
- [ ] DOC-20: Sprint plan and backlog reflect accurate current state

### 8.3 Scoring Methodology

| Dimension                     | Weight   | Items  | Score Calculation           |
| ----------------------------- | -------- | ------ | --------------------------- |
| API Documentation             | 30%      | 5      | `(passed / 5) × 30`         |
| Architecture Decision Records | 25%      | 4      | `(passed / 4) × 25`         |
| Deployment & Operations       | 25%      | 5      | `(passed / 5) × 25`         |
| Code & Module Documentation   | 15%      | 4      | `(passed / 4) × 15`         |
| Program Documentation         | 5%       | 2      | `(passed / 2) × 5`          |
| **Total**                     | **100%** | **20** | **Sum of dimension scores** |

### 8.4 Pass / Fail Rules

| Score  | Result                                                                    |
| ------ | ------------------------------------------------------------------------- |
| ≥90%   | **PASS**                                                                  |
| 70–89% | **CONDITIONAL PASS** — missing docs must be delivered before Release Gate |
| <70%   | **FAIL** — documentation debt blocks release                              |

### 8.5 Consequences of Failure

- Release candidate cannot be cut.
- Documentation Review Board issues Documentation Remediation Order (DRO).
- Missing documentation items are P2 blockers; must be completed before next gate attempt.
- Skipped documentation accrues as documentation debt in the Technical Debt Register.

### 8.6 Review Board Composition

| Role                                    | Person / Team             | Vote Weight  |
| --------------------------------------- | ------------------------- | ------------ |
| Technical Writer / Doc Lead (Chair)     | TBD                       | 2            |
| Senior Engineer (documentation quality) | TBD                       | 1            |
| Release Manager                         | TBD                       | 1            |
| Product Owner (user-facing docs)        | TBD                       | 1 (advisory) |
| **Minimum quorum**                      | 3 members including Chair | —            |

### 8.7 How to Document Gate Results

```
docs/governance/gates/documentation/<YYYY-MM-DD>-result.md
```

Must include: per-item checklist with evidence links (file paths, ADR URLs), OpenAPI validation output, missing docs list.

### 8.8 Appeal Process

See §11.4.

---

## 9. Gate 7 — Release Gate (Final)

### 9.1 Identification

| Field                     | Value                                       |
| ------------------------- | ------------------------------------------- |
| **Gate ID**               | GATE-REL-001                                |
| **Gate Name**             | Release Gate (Final)                        |
| **Checked Before**        | RC1 (Release Candidate 1)                   |
| **Review Board**          | Program Architecture Board (see §9.6)       |
| **Passing Threshold**     | 100% of gates pass                          |
| **Re-check Timing**       | 5 working days after remediation submission |
| **Max Re-check Attempts** | 2                                           |

### 9.2 Detailed Checklist (22 items)

#### Gate Compliance (5 items)

- [ ] REL-01: Architecture Gate result is PASS (or CONDITIONAL PASS with accepted remediation plan)
- [ ] REL-02: Security Gate result is PASS (zero open CRITICAL/HIGH)
- [ ] REL-03: Performance Gate result is PASS (or CONDITIONAL PASS with accepted remediation plan)
- [ ] REL-04: AI Gate result is PASS (or CONDITIONAL PASS with accepted AI Technical Debt items)
- [ ] REL-05: Testing Gate result is PASS (≥60% coverage, 100% pass rate)

#### Release Checklist (5 items)

- [ ] REL-06: Release checklist completed and signed off by all module leads
- [ ] REL-07: All P0 and P1 bugs resolved (verified: no open issues tagged `priority:critical` or `priority:high`)
- [ ] REL-08: Feature flags for incomplete features are disabled in production configuration
- [ ] REL-09: Database migration scripts are tested against a production-like copy
- [ ] REL-10: Version numbers are bumped across all packages according to semver (monorepo `pnpm changeset` or manual)

#### Security Scan (4 items)

- [ ] REL-11: Full `pnpm audit` / `pip-audit` scan passed — zero CRITICAL/HIGH vulnerabilities
- [ ] REL-12: SAST scan (SonarQube / Semgrep) passed — zero CRITICAL findings
- [ ] REL-13: DAST scan completed against staging environment — no exploitable vulnerabilities found
- [ ] REL-14: Secrets scan passed — no credentials in the release branch

#### Performance Benchmark (4 items)

- [ ] REL-15: Performance benchmark suite completed against staging environment
- [ ] REL-16: P95 response time ≤500ms for all CRUD endpoints; ≤2s for AI streaming TTFB
- [ ] REL-17: Load test shows system handles 2× expected peak traffic without degradation
- [ ] REL-18: Memory profile shows no leaks over 30-minute sustained load (flat heap after GC)

#### Operational Readiness (4 items)

- [ ] REL-19: Health check endpoints respond correctly; readiness probe reports all dependencies (DB, Redis, Qdrant, LLM API) as healthy
- [ ] REL-20: Monitoring and alerting configured for all services (error rate, latency, CPU, memory, disk)
- [ ] REL-21: Log aggregation and structured logging verified — logs flow to central destination
- [ ] REL-22: Rollback plan documented and tested — can revert to previous version within 15 minutes

### 9.3 Scoring Methodology

**Binary gate — all sub-gates must pass individually.** No composite score.

| Criterion                       | Source              | Result    |
| ------------------------------- | ------------------- | --------- |
| All quality gates passed        | Gate Passport (§10) | Mandatory |
| Release checklist signed        | Sign-off document   | Mandatory |
| Security scans passed           | Scan reports        | Mandatory |
| Performance benchmarks passed   | Benchmark report    | Mandatory |
| Operational readiness confirmed | Ops checklist       | Mandatory |

**Threshold:** 100% of items passed. One failure = gate failed.

### 9.4 Pass / Fail Rules

| Result                           | Action                             |
| -------------------------------- | ---------------------------------- |
| All 22 items checked and passed  | **PASS** — RC1 approved            |
| Any item fails                   | **FAIL** — no release              |
| Any previous gate in FAIL status | **FAIL** — cannot bypass sub-gates |

### 9.5 Consequences of Failure

- RC1 is blocked; release date is postponed.
- Program Architecture Board issues Release Block Notice (RBN) with specific blockers.
- Blocked items must be resolved and re-verified before a new RC attempt.
- Stakeholders are notified via escalation protocol.

### 9.6 Review Board Composition

| Role                            | Person / Team             | Vote Weight |
| ------------------------------- | ------------------------- | ----------- |
| Program Architect / CTO (Chair) | TBD                       | 2           |
| Security Lead                   | TBD                       | 1           |
| QA Lead                         | TBD                       | 1           |
| Ops / SRE Lead                  | TBD                       | 1           |
| Release Manager (secretary)     | TBD                       | 1 (no vote) |
| **Minimum quorum**              | 4 members including Chair | —           |

### 9.7 How to Document Gate Results

```
docs/governance/gates/release/<YYYY-MM-DD>-result.md
```

Must include:

- Summary table referencing all 7 gate results with links to individual gate artifacts
- Release checklist signed PDF or equivalent
- Security scan summary
- Benchmark report summary
- Operational readiness sign-off
- Final verdict: APPROVED / DENIED

### 9.8 Appeal Process

See §11.4. Release Gate appeals require CTO-level escalation.

---

## 10. Gate Passport Template

The Gate Passport is a living document that tracks the status of all quality gates across the entire program. It is updated after every gate review and consulted before every phase transition.

### 10.1 Passport File

```
docs/governance/gate-passport.md
```

### 10.2 Template

```markdown
# Gate Passport — Xennic Platform

**Last Updated:** <YYYY-MM-DD>
**Owner:** Program Architect
**Location:** `docs/governance/gate-passport.md`

---

## Program Overview

| Phase                              | Gate Dependency                         | Status      | Date   |
| ---------------------------------- | --------------------------------------- | ----------- | ------ |
| Phase 0 — Foundation               | —                                       | ✅ COMPLETE | <date> |
| Phase 1 — Core Implementation      | GATE-ARCH-001                           | ⏳ PENDING  |        |
| Phase 2 — Security Sprint          | GATE-SEC-001                            | ⏳ PENDING  |        |
| Phase 3 — Data Layer               | GATE-PERF-001, GATE-SEC-001 (re-check)  | ⏳ PENDING  |        |
| Phase 4 — Engineering & Refinement | —                                       | ⏳ PENDING  |        |
| Phase 5 — AI Implementation        | GATE-ARCH-001 (re-check), GATE-AI-001   | ⏳ PENDING  |        |
| Phase 6 — Testing Sprint           | GATE-TEST-001, GATE-PERF-001 (re-check) | ⏳ PENDING  |        |
| Phase 7 — Hardening                | —                                       | ⏳ PENDING  |        |
| Phase 8 — Release Preparation      | GATE-DOC-001, GATE-TEST-001 (re-check)  | ⏳ PENDING  |        |
| RC1                                | GATE-REL-001                            | ⏳ PENDING  |        |

---

## Gate Detail Log

### Gate 1 — Architecture Gate

| Attempt               | Date | Score | Verdict | Artifact |
| --------------------- | ---- | ----- | ------- | -------- |
| 1 (Phase 1 pre-check) |      |       |         |          |
| 2 (Phase 5 pre-check) |      |       |         |          |

**Master checklist:**

- [ ] ARCH-01: DDD layers present — domain, application, infrastructure, presentation
- [ ] ARCH-02: Domain has zero infrastructure imports
- [ ] ARCH-03: Ubiquitous Language used
- [ ] ARCH-04: Domain services hold business logic; application orchestrates
- [ ] ARCH-05: Aggregate consistency boundaries via domain events
- [ ] ARCH-06: Value objects immutable
- [ ] ARCH-07: Module independently instantiable
- [ ] ARCH-08: No circular imports
- [ ] ARCH-09: Module isolation compilation test passed
- [ ] ARCH-10: Shared kernel extracted
- [ ] ARCH-11: Cross-module comms via events
- [ ] ARCH-12: Acyclic dependency graph
- [ ] ARCH-13: Layer direction enforced
- [ ] ARCH-14: Infrastructure → Domain only
- [ ] ARCH-15: External libs behind ports
- [ ] ARCH-16: No framework decorators in domain
- [ ] ARCH-17: No HTTP types in domain
- [ ] ARCH-18: Transactions at application layer
- [ ] ARCH-19: Serialization in infrastructure adapters
- [ ] ARCH-20: External API calls through ports
- [ ] ARCH-21: Ports in domain/ports/
- [ ] ARCH-22: Ports are tech-agnostic
- [ ] ARCH-23: Controllers inject interfaces
- [ ] ARCH-24: Repositories return domain aggregates
- [ ] ARCH-25: Interface segregation applied

**Remediation items (open):**
| ID | Item | Severity | Owner | Due | Status |
|---|---|---|---|---|---|
| | | | | | 🔴 OPEN / 🟡 IN PROGRESS / ✅ CLOSED |

---

### Gate 2 — Security Gate

| Attempt               | Date | Verdict | Artifact |
| --------------------- | ---- | ------- | -------- |
| 1 (Phase 2 pre-check) |      |         |          |
| 2 (Phase 3 pre-check) |      |         |          |

**Master checklist:**

- [ ] SEC-01: All endpoints authenticated
- [ ] SEC-02: Guards fail-closed
- [ ] SEC-03: Workspace isolation enforced
- [ ] SEC-04: RBAC least privilege
- [ ] SEC-05: JWT rotation and short expiry
- [ ] SEC-06: Password policies
- [ ] SEC-07: CRITICAL/HIGH vulns resolved
- [ ] SEC-08: No known CVEs
- [ ] SEC-09: SAST scan passed
- [ ] SEC-10: Secrets scan passed
- [ ] SEC-11: SBOM reviewed
- [ ] SEC-12: DTO validation enforced
- [ ] SEC-13: Parameterized queries only
- [ ] SEC-14: File upload security
- [ ] SEC-15: Prompt injection guardrails
- [ ] SEC-16: No open redirects
- [ ] SEC-17: PII identified and tagged
- [ ] SEC-18: PII encrypted at rest
- [ ] SEC-19: Sensitive fields excluded from responses
- [ ] SEC-20: Secrets injected via env
- [ ] SEC-21: Auth event audit logging
- [ ] SEC-22: Rate limiting on auth endpoints
- [ ] SEC-23: CORS restricted
- [ ] SEC-24: Helmet middleware active
- [ ] SEC-25: Health/debug endpoints restricted

**Remediation items (open):**
| ID | Item | Severity | Owner | Due | Status |
|---|---|---|---|---|---|

---

### Gate 3 — Performance Gate

| Attempt               | Date | Score | Verdict | Artifact |
| --------------------- | ---- | ----- | ------- | -------- |
| 1 (Phase 3 pre-check) |      |       |         |          |
| 2 (Phase 6 pre-check) |      |       |         |          |

**Master checklist:**

- [ ] PERF-01: No N+1 queries
- [ ] PERF-02: Indexes on filtered/sorted columns
- [ ] PERF-03: No SELECT \*
- [ ] PERF-04: Pagination on list endpoints
- [ ] PERF-05: Eager loading managed
- [ ] PERF-06: Redis caching on read-heavy endpoints
- [ ] PERF-07: Cache invalidation on writes
- [ ] PERF-08: No sync computation >100ms
- [ ] PERF-09: Batched bulk operations
- [ ] PERF-10: Real SSE streaming
- [ ] PERF-11: Backpressure handling
- [ ] PERF-12: Streaming timeouts and heartbeats
- [ ] PERF-13: WebSocket connection limits
- [ ] PERF-14: No unbounded in-memory structures
- [ ] PERF-15: File uploads streamed
- [ ] PERF-16: Large dataset chunked processing
- [ ] PERF-17: Graceful shutdown with OnModuleDestroy
- [ ] PERF-18: No memory leaks (clinic.js)
- [ ] PERF-19: k6/artillery benchmarks exist
- [ ] PERF-20: P95 <500ms API, <200ms TTFB streaming

**Remediation items (open):**
| ID | Item | Severity | Owner | Due | Status |
|---|---|---|---|---|---|

---

### Gate 4 — AI Gate

| Attempt | Date | Verdict | Artifact |
| ------- | ---- | ------- | -------- |
| 1       |      |         |          |

**Master checklist:**

- [ ] AI-01: Real LLM call verified
- [ ] AI-02: Mocks flagged in logs
- [ ] AI-03: Prompt Engine sends real prompts
- [ ] AI-04: Retry + fallback + circuit breaker
- [ ] AI-05: Timeouts configured
- [ ] AI-06: Real SSE streaming
- [ ] AI-07: No setTimeout simulation
- [ ] AI-08: Client disconnect aborts upstream
- [ ] AI-09: Backpressure for streaming
- [ ] AI-10: Real embedding model
- [ ] AI-11: No dummy embeddings
- [ ] AI-12: Vectors stored in Qdrant
- [ ] AI-13: Embedding cache
- [ ] AI-14: Documents chunked, embedded, indexed
- [ ] AI-15: Hybrid search (semantic + keyword)
- [ ] AI-16: Retrieved chunks injected with source
- [ ] AI-17: RAG cites sources
- [ ] AI-18: Hallucination guardrails
- [ ] AI-19: Agents call real LLM
- [ ] AI-20: Tool registry populated
- [ ] AI-21: Tool timeout, rate limit, validation
- [ ] AI-22: Memory persisted to DB

**Remediation items (open):**
| ID | Item | Severity | Owner | Due | Status |
|---|---|---|---|---|---|

---

### Gate 5 — Testing Gate

| Attempt               | Date | Score | Verdict | Artifact |
| --------------------- | ---- | ----- | ------- | -------- |
| 1 (Phase 6 pre-check) |      |       |         |          |
| 2 (Phase 8 pre-check) |      |       |         |          |

**Master checklist:**

- [ ] TEST-01: Unit coverage ≥60%
- [ ] TEST-02: All modules have tests
- [ ] TEST-03: Layer-specific tests
- [ ] TEST-04: Python endpoint tests
- [ ] TEST-05: Branch coverage ≥50%
- [ ] TEST-06: No placeholder/todo tests
- [ ] TEST-07: Behavior-focused assertions
- [ ] TEST-08: Integration tests for critical paths
- [ ] TEST-09: Edge case coverage
- [ ] TEST-10: No flaky tests
- [ ] TEST-11: Suite runs from root
- [ ] TEST-12: Isolated test DB
- [ ] TEST-13: CI runs tests
- [ ] TEST-14: E2E for top 10 journeys
- [ ] TEST-15: Python coverage ≥80%
- [ ] TEST-16: FastAPI TestClient with overrides
- [ ] TEST-17: Async tests use pytest-asyncio
- [ ] TEST-18: Engineering calc tests
- [ ] TEST-19: LLM tests with VCR cassettes
- [ ] TEST-20: RAG end-to-end tests
- [ ] TEST-21: SSE client simulator tests
- [ ] TEST-22: Agent tool tests

**Remediation items (open):**
| ID | Item | Severity | Owner | Due | Status |
|---|---|---|---|---|---|

---

### Gate 6 — Documentation Gate

| Attempt | Date | Score | Verdict | Artifact |
| ------- | ---- | ----- | ------- | -------- |
| 1       |      |       |         |          |

**Master checklist:**

- [ ] DOC-01: OpenAPI spec current
- [ ] DOC-02: Endpoints documented
- [ ] DOC-03: DTOs reflected in OpenAPI
- [ ] DOC-04: OpenAPI passes validation
- [ ] DOC-05: Postman collection exists
- [ ] DOC-06: ADR directory with index
- [ ] DOC-07: ADRs for all architectural changes
- [ ] DOC-08: ADRs follow template
- [ ] DOC-09: No stale proposed ADRs
- [ ] DOC-10: Deployment guide exists
- [ ] DOC-11: Env vars documented
- [ ] DOC-12: Docker Compose documented
- [ ] DOC-13: Runbook per service
- [ ] DOC-14: Migration guide
- [ ] DOC-15: Module READMEs
- [ ] DOC-16: Python service READMEs
- [ ] DOC-17: JSDoc/docstrings on public API
- [ ] DOC-18: Complex logic documented inline
- [ ] DOC-19: Status report updated
- [ ] DOC-20: Sprint plan accurate

**Remediation items (open):**
| ID | Item | Severity | Owner | Due | Status |
|---|---|---|---|---|---|

---

### Gate 7 — Release Gate (Final)

| Attempt | Date | Verdict | Artifact |
| ------- | ---- | ------- | -------- |
| 1       |      |         |          |

**Master checklist:**

- [ ] REL-01: Architecture Gate passed
- [ ] REL-02: Security Gate passed
- [ ] REL-03: Performance Gate passed
- [ ] REL-04: AI Gate passed
- [ ] REL-05: Testing Gate passed
- [ ] REL-06: Release checklist signed
- [ ] REL-07: All P0/P1 bugs resolved
- [ ] REL-08: Feature flags configured
- [ ] REL-09: Migration scripts tested
- [ ] REL-10: Version numbers bumped
- [ ] REL-11: Dependency audit passed
- [ ] REL-12: SAST scan passed
- [ ] REL-13: DAST scan passed
- [ ] REL-14: Secrets scan passed
- [ ] REL-15: Benchmark suite completed
- [ ] REL-16: P95 under thresholds
- [ ] REL-17: 2× peak load passes
- [ ] REL-18: No memory leaks
- [ ] REL-19: Health checks pass
- [ ] REL-20: Monitoring configured
- [ ] REL-21: Log aggregation verified
- [ ] REL-22: Rollback plan tested

---

## Escalations & Appeals Log

| Date | Gate | Appellant | Grounds | Decision | Resolution |
| ---- | ---- | --------- | ------- | -------- | ---------- |
|      |      |           |         |          |            |

---

## Sign-off

| Role              | Name | Date |
| ----------------- | ---- | ---- |
| Program Architect |      |      |
| CTO               |      |      |
| Release Manager   |      |      |
```

---

## 11. Appendices

### 11.1 Definition of Severity Levels

| Severity | Definition                                                                                             | Response Time   | Fix Time         |
| -------- | ------------------------------------------------------------------------------------------------------ | --------------- | ---------------- |
| CRITICAL | System crash, data loss, authentication bypass, remote code execution                                  | Immediate       | ≤48 hours        |
| HIGH     | Significant functionality broken, sensitive data exposed to wrong role, severe performance degradation | ≤4 hours        | ≤5 working days  |
| MEDIUM   | Non-critical functionality broken, minor data exposure, moderate performance issue                     | ≤24 hours       | ≤10 working days |
| LOW      | Cosmetic issue, non-functional improvement, documentation gap                                          | ≤5 working days | Next release     |

### 11.2 Score Summary Quick Reference

| Gate          | Type           | Passing Threshold        | Scoring Dimensions                                                 |
| ------------- | -------------- | ------------------------ | ------------------------------------------------------------------ |
| Architecture  | Scored (0–100) | ≥70%                     | DDD 30%, Isolation 25%, Dependency 20%, Leakage 15%, Purity 10%    |
| Security      | Binary         | ZERO CRITICAL/HIGH       | All items mandatory                                                |
| Performance   | Scored (0–100) | ≥60%                     | Query 30%, Data Access 25%, Streaming 20%, Memory 15%, Tooling 10% |
| AI            | Binary         | Pipeline verified        | 5 criteria all mandatory                                           |
| Testing       | Scored (0–100) | ≥60% coverage, 100% pass | Coverage 30%, Quality 30%, Infra 20%, Python 10%, AI 10%           |
| Documentation | Scored (0–100) | ≥90%                     | API Docs 30%, ADR 25%, Deploy 25%, Code 15%, Program 5%            |
| Release       | Binary         | 100% of gates            | All sub-gates must pass                                            |

### 11.3 Artifact Directory Structure

```
docs/governance/
├── gate-passport.md                         # Living passport document
├── quality-gates.md                         # This document
└── gates/
    ├── architecture/
    │   ├── <YYYY-MM-DD>-result.md
    │   └── <YYYY-MM-DD>-recheck-result.md
    ├── security/
    │   ├── <YYYY-MM-DD>-result.md
    │   └── ...
    ├── performance/
    │   ├── <YYYY-MM-DD>-result.md
    │   └── ...
    ├── ai/
    │   ├── <YYYY-MM-DD>-result.md
    │   └── ...
    ├── testing/
    │   ├── <YYYY-MM-DD>-result.md
    │   └── ...
    ├── documentation/
    │   ├── <YYYY-MM-DD>-result.md
    │   └── ...
    └── release/
        ├── <YYYY-MM-DD>-result.md
        └── ...
```

### 11.4 Appeal Process

Any team whose deliverable fails a gate may appeal the decision.

**Grounds for appeal:**

1. The gate was evaluated against incorrect criteria (outdated checklist version).
2. The scoring was miscalculated (arithmetic error or wrong weight applied).
3. New evidence exists that was not available during the review.
4. The item in question is not applicable to the specific deliverable (scope mismatch).

**Not grounds for appeal:**

1. "We will fix it later."
2. "The threshold is too high."
3. "Other modules have the same issue and passed."

**Procedure:**

```
1. Appellant submits written appeal to Review Board Chair within 48 hours of gate result.
   File: docs/governance/gates/appeals/<YYYY-MM-DD>-<gate-id>-appeal.md

2. Chair convenes an appeal panel within 48 hours (same quorum as original review).

3. Panel reviews evidence and renders one of:
   a. OVERTURNED — gate changed to PASS; reason documented
   b. SUSTAINED — gate remains FAIL with written explanation
   c. REMAND — gate status unchanged; appellant given additional 48 hours to provide
      missing evidence; re-evaluation without re-scoring

4. Decision is final. No further appeal for the same gate attempt.

5. Result documented in Gate Passport Escalations & Appeals Log.
```

**Expedited appeals for Security Gate:** Response within 24 hours.

**Release Gate appeals require CTO-level escalation:** Appellant may request CTO review if initial appeal is sustained. CTO decision is final and irrevocable.

### 11.5 Glossary

| Term                               | Definition                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| Architecture Board                 | Cross-functional body that oversees architectural quality and compliance          |
| ARO / SRO / PRO / AIRO / TRO / DRO | Remediation Orders issued by respective review boards                             |
| CRITICAL / HIGH / MEDIUM / LOW     | Severity levels as defined in §11.1                                               |
| CONDITIONAL PASS                   | Gate passes but with tracked remediation items; must be resolved before next gate |
| Gate Passport                      | Living document tracking all gate results across the program                      |
| RBN                                | Release Block Notice — issued when Release Gate fails                             |
| RC1                                | Release Candidate 1 — first deployable candidate for production                   |
| Remediation Plan                   | Documented set of actions to address failed gate items, with owners and deadlines |
| Review Board                       | Panel that evaluates gate criteria and renders a pass/fail decision               |
| SAST / DAST                        | Static / Dynamic Application Security Testing                                     |

---

_This document is controlled by the Program Architecture Board. Updates require Architecture Board approval._
