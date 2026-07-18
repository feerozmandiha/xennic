# Persistence Audit — Sprint P1

> Generated: 2026-07-06
> Sprint: P1 — Enterprise Persistence & Infrastructure Migration

---

## Summary

| Metric                          | Value                                                             |
| ------------------------------- | ----------------------------------------------------------------- |
| **Modules Scanned**             | 41                                                                |
| **Production InMemory Repos**   | 24                                                                |
| **Test Adapter InMemory Repos** | 24                                                                |
| **Existing Prisma Models**      | 88                                                                |
| **New Prisma Models Required**  | 33                                                                |
| **Modules with Prisma Only**    | 28 (business modules)                                             |
| **Modules with InMemory Only**  | 3 (enterprise-intelligence, enterprise-orchestration, ai-runtime) |
| **Modules with Mixed**          | 1 (ai-provider-management - both patterns)                        |

---

## Module-by-Module Audit

### Enterprise Intelligence (10 sub-modules, 12 repos to migrate)

| Sub-Module              | Current Repository                   | Type     | Prisma Model?      | Difficulty | Est. LOC |
| ----------------------- | ------------------------------------ | -------- | ------------------ | ---------- | -------- |
| **context-engine**      | `InMemoryContextStore`               | InMemory | ❌ New needed      | Medium     | 80       |
| **memory-platform**     | `InMemoryMemoryStore`                | InMemory | ❌ New needed      | High       | 120      |
| **memory-platform**     | `InMemoryMemoryIndex`                | InMemory | ❌ New needed      | High       | 80       |
| **prompt-governance**   | `InMemoryPromptRegistry`             | InMemory | ❌ New needed      | Medium     | 90       |
| **prompt-governance**   | `InMemoryPromptPolicyRepo`           | InMemory | ❌ New needed      | Medium     | 70       |
| **prompt-governance**   | `InMemoryTemplateRegistry`           | InMemory | ❌ New needed      | Medium     | 80       |
| **tool-registry**       | `InMemoryToolRegistry`               | InMemory | ❌ New needed      | Medium     | 100      |
| **skill-registry**      | `InMemorySkillRegistry`              | InMemory | ❌ New needed      | High       | 110      |
| **reasoning-engine**    | `InMemoryReasoningRepository`        | InMemory | ❌ New needed      | High       | 100      |
| **policy-engine**       | `InMemoryPolicyRepository`           | InMemory | ❌ New needed      | Medium     | 80       |
| **evaluation-platform** | `InMemoryEvaluationRepository`       | InMemory | ❌ New needed      | High       | 130      |
| **ai-gateway**          | `InMemoryProviderCapabilityRegistry` | InMemory | ⚠️ Extend existing | Low        | 60       |

### Enterprise Orchestration (9 sub-modules, 9 repos to migrate)

| Sub-Module               | Current Repository                 | Type     | Prisma Model? | Difficulty | Est. LOC |
| ------------------------ | ---------------------------------- | -------- | ------------- | ---------- | -------- |
| **workflow-engine**      | `InMemoryWorkflowRepository`       | InMemory | ❌ New needed | High       | 130      |
| **workflow-runtime**     | `InMemoryExecutionRepository`      | InMemory | ❌ New needed | High       | 120      |
| **execution-context**    | `InMemoryContextRepository`        | InMemory | ❌ New needed | Medium     | 100      |
| **planning-engine**      | `InMemoryPlannerRepository`        | InMemory | ❌ New needed | Medium     | 80       |
| **conversation-runtime** | `InMemoryConversationRepository`   | InMemory | ❌ New needed | Medium     | 100      |
| **cost-management**      | `InMemoryCostRepository`           | InMemory | ❌ New needed | Medium     | 90       |
| **human-in-the-loop**    | `InMemoryHitlRepository`           | InMemory | ❌ New needed | Medium     | 100      |
| **multi-agent**          | `InMemoryCoordinationRepository`   | InMemory | ❌ New needed | High       | 90       |
| **explainability**       | `InMemoryExplainabilityRepository` | InMemory | ❌ New needed | High       | 110      |

### AI Runtime (3 stores to migrate)

| Store                     | Current                       | Type     | Prisma Model? | Difficulty | Est. LOC |
| ------------------------- | ----------------------------- | -------- | ------------- | ---------- | -------- |
| **Session Store**         | `InMemorySessionStore`        | InMemory | ❌ New needed | Medium     | 60       |
| **Prompt Template Store** | `InMemoryPromptTemplateStore` | InMemory | ❌ New needed | Medium     | 60       |
| **Memory Store**          | `InMemoryMemoryStore`         | InMemory | ❌ New needed | Medium     | 60       |

### Business Modules (already on Prisma — no migration needed)

| Module                 | Repository                                                     | Type   | Status              |
| ---------------------- | -------------------------------------------------------------- | ------ | ------------------- |
| Workspace              | `WorkspaceRepository`                                          | Prisma | ✅ Already migrated |
| User                   | `UserRepository`                                               | Prisma | ✅ Already migrated |
| Auth                   | `SessionRepository`, `RefreshTokenRepository`                  | Prisma | ✅ Already migrated |
| RBAC                   | `RoleRepository`, `PermissionRepository`, `AuditLogRepository` | Prisma | ✅ Already migrated |
| Project                | `ProjectRepository`                                            | Prisma | ✅ Already migrated |
| Knowledge              | `KnowledgeRepository`                                          | Prisma | ✅ Already migrated |
| Knowledge Factory      | 4 repositories                                                 | Prisma | ✅ Already migrated |
| Knowledge Intelligence | 8 repositories                                                 | Prisma | ✅ Already migrated |
| Engineering            | `CalculationRepository`                                        | Prisma | ✅ Already migrated |
| Search                 | `SearchRepository`                                             | Prisma | ✅ Already migrated |
| Storage                | `StorageRepository`                                            | Prisma | ✅ Already migrated |
| Billing                | `BillingRepository`                                            | Prisma | ✅ Already migrated |
| Subscription           | `SubscriptionRepository`                                       | Prisma | ✅ Already migrated |
| Marketplace            | `MarketplaceRepository`                                        | Prisma | ✅ Already migrated |
| Notification           | `NotificationRepository`                                       | Prisma | ✅ Already migrated |
| API Keys               | `ApiKeyRepository`                                             | Prisma | ✅ Already migrated |
| Webhooks               | `WebhookRepository`                                            | Prisma | ✅ Already migrated |
| Feature Flags          | `FeatureFlagRepository`                                        | Prisma | ✅ Already migrated |
| Email                  | `EmailRepository`                                              | Prisma | ✅ Already migrated |
| Standards              | `StandardRepository`                                           | Prisma | ✅ Already migrated |
| AI Provider Management | 7 Prisma repositories                                          | Prisma | ✅ Already migrated |
| Semantic Integration   | 2 repositories                                                 | Prisma | ✅ Already migrated |
| Enterprise Saga        | `SagaInstanceRepository`                                       | Prisma | ✅ Already migrated |

### Enterprise Platform Modules (in-memory only — store pattern)

| Module                        | Store                                          | Type     | Difficulty      | Est. LOC |
| ----------------------------- | ---------------------------------------------- | -------- | --------------- | -------- |
| enterprise-cache              | `MemoryCacheStore`                             | InMemory | High (Redis)    | 80       |
| enterprise-config             | `FeatureFlagStore`                             | InMemory | Medium          | 60       |
| enterprise-messaging          | `InProcessMessageQueue`, `InProcessCommandBus` | InMemory | High (RabbitMQ) | 120      |
| enterprise-event-architecture | In-memory schema registry                      | InMemory | Medium          | 80       |

---

## New Prisma Models Required

### Memory Platform

- `memories` — all memory types (working, conversation, long-term, semantic, episodic, procedural)
- `memory_indexes` — memory vector/text indexing

### Prompt Governance

- `prompt_registry` — prompt definitions with versions
- `prompt_templates` — reusable prompt templates
- `prompt_policies` — prompt governance policies

### Tool Registry

- `tool_registry` — tool definitions with JSON schemas

### Skill Registry

- `skill_registry` — skill definitions
- `skill_dependencies` — skill dependency graph

### Context Engine

- `context_cache` — context store entries

### Policy Engine

- `policies` — policy definitions

### Reasoning Engine

- `reasoning_plans` — reasoning plans
- `reasoning_graphs` — execution DAGs

### Evaluation Platform

- `evaluation_benchmarks` — benchmark definitions
- `evaluation_datasets` — golden datasets
- `evaluation_runs` — evaluation run results

### AI Gateway

- `provider_capabilities` — extended provider capability registry

### Workflow Engine

- `workflow_definitions` — workflow definitions with versions
- `workflow_templates` — reusable workflow templates

### Workflow Runtime

- `workflow_executions` — execution records
- `compensation_entries` — saga compensation log

### Execution Context

- `execution_contexts` — execution-level context store
- `execution_artifacts` — shared artifacts
- `execution_memories` — shared memory store

### Planning Engine

- `plans` — plan definitions
- `plan_steps` — plan decomposition steps

### Conversation Runtime

- `conversation_stores` — extended conversation state

### Cost Management

- `cost_entries` — cost tracking records

### Human-in-the-Loop

- `approval_requests` — HITL approval records
- `review_tasks` — review task definitions

### Multi-Agent

- `coordination_plans` — multi-agent coordination plans
- `coordination_tasks` — agent task assignments

### Explainability

- `decision_logs` — decision logging
- `confidence_scores` — confidence scoring

### AI Runtime

- `agent_sessions` — agent session storage
- `agent_runtime_memories` — runtime memory store

---

## Redis Usage Plan

| Use Case          | Current            | Target           | TTL          |
| ----------------- | ------------------ | ---------------- | ------------ |
| Working Memory    | InMemory           | Redis Hash       | Session TTL  |
| Prompt Cache      | InMemory           | Redis String     | 1 hour       |
| Gateway Cache     | InMemory           | Redis String     | 5 min        |
| Distributed Cache | `MemoryCacheStore` | Redis            | Configurable |
| Rate Limiter      | InMemory           | Redis Sorted Set | 1 min window |
| Session Cache     | InMemory           | Redis Hash       | Session TTL  |
| Workflow Locks    | None               | Redis Lock       | Lease TTL    |
| Distributed Locks | None               | Redis Lock       | 30s lease    |

## RabbitMQ Usage Plan

| Component         | Current                 | Target                  | Queue Type      |
| ----------------- | ----------------------- | ----------------------- | --------------- |
| Command Bus       | `InProcessCommandBus`   | RabbitMQ Direct         | `command_queue` |
| Event Bus         | In-memory pub/sub       | RabbitMQ Topic          | `event.*`       |
| Message Queue     | `InProcessMessageQueue` | RabbitMQ Work Queue     | `message_queue` |
| Dead Letter Queue | In-memory               | RabbitMQ DLX            | `dlq.*`         |
| Retry Queue       | In-memory               | RabbitMQ Delayed        | `retry.*`       |
| Delayed Queue     | None                    | RabbitMQ Delayed Plugin | `delayed.*`     |

---

## Migration Order

1. Add new Prisma models → Create migration
2. Create `PrismaService` DI provider
3. Migrate Enterprise Intelligence repos (12 repos)
4. Migrate Enterprise Orchestration repos (9 repos)
5. Migrate AI Runtime stores (3 stores)
6. Migrate Enterprise Platform stores (4 stores)
7. Add Redis infrastructure
8. Add RabbitMQ infrastructure
9. Update module providers
10. Validate with `pnpm typecheck`

---

_Generated by: Sprint P1 Persistence Audit_
