# Xennic Engineering Constitution

> **Canonical Engineering Authority Document**
> Version: 1.0.0 — Sprint K3.2
> Status: Living Document (requires full ADR for any amendment)
> Primary Audience: All engineers, architects, developers, AI agents, reviewers, and contributors to the Xennic Platform
> Cross-Reference: → docs/platform-blueprint/01-platform-blueprint.md, → docs/reference-architecture/*.md

---

## Document Navigation

| Section | Content |
|---------|---------|
| **1** | Preamble |
| **2** | Engineering Philosophy |
| **3** | Core Engineering Principles |
| **4** | Architectural Invariants |
| **5** | Things NEVER Allowed |
| **6** | Technical Debt Policy |
| **7** | Backward Compatibility Policy |
| **8** | Versioning Philosophy |
| **9** | ADR Policy |
| **10** | Review Policy |
| **11** | Ownership Model |
| **12** | Change Management |
| **13** | Deprecation Strategy |
| **14** | Quality Culture |
| **15** | Engineering Glossary |
| **16** | Compliance Matrix |
| **17** | Engineering Quality Score |

---

## Cross-Reference Key

Throughout this document, references appear in the format:

- `→ docs/engineering-constitution/02-coding-standards.md` — Coding standards (this constitution)
- `→ docs/engineering-constitution/03-git-workflow.md` — Git workflow (this constitution)
- `→ docs/platform-blueprint/01-platform-blueprint.md` — Platform blueprint
- `→ docs/reference-architecture/XX-*.md` — Reference architecture documents
- `→ docs/decisions/ADR-XXX` — Architecture Decision Records
- `→ docs/standards/*.md` — Standards documentation
- `→ docs/backend/*.md` — Backend documentation
- `→ [CODE] apps/api/src/...` — Code reference
- `→ [PRISMA] model: XXX` — Prisma schema model reference

---

## 1. Preamble

### 1.1 Why This Constitution Exists

The Xennic Platform is a bilingual engineering knowledge platform of substantial complexity: 15 business domains, 18+ services, 61+ Prisma models, 180+ API endpoints, and a multi-tenant, event-driven microservices architecture. Without a binding engineering constitution, such a system inevitably degrades into inconsistency, fragility, and unmanageable technical debt.

This constitution exists to:

1. **Codify** the engineering principles, standards, and invariants that every contributor — human or AI agent — must follow
2. **Prevent** architectural erosion by defining immutable constraints
3. **Ensure** consistency across language boundaries (TypeScript, Python, shell), framework boundaries (NestJS, Next.js, FastAPI), and service boundaries
4. **Enable** autonomous decision-making within a bounded context while preserving global system coherence
5. **Provide** a single source of truth for engineering governance, review criteria, and quality metrics

### 1.2 Who Must Follow This Constitution

| Role | Obligation |
|------|------------|
| All developers (human) | Must read, understand, and follow all rules |
| All AI agents / coding assistants | Must be instructed with this constitution before generating code |
| All code reviewers | Must enforce constitutional rules during review |
| All architects | Must ensure ADRs and architectural decisions comply with constitutional invariants |
| All DevOps engineers | Must ensure CI/CD pipelines enforce applicable rules |
| All technical leads | Must ensure their teams are trained on and comply with this constitution |
| All contractors & vendors | Must agree in writing to follow this constitution |

**Violations** of this constitution must be flagged in code review. Systematic violations require an incident review (→ §12 Change Management).

### 1.3 How to Use This Document

- **New engineers**: Read sections 1-5 and 15 first. Then read `→ docs/engineering-constitution/02-coding-standards.md` and `→ docs/engineering-constitution/03-git-workflow.md`.
- **Reviewers**: Section 10 (Review Policy) and Section 16 (Compliance Matrix) define review criteria.
- **Architects**: Sections 4 (Architectural Invariants) and 9 (ADR Policy) govern architectural decision-making.
- **AI agents**: Parse the full document. Cross-reference rules across sections. This document is the highest authority.

### 1.4 Constitutional Hierarchy

```
Xennic Engineering Constitution (this document)
  ├── 02 Coding Standards (language/framework rules)
  ├── 03 Git Workflow (version control rules)
  └── ADR Library (→ docs/decisions/)
        └── Platform Blueprint (→ docs/platform-blueprint/)
              └── Reference Architecture (→ docs/reference-architecture/)
                    └── Service Documentation (→ docs/services/)
```

Lower-level documents MUST NOT contradict this constitution. Where conflict exists, this constitution prevails.

### 1.5 Amendment Process

This constitution is a **living document** but amendments require:

1. A full ADR (→ §9) documenting the proposed change and its rationale
2. Review by the Architecture Review Board (→ §12.3)
3. A 2-week comment period for all engineers
4. Supermajority approval (75%+ of engineering leads)
5. Update of the compliance matrix (→ §16) to reflect the change

---

## 2. Engineering Philosophy

### 2.1 Our Ten Core Beliefs

#### Belief 1: Clarity Over Cleverness

**Statement:** Code is read far more often than it is written. We optimise for the reader, not the writer.

**Explanation:** Every line of code should be immediately understandable to an engineer of average skill in the relevant domain. Clever one-liners, cryptic abbreviations, and premature optimisations that obscure intent are prohibited. If a piece of code requires a comment to explain what it does, the code should be rewritten — not commented.

**Why:** The Xennic Platform will be maintained by dozens of engineers over many years. The cost of unclear code compounds with every maintenance cycle.

#### Belief 2: Correctness First, Performance Second

**Statement:** A system that is fast but wrong is useless. Correctness is the non-negotiable foundation.

**Explanation:** We validate inputs, outputs, invariants, and state transitions. We write tests that prove correctness. We optimise only after profiling demonstrates a real bottleneck. Premature optimisation is a source of bugs, complexity, and technical debt.

**Why:** In an engineering knowledge platform, incorrect calculations, wrong search results, or data corruption can lead to real-world engineering failures. Performance degrades UX; incorrectness destroys trust.

#### Belief 3: Every Boundary is a Validation Point

**Statement:** All system boundaries — API endpoints, service-to-service calls, message queues, database writes, file ingestion — must validate their inputs.

**Explanation:** We trust no external input. Validation includes type checking, schema validation, range checking, business rule enforcement, and sanitisation. Validation failures must produce clear, actionable error messages.

**Why:** A distributed system with 18+ services means that any service can receive malformed data from any other service. Defensive validation at every boundary prevents cascading failures.

#### Belief 4: Automate Everything That Can Be Automated

**Statement:** Manual processes are error-prone, inconsistent, and do not scale. We automate relentlessly.

**Explanation:** Linting, formatting, type-checking, testing, building, deploying, security scanning, dependency updates — if it can be automated, it must be automated. Manual steps are documented and tracked for future automation.

**Why:** With a monorepo of this size, manual processes create bottlenecks and inconsistencies that slow the entire engineering organisation.

#### Belief 5: Small Services, Clear Boundaries

**Statement:** Each service does one thing well and communicates via well-defined APIs and events.

**Explanation:** Services own their data. Services do not share databases. Service boundaries align with business domain boundaries (→ `docs/reference-architecture/04-domain-map.md`). Service-to-service communication uses asynchronous events via RabbitMQ for cross-domain interactions and synchronous HTTP for query flows within a domain.

**Why:** Tightly coupled services create a distributed monolith — the worst of both worlds. Clear service boundaries enable independent deployment, independent scaling, and independent team ownership.

#### Belief 6: Multi-Tenancy is Not an Afterthought

**Statement:** Every feature, every model, every query, every cache key, every event — everything must account for workspace isolation.

**Explanation:** Multi-tenancy via `workspace_id` is baked into the foundation, not added as a layer. All Prisma models include `workspace_id`. All API endpoints scope queries to the authenticated workspace. All cache keys include workspace context. All events carry workspace identity.

**Why:** The platform serves multiple organisations. Data isolation is a security and compliance requirement. Retrofitting multi-tenancy is exponentially more expensive than building it correctly from day one.

#### Belief 7: Events Over Polling

**Statement:** When state changes, services publish events. Interested services listen. No service polls another for state changes.

**Explanation:** RabbitMQ is the backbone for all async communication. Event schemas are versioned and documented. Events are past-tense, domain-specific, and carry all data needed by consumers (→ `docs/engineering-constitution/02-coding-standards.md` §21 Event Naming).

**Why:** Polling creates unnecessary load, introduces latency, and couples services in time. Events enable loose coupling, replayability, and observability.

#### Belief 8: Idempotency is the Default

**Statement:** Every mutation must be safe to execute multiple times with the same result.

**Explanation:** Idempotency keys, unique constraints, and at-least-once delivery combine to ensure that retries, network failures, and duplicate messages never cause data corruption. This applies to API endpoints, event consumers, and job processors.

**Why:** In a distributed system, failures are not exceptional — they are normal. Network timeouts, consumer crashes, and retry storms happen daily. Idempotency is what prevents these from becoming data disasters.

#### Belief 9: Observability is a Feature, Not an Afterthought

**Statement:** Every service must expose health checks, metrics, structured logs, and distributed traces.

**Explanation:** Logs are structured JSON with correlation IDs. Metrics cover request rates, error rates, latencies, and business KPIs. Traces propagate across service boundaries via W3C Trace-Context. Dashboards and alerts are defined per service.

**Why:** When an incident occurs in production — and it will — the cost of finding the root cause is directly proportional to the quality of observability tooling. Debugging a distributed system without observability is impossible.

#### Belief 10: Continuous Improvement Over Perfection

**Statement:** We ship good code today and make it great tomorrow. Perfect is the enemy of shipped.

**Explanation:** This is not a license for sloppiness. It means we value iterative improvement over analysis paralysis. We ship with appropriate test coverage, documentation, and review — then we monitor, learn, and improve. Refactoring is planned, tracked, and scheduled.

**Why:** Blocking delivery waiting for perfection creates multi-month release cycles that destroy motivation, delay value delivery, and ultimately lower quality as context is lost.

---

## 3. Core Engineering Principles

### Principle 1: Single Responsibility

**Statement:** Every module, class, function, and service must have exactly one reason to change.

**Rationale:** When a component has multiple responsibilities, changes to one responsibility risk breaking others. This is the foundation of maintainability.

**Good Example:**
```typescript
// A service that only handles calculation execution
class CalculationService {
  async execute(calcId: string): Promise<CalculationResult> {
    const calc = await this.calcRepo.findById(calcId);
    return this.engine.evaluate(calc);
  }
}
```

**Bad Example:**
```typescript
// A service that handles calculation, notification, and export
class CalculationService {
  async execute(calcId: string): Promise<CalculationResult> {
    const calc = await this.calcRepo.findById(calcId);
    const result = await this.engine.evaluate(calc);
    await this.emailService.sendNotification(calc.userId, result);
    await this.exportService.exportToPdf(result);
    return result;
  }
}
```

**Cross-Reference:** → `docs/engineering-constitution/02-coding-standards.md` §11 Folder Organization, → `docs/reference-architecture/02-service-catalog.md`

---

### Principle 2: Dependency Inversion

**Statement:** Depend on abstractions, not concretions. High-level modules must not depend on low-level modules.

**Rationale:** Abstractions (interfaces, abstract classes) decouple the policy from the detail, enabling testing, swapping implementations, and independent evolution.

**Good Example:**
```typescript
interface CalculationEngine {
  evaluate(calc: Calculation): Promise<CalculationResult>;
}

class CalculationService {
  constructor(private readonly engine: CalculationEngine) {}
}
```

**Bad Example:**
```typescript
class CalculationService {
  private engine = new PythonCalculationEngine(); // Direct dependency on concrete implementation
}
```

**Cross-Reference:** → `docs/engineering-constitution/02-coding-standards.md` §2 NestJS Standards (DI patterns)

---

### Principle 3: Encapsulation

**Statement:** Hide internal implementation details. Expose only what is necessary through well-defined interfaces.

**Rationale:** Encapsulation prevents external code from depending on internal implementation details that may change. It reduces the blast radius of changes.

**Good Example:**
```typescript
class PasswordHasher {
  private readonly saltRounds = 12;
  async hash(password: string): Promise<string> { /* implementation hidden */ }
  async compare(password: string, hash: string): Promise<boolean> { /* implementation hidden */ }
}
```

**Bad Example:**
```typescript
class PasswordHasher {
  saltRounds = 12; // Exposed — now external code depends on this
  algorithm = 'bcrypt'; // Exposed — changing requires changes everywhere
}
```

**Cross-Reference:** → `docs/engineering-constitution/02-coding-standards.md` §2 NestJS Standards

---

### Principle 4: Fail Fast

**Statement:** Validate inputs and preconditions at the earliest possible point. Fail immediately with clear error messages rather than propagating bad state.

**Rationale:** Failures that are detected early are easier to diagnose, have clearer error messages, and avoid cascading through multiple layers where the original cause becomes obscured.

**Good Example:**
```typescript
async createCalculation(dto: CreateCalculationDto): Promise<Calculation> {
  this.validateDto(dto); // Fails immediately if DTO is invalid
  const workspace = await this.workspaceService.getById(dto.workspaceId);
  if (!workspace) throw new NotFoundException('Workspace not found');
  // ... proceed with valid state
}
```

**Bad Example:**
```typescript
async createCalculation(dto: CreateCalculationDto): Promise<Calculation> {
  const calc = new Calculation();
  calc.workspaceId = dto.workspaceId; // No validation — will fail later obscurely
  calc.formula = dto.formula;
  return this.calcRepo.save(calc); // May throw a confusing database error
}
```

**Cross-Reference:** → `docs/engineering-constitution/02-coding-standards.md` §15 Exceptions & Error Handling

---

### Principle 5: Composition Over Inheritance

**Statement:** Favour composing behaviour from smaller, focused objects over deep inheritance hierarchies.

**Rationale:** Inheritance creates tight coupling between parent and child classes. Composition enables flexible, testable, and reusable behaviour combinations.

**Good Example:**
```typescript
class CalculationValidator {
  constructor(private readonly validators: ValidationRule[]) {}
  async validate(calc: Calculation): Promise<ValidationResult[]> {
    return Promise.all(this.validators.map(v => v.validate(calc)));
  }
}
```

**Bad Example:**
```typescript
class BaseCalculation {
  validate(): ValidationResult[] { /* ... */ }
}
class ElectricalCalculation extends BaseCalculation { /* ... */ }
class MechanicalCalculation extends BaseCalculation { /* ... */ }
class SpecializedElectricalCalculation extends ElectricalCalculation { /* ... */ }
```

**Cross-Reference:** → `docs/engineering-constitution/02-coding-standards.md` §1 TypeScript Standards

---

### Principle 6: Command-Query Separation (CQS)

**Statement:** Methods must be either commands (that change state but return nothing) or queries (that return data but change nothing). Never both.

**Rationale:** CQS makes code predictable and testable. Queries can be called freely without side effects. Commands are clearly identifiable as state-changing operations.

**Good Example:**
```typescript
// Query
async getCalculation(id: string): Promise<Calculation> { /* no state change */ }

// Command
async executeCalculation(id: string): Promise<void> { /* state change, no return value */ }
```

**Bad Example:**
```typescript
async getAndExecuteCalculation(id: string): Promise<Calculation> {
  const calc = await this.calcRepo.findById(id); // Query
  await this.execute(id); // Command (side effect hidden in a "get" method)
  return calc;
}
```

**Cross-Reference:** → `docs/engineering-constitution/02-coding-standards.md` §2 NestJS Standards

---

### Principle 7: Don't Repeat Yourself (DRY)

**Statement:** Every piece of knowledge must have a single, unambiguous, authoritative representation within the system.

**Rationale:** Duplication means changes must be made in multiple places, leading to inconsistencies and bugs. DRY reduces maintenance cost and error surface.

**Good Example:**
```typescript
// Reusable validation function
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
// Used everywhere
```

**Bad Example:**
```typescript
// Same regex copied in 5 different files
// File 1: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// File 2: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// File 3: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

**Cross-Reference:** → `docs/engineering-constitution/02-coding-standards.md` §11 Folder Organization

---

### Principle 8: Principle of Least Astonishment

**Statement:** The system should behave in ways that users and developers expect. Surprises are bugs.

**Rationale:** Predictable systems are easier to use, easier to maintain, and safer. Every surprising behaviour is a latent defect waiting to be triggered.

**Good Example:**
```typescript
// GET returns data without side effects — as expected
@Get(':id')
async get(@Param('id') id: string): Promise<CalculationResponse> {
  return this.service.findById(id);
}
```

**Bad Example:**
```typescript
// GET with side effects — astonishment
@Get(':id')
async get(@Param('id') id: string): Promise<CalculationResponse> {
  await this.service.incrementViewCount(id); // Side effect on GET — unexpected
  return this.service.findById(id);
}
```

**Cross-Reference:** → `docs/reference-architecture/03-data-flow.md`

---

### Principle 9: Explicit Over Implicit

**Statement:** Dependencies, configuration, data flow, and error handling must be explicit. Implicit behaviour is hidden behaviour.

**Rationale:** Implicit dependencies (global state, magic auto-wiring, hidden configuration) make systems brittle and hard to debug. Explicit code is transparent code.

**Good Example:**
```typescript
@Injectable()
export class CalculationService {
  constructor(
    private readonly calcRepo: CalculationRepository,
    private readonly engine: CalculationEngine,
    private readonly logger: Logger,
  ) {} // Dependencies are explicit in constructor
}
```

**Bad Example:**
```typescript
export class CalculationService {
  private calcRepo = new CalculationRepository(); // Hidden instantiation
  private engine = new CalculationEngine(); // Cannot be mocked or replaced
}
```

**Cross-Reference:** → `docs/engineering-constitution/02-coding-standards.md` §2 NestJS Standards

---

### Principle 10: Testability as a Design Goal

**Statement:** Code must be designed for testability from the start. If it is hard to test, it is poorly designed.

**Rationale:** Testable code is modular, has clear interfaces, and separates concerns. Making code testable after the fact is expensive and often requires refactoring.

**Good Example:**
```typescript
class CalculationService {
  constructor(
    private readonly calcRepo: ICalculationRepository,
    private readonly engine: ICalculationEngine,
  ) {} // Interfaces enable mocking
}

// Test
const mockRepo = mock<ICalculationRepository>();
const mockEngine = mock<ICalculationEngine>();
const service = new CalculationService(mockRepo, mockEngine);
```

**Bad Example:**
```typescript
class CalculationService {
  constructor() {
    this.calcRepo = new CalculationRepository(); // Hard-coded dependency
    this.engine = new PythonCalculationEngine(); // Cannot be mocked
  }
}
```

**Cross-Reference:** → `docs/engineering-constitution/02-coding-standards.md` §2 NestJS Standards, → `docs/standards/testing-standards.md`

---

### Principle 11: Consistency

**Statement:** Similar things should look similar. Different things should look different.

**Rationale:** Consistency reduces cognitive load. When developers know the pattern for one module, they can apply it to any module without re-learning.

**Good Example:**
```typescript
// All modules follow the same structure
// module/
//   module.controller.ts
//   module.service.ts
//   module.repository.ts
//   dto/
//     create-module.dto.ts
//     update-module.dto.ts
//     module-response.dto.ts
```

**Bad Example:**
```typescript
// Each module has a different structure
// calculations/
//   calcController.ts
//   calc_service.ts
//   repo.calc.ts
// users/
//   user.controller.ts
//   userService.ts
//   UserRepository.ts
```

**Cross-Reference:** → `docs/engineering-constitution/02-coding-standards.md` §11 Folder Organization

---

### Principle 12: Open-Closed

**Statement:** Software entities must be open for extension but closed for modification.

**Rationale:** Adding new behaviour should not require modifying existing, tested code. Use extension points (interfaces, plugins, strategies) instead of modifying core logic.

**Good Example:**
```typescript
interface CalculationStrategy {
  execute(params: CalculationParams): Promise<CalculationResult>;
}

class CalculationEngine {
  constructor(private readonly strategies: Map<string, CalculationStrategy>) {}
  
  async execute(type: string, params: CalculationParams): Promise<CalculationResult> {
    const strategy = this.strategies.get(type);
    if (!strategy) throw new Error(`Unknown calculation type: ${type}`);
    return strategy.execute(params);
  }
}
// New strategies added without modifying CalculationEngine
```

**Bad Example:**
```typescript
class CalculationEngine {
  async execute(type: string, params: CalculationParams): Promise<CalculationResult> {
    switch (type) { // Every new type modifies this file
      case 'voltage-drop': return this.calculateVoltageDrop(params);
      case 'cable-sizing': return this.calculateCableSizing(params);
      // Adding a new type requires modifying this switch
    }
  }
}
```

**Cross-Reference:** → `docs/reference-architecture/02-service-catalog.md`

---

### Principle 13: Convention Over Configuration

**Statement:** Use sensible defaults and standard conventions to reduce decision fatigue and configuration burden.

**Rationale:** Every configuration option is a decision that must be made, documented, and maintained. Standard conventions eliminate unnecessary decisions and make the system predictable.

**Good Example:**
```typescript
// Standard logger available via DI — no configuration needed
constructor(private readonly logger: Logger) {}

// Standard pagination — no need to decide per endpoint
@Get()
async findAll(@Query() query: PaginationQuery): Promise<PaginatedResult<Item>> {
  return this.service.findAll(query);
}
```

**Bad Example:**
```typescript
// Custom logging setup in every module
const logger = new WinstonLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: 'error.log' })]
});
```

**Cross-Reference:** → `docs/engineering-constitution/02-coding-standards.md` §17 Configuration

---

### Principle 14: Defensive Programming

**Statement:** Assume inputs will be invalid, dependencies will fail, and the environment will be hostile. Protect against all three.

**Rationale:** Production environments are unpredictable. Network partitions, resource exhaustion, and malicious inputs are not theoretical — they happen. Defensive code is resilient code.

**Good Example:**
```typescript
async getCalculation(id: string): Promise<Calculation | null> {
  if (!id || !isValidUUID(id)) {
    throw new BadRequestException('Invalid calculation ID');
  }
  try {
    return await this.calcRepo.findById(id);
  } catch (error) {
    this.logger.error('Failed to fetch calculation', { id, error });
    throw new ServiceUnavailableException('Calculation service unavailable');
  }
}
```

**Bad Example:**
```typescript
async getCalculation(id: string): Promise<Calculation> {
  return this.calcRepo.findById(id); // No validation, no error handling
}
```

**Cross-Reference:** → `docs/engineering-constitution/02-coding-standards.md` §15 Exceptions & Error Handling

---

### Principle 15: You Ain't Gonna Need It (YAGNI)

**Statement:** Build only what is needed now. Do not build for hypothetical future requirements.

**Rationale:** Unused code is dead weight — it must be maintained, tested, and understood, but delivers no value. Features built for imagined futures rarely match actual future needs.

**Good Example:**
```typescript
// Only implement the calculation types currently needed
class CalculationEngine {
  private readonly strategies = new Map<string, CalculationStrategy>();
  
  registerStrategy(type: string, strategy: CalculationStrategy): void {
    this.strategies.set(type, strategy);
  }
}
// Register only what exists today
```

**Bad Example:**
```typescript
// Building "extensible" infrastructure for 10 calculation types when only 2 are needed
abstract class AbstractCalculation {
  abstract validate(): void;
  abstract execute(): void;
  abstract audit(): void;
  abstract export(): void;
  abstract notify(): void;
  // 5 abstract methods — all must be implemented, most unused
}
```

**Cross-Reference:** → `docs/platform-blueprint/01-platform-blueprint.md` §36

---

### Principle 16: The Boy Scout Rule

**Statement:** Leave the codebase cleaner than you found it. Every commit should improve quality.

**Rationale:** Continuous incremental improvement prevents decay. If every developer makes one small improvement per commit, the codebase gets better over time instead of worse.

**Good Example:**
```typescript
// While fixing a bug, also rename the unclear variable
// Before: let x = calc.a * calc.b / 100;
// After:
const voltageDrop = (current * impedance) / 100;
```

**Bad Example:**
```typescript
// Fixing a bug by adding more code to an already messy function
// Without cleaning up the surrounding mess
function calculate(args: any) { // 200 lines, any types, unclear logic
  // Just add the fix at the end
}
```

**Cross-Reference:** → §6 Technical Debt Policy

---

### Principle 17: Separation of Concerns

**Statement:** Different concerns must be separated into different modules, layers, or services. Cross-cutting concerns (logging, auth, validation) must not be mixed with business logic.

**Rationale:** Mixing concerns creates tight coupling, reduces reusability, and makes changes riskier.

**Good Example:**
```typescript
@Controller('calculations')
export class CalculationController {
  @Post()
  @UseGuards(AuthGuard) // Cross-cutting concern separated
  async create(@Body() dto: CreateCalculationDto): Promise<CalculationResponse> {
    return this.service.create(dto); // Controller focuses on HTTP, service on business logic
  }
}
```

**Bad Example:**
```typescript
@Controller('calculations')
export class CalculationController {
  @Post()
  async create(@Req() req: Request, @Body() body: any): Promise<any> {
    if (!req.headers.authorization) throw new Error('Unauthorized'); // Auth in controller
    const token = req.headers.authorization.split(' ')[1]; // Token parsing in controller
    const user = await this.userService.validateToken(token); // Auth in controller
    // Business logic mixed with HTTP handling
    const result = await this.businessLogic(body, user);
    return { success: true, data: result };
  }
}
```

**Cross-Reference:** → `docs/engineering-constitution/02-coding-standards.md` §2 NestJS Standards

---

### Principle 18: Favour Immutability

**Statement:** Prefer immutable data structures. Do not mutate inputs or shared state.

**Rationale:** Immutability eliminates entire classes of bugs related to unexpected state changes, makes code easier to reason about, and enables safe concurrent access.

**Good Example:**
```typescript
function calculateVoltageDrop(params: CalculationParams): CalculationResult {
  // Create new objects — never mutate input
  const result: CalculationResult = {
    voltageDrop: params.current * params.impedance,
    percentage: (params.current * params.impedance / params.nominalVoltage) * 100,
    status: 'compliant',
    timestamp: new Date(),
  };
  return result;
}
```

**Bad Example:**
```typescript
function calculateVoltageDrop(params: CalculationParams): void {
  params.voltageDrop = params.current * params.impedance; // Mutating input!
  params.percentage = (params.voltageDrop / params.nominalVoltage) * 100;
}
```

**Cross-Reference:** → `docs/engineering-constitution/02-coding-standards.md` §1 TypeScript Standards

---

### Principle 19: Avoid Premature Abstraction

**Statement:** Do not abstract until you have at least three concrete examples that demonstrate a clear, stable pattern.

**Rationale:** Abstraction based on one or two examples is likely wrong. Wait until the pattern is clear before extracting shared code. Premature abstraction creates indirection without benefit.

**Good Example:**
```typescript
// Start with concrete implementations
class VoltageDropCalculation { /* ... */ }
class CableSizingCalculation { /* ... */ }
class ShortCircuitCalculation { /* ... */ }

// Only after 3+ examples, extract common abstraction
abstract class BaseCalculation {
  // Common pattern extracted
}
```

**Bad Example:**
```typescript
abstract class BaseCalculation { // Extracted after only 1 use case
  abstract calculate(): Promise<Result>;
  abstract validate(): Promise<ValidationResult>;
  abstract export(): Promise<ExportData>;
}
class VoltageDropCalculation extends BaseCalculation {
  // Forced to implement methods that don't make sense for this type
}
```

**Cross-Reference:** → `docs/reference-architecture/08-implementation-matrix.md`

---

### Principle 20: Think in Systems

**Statement:** Consider the system-wide impact of every change. A change in one service affects dependents, data flow, observability, and operations.

**Rationale:** In a distributed system, local optimisations can create global problems. A change that makes perfect sense in isolation may break contracts, introduce latency, or violate invariants for downstream consumers.

**Good Example:**
```typescript
// Before changing the response shape of an API:
// 1. Check all consumers of this endpoint
// 2. Check the OpenAPI spec — does the change require a new version?
// 3. Check the event schema if this change affects events
// 4. Check if the change affects any downstream services
// 5. Document the change in the changelog
```

**Bad Example:**
```typescript
// Changing a response field name because it "makes more sense"
// Without considering:
// - Frontend code that uses the field
// - API clients that depend on the field
// - Documentation that references the field
// - Caching layers that key on the field
```

**Cross-Reference:** → `docs/reference-architecture/03-data-flow.md`, → `docs/reference-architecture/05-dependency-map.md`

---

## 4. Architectural Invariants

These invariants are **immutable**. They cannot be changed without a full ADR (→ §9) and approval by the Architecture Review Board (→ §12.3). Violations are constitutional breaches.

### Invariant 1: Multi-Tenancy via workspace_id

**Statement:** Every entity that stores data per-tenant MUST include `workspace_id` as a mandatory, indexed column. ALL queries MUST filter by `workspace_id`.

**Rationale:** Data isolation is a security and compliance requirement. Accidental cross-tenant data leaks would destroy trust and likely violate regulatory requirements.

**Enforcement:** Prisma schema validation (compile-time), middleware that injects workspace context, query interceptors that verify workspace scoping. Automated tests verify that every repository method includes a workspace filter.

**Cross-Reference:** → `[PRISMA] model: *` (all models include workspace_id), → `docs/engineering-constitution/02-coding-standards.md` §6 Prisma Standards, → `docs/reference-architecture/04-domain-map.md`

---

### Invariant 2: URL-Prefixed API Versioning

**Statement:** All API versions are expressed as a URL prefix: `/api/v1/`, `/api/v2/`, etc. The current version is always `v1`.

**Rationale:** URL-prefixed versioning is the clearest, most explicit versioning strategy. It makes the version immediately visible in logs, metrics, and client configurations. Header-based versioning is invisible and error-prone. Query-parameter versioning can be overridden accidentally.

**Enforcement:** NestJS global prefix configuration. Route definitions MUST NOT hardcode version numbers — use the global prefix. Each major version gets a separate module directory.

**Cross-Reference:** → `docs/engineering-constitution/02-coding-standards.md` §2 NestJS Standards, → `docs/platform-blueprint/01-platform-blueprint.md` §26

---

### Invariant 3: All Async Processing Through RabbitMQ

**Statement:** Every asynchronous, cross-service communication MUST use RabbitMQ as the message broker. Direct HTTP polling between services for async workflows is prohibited.

**Rationale:** RabbitMQ provides guaranteed delivery, dead-letter queues, consumer acknowledgements, and routing flexibility. Direct coupling via HTTP for async workflows eliminates the benefits of asynchronous processing and creates temporal coupling.

**Enforcement:** Code review checks for cross-service HTTP calls in async contexts. Architecture review ensures new async workflows use RabbitMQ.

**Cross-Reference:** → `docs/reference-architecture/03-data-flow.md`, → `docs/reference-architecture/06-runtime-topology.md`

---

### Invariant 4: Every Mutation is Idempotent

**Statement:** Every mutation endpoint, event consumer, and job handler MUST handle duplicate execution safely. Executing the same mutation twice MUST produce the same result as executing it once.

**Rationale:** Distributedsystems experience duplicate messages, retries, and at-least-once delivery guarantees. Without idempotency, duplicates cause data corruption, duplicate charges, and unpredictable state.

**Enforcement:** Idempotency keys on all POST/PUT/PATCH endpoints. Unique constraints on event processing. Idempotency tests for every consumer. Review checklist includes idempotency verification.

**Cross-Reference:** → `docs/engineering-constitution/02-coding-standards.md` §18 Async Programming, → `docs/reference-architecture/03-data-flow.md`

---

### Invariant 5: Unified Response Envelope

**Statement:** ALL API responses MUST use the unified envelope format:

```typescript
// Success:
{ success: true, data: T, meta?: { page, limit, total } }

// Error:
{ success: false, error: { code: string, message: string, details?: any } }
```

**Rationale:** A consistent response format enables standardised client-side handling, automated error processing, unified logging, and predictable API contracts. Every endpoint returns the same shape.

**Enforcement:** NestJS interceptor enforces the envelope. OpenAPI generation validates the schema. Automated contract tests verify every endpoint.

**Cross-Reference:** → `docs/engineering-constitution/02-coding-standards.md` §15 Exceptions & Error Handling, → `docs/platform-blueprint/01-platform-blueprint.md` §26

---

### Invariant 6: Services are Stateless

**Statement:** All services MUST be stateless. State lives exclusively in PostgreSQL, Redis, MinIO, and Qdrant. No service may store state in memory, on the filesystem, or in local storage.

**Rationale:** Stateless services can be scaled horizontally, restarted without data loss, and deployed with zero-downtime rolling updates. Stateful services introduce deployment constraints, data loss risks, and scaling bottlenecks.

**Enforcement:** Deployment checks verify no local storage is mounted. Load testing verifies that scaling up/down does not affect behaviour. Review checklist includes statelessness verification.

**Cross-Reference:** → `docs/reference-architecture/06-runtime-topology.md`, → `docs/engineering-constitution/02-coding-standards.md` §20 Caching Standards

---

### Invariant 7: Validation at Every Boundary

**Statement:** Every system boundary — API endpoint, event consumer, service-to-service call, database write, file ingestion — MUST validate inputs.

**Rationale:** Defensive validation at every boundary prevents malformed data from propagating through the system. One service's output is another service's input — without boundary validation, a bug in one service corrupts data throughout the system.

**Enforcement:** Automated validation in NestJS pipes, FastAPI dependencies, and Pydantic models. Contract tests verify that invalid inputs are rejected with appropriate errors.

**Cross-Reference:** → `docs/engineering-constitution/02-coding-standards.md` §16 DTO & Validation, → `docs/reference-architecture/03-data-flow.md`

---

## 5. Things NEVER Allowed

These are absolute prohibitions. Violations are grounds for rejecting code in review. Systematic violations constitute an engineering incident.

### Rule 1: No `any` Type in TypeScript

**Statement:** The `any` type is strictly prohibited in all TypeScript code. Use `unknown`, proper types, or `never` instead.

**Why:** `any` disables all type-checking, eliminating the primary benefit of TypeScript. It propagates silently — an `any` input produces `any` outputs, infecting the entire type graph.

**Rationale:** TypeScript's type system catches entire classes of bugs at compile time. `any` bypasses this safety net. Every `any` is a potential runtime error waiting to happen.

**Good Example:**
```typescript
function parseCalculation(data: unknown): Calculation {
  if (!isCalculation(data)) throw new Error('Invalid calculation data');
  return data; // Safe — type is verified
}
```

**Bad Example:**
```typescript
function parseCalculation(data: any): Calculation {
  return data; // Unsafe — any bypasses all type checking
}
```

**Compliance:** Automated: ESLint rule `@typescript-eslint/no-explicit-any` set to `error`.

---

### Rule 2: No Secrets in Code or Commits

**Statement:** API keys, passwords, tokens, certificates, connection strings, and any other secrets MUST NEVER appear in code, configuration files committed to version control, or commit messages.

**Why:** Committed secrets are exposed to everyone with repository access and remain in git history forever, even if later removed.

**Rationale:** Secret leaks are the most common vector for security breaches at the platform level. Once a secret is committed, it must be considered compromised and rotated immediately.

**Good Example:**
```typescript
// Environment variable loaded at runtime
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL is required');
```

**Bad Example:**
```typescript
const dbUrl = 'postgresql://admin:password123@localhost:5432/xennic'; // Hardcoded secret!
```

**Compliance:** Automated: pre-commit hook with `git-secrets` or similar scanner. Manual: Code review checks for hardcoded secrets.

---

### Rule 3: No Direct Production Database Access

**Statement:** Production databases MUST NEVER be accessed directly (via `psql`, database GUI tools, or any direct connection). All data access MUST go through the API layer.

**Why:** Direct database access bypasses all validation, authorization, auditing, and business logic. It creates untracked data changes that cannot be rolled back or audited.

**Rationale:** Every data mutation should be traceable to an authenticated user action through the API. Direct access creates orphaned data, inconsistent state, and security vulnerabilities.

**Good Example:**
```typescript
// All mutations go through the API
const response = await api.post('/api/v1/calculations', calculationData);
```

**Bad Example:**
```bash
# Direct database mutation in production — PROHIBITED
psql -h production-db -U admin -c "UPDATE calculations SET status='approved' WHERE id='...';"
```

**Compliance:** Automated: Database firewall rules restrict direct access to production databases. Manual: Audit logs reviewed for direct database connections.

---

### Rule 4: No Synchronous Long-Running Processing (>30 seconds)

**Statement:** Any operation that takes longer than 30 seconds MUST be processed asynchronously via a job queue (BullMQ on RabbitMQ).

**Why:** Synchronous long-running operations block HTTP connections, consume server resources, and create poor user experiences. They also prevent horizontal scaling.

**Rationale:** HTTP requests should complete quickly. Long-running operations should return a `202 Accepted` with a job ID that the client can poll or receive via webhook.

**Good Example:**
```typescript
@Post('export')
async exportCalculation(@Body() dto: ExportDto): Promise<AcceptedResponse> {
  const job = await this.exportQueue.add('export-calculation', dto);
  return { success: true, data: { jobId: job.id, status: 'processing' } };
}
```

**Bad Example:**
```typescript
@Post('export')
async exportCalculation(@Body() dto: ExportDto): Promise<ExportResponse> {
  const result = await this.exportService.runLongExport(dto); // Blocks for 5 minutes!
  return { success: true, data: result };
}
```

**Compliance:** Automated: CI pipeline checks for async job patterns in controller methods. Manual: Code review verifies timeout handling.

---

### Rule 5: No Hardcoded Configuration Values

**Statement:** All configuration values (environment-specific URLs, ports, feature flags, thresholds, timeouts) MUST be externalised to environment variables or configuration files. Zero hardcoded constants that vary between environments.

**Why:** Hardcoded configuration makes the same codebase behave differently in different environments only by manual changes, creating environment drift and deployment errors.

**Rationale:** The Twelve-Factor App methodology mandates strict separation of config from code. Hardcoded configuration is the #1 cause of environment-specific bugs.

**Good Example:**
```typescript
const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  redisUrl: process.env.REDIS_URL,
  logLevel: process.env.LOG_LEVEL || 'info',
};
```

**Bad Example:**
```typescript
const config = {
  port: 3000,
  redisUrl: 'localhost:6379',
  logLevel: 'debug',
  apiUrl: 'http://localhost:3001',
};
```

**Compliance:** Automated: ESLint rule for detecting magic numbers/strings. Manual: Code review cross-checks against `.env.example`.

---

### Rule 6: No `console.log` in Production Code

**Statement:** All logging MUST use the structured logging framework (NestJS Logger, FastAPI logger, etc.). `console.log`, `console.error`, and `print()` are prohibited in production code.

**Why:** `console.log` produces unstructured output that cannot be searched, filtered, or aggregated. It bypasses log level configuration and correlation ID injection.

**Rationale:** Structured JSON logging with correlation IDs is essential for debugging distributed systems. `console.log` creates noise without context, making production debugging impossible.

**Good Example:**
```typescript
this.logger.log('Calculation executed successfully', {
  calculationId: calc.id,
  type: calc.type,
  duration: durationMs,
  correlationId: correlationId,
});
```

**Bad Example:**
```typescript
console.log('Calculation done:', calc.id); // Unstructured, no correlation ID
```

**Compliance:** Automated: ESLint rule `no-console` set to `error`. CI pipeline checks for `console.log` patterns.

---

### Rule 7: No Unused Dependencies

**Statement:** Every dependency declared in `package.json`, `requirements.txt`, or any dependency manifest MUST be used in the codebase. Unused dependencies MUST be removed.

**Why:** Unused dependencies bloat bundle sizes, increase attack surface, create false security alerts, and confuse developers about available libraries.

**Rationale:** Each dependency is a maintenance burden and a security risk. Keeping dependencies lean reduces the attack surface and simplifies upgrades.

**Good Example:**
```bash
pnpm remove unused-package
# Verify no imports from unused-package remain
```

**Bad Example:**
```bash
# Keeping a dependency "just in case" or because of "legacy reasons"
# package.json still lists old-package@^1.0.0 even though it's not imported anywhere
```

**Compliance:** Automated: CI pipeline runs `depcheck` or similar tool. Fails if unused dependencies are detected.

---

### Rule 8: No Raw SQL Outside Prisma

**Statement:** All database queries MUST use Prisma ORM. Raw SQL (`$queryRaw`, `$executeRaw`) is prohibited except in migrations, seed files, and documented performance-critical paths approved via ADR.

**Why:** Raw SQL bypasses Prisma's type-safety, migration management, and connection pooling. It creates database-specific code that is harder to maintain and audit.

**Rationale:** Prisma provides type-safe queries, migration management, and database abstraction. Raw SQL negates these benefits and creates maintenance burdens.

**Good Example:**
```typescript
// Prisma query — type-safe, portable
const calculations = await prisma.calculation.findMany({
  where: { workspaceId, status: 'active' },
  include: { author: true },
});
```

**Bad Example:**
```typescript
// Raw SQL — bypasses Prisma type-safety
const calculations = await prisma.$queryRaw`
  SELECT * FROM calculations WHERE workspace_id = ${workspaceId} AND status = 'active'
`;
```

**Compliance:** Automated: ESLint rule restricts `$queryRaw` and `$executeRaw` usage. Manual: Architecture review for any raw SQL exception.

---

### Rule 9: No Mutating Function Parameters

**Statement:** Functions MUST NOT mutate their parameters. Parameters are read-only inputs.

**Why:** Parameter mutation creates side effects that are invisible to callers, leading to bugs where a function unexpectedly changes data that the caller still needs.

**Rationale:** Immutable parameters make code predictable and testable. A function can be understood entirely by its inputs and outputs without considering side effects.

**Good Example:**
```typescript
function applyDiscount(items: LineItem[], discountPercent: number): LineItem[] {
  return items.map(item => ({
    ...item,
    total: item.total * (1 - discountPercent / 100),
  }));
}
```

**Bad Example:**
```typescript
function applyDiscount(items: LineItem[], discountPercent: number): void {
  for (const item of items) {
    item.total = item.total * (1 - discountPercent / 100); // Mutates input array!
  }
}
```

**Compliance:** Automated: ESLint rule `no-param-reassign` set to `error`. Manual: Code review.

---

### Rule 10: No `*` Imports

**Statement:** Wildcard imports (`import * as X from 'module'`) are prohibited. Every import must be explicit.

**Why:** Wildcard imports obscure what is actually being used from a module, make tree-shaking impossible, and create namespace collisions.

**Rationale:** Explicit imports document dependencies, enable tree-shaking, and prevent namespace pollution. Tools can detect unused explicit imports but cannot detect unused wildcard imports.

**Good Example:**
```typescript
import { Calculation, CalculationStatus } from '@prisma/client';
import { Injectable, Logger } from '@nestjs/common';
```

**Bad Example:**
```typescript
import * as Prisma from '@prisma/client'; // Wildcard — what's actually used?
import * as Common from '@nestjs/common'; // Wildcard — namespace collisions possible
```

**Compliance:** Automated: ESLint rule `no-import-all` or `@typescript-eslint/no-namespace`. CI enforcement.

---

### Rule 11: No Circular Dependencies

**Statement:** Circular dependencies between modules, services, or packages are strictly prohibited.

**Why:** Circular dependencies create tight coupling, cause runtime errors (especially in NestJS DI), prevent independent testing, and make the dependency graph impossible to reason about.

**Rationale:** Acyclic dependency graphs are a hallmark of well-structured systems. Circular dependencies indicate poor module boundaries that must be resolved.

**Good Example:**
```typescript
// A → B → C (linear dependency chain)
// Module A imports B, B imports C. No cycles.
```

**Bad Example:**
```typescript
// A → B → C → A (circular dependency)
// Module A imports B, B imports C, C imports A — creates a cycle.
```

**Compliance:** Automated: ESLint plugin `import/no-cycle`. CI pipeline checks for circular dependencies.

---

### Rule 12: No `require` in TypeScript

**Statement:** CommonJS `require()` is prohibited in TypeScript files. Use ES module `import` syntax exclusively.

**Why:** Mixing `import` and `require` creates inconsistent module semantics, breaks tree-shaking, and confuses the type system.

**Rationale:** ES modules are the standard for TypeScript. CommonJS should only appear in JavaScript configuration files (e.g., `.eslintrc.cjs`, `next.config.js`).

**Good Example:**
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
```

**Bad Example:**
```typescript
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./app.module');
```

**Compliance:** Automated: ESLint rule `@typescript-eslint/no-require-imports` set to `error`.

---

### Rule 13: No `var` Declarations

**Statement:** `var` is prohibited. Use `const` for immutable bindings and `let` for mutable bindings.

**Why:** `var` has function-level scoping that causes hoisting bugs. `const` and `let` have block-level scoping that is predictable and safe.

**Rationale:** This has been standard practice in TypeScript/JavaScript since ES6. There is never a valid reason to use `var` in modern code.

**Good Example:**
```typescript
const MAX_RETRIES = 3;
let attemptCount = 0;
```

**Bad Example:**
```typescript
var maxRetries = 3;
var attemptCount = 0;
```

**Compliance:** Automated: ESLint rule `no-var` set to `error`. TypeScript compiler option `noVar` enabled.

---

### Rule 14: No `eval` or Dynamic Code Execution

**Statement:** `eval()`, `new Function()`, `setTimeout(string)`, and any form of dynamic code execution are strictly prohibited.

**Why:** Dynamic code execution is a critical security vulnerability that enables arbitrary code injection. It also prevents all static analysis and optimisation.

**Rationale:** There is no legitimate use case for dynamic code execution in the Xennic Platform. Any requirement that suggests dynamic code execution should be solved with a proper design pattern (strategy pattern, lookup table, etc.).

**Good Example:**
```typescript
// Use a strategy map instead of eval
const strategies: Record<string, CalculationFunction> = {
  'voltage-drop': calculateVoltageDrop,
  'cable-sizing': calculateCableSizing,
};
```

**Bad Example:**
```typescript
const result = eval(`calculate${type}(params)`); // Dynamic code execution — PROHIBITED
```

**Compliance:** Automated: ESLint rule `no-eval` set to `error`. Security scanning for `new Function()` patterns.

---

### Rule 15: No Debugger Statements

**Statement:** `debugger` statements MUST NOT appear in committed code.

**Why:** `debugger` statements halt execution in browser/Node.js debuggers, potentially causing production issues if accidentally committed.

**Rationale:** Breakpoints should be set in the developer tools, not in code. Committed `debugger` statements indicate incomplete cleanup.

**Compliance:** Automated: ESLint rule `no-debugger` set to `error`. Pre-commit hook strips debugger statements.

---

## 6. Technical Debt Policy

### 6.1 Classification

Technical debt is classified into four priority levels:

| Priority | Definition | Examples | Max Age | Action |
|----------|------------|----------|---------|--------|
| **P1 — Critical** | Blocking development, causing production bugs, or violating security/compliance | Security vulnerability, data corruption bug, broken build | 7 days | Immediate fix, stop all other work |
| **P2 — High** | Significant impact on development velocity or system quality | Architectural issue, missing test coverage for critical path, duplicated logic | 30 days | Scheduled in current sprint |
| **P3 — Medium** | Reduces efficiency but not blocking | Dead code, minor duplication, insufficient documentation | 90 days | Scheduled within 2 sprints |
| **P4 — Low** | Cosmetic or minor improvement | Linting violations, formatting issues, minor refactoring | 180 days | Backlog, addressed when convenient |

### 6.2 Tracking

- All technical debt MUST be tracked as GitHub Issues with the label `tech-debt` and priority label (`P1`—`P4`)
- Each debt item MUST include: description, location (file/line), impact assessment, remediation proposal, estimated effort
- Debt items MUST link to the originating PR or commit where possible
- A monthly Technical Debt Review meeting reviews P2-P4 items

### 6.3 Limits

| Metric | Limit | Threshold |
|--------|-------|-----------|
| Total P1 items | 0 | Zero tolerance |
| Total P2 items | ≤ 5 | Alert at 3 |
| Total P3 items | ≤ 20 | Alert at 15 |
| Debt ratio (estimated remediation / total code hours) | ≤ 15% | Alert at 10% |
| Test debt (untested critical paths) | ≤ 5% | Alert at 3% |

### 6.4 Repayment Schedule

- **P1**: Fix immediately. Freeze all feature work until resolved.
- **P2**: One P2 item MUST be resolved per sprint (minimum).
- **P3**: Two P3 items per sprint OR dedicate 10% of sprint capacity.
- **P4**: Addressed opportunistically during feature work (Boy Scout Rule).

### 6.5 Debt Prevention

- All new code must meet quality gates (→ §14.2) before merging
- Code review must flag new technical debt
- The Engineering Quality Score (→ §17) provides a quantitative measure of debt health

**Cross-Reference:** → `docs/platform-blueprint/01-platform-blueprint.md` §36

---

## 7. Backward Compatibility Policy

### 7.1 API Compatibility

- **Major version**: Breaking changes to the API contract. URL version changes (`/api/v1/` → `/api/v2/`).
- **Minor version**: Additive, non-breaking changes (new endpoints, new optional fields). Old version continues to work.
- **Patch version**: Bug fixes, performance improvements, internal refactoring. No contract changes.
- **Deprecation period**: Endpoints deprecated in `v1` remain functional for at least 6 months after `v2` is released.
- **Migration guide**: Every major version release MUST include a migration guide documenting all breaking changes.

### 7.2 Database Compatibility

- **Schema changes**: Only additive changes (new tables, new nullable columns, new indexes) without a migration plan. Non-additive changes require a phased migration.
- **Rollback support**: Every migration MUST be reversible. Down migrations are required.
- **Zero-downtime migrations**: Migrations must be designed for zero-downtime deployment (expand-contract pattern).
- **Backward-compatible queries**: Old application versions must work with the new schema for at least one deployment cycle.

### 7.3 Event Schema Compatibility

- **Event schema evolution**: Events use Avro-like schema evolution rules — fields can be added (default values required), never removed or renamed.
- **Consumer compatibility**: Event consumers must handle unknown fields gracefully (ignore unrecognised fields).
- **Schema registry**: Event schemas are registered in a schema registry. Producer/consumer compatibility is validated at deployment time.

### 7.4 Configuration Compatibility

- **Configuration files**: Configuration changes must maintain backward compatibility for at least one major version.
- **Environment variables**: Renaming an environment variable requires a deprecation period where both names are accepted.

**Cross-Reference:** → §8 Versioning Philosophy, → §13 Deprecation Strategy

---

## 8. Versioning Philosophy

### 8.1 Semantic Versioning

All packages, services, and APIs follow Semantic Versioning 2.0.0:

**MAJOR.MINOR.PATCH** format:

| Component | When to Increment | Example |
|-----------|-------------------|---------|
| **MAJOR** | Breaking change (API contract break, database schema break, event schema break) | 2.0.0 |
| **MINOR** | New functionality, backward compatible | 1.3.0 |
| **PATCH** | Bug fixes, performance improvements, backward-compatible refactoring | 1.0.1 |

### 8.2 What Constitutes a Breaking Change

- Removal or renaming of an API endpoint
- Removal or renaming of a request/response field
- Making a previously optional field required
- Changing the type of a field
- Removing or renaming an event
- Changing event schema in a non-backward-compatible way
- Removing or renaming a database column
- Changing the behaviour of an existing endpoint (even if the contract is the same)
- Upgrading a major version of a framework or library that changes public API

### 8.3 Pre-release Tags

- `1.0.0-alpha.1` — Alpha release, unstable, internal testing
- `1.0.0-beta.1` — Beta release, feature-complete, testing
- `1.0.0-rc.1` — Release candidate, final testing before stable release
- `1.0.0` — Stable release

### 8.4 API Version Lifecycle

```
v1.0.0 (current) ──→ v1.1.0 (additive) ──→ v2.0.0 (breaking)
                                          ↓
                    v1.x deprecation notice issued
                     ↓
                    v1.x end-of-life (6 months after v2)
```

**Cross-Reference:** → §7 Backward Compatibility Policy, → §13 Deprecation Strategy, → `docs/engineering-constitution/03-git-workflow.md` §5 Tagging

---

## 9. ADR Policy

### 9.1 When ADRs Are Required

An Architecture Decision Record is REQUIRED for:

- Adding a new service or removing an existing service
- Changing an Architectural Invariant (→ §4)
- Introducing a new database technology
- Changing the message broker, caching strategy, or deployment infrastructure
- Making a breaking change to API, event, or database schema
- Introducing a new external dependency (library, service, vendor)
- Changing the versioning strategy
- Any decision with cross-team or cross-service impact
- Amending this constitution

ADRs are RECOMMENDED for:

- Significant refactoring decisions
- Framework/library choices
- Performance optimisation strategies
- Data model decisions that span multiple services

### 9.2 ADR Format

Every ADR MUST follow this template:

```markdown
# ADR-NNN: Title

**Status:** [Proposed | Accepted | Deprecated | Superseded]
**Date:** YYYY-MM-DD
**Author:** Name / Team
**Deciders:** [List of people who participated in the decision]
**Technical Story:** [Link to issue/ticket]

## Context

What is the issue that we're seeing that is motivating this decision or change?
What forces are at play? What are the constraints?

## Decision

What is the change that we're proposing and/or doing?
This should be stated in clear, imperative language.

## Consequences

### Positive
- [List of positive consequences]

### Negative
- [List of negative consequences or trade-offs]

### Neutral
- [List of neutral consequences]

## Compliance

How will this decision be enforced? (automated check, code review, documentation, etc.)

## References
- [Link to related ADRs]
- [Link to relevant documentation]
```

### 9.3 ADR Lifecycle

```mermaid
flowchart LR
    A[Draft] --> B[Proposed]
    B --> C[In Review]
    C --> D[Accepted]
    C --> E[Rejected]
    D --> F[Superseded]
    D --> G[Deprecated]
```

1. **Draft**: Initial version, may be incomplete
2. **Proposed**: Ready for review, sent to Architecture Review Board
3. **In Review**: Under active review, minimum 3 working days
4. **Accepted**: Decision is approved and binding
5. **Rejected**: Decision is not approved, rationale documented
6. **Deprecated**: Decision is no longer valid, superseded by another ADR
7. **Superseded**: Replaced by a newer ADR, which is linked

### 9.4 ADR Storage

- All ADRs are stored in `docs/decisions/ADR-NNN-title.md`
- ADR index maintained in `docs/decisions/README.md`
- ADRs are immutable once accepted — changes require a new ADR that supersedes the old one

**Cross-Reference:** → `docs/decisions/`, → §4 Architectural Invariants

---

## 10. Review Policy

### 10.1 Code Review Requirements

| Change Type | Minimum Reviewers | Required Approvals |
|-------------|-------------------|-------------------|
| Bug fix (P1/P2) | 1 | 1 approval |
| Feature (standard) | 1 | 1 approval |
| Feature (complex) | 2 | 2 approvals |
| Architecture change | 2 | 2 approvals (1 must be architect) |
| Configuration change | 1 | 1 approval |
| Documentation change | 0 | Self-approval (trivial) |
| Emergency fix | 1 (can be post-merge) | 1 approval within 24h |

### 10.2 Review Checklist

Every code review MUST verify:

1. **Functionality**: Does the code do what it is supposed to do?
2. **Constitutional compliance**: Does the code violate any section of this constitution?
3. **Architectural compliance**: Does the code respect architectural invariants?
4. **Type safety**: No `any` types, no type assertions without justification
5. **Error handling**: Are all error paths handled? Are errors properly wrapped?
6. **Validation**: Are all inputs validated at every boundary?
7. **Idempotency**: Are mutations idempotent?
8. **Testing**: Are there unit/integration tests? Do tests cover edge cases?
9. **Security**: Are there any security concerns (injection, auth bypass, secret exposure)?
10. **Performance**: Are there N+1 queries? Are there unnecessary database calls?
11. **Logging**: Is logging structured? Are correlation IDs propagated?
12. **Documentation**: Are public APIs documented? Is the ADR referenced if applicable?
13. **Dependencies**: Are new dependencies justified? Are unused dependencies removed?
14. **Backward compatibility**: Does the change maintain backward compatibility?

### 10.3 Review Flowchart

```mermaid
flowchart TD
    A[PR Submitted] --> B{Change Type}
    B -->|Emergency| C[1 reviewer post-merge]
    C --> D[Post-merge review within 24h]
    D --> E{Issues Found?}
    E -->|Yes| F[Create fix PR]
    E -->|No| G[Merge Approved]

    B -->|Standard| H[Assign 1 reviewer]
    H --> I[Review Checklist Applied]
    I --> J{Issues Found?}
    J -->|Major| K[Request Changes]
    K --> L[Author Addresses]
    L --> I
    J -->|Minor| M[Approve with Comments]
    M --> G
    J -->|None| G

    B -->|Architecture| N[Assign 2 reviewers\n(1 architect)]
    N --> O[Full Review + ADR Check]
    O --> P{CAB Approval Needed?}
    P -->|Yes| Q[Submit to CAB]
    P -->|No| R{Issues Found?}
    Q --> R
    R -->|Issues| K
    R -->|OK| G
```

### 10.4 Security Review

Security review is triggered by:

- Any change to authentication or authorization logic
- Any change to data access patterns
- Any new external dependency
- Any change to encryption or secrets management
- Any change to input handling (upload, import)
- Any change to the API gateway or proxy layer

Security review is performed by the security lead or designated security reviewer.

### 10.5 Architecture Review Triggers

Architecture review is required for:

- Changes affecting Architectural Invariants (→ §4)
- Introduction of new services or removal of existing services
- Changes to inter-service communication patterns
- Changes to data storage strategy
- Changes to deployment topology
- Any change that requires an ADR (→ §9)

**Cross-Reference:** → `docs/engineering-constitution/03-git-workflow.md` §9 Review Approvals

---

## 11. Ownership Model

### 11.1 CODEOWNERS

The `CODEOWNERS` file at the repository root defines ownership for all code paths:

```gitattributes
# Global defaults
* @xennic/core-engineering

# API
/apps/api/ @xennic/api-team

# Web frontend
/apps/web/ @xennic/web-team

# Python services
/workspace/services/engineering-service/ @xennic/engineering-team
/workspace/services/ai-service/ @xennic/ai-team

# Infrastructure
/infrastructure/ @xennic/devops-team

# Documentation
/docs/ @xennic/docs-team

# Configuration
/packages/config/ @xennic/core-engineering

# CI/CD
/.github/ @xennic/devops-team
```

### 11.2 Module Ownership

Each major module in the NestJS API and each service in the workspace has a designated owner:

| Module/Service | Owner | Backup Owner |
|----------------|-------|-------------|
| Calculations Module | @ahmad | @sara |
| Knowledge Module | @sara | @ahmad |
| Auth Module | @reza | @ali |
| Engineering Service | @ahmad | @reza |
| AI Service | @ali | @sara |
| Infrastructure | @reza | @ahmad |

### 11.3 Ownership Responsibilities

Module owners are responsible for:

1. Code quality within their module
2. Technical debt management (P1-P3 items)
3. Reviewing all PRs that touch their module
4. Maintaining module documentation
5. Onboarding new contributors to the module
6. Ensuring test coverage targets are met
7. Participating in architecture reviews affecting their module

### 11.4 Shared Ownership Rules

- **Cross-cutting concerns** (logging, auth, error handling, configuration) are owned by @xennic/core-engineering
- **Dependencies between modules** require coordination between both module owners
- **Disagreements** between module owners are escalated to the lead architect
- **Unclaimed code** defaults to @xennic/core-engineering ownership

**Cross-Reference:** → `docs/reference-architecture/05-dependency-map.md`

---

## 12. Change Management

### 12.1 Change Types

| Type | Definition | Examples | Approval Path |
|------|------------|----------|---------------|
| **Normal** | Planned, non-emergency change | Feature, refactor, dependency update | Standard review → merge |
| **Standard** | Low-risk, pre-approved change | Documentation, CI config, minor bug fix | Self-approval or single reviewer |
| **Emergency** | Production issue requiring immediate fix | P1 bug, security vulnerability, outage | Post-merge review within 24h |

### 12.2 Change Management Workflow

```mermaid
flowchart LR
    subgraph Normal
        A1[Create Branch] --> B1[Develop]
        B1 --> C1[PR with Template]
        C1 --> D1[Code Review]
        D1 --> E1[QA Review]
        E1 --> F1[Merge to Develop]
        F1 --> G1[Release Branch]
        G1 --> H1[Staging Deploy]
        H1 --> I1[Production Deploy]
    end

    subgraph Emergency
        A2[Create Hotfix Branch] --> B2[Fix]
        B2 --> C2[Emergency PR]
        C2 --> D2[Quick Review]
        D2 --> E2[Merge & Deploy]
        E2 --> F2[Post-mortem within 48h]
    end

    subgraph Standard
        A3[Direct Commit to Main] --> B3[CI Check]
        B3 --> C3[Merge]
    end
```

### 12.3 Change Advisory Board (CAB)

The CAB is composed of:

- Lead Architect (chair)
- Engineering Manager
- Security Lead
- DevOps Lead
- Affected module owners (by invitation)

CAB approval is required for:

- Any change affecting Architectural Invariants
- Introduction of new technologies
- Changes to infrastructure topology
- Major version releases
- Changes to this constitution

CAB meets weekly for normal changes and can convene ad-hoc for emergency changes.

**Cross-Reference:** → `docs/engineering-constitution/03-git-workflow.md` §3 Commit Message Convention

---

## 13. Deprecation Strategy

### 13.1 Deprecation Process

```
1. Announce deprecation → 2. Deprecation period → 3. Final warning → 4. Removal
```

| Phase | Duration | Actions |
|-------|----------|---------|
| **Announce** | Day 0 | Publish deprecation notice with timeline. Update documentation. Notify all known consumers. |
| **Deprecation period** | 6 months (API), 3 months (events), 1 month (internal APIs) | Feature remains functional. Warnings logged for consumers of deprecated features. Migration guide published. |
| **Final warning** | 30 days before removal | Active outreach to all consumers still using deprecated feature. Metrics monitored for usage. |
| **Removal** | End of deprecation period | Feature removed in a major release. Breaking change documented in changelog. |

### 13.2 Deprecation Communication

- Deprecation notice published in: CHANGELOG, API documentation (Swagger), release notes, team Slack channel, mailing list
- Deprecation period and removal date clearly stated in all notices
- A migration guide is provided for all deprecated features

### 13.3 Deprecation Lifecycle

```mermaid
flowchart TD
    A[Decision to Deprecate] --> B[Create ADR or Issue]
    B --> C[Publish Deprecation Notice]
    C --> D[Start Deprecation Period]
    D --> E{Consumers Migrated?}
    E -->|Yes| F[Remove Feature]
    E -->|No - Before Deadline| G[Send Final Warning]
    G --> H{Consumers Migrated?}
    H -->|Yes| F
    H -->|No| I[Extend Deprecation Period\nor Escalate]
    I --> D
    F --> J[Update Documentation]
    J --> K[Close Deprecation Issue]
```

### 13.4 Removal Criteria

A feature may be removed only when:

1. Deprecation period has elapsed
2. All known consumers have migrated
3. Migration metrics show zero or near-zero usage of the deprecated feature
4. A removal plan (with rollback) is documented
5. Removal is part of a major version release
6. All consumers are notified 30 days before removal

**Cross-Reference:** → §7 Backward Compatibility Policy, → §8 Versioning Philosophy

---

## 14. Quality Culture

### 14.1 Quality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Unit test coverage (critical paths) | ≥ 95% | Coverage reports |
| Unit test coverage (overall) | ≥ 80% | Coverage reports |
| Integration test pass rate | 100% | CI pipeline |
| Linting violations | 0 | ESLint/ruff |
| TypeScript strict mode errors | 0 | tsc --noEmit |
| P1 technical debt items | 0 | GitHub Issues |
| P2 technical debt items | ≤ 5 | GitHub Issues |
| Build time | ≤ 10 minutes | CI pipeline |
| Dependency age (max) | ≤ 6 months | Renovate/dependabot |
| Security vulnerabilities (critical) | 0 | Snyk/npm audit |
| Documentation coverage (public APIs) | 100% | API doc generator |

### 14.2 Quality Gates

Quality gates that MUST pass before any merge:

1. **Type check**: `pnpm typecheck` passes with zero errors
2. **Lint**: `pnpm lint` passes with zero warnings
3. **Format**: `pnpm format:check` passes
4. **Unit tests**: All tests pass, coverage meets thresholds
5. **Build**: `pnpm build` succeeds
6. **Security scan**: No critical/high vulnerabilities in new dependencies
7. **Dependency audit**: No deprecated dependencies being introduced

### 14.3 Blameless Culture

- Incidents are investigated to find systemic causes, not individual blame
- Post-mortems focus on: what happened, why it happened, how to prevent it, how to detect it faster
- All engineers are expected to participate in post-mortems without fear of reprisal
- The question is never "who did this?" but "what in our system/process allowed this to happen?"

### 14.4 Continuous Improvement

- Every sprint retrospective produces at least one actionable improvement
- Improvement items are tracked in the backlog and prioritised
- Cross-team learning sessions are held bi-weekly
- Engineering Quality Score (→ §17) is reviewed monthly

**Cross-Reference:** → `docs/reference-architecture/09-gap-analysis.md`

---

## 15. Engineering Glossary

| Term | Definition |
|------|------------|
| **ADR** | Architecture Decision Record — a document that captures an important architectural decision, its context, and its consequences |
| **API versioning** | The practice of assigning version numbers to API endpoints to manage change over time |
| **Architectural Invariant** | A system property that must ALWAYS be true — cannot be changed without full ADR |
| **Blameless culture** | A culture where incidents are investigated to find systemic causes, not individual blame |
| **BullMQ** | A Node.js queue library built on top of Redis, used for job processing |
| **CAB** | Change Advisory Board — the body that approves significant changes |
| **CORS** | Cross-Origin Resource Sharing — a security mechanism for web applications |
| **CQS** | Command-Query Separation — the principle that methods should either change state or return data, not both |
| **Correlation ID** | A unique identifier propagated across service boundaries to trace a single request through the system |
| **Cyclomatic complexity** | A quantitative measure of the number of linearly independent paths through source code |
| **DTO** | Data Transfer Object — an object that carries data between processes, typically validated at boundaries |
| **DRY** | Don't Repeat Yourself — the principle that every piece of knowledge must have a single representation |
| **Graceful degradation** | The ability of a system to continue operating at reduced capacity when some components fail |
| **Idempotency** | The property that executing the same operation multiple times has the same effect as executing it once |
| **Invariant** | A condition that must always hold true for the system to be in a valid state |
| **Migration** | A controlled, versioned change to the database schema |
| **Multi-tenancy** | An architecture where a single instance serves multiple tenants (workspaces/organisations) |
| **N+1 query** | A performance anti-pattern where N items each trigger an additional query, resulting in N+1 total queries |
| **P1/P2/P3/P4** | Priority levels for technical debt items (see §6) |
| **Prisma** | The ORM used by Xennic for database access (TypeScript/Node.js) |
| **RabbitMQ** | The message broker used by Xennic for all asynchronous, cross-service communication |
| **Retrospective** | A regular meeting where a team reflects on recent work and identifies improvements |
| **Schema registry** | A service that stores, validates, and manages event schemas for backward compatibility |
| **Service boundary** | The logical boundary around a service, defined by its API, events, and data ownership |
| **Six-factor app** | An extension of the Twelve-Factor App methodology adapted for Xennic's architecture |
| **Structured logging** | Logging in a structured format (JSON) with consistent fields for machine parsing and search |
| **Technical debt** | The implied cost of future rework caused by choosing an easy solution now instead of a better approach |
| **Twelve-Factor App** | A methodology for building software-as-a-service applications |
| **Unified envelope** | The standard response format `{success, data/meta or error}` used by all API endpoints |
| **Validation** | The process of ensuring data meets requirements before it is processed or stored |
| **Workspace** | A multi-tenant isolation boundary — each workspace (organisation) has isolated data |
| **YAGNI** | You Ain't Gonna Need It — the principle of building only what is currently needed |
| **Zero-downtime migration** | A database migration strategy that allows the application to remain available during schema changes |
| **Expand-contract pattern** | A migration pattern where old and new schema coexist, allowing zero-downtime deployment |

**Cross-Reference:** → `docs/platform-blueprint/01-platform-blueprint.md` §1

---

## 16. Compliance Matrix

Each constitutional rule is mapped to its verification method:

| Section | Rule | Automated Check | Code Review | Manual Audit | Training |
|---------|------|-----------------|-------------|--------------|----------|
| §4.1 | Multi-tenancy via workspace_id | Prisma schema validation | ✓ | Quarterly | Onboarding |
| §4.2 | URL-prefixed API versioning | NestJS config check | ✓ | Release audit | Onboarding |
| §4.3 | Async through RabbitMQ | Dependency check | ✓ | Architecture review | Onboarding |
| §4.4 | Idempotent mutations | Contract tests | ✓ | — | Onboarding |
| §4.5 | Unified response envelope | Response interceptor | ✓ | — | Onboarding |
| §4.6 | Services are stateless | Deployment check | ✓ | Architecture review | Onboarding |
| §4.7 | Validation at every boundary | Validation pipes | ✓ | — | Onboarding |
| §5.1 | No `any` type | ESLint rule | ✓ | — | Onboarding |
| §5.2 | No secrets in code | pre-commit hook | ✓ | Quarterly scan | Security training |
| §5.3 | No direct prod DB access | Firewall rules | — | Audit log review | Onboarding |
| §5.4 | No sync long-running >30s | — | ✓ | Architecture review | Onboarding |
| §5.5 | No hardcoded config | ESLint rule | ✓ | — | Onboarding |
| §5.6 | No console.log | ESLint rule | ✓ | — | Onboarding |
| §5.7 | No unused dependencies | CI depcheck | ✓ | — | Onboarding |
| §5.8 | No raw SQL outside Prisma | ESLint rule | ✓ | — | Onboarding |
| §5.9 | No mutating parameters | ESLint rule | ✓ | — | Onboarding |
| §5.10 | No `*` imports | ESLint rule | ✓ | — | Onboarding |
| §5.11 | No circular dependencies | ESLint plugin | ✓ | — | Onboarding |
| §5.12 | No `require` in TS | ESLint rule | ✓ | — | Onboarding |
| §5.13 | No `var` | ESLint rule | ✓ | — | Onboarding |
| §5.14 | No `eval` | ESLint rule, scanner | ✓ | Quarterly scan | Security training |
| §5.15 | No debugger | ESLint rule, pre-commit | ✓ | — | Onboarding |
| §6 | Technical debt tracking | GitHub Issues labels | ✓ | Monthly review | — |
| §7 | Backward compatibility | Contract tests | ✓ | Release audit | — |
| §8 | Semantic versioning | — | ✓ | Release audit | Onboarding |
| §9 | ADR compliance | — | ✓ | Architecture review | Onboarding |
| §10 | Code review policy | GitHub branch protection | ✓ | Quarterly review | Onboarding |
| §11 | Ownership model | CODEOWNERS | — | Quarterly review | — |
| §12 | Change management | — | ✓ | CAB meetings | Onboarding |
| §13 | Deprecation strategy | — | ✓ | Release audit | — |
| §14 | Quality gates | CI pipeline | ✓ | Monthly review | Onboarding |

---

## 17. Engineering Quality Score

### 17.1 Score Model

The Engineering Quality Score (EQS) measures overall codebase health on a scale of 0-100. The score is computed automatically each week.

### 17.2 Weighted Factors

| Factor | Weight | Measurement | Target | Max Score Contribution |
|--------|--------|-------------|--------|----------------------|
| **Test coverage** | 15% | % coverage of critical paths | ≥ 95% | 15 |
| **Technical debt** | 15% | P1+P2+P3 items weighted | P1=0, P2≤5, P3≤20 | 15 |
| **Lint quality** | 10% | Linting violation count | 0 violations | 10 |
| **Type safety** | 10% | Strict mode errors / `any` count | 0 errors | 10 |
| **Build stability** | 10% | CI pass rate (last 30 days) | 100% | 10 |
| **Dependency health** | 10% | Vulnerabilities + outdated deps | 0 critical, ≤6mo age | 10 |
| **Documentation** | 10% | Public API doc coverage | 100% | 10 |
| **Review compliance** | 10% | Reviews completed per policy | 100% | 10 |
| **Architecture compliance** | 5% | ADR compliance, invariant adherence | 100% | 5 |
| **Response times** | 5% | P95 API latency vs target | Within 2x target | 5 |

### 17.3 Scoring Formula

```
EQS = sum(
  test_score * 0.15,
  debt_score * 0.15,
  lint_score * 0.10,
  type_score * 0.10,
  build_score * 0.10,
  dep_score * 0.10,
  doc_score * 0.10,
  review_score * 0.10,
  arch_score * 0.05,
  perf_score * 0.05
)
```

### 17.4 Score Thresholds

| Score | Rating | Action |
|-------|--------|--------|
| 90-100 | Excellent | Maintain current practices |
| 75-89 | Good | Address minor issues |
| 60-74 | Fair | Review and address significant issues |
| 40-59 | Poor | Engineering intervention required |
| 0-39 | Critical | Freeze feature work, resolve all issues |

### 17.5 Score Review

- EQS is computed automatically every Sunday
- Results are posted to the #engineering channel
- Monthly Engineering Review meeting reviews trends
- Score below 60 triggers an engineering-wide retrospective

---

## Appendix A: Document Metadata

| Property | Value |
|----------|-------|
| **Title** | Xennic Engineering Constitution |
| **Version** | 1.0.0 |
| **Status** | Living Document |
| **Last Updated** | Tir 1405 (June 2026) |
| **Approved By** | Architecture Review Board |
| **Related Documents** | → docs/engineering-constitution/02-coding-standards.md, → docs/engineering-constitution/03-git-workflow.md, → docs/platform-blueprint/01-platform-blueprint.md, → docs/reference-architecture/*.md |

## Appendix B: Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Tir 1405 | Core Engineering | Initial constitution |

## Appendix C: Quick Reference Card

**The 5 most important rules to remember:**

1. **No `any` types** — Type safety is non-negotiable
2. **Validate at every boundary** — Trust nothing
3. **Everything is multi-tenant** — workspace_id everywhere
4. **Idempotency is default** — Duplicate-safe by design
5. **No secrets in code** — Use environment variables

**The 5 questions every reviewer must ask:**

1. Does this violate any architectural invariant?
2. Are all inputs validated?
3. Are mutations idempotent?
4. Is there logging with correlation IDs?
5. Is the change backward compatible?
