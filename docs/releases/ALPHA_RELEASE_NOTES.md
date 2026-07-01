# Alpha Release Notes — Xennic Platform v0.5.0-alpha

**Version**: v0.5.0-alpha  
**Release Date**: Tir 1405 (June 2026)  
**Codename**: "Shiraz"  

---

## Overview

The Xennic Platform Alpha release marks the first integrated milestone of a multi-tenant engineering intelligence platform purpose-built for electrical power engineers. This release brings together five backend services, a modern web frontend, a containerized infrastructure stack, and a comprehensive monitoring observability suite into a single deployable system.

Alpha represents the transition from prototype-construction to a production-adjacent state: all core feature modules are implemented and functional, the deployment pipeline is automated via Docker Compose, and observability is fully wired through Prometheus, Grafana, and Loki. At a production readiness score of **72/100**, the platform is conditionally ready for limited production workloads pending completion of the remaining test-coverage and VPS-deployment items documented in the known-issues section.

---

## What's Included

### Services (5)

| Service | Language/Framework | Port | Purpose |
|---------|-------------------|------|---------|
| **NestJS API** | TypeScript, Fastify | 3000 | Core REST API — auth, workspace, RBAC, project management, billing, marketplace |
| **Next.js Web** | TypeScript, React | 3001 | Internationalized (i18n) user interface |
| **Engineering Service** | Python, FastAPI, pandapower | 8001 | Electrical engineering calculation engine |
| **AI Service** | Python, FastAPI, LangChain | 8002 | LLM gateway, RAG pipeline, embedding generation |
| **Vision Service** | Python, FastAPI, OpenCV, Tesseract | 8003 | OCR, document analysis, image processing |

### Infrastructure

| Component | Technology | Role |
|-----------|-----------|------|
| Database | PostgreSQL 17 | Primary data store |
| Connection Pool | PgBouncer | Transaction pooling for PostgreSQL |
| Cache | Redis 8 | Session cache, rate limiting, job queues |
| Message Queue | RabbitMQ 4 | Async job processing, event bus |
| Object Storage | MinIO | S3-compatible file storage |
| Reverse Proxy | Nginx | TLS termination, rate limiting, static serving |
| Monitoring | Prometheus + Grafana + Loki + Promtail | Metrics, dashboards, log aggregation |
| Vector DB | Qdrant | Embedding storage for RAG |

### Docker Compose Stack

All services and infrastructure components are orchestrated through a production-grade Docker Compose configuration at `infrastructure/docker/compose/production/`, supporting the full lifecycle with health checks, restart policies, network isolation, and volume management.

---

## Key Features by Module

### Auth & Identity

- Multi-factor authentication with Argon2id password hashing
- JWT-based session management (RS256, 15-min access token, 30-day refresh)
- Token rotation with jti claim for replay detection
- IP + email-based brute force protection via AuthThrottlerGuard
- Password reset flow with secure tokens

### Workspace & Multi-Tenancy

- Workspace-scoped isolation for all entities
- Workspace-level membership and role assignment
- Feature flags per workspace

### RBAC & Authorization

- 12 roles with 136 granular permissions
- ABAC (Attribute-Based Access Control) for workspace-level policies
- AdminGuard for administrative endpoints
- AuthorizationService with permission-checking middleware

### Project Management

- Full CRUD for projects within workspace context
- Team collaboration with multi-member support
- Project lifecycle management (draft, active, archived)

### Engineering Calculations

| Calculator Category | Calculators | Status |
|--------------------|------------|--------|
| Basic Electrical | Ohm's Law, Active/Apparent/Reactive Power, Power Factor | ✅ |
| Cable Sizing | Ampacity, Voltage Drop, Short Circuit Withstand, PE Sizing | ✅ |
| Transformer | Sizing, Losses, Regulation, K-Factor | ✅ |
| Protection | MCCB Selection, Relay Coordination | ✅ |
| Power Quality | THD, TDD, IEEE-519 Compliance | 🚧 |
| Solar Engineering | PV Sizing, String Design, Yield Estimation | 🚧 |
| Earthing | Grid Design, Resistance Calculation | 🚧 |
| Lighting | Lux Calculation, Uniformity | 🚧 |
| Power Systems | Load Flow, Short Circuit Studies | 🚧 |
| Arc Flash | Incident Energy, Boundary Calculation | 🚧 |

### AI & LLM

- Multi-provider LLM gateway (Groq, OpenAI, Anthropic, Google)
- RAG pipeline with Qdrant vector store
- Embedding generation (all-MiniLM-L6-v2, 384-dim)
- Context-aware engineering Q&A
- Streaming responses via Server-Sent Events

### Vision & OCR

- 3-pass OCR pipeline (default Tesseract, PSM, custom)
- EasyOCR support for Persian/Arabic text
- Document diagram detection with OpenCV
- Hybrid OCR engine mode configuration
- GPU-accelerated inference with CPU fallback

### Knowledge Base

- Vector-based document storage and retrieval
- Automatic document indexing and chunking
- Semantic search with hybrid dense-sparse retrieval
- CRUD for knowledge entries within workspace

### Billing & Subscription

- 3 subscription plans (Free, Professional, Enterprise)
- Zarinpal payment gateway integration
- Plan-based access control
- Usage tracking and limits enforcement

### Marketplace

- Engineering content marketplace
- Calculation template sharing
- Digital asset store (coming in v0.6.0)

---

## Known Limitations

| Area | Limitation | Workaround |
|------|-----------|------------|
| **Test Coverage** | Overall coverage ~18% (target: >70%) | Manual smoke tests required before each deploy |
| **Deployment** | VPS production environment not yet deployed | Current deployment is Docker Compose on single host |
| **Storage** | MinIO configured but not battle-tested under production load | Monitor disk usage and backup frequency |
| **AI Caching** | No LLM response caching mechanism | Repeated queries hit provider APIs each time |
| **OCR Accuracy** | Tesseract Persian accuracy ~85% | Use EasyOCR engine for Persian documents |
| **CDN** | No CDN for static assets | Static assets are served directly from Nginx |
| **TLS** | No production TLS certificates configured | Use self-signed certs for internal testing |
| **Rate Limiting** | Not configured at Nginx level | Application-level throttling is active |
| **SMTP** | Not configured for production email | Use console transport for development |
| **Webhooks** | Retry mechanism not implemented | Failed webhooks are lost after first attempt |
| **API Docs** | No versioned API documentation | Current docs reflect latest schema |
| **Rollback** | No automated rollback procedure | Manual rollback via Docker Compose version tags |

---

## Installation / Upgrade Notes

### Fresh Install

```bash
# 1. Clone repository
git clone git@github.com:anomalyco/xennic.git
cd xennic

# 2. Configure environment
cp infrastructure/docker/compose/production/.env.production.template .env
# Edit .env with production values (passwords, API keys, etc.)

# 3. Generate JWT keys
mkdir -p infrastructure/secrets
ssh-keygen -t rsa -b 4096 -m PEM -f infrastructure/secrets/jwtRS256.key -N ""
openssl rsa -in infrastructure/secrets/jwtRS256.key -pubout -outform PEM \
  -out infrastructure/secrets/jwtRS256.key.pub

# 4. Generate SSL certificates (or use self-signed for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout infrastructure/secrets/selfsigned.key \
  -out infrastructure/secrets/selfsigned.crt \
  -subj "/CN=xennic.local"

# 5. Start the full stack
bash infrastructure/docker/compose/production/stack-up.sh

# 6. Run database migrations
docker exec xennic-api npx prisma migrate deploy

# 7. Verify health
curl http://localhost:3000/api/v1/health
```

### Upgrade from Previous Alpha

```bash
# 1. Backup database first
bash scripts/db-backup.sh

# 2. Pull latest code
git pull origin main

# 3. Rebuild and restart affected services
docker compose -f infrastructure/docker/compose/production/docker-compose.yml build api web
docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d api web

# 4. Apply new migrations
docker exec xennic-api npx prisma migrate deploy

# 5. Run smoke tests
bash scripts/smoke-test.sh
```

### Prerequisites

| Dependency | Minimum Version |
|-----------|----------------|
| Docker | 24+ |
| Docker Compose | v2+ |
| Git | 2+ |
| OpenSSL | 1.1+ |
| Node.js (for local dev) | 20 LTS |
| pnpm (for local dev) | 9+ |
| Python (for local dev) | 3.12 |

---

## Support

| Channel | Contact |
|---------|---------|
| **Documentation** | https://opencode.ai/docs (internal) |
| **Repository** | github.com/anomalyco/xennic |
| **Issue Tracker** | GitHub Issues |
| **Engineering Team** | #engineering on internal Slack |
| **DevOps Team** | #devops on internal Slack |
| **Emergency** | On-call rotation via PagerDuty |

---

## Additional Resources

| Document | Path |
|----------|------|
| Changelog | `docs/releases/CHANGELOG.md` |
| Known Issues | `docs/releases/KNOWN_ISSUES.md` |
| Deployment Checklist | `docs/releases/DEPLOYMENT_CHECKLIST.md` |
| Test Plan | `docs/releases/ALPHA_TEST_PLAN.md` |
| Go-Live Runbook | `docs/releases/ALPHA_GO_LIVE.md` |
| Release Gate | `docs/releases/ALPHA_RELEASE_GATE.md` |
| Security Checklist | `docs/releases/ALPHA_SECURITY_CHECKLIST.md` |
| Architecture Spec | `docs/architecture/XENNIC_ARCHITECTURE_SPEC_v1.md` |
| Deployment Runbook | `docs/runbooks/Deployment.md` |
| Rollback Runbook | `docs/runbooks/Rollback.md` |
| Incident Response | `docs/runbooks/Incident-Response.md` |
| Production Readiness | `docs/project/PRODUCTION_READINESS_AUDIT.md` |

---

> **Next Milestone**: v0.6.0-beta — Test coverage > 70%, VPS deployment, TLS certificates, automated rollback  
> **Target**: Shahrivar 1405 (September 2026)
