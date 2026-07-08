# 12 — Next Roadmap

> **Also see `docs/PROJECT_BOOTSTRAP.md` for the complete project bootstrap context including full roadmap, sprint history, and architecture details.**

**Date:** 2026-07-02

---

## Immediate Next Phase: Foundation Hardening

**Priority: CRITICAL** — Must fix before adding new features.

| Task | Effort | Dependencies | Risk |
|------|--------|-------------|------|
| Fix 98 `throw new Error` → NestJS exceptions | 2-4 wk | None | Low — mechanical refactor |
| Add lint scripts to all 6 packages; fix errors | 1 wk | None | Low |
| Move `@nestjs/throttler` to dependencies | 1 day | None | None |
| Add `venv/`, `__pycache__/`, `*.pyc` to .gitignore | 1 hour | None | None |
| Fix 15 failing Python tests (engineering-service) | 1 wk | None | Medium — may expose calc bugs |
| Install `openai` in ai-service venv; fix tests | 1 day | None | Low |
| Fix web build (Next.js timeout) | Unknown | Web team | High — unknown root cause |
| Set up CI/CD via GitHub Actions | 1-2 wk | Lint + test fixes first | Low |
| Add Helmet/CSP to Fastify (main.ts) | 1 day | None | None |

**Total estimated effort: 1-2 months**

---

## Phase A: Knowledge Factory (3-6 months)

| Task | Effort | Dependencies | Risk |
|------|--------|-------------|------|
| Design intake pipeline architecture | 2 wk | None | Low |
| Document classification + parser orchestration | 4 wk | Design | Medium |
| OCR integration + table extraction | 4 wk | Parser orchestration | Medium |
| Chunking strategies (semantic, recursive) | 2 wk | None | Low |
| Embedding generation (text + image) | 2 wk | Chunking | Medium |
| Storage abstraction + version management | 3 wk | None | Low |
| Citation tracking + provenance | 2 wk | Storage | Low |
| Publishing workflow | 2 wk | Storage | Low |
| Connect to ai-service RAG pipeline | 2 wk | Chunking + Embedding | Medium |

**Risks:**
- OCR accuracy on Persian engineering documents (DWG, PDF)
- Table extraction from complex engineering drawings
- Embedding quality for technical Persian content

---

## Phase B: Enterprise AI (2-3 months)

| Task | Effort | Dependencies | Risk |
|------|--------|-------------|------|
| Build formal RAG pipeline (retrieve → augment → generate) | 3 wk | Knowledge Factory | Medium |
| Agent orchestration layer (tool registry, routing) | 3 wk | RAG pipeline | Medium |
| Memory/context management | 2 wk | Orchestration | Low |
| Safety guardrails + content filtering | 2 wk | None | Low |
| Multi-agent coordination | 3 wk | Orchestration | High |
| Engineering-specific guardrails | 2 wk | Safety | Medium |
| Response validation + confidence scoring | 2 wk | None | Medium |

**Risks:**
- LLM hallucination on engineering calculations
- Multi-agent coordination complexity
- Latency in multi-agent workflows

---

## Phase C: Enterprise Modules (2-3 months)

| Task | Effort | Dependencies | Risk |
|------|--------|-------------|------|
| enterprise-config — workspace configuration | 3 wk | None | Low |
| enterprise-background — background job processing | 4 wk | RabbitMQ | Medium |
| enterprise-backup — backup/restore workflows | 3 wk | Storage | Medium |
| enterprise-performance — monitoring + profiling | 3 wk | None | Low |

---

## Phase D: Testing Expansion (ongoing)

| Task | Effort | Dependencies | Risk |
|------|--------|-------------|------|
| Unit tests for auth module | 2 wk | None | Low |
| Unit tests for rbac module | 2 wk | None | Low |
| Unit tests for user, project, engineering | 2 wk | None | Low |
| Unit tests for billing, subscription | 2 wk | None | Low |
| Integration tests for critical flows | 3 wk | Unit tests | Medium |
| E2E tests for main user journeys | 2 wk | Integration tests | Medium |
| Load/stress tests | 2 wk | E2E tests | Low |

---

## Phase E: Production Hardening (1-2 months)

| Task | Effort | Dependencies | Risk |
|------|--------|-------------|------|
| Fix 85 `any` types | 2-4 wk | None | Low |
| Write proper README.md | 1 day | None | None |
| Set up pre-commit hooks + commitlint | 1 day | None | Low |
| Semantic versioning + tags | 1 day | None | None |
| Add .nvmrc, .node-version | 1 day | None | None |
| Create CHANGELOG.md | 1 day | None | None |

---

## Roadmap Visualization

```
Now        │ Q3 2026        │ Q4 2026        │ Q1 2027        │ Q2 2027
───────────┼────────────────┼────────────────┼────────────────┼────────────────
██████████ │ ██████████████ │ ██████████████ │ ██████████████ │
FOUNDATION │ KNOWLEDGE FACT │ ENTERPRISE AI   │ ENTERPRISE MOD │
HARDENING  │ ORY            │                 │ ULES           │
           │                │                 │                │
           │ ██████████████ │ ██████████████ │ ██████████████ │
           │ TESTING (ongoing throughout)    │ PRODUCTION     │
           │                │                 │ HARDENING      │
```

---

## Priority Matrix

| Quadrant | Items |
|----------|-------|
| **Urgent + Important** (Do Now) | Fix throw Error (critical), Fix lint (4 pkgs), Fix throttler deps, Fix .gitignore, Fix 15 Python test failures, Fix ai-service tests |
| **Important + Not Urgent** (Schedule) | Knowledge Factory, Enterprise AI, Enterprise Modules, Testing Expansion, RAG pipeline |
| **Urgent + Not Important** (Delegate) | Web build timeout investigation, venv cleanup, stale STATUS_REPORT.md |
| **Not Urgent + Not Important** (Later) | README rewrite, contributing guide, license, version tags, CHANGELOG |

---

## Overall Timeline

| Phase | Effort | Start | End |
|-------|--------|-------|-----|
| Foundation Hardening | 1-2 mo | Immediate | Aug 2026 |
| Knowledge Factory (Phase A) | 3-6 mo | Aug 2026 | Feb 2027 |
| Enterprise AI (Phase B) | 2-3 mo | Q4 2026 | Q1 2027 |
| Enterprise Modules (Phase C) | 2-3 mo | Q1 2027 | Q2 2027 |
| Testing Expansion (Phase D) | Ongoing | Aug 2026 | Ongoing |
| Production Hardening (Phase E) | 1-2 mo | Q2 2027 | Q3 2027 |
| **Production Ready** | **~12-14 mo** | **Jul 2026** | **~Sep 2027** |
