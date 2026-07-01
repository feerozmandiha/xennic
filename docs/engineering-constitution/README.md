# Xennic Engineering Constitution

> The definitive guide to engineering standards, processes, and conventions for the Xennic
> platform. Every engineer, AI agent, and reviewer working on Xennic MUST read and follow
> these documents.

---

## What This Directory Contains

This directory houses the **Xennic Engineering Constitution** — a set of living documents
that define how we build, test, document, release, and maintain the Xennic platform. These
documents are the single source of truth for engineering standards.

They are documents, not suggestions. Violations should be flagged in code review and tracked
as process debt.

---

## Who Must Read It

| Role                    | Must read                                                  |
|-------------------------|------------------------------------------------------------|
| New developer           | All documents, in order (01 → 12)                          |
| Senior engineer         | All documents, focus on architecture and review sections   |
| Engineering manager     | All documents, focus on process and compliance             |
| DevOps / SRE            | 08-deployment, 12-release-management                       |
| Security engineer       | 07-security, 10-ai-agent-development-rules                 |
| AI coding agent         | 10-ai-agent-development-rules (mandatory), all others (reference) |
| Code reviewer           | 11-definition-of-done, 05-code-review                      |
| Product manager         | 02-development-workflow, 12-release-management             |
| QA engineer             | 04-testing-strategy, 11-definition-of-done                 |

---

## How to Use It

- **First time reading**: Start with `01-introduction.md` and read sequentially through `12-release-management.md`.
- **Reference**: Use this README as a navigation map to jump to relevant sections.
- **Checklist**: The Definition of Done (`11-definition-of-done.md`) is your daily companion for every PR.
- **AI agents**: Begin with `10-ai-agent-development-rules.md` — compliance is mandatory.
- **Updates**: Propose changes via PR. All constitution documents require team review.

---

## Document Map

| File | Description | Target audience | Pages |
|------|-------------|-----------------|-------|
| [01-architecture-principles.md](./01-architecture-principles.md) | System architecture, invariants, patterns | Architects, all developers | —
| [02-development-workflow.md](./02-development-workflow.md) | Git flow, PR process, review workflow | All developers | —
| [03-coding-standards.md](./03-coding-standards.md) | Language conventions, formatting, linting | All developers | —
| [04-testing-strategy.md](./04-testing-strategy.md) | Test pyramid, coverage, CI testing | QA, all developers | —
| [05-code-review.md](./05-code-review.md) | Review process, checklist, expectations | All developers, reviewers | —
| [06-api-design.md](./06-api-design.md) | REST conventions, response format, versioning | Backend, frontend | —
| [07-security.md](./07-security.md) | Security standards, OWASP, secrets | All developers, security | —
| [08-deployment.md](./08-deployment.md) | Deployment process, environments, runbooks | DevOps, backend | —
| [09-documentation-standards.md](./09-documentation-standards.md) | Markdown, Mermaid, ADRs, cross-refs | All developers, docs team | —
| [10-ai-agent-development-rules.md](./10-ai-agent-development-rules.md) | Rules for AI coding agents | AI agents, AI-assisted devs | —
| [11-definition-of-done.md](./11-definition-of-done.md) | Completion checklist for every change | All developers, reviewers | —
| [12-release-management.md](./12-release-management.md) | Release types, cadence, checklists | DevOps, release managers | —

---

## Related Documentation

| Location | Description |
|----------|-------------|
| `docs/decisions/` | Architecture Decision Records (ADRs) |
| `docs/guides/` | How-to guides (getting started, deployment, etc.) |
| `docs/api/` | API reference documentation (supplements OpenAPI) |
| `docs/openapi/` | Auto-generated OpenAPI specifications |
| `docs/archive/` | Archived/outdated documentation |
| `CHANGELOG.md` | Project changelog |
| `AGENTS.md` | AI agent setup and project overview |

---

## Quick Navigation by Role

### New Developer

1. `01-architecture-principles.md` — Understand the system.
2. `03-coding-standards.md` — Write code that fits in.
3. `06-api-design.md` — Work with the API layer.
4. `04-testing-strategy.md` — Write tests correctly.
5. `11-definition-of-done.md` — Know when you're done.

### Architect

1. `01-architecture-principles.md` — Core invariants.
2. `09-documentation-standards.md` — ADR format, cross-refs.
3. `07-security.md` — Security architecture.
4. `12-release-management.md` — Release planning.

### DevOps

1. `08-deployment.md` — Deployment runbooks.
2. `12-release-management.md` — Release process.
3. `02-development-workflow.md` — Branch strategy.
4. `07-security.md` — Infrastructure security.

### AI Agent

1. **`10-ai-agent-development-rules.md`** — Mandatory rules.
2. `11-definition-of-done.md` — Verification checklist.
3. `09-documentation-standards.md` — Documentation conventions.
4. `03-coding-standards.md` — Code style to follow.

### Reviewer

1. `05-code-review.md` — Review process.
2. `11-definition-of-done.md` — What to verify.
3. `06-api-design.md` — API correctness.
4. `07-security.md` — Security review items.

---

## Governance

The Engineering Constitution is owned by the **Engineering Standards Committee** (ESC).

- **Changes**: Propose via PR with `constitution` label.
- **Review**: Requires 2 approvals from ESC members.
- **Frequency**: Reviewed quarterly; emergency amendments accepted anytime.
- **Versioning**: Each document has its own version in frontmatter.
- **Compliance**: Automated checks planned (lint, link validation, stale doc detection).

---

## Version

| Document | Latest version | Last reviewed |
|----------|---------------|---------------|
| Constitution overview | 1.0.0 | 2026-06-26 |

---

> *"Standards are not constraints — they are shared understanding."*
