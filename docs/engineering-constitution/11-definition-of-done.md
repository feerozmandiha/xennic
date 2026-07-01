# Definition of Done

> Cross-reference: → [docs/engineering-constitution/10-ai-agent-development-rules.md](./10-ai-agent-development-rules.md),
> → [docs/engineering-constitution/05-code-review.md](./05-code-review.md),
> → [docs/engineering-constitution/04-testing-strategy.md](./04-testing-strategy.md)

> A comprehensive checklist for every feature, change, or bug fix in the Xennic platform.
> Every item must be verified before a change can be considered "Done".

---

## WHY

Without a Definition of Done, every developer has their own standard for what "done" means.
One developer considers code written but untested as done; another considers deployed as done.
This leads to inconsistent quality, rework, and misunderstanding between team members. The
DoD is the single, shared answer to "is this change complete?"

## RATIONALE

The DoD serves as:

- **Quality baseline**: Every change meets a minimum quality bar, regardless of developer or urgency.
- **Reviewer's guide**: Code reviewers know exactly what to verify, reducing review variability.
- **AI agent's checklist**: AI agents can systematically verify their output before submission.
- **Onboarding tool**: New developers learn the team's quality expectations from day one.
- **Process gate**: PRs that do not meet the DoD are rejected, maintaining quality over schedule.

### How to use this document

1. Before starting work, review the relevant DoD sections for your change type.
2. As you complete work, verify each item in order.
3. Before submitting a PR, run through all applicable items and check them off.
4. The reviewer confirms DoD compliance during code review — missing items block merge.
5. For AI agents: the DoD is the final self-review checklist before submission.

---

## 1. Code

| # | Item                     | Description                                            | Verification method                  |
|---|--------------------------|--------------------------------------------------------|--------------------------------------|
| 1 | All code written         | Every line of code for the change has been written     | Git diff review                      |
| 2 | Follows standards        | Code conforms to project style guide and conventions   | `pnpm lint`, `pnpm format:check`     |
| 3 | No TODO / FIXME          | No unresolved TODO, FIXME, HACK, or XXX comments       | Grep for patterns, code review       |
| 4 | No dead code             | No commented-out code, unused imports, or dead branches | Lint, code review                    |
| 5 | No debug code            | No `console.log`, `print()`, `debugger`, or debug endpoints | Lint, code review, grep          |
| 6 | No console.log           | No debug logging in production code                    | Lint (ESLint no-console rule)        |
| 7 | Code reviewed            | Code has been reviewed by at least one human           | PR approval                          |
| 8 | No lint errors           | Zero lint errors (warnings may be acceptable per team agreement) | `pnpm lint`              |
| 9 | No type errors           | Zero type errors in TypeScript and Python              | `pnpm typecheck`, `mypy src`         |
| 10 | Builds successfully     | The project builds without errors                      | `pnpm build`                         |
| 11 | Branch up to date       | Branch is rebased on latest main and resolves conflicts | `git status`, CI check                |
| 12 | Commit messages follow convcommits | Commit messages follow conventional commits format | Manual review                        |

### Code quality notes

- **No TODO/FIXME**: If a TODO is intentional, it must reference a ticket: `// TODO(ABC-123)`.
- **No dead code**: Dead code includes unused exports, unreachable branches, and orphaned files.
- **No debug code**: Debug endpoints (`/debug`, `/test`) must never reach production.
- **Build includes all affected packages**: Verify with `pnpm build --filter=<affected>`.

---

## 2. Tests

| # | Item                       | Description                                               | Verification method                      |
|---|----------------------------|-----------------------------------------------------------|------------------------------------------|
| 1 | Unit tests added           | New logic is covered by unit tests                        | `pnpm test -- --coverage`                |
| 2 | Integration tests added    | Cross-component interactions are tested (where applicable) | Test pass, test review                  |
| 3 | E2E tests added            | End-to-end user workflows are tested (where applicable)   | Test pass, test review                   |
| 4 | All tests pass             | All existing and new tests pass                           | `pnpm test`                              |
| 5 | Coverage meets minimum     | Line coverage >= 80%, branch coverage >= 70%              | Coverage report                          |
| 6 | Edge cases tested          | Empty states, null inputs, boundary values tested         | Test review                              |
| 7 | Error paths tested         | Error handling paths are covered by tests                 | Test review                              |
| 8 | No flaky tests             | New tests are deterministic (no timing, ordering, or env deps) | Test review, repeated runs         |

### Test quality notes

- **Minimum coverage**: Line coverage >= 80%, branch coverage >= 70%. New code should aim higher.
- **Test naming**: `describe('Module')` + `it('should <expected behavior> when <condition>')`.
- **Test isolation**: Each test must be independently runnable — no shared mutable state.
- **Flaky tests**: A flaky test is worse than no test. Any new flaky test must be fixed or removed immediately.

---

## 2. Tests

| # | Item                       | Description                                               | Verification method                      |
|---|----------------------------|-----------------------------------------------------------|------------------------------------------|
| 1 | Unit tests added           | New logic is covered by unit tests                        | `pnpm test -- --coverage`                |
| 2 | Integration tests added    | Cross-component interactions are tested (where applicable) | Test pass, test review                  |
| 3 | E2E tests added            | End-to-end user workflows are tested (where applicable)   | Test pass, test review                   |
| 4 | All tests pass             | All existing and new tests pass                           | `pnpm test`                              |
| 5 | Coverage meets minimum     | Line coverage >= 80%, branch coverage >= 70%              | Coverage report                          |
| 6 | Edge cases tested          | Empty states, null inputs, boundary values tested         | Test review                              |
| 7 | Error paths tested         | Error handling paths are covered by tests                 | Test review                              |

---

## 3. Documentation

| # | Item                         | Description                                                  | Verification method           |
|---|------------------------------|--------------------------------------------------------------|-------------------------------|
| 1 | API docs updated             | OpenAPI spec updated (auto-generated from decorators)        | `pnpm generate:openapi`       |
| 2 | README updated               | Package/Service README updated if the change affects usage   | Manual review                 |
| 3 | ADR created                  | ADR written if the change is an architecture decision        | ADR file exists, reviewed     |
| 4 | Changelog updated            | Changelog entry added for the change                         | File review                   |
| 5 | Inline docs updated          | JSDoc/pydoc updated for changed public APIs                  | Manual review, doc lint       |
| 6 | Error reference updated      | New error codes documented in API error reference            | Manual review                 |
| 7 | Migration guide updated      | Breaking changes include migration guide for consumers       | Manual review                 |
| 8 | Deprecation notice added     | Deprecated features documented with removal timeline         | Manual review                 |

### Documentation notes

- **OpenAPI**: Always auto-generated via `pnpm generate:openapi`. Never edit `openapi.json` manually.
- **README**: Every package/service/app must have a README. Update it if the change affects public surface.
- **ADR**: Required for architecture changes, dependency additions, security model changes (see → [ADR section](./09-documentation-standards.md#3-adr-format)).
- **Changelog**: Follow Keep a Changelog format. Every PR gets at least one changelog entry.

---

## 4. Security

| # | Item                     | Description                                                 | Verification method               |
|---|--------------------------|-------------------------------------------------------------|-----------------------------------|
| 1 | No secrets exposed       | No API keys, passwords, tokens, or credentials in code      | `detect-secrets`, code review     |
| 2 | Input validation added   | All user inputs validated (type, length, format, range)     | Code review, test coverage        |
| 3 | Output encoding correct  | Output is properly encoded to prevent XSS and injection     | Code review, security scan        |
| 4 | Permission check added   | Authorization enforced for protected endpoints/operations   | Code review, integration tests    |
| 5 | Rate limiting considered | Rate limiting in place for public endpoints                 | Code review, config review        |
| 6 | Dependency scan clean    | No HIGH/CRITICAL vulnerabilities in new/existing dependencies | `pnpm audit`, `trivy`           |
| 7 | SQL injection prevention  | All database queries use parameterized input or ORM          | Code review, security scan        |
| 8 | CORS configured           | Cross-origin requests properly restricted                    | Code review, config review        |
| 9 | Security headers present  | CSP, HSTS, X-Frame-Options, X-Content-Type-Options           | Security scan, code review        |

### Security notes

- **Secrets**: Run `detect-secrets` before every commit. Never hardcode secrets in code, config, or comments.
- **Input validation**: Validate on the server (never trust client-only validation). Use class-validator for NestJS, Pydantic for Python.
- **Authorization**: Every protected endpoint must verify authentication AND authorization (workspace scope, role).
- **Rate limiting**: Public endpoints should have rate limiting configured. Internal endpoints may skip.

---

## 5. Performance

| # | Item                          | Description                                                  | Verification method               |
|---|-------------------------------|--------------------------------------------------------------|-----------------------------------|
| 1 | No N+1 queries                | Database queries are batched, eager-loaded, or optimized     | Code review, query log review     |
| 2 | Response time within budget   | API endpoints respond within defined SLO                     | Performance test, benchmark       |
| 3 | Memory/CPU impact assessed    | Change does not introduce memory leaks or CPU spikes         | Code review, resource monitoring  |
| 4 | Caching strategy applied      | Caching implemented where appropriate (Redis, in-memory)     | Code review, test                 |
| 5 | Database indexes considered   | New queries are covered by existing or new indexes           | Prisma schema review, query plan  |
| 6 | Bulk operations assessed      | Bulk endpoints evaluated for memory and timeout risks        | Code review, load test            |
| 7 | Connection pool size reviewed | Change does not exhaust database connection pool             | Code review, config review        |

### Performance notes

- **N+1 prevention**: Use Prisma `include` or `select` for eager loading. Never lazy-load relations in loops.
- **Response time SLOs**: p50 < 200ms, p95 < 500ms, p99 < 1s for API endpoints. Background jobs: p99 < 30s.
- **Caching**: Consider Redis caching for frequently accessed, infrequently changing data. Use cache invalidation on writes.
- **Database indexes**: Every query filter/join/sort column should be indexed. Use `EXPLAIN ANALYZE` to verify query plans.

---

## 6. Monitoring

| # | Item                                | Description                                                    | Verification method               |
|---|-------------------------------------|----------------------------------------------------------------|-----------------------------------|
| 1 | Logging added at appropriate level  | Operations logged at INFO, errors at ERROR, debug at DEBUG     | Code review, log review           |
| 2 | Metrics added (RED metrics)         | Rate, Errors, Duration metrics for the new component           | Metrics config review             |
| 3 | Health check endpoint covers dependency | Health check includes the new service/dependency             | Health check review, test         |
| 4 | Alert threshold defined             | Alert thresholds defined for critical metrics                  | Monitoring config review          |
| 5 | Dashboard updated                   | Grafana/Datadog dashboard updated if needed                    | Dashboard review                  |
| 6 | Log retention policy applied        | Log volume assessed, retention configured                     | Logging config review             |

### Monitoring notes

- **Logging levels**: ERROR for failures requiring human attention, WARN for unexpected but handled situations, INFO for significant lifecycle events, DEBUG for detailed troubleshooting.
- **Structured logging**: All logs must be structured JSON with consistent fields: `timestamp`, `level`, `service`, `correlationId`, `message`, `context`.
- **RED metrics**: Rate (requests/sec), Errors (error count/rate), Duration (latency distribution). Every new component needs these three.
- **Health checks**: Every service dependency must have a health check. The health endpoint aggregates all dependency statuses.

---

## 7. Operations

| # | Item                             | Description                                                    | Verification method               |
|---|----------------------------------|----------------------------------------------------------------|-----------------------------------|
| 1 | Migration written                | Prisma migration created for schema changes                    | `pnpm db:generate`, migration review |
| 2 | Migration reversible             | Down migration exists or schema change is additive             | Migration review                  |
| 3 | Env vars documented              | New environment variables added to `.env.example`              | File review                       |
| 4 | Restart required? documented     | Whether the change requires service restart documented in PR   | PR description                    |
| 5 | Rollback plan documented         | Rollback steps documented for the change                       | PR description                    |
| 6 | Feature flag added (if risky)    | Risky features behind feature flag for gradual rollout         | Code review, feature flag config  |
| 7 | Runbook updated                  | Operational runbook updated for new operational procedures     | Runbook review                    |

### Operations notes

- **Migrations**: Must be additive where possible (add column, then populate, then remove old). Avoid locking migrations.
- **Migration reversibility**: Every migration must have a down migration or be proven reversible (additive changes are inherently reversible).
- **Environment variables**: Add every new env var to `.env.example` with a comment describing its purpose, format, and whether it is required.
- **Feature flags**: Use feature flags for high-risk changes. Flags should be temporary — tracked with a ticket to remove them.

---

## 8. API

| # | Item                              | Description                                                    | Verification method                |
|---|-----------------------------------|----------------------------------------------------------------|------------------------------------|
| 1 | New endpoint follows standards    | Follows REST conventions, consistent naming, proper HTTP verbs | Code review                        |
| 2 | Response envelope correct         | Uses `{success, data, meta}` / `{success, error}` envelope     | Code review, integration test      |
| 3 | Pagination implemented            | List endpoints use cursor or offset pagination                 | Code review, test                  |
| 4 | Error codes defined               | All error responses have consistent error codes                | Code review, API docs review       |
| 5 | Validation added                  | Request body validated (class-validator / Pydantic)            | Code review, test                  |
| 6 | Auth/permission check added       | Protected endpoints enforce authentication and authorization   | Code review, integration test      |
| 7 | Rate limiting added               | Public endpoints have rate limiting configured                 | Code review, config review         |
| 8 | API versioning considered         | Breaking changes use versioned endpoint or header              | Code review                        |
| 9 | Deprecation header added          | Deprecated endpoints return Deprecation and Sunset headers     | Code review, test                  |

### API notes

- **REST conventions**: Use nouns for resources, verbs for actions only when necessary. Plural resource names (`/users`, not `/user`).
- **Pagination**: All list endpoints must support pagination. Use cursor-based pagination for large lists, offset-based for small/admin lists.
- **Error codes**: Every error response includes `code` (machine-readable string), `message` (human-readable), and `details` (optional structured data).
- **Validation**: Use DTOs with class-validator decorators (NestJS) or Pydantic models (FastAPI). Enable `whitelist: true` and `forbidNonWhitelisted: true`.

---

## 9. Frontend

| # | Item                    | Description                                                     | Verification method               |
|---|-------------------------|-----------------------------------------------------------------|-----------------------------------|
| 1 | Responsive              | UI works on mobile, tablet, and desktop breakpoints             | Visual test, browser test         |
| 2 | Bilingual (fa/en)       | All user-facing strings support Persian and English             | i18n config review                |
| 3 | RTL/LTR correct         | Right-to-left layout correct for Persian language               | Visual test                       |
| 4 | Loading states          | Loading spinners/skeletons shown during data fetch              | Visual test, component test       |
| 5 | Empty states            | Empty list/table states show appropriate message                | Visual test, component test       |
| 6 | Error states            | Error states show user-friendly error messages and retry action | Visual test, component test       |
| 7 | Analytics events added  | User interactions tracked with analytics events                 | Analytics config review, test     |
| 8 | Keyboard navigation     | Interactive elements accessible via keyboard                    | Manual test, a11y audit           |
| 9 | Screen reader support   | ARIA labels, semantic HTML, focus management                    | Manual test, a11y audit           |
| 10 | Theme support           | Works in both light and dark themes (if applicable)             | Visual test                       |

### Frontend notes

- **Responsive breakpoints**: Mobile (< 768px), Tablet (768px - 1024px), Desktop (> 1024px). Test all three.
- **Bilingual support**: Use next-intl for i18n. All user-facing strings go through translation functions. No hardcoded text.
- **RTL/LTR**: Persian (fa) is RTL. Layout must flip correctly. Test both directions.
- **Loading states**: Show spinner, skeleton, or progress indicator. Never show blank or frozen UI during loading.
- **Empty states**: Show helpful message and CTA when lists/tables are empty. Never show "No data" without context.
- **Error states**: Show user-friendly error message with retry action. Log technical details separately.

---

## 10. Backend

| # | Item                           | Description                                                      | Verification method               |
|---|--------------------------------|------------------------------------------------------------------|-----------------------------------|
| 1 | Idempotency implemented        | Mutations are idempotent (or documented why not)                 | Code review, integration test     |
| 2 | Correlation ID propagated      | Request correlation ID flows through all service calls           | Code review, log review           |
| 3 | Exception handling correct     | All exceptions caught, logged, and mapped to proper HTTP status  | Code review, test                 |
| 4 | Transaction boundaries correct | Database transactions cover atomic operations properly            | Code review, integration test     |
| 5 | Tenant isolation verified      | All queries scope to workspace_id, no cross-tenant data leak     | Code review, integration test     |
| 6 | Event emission verified        | Domain events emitted correctly and consumers handle them       | Code review, integration test     |
| 7 | Background job handling        | Async operations use background jobs with retry and DLQ         | Code review, test                 |
| 8 | Data consistency verified      | Eventual consistency or transaction boundaries documented       | Code review                       |

### Backend notes

- **Idempotency**: POST/PUT/PATCH mutations should be idempotent via idempotency key (`Idempotency-Key` header). PATCH with full replacement is naturally idempotent.
- **Correlation ID**: Every request gets a correlation ID at the API gateway. It propagates to all downstream service calls and logs.
- **Exception handling**: Never expose internal error details to clients. Map exceptions to appropriate HTTP status codes with safe messages. Log full details server-side.
- **Transactions**: Use database transactions for operations that modify multiple entities. Keep transaction scope minimal to avoid lock contention.
- **Tenant isolation**: Every query that accesses multi-tenant data MUST filter by `workspace_id`. Never omit this filter. Test with cross-tenant access attempts.

---

## 11. Knowledge (EKO)

| # | Item                          | Description                                                      | Verification method               |
|---|-------------------------------|------------------------------------------------------------------|-----------------------------------|
| 1 | EKO lifecycle correct         | Knowledge objects follow the EKO lifecycle (Draft → Review → Published → Archived) | EKO review      |
| 2 | Concept extraction triggers   | New concepts trigger extraction and indexing                     | EKO pipeline review               |
| 3 | Quality gate thresholds met   | Knowledge quality scores meet minimum thresholds                 | EKO quality report                |
| 4 | Cross-references resolved     | All cross-references in knowledge objects resolve correctly       | EKO validation                    |
| 5 | Knowledge object indexed      | Knowledge object is indexed and searchable in knowledge base     | EKO pipeline review               |

### Knowledge (EKO) notes

- **EKO lifecycle**: Every knowledge object follows: Draft → Review → Published → Archived. No knowledge object skips review.
- **Concept extraction**: When a new knowledge object is created, it must trigger concept extraction to build the knowledge graph.
- **Quality gates**: Knowledge quality is scored on accuracy, completeness, clarity, and relevance. Minimum scores are defined per domain.
- **Cross-references**: Knowledge objects must cross-reference related objects, decisions, and source code using the standard reference format.

---

## 12. AI

| # | Item                    | Description                                                       | Verification method                |
|---|-------------------------|-------------------------------------------------------------------|------------------------------------|
| 1 | Grounded response       | AI responses are grounded in verified knowledge sources           | AI output review, citation check   |
| 2 | Citation chain complete | Every claim in AI output has a complete citation chain            | Citation review                    |
| 3 | Confidence score included | AI responses include confidence score where appropriate          | AI output review                   |
| 4 | Hallucination check passed | AI output verified against source knowledge, no invented facts | Human review, automated check      |
| 5 | Source transparency      | AI response distinguishes between sourced, inferred, and assumed content | AI output review            |

### AI notes

- **Grounded responses**: AI must only use information from verified knowledge sources. No fabricated facts, statistics, or references.
- **Citation chain**: Every factual claim in an AI response must be traceable through a citation chain to a source knowledge object or data point.
- **Confidence scoring**: Responses should include confidence levels: HIGH (directly sourced), MEDIUM (inferred from multiple sources), LOW (reasonable assumption).
- **Hallucination prevention**: Cross-check generated responses against source knowledge. Any claim that cannot be sourced must be flagged as uncertain.

---

## 13. Deployment

| # | Item                    | Description                                                       | Verification method                |
|---|-------------------------|-------------------------------------------------------------------|------------------------------------|
| 1 | Docker image builds     | The Docker image builds successfully without errors               | `docker build`, CI pipeline        |
| 2 | Health checks pass      | Health check endpoints return 200 OK                              | Post-deploy verification           |
| 3 | Migration runs          | Database migrations apply successfully in target environment      | Migration log review               |
| 4 | Smoke test passes       | Critical user flows work in the deployed environment              | Smoke test suite                   |
| 5 | Rollback tested         | Rollback procedure has been tested and verified                   | Rollback test, runbook review      |
| 6 | Environment parity verified | Staging environment matches production configuration         | Environment comparison             |

### Deployment notes

- **Docker image**: Must build from Dockerfile. Use multi-stage builds to minimize image size. Tag with version and commit SHA.
- **Health checks**: Every service must expose `/api/v1/health` that returns 200 OK and includes status of all dependencies (database, Redis, RabbitMQ, etc.).
- **Zero-downtime**: Deployments should support rolling updates. Health check must fail before old instance is terminated (readiness + liveness probes).
- **Migration safety**: Schema migrations must run before application instances are updated. This requires backward-compatible schema changes (additive columns first).

---

## 14. Quality Gates

Quality gates are automated checks that must pass before a PR can be merged. These gates
enforce the DoD programmatically.

### Pre-merge gates (CI enforced)

| Gate                    | Tool / Check                     | Failure action                    |
|-------------------------|----------------------------------|-----------------------------------|
| Lint                    | `pnpm lint`                      | Block merge                       |
| Typecheck               | `pnpm typecheck`                 | Block merge                       |
| Test                    | `pnpm test`                      | Block merge                       |
| Build                   | `pnpm build`                     | Block merge                       |
| Format                  | `pnpm format:check`              | Block merge                       |
| Security scan           | Trivy / detect-secrets           | Block merge on HIGH/CRITICAL      |
| Dependency audit        | `pnpm audit`                     | Block merge on HIGH/CRITICAL      |
| OpenAPI validation      | OpenAPI spec diff                | Block merge on breaking change without version bump |
| Coverage                | Coverage report                   | Block merge if below threshold     |

### Post-merge gates (CD enforced)

| Gate                    | Check                            | Failure action                    |
|-------------------------|----------------------------------|-----------------------------------|
| Build (Docker)          | Container image builds           | Block deployment                  |
| Migration dry-run       | Migration runs on staging        | Block deployment                  |
| Smoke test              | E2E smoke suite passes           | Block deployment                  |
| Health check            | All health endpoints return 200  | Rollback or halt rollout          |
| Performance benchmark   | Latency/throughput within SLO     | Rollback or halt rollout          |

---

## 15. DoD Exemptions

In exceptional circumstances, the DoD may be partially exempted. Exemptions are rare and
require explicit approval.

### Exemption criteria

- **Emergency hotfix**: A production-critical issue where DoD compliance would delay the fix
  beyond acceptable risk. Security vulnerability with active exploitation qualifies.
- **Prototype / Spike**: Code that will not reach production and is explicitly marked as
  experimental. Must be in a dedicated branch or behind a feature flag.
- **Documentation only**: Code review still required, but test coverage and security scan
  may be waived for pure documentation changes.

### Exemption process

1. **Request**: Author documents which DoD items are waived and why.
2. **Approve**: Engineering manager or tech lead approves the exemption.
3. **Track**: Exemption is logged in the PR description and a follow-up ticket is created
   to address the waived items post-release.
4. **Follow up**: All waived items must be completed within 5 business days or the change
   is reverted.

### Exemption template

```markdown
**DoD Exemption Request**

Waived items:
- [ ] Item X — <reason>
- [ ] Item Y — <reason>

Rationale: <explanation of why exemption is necessary>
Follow-up ticket: <link to ticket>
Approved by: <name>
```

---

## 16. Verification Scripts

Copy-pasteable commands to verify DoD compliance before submission.

### TypeScript (Frontend / Backend)

```bash
# Run from repository root
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm format:check
pnpm audit

# Generate OpenAPI spec (verify docs are current)
pnpm generate:openapi

# Security scan (if tooling is available)
npx trivy fs . --severity HIGH,CRITICAL --exit-code 1
npx detect-secrets --scan .
```

### Python (Services)

```bash
# Run inside service directory
source venv/bin/activate
ruff check src tests
mypy src
pytest tests -v --cov=src --cov-report=term-missing
```

### Database

```bash
pnpm db:generate
pnpm db:apply                                             # verify migration
```

### Documentation

```bash
pnpm format:check                                         # includes markdown files
# Manual: verify READMEs, changelog, ADR, API docs updated
```

### All-in-one (TypeScript)

```bash
# Complete pre-submission verification
pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm format:check && pnpm audit
```

---

## Quick DoD (Condensed Version)

A three-line summary suitable for PR descriptions and commit messages:

```
**Code**: Lint/type/test/build pass, no TODOs/dead/debug code, code reviewed.
**Docs**: API docs, README, changelog updated; ADR created if architecture change.
**Safety**: No secrets, input validated, auth enforced, migration reversible, rollback documented, security scan clean.
```

---

## 17. DoD by Change Type

Different change types require different subsets of the DoD. Use this guide to determine
which items are mandatory (Must), recommended (Should), or optional (May) for your change.

### Bug fix

| Priority | Items required                                                                 |
|----------|--------------------------------------------------------------------------------|
| Must     | Code 1-12, Tests 4-8, Documentation 4, Security 1-2, 7-8, Performance 1, Monitoring 1 |
| Should   | Tests 1-3 (if fix is testable), Documentation 1-3, 5 (if public API changes), Security 3-6 |
| May      | Operations, Frontend, AI, Knowledge items                                      |

### New feature

| Priority | Items required                                                                 |
|----------|--------------------------------------------------------------------------------|
| Must     | Code 1-12, Tests 1-8, Documentation 1-6, Security 1-9, Performance 1-7, API 1-9 |
| Should   | Monitoring 1-6, Operations 1-7, Frontend (as applicable), Backend 1-8          |
| May      | Knowledge, AI items (if AI-related feature)                                    |

### Refactoring

| Priority | Items required                                                                 |
|----------|--------------------------------------------------------------------------------|
| Must     | Code 1-12, Tests 4-8 (all tests pass), Performance 1, 3, 6                    |
| Should   | Tests 1-3 (if new testable paths), Documentation 5 (inline docs), Security 2 (if validation changes) |
| May      | Operations, Monitoring, API items                                              |

### Schema change (database)

| Priority | Items required                                                                 |
|----------|--------------------------------------------------------------------------------|
| Must     | Code 1-12, Tests 4-8, Documentation 3-4, Operations 1-2, 5, Backend 4-5        |
| Should   | Performance 5-7 (indexes, connection pool), Security 1, Documentation 1 (API docs if schema is exposed) |
| May      | Monitoring, Frontend items                                                     |

### Configuration change

| Priority | Items required                                                                 |
|----------|--------------------------------------------------------------------------------|
| Must     | Operations 3-7, Documentation 4, Security 5                                    |
| Should   | Monitoring 2-4, Documentation 1-2 (if config is API-facing)                    |
| May      | Code, Tests, Performance items                                                 |

### Documentation only

| Priority | Items required                                                                 |
|----------|--------------------------------------------------------------------------------|
| Must     | Documentation 4 (changelog), Documentation 6-8 (as applicable), Code 7 (reviewed) |
| Should   | Documentation 1-5 (as applicable), Code 1-6 (documentation formatting)         |
| May      | Tests, Security, Performance, Operations, API items                            |

### Dependency update

| Priority | Items required                                                                 |
|----------|--------------------------------------------------------------------------------|
| Must     | Code 1-2, 7-12 (build must pass), Security 6 (audit clean), Performance 3 (regression check) |
| Should   | Tests 4 (all tests pass), Documentation 4 (changelog), Documentation 1-2 (if public API changes) |
| May      | Operations 5 (rollback if update is risky)                                     |

### Security fix

| Priority | Items required                                                                 |
|----------|--------------------------------------------------------------------------------|
| Must     | Code 1-12, Tests 4-8, Security 1-9 (full security checklist), Documentation 4  |
| Should   | Documentation 1-3, 5 (advisory/adr for significant fixes), Operations 5 (rollback) |
| May      | Performance, Monitoring items (security may override performance)              |

### Hotfix

| Priority | Items required                                                                 |
|----------|--------------------------------------------------------------------------------|
| Must     | Code 1-6, 7 (at least one reviewer), 8-10, Tests 4 (existing tests pass), Security 1 |
| Should   | Documentation 4, Operations 5 (rollback plan), Tests 2 (regression test for the fix) |
| May      | All other items (waived per exemption process)                                 |

---

## Version History

| Version | Date       | Changes                                               |
|---------|------------|-------------------------------------------------------|
| 1.0.0   | 2026-06-26 | Initial version — comprehensive Definition of Done    |
