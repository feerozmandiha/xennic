# Xennic Platform — Executive Summary

**Version**: 1.0.0 | **Date**: Tir 1405 (June 2026) | **Audience**: CTO, Engineering Leadership | **Status**: Active

---

## Table of Contents

1. [Project Vision](#1-project-vision)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Knowledge Architecture](#4-knowledge-architecture)
5. [AI Architecture](#5-ai-architecture)
6. [Runtime & Deployment](#6-runtime--deployment)
7. [Current Status](#7-current-status)
8. [Top Risks](#8-top-risks)
9. [Roadmap](#9-roadmap)
10. [Key Decisions & Trade-offs](#10-key-decisions--trade-offs)

---

## 1. Project Vision

Xennic is an engineering knowledge platform for electrical engineers. It combines six core capabilities into a single multi-tenant platform:

| Capability | Description | Status |
|-----------|-------------|--------|
| **Engineering Calculations** | 40+ deterministic calculation types (cable sizing, short-circuit, load flow, protection coordination, lighting, earthing, etc.) | ✅ Backend complete, frontend 80% |
| **AI-Powered Assistant** | LLM-based chat with engineering context, RAG over knowledge base | 🔄 Core complete, RAG partial |
| **Knowledge Management** | Standards library, manufacturer catalogs, tariff databases, technical manuals | ⏳ Platform designed, 0% implemented |
| **Vision/OCR Processing** | Document digitization, drawing analysis, specification extraction | ✅ OCR pipeline, 🔄 vision analysis |
| **Marketplace** | Engineering product discovery, procurement, vendor management | 🔄 In development |
| **Multi-Tenant Collaboration** | Workspaces, RBAC, project sharing, audit logging | ✅ Core complete |

**Target Market**: Iranian and MENA electrical engineering firms (consultants, contractors, utilities, manufacturers).

**Business Model**: SaaS — tiered subscription per workspace. Marketplace transaction fee.

---

## 2. Architecture Overview

### Repository Structure

Monorepo managed with **pnpm** (v10.x) and **Turborepo**:

```
xennic/
├── apps/
│   ├── api/          # NestJS backend (Fastify adapter, port 3000)
│   └── web/          # Next.js 15 frontend (port 3001, bilingual FA/EN)
├── packages/
│   ├── config/       # Shared ESLint, TypeScript, Prettier configs
│   ├── database/     # Prisma client, tenant extension, repositories
│   ├── shared/       # Shared utilities, types, validation schemas
│   ├── types/        # TypeScript interfaces and enums
│   └── openapi/      # Auto-generated OpenAPI specification
├── services/
│   └── api-gateway/  # Placeholder (empty)
├── workspace/
│   └── services/
│       ├── engineering-service/  # FastAPI, port 8001
│       ├── ai-service/           # FastAPI, port 8002
│       └── vision-service/       # FastAPI, port 8003
├── infrastructure/
│   └── docker/       # Docker Compose, Dockerfiles, secrets
├── monitoring/       # Prometheus, Grafana, Loki, Promtail configs
├── scripts/          # Backup, validation, deployment scripts
└── docs/             # Full documentation (283 files)
```

### Backend Architecture (NestJS)

24 modules across 5 tiers, exposing 180+ endpoints:

| Tier | Modules | Status |
|------|---------|--------|
| **Core** | Auth, User, Workspace, Project | ✅ Stable |
| **Engineering** | Calculation, Formula, Unit, Cable, Protection, Earthing, Lighting, LoadFlow, ShortCircuit | ✅ Stable |
| **Knowledge** | Document, Standard, Catalog, Tariff, Manufacturer | 🔄 Partial |
| **Commerce** | Subscription, Marketplace, Consultation, Invoice | 🔄 Partial |
| **Infrastructure** | Health, Storage, Notification, Search, Audit | ✅ Stable |

**Key design decisions:**
- Fastify adapter (not Express) for ~2x throughput
- Unified response envelope: `{success, data, meta}` / `{success, error}`
- Global validation pipe: `whitelist: true`, `forbidNonWhitelisted: true`
- Multi-tenancy via `workspace_id` column on every entity, enforced by Prisma middleware
- Rate limiting: Redis-based sliding window (short 10/10s, medium 100/60s, long 1000/1h)

### Frontend Architecture (Next.js 15)

40+ pages, bilingual (FA/EN) via next-intl:

- **App Router** with server components where possible
- **Tailwind CSS v4** for styling
- **React 19** with Server Actions for form mutations
- API proxy via `next.config.js` rewrites to NestJS at `localhost:3000`
- Standalone output mode for Docker deployment

### Data Layer

**PostgreSQL 17** with **Prisma ORM** (v6.19) — 61 models:

```
workspace ──┬── user ──── member
            ├── project ──── calculation ──── calculation_result
            ├── document ──── document_version
            ├── standard ──── standard_clause
            ├── catalog ──── product
            ├── tariff ──── tariff_rate
            ├── subscription ──── invoice
            ├── consultation ──── message
            └── audit_log
```

All entity IDs are UUIDs. Multi-tenancy via `workspace_id` on every root entity.

### Storage & Messaging

| Service | Role | Configuration |
|---------|------|---------------|
| **Redis 8** | Cache, session store, rate limiting | Configured |
| **RabbitMQ 4** | Event bus, async job processing | Configured |
| **MinIO** | Object storage (S3-compatible) | 5 buckets, lifecycle policies, IAM policies, versioning |
| **Qdrant** | Vector DB for RAG embeddings | In workspace Docker Compose |

### Nginx

Reverse proxy with rate limiting, SSL termination, and static asset serving. Configured in production Docker Compose.

---

## 3. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 22.x LTS |
| Runtime | Python | 3.12 |
| Language | TypeScript | 5.8 |
| Language | Python | 3.12 |
| Backend Framework | NestJS (Fastify) | Latest |
| Frontend Framework | Next.js | 15.x |
| Frontend Library | React | 19.x |
| Styling | Tailwind CSS | v4 |
| ORM | Prisma | 6.19 |
| Database | PostgreSQL | 17 |
| Cache | Redis | 8 |
| Message Broker | RabbitMQ | 4 |
| Object Storage | MinIO | Latest |
| Vector DB | Qdrant | Latest |
| Python Backend | FastAPI | Latest |
| Reverse Proxy | Nginx | Latest |
| Monitoring | Prometheus + Grafana + Loki | Latest |
| CI/CD | GitHub Actions → GHCR | — |
| Containerization | Docker Compose | v2 |

---

## 4. Knowledge Architecture

The knowledge platform is the differentiating moat — a structured engineering knowledge base that powers calculations, AI reasoning, and standards compliance. **88 documentation files, 17,000+ lines** across 6 domains:

### Domains

| Domain | Status | Files | Lines | Purpose |
|--------|--------|-------|-------|---------|
| **Governance** | Published | 7 | 1,065 | Metadata, taxonomy, ontology, naming conventions, quality gates, source hierarchy |
| **Concepts** | Draft | 8 | 3,385 | Concept model, entity definitions, relations, lifecycle management |
| **Semantics** | Draft | 10 | 3,376 | Vocabulary, synonyms, bilingual (FA/EN) lexicon, unit normalization |
| **Runtime** | Draft | 25 | 4,388 | Acquisition pipeline architecture — 26 files detailing ingestion, validation, storage |
| **Reasoning** | Draft | 28 | 3,049 | AI reasoning engine design — inference pipelines, rule engines, conflict resolution |
| **AI Intelligence** | Draft | 6 | 1,352 | Confidence scoring, evidence chains, hallucination prevention, traceability |

### Key Components (Designed, Not Yet Implemented)

- **Acquisition Pipeline**: Crawl → validate → classify → store → index
- **Reasoning Engine**: Query → decompose → retrieve → reason → verify → respond (11-stage pipeline)
- **Bilingual Lexicon**: FA ↔ EN term mapping across all electrical engineering domains
- **Source Hierarchy**: Standard → clause → interpretation → example

**Current implementation status: 0%** — the knowledge platform is fully specified but none of the above has been coded. The Prisma schema includes knowledge-related models, and the backend has a Knowledge module with CRUD endpoints, but the acquisition, reasoning, and semantic layers are undefined.

---

## 5. AI Architecture

Three Python microservices, each independently deployable:

### Tier 1: Engineering Service (Port 8001)

Deterministic engineering calculations — **no LLM involved**.

```
Request → Validate inputs → Select formula → Compute → Validate output → Return result
```

- Built with **FastAPI**
- 40+ calculation types (transmission line, cable sizing, short circuit, load flow, protection coordination, grounding, lighting, etc.)
- Each calculation is a pure function with typed inputs/outputs
- Test coverage: moderate

### Tier 2: AI Service (Port 8002)

LLM-powered chat and reasoning with engineering context.

```
Request → Build prompt → Retrieve context (RAG) → LLM inference → Validate → Return
```

- Integrates with external LLM providers
- RAG pipeline uses Qdrant for vector similarity search over engineering documents
- Context window management, prompt templating, response validation
- Hallucination prevention via evidence chains (designed, partial implementation)
- Test coverage: low

### Tier 3: Vision Service (Port 8003)

OCR and document analysis for digitizing paper-based engineering artifacts.

```
Upload → Preprocess → OCR → Postprocess → Classify → Extract structured data → Return
```

- OCR engine integration (Tesseract + custom models)
- Drawing/blueprint analysis
- Specification extraction and structured output
- Test coverage: low

### Future: Reasoning Runtime

An 11-stage pipeline designed for complex engineering reasoning:

1. Query Parsing → 2. Intent Classification → 3. Context Assembly → 4. Knowledge Retrieval → 5. Evidence Gathering → 6. Reasoning → 7. Verification → 8. Confidence Scoring → 9. Response Generation → 10. Validation → 11. Delivery

Not yet implemented.

---

## 6. Runtime & Deployment

### Containerization

Docker Compose with 15 services orchestrated:

| Service | Dockerfile | Multi-Stage | Non-Root | HEALTHCHECK |
|---------|-----------|-------------|----------|-------------|
| NestJS API | ✅ | ✅ | ✅ | ✅ |
| Next.js Web | ✅ | ✅ | ✅ | ✅ |
| Engineering Service | ✅ | ✅ | ✅ | ✅ |
| AI Service | ✅ | ✅ | ✅ | ✅ |
| Vision Service | ✅ | ✅ | ✅ | ✅ |
| PostgreSQL 17 | Official image | — | ✅ | ✅ |
| PgBouncer | Official image | — | ✅ | ✅ |
| Redis 8 | Official image | — | ✅ | ✅ |
| RabbitMQ 4 | Official image | — | ✅ | ✅ |
| MinIO | Official image | — | ✅ | ✅ |
| Nginx | Official image | — | ✅ | ✅ |
| Prometheus | Official image | — | ✅ | ✅ |
| Grafana | Official image | — | ✅ | ✅ |
| Loki | Official image | — | ✅ | ✅ |
| Promtail | Official image | — | ✅ | ✅ |

All services use `depends_on` with `condition: service_healthy`, network isolation (bridge driver), restart policy `unless-stopped`.

### CI/CD

- **Build**: GitHub Actions → GHCR (Docker images)
- **Deploy**: SSH into VPS, pull images, `docker compose up`
- **Validation scripts**: health check (`health-check.sh`), backup (`backup.sh`), restore (`restore.sh`), load test (`load-test.sh`), security scan (`security-check.sh`)

### Monitoring

| Component | Role |
|-----------|------|
| **Prometheus** | Metrics collection, alerting rules |
| **Grafana** | Dashboards (provisioned, dashboards pending) |
| **Loki + Promtail** | Log aggregation |
| **postgres-exporter** | Configured in prometheus.yml but container not deployed |
| **redis-exporter** | Same — configured, not deployed |

**Known issue**: Monitoring exporters are configured but not running. Prometheus logs scrape errors.

### Backup

- `pg_dump` with integrity verification
- 30-day retention
- Script uses `DATABASE_URL` from root `.env` (no fallback — risk if .env is missing)

---

## 7. Current Status

### Architecture Maturity Score: **58/100**

Composite score across 9 categories (from Alpha Readiness Audit):

| Category | Score | Weight | Assessment |
|----------|-------|--------|------------|
| Repository Analysis | 60/100 | 5% | 🟡 Fair |
| Infrastructure Readiness | 78/100 | 15% | 🟢 Good |
| Security Review | 84/100 | 25% | 🟢 Good |
| Database Readiness | 76/100 | 15% | 🟢 Good |
| Storage Readiness | 65/100 | 5% | 🟡 Fair |
| AI Services | 50/100 | 10% | 🟡 Fair |
| Observability | 75/100 | 10% | 🟢 Good |
| Deployment Readiness | 82/100 | 10% | 🟢 Good |
| Performance | 65/100 | 5% | 🟡 Fair |

**Strongest areas**: Security (84), Deployment Readiness (82), Infrastructure (78), Database (76), Observability (75)

**Weakest areas**: AI Services (50), Repository Analysis (60), Storage (65), Performance (65)

### Testing

- **Total tests**: 212 across 14 test suites
- **Statement coverage**: ~18.2% (target: 70%)
- **Frontend tests**: 0 — `apps/web/` test script is `echo "No web tests yet"`
- **Backend coverage**: ~30% (uneven — some modules well-tested, others untested)
- **Python services**: Minimal coverage

### Implementation Progress: ~45%

| Area | Completion |
|------|-----------|
| Backend (NestJS modules) | ~85% |
| Frontend (Next.js pages) | ~75% |
| Database schema | ~90% |
| AI (LLM + RAG + OCR) | ~60% (RAG partial) |
| Engineering Engine | ~80% |
| Infrastructure/Docker | ~70% |
| Testing | ~30% |
| Production readiness | ~40% |
| Knowledge Platform | ~0% |
| Marketplace | ~30% |

### Documentation

- **276 files, 51,189 lines** across the repository
- Knowledge documentation: 88 files, 17,000+ lines
- Status: 95% documented (though knowledge content is Draft quality)
- **Known issue**: 32 files in `xennic-docs/` diverged from main `docs/`

### Components Count

| Component | Count |
|-----------|-------|
| NestJS modules | 24 |
| API endpoints | 180+ |
| Next.js pages | 40+ |
| Prisma models | 61 |
| Docker services | 15 |
| Python microservices | 3 |
| Calculation types | 40+ |

### Alpha Readiness

- **Score**: 74/100 (Sprint A5)
- **Risk Level**: 🟡 Medium
- **Recommendation**: CONDITIONAL GO
- **Blocking items resolved**: All 5 critical technical debt items from Sprint A4

---

## 8. Top Risks

### R-001: Missing NestJS Critical Dependencies
`@nestjs/jwt` and `@nestjs/passport` are used in source code but missing from `apps/api/package.json`. **Build breaks**. Effort to fix: 1h. Severity: Critical.

### R-002: Web Docker Build Fails
`apps/web/Dockerfile` times out due to slow npm registry. **Production deployment blocked**. Effort: 4h. Severity: Critical.

### R-003: Zero Frontend Tests
Apps/web test script is `echo "No web tests yet"`. **60+ components, 40+ pages — zero automated verification**. Effort: 60h. Severity: High.

### R-004: jspdf CVE in Lockfile
Known vulnerability in jspdf dependency. Override in place but still in `pnpm-lock.yaml`. **Supply chain risk**. Effort: 2h. Severity: High.

### R-005: Billing/Subscription Not Implemented
Subscription module schema exists but billing integration (payment gateway, invoicing) is absent. **No revenue path in MVP**. Severity: High.

### R-006: API Gateway Placeholder
`services/api-gateway/` is empty. **No unified ingress or service mesh**. All services route through Nginx directly. Severity: Medium.

### R-007: Knowledge Platform — 0% Implementation
The differentiating feature — structured engineering knowledge — is fully designed but entirely unimplemented. **Core value proposition not yet delivered**. Severity: High.

### R-008: Self-Signed SSL Certificate
Nginx uses self-signed cert. **Browsers will show security warning**. Acceptable for alpha, must resolve for beta. Severity: Medium.

### R-009: Weak Dev Credentials
Postgres `xennic123`, RabbitMQ `guest/guest`, Grafana `admin/admin` in `.env`. **Acceptable for local dev only**. Effort: 1h. Severity: Medium.

### R-010: PostgreSQL UUID → TEXT Migration
All PK/FK columns changed from UUID to TEXT in migration #2. **Loses type validation and index efficiency**. Effort: 8h to fix. Severity: Medium.

---

## 9. Roadmap

### Pre-Alpha (Current — Tir 1405 / June 2026)
- Fix critical technical debt (R-001, R-002, R-004)
- Establish test baseline, begin coverage improvements
- Complete subscription/billing design
- Resolve web Docker build timeout
- Finalize MVP feature set

### Alpha (Q3 2026 — Mehr–Azar 1405)
- Private beta with 10–20 engineering firms
- Complete RAG pipeline and AI reasoning
- Knowledge platform MVP (acquisition → search)
- Marketplace MVP (listing → checkout)
- 40%+ test coverage
- Production deployment on VPS
- SSL certificate (Let's Encrypt)
- Monitoring dashboards provisioned

### Beta (Q4 2026 — Day–Esfand 1405)
- Public beta release
- Full knowledge platform integration (acquisition + reasoning)
- Billing/subscription live
- API Gateway implementation
- Performance optimization and load testing
- 60%+ test coverage
- Multi-region DR design

### Production (Q1 2027 — Farvardin–Khordad 1406)
- GA release
- SLA definition and monitoring
- Compliance certification
- 70%+ test coverage
- Production-grade secrets management
- Full observability with alerting
- Knowledge platform at 100%

---

## 10. Key Decisions & Trade-offs

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **Monorepo with pnpm + Turborepo** | Shared tooling, unified versioning, parallel builds | Larger clone size, CI complexity |
| **NestJS + Fastify (not Express)** | ~2x throughput, better async handling | Smaller ecosystem, fewer examples |
| **PostgreSQL + Prisma (not NoSQL)** | Relational integrity for engineering data, type-safe queries | Migration complexity, scaling ceiling |
| **Python for AI services (not TypeScript)** | Ecosystem maturity (PyTorch, Tesseract, LangChain) | Language boundary, serialization overhead |
| **MinIO (not cloud S3)** | Self-hosted, no vendor lock-in, data sovereignty | Operational overhead |
| **Qdrant (not Pinecone/Weaviate)** | Self-hosted, open-source, no API cost | Operational overhead |
| **Bilingual FA/EN from day one** | Target market requires Farsi UI, knowledge is in English | 2x UI/UX effort, i18n complexity |
| **Multi-tenant shared DB (not siloed)** | Lower operational cost, simpler management | Cross-tenant isolation must be perfect |
| **Docker Compose (not Kubernetes)** | Simpler for current scale, team size | Scaling ceiling, manual rollouts |

---

## Appendix A: Sprint Performance History

| Sprint | Score | Key Achievement |
|--------|-------|-----------------|
| A3 | 72/100 | Baseline audit |
| A4 | 72/100 | MinIO integration, backup scripts |
| **A5** | **74/100** | **Security fixes, observability complete, alpha release candidate** |

## Appendix B: Quick Reference — Key Contacts

| Role | Responsibility |
|------|---------------|
| Backend Team | NestJS API, Prisma, PostgreSQL |
| Frontend Team | Next.js web app, i18n, Tailwind |
| AI Team | Engineering, AI, Vision Python services |
| DevOps | Docker, CI/CD, monitoring, deployment |
| Documentation Governor | Knowledge architecture, docs quality |

---

*End of Executive Summary — For details, see referenced documents in `docs/project/` and `docs/knowledge/`.*
