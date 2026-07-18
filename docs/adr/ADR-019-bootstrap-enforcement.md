# ADR-019: Bootstrap Enforcement Layer

**Status:** Accepted
**Date:** 2026-07-06
**Deciders:** Chief Enterprise Architect
**Tags:** governance, bootstrap, ai-agents, session-contract

---

## Context

The Xennic codebase has grown to:

- ~2,000+ files across 41+ NestJS modules, 3 Python microservices, and shared packages
- 55+ Prisma models across 20+ domain groups
- 12 domain events with outbox pattern
- 10 Enterprise Intelligence modules (~12,000 LOC)
- 9 Enterprise Orchestration modules (in progress)
- 25+ audit documents and 9 ADRs

Previously, each AI agent (Cursor, OpenCode, Claude Code, Codex, etc.) would start a session without any enforced context-loading mechanism. This led to:

1. Code changes made without understanding the full architecture
2. Violation of DDD layer boundaries
3. Missing `.js` extensions in imports (causing ESM resolution errors)
4. Bypassing the repository pattern (direct Prisma access in controllers)
5. Not checking `event_process_log` for event handler idempotency
6. Inconsistent output formats between AI sessions
7. Repeated mistakes that were documented in AGENTS.md but not enforced

## Decision

Implement a **Bootstrap Enforcement Layer** — a set of governance artifacts and validation mechanisms that enforce mandatory context loading before any code modification.

### Components

| Component                  | Description                                            | Location                               |
| -------------------------- | ------------------------------------------------------ | -------------------------------------- |
| **PROJECT_BOOTSTRAP.md**   | Single entry point with full project context           | `docs/PROJECT_BOOTSTRAP.md`            |
| **AI_SESSION_CONTRACT.md** | Governance contract for AI agent sessions              | `docs/AI_SESSION_CONTRACT.md`          |
| **AGENTS.md** (updated)    | Mandatory startup sequence as first instruction        | `AGENTS.md`                            |
| **Bootstrap Validator**    | Shell script to validate governance artifact integrity | `scripts/bootstrap/bootstrap-check.sh` |
| **Bootstrap Versioning**   | Version compatibility section in PROJECT_BOOTSTRAP.md  | Section 16 of bootstrap doc            |

### Architecture

```
AI Agent Start
    │
    ▼
┌─────────────────────────────────────┐
│  AGENTS.md (first instruction)      │
│  → Read PROJECT_BOOTSTRAP.md        │
│  → Execute startup checklist        │
│  → Run bootstrap-check.sh           │
│  → Verify version compatibility     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  AI_SESSION_CONTRACT.md             │
│  → Required startup sequence        │
│  → Required understanding           │
│  → Architecture validation          │
│  → Dependency validation            │
│  → Forbidden actions                │
│  → Output format                    │
│  → Completion checklist             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  PROJECT_BOOTSTRAP.md               │
│  → 15+ sections of project context  │
│  → Module registry                  │
│  → Sprint history                   │
│  → Event topology                   │
│  → AI infrastructure                │
│  → Coding standards                 │
│  → Development rules                │
│  → AI Startup Checklist (Section 15)│
│  → Bootstrap Version (Section 16)   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  scripts/bootstrap/bootstrap-check  │
│  → Validates all artifacts exist    │
│  → Checks cross-references          │
│  → Verifies section completeness    │
│  → Exit 0 = valid, 1 = invalid      │
└──────────────┬──────────────────────┘
               │
               ▼
        READY FOR TASK
```

### Enforcement Mechanism

1. **First-instruction priority** — AGENTS.md now begins with the mandatory startup sequence as the very first content
2. **Validation gate** — `bootstrap-check.sh` must exit 0 before any work begins
3. **Version compatibility** — Bootstrap Version section ensures agents can detect stale context
4. **Cross-references** — All governance documents reference each other
5. **Contract violations** — AI_SESSION_CONTRACT.md defines severity levels for violations

## Consequences

### Positive

- **Consistent context** — Every AI session starts with the same complete project understanding
- **Reduced errors** — DDD violations, missing `.js` extensions, and repository bypasses are caught early
- **Tool independence** — The contract works for Cursor, OpenCode, Claude Code, Codex, and any future agent
- **Self-validating** — The bootstrap-check.sh script provides immediate feedback on artifact integrity
- **Version-aware** — Bootstrap versioning prevents stale-context issues
- **Audit trail** — The contract defines output format and completion checklist for every session

### Negative

- **Overhead** — ~2-3 minutes of reading before first code change
- **Upkeep** — Bootstrap Version must be bumped when significant architecture changes occur
- **Agent compliance** — AI agents must be instructed to follow the contract; cannot enforce programmatically

### Mitigations

- The startup overhead is a one-time cost per session that prevents hours of debugging
- Bootstrap Version updates are lightweight — single number change
- AGENTS.md serves as the authoritative instruction file; any agent that reads it is bound by its rules

## Alternatives Considered

| Alternative                                  | Reason for Rejection                                                                                 |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Pre-commit hook enforcing bootstrap read** | Technically infeasible — cannot detect if a human or AI has read a document                          |
| **Single monolithic README**                 | Too large to be useful; bootstrap breaks context into digestible sections                            |
| **AI-specific configuration file**           | Would only work for specific tools (e.g., cursor rules, claude.md) — violates tool-independence goal |
| **No enforcement (status quo)**              | Leads to repeated errors, inconsistent output, and architectural drift                               |

## Migration

1. **Existing AI agents** — Update AGENTS.md to point to PROJECT_BOOTSTRAP.md as the first instruction (done in ADR-019)
2. **Existing documentation** — Add cross-references from all governance documents to PROJECT_BOOTSTRAP.md (done in ADR-019)
3. **Future AI agents** — Any new tool configuration must reference `docs/PROJECT_BOOTSTRAP.md` as the single entry point
4. **Bootstrap Version** — Bump on every architecture-significant change (new module, new event, new ADR)

## References

- `docs/PROJECT_BOOTSTRAP.md` — The bootstrap document
- `docs/AI_SESSION_CONTRACT.md` — The session governance contract
- `AGENTS.md` — Agent startup instructions
- `scripts/bootstrap/bootstrap-check.sh` — Validation script
- `docs/STATUS_REPORT.md` — Module status
- `docs/critical-path.md` — Production dependency chain

---

_ADR-019 accepted: 2026-07-06_
_Enforced by: Bootstrap Enforcement Layer_
