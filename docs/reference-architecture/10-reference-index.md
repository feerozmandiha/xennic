# 10. Reference Index — Master Navigation Document

> **Version:** 1.0.0 | **Status:** Living Document | **Last Updated:** Tir 1405 (June 2026)

## How to Use This Reference

This document is the entry point to the Xennic Reference Architecture. Choose your path based on your role:

| Reader | Start with | Then |
|--------|-----------|------|
| **New Engineer** | [01-system-landscape](01-system-landscape.md) — what systems exist and how they connect | [02-service-catalog](02-service-catalog.md) — deep dive into each service's API, dependencies, and failure modes |
| **Software Architect** | [04-domain-map](04-domain-map.md) — business boundaries, entities, and domain ownership | [05-dependency-map](05-dependency-map.md) — every service, package, queue, cache, and storage dependency |
| **DevOps / Ops** | [06-runtime-topology](06-runtime-topology.md) — ports, networks, volumes, secrets, monitoring | [07-technology-matrix](07-technology-matrix.md) — rationale, trade-offs, and upgrade paths for every technology |
| **AI Agent / LLM** | This document first (10) — establish full context | Then in order: 01 → 02 → 04 → 05 → 06 → 07 → 08 for complete architectural awareness |
| **Product Manager** | [04-domain-map](04-domain-map.md) — what domains exist and their responsibilities | [08-implementation-matrix](08-implementation-matrix.md) — maturity of each module |
| **Knowledge Engineer** | [03-data-flow](03-data-flow.md) — end-to-end data lifecycle | [09-knowledge-factory](09-knowledge-factory.md) — the document ingestion pipeline |

---

## Architecture Overview

Xennic is an Engineering Intelligence Platform that provides electrical engineers with standards-compliant calculation tools, AI-powered knowledge retrieval, OCR-based document processing, and a bilingual (FA/EN) collaborative workspace. The platform follows a **monorepo** architecture (pnpm workspace + Turborepo) with a **NestJS/Fastify central API** (port 3000, 24 modules, 180+ endpoints), a **Next.js 15 frontend** (port 3001, 40+ pages), and three **Python/FastAPI microservices** for engineering calculations (port 8001), AI inference/RAG (port 8002), and vision/OCR (port 8003). Infrastructure includes PostgreSQL 17, Redis 8, RabbitMQ 4, MinIO, Qdrant, and a Prometheus/Grafana/Loki observability stack — all deployed via Docker Compose.

The platform is multi-tenant (workspace_id isolation on all 61 Prisma models), with JWT/RBAC authentication, plan-gated feature access, and an event-driven architecture backbone. A planned **Knowledge Factory** of 10 microservices will automate document ingestion, classification, extraction, and vector embedding. The current deployment phase is single-node Docker Compose, with future phases targeting Docker Swarm and Kubernetes for horizontal scaling.

---

## Document Map

| # | File | Purpose | Key Contents | Mermaid Diagrams | For the reader who wants to understand... |
|---|------|---------|-------------|-----------------|------------------------------------------|
| 01 | [01-system-landscape](01-system-landscape.md) | Birds-eye view of all systems, actors, and trust boundaries | C4 context diagram, internal system descriptions, 6 external actors, 4 trust zones, 3 deployment zones, high-level data flow narrative | 5 | What the platform is, who uses it, what's inside, and how requests flow from browser to database |
| 02 | [02-service-catalog](02-service-catalog.md) | Detailed catalog of every service with API, events, dependencies, failure modes | 17 operational services + 10 planned factory services, full endpoint tables, event contracts, dependency matrix, service status summary | 3 | What each service does, its API surface, what events it publishes/consumes, and how it fails |
| 03 | [03-data-flow](03-data-flow.md) | End-to-end data lifecycle across 13 flow types with sequence diagrams | Document upload, OCR pipeline, metadata flow, concept/entity extraction, chunking/embedding, vector storage, knowledge graph, reasoning, AI response, feedback loop, human review, versioning; event catalog, retry/circuit-breaker tables | 14 | How data moves through every pipeline — every sequence diagram shows participating services, data payloads, storage locations, and error handling |
| 04 | [04-domain-map](04-domain-map.md) | Business domain boundaries, entity ownership, and inter-domain dependencies | 15 domains with responsibilities, Prisma entity tables, owning services, full API listings, domain events, dependency graph, ownership matrix | 2 | Which team owns which data, how domains depend on each other, and the full API surface of each business capability |
| 05 | [05-dependency-map](05-dependency-map.md) | Exhaustive dependency mapping across all dimensions | Service-to-service (25 entries), package-to-package (6), database access (15x5 matrix), queue topology (11 queues, 13 events), cache, storage, external APIs (8 providers), LLM (5 consumers), vector DB, complete dependency matrix | 10 | Every single dependency in the platform — who talks to who, over what protocol, and whether it's active or planned |
| 06 | [06-runtime-topology](06-runtime-topology.md) | Production deployment topology, networking, and infrastructure configuration | 3 Docker Compose files, port allocation (37 ports), network security zones (6), volumes (9), secrets (8 env vars, 2 Docker secrets), SSL config, monitoring stack (8 scrape targets), tracing plan, logging pipeline, scaling limits and targets | 4 | How the platform is deployed, what ports/services/networks exist, how monitoring/logging works, and how it scales |
| 07 | [07-technology-matrix](07-technology-matrix.md) | Every technology with rationale, trade-offs, and upgrade path | 25 technology sections (NestJS, FastAPI, Next.js, RabbitMQ, Redis, PostgreSQL, Prisma, Qdrant, MinIO, Docker, Nginx, Prometheus, Grafana, Loki, OTel, TypeScript, Python, Turborepo, pnpm, Tailwind, React, Zustand, TanStack Query, Neo4j, Kubernetes) | 0 | Why each technology was chosen, what the alternatives were, what the risks are, and how to upgrade — per-section structured format |
| 08 | [08-implementation-matrix](08-implementation-matrix.md) | Implementation and production-readiness status of every component | 23 NestJS modules, 16 web feature areas, 5 packages, 3 Python services, infrastructure, knowledge platform; per-component percent scores (impl/prod/alpha/beta), gap tables for alpha and beta | 0 | How complete each part of the platform is, what's missing for alpha/beta/production, and where to focus next |
| 09 | [09-knowledge-factory](09-knowledge-factory.md) | Knowledge Factory architecture — the document ingestion pipeline | TBD (Knowledge Factory detailed design — 10 microservices, event pipeline, quality gates, lifecycle) | TBD | How the Knowledge Factory fits into the platform, its pipeline stages, and integration points |
| 10 | **10-reference-index** (this document) | Master navigation — the entry point to the entire reference architecture | How to use, architecture summary, document map, system directory, domain directory, cross-reference map, quick links, ADR index, glossary | 0 | Where to find what, how documents relate, and how to navigate the entire reference architecture |

---

## System Directory

| System | Type | Port | Status | Key Document |
|--------|------|------|--------|-------------|
| NestJS API | Backend/API | 3000 | Active | [01-system-landscape](01-system-landscape.md) |
| Next.js Web | Frontend | 3001 | Active | [01-system-landscape](01-system-landscape.md) |
| Engineering Service | Microservice | 8001 | Active | [02-service-catalog](02-service-catalog.md) |
| AI Service | Microservice | 8002 | Active | [02-service-catalog](02-service-catalog.md) |
| Vision Service | Microservice | 8003 | Active | [02-service-catalog](02-service-catalog.md) |
| API Gateway | Microservice | — | Placeholder | [02-service-catalog](02-service-catalog.md) |
| PostgreSQL | Database | 5432 | Active | [06-runtime-topology](06-runtime-topology.md) |
| Redis | Cache | 6379 | Active | [06-runtime-topology](06-runtime-topology.md) |
| RabbitMQ | Queue | 5672 | Active | [06-runtime-topology](06-runtime-topology.md) |
| MinIO | Storage | 9000 | Active | [06-runtime-topology](06-runtime-topology.md) |
| Qdrant | Vector DB | 6333 | Active | [06-runtime-topology](06-runtime-topology.md) |
| Nginx | Proxy | 443 | Active | [06-runtime-topology](06-runtime-topology.md) |
| PgBouncer | Pooler | 6432 | Active | [06-runtime-topology](06-runtime-topology.md) |
| Prometheus | Monitoring | 9090 | Active | [06-runtime-topology](06-runtime-topology.md) |
| Grafana | Dashboard | 3002 | Active | [06-runtime-topology](06-runtime-topology.md) |
| Loki | Logs | 3100 | Active | [06-runtime-topology](06-runtime-topology.md) |
| Knowledge Factory (10 svcs) | Microservices | 8101-8112 | Planned | [09-knowledge-factory](09-knowledge-factory.md) |

---

## Domain Directory

| Domain | Key Entities | Service | API Count | Document |
|--------|-------------|---------|-----------|----------|
| Auth | users, sessions, refresh_tokens, password_reset_tokens | AuthModule (NestJS) | 8 | [04-domain-map](04-domain-map.md) |
| Authorization (RBAC) | roles, permissions, role_permissions, user_roles | RbacModule (NestJS) | 10 | [04-domain-map](04-domain-map.md) |
| Workspace | workspaces, workspace_members, workspace_invitations, workspace_settings | WorkspaceModule (NestJS) | 15 | [04-domain-map](04-domain-map.md) |
| Projects | projects, project_members, project_notes, project_reports | ProjectModule (NestJS) | 12 | [04-domain-map](04-domain-map.md) |
| Engineering | calculations, calculation_templates, engineering_standards | EngineeringModule (NestJS) + FastAPI 8001 | 9 (NestJS) + 40+ (FastAPI) | [04-domain-map](04-domain-map.md) |
| Knowledge | knowledge, knowledge_translations, categories, topics, tags, disciplines, audiences, knowledge_taxonomy, knowledge_media, knowledge_formulas, knowledge_examples, knowledge_standards, knowledge_versions, knowledge_comments, knowledge_workflows, knowledge_workflow_history, knowledge_analytics | KnowledgeModule (NestJS) | 30+ | [04-domain-map](04-domain-map.md) |
| AI | agents, conversations, messages, ai_usage | AiModule (NestJS) + FastAPI 8002 | 8 | [04-domain-map](04-domain-map.md) |
| Vision / OCR | — (uses `calculations` table) | VisionModule (NestJS) + FastAPI 8003 | 5 | [04-domain-map](04-domain-map.md) |
| Marketplace | vendors, products, product_translations, orders, order_items | MarketplaceModule (NestJS) | 14 | [04-domain-map](04-domain-map.md) |
| Billing / Subscription | plans, subscriptions, usage_logs, invoices, payments, transactions, payment_methods, subscription_payments | SubscriptionModule + BillingModule (NestJS) | 25 | [04-domain-map](04-domain-map.md) |
| Storage / Files | files, file_versions | StorageModule (NestJS) + MinIO | 7 | [04-domain-map](04-domain-map.md) |
| Notifications | notifications | NotificationModule (NestJS) | 6 | [04-domain-map](04-domain-map.md) |
| Search | — (cross-domain) | SearchModule (NestJS) + Qdrant | 1 | [04-domain-map](04-domain-map.md) |
| Administration | system_settings, feature_flags, audit_logs | AdminModule + FeatureFlagsModule (NestJS) | 20+ | [04-domain-map](04-domain-map.md) |
| API Management | api_keys, webhooks | ApiKeysModule + WebhooksModule (NestJS) | 10 | [04-domain-map](04-domain-map.md) |

---

## Cross-Reference Map

Each document in the reference architecture references and is referenced by others. This map enables navigation and impact analysis.

| Document | References | Referenced By |
|----------|-----------|---------------|
| **01-system-landscape** | — (foundational) | 02, 03, 04, 05, 06, 07, 08, 09, 10 |
| **02-service-catalog** | 01 | 03, 04, 05, 06, 07, 08, 09, 10 |
| **03-data-flow** | 01, 02, 04, 05, 06 | 08, 09, 10 |
| **04-domain-map** | 01, 02 | 03, 05, 08, 10 |
| **05-dependency-map** | 01, 02, 06 | 03, 07, 08, 09, 10 |
| **06-runtime-topology** | 01, 02 | 03, 05, 07, 08, 09, 10 |
| **07-technology-matrix** | 01, 02, 05, 06 | 08, 10 |
| **08-implementation-matrix** | 01, 02, 03, 04, 05, 06, 07 | 10 |
| **09-knowledge-factory** | 01, 02, 03, 05, 06 | 10 |
| **10-reference-index** | 01, 02, 03, 04, 05, 06, 07, 08, 09 | — (entry point) |

### Cross-Reference by Topic Area

| Topic Area | Primary Document | Supporting Documents |
|------------|-----------------|---------------------|
| System overview & actors | 01 | 02, 06 |
| Service API & catalog | 02 | 01, 07 |
| Data flows & pipelines | 03 | 02, 05 |
| Domain ownership & entities | 04 | 02, 08 |
| Dependencies & topology | 05 | 06, 07 |
| Deployment & infrastructure | 06 | 05, 07 |
| Technology decisions | 07 | 05, 06 |
| Implementation maturity | 08 | 01, 02, 03, 04 |
| Knowledge Factory | 09 | 03, 05 |

---

## Quick Links

### Existing Architecture Documentation

| Document | Path |
|----------|------|
| System Architecture | `docs/architecture/SYSTEM_ARCHITECTURE.md` |
| Service Architecture | `docs/architecture/SERVICE_ARCHITECTURE.md` |
| Event Flow | `docs/architecture/EVENT_FLOW.md` |
| Request Flow | `docs/architecture/REQUEST_FLOW.md` |
| Sequence Diagrams | `docs/architecture/SEQUENCE_DIAGRAMS.md` |
| Microservices Architecture | `docs/architecture/MICROSERVICES.md` |
| NestJS Modules | `docs/architecture/NESTJS_MODULES.md` |
| Packages Reference | `docs/architecture/PACKAGES_REFERENCE.md` |

### Knowledge Base

| Topic | Path |
|-------|------|
| Knowledge Platform Overview | `docs/knowledge/KNOWLEDGE_PLATFORM.md` |
| Governance (ontology, taxonomy, naming, metadata, source hierarchy, data quality) | `docs/knowledge/governance/` |
| Concepts (canonical concepts, entity model, relations, lifecycle, acquisition) | `docs/knowledge/concepts/` |
| Semantics (vocabulary, bilingual lexicon, synonyms, acronyms, unit normalization) | `docs/knowledge/semantics/` |
| Runtime (pipeline orchestration, event-driven architecture, document lifecycle) | `docs/knowledge/runtime/` |
| Reasoning (reasoning runtime, confidence engine, formula engine, evidence model) | `docs/knowledge/reasoning/` |
| AI Intelligence (reasoning framework, hallucination prevention, source of truth) | `docs/knowledge/ai-intelligence/` |

### Knowledge Factory

| Document | Path |
|----------|------|
| XKF Architecture | `docs/knowledge-factory/XKF-ARCHITECTURE.md` |
| XKF Integration | `docs/knowledge-factory/XKF-INTEGRATION.md` |
| XKF Lifecycle | `docs/knowledge-factory/XKF-LIFECYCLE.md` |
| XKF Deployment | `docs/knowledge-factory/XKF-DEPLOYMENT.md` |
| XKF Vision | `docs/knowledge-factory/XKF-VISION.md` |
| XKF Scalability | `docs/knowledge-factory/XKF-SCALABILITY.md` |
| XKF Roadmap | `docs/knowledge-factory/XKF-ROADMAP.md` |

### Project Management & Roadmap

| Document | Path |
|----------|------|
| Master Project Prompt | `docs/XENNIC_MASTER_PROJECT_PROMPT.md` |
| Master Roadmap | `docs/roadmap/XENNIC_MASTER_ROADMAP_v1.md` |
| Product Vision | `docs/product/PRODUCT_VISION.md` |
| Documentation Status | `docs/DOCUMENTATION_STATUS.md` |
| Review Report | `docs/REVIEW_REPORT.md` |
| Status Report | `docs/STATUS_REPORT.md` |

### Deployment

| Document | Path |
|----------|------|
| Docker Compose (base) | `infrastructure/docker/compose/base/docker-compose.yml` |
| Docker Compose (production) | `infrastructure/docker/compose/production/docker-compose.yml` |
| Docker Compose (Qdrant) | `workspace/docker-compose.yml` |
| Deployment Guide | `docs/deployment/DOCKER_COMPOSE.md` |
| Production Checklist | `docs/deployment/PRODUCTION_CHECKLIST.md` |
| Server Setup | `docs/deployment/SERVER_SETUP.md` |

### Runbooks

| Document | Path |
|----------|------|
| Backup Script | `infrastructure/backup/backup.sh` |
| Restore Script | `infrastructure/backup/restore.sh` |
| Verify Backup | `infrastructure/backup/verify.sh` |
| Start Stack | `infrastructure/docker/scripts/up.sh` |
| Stop Stack | `infrastructure/docker/scripts/down.sh` |
| Reset Stack | `infrastructure/docker/scripts/reset.sh` |

### API & Standards

| Document | Path |
|----------|------|
| OpenAPI Spec (auto-generated) | `packages/openapi/v1/openapi.json` |
| API Design | `docs/backend/API_DESIGN.md` |
| Error Handling | `docs/backend/ERROR_HANDLING.md` |
| Coding Standards | `docs/standards/XENNIC_CODING_STANDARDS_v1.md` |
| Development Governance | `docs/standards/XENNIC_DEVELOPMENT_GOVERNANCE_v1.md` |

---

## Architecture Decision Records Index

### Project ADRs

Project ADRs cover foundational technology and architecture choices. ADR-001 through ADR-005 are defined inline in the ADR index; ADR-006 through ADR-010 have individual files.

| # | Title | Status | Location |
|---|-------|--------|----------|
| ADR-001 | Monorepo Structure | Accepted | `docs/decisions/INDEX.md` (inline) |
| ADR-002 | Package Manager: pnpm | Accepted | `docs/decisions/INDEX.md` (inline) |
| ADR-003 | NestJS + Fastify | Accepted | `docs/decisions/INDEX.md` (inline) |
| ADR-004 | PostgreSQL + Prisma | Accepted | `docs/decisions/INDEX.md` (inline) |
| ADR-005 | Microservices Strategy | Accepted | `docs/decisions/INDEX.md` (inline) |
| ADR-006 | Dependency Management | Accepted | `docs/decisions/ADR-006-dependency-management.md` |
| ADR-007 | Database Migration Strategy | Accepted | `docs/decisions/ADR-007-database-migration-strategy.md` |
| ADR-008 | Documentation as Code | Accepted | `docs/decisions/ADR-008-documentation-as-code.md` |
| ADR-009 | API Versioning Strategy | Accepted | `docs/decisions/ADR-009-api-versioning-strategy.md` |
| ADR-010 | Testing Strategy | Accepted | `docs/decisions/ADR-010-testing-strategy.md` |

### Runtime ADRs

Runtime ADRs cover the Knowledge Factory pipeline execution engine, event architecture, and operational concerns.

| # | Title | Location |
|---|-------|----------|
| ADR-001 | Pipeline Architecture | `docs/knowledge/runtime/adr-001-pipeline-architecture.md` |
| ADR-002 | Event-Driven Runtime | `docs/knowledge/runtime/adr-002-event-driven-runtime.md` |
| ADR-003 | Validation Architecture | `docs/knowledge/runtime/adr-003-validation-architecture.md` |
| ADR-004 | Human-in-the-Loop | `docs/knowledge/runtime/adr-004-human-in-the-loop.md` |
| ADR-005 | Publication Strategy | `docs/knowledge/runtime/adr-005-publication-strategy.md` |
| ADR-006 | Scalability Strategy | `docs/knowledge/runtime/adr-006-scalability-strategy.md` |
| ADR-007 | Failure Recovery | `docs/knowledge/runtime/adr-007-failure-recovery.md` |
| ADR-008 | Runtime Observability | `docs/knowledge/runtime/adr-008-runtime-observability.md` |
| ADR-009 | Pipeline Versioning | `docs/knowledge/runtime/adr-009-pipeline-versioning.md` |
| ADR-010 | AI Integration | `docs/knowledge/runtime/adr-010-ai-integration.md` |

### Reasoning ADRs

Reasoning ADRs cover the reasoning runtime, knowledge object model, evidence graph, and all engines.

| # | Title | Location |
|---|-------|----------|
| ADR-011 | Knowledge Object Architecture | `docs/knowledge/reasoning/adr-011-knowledge-object-architecture.md` |
| ADR-012 | Evidence Graph | `docs/knowledge/reasoning/adr-012-evidence-graph.md` |
| ADR-013 | Reasoning Runtime | `docs/knowledge/reasoning/adr-013-reasoning-runtime.md` |
| ADR-014 | Rule Engine | `docs/knowledge/reasoning/adr-014-rule-engine.md` |
| ADR-015 | Constraint Engine | `docs/knowledge/reasoning/adr-015-constraint-engine.md` |
| ADR-016 | Formula Engine | `docs/knowledge/reasoning/adr-016-formula-engine.md` |
| ADR-017 | Confidence Engine | `docs/knowledge/reasoning/adr-017-confidence-engine.md` |
| ADR-018 | Human Review | `docs/knowledge/reasoning/adr-018-human-review.md` |
| ADR-019 | Conflict Resolution | `docs/knowledge/reasoning/adr-019-conflict-resolution.md` |
| ADR-020 | Engineering Truth Runtime | `docs/knowledge/reasoning/adr-020-engineering-truth-runtime.md` |

### XKF ADRs (Knowledge Factory)

Knowledge Factory ADRs cover the document ingestion pipeline architecture (planned).

| # | Title | Status | Location |
|---|-------|--------|----------|
| ADR-K3.0-001 | Knowledge Factory Architecture | Planned | `docs/knowledge-factory/XKF-ARCHITECTURE.md` |
| ADR-K3.0-002 | Pipeline Event Contracts | Planned | `docs/knowledge-factory/XKF-ARCHITECTURE.md` |
| ADR-K3.0-003 | Service Boundaries | Planned | `docs/knowledge-factory/XKF-INTEGRATION.md` |
| ADR-K3.0-004 | Quality Gate Strategy | Planned | `docs/knowledge-factory/XKF-LIFECYCLE.md` |
| ADR-K3.0-005 | Storage Strategy | Planned | `docs/knowledge-factory/XKF-ARCHITECTURE.md` |
| ADR-K3.0-006 | Deployment Topology | Planned | `docs/knowledge-factory/XKF-DEPLOYMENT.md` |
| ADR-K3.0-007 | Scalability Model | Planned | `docs/knowledge-factory/XKF-SCALABILITY.md` |
| ADR-K3.0-008 | Bilingual Pipeline | Planned | `docs/knowledge-factory/XKF-VISION.md` |
| ADR-K3.0-009 | Monitoring & Observability | Planned | `docs/knowledge-factory/XKF-DEPLOYMENT.md` |
| ADR-K3.0-010 | Lifecycle & Versioning | Planned | `docs/knowledge-factory/XKF-LIFECYCLE.md` |

---

## Glossary

| Term | Definition |
|------|------------|
| **EKO** | Enriched Knowledge Object — the canonical knowledge unit produced by the Knowledge Factory pipeline, containing content, embeddings, metadata, taxonomy, and provenance |
| **Knowledge Factory (XKF)** | Event-driven document ingestion pipeline of 10 microservices that converts raw documents into structured, enriched, vector-embedded knowledge objects |
| **Quality Gate (QG)** | Cross-cutting validation layer with 5 gates (QG-1 through QG-5) scoring EKO quality (0.0–1.0) — determines auto-publish, escalate, or reject |
| **RAG** | Retrieval-Augmented Generation — technique used by the AI Service to retrieve relevant knowledge from Qdrant before generating LLM responses |
| **Workspace** | Multi-tenant isolation unit — every business entity carries `workspace_id`, and the TenantContext middleware automatically scopes all queries |
| **PgBouncer** | Lightweight PostgreSQL connection pooler — sits between NestJS API and PostgreSQL with transaction-level pooling (25 default pool, 200 max clients) |
| **RBAC** | Role-Based Access Control — permission system using `domain.action` naming convention with roles, permissions, and user-role assignments scoped to workspace |
| **LLM Provider** | External AI service provider (Groq, OpenAI, Anthropic, Google, xAI, Together, Ollama, Mistral, OpenRouter) abstracted behind a unified interface |
| **Reasoning Runtime** | Knowledge pipeline engine that performs multi-stage reasoning: context building → knowledge selection → evidence collection → reasoning → confidence scoring → citation generation |
| **ADR** | Architecture Decision Record — documented architectural decision with context, options considered, decision rationale, and consequences |
| **DDD** | Domain-Driven Design — the architectural approach used in the NestJS API, with each business domain owning its module, entities, and logic |
| **Tenant Extension** | Prisma middleware (`Prisma.defineExtension`) that automatically injects `workspace_id` filters on all queries for 28 tenant-scoped models via `AsyncLocalStorage` |
| **Knowledge Graph** | Future Neo4j-based graph database storing entities, concepts, and relationships extracted from engineering documents — supports traversal queries for path finding and concept expansion |
| **Source Tier** | Classification of knowledge source reliability (Tier 1: published standards, Tier 2: peer-reviewed, Tier 3: manufacturer data, Tier 4: expert-contributed, Tier 5: AI-extracted) |
| **HNSW** | Hierarchical Navigable Small World — the approximate nearest neighbor (ANN) index algorithm used by Qdrant for fast vector similarity search |

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Tir 1405 (June 2026) | Initial release — master navigation document for reference architecture |
