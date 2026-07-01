# Xennic Platform — Project Manifest

> **Master Index** — Generated from repository state on 2026-06-26.
> This document catalogs every major directory, its purpose, maturity, dependencies, and roadmap status.

---

## 1. Monorepo Root

| Attribute | Value |
|-----------|-------|
| **Package Manager** | pnpm 10.33.0 |
| **Build System** | Turborepo 2.5.0 |
| **Node.js** | 22 |
| **Workspace Definition** | `pnpm-workspace.yaml` — `apps/*`, `packages/*`, `services/*`, `workspace/*` |
| **Formatting** | Prettier 3.8.3 (semi, singleQuote, trailingComma all, printWidth 100) |
| **Linting** | ESLint 10.4.1 + `typescript-eslint` |
| **Git Hooks** | Husky 9 + commitlint + lint-staged |

---

## 2. `apps/api` — NestJS Fastify Backend

| Field | Detail |
|-------|--------|
| **Purpose** | Primary REST API gateway for the Xennic platform. All business logic for workspace management, authentication, RBAC, engineering calculations, billing, knowledge management, marketplace, AI integration, file storage, and system administration. |
| **Responsibilities** | HTTP API serving (Fastify adapter), JWT authentication & authorization, rate limiting (NestJS Throttler), global validation (whitelist + forbidNonWhitelisted), file uploads (fastify/multipart, 100 MB limit), Swagger/OpenAPI documentation generation, multi-tenant request isolation via `X-Workspace-ID` header, CORS hardening, 23 NestJS modules. |
| **Main technologies** | NestJS 11, Fastify 5, Prisma Client 6, Zod 4, TypeScript 6, MinIO SDK, Nodemailer |
| **Internal dependencies** | `@xennic/database` (workspace), `@xennic/shared` (workspace), `@xennic/types` (workspace) |
| **External dependencies** | PostgreSQL 17 (via Prisma), MinIO (S3-compatible storage), Redis 8 (sessions/cache — via `@nestjs/throttler`), RabbitMQ 4 (not yet wired), SMTP (via nodemailer) |
| **Used by** | `apps/web` (via API proxy rewrites), external API consumers, Swagger UI consumers |
| **Current maturity** | 70% |
| **Missing parts** | Comprehensive e2e test suite, full integration tests for all 23 modules, production error tracking/APM integration, message queue consumer wiring (RabbitMQ), rate limit store persistence (Redis-backed, currently in-memory), API versioning strategy beyond `/api/v1`, bulk/export endpoints |
| **Future roadmap** | Complete module test coverage, add GraphQL federation layer, migrate to message-driven architecture for long-running calculations, implement API key usage analytics |
| **Alpha readiness** | **Yes** — core authentication, RBAC, workspace isolation, engineering calculations, knowledge management, storage, and health endpoints are functional. 23 modules registered. OpenAPI spec auto-generated. CI pipeline builds and tests. |

### Module Inventory (`src/modules/`)

| Module | Status | Description |
|--------|--------|-------------|
| admin | ✅ Active | Platform administration (system settings, feature flags, audit log browsing) |
| ai | ✅ Active | AI conversation management, agent routing |
| api-keys | ✅ Active | API key CRUD, key hash management |
| auth | ✅ Active | JWT authentication (access + refresh tokens), password reset, login/signup |
| billing | ✅ Active | Invoice, payment, transaction, payment method management |
| consultations | ✅ Active | Engineering consultation requests and management |
| email | ✅ Active | Email sending via SMTP/Nodemailer (templated) |
| engineering | ✅ Active | Engineering calculation orchestration, result persistence |
| feature-flags | ✅ Active | Feature flag evaluation per workspace/plan |
| health | ✅ Active | Health check endpoint, service dependency status |
| knowledge | ✅ Active | Knowledge management system (full CRUD, taxonomy, workflows, analytics) |
| marketplace | ✅ Active | Vendor, product, order management |
| notification | ✅ Active | Notification creation, queuing, delivery |
| project | ✅ Active | Project CRUD, members, notes, reports |
| rbac | ✅ Active | Role/permission management, user-role assignment |
| search | ✅ Active | Global search across entities |
| standards | ✅ Active | Engineering standards registry, knowledge–standards linkage |
| storage | ✅ Active | File upload/download, versioning, MinIO integration |
| subscription | ✅ Active | Plan, subscription, usage log management |
| user | ✅ Active | User profile CRUD, avatar management |
| vision | ✅ Active | Vision/OCR job orchestration, result retrieval |
| webhooks | ✅ Active | Webhook CRUD, event dispatch |
| workspace | ✅ Active | Workspace CRUD, members, invitations, settings |

---

## 3. `apps/web` — Next.js 15 Frontend

| Field | Detail |
|-------|--------|
| **Purpose** | Server-side rendered React application providing the user interface for the Xennip platform. Bilingual (FA/EN via next-intl), rich text editing (TipTap), PDF generation, data visualization (Recharts), and full UI component library (Radix + Tailwind 4). |
| **Responsibilities** | SSR rendering, i18n localization, API proxy rewrites to NestJS backend, client-side state management (Zustand), React Query for data fetching, file uploads, PDF report generation, rich text content editing, Arabic/Persian text reshaping, theme switching (next-themes), responsive layout. |
| **Main technologies** | Next.js 15 (standalone output), React 19, TypeScript 6, Tailwind CSS 4, Radix UI primitives, TipTap 3, TanStack React Query 5, Zustand 5, Recharts 3, jsPDF 2, React-PDF 4, next-intl 4, next-themes |
| **Internal dependencies** | `@xennic/types` (workspace — type interfaces) |
| **External dependencies** | NestJS API at `localhost:3000` (dev) / production URL (prod), MinIO (for file previews) |
| **Used by** | End users (electrical engineers, project managers, admins) |
| **Current maturity** | 60% |
| **Missing parts** | No test suite (script echoes `No web tests yet`), limited Storybook/no design system documentation, incomplete page coverage (some admin views, marketplace checkout flow, advanced search UI), no e2e tests (Playwright/Cypress), no PWA support, no offline capability, no performance budget, no accessibility audit |
| **Future roadmap** | Add Playwright e2e tests, implement design system in Storybook, complete all admin panel views, add progressive web app support, implement skeleton loading states, add error boundaries, integrate Sentry for client-side error tracking |
| **Alpha readiness** | **Yes** — core pages (dashboard, projects, engineering calculators, knowledge base, user profile, auth flows) are functional. Standalone export works. API proxy rewrites configured for all three backend services. |

### App Structure (`src/`)

| Directory | Content |
|-----------|---------|
| `app/` | Next.js App Router pages and layouts |
| `components/` | Reusable UI components (Radix-based, Tailwind-styled) |
| `extensions/` | TipTap editor extensions |
| `features/` | Feature-specific component modules |
| `fonts/` | Custom font assets (Arabic, Persian) |
| `hooks/` | Custom React hooks |
| `i18n/` | Internationalization configuration and message files |
| `lib/` | Utility libraries and API client wrappers |
| `stores/` | Zustand state stores |
| `types/` | Frontend-specific TypeScript types |

---

## 4. `packages/config` — Monorepo Shared Configuration

| Field | Detail |
|-------|--------|
| **Purpose** | Single source of truth for shared tooling configuration consumed by all TypeScript workspaces in the monorepo. |
| **Responsibilities** | TypeScript base config (`tsconfig.base.json`), Prettier formatting rules (`prettier.config.cjs`), environment variable validation schema (`env.ts`), ESLint base config (inherited from root `.eslintrc.cjs`) |
| **Main technologies** | TypeScript 6, Prettier 3.8.3, ESLint 10 |
| **Internal dependencies** | None (consumed by all workspaces) |
| **Used by** | `apps/api`, `apps/web`, `packages/database`, `packages/shared`, `packages/types` |
| **Current maturity** | 90% |
| **Missing parts** | Shared Jest/Vitest config, shared commitlint config (at root instead), shared Dockerfile patterns, shared CI pipeline templates |
| **Future roadmap** | Extract common CI steps as reusable composite actions, add shared `tsconfig.build.json` for stricter production builds |
| **Alpha readiness** | **Yes** — tsconfig, Prettier, and env validation are fully functional and consumed by all workspaces. |

---

## 5. `packages/database` — Prisma ORM with Tenant Isolation

| Field | Detail |
|-------|--------|
| **Purpose** | Encapsulated Prisma client with automatic multi-tenant workspace isolation driven by `AsyncLocalStorage`. All database access in the monorepo flows through this package to guarantee tenant scoping. |
| **Responsibilities** | Prisma client singleton (global cache in dev), `TenantContext` class wrapping `AsyncLocalStorage<{workspaceId}>`, `createTenantExtension` Prisma extension that auto-injects `workspace_id` filters on 24 workspace-scoped models, typed repository pattern (`.findMany`, `.create`, `.update`, `.delete`, `.upsert`), TypeScript types for all Prisma models via generated Prisma Client |
| **Main technologies** | Prisma Client 6, PostgreSQL 17, TypeScript 6, Node.js Async Hooks |
| **Internal dependencies** | None (imports `@prisma/client` only) |
| **External dependencies** | PostgreSQL 17 (runtime — via Prisma Client) |
| **Used by** | `apps/api` (all modules), any future workspace that needs database access |
| **Current maturity** | 85% |
| **Missing parts** | Read replica support, connection pooling configuration (currently relies on PgBouncer externally), query logging/monitoring, migration from `.prisma/client` to direct database driver, composite foreign key support for some models |
| **Future roadmap** | Implement read/write splitting, add Prisma middleware for audit logging, expose typed repository classes with pagination/sorting helpers, add connection health check with circuit breaker |
| **Alpha readiness** | **Yes** — tenant isolation extension is tested and working across all 24 workspace-scoped models. 61 Prisma models generated. Client singleton pattern with global caching. |

### Tenant-Scoped Models (24)

`sessions`, `user_roles`, `workspace_members`, `workspace_invitations`, `workspace_settings`, `subscriptions`, `usage_logs`, `invoices`, `payments`, `transactions`, `payment_methods`, `subscription_payments`, `projects`, `calculations`, `conversations`, `ai_usage`, `knowledge`, `orders`, `files`, `api_keys`, `webhooks`, `audit_logs`, `feature_flags`

---

## 6. `packages/openapi` — Auto-Generated OpenAPI 3.0 Spec

| Field | Detail |
|-------|--------|
| **Purpose** | Holds the auto-generated OpenAPI 3.0 specification document, produced as a build artifact by the `generate:openapi` script in `apps/api`. |
| **Responsibilities** | Provide a machine-readable API definition that can be consumed by documentation tools, client generators (openapi-generator, Orval), and testing frameworks |
| **Main technologies** | OpenAPI 3.0, JSON |
| **Internal dependencies** | Generated from `apps/api` at build time |
| **Used by** | External API consumers, documentation generation, client SDK generation |
| **Current maturity** | 80% |
| **Missing parts** | No bundled examples/request samples for all endpoints, no Postman collection export, no OpenAPI 3.1 migration, no diff checking in CI |
| **Future roadmap** | Add OpenAPI diff checking in CI (`openapi-diff`), generate TypeScript client SDK automatically, publish to an internal API registry |
| **Alpha readiness** | **Yes** — the spec is auto-generated on every build (`pnpm build` runs `generate:openapi`), covers all 23 registered modules, and is served via Swagger UI at `/api/docs`. |

---

## 7. `packages/shared` — Shared Utilities

| Field | Detail |
|-------|--------|
| **Purpose** | Cross-cutting utilities, error handling, logging, and type-safe result patterns shared across all TypeScript workspaces. |
| **Responsibilities** | `Result<T, E>` monad (type-safe success/error handling), `AppError` hierarchy with error codes, structured logger (configurable level/output), constants (domain enums, magic values), type guards (`isEmail`, `isUUID`, etc.), utility functions (date formatting, string manipulation, pagination helpers) |
| **Main technologies** | TypeScript 6 |
| **Internal dependencies** | None |
| **Used by** | `apps/api`, potentially other workspaces |
| **Current maturity** | 75% |
| **Missing parts** | No validation library integration (Zod schemas in `apps/api` are independent), no i18n for error messages, limited unit test coverage, no performance benchmarking utilities |
| **Future roadmap** | Extract Zod validation schemas to shared package, add i18n catalog for user-facing error messages, implement structured logging with OpenTelemetry integration |
| **Alpha readiness** | **Yes** — `Result`, `AppError`, logger, and constants are used throughout the API. Core functionality is stable. |

### Internal Structure (`src/`)

| Directory | Content |
|-----------|---------|
| `constants/` | Domain constants, enums, magic strings |
| `errors/` | `AppError` base class and derived error types |
| `guards/` | Runtime type guard functions |
| `logger/` | Structured logger (Pino-like API) |
| `result/` | `Result<T, E>` monad with `ok()`, `fail()`, `unwrap()`, `match()` |
| `utils/` | General-purpose utility functions |

---

## 8. `packages/types` — Shared TypeScript Interfaces

| Field | Detail |
|-------|--------|
| **Purpose** | Canonical TypeScript interfaces and type definitions shared across frontend and backend workspaces. Guarantees type consistency between the API layer and the web UI. |
| **Responsibilities** | `BaseEntity` interface (id, createdAt, updatedAt, deletedAt), `TenantContext` interface (workspaceId), shared DTO shapes, pagination types (`PaginatedResult<T>`, `PaginationMeta`), API response envelopes (`ApiResponse<T>`, `ApiError`) |
| **Main technologies** | TypeScript 6 |
| **Internal dependencies** | None |
| **Used by** | `apps/api`, `apps/web`, `packages/database`, `packages/shared` |
| **Current maturity** | 70% |
| **Missing parts** | Many module-specific DTOs are still defined locally in `apps/api`, no runtime validation schemas (Zod), incomplete type coverage for all 61 Prisma models, no branded types for entity IDs |
| **Future roadmap** | Consolidate all DTO types from `apps/api` into this package, generate Zod schemas from TypeScript types using `ts-to-zod`, add branded ID types (`WorkspaceId`, `UserId`, `ProjectId`) |
| **Alpha readiness** | **Yes** — `BaseEntity`, `TenantContext`, and common response types are used across the monorepo. The type contracts between API and web are consistent. |

---

## 9. `services/api-gateway` — Placeholder

| Field | Detail |
|-------|--------|
| **Purpose** | Reserved for a future API gateway layer that will sit between external consumers and the NestJS API. |
| **Responsibilities** | None currently — directory is **empty**. |
| **Main technologies** | TBD (likely Envoy, Kong, or custom Fastify gateway) |
| **Internal dependencies** | None |
| **Used by** | Not yet applicable |
| **Current maturity** | 0% |
| **Missing parts** | Complete implementation — no files, no configuration, no Docker image |
| **Future roadmap** | Implement API gateway with rate limiting per API key, request aggregation, circuit breaking, caching, IP whitelisting, and WAF rules |
| **Alpha readiness** | **No** — the directory is empty. API gateway responsibilities are currently handled by the NestJS API directly (rate limiting via ThrottlerModule, CORS via Fastify). |

---

## 10. `workspace/services/engineering-service` — FastAPI Engineering Calculator

| Field | Detail |
|-------|--------|
| **Purpose** | High-performance Python microservice providing electrical engineering calculations. All computation-heavy logic is offloaded here from the NestJS API. |
| **Responsibilities** | Cable sizing (IEC 60364 ampacity tables), transformer sizing, protection device coordination, power quality analysis (harmonics, PF correction), lighting design (lumen method, road lighting), grounding system design, switchgear selection, power system analysis (load flow, short circuit), renewable energy calculations, economic analysis (NPV, IRR, lifecycle), unit conversion, engineering standard compliance validation |
| **Main technologies** | FastAPI, Python 3.12, Pydantic v2, Ruff, MyPy, pytest, pytest-cov |
| **Internal dependencies** | None (standalone service; called by NestJS API via HTTP) |
| **External dependencies** | IEC 60364 reference data (embedded in `src/data/tables/`) |
| **Used by** | `apps/api` (engineering module), `apps/web` (via API proxy), `workspace/services/ai-service` (as a tool for AI agents) |
| **Current maturity** | 75% |
| **Missing parts** | Load flow and short-circuit analysis are partially implemented, no dynamic thermal rating calculations, no protective device library (manufacturer-specific curves), limited integration tests with NestJS, no performance benchmarks for large-scale calculations, no caching layer for repeated calculations |
| **Future roadmap** | Add arc flash analysis (IEEE 1584), implement dynamic protection coordination with time-current curve visualization, add calculation history comparison, create manufacturer device database, implement parallel/multi-threaded batch calculations |
| **Alpha readiness** | **Yes** — core calculators (cable, transformer, protection, lighting, grounding, power quality, renewable energy) are functional and tested. API routers are registered and responding. Health endpoint operational. |

### Calculator Modules

| Router | Calculators |
|--------|-------------|
| `basic/` | Ohm's law, power factor, voltage drop, wire sizing |
| `cable/` | Cable ampacity (IEC 60364), derating factors, cable tray fill |
| `transformer/` | Transformer sizing, impedance, efficiency, loss evaluation |
| `protection/` | Circuit breaker sizing, fuse coordination, relay settings |
| `protection_ext/` | Advanced protection: differential, distance, overfluxing |
| `lighting/` | Lumen method, road lighting (CIE), indoor illuminance |
| `grounding/` | Earth resistance, step/touch voltage, grid design |
| `switchgear/` | Busbar sizing, switchgear rating, arc flash boundary |
| `power_system/` | Load flow, short circuit (IEC 60909), harmonic analysis |
| `power_quality/` | Harmonic distortion, PF correction filter sizing |
| `renewable/` | Solar PV sizing, wind energy estimation, battery storage |
| `economics/` | NPV, IRR, lifecycle cost, payback period |
| `energy_analyzer/` | Energy consumption analysis, efficiency recommendations |

---

## 11. `workspace/services/ai-service` — FastAPI AI Service

| Field | Detail |
|-------|--------|
| **Purpose** | AI/LLM-powered conversational agent service. Provides RAG (retrieval-augmented generation), multi-agent orchestration, and integration with external LLM providers. |
| **Responsibilities** | Multi-agent chat (electrical engineer assistant, document analyst), RAG pipeline (embedding, vector search via Qdrant, chunking, retrieval), document parsing (PDF, images), integration with engineering calculators (calls engineering-service as a tool), LLM provider routing (OpenAI, Anthropic, Google), conversation history, context management |
| **Main technologies** | FastAPI, Python 3.12, Pydantic v2, Ruff, MyPy, pytest, Qdrant client, sentence-transformers, OpenAI SDK, Anthropic SDK |
| **Internal dependencies** | Calls `workspace/services/engineering-service` (for calculation tool), stores vectors in Qdrant (via `workspace/docker-compose.yml`) |
| **External dependencies** | OpenAI API, Anthropic API, Google AI API, Qdrant vector database |
| **Used by** | `apps/api` (AI module), end users via web chat interface |
| **Current maturity** | 65% |
| **Missing parts** | No support for local/self-hosted LLMs (Ollama, vLLM), limited agent memory management, no A/B testing framework for prompt versions, no model fallback chaining, no streaming response for web UI, no conversation export, no prompt injection guardrails, no token usage budgeting per workspace |
| **Future roadmap** | Add local LLM support (Ollama), implement agent evaluation framework, add conversation branching and forking, integrate with knowledge management system for RAG source citation, implement feedback loop for response quality |
| **Alpha readiness** | **Yes** — core RAG pipeline, agent orchestration (electrical engineer + document analyst), multi-provider LLM routing, and calculation tool integration are functional. API endpoints registered. |

### Component Architecture

| Module | Responsibility |
|--------|---------------|
| `agents/electrical_engineer/` | Electrical engineering Q&A agent with calculation tool access |
| `agents/document_analyst/` | Document analysis and summarization agent |
| `api/routers/` | REST endpoints for chat, RAG documents, agents |
| `core/` | Base agent class, model router, agent registry |
| `rag/` | Vector store (Qdrant), embedding pipeline, chunker, retriever, file store |
| `tools/` | Document parser, MinIO client, calculation tool bridge |
| `config/` | Application settings, LLM provider configuration |
| `schemas/` | Input/output Pydantic models |

---

## 12. `workspace/services/vision-service` — FastAPI Vision/OCR Service

| Field | Detail |
|-------|--------|
| **Purpose** | Computer vision and OCR pipeline for electrical engineering document processing. Extracts data from nameplates, utility bills, technical drawings, and equipment labels. |
| **Responsibilities** | Multi-engine OCR (Tesseract, EasyOCR, PaddleOCR, Vision LLM), image preprocessing (denoising, deskewing, contrast enhancement, perspective correction), document classification (nameplate vs. bill vs. drawing), structured data extraction (nameplate parameters, bill line items), validation against engineering standards, integration with knowledge management system |
| **Main technologies** | FastAPI, Python 3.12, Pydantic v2, Ruff, MyPy, pytest, Tesseract, EasyOCR, PaddleOCR, Vision LLM (Groq, OpenAI), OpenCV |
| **Internal dependencies** | None (standalone service; called by NestJS API via HTTP) |
| **External dependencies** | Groq API (Vision LLM), OpenAI API (Vision LLM), Tesseract (system), EasyOCR (Python), PaddleOCR (Python) |
| **Used by** | `apps/api` (vision module), end users uploading equipment photos/bills |
| **Current maturity** | 60% |
| **Missing parts** | Limited accuracy on degraded documents, no training pipeline for custom domain models, no batch processing, no real-time streaming, no confidence scoring with human-in-the-loop fallback, no template-based extraction for standard document formats, no Arabic/Farsi OCR optimization |
| **Future roadmap** | Implement active learning loop for extraction accuracy improvement, add dedicated Farsi/Arabic OCR model fine-tuning, create document template library, add human review workflow for low-confidence extractions, implement barcode/QR code parsing |
| **Alpha readiness** | **Yes** — OCR pipeline (4 engines), image preprocessing, document classification, nameplate extraction, bill extraction, and knowledge integration are functional. API endpoints registered and health endpoint returns OK. |

### Pipeline Stages

| Stage | Modules |
|-------|---------|
| `preprocessing/` | Validator, Denoiser, Deskew, Enhancer, Corrector |
| `detection/` | Classifier (document type detection) |
| `ocr/` | Tesseract OCR, EasyOCR, PaddleOCR, Vision LLM |
| `extraction/` | Nameplate parser, Bill parser |
| `validation/` | Engineering rule validation engine |
| `knowledge/` | Integration with knowledge management system |

---

## 13. `infrastructure/docker` — Docker Compose Infrastructure

| Field | Detail |
|-------|--------|
| **Purpose** | Complete Docker Compose-based infrastructure definition for local development (base) and production deployment. Orchestrates all platform services and their dependencies. |
| **Responsibilities** | Containerized deployment of PostgreSQL 17 (with health check), PgBouncer (connection pooling), Redis 8 (with auth and persistence), RabbitMQ 4 (management UI), Engineering Service, Vision Service, AI Service, volume management for persistent data, network isolation (`xennic-network` bridge), health check configuration for all services, resource limits (vision service: 2G memory max) |
| **Main technologies** | Docker Compose V2, PostgreSQL 17, Redis 8, RabbitMQ 4, PgBouncer |
| **Internal dependencies** | `workspace/services/engineering-service`, `workspace/services/vision-service`, `workspace/services/ai-service` (Dockerfile contexts) |
| **Used by** | All platform services depend on the infrastructure defined here |
| **Current maturity** | 85% |
| **Missing parts** | No auto-scaling, no canary deployment support, no blue-green deployment strategy, no container security scanning in CI, no SBOM generation, no sidecar proxy (Envoy/Linkerd) for service mesh |
| **Future roadmap** | Add Kubernetes manifests (matching `infrastructure/kubernetes/`), implement GitOps deployment with ArgoCD, add container vulnerability scanning with Trivy, implement service mesh with mTLS |
| **Alpha readiness** | **Yes** — base stack (Postgres, Redis, RabbitMQ, PgBouncer, engineering-service, vision-service, ai-service) is fully defined with health checks, resource limits, persistent volumes, and network isolation. Production compose file exists with `.env.production.example`. |

### Stack Components

| Service | Image/Context | Port | Health Check |
|---------|---------------|------|--------------|
| postgres | `postgres:17-alpine` | 5432 | pg_isready |
| pgbouncer | `edoburu/pgbouncer:latest` | 6432 | pg_isready via postgres |
| redis | `redis:8-alpine` | 6380 | redis-cli ping |
| rabbitmq | `rabbitmq:4-management` | 5672 / 15672 | rabbitmq-diagnostics ping |
| engineering-service | `Dockerfile` in service dir | 8001 | curl /health |
| vision-service | `Dockerfile` in service dir | 8003 | curl /health |
| ai-service | `Dockerfile` in service dir | 8002 | curl /health |

---

## 14. `infrastructure/monitoring` — Observability Stack

| Field | Detail |
|-------|--------|
| **Purpose** | Complete observability solution with metrics collection, log aggregation, and visualization for the entire platform. |
| **Responsibilities** | Prometheus metrics collection (from all services), Loki log aggregation (via Promtail), Grafana dashboards and alerting, Promtail log shipping from all Docker containers |
| **Main technologies** | Prometheus, Grafana (with provisioning), Loki, Promtail |
| **Internal dependencies** | All services expose `/metrics` or Prometheus-format endpoints |
| **Used by** | Ops team, developers (debugging), SRE/on-call |
| **Current maturity** | 50% |
| **Missing parts** | No pre-configured Grafana dashboards (empty provisioning directory), no alerting rules, no service-level metrics instrumentation in application code, no trace collection (OpenTelemetry), no log retention policies configured, no uptime monitoring |
| **Future roadmap** | Create Grafana dashboards for each service (request rate, error rate, latency, saturation), implement OpenTelemetry tracing across all services, set up Alertmanager with PagerDuty/Slack integration, add synthetic monitoring for critical user journeys |
| **Alpha readiness** | **Yes** — Prometheus, Grafana, Loki, and Promtail configs are present and can be deployed. However, no pre-built dashboards or alerting rules exist. Instrumenting the application code for custom metrics is still in progress. |

### Component Configs

| Component | Config File | Status |
|-----------|-------------|--------|
| Prometheus | `prometheus.yml` | ✅ Present (scrape config defined) |
| Grafana | `provisioning/` | ⚠️ Present but empty (no datasources or dashboards) |
| Loki | `loki.yml` | ✅ Present (basic config) |
| Promtail | `promtail.yml` | ✅ Present (Docker log scraping) |

---

## 15. `infrastructure/nginx` — Reverse Proxy

| Field | Detail |
|-------|--------|
| **Purpose** | Nginx reverse proxy providing TLS termination, HTTP/2 support, and routing to all platform services. |
| **Responsibilities** | SSL/TLS termination (certificates in `ssl/`), reverse proxy to API (`:3000`), Web (`:3001`), Engineering Service (`:8001`), AI Service (`:8002`), Vision Service (`:8003`), static asset serving, WebSocket support (for AI streaming), security headers, rate limiting per upstream |
| **Main technologies** | Nginx, Let's Encrypt / self-signed SSL |
| **Internal dependencies** | All backend services must be running for proxy to function |
| **Used by** | All external traffic enters through Nginx |
| **Current maturity** | 70% |
| **Missing parts** | No automated SSL renewal (certbot/Lego), no CDN integration, no WAF rules (ModSecurity), no HSTS preload config, no OCSP stapling, no HTTP/3 (QUIC) support, no A/B testing routing, no canary routing |
| **Future roadmap** | Automate SSL with certbot + Cloudflare DNS challenge, add ModSecurity WAF, implement blue-green upstream routing, add HTTP/3 support |
| **Alpha readiness** | **Yes** — `nginx.conf` and `conf.d/default.conf` are defined with upstream routing to all services. SSL directory exists for certificate storage. Proxy passes correctly in dev and production configurations. |

---

## 16. `infrastructure/kubernetes` — Placeholder

| Field | Detail |
|-------|--------|
| **Purpose** | Reserved for Kubernetes deployment manifests (planned migration from Docker Compose). |
| **Responsibilities** | None currently — directory is **empty**. |
| **Main technologies** | TBD (likely `kustomize` or Helm) |
| **Internal dependencies** | None |
| **Used by** | Not yet applicable |
| **Current maturity** | 0% |
| **Missing parts** | Complete implementation — no manifests, no Helm charts, no kustomize overlays |
| **Future roadmap** | Create Helm charts for each service, implement canary deployments, GitOps with ArgoCD, horizontal pod autoscaling, on-demand VPA recommendations |
| **Alpha readiness** | **No** — the directory is empty. All container orchestration is handled by Docker Compose (base/production stacks). |

---

## 17. `infrastructure/pgbouncer` — PgBouncer Configuration

| Field | Detail |
|-------|--------|
| **Purpose** | Standalone PgBouncer configuration for connection pooling to PostgreSQL, reducing connection overhead from multiple application instances. |
| **Responsibilities** | Transaction-mode pooling (25 default pool size, 200 max client connections, 50 max DB connections), authentication configuration (`userlist.txt`), idle timeout management |
| **Main technologies** | PgBouncer 1.x |
| **Internal dependencies** | Must point to the PostgreSQL instance |
| **Used by** | All services that connect to PostgreSQL (via PgBouncer port 6432) |
| **Current maturity** | 80% |
| **Missing parts** | No monitoring integration (pgbouncer_exporter for Prometheus), no connection pool metrics exposed, no graceful restart procedure defined, no configuration reload automation |
| **Future roadmap** | Add pgbouncer_exporter sidecar, implement pool metrics dashboard in Grafana, automate config reload on changes |
| **Alpha readiness** | **Yes** — `pgbouncer.ini` and `userlist.txt` are configured and deployed as part of the Docker compose stack. Pool settings are reasonable for alpha scale. |

---

## 18. `infrastructure/backup` — DB Backup & Restore

| Field | Detail |
|-------|--------|
| **Purpose** | PostgreSQL backup and restore automation scripts for disaster recovery and data migration. |
| **Responsibilities** | Full database dump (`backup.sh`), restore from dump (`restore.sh`), backup integrity verification (`verify.sh`), compression of backup artifacts |
| **Main technologies** | Bash, `pg_dump`, `pg_restore`, `gzip` |
| **Internal dependencies** | Must have network access to the PostgreSQL instance |
| **Used by** | Ops team, CI/CD pipeline (potential pre-deployment backup) |
| **Current maturity** | 70% |
| **Missing parts** | No WAL archiving / continuous archiving (PITR), no backup retention policy automation, no encryption at rest for backup files, no off-site backup replication, no backup monitoring/alerting, no schema-only vs. data-only backup differentiation |
| **Future roadmap** | Implement WAL-G for continuous archiving, add encrypted backup to S3-compatible storage, create backup health dashboard, add point-in-time recovery scripts |
| **Alpha readiness** | **Yes** — three scripts exist (backup, restore, verify). Manual backup and restore workflows are functional. Suitable for alpha-stage disaster recovery. |

---

## 19. `prisma/` — Database Schema & Migrations

| Field | Detail |
|-------|--------|
| **Purpose** | Central Prisma schema definition, migration history, and seed data for the entire platform. |
| **Responsibilities** | Declarative schema for all 61 models across 11 domains, versioned migrations (4 applied), database seed script (`seed.js`) with demo data, schema validation (`prisma validate`) |
| **Main technologies** | Prisma 6.19.3, PostgreSQL 17, JavaScript (seed) |
| **Internal dependencies** | Must match the `@prisma/client` version in `packages/database` |
| **Used by** | `packages/database` (Prisma Client generation), `apps/api` (all modules), local development (`db:studio`, `db:reset`) |
| **Current maturity** | 85% |
| **Missing parts** | No seed data for all 61 models (partial coverage), no migration tests in CI, no rollback testing script, no schema linting (e.g., `prisma-lint`), no data migration scripts for production schema changes |
| **Future roadmap** | Complete seed data for marketplace, billing, and AI domains, add automated migration testing in CI, implement schema change review process, add data migration pattern (with revert capability) |
| **Alpha readiness** | **Yes** — 61 models fully defined with proper relations, indexes, UUID keys, and workspace isolation. 4 migrations applied. Seed script creates admin user, workspaces, plans, roles, permissions, categories, topics, disciplines, audiences, and tags. Schema validates clean. |

### Domain Breakdown (61 models)

| Domain | Models | Count |
|--------|--------|-------|
| Identity | `users`, `sessions`, `refresh_tokens`, `password_reset_tokens` | 4 |
| Workspace | `workspaces`, `workspace_members`, `workspace_invitations`, `workspace_settings` | 4 |
| RBAC | `roles`, `permissions`, `role_permissions`, `user_roles` | 4 |
| Subscription | `plans`, `subscriptions`, `usage_logs` | 3 |
| Billing | `invoices`, `payments`, `transactions`, `payment_methods`, `subscription_payments` | 5 |
| Project | `projects`, `project_members`, `project_notes`, `project_reports` | 4 |
| Engineering | `calculations`, `calculation_templates`, `engineering_standards` | 3 |
| AI | `agents`, `conversations`, `messages`, `ai_usage` | 4 |
| Knowledge | `categories`, `topics`, `tags`, `disciplines`, `audiences`, `knowledge`, `knowledge_translations`, `knowledge_taxonomy`, `knowledge_media`, `knowledge_formulas`, `knowledge_examples`, `knowledge_standards`, `knowledge_versions`, `knowledge_comments`, `knowledge_workflows`, `knowledge_workflow_history`, `knowledge_analytics` | 17 |
| Marketplace | `vendors`, `products`, `product_translations`, `orders`, `order_items` | 5 |
| Storage | `files`, `file_versions` | 2 |
| API | `api_keys`, `webhooks` | 2 |
| Notification | `notifications` | 1 |
| Admin | `system_settings`, `feature_flags`, `audit_logs` | 3 |

---

## 20. `scripts/` — Operational Scripts

| Field | Detail |
|-------|--------|
| **Purpose** | Shell scripts and Python utilities for database operations, deployment validation, debugging, and testing workflows. |
| **Responsibilities** | Database migration & seeding (`db-apply.sh`, `db-migrate-dev.sh`, `db-setup.sh`), backup & restore (`db-backup.sh`, `db-restore.sh`), constraint fixing (`db-fix-constraints.sh`), deployment validation (`preflight-check.sh`, `post-deploy-check.sh`), health & security checks (`health-check.sh`, `security-check.sh`, `backup-check.sh`, `restore-check.sh`), load testing (`load-test.sh`), API debugging (`debug-403.sh`, `debug-project.sh`), stack management (`stack-up.sh`, `stack-down.sh`), MinIO setup (`minio-setup.sh`), admin user creation (`make-admin.py`), mock API for testing (`mock-api.py`), dependency setup (`setup-test-deps.sh`), validation tests (`test-full.sh`, `test-engineering.py`) |
| **Main technologies** | Bash, Python 3 |
| **Internal dependencies** | Requires access to the project root, Docker, PostgreSQL, and appropriate `.env` variables |
| **Used by** | Developers (local), DevOps (CI/CD), ops team (deployment) |
| **Current maturity** | 80% |
| **Missing parts** | No script for environment bootstrapping from scratch, no one-liner developer setup script, no Windows compatibility (bash-only), no centralized error handling library |
| **Future roadmap** | Create `bootstrap.sh` that runs all setup steps, add `make` targets as aliases for common workflows, implement self-documentation mode (`--help` on all scripts) |
| **Alpha readiness** | **Yes** — all 23 scripts are functional, most have `--help` and `--json` modes. CI/CD uses `post-deploy-check.sh`. Database lifecycle scripts are mature and production-proven. |

### Script Inventory

| Script | Category | Purpose |
|--------|----------|---------|
| `db-apply.sh` | Database | Apply migrations, generate client, run seed |
| `db-backup.sh` | Database | Full database dump with timestamp |
| `db-fix-constraints.sh` | Database | Fix foreign key constraint issues |
| `db-migrate-dev.sh` | Database | Development migration workflow |
| `db-restore.sh` | Database | Restore database from backup |
| `db-setup.sh` | Database | Full database bootstrap (create, migrate, seed) |
| `debug-403.sh` | Debugging | Debug 403 Forbidden errors |
| `debug-project.sh` | Debugging | Project-wide debugging utility |
| `deployment/preflight-check.sh` | Deployment | Pre-deployment VPS readiness check (10 checks) |
| `deployment/post-deploy-check.sh` | Deployment | Post-deployment service health validation (HTTP + Docker) |
| `validation/health-check.sh` | Validation | Health check runner |
| `validation/security-check.sh` | Validation | Security posture check |
| `validation/backup-check.sh` | Validation | Backup integrity verification |
| `validation/restore-check.sh` | Validation | Restore process validation |
| `validation/load-test.sh` | Validation | Basic load testing |
| `make-admin.py` | Utility | Create admin user (Python script) |
| `minio-setup.sh` | Utility | MinIO bucket and policy setup |
| `mock-api.py` | Utility | Mock API server for testing |
| `setup-test-deps.sh` | Utility | Install test dependencies |
| `stack-up.sh` | Utility | Start full platform stack |
| `stack-down.sh` | Utility | Stop full platform stack |
| `test-full.sh` | Testing | Full test suite runner |
| `test-engineering.py` | Testing | Engineering calculator integration tests |

---

## 21. `docs/` — Documentation

| Field | Detail |
|-------|--------|
| **Purpose** | Complete documentation suite covering architecture, API references, deployment guides, runbooks, security policies, specifications, and project management. |
| **Responsibilities** | Architecture documentation, API documentation (supplementing Swagger), deployment guides (VPS, Docker, production), development setup guides, DevOps procedures, runbooks for incident response, security policies and hardening guides, specifications (engineering, system), testing guides, user guides, monitoring/observability guides, roadmap and project planning documents |
| **Main technologies** | Markdown, Mermaid (diagrams) |
| **Internal dependencies** | References across directories |
| **Used by** | All team members, stakeholders, external contributors |
| **Current maturity** | 85% |
| **Missing parts** | Some sections are sparse or outdated, no automated spell checking/grammar checking, no broken link checker in CI, no documentation review process, no versioned docs for releases |
| **Future roadmap** | Implement Docusaurus or VitePress for hosted documentation portal, add automated link checking in CI, create release-specific documentation versions, implement documentation review workflow |
| **Alpha readiness** | **Yes** — 276 files across 38 subdirectories, 51,189 lines of documentation. Covers all major areas. Architecture, API, deployment, security, and runbook docs are particularly comprehensive. |

### Directory Structure

| Directory | Focus |
|-----------|-------|
| `ai/` | AI service architecture and agent documentation |
| `api/` | API endpoint reference and integration guides |
| `architecture/` | System architecture, C4 diagrams, decision records |
| `backend/` | Backend service documentation |
| `database/` | Database schema, migration guides, ERDs |
| `decisions/` | Architecture Decision Records (ADRs) |
| `deployment/` | Deployment guides and infrastructure setup |
| `development/` | Development environment setup and conventions |
| `devops/` | CI/CD, Docker, monitoring setup |
| `diagrams/` | Mermaid and other diagrams |
| `engineering/` | Engineering calculation methodology docs |
| `frontend/` | Frontend component and feature documentation |
| `infrastructure/` | Infrastructure architecture |
| `knowledge/` | Knowledge management system documentation |
| `monitoring/` | Monitoring and observability setup |
| `operations/` | Operational procedures |
| `product/` | Product requirements and feature specs |
| `project-management/` | Project tracking, sprint docs |
| `project/` | Project-level documentation (this file) |
| `reference/` | Reference materials |
| `releases/` | Release notes and changelogs |
| `roadmap/` | Product and technical roadmaps |
| `runbooks/` | Incident response and operational runbooks |
| `security/` | Security policies, audit reports, hardening guides |
| `services/` | Microservice-specific documentation |
| `specifications/` | Technical specifications |
| `standards/` | Coding standards and conventions |
| `storage/` | File storage and MinIO documentation |
| `templates/` | Document templates |
| `testing/` | Testing strategy and guides |
| `user/` | End-user documentation |

---

## 22. `.github/workflows/` — CI/CD Pipeline

| Field | Detail |
|-------|--------|
| **Purpose** | GitHub Actions workflows for continuous integration (CI) and continuous deployment (CD) of the entire platform. |
| **Responsibilities** | **CI (5 jobs):** lint (Prettier check + ESLint), typecheck (TypeScript strict — builds dependencies first), test-node (Jest tests with ephemeral PostgreSQL 17 service container), test-python (Ruff + MyPy + pytest with coverage for engineering-service and ai-service), docker-build (build check for 5 Docker images: api, web, engineering-service, vision-service, ai-service). **CD (1 job):** Build & Push all 5 Docker images to GHCR, then SSH deploy onto production VPS with `docker compose pull && up -d`. |
| **Main technologies** | GitHub Actions, Docker Build Push Action v6, appleboy/ssh-action v1 |
| **Internal dependencies** | Requires Docker, pnpm 10, Node 22, Python 3.12 |
| **Used by** | All developers (CI runs on push/PR to main/develop), production (CD runs on push to main) |
| **Current maturity** | 80% |
| **Missing parts** | No deployment to staging environment before production, no approval gate for CD, no integration tests with full stack, no security scanning (Trivy, CodeQL, Dependabot), no artifact caching optimization, no matrix testing for Node/Python versions, no notification on failure (Slack/email) |
| **Future roadmap** | Add staging deployment with smoke tests, implement security scanning (CodeQL + Trivy + Dependabot), add deployment approval gates, implement failure notifications, add performance regression testing |
| **Alpha readiness** | **Yes** — CI runs lint, typecheck, tests (Node + Python), and Docker build checks. CD builds all 5 images, pushes to GHCR, and deploys via SSH. Concurrency cancellation on repeated pushes. Pipeline is production-proven. |

### CI Jobs

| Job | Trigger | Dependencies | Key Actions |
|-----|---------|--------------|-------------|
| `lint` | push/PR to main/develop | None | Prettier check, ESLint |
| `typecheck` | push/PR to main/develop | None (builds deps) | tsc --noEmit on all TS packages |
| `test-node` | push/PR to main/develop | None (builds deps) | Jest with ephemeral Postgres 17 |
| `test-python` | push/PR to main/develop | None | Ruff + MyPy + pytest + coverage (engineering, ai) |
| `docker-build` | push/PR to main/develop | None | Build 5 Docker images (no push) |

### CD Job

| Job | Trigger | Steps |
|-----|---------|-------|
| `deploy` | push to main (or `v*.*.*` tag) | Login to GHCR → Build & Push 5 images → SSH deploy (`docker compose pull && up -d && image prune`) |

---

## 23. `tools/` — Placeholder

| Field | Detail |
|-------|--------|
| **Purpose** | Reserved for future development tools, code generators, scaffolding scripts, and migration utilities. |
| **Responsibilities** | None currently — `tools/scripts/` is **empty**. |
| **Main technologies** | TBD |
| **Internal dependencies** | None |
| **Used by** | Not yet applicable |
| **Current maturity** | 0% |
| **Missing parts** | Complete implementation — no tools, no scripts, no generators |
| **Future roadmap** | Add code generators for new NestJS modules (scaffold with CRUD), database migration helpers, OpenAPI client generator wrappers, dev workflow automation scripts |
| **Alpha readiness** | **No** — directory is empty. No tools or scripts are present. |

---

## 24. Summary Matrix

| Directory | Maturity | Alpha Ready | Lines (approx.) | Key Tech | Dependencies |
|-----------|----------|-------------|-----------------|----------|-------------|
| `apps/api` | 70% | ✅ Yes | ~15,000 | NestJS 11, Fastify 5, Prisma, TS 6 | database, shared, types |
| `apps/web` | 60% | ✅ Yes | ~20,000 | Next 15, React 19, Tailwind 4, Radix | types |
| `packages/config` | 90% | ✅ Yes | ~500 | TS 6, Prettier | none |
| `packages/database` | 85% | ✅ Yes | ~700 | Prisma 6, TS 6 | none |
| `packages/openapi` | 80% | ✅ Yes | ~10,000 (generated) | OpenAPI 3.0 | apps/api (build) |
| `packages/shared` | 75% | ✅ Yes | ~1,500 | TS 6 | none |
| `packages/types` | 70% | ✅ Yes | ~500 | TS 6 | none |
| `services/api-gateway` | 0% | ❌ No | 0 | — | — |
| `workspace/services/engineering-service` | 75% | ✅ Yes | ~8,000 | FastAPI, Python 3.12 | none |
| `workspace/services/ai-service` | 65% | ✅ Yes | ~3,000 | FastAPI, Python 3.12 | engineering-service (runtime) |
| `workspace/services/vision-service` | 60% | ✅ Yes | ~2,500 | FastAPI, Python 3.12 | none |
| `infrastructure/docker` | 85% | ✅ Yes | ~500 | Docker Compose V2 | All services |
| `infrastructure/monitoring` | 50% | ✅ Yes | ~200 | Prometheus, Grafana, Loki | All services |
| `infrastructure/nginx` | 70% | ✅ Yes | ~300 | Nginx | All services |
| `infrastructure/kubernetes` | 0% | ❌ No | 0 | — | — |
| `infrastructure/pgbouncer` | 80% | ✅ Yes | ~50 | PgBouncer | postgres |
| `infrastructure/backup` | 70% | ✅ Yes | ~300 | Bash, pg_dump | postgres |
| `prisma/` | 85% | ✅ Yes | ~1,200 | Prisma 6, PG 17 | database |
| `scripts/` | 80% | ✅ Yes | ~3,500 | Bash, Python 3 | Various |
| `docs/` | 85% | ✅ Yes | 51,189 lines/276 files | Markdown, Mermaid | — |
| `.github/workflows/` | 80% | ✅ Yes | ~400 | GitHub Actions | All services |
| `tools/` | 0% | ❌ No | 0 | — | — |

---

*Generated 2026-06-26. 22 directories cataloged. 17/22 alpha-ready (77%). 2/22 empty placeholders. 0/22 orphaned.*
