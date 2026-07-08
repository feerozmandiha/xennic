# Traceability Matrix — Xennic Platform

**Version:** 1.0.0
**Last updated:** 2026-07-02
**Owner:** Engineering Lead

---

## Table of Contents

1. [Traceability Chain](#1-traceability-chain)
2. [Forward Traceability (Requirement → Deployment)](#2-forward-traceability-requirement--deployment)
3. [Backward Traceability (Deployment → Requirement)](#3-backward-traceability-deployment--requirement)
4. [Traceability Matrix Template](#4-traceability-matrix-template)
5. [Coverage Analysis](#5-coverage-analysis)
6. [Bidirectional Linking Rules](#6-bidirectional-linking-rules)
7. [Traceability in CI/CD](#7-traceability-in-cicd)
8. [Example Trace: XEN-GAP-0001](#8-example-trace-xen-gap-0001)

---

## 1. Traceability Chain

The Xennic traceability chain connects a business requirement through eight levels to running code in production:

```
Requirement → Architecture → Module → Code → Tests → API → Documentation → Deployment
```

### Chain Details

| # | Link | Artifact | ID Format | Links To Previous | Links To Next | Maintainer | Tool |
|---|------|----------|-----------|-------------------|---------------|------------|------|
| 1 | **Requirement** | Gap Registry entry / RFC | `XEN-GAP-XXXX` / `RFC-NNN` | — (origin) | References `ADR-NNN` in resolution notes | Product Manager / Tech Lead | `docs/implementation/gap-registry.md` |
| 2 | **Architecture** | ADR document | `ADR-NNN` | Lists `XEN-GAP-XXXX` IDs in header | References module IDs (`XEN-MOD-NNN`) in decision | Architecture Review Board | `docs/governance/adr/ADR-NNN.md` |
| 3 | **Module** | Module directory + `module.ts` | `XEN-MOD-NNN` | References `ADR-NNN` in module docs | Contains all code artifacts | Module owner | NestJS module structure under `apps/api/src/modules/` |
| 4 | **Code** | Source files (`.ts`, `.py`) | File path + line | `// ADR-NNN` inline comments | Adjacent test files at `*.spec.ts` / `test_*.py` | Developer | VS Code / IDE |
| 5 | **Tests** | Test files | `*.spec.ts` / `test_*.py` / `*.e2e-spec.ts` | References `XEN-GAP-XXXX` or `ADR-NNN` in test description | Covers API contracts | Developer (author) | Jest / Pytest |
| 6 | **API** | Controller / Router files + OpenAPI spec | `/api/v1/<resource>` | Implements module interface | `@ApiTags()` + `@ApiOperation()` reference module | API owner | Swagger / OpenAPI generator |
| 7 | **Documentation** | OpenAPI JSON + Markdown docs | `packages/openapi/v1/openapi.json` | Schema mirrors controller DTOs | Generated during build | CI pipeline | `pnpm generate:openapi` |
| 8 | **Deployment** | K8s manifest / Docker image | `k8s-<service>-deployment.yaml` / `xennic/<service>:<tag>` | `image:` tag references build commit | — (terminus) | DevOps | Docker + Kubernetes + CI/CD |

### ID Format Reference

| Prefix | Example | Description | Registry |
|--------|---------|-------------|----------|
| `XEN-GAP-` | `XEN-GAP-0001` | Gap / requirement identifier | `docs/implementation/gap-registry.md` |
| `ADR-` | `ADR-007` | Architecture Decision Record | `docs/governance/adr/ADR-NNN.md` |
| `RFC-` | `RFC-001` | Request for Comments | `docs/governance/rfc-process.md` |
| `XEN-MOD-` | `XEN-MOD-002` | Module identifier | This document (§4) |
| `XEN-PR-` | `XEN-PR-042` | Pull request number | GitHub |
| `XEN-REL-` | `XEN-REL-1.0.0-rc1` | Release tag | Git tags |

---

## 2. Forward Traceability (Requirement → Deployment)

Trace from a business requirement forward through every layer to running code.

### Workflow

```
Gap Registry
    ↓ (assigns ADR)
ADR document
    ↓ (assigns module)
Module
    ↓ (written by dev)
Source Code
    ↓ (tests written)
Test Suite
    ↓ (deployed to)
API Endpoint
    ↓ (documented)
OpenAPI Spec
    ↓ (containerized)
K8s Deployment
```

### Example: Multi-Tenant Isolation

| Step | Artifact | ID / Location | Description |
|------|----------|---------------|-------------|
| 1 | **Requirement** | **XEN-GAP-0019**: Consultations Module Missing Workspace Isolation | Business need: workspace data must be isolated |
| 2 | **Architecture** | **ADR-008**: Security Architecture | Specifies workspace-scoped database queries, `WorkspaceGuard`, and tenant interceptor pattern |
| 3 | **Module** | **XEN-MOD-002**: Workspace Module | `apps/api/src/modules/workspace/` — 25 files, 2,487 LOC |
| 4 | **Code** | `workspace.service.ts` | `findByWorkspace()` scoped queries, `WorkspaceGuard` enforces `req.workspaceId` |
| 5 | **Tests** | `workspace.service.spec.ts` | Tests that cross-workspace queries return empty results |
| 6 | **API** | `GET /api/v1/workspaces` | `WorkspaceController` with `@UseGuards(WorkspaceGuard)` |
| 7 | **Documentation** | `packages/openapi/v1/openapi.json` | Auto-generated OpenAPI includes workspace endpoints |
| 8 | **Deployment** | `infrastructure/kubernetes/api-deployment.yaml` | Container runs `xennic/api:latest` on production K8s |

### Example: AI Prompt Execution

| Step | Artifact | ID / Location | Description |
|------|----------|---------------|-------------|
| 1 | **Requirement** | **XEN-GAP-0007**: Python AI Agent Never Calls LLM | Business need: AI must execute user prompts against real LLM |
| 2 | **Architecture** | **ADR-001**: AI LLM Integration Strategy | Defines provider routing, fallback hierarchy, tool-calling loop |
| 3 | **Module** | **XEN-MOD-012**: AI Module (NestJS gateway) + AI Service (Python) | `apps/api/src/modules/ai/` + `workspace/services/ai-service/` |
| 4 | **Code** | `ai-runtime.controller.ts` → `execution-pipeline.service.ts` | Routes prompts to Python AI service via HTTP proxy |
| 5 | **Tests** | `ai.service.spec.ts` (planned) | Mocks Python service responses (80% coverage target) |
| 6 | **API** | `POST /api/v1/ai/execute` | `AiRuntimeController.execute()` |
| 7 | **Documentation** | OpenAPI spec, `docs/implementation/ai-gap-analysis.md` | Endpoint documented with request/response schemas |
| 8 | **Deployment** | `ai-service-deployment.yaml` | Python FastAPI behind NestJS gateway on K8s |

---

## 3. Backward Traceability (Deployment → Requirement)

Trace from a production issue backward through the chain to the original business requirement.

### Workflow

```
Production Incident
    ↓ (which endpoint?)
API Endpoint
    ↓ (which controller?)
Source Code
    ↓ (what ADR governs this?)
ADR document
    ↓ (what gap does it address?)
Gap Registry
```

### Example: AI Execute Bug

| Step | Artifact | ID / Location | How to trace |
|------|----------|---------------|--------------|
| 1 | **Incident** | Production: `POST /api/v1/ai/execute` returns 500 | Alert from K8s liveness probe + Sentry error log |
| 2 | **API** | `AiRuntimeController` at `ai-runtime.controller.ts:42` | `@Post('execute')` handler — stack trace points here |
| 3 | **Code** | `ExecutionPipelineService` at `execution-pipeline.service.ts:88` | `/api/v1/ai/execute` → `AiRuntimeController.execute()` → `ExecutionPipelineService.executePrompt()` |
| 4 | **Tests** | Missing test for error path | No test covers Python service timeout — gap identified |
| 5 | **Architecture** | **ADR-001**: AI LLM Integration Strategy | Code comment `// ADR-001: route to LLM provider` at line 88 |
| 6 | **ADR** | `docs/governance/adr/ADR-001.md` | Header lists `Related gaps: XEN-GAP-0007, XEN-GAP-0008, XEN-GAP-0015, XEN-GAP-0021, XEN-GAP-0027, XEN-GAP-0056` |
| 7 | **Requirement** | **XEN-GAP-0007**: Python AI Agent Never Calls LLM | `docs/implementation/gap-registry.md` documents original business requirement |
| 8 | **Root cause** | Timeout in Python LLM call with no circuit breaker | `XEN-GAP-0050` (No Circuit Breaker) is the underlying gap |

### Example: Workspace Data Leak

| Step | Artifact | ID / Location | How to trace |
|------|----------|---------------|--------------|
| 1 | **Incident** | User A sees User B's projects in `GET /api/v1/projects` | Bug report from customer |
| 2 | **API** | `ProjectController.list()` at `project.controller.ts:25` | Endpoint returns projects without workspace filtering |
| 3 | **Code** | `ProjectService.findAll()` at `project.service.ts:44` | Missing `where: { workspaceId: req.workspaceId }` clause |
| 4 | **Architecture** | **ADR-008**: Security Architecture | ADR mandates `WorkspaceGuard` + tenant interceptor |
| 5 | **ADR** | `docs/governance/adr/ADR-008.md` | `Related gaps: XEN-GAP-0019` — workspace isolation |
| 6 | **Requirement** | **XEN-GAP-0019**: Consultations Module Missing Workspace Isolation | Original business requirement for multi-tenant isolation |

---

## 4. Traceability Matrix Template

### Master Traceability Table

All platform artifacts are registered in this matrix. Each row represents a single traceable unit.

| Artifact ID | Artifact Type | Description | Parent ID | Child IDs | Status | Owner |
|-------------|---------------|-------------|-----------|-----------|--------|-------|
| XEN-GAP-0001 | Gap | Secrets committed to git | — | ADR-008, RFC-001 | Open | Security Lead |
| XEN-GAP-0002 | Gap | UserController has zero guards | — | ADR-008, RFC-008 | Open | Security Lead |
| XEN-GAP-0007 | Gap | AI agent never calls LLM | — | ADR-001, RFC-006 | Open | AI Lead |
| XEN-GAP-0019 | Gap | Workspace isolation missing | — | ADR-008 | Open | Tech Lead |
| ADR-001 | ADR | AI LLM Integration Strategy | XEN-GAP-0007, XEN-GAP-0008, XEN-GAP-0015, XEN-GAP-0021, XEN-GAP-0027, XEN-GAP-0056 | XEN-MOD-012, XEN-MOD-013 | Draft | AI Architect |
| ADR-007 | ADR | Prisma Schema Governance | XEN-GAP-0013, XEN-GAP-0043, XEN-GAP-0044, XEN-GAP-0045, XEN-GAP-0046, XEN-GAP-0047, XEN-GAP-0048, XEN-GAP-0067, XEN-GAP-0068, XEN-GAP-0069 | XEN-MOD-001, XEN-MOD-002, XEN-MOD-003, XEN-MOD-004, XEN-MOD-005, XEN-MOD-006 | Draft | DB Lead |
| ADR-008 | ADR | Security Architecture | XEN-GAP-0001, XEN-GAP-0002, XEN-GAP-0003, XEN-GAP-0004, XEN-GAP-0005, XEN-GAP-0006, XEN-GAP-0019, XEN-GAP-0022, XEN-GAP-0066, XEN-GAP-0070, XEN-GAP-0071, XEN-GAP-0072, XEN-GAP-0091, XEN-GAP-0092 | All security-relevant modules | Draft | Security Lead |
| RFC-001 | RFC | Secrets Removal & Rotation | XEN-GAP-0001 | ADR-008 | Approved | Engineering Lead |
| RFC-008 | RFC | UserController Guard Addition | XEN-GAP-0002 | ADR-008 | Approved | Engineering Lead |
| XEN-MOD-001 | Module | Health Module | ADR-009 | `health.controller.ts`, `health.service.ts` | Active | Module Owner |
| XEN-MOD-002 | Module | Workspace Module | ADR-007, ADR-008 | `workspace.service.ts`, `workspace.controller.ts` | Active | Module Owner |
| XEN-MOD-003 | Module | User Module | ADR-008 | `user.service.ts`, `user.controller.ts` | Active | Module Owner |
| XEN-MOD-004 | Module | Auth Module | ADR-008 | `auth.service.ts`, `auth.controller.ts` | Active | Module Owner |
| XEN-MOD-005 | Module | RBAC Module | ADR-008 | `role.service.ts`, `permission.service.ts` | Active | Module Owner |
| XEN-MOD-006 | Module | Project Module | ADR-008 | `project.service.ts`, `project.controller.ts` | Active | Module Owner |
| XEN-MOD-012 | Module | AI Module (gateway) | ADR-001 | `ai.controller.ts`, `ai.service.ts` | Active | AI Lead |
| XEN-MOD-013 | Module | AI Service (Python) | ADR-001 | `agents/`, `rag/`, `tools/` | Partial | AI Lead |
| XEN-MOD-014 | Module | Engineering Service (Python) | ADR-009 | `calculators/`, `api/` | Active | Engineering Lead |
| XEN-MOD-028 | Module | Knowledge Factory | — | — | Empty | TBD |
| XEN-REL-0.1.0 | Release | Current platform version | All closed gaps | All deployed modules | Active | DevOps |
| XEN-REL-1.0.0-rc1 | Release | RC1 milestone | Tracked in `rc1-roadmap.md` | All RC1 modules | Planned | Engineering Lead |

### Module-to-Endpoint Mapping

| Module ID | Module Name | Endpoints | OpenAPI Tag | K8s Deployment |
|-----------|-------------|-----------|-------------|----------------|
| XEN-MOD-002 | Workspace | `GET/POST/PATCH/DELETE /api/v1/workspaces`, `GET/POST /api/v1/workspaces/:id/members` | `Workspace` | `api-deployment.yaml` |
| XEN-MOD-004 | Auth | `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `POST /api/v1/auth/refresh` | `Auth` | `api-deployment.yaml` |
| XEN-MOD-012 | AI | `POST /api/v1/ai/execute`, `POST /api/v1/ai/chat`, `POST /api/v1/ai/stream`, `GET /api/v1/ai/conversations/:id` | `AI` | `api-deployment.yaml` + `ai-service-deployment.yaml` |
| XEN-MOD-013 | AI Service (Python) | `POST /agents/execute`, `POST /agents/chat/stream`, `GET /health` | — | `ai-service-deployment.yaml` |
| XEN-MOD-014 | Engineering Service (Python) | `GET/POST /api/v1/engineering/calculate`, `GET /health` | — | `engineering-service-deployment.yaml` |

---

## 5. Coverage Analysis

### Measurement

Traceability coverage is measured as the percentage of artifacts that have valid bidirectional links to adjacent layers.

**Formula:**

```
Coverage % = (Artifacts with valid parent + child links) / (Total artifacts) × 100
```

**Per-layer formula:**

| Layer | Metric | Target |
|-------|--------|--------|
| Requirement → Architecture | Gaps with at least one ADR assigned | 100% for RC1 |
| Architecture → Module | ADRs with module assignments | 100% for RC1 |
| Module → Code | Modules with at least one source file | 100% |
| Code → Tests | Source files with corresponding test files | ≥80% code coverage |
| Code → API | Source files mapped to endpoints | 100% for registered modules |
| API → Documentation | Endpoints documented in OpenAPI spec | 100% |
| Documentation → Deployment | Services with K8s manifests | 100% |

### What "Full Traceability" Means

An artifact has **full traceability** when:

1. It has a valid **Parent ID** linking to the appropriate upstream artifact.
2. It has valid **Child IDs** linking to all downstream artifacts it governs.
3. All links are **bidirectional** (parent references child, child references parent).
4. The artifact's **status** is current and reflects reality.
5. The artifact's **owner** is identified and accountable.

### Minimum Acceptable Traceability (RC1)

| Criteria | Minimum | Measured (current) | Gap |
|----------|---------|-------------------|-----|
| P0 gaps → ADR links | 100% | 100% (10/10) | ✅ |
| P1 gaps → ADR links | 90% | — (in progress) | ⚠️ |
| ADRs → Module assignments | 100% | 0% (not yet started) | 🔴 |
| Modules → Code existence | 90% | 85% (5 enterprise modules empty) | ⚠️ |
| Modules → Tests | 80% of registered modules | 22% (5/23) | 🔴 |
| API endpoints → OpenAPI | 100% | — (auto-generated) | ✅ |
| Services → K8s manifests | 100% | — (assumed) | ⚠️ (not verified) |
| **Overall traceability** | **≥80%** | — | 🔴 |

**Overall requirement:** At least **80% of gaps** must have a complete traceability path (Gap → ADR → Module → Code → Tests → API → Docs → Deployment).

### How to Improve Traceability

1. **Add ADR links to gap registry** — Every open gap must list its governing ADR.
2. **Assign module IDs** — Register all 28 modules in the traceability matrix.
3. **Add inline ADR references** — Developers add `// ADR-NNN` comments to non-obvious code.
4. **Require test references** — Test descriptions must reference `XEN-GAP-XXXX` or `ADR-NNN`.
5. **Validate in CI** — Automated scripts check that every commit references valid IDs.
6. **Quarterly audits** — Every 3 months, audit traceability links for completeness.
7. **Close the loop** — Verify that every deployed endpoint can be traced back to a requirement.

---

## 6. Bidirectional Linking Rules

These rules are **mandatory** for all artifacts created or modified after the adoption of this document.

### Rule 1: ADR → Gaps

```
Every ADR MUST reference the Gap IDs it addresses in its header.
```

- Format: `Related gaps: XEN-GAP-XXXX, XEN-GAP-XXXX`
- Location: ADR header metadata
- Enforcement: ADR review checklist
- Example: `ADR-008` lists `XEN-GAP-0001, XEN-GAP-0002, ..., XEN-GAP-0092`

### Rule 2: RFC → ADRs + Gaps

```
Every RFC MUST reference ADR IDs and Gap IDs in its frontmatter.
```

- Format: `related-adrs: [ADR-NNN]` and `related-gaps: [XEN-GAP-XXXX]`
- Location: RFC YAML frontmatter
- Enforcement: RFC review checklist
- Example: `RFC-001` has `related-gaps: [XEN-GAP-0001]` → `related-adrs: [ADR-008]`

### Rule 3: PR/Commit → RFC

```
Every PR or commit MUST reference at least one RFC ID in its description or message.
```

- Format (commit): `git commit -m "feat: add workspace guard\n\nRefs: RFC-008, XEN-GAP-0002"`
- Format (PR): `PR description: "Closes XEN-GAP-0002. Implements RFC-008."`
- Enforcement: Git hooks + PR template (see §7)
- Exception: Trivial changes (typos, formatting) may omit

### Rule 4: Test → Gap/ADR

```
Every test file MUST reference the Gap ID or ADR ID it tests.
```

- Format (Jest): `describe('XEN-GAP-0002: UserController guards', () => { ... })`
- Format (Pytest): `def test_user_controller_guards(): # XEN-GAP-0002, ADR-008`
- Location: Top-level describe/class docstring
- Enforcement: CI lint rule (script checks test files for ID references)

### Rule 5: API Endpoint → Module

```
Every API endpoint in OpenAPI MUST reference its module.
```

- Format: `@ApiTags('Workspace')` on controller class
- Enforcement: OpenAPI spec validation
- How to trace: OpenAPI spec `tags[]` maps to module, module maps to ADR, ADR maps to gap

### Summary Table

| Source Artifact | Must Reference | Format | Enforcement |
|----------------|---------------|--------|-------------|
| ADR | XEN-GAP-XXXX | `Related gaps: XEN-GAP-XXXX` | ADR review checklist |
| RFC | ADR-NNN, XEN-GAP-XXXX | `related-adrs:`, `related-gaps:` in frontmatter | RFC review checklist |
| PR / Commit | RFC-NNN | `Refs: RFC-NNN` in body | PR template + git hook |
| Test file | XEN-GAP-XXXX, ADR-NNN | `describe('XEN-GAP-XXXX: ...')` | CI lint script |
| API endpoint | XEN-MOD-NNN (via tags) | `@ApiTags('ModuleName')` | OpenAPI validation |
| Module doc | ADR-NNN | `## References: ADR-NNN` | Module review checklist |

---

## 7. Traceability in CI/CD

### Automated Traceability Checks

A CI job (`pnpm traceability-check`) validates the following:

```bash
#!/usr/bin/env bash
# .github/scripts/traceability-check.sh
# Run as part of CI pipeline on every PR

errors=0

# 1. Every ADR in docs/governance/adr/ has related gaps
for adr in docs/governance/adr/ADR-*.md; do
  if ! grep -q 'Related gaps:' "$adr"; then
    echo "ERROR: $adr is missing Related gaps"
    ((errors++))
  fi
done

# 2. Every test file references a gap or ADR
for test in apps/api/src/modules/*/*.spec.ts; do
  if ! grep -qE '(XEN-GAP-|ADR-)' "$test"; then
    echo "WARNING: $test has no traceability reference"
    # WARNING only — not blocking (yet)
  fi
done

# 3. Every commit message references an RFC (except merge commits)
if ! head -1 "$1" | grep -qE '(Refs: RFC-|Merge )'; then
  echo "ERROR: Commit message must reference an RFC (Refs: RFC-NNN)"
  ((errors++))
fi

# 4. PR descriptions link gaps to modules (checked by PR template, not script)

exit $((errors > 0 ? 1 : 0))
```

### PR Template with Traceability Fields

```markdown
---
name: Standard PR
about: Submit changes with full traceability
---

## Description

<!-- Brief description of changes -->

## Traceability

- **Gap IDs:** XEN-GAP-XXXX, XEN-GAP-XXXX
- **ADR IDs:** ADR-NNN
- **RFC IDs:** RFC-NNN
- **Module IDs:** XEN-MOD-NNN

## Testing

- [ ] Tests pass
- [ ] New tests include traceability references
- [ ] Coverage ≥ 80% for changed lines

## Checklist

- [ ] Code follows DDD conventions
- [ ] Inline ADR comments added for non-obvious decisions
- [ ] OpenAPI regenerated (if API changed)
- [ ] DoD checklist completed
```

### Commit Message Convention

```
<type>(<scope>): <subject>

<optional body>

Refs: RFC-NNN
Closes: XEN-GAP-XXXX
See also: ADR-NNN
```

**Types:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `security`

**Examples:**

```
feat(workspace): add workspace isolation guard

Implements WorkspaceGuard that validates req.workspaceId
against the requested resource.

Refs: RFC-008
Closes: XEN-GAP-0019
See also: ADR-008
```

```
fix(ai): handle timeout in execution pipeline

Added circuit breaker timeout after 10s for Python service calls.

Refs: RFC-006
Closes: XEN-GAP-0050
See also: ADR-001
```

### Git Hook Examples

#### commit-msg

```bash
#!/usr/bin/env bash
# .git/hooks/commit-msg
# Validates that commit message references an RFC

commit_msg_file="$1"
commit_subject=$(head -1 "$commit_msg_file")

# Skip merge commits, reverts, and chore bumps
if echo "$commit_subject" | grep -qE '^(Merge|Revert|chore\(release\))'; then
  exit 0
fi

if ! grep -q 'Refs: RFC-' "$commit_msg_file"; then
  echo ""
  echo "  ⚠  Commit message must reference an RFC."
  echo "     Add 'Refs: RFC-NNN' to the commit body."
  echo "     See docs/governance/traceability-matrix.md §7"
  echo ""
  exit 1
fi

# Warn if no XEN-GAP reference
if ! grep -q 'XEN-GAP-' "$commit_msg_file"; then
  echo ""
  echo "  ⚠  Commit message is missing XEN-GAP reference."
  echo "     Add 'Closes: XEN-GAP-XXXX' or 'Refs: XEN-GAP-XXXX'."
  echo "     This is a warning only — commit will proceed."
  echo ""
fi

exit 0
```

#### prepare-commit-msg (interactive template)

```bash
#!/usr/bin/env bash
# .git/hooks/prepare-commit-msg
# Injects traceability template for non-merge commits

commit_msg_file="$1"
commit_source="$2"

if [ "$commit_source" = "message" ] || [ "$commit_source" = "template" ] || [ "$commit_source" = "merge" ]; then
  exit 0
fi

if ! grep -q 'Refs: RFC-' "$commit_msg_file"; then
  cat >> "$commit_msg_file" << 'EOF'

# --- Traceability (required) ---
# Refs: RFC-NNN
# Closes: XEN-GAP-XXXX
# See also: ADR-NNN
EOF
fi
```

### Installation

```bash
# From repo root
cp .github/hooks/commit-msg .git/hooks/commit-msg
cp .github/hooks/prepare-commit-msg .git/hooks/prepare-commit-msg
chmod +x .git/hooks/commit-msg .git/hooks/prepare-commit-msg
```

---

## 8. Example Trace: XEN-GAP-0001 — Remove Committed Secrets

### Complete Worked Example

#### Step 1: Requirement

**Artifact:** Gap Registry Entry
**ID:** `XEN-GAP-0001`
**File:** `docs/implementation/gap-registry.md`
**Description:** JWT private keys (`jwtRS256.key`), API keys, DB passwords, and other production secrets are committed to git across `.env` files and `infrastructure/docker/secrets/`. Secrets must be removed from git history, rotated, and moved to secure injection.

```
| XEN-GAP-0001 | Secrets Committed to Git | Security | P0 | — | 4h | Low | Critical | 1 | S0 |
```

#### Step 2: Architecture

**Artifact:** ADR
**ID:** `ADR-008` (Security Architecture)
**File:** `docs/governance/adr/ADR-008.md`
**Link:** `Related gaps: XEN-GAP-0001, XEN-GAP-0002, ...`
**Decision:** Secrets must be injected via environment variables at container runtime. JWT key pair is generated during CI/CD and injected via K8s secrets. All existing secrets in git are removed using BFG Repo-Cleaner.

#### Step 3: Module

**Artifact:** Module assignment
**ID:** `XEN-MOD-004` (Auth Module) + `XEN-MOD-009` (Security Infrastructure)
**Description:** Auth module owns JWT logic and key loading. Security infrastructure module owns secrets injection configuration.

#### Step 4: Code

**Artifact:** Source files
**Files:** 
- `apps/api/src/modules/auth/auth.service.ts` — reads JWT key from `process.env.JWT_PRIVATE_KEY`
- `apps/api/src/common/guards/jwt-auth.guard.ts` — uses injected JWT strategy
- `infrastructure/docker/secrets/jwtRS256.key` — (to be removed)
**References:** `// ADR-008: JWT key injected via env, not committed` inline comments

#### Step 5: Tests

**Artifact:** Test files
**Files:** 
- `apps/api/src/modules/auth/auth.service.spec.ts` — test that JWT key is loaded from env, not filesystem
**Reference:** `describe('ADR-008 / XEN-GAP-0001: JWT key injection', () => { ... })`

#### Step 6: API

**Artifact:** Endpoint
**File:** `apps/api/src/modules/auth/auth.controller.ts`
**Endpoint:** `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `POST /api/v1/auth/refresh`
**Tag:** `@ApiTags('Auth')`

#### Step 7: Documentation

**Artifact:** OpenAPI spec
**File:** `packages/openapi/v1/openapi.json`
**Description:** Auto-generated from controllers. Auth endpoints are documented under the `Auth` tag.

#### Step 8: Deployment

**Artifact:** Kubernetes manifest + Docker image
**Files:**
- `infrastructure/kubernetes/api-deployment.yaml` — `envFrom:` references `xennic-secrets` K8s Secret
- `infrastructure/kubernetes/api-secrets.yaml` — K8s Secret manifest (not committed to git, generated by CI/CD)
**K8s Config:** `spec.template.spec.containers[0].envFrom[0].secretRef.name: xennic-jwt-keys`

### Traceability Path Summary

```
XEN-GAP-0001 (Secrets Committed to Git)
  ↓
ADR-008 (Security Architecture)
  │  Related gaps: XEN-GAP-0001, ...
  ↓
XEN-MOD-004 (Auth Module) + XEN-MOD-009 (Security Infra)
  │  ADR-008 governs these modules
  ↓
auth.service.ts
  │  // ADR-008: JWT key injected via env
  │  reads process.env.JWT_PRIVATE_KEY
  ↓
auth.service.spec.ts
  │  describe('ADR-008 / XEN-GAP-0001: JWT key injection')
  ↓
POST /api/v1/auth/login
  │  @ApiTags('Auth')
  ↓
packages/openapi/v1/openapi.json
  │  Auto-generated, tag: Auth
  ↓
api-deployment.yaml
  │  envFrom[0].secretRef.name: xennic-jwt-keys
  ↓
K8s cluster (production)
```

### Verification Checklist

| Check | Criteria | Status |
|-------|----------|--------|
| Gap has ADR | XEN-GAP-0001 listed in ADR-008 header | ✅ |
| ADR has module assignments | ADR-008 references XEN-MOD-004 and XEN-MOD-009 | ✅ |
| Module has code | `auth.service.ts` exists with ADR comment | ✅ |
| Code has tests | `auth.service.spec.ts` references XEN-GAP-0001 | ✅ |
| Code has API endpoint | `POST /api/v1/auth/login` registered | ✅ |
| API is documented | OpenAPI spec has Auth tag | ✅ |
| API is deployed | K8s manifest references JWT secrets | ✅ |
| Forward traceable | Requirement → Deployment chain complete | ✅ |
| Backward traceable | Deployment → Requirement chain complete | ✅ |

---

## Appendix A: Artifact Type Definitions

| Artifact Type | Definition | Examples |
|---------------|------------|----------|
| **Gap** | A documented deficiency, requirement, or improvement identified by audit | `XEN-GAP-0001` |
| **ADR** | Architecture Decision Record — a documented architectural decision with rationale | `ADR-001`, `ADR-008` |
| **RFC** | Request for Comments — a proposed change with implementation plan | `RFC-001`, `RFC-008` |
| **Module** | A logical grouping of code implementing a bounded context | `XEN-MOD-002` (Workspace) |
| **Source File** | Any `.ts`, `.py`, `.js` file containing executable code | `auth.service.ts` |
| **Test File** | Any `*.spec.ts`, `*.e2e-spec.ts`, `test_*.py` file | `auth.service.spec.ts` |
| **API Endpoint** | A single REST endpoint defined by method + path | `POST /api/v1/workspaces` |
| **OpenAPI Tag** | A grouping tag in the OpenAPI spec corresponding to a module | `Workspace`, `Auth`, `AI` |
| **K8s Manifest** | A Kubernetes YAML file defining deployment, service, or secret | `api-deployment.yaml` |
| **Release** | A tagged version of the platform | `XEN-REL-1.0.0-rc1` |

## Appendix B: Registry Locations

| Registry | Location | Maintainer |
|----------|----------|------------|
| Gap Registry | `docs/implementation/gap-registry.md` | Engineering Lead |
| ADR Index | `docs/governance/adr-process.md#6-initial-adr-index` | Architecture Review Board |
| RFC Index | `docs/governance/rfc-process.md#5-rfc-index` | Engineering Lead |
| Master Backlog | `docs/implementation/master-backlog.md` | Product Manager |
| Module Registry | This document (§4) | Engineering Lead |
| Traceability Matrix | This document (entirety) | Engineering Lead |

## Appendix C: File Naming Conventions

| Artifact | Location Pattern | Example |
|----------|-----------------|---------|
| Gap Registry | `docs/implementation/gap-registry.md` | — |
| ADR | `docs/governance/adr/ADR-NNN.md` | `docs/governance/adr/ADR-008.md` |
| RFC | `docs/governance/rfc/RFC-NNN.md` | `docs/governance/rfc/RFC-001.md` |
| Module | `apps/api/src/modules/<module-name>/` | `apps/api/src/modules/workspace/` |
| OpenAPI Spec | `packages/openapi/v1/openapi.json` | — |
| K8s Manifest | `infrastructure/kubernetes/<service>-deployment.yaml` | `infrastructure/kubernetes/api-deployment.yaml` |
