# Xennic — AI Session Contract

> **Tool-independent governance contract for all AI coding agents.**
> Applies to: Cursor, OpenCode, Claude Code, Codex, ChatGPT, Gemini, and any future AI agent.

---

## 1. Required Startup Sequence

Every AI agent MUST complete this sequence before ANY code modification:

| Step | Action | Artifact | Status |
|------|--------|----------|--------|
| 1.1 | Read PROJECT_BOOTSTRAP.md | `docs/PROJECT_BOOTSTRAP.md` | ⬜ |
| 1.2 | Execute AI Startup Checklist (Section 15) | Within bootstrap doc | ⬜ |
| 1.3 | Read STATUS_REPORT.md | `docs/STATUS_REPORT.md` | ⬜ |
| 1.4 | Read critical-path.md | `docs/critical-path.md` | ⬜ |
| 1.5 | Read AI_SESSION_CONTRACT.md | `docs/AI_SESSION_CONTRACT.md` | ⬜ |
| 1.6 | Read AGENTS.md | `AGENTS.md` | ⬜ |
| 1.7 | Run bootstrap-check.sh | `scripts/bootstrap/bootstrap-check.sh` | ⬜ |
| 1.8 | Verify bootstrap version compatibility | Section 16 of bootstrap doc | ⬜ |
| 1.9 | Wait for explicit user instruction | User message | ⬜ |

**Rule:** If any step fails or is incomplete, STOP. Report the issue to the user.

---

## 2. Required Project Understanding

Before coding, the agent MUST demonstrate understanding of:

| Domain | Required Knowledge | Verification |
|--------|-------------------|-------------|
| **Architecture** | Monorepo structure, NestJS + Fastify, DDD layering, event-driven patterns | Summarize in first response |
| **Modules** | All registered modules, their purpose, status, dependencies | Reference module registry |
| **Sprint History** | Completed sprints, current sprint, deliverables | State current phase |
| **Technical Debt** | Open issues, known limitations, temporary implementations | List relevant blockers |
| **Coding Standards** | DDD rules, import rules (.js extension), testing conventions | Follow in all code |
| **Event Topology** | 12 domain events, outbox pattern, idempotency | Reference in event-related changes |
| **AI Infrastructure** | 10 EI modules, 8 providers, provider neutrality | Reference in AI changes |
| **Database Schema** | Key entities, multi-tenancy, Prisma conventions | Follow in schema changes |

---

## 3. Required Architecture Validation

Before modifying any module, validate:

| Check | Description | Command / Evidence |
|-------|-------------|-------------------|
| Module boundaries | Does the change respect DDD layer boundaries? | Check imports |
| Dependency direction | Is the dependency flow correct? (domain ← application ← infrastructure ← presentation) | Check imports |
| Workspace isolation | Does the change respect `workspace_id` multi-tenancy? | Code review |
| Event idempotency | If adding event handlers, is idempotency enforced? | Check event_process_log |
| Repository pattern | Is data access through repository interfaces? | Check Prisma access |
| Import convention | Are `.js` extensions used for relative imports? | Code review |
| Backward compatibility | Does the change break existing APIs? | Check existing callers |
| Test coverage | Are tests included for new code? | Check test files |

---

## 4. Required Dependency Validation

| Dependency | Validation |
|-----------|-----------|
| **pnpm workspaces** | Verify package names match `pnpm-workspace.yaml` roots |
| **NestJS modules** | Verify module imports match `api.module.ts` registration |
| **Prisma schema** | Run `pnpm db:generate` after schema changes |
| **TypeScript** | Run `pnpm typecheck` — MUST pass (0 errors) |
| **Python services** | Verify `requirements.txt` updates, run `ruff check src tests` |
| **Docker compose** | Verify service names and ports match compose files |
| **Environment variables** | Verify all new env vars are documented in `.env.example` |

---

## 5. Forbidden Actions

| Action | Reason | Alternative |
|--------|--------|-------------|
| ❌ Direct Prisma access in Controllers | Breaks repository pattern | Use service → repository |
| ❌ `throw new Error()` | Bypasses NestJS exception layer | Use NestJS `HttpException` subclasses |
| ❌ Barrel/index.ts re-exports | Hides dependency graph | Use explicit imports |
| ❌ Manual edits to `packages/openapi/v1/openapi.json` | Auto-generated file | Re-generate via `pnpm generate:openapi` |
| ❌ `.js` extension omitted in imports | Causes ESM resolution errors | Always include `.js` |
| ❌ Hard-coded secrets in source code | Security risk | Use environment variables |
| ❌ Raw `fetch()` to microservices | Bypasses circuit breaker | Use EngineeringClientService |
| ❌ Skipping bootstrap checklist | Missing project context | Complete all startup steps |
| ❌ Modifying code without reading bootstrap first | Uninformed changes | Read bootstrap first |
| ❌ Creating new modules without ADR | Architectural drift | Create ADR first |

---

## 6. Output Format

All AI agent responses MUST follow this format:

```
## Context
- Current file(s): path/to/file.ts
- Relevant module: module-name
- Sprint: O1 / P2 / etc.
- Bootstrap version: X.Y.Z

## Change Description
- What: short description
- Why: reason for change
- Impact: modules/services affected

## Verification
- [ ] pnpm typecheck passes
- [ ] pnpm test:e2e passes (if applicable)
- [ ] pnpm lint passes
- [ ] Bootstrap version compatible
```

---

## 7. Completion Checklist

Before marking any task as complete:

| # | Check | Done |
|---|-------|------|
| 1 | Bootstrap was read and understood | ⬜ |
| 2 | Architecture validation passed | ⬜ |
| 3 | Dependency validation passed | ⬜ |
| 4 | No forbidden actions committed | ⬜ |
| 5 | `pnpm typecheck` passes (0 errors) | ⬜ |
| 6 | `pnpm lint` passes (0 errors) | ⬜ |
| 7 | Tests pass (`pnpm test` or equivalent) | ⬜ |
| 8 | All changes respect DDD boundaries | ⬜ |
| 9 | All changes use `.js` extensions | ⬜ |
| 10 | Output format used in response | ⬜ |
| 11 | User has been notified of completion | ⬜ |

---

## 8. Contract Violations

If the AI agent violates this contract:

1. The session MUST be rolled back
2. The violation MUST be reported to the user
3. The startup sequence MUST be re-executed
4. The responsible agent MUST acknowledge the violation

**Severity Levels:**

| Level | Example | Action |
|-------|---------|--------|
| 🔴 Critical | Modified code without reading bootstrap | Immediate rollback |
| 🟡 High | Skipped architecture validation | Re-validate + fix |
| 🟠 Medium | Missing `.js` extension | Fix imports |
| 🔵 Low | Missing output format | Correct in next response |

---

*Contract version: 1.0.0*
*Last updated: 2026-07-06*
*Enforced by: Bootstrap Enforcement Layer (ADR-019)*
