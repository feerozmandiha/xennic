# Engineering RFC Process — Xennic Platform

> **Version:** 1.0
> **Status:** Approved
> **Last Updated:** 2026-07-02
> **Owner:** Engineering Lead

---

## Table of Contents

1. [RFC Lifecycle](#1-rfc-lifecycle)
2. [RFC Template](#2-rfc-template)
3. [Review Process](#3-review-process)
4. [RFC Categories](#4-rfc-categories)
5. [RFC Index](#5-rfc-index)
6. [Decision Records](#6-decision-records)

---

## 1. RFC Lifecycle

### States

```
Draft ──→ Review ──→ Approved ──→ Implemented ──→ Deprecated
             │                         │
             └──→ Rejected ←───────────┘
```

### Stage Descriptions

#### Draft

- **Purpose:** Propose an idea and gather preliminary feedback
- **Entry:** Any engineer creates a PR adding a new RFC document at `docs/rfc/RFC-NNN.md`
- **Exit criteria:**
  - Template fields populated (author, problem, proposed solution, implementation plan)
  - At least one review comment received
- **Expected duration:** 1-3 calendar days
- **Owner:** RFC Author

#### Review

- **Purpose:** Formal review by designated reviewers; iterate on design
- **Entry:** Author marks RFC as `Status: Draft → Review` and assigns reviewers
- **Exit criteria:**
  - All required reviewers have approved (see [§3 Review Process](#3-review-process))
  - All blocking comments resolved or escalated
  - Consensus reached or escalation decision recorded
- **Expected duration:** Max **5 business days**
- **Owner:** RFC Author + Reviewers

#### Approved

- **Purpose:** RFC accepted; implementation may begin
- **Entry:** Review criteria met; status set to `Approved`
- **Exit criteria:**
  - Implementation matches approved RFC scope
  - Tests passing
  - Code reviewed
- **Expected duration:** N/A (implementation window defined per RFC)
- **Owner:** Engineering Lead

#### Implemented

- **Purpose:** RFC changes are shipped to production
- **Entry:** PRs merged; deployment completed; implementation verification passed
- **Exit criteria:**
  - Monitoring confirms no regression
  - Related gap IDs marked resolved in gap registry
  - ADR created if architectural decision was made
- **Expected duration:** N/A
- **Owner:** Engineering Lead

#### Deprecated

- **Purpose:** Mark RFC as superseded or no longer relevant
- **Entry:** New RFC supersedes this one, or the feature is removed
- **Criteria:** Reason for deprecation documented; superseding RFC linked
- **Owner:** Engineering Lead

#### Rejected

- **Purpose:** RFC explicitly rejected during review
- **Entry:** Reviewer consensus to reject; status set to `Rejected`
- **Criteria:** Rationale for rejection documented
- **Owner:** RFC Author

---

## 2. RFC Template

```markdown
---
rfc-id: RFC-NNN
title: ''
authors:
  - ''
date: YYYY-MM-DD
status: Draft
category: ''
related-adrs: []
related-gaps: []
---

# RFC-NNN: {Title}

## Problem Statement

{What problem are we solving? What is the current state, and why is it insufficient?}

## Proposed Solution

{Describe the proposed change in detail. Include diagrams, pseudocode, or references as needed.}

## Alternatives Considered

| Alternative | Pros | Cons | Why Not Chosen |
| ----------- | ---- | ---- | -------------- |
| {Option A}  | ...  | ...  | ...            |
| {Option B}  | ...  | ...  | ...            |

## Implementation Plan

1. {Step 1 — description, estimated effort, owner}
2. {Step 2}
3. {Step 3}

### Migration Path

{Describe how existing systems/data are migrated. Include rollback steps.}

## Testing Strategy

- **Unit tests:** {What units are tested?}
- **Integration tests:** {What integrations are covered?}
- **E2E tests:** {If applicable}
- **Verification:** {How do we verify correctness in staging?}

## Rollback Plan

1. {Step-by-step rollback procedure}
2. {Trigger conditions}
3. {Verification that rollback succeeded}

## Open Questions

- {Question 1 — owner, deadline for resolution}

## References

- {Related RFCs, ADRs, Gap IDs, tickets, documents}
```

### Template Location

The canonical template is stored at `docs/governance/rfc-template.md`. Copy this file when creating a new RFC.

---

## 3. Review Process

### Required Reviewers by Category

| RFC Category   | Tech Lead | Domain Expert | Security Engineer | AI Lead | DB Lead | DevOps Lead |
| -------------- | :-------: | :-----------: | :---------------: | :-----: | :-----: | :---------: |
| Architecture   |    ✅     |      ✅       |        ✅         |    —    |    —    |      —      |
| API            |    ✅     |       —       |        ✅         |    —    |    —    |      —      |
| Security       |    ✅     |       —       |        ✅         |    —    |    —    |     ✅      |
| Performance    |    ✅     |       —       |         —         |    —    |   ✅    |     ✅      |
| AI             |    ✅     |       —       |        ✅         |   ✅    |    —    |      —      |
| Database       |    ✅     |       —       |         —         |    —    |   ✅    |      —      |
| Infrastructure |    ✅     |       —       |        ✅         |    —    |    —    |     ✅      |

### Timeline

- **Review period:** 5 business days maximum from assignment
- **First pass:** 2 business days for initial feedback
- **Re-review:** 1 business day per round after author revisions
- **Extension:** Must be requested by reviewer with justification

### Comment Handling

- **Conventions:**
  - `[BLOCKING]` prefix = must be resolved before approval
  - `[NIT]` prefix = optional, author may resolve without re-review
  - `[QUESTION]` prefix = clarification needed
- **Resolution:** Author responds with acceptance or counter-argument
- **Blocking resolution:** Blocking comments must reach explicit resolution (accept/reject-and-document) before status changes to `Approved`

### Consensus Building

1. Author addresses all `[BLOCKING]` comments
2. If disagreement persists, author schedules a sync meeting with reviewers
3. Meeting outcome documented as a comment on the RFC PR
4. Stalemate → Escalation (see below)

### Escalation

If consensus cannot be reached within the 5-business-day window:

1. **Step 1:** Issue documented with both positions clearly stated
2. **Step 2:** Escalated to Engineering Lead for final decision
3. **Step 3:** Engineering Lead publishes decision with rationale
4. **Step 4:** Decision is final; recorded in the RFC and linked ADR

---

## 4. RFC Categories

### Architecture RFC

- **Scope:** Module boundaries, dependency injection layout, package structure, framework choices
- **Reviewers:** Tech Lead, Domain Expert, Security Engineer
- **Examples:** Adding a new module, splitting a monolith, introducing event bus

### API RFC

- **Scope:** Public API surface (REST endpoints, request/response shapes, WebSocket events, SSE contracts)
- **Reviewers:** Tech Lead, Security Engineer
- **Examples:** New endpoint addition, breaking schema change, API versioning strategy

### Security RFC

- **Scope:** Authentication, authorization, secret management, encryption, audit logging, rate limiting
- **Reviewers:** Tech Lead, Security Engineer, DevOps Lead
- **Examples:** OAuth integration, RBAC model change, secrets rotation strategy

### Performance RFC

- **Scope:** Caching strategy, query optimization, streaming, memory management, concurrency model
- **Reviewers:** Tech Lead, DB Lead, DevOps Lead
- **Examples:** Redis caching layer, pagination overhaul, backpressure handling

### AI RFC

- **Scope:** LLM integration, agent architecture, RAG pipeline, prompt engineering, model selection
- **Reviewers:** Tech Lead, AI Lead, Security Engineer
- **Examples:** Real LLM integration, streaming implementation, tool-calling framework

### Database RFC

- **Scope:** Schema changes, migration strategy, indexing, data consistency, transaction boundaries
- **Reviewers:** Tech Lead, DB Lead
- **Examples:** Adding new tables, Prisma transaction wrapping, audit trail schema

### Infrastructure RFC

- **Scope:** Deployment pipeline, Docker, Kubernetes, CI/CD, monitoring, logging, secrets infrastructure
- **Reviewers:** Tech Lead, Security Engineer, DevOps Lead
- **Examples:** Docker-compose changes, K8s probe setup, secrets management infra

---

## 5. RFC Index

| RFC ID  | Title                                  | Related Gap IDs                          | Category       | Est. Effort | Priority |
| ------- | -------------------------------------- | ---------------------------------------- | -------------- | :---------: | :------: |
| RFC-001 | Secrets Removal & Rotation             | XEN-GAP-0001                             | Security       |     4h      |    P0    |
| RFC-002 | NestJS Config & Environment Validation | XEN-GAP-0011, XEN-GAP-0080               | Infrastructure |     4h      |    P0    |
| RFC-003 | Prisma Transaction Wrapping            | XEN-GAP-0013                             | Database       |     12h     |    P0    |
| RFC-004 | Idempotency Key Implementation         | XEN-GAP-0014                             | API            |     8h      |    P0    |
| RFC-005 | Graceful Shutdown Implementation       | XEN-GAP-0010, XEN-GAP-0078               | Infrastructure |     2h      |    P0    |
| RFC-006 | AI Pipeline Real LLM Integration       | XEN-GAP-0007, XEN-GAP-0008, XEN-GAP-0015 | AI             |     18h     |    P0    |
| RFC-007 | Real SSE Streaming Implementation      | XEN-GAP-0021                             | AI             |     12h     |    P0    |
| RFC-008 | UserController Guard Addition          | XEN-GAP-0002                             | Security       |     1h      |    P0    |

### RFC Descriptions

#### RFC-001: Secrets Removal & Rotation

- **Problem:** JWT keys, API keys, DB passwords, and other production secrets are committed to git across `.env` files and `infrastructure/docker/secrets/`. Secrets must be removed from history and rotated.
- **Key decisions:** BFG Repo-Cleaner approach vs. repo rewrite; secrets injection strategy (Docker secrets vs. env vars vs. Vault); rotation cadence.

#### RFC-002: NestJS Config & Environment Validation

- **Problem:** `ConfigModule.forRoot()` is never called. All services read `process.env.*` directly with no validation. Missing env vars silently default to `undefined`.
- **Key decisions:** Joi vs. class-validator for schema; global vs. per-module ConfigModule; env file loading order; runtime validation behavior on startup.

#### RFC-003: Prisma Transaction Wrapping

- **Problem:** Zero usage of `$transaction` across the codebase. Multi-step operations (workspace + member creation, payment + invoice + transaction, token generation + session) are not atomic.
- **Key decisions:** Interactive vs. batch transactions; isolation level; compensation/rollback for cross-service ops (MinIO + DB); outbox pattern scope.

#### RFC-004: Idempotency Key Implementation

- **Problem:** No `Idempotency-Key` header checking on any POST endpoint. Duplicate registration, double billing, and duplicate calculations are possible.
- **Key decisions:** Redis vs. DB storage for processed keys; TTL window; cached response return strategy; middleware vs. decorator approach; idempotency key generation guidance.

#### RFC-005: Graceful Shutdown Implementation

- **Problem:** No `app.enableShutdownHooks()`, no SIGTERM/SIGINT handlers. Pod termination drops active connections and leaks database connections.
- **Key decisions:** Drain timeout duration; connection close ordering (HTTP → RabbitMQ → DB → Redis); `OnModuleDestroy` implementation scope; Kubernetes `preStop` hook integration.

#### RFC-006: AI Pipeline Real LLM Integration

- **Problem:** `ElectricalEngineerAgent` uses hardcoded if/else rules — no LLM ever called. `ExecutionPipelineService` echoes user messages. `LlmProvider` falls back to mock in production.
- **Key decisions:** Provider selection (Groq vs. OpenAI vs. Claude); model routing strategy; tool-calling loop architecture; fallback behavior in production; Python ↔ NestJS integration boundary.

#### RFC-007: Real SSE Streaming Implementation

- **Problem:** `LlmProvider.chatStream()` waits for full LLM response, splits into words, and yields with artificial 15ms delays — not real streaming. TTFB is same as non-streaming.
- **Key decisions:** SSE protocol compliance; backpressure handling; `StreamingResponseManager` integration; Python agent streaming alignment; cancellation propagation.

#### RFC-008: UserController Guard Addition

- **Problem:** All endpoints in `UserController` have zero guards. Any unauthenticated user can list, create, delete, or hard-delete any user account.
- **Key decisions:** `JwtAuthGuard` + `AdminGuard` combination; role-based permission checks; hard-delete confirmation workflow; audit logging for admin actions.

---

## 6. Decision Records

### How RFC Decisions Are Captured

When an RFC is approved, the resulting architectural decisions are captured in **Architecture Decision Records (ADRs)** stored at `docs/adr/ADR-NNN.md`.

### Linking RFCs to ADRs

- Each RFC **may** produce one or more ADRs
- Each ADR **must** reference the RFC that triggered it via the `Related RFC` field
- The RFC's frontmatter `related-adrs` field lists all ADRs spawned from it

### Decision Log Template

```markdown
---
adr-id: ADR-NNN
title: ''
status: Accepted
rfc-id: RFC-NNN
date: YYYY-MM-DD
---

# ADR-NNN: {Title}

## Context

{Why was this decision needed? What factors constrained the decision?}

## Decision

{The decision itself — what was chosen, and at what level of detail?}

## Consequences

{What becomes easier or harder as a result of this decision?}

## Compliance

{How will we verify this decision is followed in code?}

## Related

- **RFC:** RFC-NNN
- **Supersedes:** ADR-MMM (if applicable)
- **Superseded by:** ADR-OOO (if applicable)
```

### Decision Log Index

A running index of all ADRs is maintained at `docs/adr/README.md`. Each entry includes:

| ADR ID  | Title   | RFC ID  | Status   | Date       |
| ------- | ------- | ------- | -------- | ---------- |
| ADR-001 | {title} | RFC-001 | Accepted | 2026-07-02 |

### Change History

Each ADR documents its own change history, and the parent RFC documents which ADRs it produced. This bidirectional linking ensures traceability from problem statement (Gap → RFC) through design decision (RFC → ADR) to implementation (ADR → code).
