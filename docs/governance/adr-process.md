# Architecture Decision Records (ADR) — Process & Governance

**Version:** 1.0.0
**Last updated:** 2026-07-02
**Owner:** Architecture Review Board (ARB)

---

## 1. ADR Template

Every ADR is a single markdown file at `docs/governance/adr/ADR-NNN.md` following this template:

```markdown
# ADR-NNN: <Title>

- **Status:** <Proposed | Accepted | Deprecated | Superseded>
- **Date:** YYYY-MM-DD
- **Decision makers:** <list of people involved>
- **Supersedes:** <ADR-NNN if applicable>
- **Superseded by:** <ADR-NNN if applicable>

## Context

What is the problem? Why is this decision needed? What constraints or forces are at play?

## Decision

What was decided? Be specific — include interface shapes, provider choices, architectural patterns.

## Consequences

What tradeoffs were made? What becomes easier? What becomes harder? What risks remain?

## Compliance

How to verify that implementations conform to this ADR:

- Automated checks (lint rules, tests, type checks)
- Manual review criteria
- Enforcement tooling (if any)

## Notes

- References to gap-registry: XEN-GAP-XXXX
- References to other ADRs: ADR-NNN
- Open questions or follow-up decisions
```

### Metadata frontmatter (optional but recommended)

When tooling is in place, ADRs may include YAML frontmatter for machine readability:

```yaml
---
title: ADR-NNN: Title
status: Proposed
date: 2026-07-02
deciders: [person1, person2]
supersedes: []
superseded_by: []
gaps: [XEN-GAP-XXXX]
tags: [ai, security, architecture]
---
```

---

## 2. ADR Lifecycle

```
                     +---------+
                     |  DRAFT  |
                     +----+----+
                          |
                    Author signals
                    ready for review
                          |
                     +----v----+
                     | PROPOSED|
                     +----+----+
                          |
                    Review period
                    (5 business days)
                          |
                 +--------+--------+
                 |                 |
          Consensus?          Objections?
                 |                 |
            +----v----+       +----v----+
            | ACCEPTED|       |  DRAFT  |
            +----+----+       +----+----+
                 |              (revise)
            Implementation
                 |
            (later) Needs
            fundamental change?
                 |
            +----v----+
            |DEPRECATED|
            +----+----+
                 |
       New ADR replaces it
                 |
            +----v----+
            |SUPERSEDED|
            +---------+
```

### Stage descriptions

| Stage          | Description                                                                              | Time limit      | Exit criteria                         |
| -------------- | ---------------------------------------------------------------------------------------- | --------------- | ------------------------------------- |
| **Draft**      | Author is developing the proposal. May share informally for early feedback.              | No limit        | Author marks ready for review         |
| **Proposed**   | Formally submitted to ARB. Review period begins.                                         | 5 business days | All ARB members vote                  |
| **Accepted**   | Approved by ARB. Implementations must conform.                                           | —               | Majority approval + no veto           |
| **Deprecated** | Still valid but no longer recommended for new work. Existing implementations may remain. | —               | ARB decision + replacement ADR exists |
| **Superseded** | Replaced by a newer ADR. Existing implementations should migrate.                        | —               | Superseding ADR accepted              |

---

## 3. Approval Workflow

### Who proposes ADRs

Any engineer or architect on the Xennic team may author and propose an ADR. ADRs are mandatory for:

- New external service or provider integrations
- Changes to data model conventions (cascade, enums, UUID)
- Security architecture decisions
- AI/ML model selection and prompt architecture
- Protocol or API contract changes
- Infrastructure topology changes
- Testing framework or coverage policy changes

### Architecture Review Board (ARB)

The ARB is the body responsible for reviewing and accepting ADRs. Current members:

- Tech Lead (chair)
- CTO (approver)
- AI Architect (AI-domain ADRs)
- Security Lead (security-domain ADRs)
- Database Lead (schema-domain ADRs)

### Voting rules

| Vote        | Requirement                                               |
| ----------- | --------------------------------------------------------- |
| **Approve** | Simple majority of ARB members                            |
| **Veto**    | Any single ARB member may veto with written justification |
| **Abstain** | Recorded but counts toward quorum                         |

- **Quorum:** 60% of ARB members must vote
- **Voting period:** 5 business days from proposal
- **Vote types:** Approve, Reject (with reason), Abstain

### Escalation path

1. If an ADR is vetoed, the author revises and re-proposes (returns to Draft).
2. If consensus cannot be reached after 2 revision cycles, the CTO makes a binding decision.
3. Emergency ADRs (security vulnerabilities, production outages) may skip review with CTO approval and must be ratified within 3 business days.

---

## 4. Versioning

### ADR numbering

- ADRs are sequentially numbered: `ADR-001`, `ADR-002`, ...
- Numbers are never reassigned or reused.
- The index is maintained in this file under §6.

### Updating an existing ADR

| Type of change                                                          | Method                                                                          |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Clarification (typos, formatting, examples)                             | Direct edit to accepted ADR with `--- last revised: YYYY-MM-DD` added to header |
| Substantive change (new options, changed rationale, different decision) | Supersede — create new ADR, old one marked `Superseded`                         |
| Minor scope extension (compatible with original decision)               | ADR amendment — create `ADR-NNN-A.md` with amendment notes                      |

### Supersession rules

1. When ADR-N is superseded by ADR-M, ADR-N gets `**Superseded by:** ADR-M` in its header.
2. ADR-M gets `**Supersedes:** ADR-N` in its header.
3. All code referencing ADR-N must update references to ADR-M within one milestone.
4. Supersession requires the same ARB approval as a new ADR.

---

## 5. Cross-Reference Rules

### ADR ↔ Code

- Every feature branch or PR that implements an architectural decision **must** reference the relevant ADR in its PR description.
- Every module README or docstring may reference the ADR for rationale.

### ADR ↔ Gap Registry

- Every ADR **must** list the gap IDs from `docs/implementation/gap-registry.md` that it addresses.
- Gaps cannot be closed without an accepted ADR governing the approach.
- Gap closures in the registry should reference the resolving ADR.

### Bidirectional linking

| Artifact              | Links to                                              |
| --------------------- | ----------------------------------------------------- |
| ADR                   | `XEN-GAP-XXXX` gap IDs, `ADR-NNN` supersession        |
| Gap registry entry    | `ADR-NNN` in resolution notes                         |
| PR / commit           | `ADR-NNN` in description                              |
| Implementation (code) | `// ADR-NNN` inline comment for non-obvious decisions |

---

## 6. Initial ADR Index

The following ADRs are required for **Phase 8.7** of the Xennic platform. They are listed in priority order for implementation.

### ADR-001: AI LLM Integration Strategy

- **Context:** The AI module uses hardcoded mock responses (`_smartMock()`), a passthrough echo pipeline, and a silent fallback that returns plausible but incorrect engineering advice. No actual LLM call has ever been made in production.
- **Related gaps:** XEN-GAP-0007, XEN-GAP-0008, XEN-GAP-0015, XEN-GAP-0021, XEN-GAP-0027, XEN-GAP-0056
- **Priority:** P0

### ADR-002: Multi-Provider Embedding Pipeline

- **Context:** Embeddings are generated from `hash(str(dimension))` producing identical vectors for all documents (cosine similarity = 1.0 for any pair). The chunker uses fixed 500-word counts with no token awareness. No cross-encoder re-ranking or hybrid search exists.
- **Related gaps:** XEN-GAP-0009, XEN-GAP-0025, XEN-GAP-0026, XEN-GAP-0034, XEN-GAP-0039, XEN-GAP-0093, XEN-GAP-0094, XEN-GAP-0095
- **Priority:** P0

### ADR-003: Real-Time Streaming Architecture

- **Context:** `LlmProvider.chatStream()` waits for the full LLM response, splits it into words, and yields with artificial 15ms delays — this is not real streaming. No backpressure handling exists for streaming responses.
- **Related gaps:** XEN-GAP-0021, XEN-GAP-0077
- **Priority:** P0

### ADR-004: Memory Persistence Strategy

- **Context:** All session, memory, and prompt template stores use unbounded in-memory `Map`/`Array` data structures with no eviction, TTL, or size limits. Data is lost on restart. No Redis caching layer exists anywhere in the codebase.
- **Related gaps:** XEN-GAP-0012, XEN-GAP-0020
- **Priority:** P0

### ADR-005: Citation & Evidence Chain Design

- **Context:** The `Source` Pydantic model is defined but never populated. No citation engine, provenance tracking, hallucination guardrails, confidence scoring, or conflict resolution exists. AI responses have no traceability to source documents.
- **Related gaps:** XEN-GAP-0029, XEN-GAP-0030, XEN-GAP-0031, XEN-GAP-0032, XEN-GAP-0033
- **Priority:** P1

### ADR-006: Agent Orchestration Architecture

- **Context:** The ElectricalEngineerAgent uses hardcoded if/else rules instead of LLM calls. Ten tool functions are defined but never registered or invoked. The NestJS execution pipeline echoes user messages instead of routing to Python AI service. Cross-module coupling forces eager loading chains.
- **Related gaps:** XEN-GAP-0007, XEN-GAP-0008, XEN-GAP-0028, XEN-GAP-0052, XEN-GAP-0056
- **Priority:** P1

### ADR-007: Prisma Schema Governance

- **Context:** 20+ relations lack `onDelete` cascade, 49+ string fields should be enums, all UUIDs are stored as TEXT instead of `@db.Uuid`, 10+ foreign keys lack indexes, and zero Prisma transactions are used. No `@@map`/`@@schema` annotations exist.
- **Related gaps:** XEN-GAP-0013, XEN-GAP-0043, XEN-GAP-0044, XEN-GAP-0045, XEN-GAP-0046, XEN-GAP-0047, XEN-GAP-0048, XEN-GAP-0067, XEN-GAP-0068, XEN-GAP-0069
- **Priority:** P1

### ADR-008: Security Architecture

- **Context:** JWT private keys are committed to git, UserController has zero auth guards, SSRF is possible via webhook delivery, hard-delete endpoints are public, security headers are missing, prompt injection is unmitigated, PermissionsGuard is fail-open, CORS uses wildcard in Python services, and no MFA, account lockout, or audit trail exists.
- **Related gaps:** XEN-GAP-0001, XEN-GAP-0002, XEN-GAP-0003, XEN-GAP-0004, XEN-GAP-0005, XEN-GAP-0006, XEN-GAP-0019, XEN-GAP-0022, XEN-GAP-0066, XEN-GAP-0070, XEN-GAP-0071, XEN-GAP-0072, XEN-GAP-0091, XEN-GAP-0092
- **Priority:** P0

### ADR-009: Production Readiness Foundation

- **Context:** No graceful shutdown, no environment variable validation, no idempotency on POST endpoints, timer leaks in HTTP clients, no readiness/liveness probes, no circuit breaker, no request ID tracing, no retry policy, no background job queue, and `@nestjs/config` is not initialized.
- **Related gaps:** XEN-GAP-0010, XEN-GAP-0011, XEN-GAP-0014, XEN-GAP-0017, XEN-GAP-0018, XEN-GAP-0050, XEN-GAP-0073, XEN-GAP-0077, XEN-GAP-0078, XEN-GAP-0079, XEN-GAP-0080, XEN-GAP-0096, XEN-GAP-0099
- **Priority:** P0

### ADR-010: Testing Strategy & Coverage Targets

- **Context:** 21 of 27 API modules have zero tests (8.72% overall coverage), 15 Python tests are failing, there are zero frontend tests, no E2E tests for critical flows, no concurrency tests, no CI/CD pipeline, and lint is broken for 4 of 6 packages.
- **Related gaps:** XEN-GAP-0059, XEN-GAP-0060, XEN-GAP-0081, XEN-GAP-0082, XEN-GAP-0083, XEN-GAP-0084, XEN-GAP-0085, XEN-GAP-0090
- **Priority:** P0

### ADR-011: Knowledge Factory Architecture & Implementation

- **Context:** The `knowledge-factory` module exists as an empty directory with DDD scaffolding but zero implementation. The existing `knowledge` module provides manual article creation/editing. There is no automated pipeline to ingest raw engineering documents (PDFs, images, DWGs) and convert them into searchable knowledge articles with RAG-ready vector embeddings.
- **Related gaps:** XEN-GAP-0057, XEN-GAP-0001, XEN-GAP-0016, XEN-GAP-0029, XEN-GAP-0031
- **Priority:** P1

---

## Appendix A: ADR File Checklist

Before an ADR leaves Draft status, verify:

- [ ] Title clearly states the decision scope
- [ ] Context describes the problem without presupposing the solution
- [ ] Decision is specific enough to implement
- [ ] Consequences include both benefits and tradeoffs
- [ ] Compliance section has actionable verification steps
- [ ] At least one related gap ID is referenced
- [ ] Supersession links are correct (if applicable)
- [ ] File is named `ADR-NNN.md` and placed in `docs/governance/adr/`
- [ ] Index in this file is updated

## Appendix B: Emergency ADR Process

For security vulnerabilities or production emergencies requiring an immediate architectural decision:

1. Author drafts the ADR and sends to CTO + Tech Lead directly.
2. CTO may approve within 4 hours — ADR enters `Accepted (Emergency)` status.
3. Full ARB review must be completed within 3 business days.
4. If not ratified, the emergency ADR is reverted and a standard ADR process begins.

---

_This document is itself ADR-000 and was accepted on 2026-07-02._
