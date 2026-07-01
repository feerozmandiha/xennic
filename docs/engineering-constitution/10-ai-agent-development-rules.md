# AI Agent Development Rules

> **Mandatory reading** for all AI coding agents operating on the Xennic codebase.
> Violation of these rules may result in rejected PRs, reverted changes, and process escalation.

---

## 1. Purpose & Scope

### WHY

AI coding agents (Cursor, Copilot, Claude Code, Codeium, etc.) are powerful tools that
accelerate development but also introduce risks: hallucinations, security vulnerabilities,
architectural violations, and unintended side effects. These rules define a safe operating
envelope for AI agents to maximize their benefit while minimizing risk.

### RATIONALE

Unlike human developers, AI agents lack true understanding of the codebase, the business domain,
and the consequences of their changes. They may invent APIs that do not exist, ignore security
constraints, introduce architectural anti-patterns, or make changes that violate invariants.
Explicit, hard rules are necessary because AI agents interpret instructions literally and do
not apply common sense or contextual judgment the way a human would.

### Who this document is for

| Audience               | Applicability                                          |
|------------------------|--------------------------------------------------------|
| AI coding agents       | Directly bound by these rules                          |
| Human developers       | Must enforce these rules when reviewing AI-generated PRs |
| Engineering managers   | Must ensure team compliance                            |
| Security team          | Must audit AI-generated changes                        |
| DevOps                 | Must verify CI/CD rules are respected                  |

### When it applies

These rules apply whenever an AI agent:

1. Generates new code in the Xennic codebase.
2. Modifies existing code in the Xennic codebase.
3. Generates documentation in the Xennic codebase.
4. Generates configuration files for the Xennic codebase.
5. Generates test code for the Xennic codebase.
6. Reviews or suggests changes to any Xennic code.

### Mandatory vs advisory rules

| Rule type   | Meaning                                              | Consequences of violation              |
|-------------|------------------------------------------------------|----------------------------------------|
| **MUST**    | Absolute requirement, never violated                 | PR rejected, process escalation        |
| **MUST NOT** | Absolute prohibition, never violated                | PR rejected, security review           |
| **SHOULD**  | Strongly recommended, exception requires justification | PR comment, possible rejection       |
| **SHOULD NOT** | Strongly discouraged, exception requires justification | PR comment, possible rejection       |
| **MAY**     | Optional, at discretion                              | No action                               |

---

## 2. Allowed Modifications

### WHY

Defining what AI agents can do without human approval provides speed and autonomy for
low-risk changes while maintaining human oversight for high-risk changes. This balances
productivity with safety.

### RATIONALE

Not all code changes carry the same risk. A typo fix or test addition has virtually zero
downside risk. A schema change or security modification could cause production outages or
data breaches. Categorizing changes by risk level enables appropriate oversight.

### Modifications allowed without human approval

AI agents MAY make the following changes without explicit human approval, provided they
pass all verification gates (see Section 4):

| Category               | Allowed changes                                                      |
|------------------------|----------------------------------------------------------------------|
| Documentation typos    | Spelling, grammar, formatting fixes in documentation                 |
| Test additions         | Adding unit tests, integration tests, or E2E tests for existing code |
| Refactoring per spec   | Refactoring that strictly follows documented architectural patterns  |
| Dependency updates     | Patching dependency versions as specified by `pnpm audit` results    |
| Code style fixes       | Prettier formatting, lint rule compliance                            |
| Comment corrections    | Fixing outdated or incorrect inline comments                         |
| Error message fixes    | Correcting typos or improving clarity in error messages              |
| Logging improvements   | Adding structured logging following existing patterns                |
| Dead code removal      | Removing clearly unused imports, variables, or functions             |
| Type annotation fixes  | Correcting TypeScript/Python type annotations                        |

### Modifications requiring PR approval

The following changes MUST have human PR approval before merging:

| Category               | Changes requiring approval                                           |
|------------------------|----------------------------------------------------------------------|
| New features           | Any feature not explicitly specified in a ticket or spec              |
| Architecture changes   | Module boundary changes, new services, new packages                  |
| Schema changes         | Any change to `prisma/schema.prisma` or database migrations          |
| Security changes       | Authentication, authorization, encryption, secrets handling          |
| API contract changes   | New/modified endpoints, changed request/response shapes              |
| Configuration changes  | CI/CD pipeline changes, deployment config, environment variables     |
| Major refactors        | Restructuring that affects multiple modules                          |
| Dependency additions   | Adding new npm/Python packages to the project                        |
| Infrastructure changes | Docker, Kubernetes, cloud resource changes                           |
| ADR modifications      | Creating, modifying, or deprecating ADRs (human-only)                |

---

## 3. Forbidden Modifications

### WHY

Some modifications carry such high risk that they must never be made by an AI agent, even
with human approval. These are hard blocks that preserve system integrity, security, and
architectural consistency.

### RATIONALE

AI agents lack the contextual understanding to safely modify certain critical files. The
consequences of an error in these areas range from security breaches to data loss to
irreversible architectural degradation. Hard blocks eliminate this risk entirely.

### Hard blocks: NEVER modify these

#### ADR files (human-only)

- **Rule**: AI agents MUST NOT create, modify, or deprecate ADR files.
- **Rationale**: ADRs capture architectural decisions that require deep domain understanding.
  AI agents may suggest ADR content but must never write the final ADR file.
- **Exception**: An AI agent MAY draft ADR content if explicitly instructed by a human, but
  the human must write the final version.

#### CI/CD configuration

- **Rule**: AI agents MUST NOT modify CI/CD configuration files (`.github/workflows/`, `.gitlab-ci.yml`,
  `infrastructure/docker/`, Turborepo pipeline configs).
- **Rationale**: CI/CD misconfiguration can cause silent failures, security bypasses, or
  deployment of broken code.
- **Exception**: A human may explicitly request a specific change and review it carefully.

#### Security configurations

- **Rule**: AI agents MUST NOT modify security-related configurations:
  - Authentication providers and strategies.
  - Authorization rules and permission models.
  - Encryption keys, certificates, TLS settings.
  - CORS, CSP, and other security headers.
  - Rate limiting configurations.
  - Audit logging configuration.
- **Rationale**: Security misconfiguration is the most common cause of data breaches.
- **Exception**: None.

#### Production secrets

- **Rule**: AI agents MUST NOT read, write, or reference production secrets:
  - Database passwords, API keys, JWT secrets.
  - Cloud provider credentials.
  - Third-party service tokens.
  - `.env` files containing real secrets.
  - Any file pattern matching `*secret*`, `*credential*`, `*key*`, `*token*`.
- **Rationale**: AI agents may inadvertently include secrets in generated code, commit them,
  or expose them in logs.
- **Exception**: None. If an AI agent encounters a potential secret, it MUST stop and notify the human.

#### Architectural invariants

- **Rule**: AI agents MUST NOT violate documented architectural invariants:
  - Multi-tenancy via `workspace_id` scoping.
  - UUID-based entity IDs.
  - Unified API response envelope (`{success, data, meta}` / `{success, error}`).
  - Event-driven communication between services.
  - Repository pattern for data access.
  - Dependency injection pattern (NestJS / FastAPI).
- **Rationale**: Violating architectural invariants creates technical debt that is expensive
  to fix later and may silently cause correctness bugs.
- **Exception**: An ADR explicitly overrides the invariant.

#### Delete code without confirmation

- **Rule**: AI agents MUST NOT delete any code, file, or directory without explicit human
  confirmation of each deletion.
- **Rationale**: AI agents may not correctly assess whether code is truly unused or whether
  its removal has downstream effects.
- **Exception**: Dead code removal per Section 2 (typo fixes, unused imports) is allowed.

#### Commit with unverified consequences

- **Rule**: AI agents MUST NOT commit changes unless all verification commands (Section 4)
  have passed.
- **Rationale**: Committing broken code wastes CI resources and blocks other developers.
- **Exception**: If verification fails, the agent MUST notify the human and not commit.

---

## 4. Required Verification

### WHY

Every change must be verified against a comprehensive set of checks before it is considered
complete. Verification catches errors that the AI agent cannot self-detect.

### RATIONALE

AI agents have no internal model of correctness — they generate plausible-looking code that
may contain subtle bugs. Automated verification tools are the only reliable way to catch
these errors before they reach production.

### Pre-submission verification checklist

Before submitting a PR or committing, the AI agent MUST run all applicable checks and
confirm they pass:

| # | Check                       | Command                                      | When required                    |
|---|-----------------------------|----------------------------------------------|----------------------------------|
| 1 | Lint                        | `pnpm lint`                                  | Always                           |
| 2 | Typecheck                   | `pnpm typecheck`                             | Always (TS/Python)               |
| 3 | Unit tests                  | `pnpm test`                                  | Always                           |
| 4 | Build                       | `pnpm build`                                 | Always                           |
| 5 | Format check                | `pnpm format:check`                          | Always                           |
| 6 | Security scan               | `npx trivy fs .`                             | Always (when available)          |
| 7 | Secret leak check           | `npx detect-secrets`                         | Always                           |
| 8 | Dependency audit            | `pnpm audit`                                 | Weekly / on dependency change   |
| 9 | Breaking API check          | Manual (review diff for API contract changes) | When API code changes           |
| 10 | Documentation check         | Manual (verify docs updated)                 | When feature/behavior changes    |
| 11 | Changelog check             | Manual (verify changelog entry)              | When feature/behavior changes    |
| 12 | Architecture compliance     | Manual (verify invariants preserved)         | For any new code                 |

### Verification commands reference

For quick copy-paste:

```bash
# Full verification suite (run in order)
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm format:check

# Security
npx trivy fs . --severity HIGH,CRITICAL          # if available
npx detect-secrets --scan .                       # if available

# Python services (run inside service directory)
ruff check src tests
mypy src
pytest tests -v --cov=src --cov-report=term-missing

# Database
pnpm db:generate                                  # after schema changes
pnpm db:apply                                     # verify migration
```

---

## 5. Code Review Checklist

### WHY

AI agents must perform a rigorous self-review before submitting code. This catches issues
that automated tooling cannot detect: logical errors, design issues, and subtle bugs.

### RATIONALE

Code review is traditionally a human-to-human activity, but AI-generated code needs even
more scrutiny because the AI lacks understanding of the broader system. A structured
self-review checklist forces the AI to examine its output from multiple perspectives.

### Mandatory self-review checklist (10+ items)

Before submitting, the AI agent MUST verify each item:

| # | Item                         | What to check                                                |
|---|------------------------------|--------------------------------------------------------------|
| 1 | **Correctness**             | Does the code do what the spec/ticket requires?              |
| 2 | **Security**                | No injection vulnerabilities, no secret exposure, auth checks |
| 3 | **Performance**             | No N+1 queries, no unbounded loops, no synchronous blocking |
| 4 | **Style**                   | Follows project conventions (naming, formatting, structure)  |
| 5 | **Documentation**           | JSDoc updated, README updated if needed, no stale comments   |
| 6 | **Test coverage**           | New code has tests, existing tests still pass                |
| 7 | **Error handling**          | All error paths handled, appropriate status codes, error messages |
| 8 | **Edge cases**              | Empty states, null/undefined, boundary values, concurrency   |
| 9 | **Backward compatibility**  | Existing consumers not broken, deprecation strategy if breaking |
| 10 | **Logging**                | Appropriate log levels, no sensitive data in logs, structured logs |
| 11 | **Idempotency**            | Mutations are idempotent (or documented why not)             |
| 12 | **Tenant isolation**        | Multi-tenant scope respected (workspace_id filtering)        |

---

## 6. Architecture Compliance

### WHY

Preserving architectural integrity is critical for maintainability, scalability, and team
productivity. AI agents must verify that their changes respect the established architecture.

### RATIONALE

AI agents tend to produce code that "works" in isolation but violates architectural patterns.
Over time, these violations accumulate into an inconsistent, hard-to-maintain codebase.
Proactive architecture compliance checking prevents this degradation.

### Verify new code follows all architectural invariants

Before submitting, verify that the new code:

- [ ] Uses `workspace_id` scoping for all multi-tenant data access.
- [ ] Uses UUID primary keys for all database entities.
- [ ] Wraps API responses in the standard envelope (`{success, data, meta}` / `{success, error}`).
- [ ] Uses the repository pattern for database access (not raw Prisma calls in controllers).
- [ ] Uses dependency injection (constructor injection in NestJS, FastAPI Depends).
- [ ] Validates input using DTOs/validators (class-validator, Pydantic).
- [ ] Has proper error handling via exception filters.
- [ ] Uses events for cross-service communication (not direct HTTP calls between services).

### Check for architectural anti-patterns

These anti-patterns MUST NOT appear in new code:

- **Service locator pattern** — Use dependency injection instead.
- **God classes** — Split large classes by responsibility.
- **Circular dependencies** — Use events or interfaces to break cycles.
- **Tight coupling between services** — Use events, not direct calls.
- **Business logic in controllers** — Keep controllers thin, delegate to services.
- **Raw SQL in services** — Use Prisma / repository layer.
- **Magic strings/numbers** — Use constants, enums, or config.
- **Deep inheritance hierarchies** — Prefer composition over inheritance.

### Validate module boundaries

- `apps/api/` — NestJS backend; no direct database access from controllers.
- `apps/web/` — Next.js frontend; no business logic, only API calls.
- `services/engineering-service/` — FastAPI microservice; independent domain.
- `services/ai-service/` — FastAPI microservice; AI/ML specific.
- `packages/` — Shared logic; no framework-specific imports.

### Confirm dependency injection pattern

NestJS:
```typescript
// GOOD
@Injectable()
export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}
}

// BAD — using service locator
const userRepo = ModuleRef.get(UserRepository);
```

FastAPI:
```python
# GOOD
@router.post("/login")
async def login(
    credentials: LoginDTO,
    auth_service: AuthService = Depends(),
):
    return await auth_service.login(credentials)

# BAD — manual instantiation
auth_service = AuthService()
```

### Verify event naming convention

Events must follow the pattern: `<domain>.<entity>.<action>` (past tense).

```typescript
// GOOD
"auth.user.logged_in"
"engineering.project.created"
"engineering.calculation.completed"

// BAD
"userLogin"
"project_created_event"
"calcDone"
```

---

## 7. Security Compliance

### WHY

Security cannot be an afterthought. AI agents must verify that their generated code meets
security standards before submission, reducing the burden on human security reviewers.

### RATIONALE

AI agents are known to generate code with security vulnerabilities — they may skip input
validation, forget authentication checks, or expose sensitive data. A pre-submission security
checklist catches these issues early, when they are cheapest to fix.

### Pre-submission security scan

| Tool                    | Purpose                              | When to run                 |
|-------------------------|--------------------------------------|-----------------------------|
| `trivy fs .`           | Dependency vulnerability scan         | On dependency change        |
| `detect-secrets`        | Secret leak detection                 | Always                      |
| `pnpm audit`            | npm package vulnerabilities           | Weekly / on dependency change |
| `ruff check` (Python)   | Python security linting               | Always (Python services)    |
| Manual review           | OWASP Top 10 compliance               | For feature-level changes   |

### OWASP checklist for AI-generated code

| # | Category              | What to check                                                    |
|---|-----------------------|------------------------------------------------------------------|
| 1 | Input validation      | All user input validated (type, length, format, range)           |
| 2 | Authentication        | Required endpoints have auth guards, tokens validated            |
| 3 | Session management    | Session tokens expire, refresh tokens rotate, secure cookies     |
| 4 | Access control        | workspace_id scoping, role-based permissions, owner checks       |
| 5 | Cryptographic storage | No plaintext passwords, no weak algorithms, key management       |
| 6 | Error handling        | No stack traces in responses, no information disclosure          |
| 7 | Logging              | No sensitive data in logs, structured logging, audit trail       |
| 8 | Data protection      | Personal data encrypted at rest, data minimization, PII handling |
| 9 | Communication        | HTTPS enforced, no hardcoded endpoints, TLS verification         |
| 10 | Dependency           | All dependencies from trusted sources, no known vulnerabilities  |

### Dependency vulnerability check

```bash
# Check for vulnerabilities in npm packages
pnpm audit
pnpm audit --fix                                           # auto-fix if available

# Check for Python packages
pip-audit                                                 # inside service venv

# Full filesystem scan (requires trivy)
npx trivy fs . --severity HIGH,CRITICAL --exit-code 1     # fail on critical/high
```

If any vulnerability is detected with severity HIGH or CRITICAL, the AI agent MUST:
1. Notify the human.
2. Attempt to update the dependency to a patched version.
3. If no patch is available, document the risk and propose mitigation.

---

## 8. Documentation Update Requirements

### WHY

Documentation must stay in sync with code. AI agents have a tendency to generate code without
updating corresponding documentation, creating a gap between implementation and documentation
that frustrates other developers.

### RATIONALE

Outdated documentation is worse than no documentation because it actively misleads. Every
code change that affects the public surface of the system (API, configuration, behavior)
must be reflected in documentation. AI agents are well-suited to this task because they can
simultaneously generate code and its documentation.

### When docs must be updated

| Trigger                        | Required documentation update                                       |
|--------------------------------|---------------------------------------------------------------------|
| New endpoint                   | OpenAPI spec (auto-generated), API docs                             |
| New concept                    | Guide in `docs/guides/`, glossary entry if needed                   |
| Schema change                  | Prisma schema comment, migration docs                               |
| Configuration change           | `.env.example`, deployment docs, config docs                        |
| Dependency change              | README dependencies section, ADR if significant                     |
| Behavior change                | API docs, concept docs, changelog                                   |
| Deprecation                    | Deprecation notice in docs, migration guide                         |
| Bug fix                        | Changelog entry, inline comment if workaround was needed            |

### What must be updated

For every change, the following documentation MUST be checked and updated as needed:

1. **API documentation** (OpenAPI, API reference docs).
2. **README.md** of the affected package/app/service.
3. **ADR** — if the change affects architecture, a new ADR or ADR update (human-only).
4. **Changelog** — every change gets a changelog entry.
5. **Inline JSDoc / pydoc** — public API documentation.
6. **Error reference** — if new error codes added.
7. **Migration guide** — if breaking changes.

### Auto-generation vs manual update

| Documentation type     | Update method                                                 |
|------------------------|---------------------------------------------------------------|
| OpenAPI spec           | Auto-generated from NestJS decorators (`pnpm generate:openapi`) |
| Typedoc                | Auto-generated from JSDoc (`pnpm docs:generate`)              |
| Prisma schema comments | Manual (in `schema.prisma`)                                   |
| README                 | Manual (always review after auto-generation)                  |
| ADR                    | Manual (human-only)                                           |
| Changelog              | Manual (following keepachangelog format)                      |
| Inline docs            | Manual (updated alongside code)                               |

---

## 9. Pattern Recognition

### WHY

Common development tasks follow recurring patterns. When an AI agent recognizes the pattern,
it can generate code that is consistent with existing implementations, reducing review effort
and improving code quality.

### RATIONALE

The Xennic codebase has established patterns for common tasks (new modules, endpoints, models,
events). Following these patterns ensures consistency, reduces cognitive load on reviewers,
and makes the codebase predictable. AI agents that recognize and apply these patterns produce
superior output.

### Required patterns for common tasks

#### New module creation

```typescript
// apps/api/src/<module>/
// <module>.module.ts
// <module>.controller.ts
// <module>.service.ts
// <module>.repository.ts
// dto/<action>.dto.ts
// interfaces/<entity>.interface.ts

// Always:
// 1. Register module in parent module imports
// 2. Create repository that extends BaseRepository
// 3. Controller only handles HTTP concerns
// 4. Service contains business logic
// 5. DTOs use class-validator decorators
```

#### New endpoint

```typescript
// Controller pattern:
@Controller('api/v1/<resource>')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: FindAllDTO): Promise<ApiResponse<Resource[]>> {
    const data = await this.resourceService.findAll(query);
    return { success: true, data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateDTO): Promise<ApiResponse<Resource>> {
    const data = await this.resourceService.create(dto);
    return { success: true, data };
  }
}
```

#### New database model

```prisma
// Prisma schema pattern:
model Resource {
  id           String   @id @default(uuid()) @db.Uuid
  workspaceId  String   @map("workspace_id") @db.Uuid
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  workspace    Workspace @relation(fields: [workspaceId], references: [id])

  @@map("resources")
  @@index([workspaceId])
}
```

#### New event

```typescript
// Event pattern:
export class ResourceCreatedEvent {
  static readonly pattern = 'resource.created';

  constructor(
    public readonly resourceId: string,
    public readonly workspaceId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

// Emit:
this.eventBus.emit(new ResourceCreatedEvent(resource.id, workspace.id));

// Handle:
@OnEvent(ResourceCreatedEvent.pattern)
async handleResourceCreated(event: ResourceCreatedEvent) {
  // ...
}
```

#### New calculation type (engineering service)

```python
# Python pattern:
class ShortCircuitCalculation(BaseCalculation):
    """Short circuit calculation implementation."""

    type = CalculationType.SHORT_CIRCUIT

    async def validate(self, params: CalculationParams) -> None:
        # Validate input parameters
        ...

    async def execute(self, params: CalculationParams) -> CalculationResult:
        # Execute calculation
        ...

    async def format_result(self, result: CalculationResult) -> dict:
        # Format result for API response
        ...
```

#### Third-party integration

```typescript
// Integration pattern:
@Injectable()
export class ExternalPaymentProvider {
  private readonly client: ExternalClient;

  constructor(
    @Inject('PAYMENT_CONFIG')
    private readonly config: PaymentConfig,
    private readonly logger: Logger,
  ) {
    this.client = new ExternalClient({
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      timeout: config.timeout,
    });
  }

  async charge(amount: number, currency: string): Promise<ChargeResult> {
    this.logger.log('Charging payment', { amount, currency });
    // Implement with proper error handling, retries, and logging
  }
}
```

---

## 10. Self-Review Protocol

### WHY

Before submitting any change, the AI agent must review its own output as if it were a human
reviewer. This catches errors the agent might have made during generation and prevents
obvious problems from reaching human reviewers.

### RATIONALE

AI agents have a "generation blindness" — they are focused on producing output and may not
notice errors in that output. Re-reading the diff with a critical eye catches many of these
errors. This protocol formalizes that review.

### Before submitting: re-read diff as a reviewer

1. **Read the entire diff** as if you were seeing it for the first time.
2. **Question every change**: Does this make sense? Is this needed? Is this correct?
3. **Check for hallucinations**: Did I generate any code that references APIs, functions,
   or imports that do not exist?
4. **Check for invented API calls**: Did I call any method that is not part of the actual API?
5. **Verify imports exist**: Every import must resolve to a real file in the codebase.
6. **Verify types are correct**: Every type annotation must match the actual type.
7. **Verify error handling**: Every error path must be handled or explicitly propagated.
8. **Verify logging**: Every significant operation must have appropriate logging.
9. **Verify tests pass**: All tests (existing and new) must pass.
10. **Verify no secrets**: No API keys, passwords, or tokens in the diff.

### Hallucination detection checklist

| Hallucination type         | What to check                                                 |
|----------------------------|---------------------------------------------------------------|
| Non-existent API methods   | Check the actual service/controller for the method            |
| Non-existent imports       | Verify the import path resolves to an actual file             |
| Non-existent types         | Verify the type/interface exists in the codebase              |
| Non-existent config keys   | Check if config keys are defined in the config module         |
| Non-existent env vars      | Check `.env.example` or config documentation                  |
| Non-existent npm packages  | Check `package.json` or `node_modules`                        |
| Non-existent Prisma models | Check `schema.prisma` for the model name                      |
| Non-existent events        | Check the event definitions in the events directory           |
| Non-existent decorators    | Check that decorators are imported from the correct library   |
| Non-existent middleware    | Check that middleware is registered in the module             |

---

## 11. Output Format

### WHY

Consistent output format reduces friction in code review, makes changelogs meaningful, and
ensures that every change is properly documented. AI agents must follow strict output
conventions.

### RATIONALE

PR descriptions, commit messages, and changelogs are the primary communication channels for
changes. When they follow a consistent format, reviewers can quickly understand what changed,
why, and what risks are involved. AI agents can generate these artifacts efficiently, but
they must follow the established format.

### PR description requirements

Every PR generated by an AI agent MUST include:

```markdown
## What
Brief description of what this PR does.

## Why
Why this change is needed (ticket reference, bug description, feature request).

## How
Technical approach taken, key design decisions, architecture notes.

## Risks
- Breaking changes: [Yes/No]
- Security impact: [None/Low/Medium/High]
- Performance impact: [None/Low/Medium/High]
- Data migration required: [Yes/No]
- Rollback plan: [Description or "Standard rollback"]

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] E2E tests added
- [ ] Manual testing performed

## Documentation
- [ ] API docs updated
- [ ] README updated
- [ ] ADR created/updated
- [ ] Changelog updated
```

### Code comment requirements

- Comments explain WHY, not WHAT.
- No commented-out code (delete it instead).
- No todo/fixme without a ticket reference: `// TODO(ABC-123): implement retry logic`.
- Use JSDoc/pydoc for public APIs.
- No author tags (use git blame).

### Commit message format

Follow conventional commits:

```
<type>(<scope>): <description>

[optional body, breaking changes, ticket reference]
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `security`, `revert`.

Examples:
```
feat(auth): add refresh token rotation
fix(api): handle null workspace_id in project list
docs(constitution): update ADR format section
security(auth): upgrade bcrypt to v5
refactor(calc): extract validation logic
```

### Changelog entry format

```markdown
## [1.2.0] - 2026-06-26

### Added
- New feature description (PR #123)

### Changed
- Behavior change description (PR #124)

### Fixed
- Bug fix description (PR #125)

### Security
- Security fix description (PR #126)

### Deprecated
- Feature name — use NewFeature instead (PR #127)
```

---

## 12. Verification Commands Reference

### WHY

Providing copy-pasteable commands ensures AI agents run the correct verification and do not
skip steps due to uncertainty about what commands to use.

### RATIONALE

AI agents may not know the project's specific verification commands. A reference section
eliminates this uncertainty and makes it easy to run the full verification suite.

### Frontend / Backend (TypeScript)

```bash
# Run from repository root
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm format:check
```

### Python services

```bash
# Run inside the service directory (e.g., services/engineering-service/)
source venv/bin/activate
ruff check src tests
mypy src
pytest tests -v --cov=src --cov-report=term-missing
```

### Database

```bash
# Run from repository root
pnpm db:generate
pnpm db:apply        # verify migration
pnpm db:studio       # (interactive) verify schema
```

### Security

```bash
# Run from repository root
pnpm audit
npx trivy fs . --severity HIGH,CRITICAL
npx detect-secrets --scan .
```

### Documentation

```bash
# Run from repository root
pnpm generate:openapi
pnpm format:check    # also checks markdown formatting
```

### Quick copy-paste all-in-one

```bash
# Run every verification command sequentially
pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm format:check && pnpm audit
```

---

## 13. Escalation Rules

### WHY

AI agents must know when to stop and ask a human. Attempting to proceed with insufficient
information or confidence leads to errors that waste time and introduce risk.

### RATIONALE

The most dangerous AI agent behavior is confidently generating incorrect output. An agent
that knows its limitations and escalates appropriately is safer and more effective than one
that always produces an answer, regardless of quality.

### When to ask human

The AI agent MUST stop and ask a human for clarification or guidance in these situations:

| Situation                        | Why                                                                 |
|----------------------------------|---------------------------------------------------------------------|
| Unclear requirements             | Implementing the wrong thing wastes more time than asking           |
| Architectural decisions          | AI agents should not make architectural decisions                   |
| Security concerns                | Security mistakes can cause data breaches                           |
| Production-impacting changes     | Changes to production systems require human judgment                |
| Breaking changes                 | Breaking changes need coordination and communication                |
| Schema changes                   | Schema changes affect all consumers and may need migration planning |
| Dependency additions             | New dependencies need legal, security, and maintenance review       |
| No applicable pattern found      | If the task does not match any known pattern, ask for direction      |
| Conflicting requirements         | When requirements contradict each other                             |
| Access to sensitive data         | Never read or expose production data without explicit permission     |

### Confidence threshold

If the AI agent's confidence in its generated solution is below 80%, it MUST:

1. Notify the human of the low confidence.
2. Explain what aspects it is uncertain about.
3. Propose the best-effort solution with caveats.
4. Ask the human to review and provide guidance.

Confidence assessment criteria:
- **Code compiles?** If unsure, confidence < 80%.
- **All imports exist?** If unsure, confidence < 80%.
- **Architecture compliance?** If unsure about an invariant, confidence < 80%.
- **Test coverage?** If unsure tests cover the change, confidence < 80%.
- **Security implications?** If unsure about security, confidence < 50%.

### Escalation format

When escalating, use this format:

```
## Need Human Guidance

**Task**: <brief description of what was requested>

**Issue**: <what is unclear, uncertain, or concerning>

**Attempted**: <what the agent tried>

**Options considered**:
1. Option A — <pros/cons>
2. Option B — <pros/cons>
3. Option C — <pros/cons>

**Recommendation**: <which option the agent recommends and why>

**Confidence**: <percentage>
```

---

## Compliance

### Automated enforcement (planned)

- CI pipeline will detect if a PR was generated by an AI agent (via commit message or PR label).
- AI-generated PRs will be flagged for additional review.
- Security scan must pass before review can begin.
- Architecture compliance check automated via custom ESLint rules.

### Manual enforcement

- All AI-generated PRs require at least one human reviewer.
- Reviewers are expected to verify compliance with these rules.
- Repeated violations result in process escalation (restricted AI access).
- A log of AI-generated changes is maintained for audit purposes.

### Version history

| Version | Date       | Changes                                               |
|---------|------------|-------------------------------------------------------|
| 1.0.0   | 2026-06-26 | Initial version — foundational AI agent development rules |
