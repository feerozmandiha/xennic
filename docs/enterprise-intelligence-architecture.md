# Enterprise Intelligence Platform — Architecture

**Sprint I1** — 10 phases, 10 modules, ~12,000 LOC  
**Date:** 2026-07-05

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Enterprise Intelligence SDK                       │
│  (Unified API Facade — Context, Memory, Prompt, Tool, Skill, ...)   │
└──────┬──────────┬──────────┬──────────┬──────────┬─────────────────┘
       │          │          │          │          │
       ▼          ▼          ▼          ▼          ▼
┌─────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────┐ ┌─────────────┐
│ Context │ │  Memory  │ │    Prompt    │ │   Tool   │ │    Skill    │
│  Engine │ │ Platform │ │  Governance  │ │ Registry │ │  Registry   │
│ (Ph. 1) │ │ (Ph. 2)  │ │   (Ph. 3)   │ │ (Ph. 4)  │ │  (Ph. 5)   │
└─────────┘ └──────────┘ └──────────────┘ └──────────┘ └─────────────┘
       │          │          │          │          │
       ▼          ▼          ▼          ▼          ▼
┌────────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌─────────────┐
│ Reasoning  │ │  Policy  │ │   AI     │ │Evaluation │ │   Shared    │
│  Engine    │ │  Engine  │ │ Gateway  │ │ Platform  │ │   Types     │
│ (Ph. 6)    │ │ (Ph. 7)  │ │ (Ph. 8)  │ │ (Ph. 9)   │ │             │
└────────────┘ └──────────┘ └──────────┘ └───────────┘ └─────────────┘
```

## Module Details

### Phase 1 — Global Context Engine

Assembles contextual information across 11 domain sources:

- Workspace, User, Roles/Permissions, Projects, Knowledge, Standards
- Engineering, Marketplace, Billing, Storage, Notifications

**Key classes:** `ContextBuilderService`, `ContextAssemblerService`, `ContextCacheService`

```
ContextBuilderService
  ├── fromWorkspace(id)    ├── fromUser(id)        ├── fromProject(id)
  ├── fromRole(id)         ├── fromKnowledge(id)   ├── fromStandards(id)
  ├── fromEngineering(id)  ├── fromMarketplace(id) ├── fromBilling(id)
  ├── fromStorage(id)      └── fromNotification(id)
         │
         ▼
ContextAssemblerService.assemble(scope, scopeId, sources?)
         │
         ▼
    ContextSnapshot (frozen, versioned)
         │
         ▼
    ContextCacheService (TTL-based)
```

### Phase 2 — Enterprise Memory Platform

7 memory layers with independent persistence:

| Type       | Layer      | TTL     | Use Case                |
| ---------- | ---------- | ------- | ----------------------- |
| Working    | In-process | Session | Active task state       |
| Session    | In-process | 24h     | User session data       |
| Short-Term | In-memory  | 1h      | Recent interactions     |
| Long-Term  | Persistent | ∞       | Learned knowledge       |
| Semantic   | Persistent | ∞       | Concepts & facts        |
| Episodic   | Persistent | 30d     | Past interactions       |
| Procedural | Persistent | ∞       | Step-by-step procedures |

**Key classes:** `MemoryService`, `MemoryIndexerService`, `MemoryExpirationService`

### Phase 3 — Prompt Governance

Complete prompt lifecycle management:

```
PromptRegistryService
  ├── register()    ├── get()        ├── getByName()
  ├── createVersion() ├── activate() └── archive()

PromptTemplateService
  ├── register()    ├── get()        └── render(template, variables)

PromptPolicyService
  ├── create()      ├── evaluate()   └── check allow/deny

PromptAuditService — full audit trail
PromptEvaluationService — score tracking
```

### Phase 4 — Tool Registry

Centralized tool management with JSON Schema validation:

```
ToolRegistryService
  ├── register(name, schema, permissions)
  ├── findByCapability(capability)
  └── updateHealth(id, status)

ToolExecutorService
  ├── execute(toolId, input) — validates + runs
  ├── validate(toolId, input) — JSON Schema check
  └── getContract(toolId) — schemas + permissions + timeout
```

### Phase 5 — Skill Registry

Reusable enterprise skills with composition:

```
SkillRegistryService
  ├── register(data)
  ├── findCapable(inputs, outputs)
  ├── resolveDependencies(skillId) — transitive, circular detection
  └── createVersion(id)

SkillComposerService
  ├── compose(skillIds, mappings) → SkillComposition (DAG)
  ├── decompose(composition)
  └── validateComposition(composition)
```

### Phase 6 — Reasoning Engine

Pure reasoning infrastructure (no LLM):

```
ReasoningEngineService
  ├── createPlan(goal, steps)
  ├── executePlan(planId) — traverses execution graph
  └── cancelPlan(id)

ReasoningPlannerService
  ├── plan(goal) → ReasoningPlan
  ├── decomposeGoal(goal)
  └── validatePlan(planId)

ReflectionService — observes execution, generates suggestions
VerificationService — compares results, scores confidence
TelemetryService — timing, step count, success rate
```

### Phase 7 — Policy Engine

Multi-domain policy enforcement:

```
PolicyEnforcementService
  ├── evaluate(action, resource, context)
  ├── canAccess(userId, action, resource)
  └── getUserPolicies(userId)

PolicyManagementService
  ├── create(data)           ├── enable(id)
  ├── disable(id)           └── getEffectivePolicies(scope)
```

Policy precedence: deny overrides allow; higher priority wins within same effect.

### Phase 8 — AI Gateway

Provider-neutral gateway supporting 8 providers:

```
AIGatewayService
  ├── chat(request)     ├── complete(prompt)
  ├── embed(input)      └── stream(request)

GatewayRoutingService — selects provider by capability + failover
GatewayQuotaService   — token bucket rate limiter
GatewayRetryService   — exponential backoff (3 attempts)
GatewayTelemetryService — latency, tokens, success tracking
```

Providers: OpenAI, Anthropic, Gemini, Groq, OpenRouter, Ollama, VoyageAI, Azure OpenAI

### Phase 9 — Evaluation Platform

Comprehensive evaluation infrastructure:

```
BenchmarkRegistryService — CRUD + metric/tag filtering
GoldenDatasetService     — dataset management with items
EvaluationRunnerService  — run evaluations, compare vs expected
RegressionTestingService — detect regressions across versions
```

### Phase 10 — Enterprise Intelligence SDK

Unified API for all future AI capabilities:

```
IntelligenceClient
  ├── context    → ContextAPI
  ├── memory     → MemoryAPI
  ├── prompt     → PromptAPI
  ├── tool       → ToolAPI
  ├── skill      → SkillAPI
  ├── reasoning  → ReasoningAPI
  ├── policy     → PolicyAPI
  ├── gateway    → GatewayAPI
  └── evaluation → EvaluationAPI

Cross-cutting methods:
  ├── executeWorkflow(skillId, input, context?)
  └── evaluateAndReason(promptId, input)
```

## Technology Stack

- **Runtime:** NestJS (Fastify adapter)
- **Language:** TypeScript (strict mode)
- **Persistence:** In-memory (interfaces defined for Prisma/Redis swap)
- **Testing:** Jest (unit tests per module)
- **Validation:** JSON Schema (Tool Registry), class-validator (planned)

## Count of Tests

| Layer                         | Tests    | Status |
| ----------------------------- | -------- | ------ |
| Phase 1 — Context Engine      | 29 unit  | ✅     |
| Phase 2 — Memory Platform     | 28 unit  | ✅     |
| Phase 3 — Prompt Governance   | 37 unit  | ✅     |
| Phase 4 — Tool Registry       | 35 unit  | ✅     |
| Phase 5 — Skill Registry      | 24 unit  | ✅     |
| Phase 6 — Reasoning Engine    | 26 unit  | ✅     |
| Phase 7 — Policy Engine       | 22 unit  | ✅     |
| Phase 8 — AI Gateway          | 15 unit  | ✅     |
| Phase 9 — Evaluation Platform | 21 unit  | ✅     |
| **Total unit tests**          | **~237** | ✅     |
| **Integration (E2E)**         | **39**   | ✅     |

All tests pass. `pnpm typecheck` — 6/6 packages, zero errors.
