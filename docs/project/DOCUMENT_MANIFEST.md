# Xennic Platform — Documentation Manifest

**Version**: 1.0.0 | **Date**: Khordad 1405 (June 2026) | **Compiler**: Architecture Review Board

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total Files** | 276 |
| **Total Lines** | 51,189 |
| **Categories** | 31 (30 listed + `api/` standalone) |
| **Empty Subdirectories** | 9 (knowledge subdirs with 0 files) |
| **Specification Files** | 15 (`*_SPEC_*` across architecture, deployment, engineering, specifications/) |
| **ADR Files** | 15 (5 in `decisions/`, 10 in `knowledge/runtime/` + `knowledge/reasoning/`) |
| **Outdated Index Docs** | `DOCUMENTATION_STATUS.md` claims 120 files, `REVIEW_REPORT.md` claims 149 — actual 276 |
| **Docs/xennic-docs Divergence** | Confirmed; `xennic-docs/` is a partial snapshot |

---

## Category Breakdown

### 1. `architecture/` — 15 files, 5,672 lines

| Field | Value |
|-------|-------|
| **Purpose** | System architecture, microservices topology, module maps, request/event flow, sequence diagrams, master architecture blueprint, 4 SPEC files (Architecture, Authorization, Database, ERD) |
| **Author** | Unknown (no attribution in files) |
| **Sprint** | Initial (1404–1405) |
| **Status** | Mature — all marked complete in `DOCUMENTATION_STATUS.md`. `XENNIC_MASTER_ARCHITECTURE.md` (345 lines) is the canonical source |
| **Referenced By** | Every other doc category; `README.md`, `deployment/`, `backend/`, `decisions/` |
| **Depends On** | None (foundational) |
| **Priority** | **CRITICAL** |
| **Last Architectural Impact** | Khordad 1405 — `XENNIC_MONOREPO_STRUCTURE_v2.md` (956 lines) documents workspace topology |
| **Review Needed** | Yes — 4 SPEC files may duplicate `specifications/` counterparts |
| **Redundant** | Partial — `XENNIC_DATABASE_SPEC_v2.md` (1,170 lines) and `XENNIC_ERD_v1.md` (839 lines) overlap with `database/` and `specifications/DATABASE_SPEC.md` |

---

### 2. `engineering/` — 7 files, 2,154 lines

| Field | Value |
|-------|-------|
| **Purpose** | Calculation engine, formulas, validation rules, calculator catalog (`XENNIC_CALCULATION_CATALOG_v1.md`, 906 lines), engineering engine SPEC |
| **Author** | Unknown |
| **Sprint** | 1404–1405 |
| **Status** | Stable — core calculation pipeline documented |
| **Referenced By** | `services/engineering-service.md`, `ai/` (RAG queries over formulas) |
| **Depends On** | `architecture/`, `database/` |
| **Priority** | **CRITICAL** (core domain logic) |
| **Last Architectural Impact** | Khordad 1405 — `XENNIC_ENGINEERING_ENGINE_SPEC_v1.md` (664 lines) |
| **Review Needed** | Yes — formula coverage gaps |
| **Redundant** | No |

---

### 3. `ai/` — 12 files, 1,366 lines

| Field | Value |
|-------|-------|
| **Purpose** | AI engine, OCR pipeline, vision AI, LLM integration, RAG architecture, embedding pipeline, vector DB, model selection, prompt engineering, AI agents |
| **Author** | Unknown |
| **Sprint** | 1404–1405 |
| **Status** | Moderate — good breadth but shallow depth (avg ~114 lines/file) |
| **Referenced By** | `knowledge/`, `specifications/`, `services/ai-service.md` |
| **Depends On** | `architecture/`, `database/` (vector store), `engineering/` |
| **Priority** | **CRITICAL** (AI is core differentiator) |
| **Last Architectural Impact** | Khordad 1405 — agent architecture documented |
| **Review Needed** | Yes — OCR↔Vision pipeline overlap, RAG architecture may diverge from knowledge runtime |
| **Redundant** | Partial — `VISION_PIPELINE.md` overlaps `VISION_AI.md`; `RAG_ARCHITECTURE.md` overlaps `knowledge/` RAG concepts |

---

### 4. `backend/` — 7 files, 984 lines

| Field | Value |
|-------|-------|
| **Purpose** | API design patterns, authentication (JWT), authorization (RBAC), error handling, caching strategy, logging, background jobs |
| **Author** | Unknown |
| **Sprint** | 1404–1405 |
| **Status** | Good — well-structured, covers all major backend concerns |
| **Referenced By** | `frontend/`, `security/`, `deployment/`, `api/API_REFERENCE.md` |
| **Depends On** | `architecture/` |
| **Priority** | **CRITICAL** |
| **Last Architectural Impact** | Khordad 1405 — error handling standardization |
| **Review Needed** | Yes — auth docs may duplicate `security/` |
| **Redundant** | Partial — `AUTHENTICATION.md` / `AUTHORIZATION.md` overlap with `security/JWT.md` and `security/ACCESS_CONTROL.md` |

---

### 5. `frontend/` — 6 files, 796 lines

| Field | Value |
|-------|-------|
| **Purpose** | Frontend architecture, UI component guide, state management, routing, features catalog |
| **Author** | Unknown |
| **Sprint** | 1404–1405 |
| **Status** | Moderate — adequate for MVP but lacks detailed component API docs |
| **Referenced By** | `user/`, `deployment/` |
| **Depends On** | `backend/`, `architecture/` |
| **Priority** | **HIGH** |
| **Last Architectural Impact** | Khordad 1405 — routing structure |
| **Review Needed** | No |
| **Redundant** | No |

---

### 6. `database/` — 9 files, 1,106 lines

| Field | Value |
|-------|-------|
| **Purpose** | DB architecture, design, ERD, indexing strategy, migration strategy, backup/restore, PgBouncer configuration |
| **Author** | Unknown |
| **Sprint** | 1404–1405 |
| **Status** | Good — covers design and operational concerns |
| **Referenced By** | `backend/`, `deployment/`, `devops/` |
| **Depends On** | `architecture/` |
| **Priority** | **CRITICAL** |
| **Last Architectural Impact** | Khordad 1405 — migration strategy documented |
| **Review Needed** | Yes — `ERD.md` may overlap `architecture/XENNIC_ERD_v1.md` |
| **Redundant** | Partial — `BACKUP_AND_RESTORE.md` overlaps `BACKUP_STRATEGY.md`; both overlap `devops/BACKUP_PLAN.md` |

---

### 7. `deployment/` — 14 files, 3,251 lines

| Field | Value |
|-------|-------|
| **Purpose** | Docker, docker-compose, nginx, HTTPS, env vars, VPS preparation, production checklist, scaling, 3 SPEC files (API, Infrastructure, Development Rules) |
| **Author** | Unknown |
| **Sprint** | 1404–1405 |
| **Status** | Good — `VPS_PREPARATION_GUIDE.md` (743 lines) and `XENNIC_INFRASTRUCTURE_SPEC_v1.md` (751 lines) are comprehensive |
| **Referenced By** | `devops/`, `runbooks/`, `releases/` |
| **Depends On** | `architecture/`, `security/` |
| **Priority** | **CRITICAL** |
| **Last Architectural Impact** | Khordad 1405 — infrastructure spec finalized |
| **Review Needed** | Yes — 3 SPEC files may duplicate `specifications/DEPLOYMENT_SPEC.md` |
| **Redundant** | Yes — `XENNIC_API_SPEC_v1.md` (622 lines) duplicates `specifications/API_SPEC.md` and `architecture/` content; `REVERSE_PROXY.md` overlaps `NGINX.md` |

---

### 8. `security/` — 14 files, 2,714 lines

| Field | Value |
|-------|-------|
| **Purpose** | Security model, JWT, access control, rate limiting, data encryption, secrets management, dependency audit, git history purge, production hardening, security checklist |
| **Author** | Unknown |
| **Sprint** | 1404–1405 |
| **Status** | Good — broad coverage, `JWT.md` (383 lines) and `Secrets.md` (337 lines) are thorough |
| **Referenced By** | `backend/`, `deployment/`, `devops/`, `releases/` |
| **Depends On** | `architecture/` |
| **Priority** | **CRITICAL** |
| **Last Architectural Impact** | Khordad 1405 — production hardening checklist |
| **Review Needed** | Yes — `SECURITY_MODEL.md` (50 lines) is too shallow for a security model doc |
| **Redundant** | Partial — backend auth docs overlap; `SECRETS_MANAGEMENT.md` vs `Secrets.md` vs `operations/SECRETS_ROTATION.md` |

---

### 9. `knowledge/` — 88 files, 17,243 lines

| Field | Value |
|-------|-------|
| **Purpose** | Knowledge platform: governance (7 files, 1,065 lines), concepts (8 files, 3,385 lines), semantics (10 files, 3,376 lines), runtime (25 files, 4,388 lines), reasoning (28 files, 3,049 lines), AI intelligence (6 files, 1,352 lines), roadmap (1 file, 276 lines), management (3 root files, 352 lines) |
| **Author** | Unknown |
| **Sprint** | 1404–1405 |
| **Status** | Largest category by far. Core subdirs well-developed (`concept-model.md` 848 lines, `bilingual-lexicon.md` 730 lines, `engineering-taxonomy-v2.md` 790 lines, `document-lifecycle.md` 461 lines, `pipeline-orchestration.md` 307 lines). 9 subdirs are empty (cases, catalogs, manuals, manufacturers, rag, references, schemas, standards, tariffs) |
| **Referenced By** | `ai/`, `engineering/`, `services/` |
| **Depends On** | `architecture/`, `ai/` |
| **Priority** | **CRITICAL** (largest knowledge base) |
| **Last Architectural Impact** | Khordad 1405 — 10 runtime ADRs + 10 reasoning ADRs |
| **Review Needed** | **Yes** — 9 empty subdirectories indicate incomplete coverage; ADR numbering collides with project ADRs (ADR-001 through ADR-010 exist in both `decisions/` and `knowledge/runtime/`); large conceptual overlap between `concepts/`, `semantics/`, and `governance/` |
| **Redundant** | **Yes** — significant internal overlap (e.g., `engineering-taxonomy-v2.md` vs `taxonomy.md`; `naming-conventions.md` in two locations; multiple ADR-010 definitions) |

---

### 10. `project/` — 14 files, 2,255 lines

| Field | Value |
|-------|-------|
| **Purpose** | Project status, milestones, release board, risk register, quality dashboard, technical debt, TODO, changelog, versioning, alpha readiness audit (449 lines), production readiness audit (970 lines), known limitations |
| **Author** | Unknown |
| **Sprint** | Continuous |
| **Status** | Good — `PRODUCTION_READINESS_AUDIT.md` (970 lines) is the most comprehensive doc in the project category |
| **Referenced By** | `releases/`, `project-management/` |
| **Depends On** | All other categories (consumes status data) |
| **Priority** | **HIGH** |
| **Last Architectural Impact** | Khordad 1405 — production readiness audit |
| **Review Needed** | No |
| **Redundant** | Yes — `CHANGELOG.md` duplicates `releases/CHANGELOG.md`; `RELEASE_BOARD.md` overlaps `releases/` content |

---

### 11. `releases/` — 10 files, 2,573 lines

| Field | Value |
|-------|-------|
| **Purpose** | Alpha release notes, go-live plan, release gate, test plan, security checklist, build validation, deployment checklists (staging + production), known issues, changelog |
| **Author** | Unknown |
| **Sprint** | 1405 (Alpha) |
| **Status** | Good — structured for alpha release |
| **Referenced By** | `project/`, `devops/`, `runbooks/` |
| **Depends On** | `project/`, `testing/`, `security/` |
| **Priority** | **HIGH** |
| **Last Architectural Impact** | Khordad 1405 — alpha release gate |
| **Review Needed** | Yes — `DEPLOYMENT_CHECKLIST.md` vs `STAGING_DEPLOYMENT_CHECKLIST.md` |
| **Redundant** | Partial — changelog duplicates `project/CHANGELOG.md` |

---

### 12. `runbooks/` — 7 files, 2,064 lines

| Field | Value |
|-------|-------|
| **Purpose** | Deployment runbook (519 lines), disaster recovery (249 lines), incident response (233 lines), rollback (184 lines), secrets rotation (350 lines), server rebuild (293 lines) |
| **Author** | Unknown |
| **Sprint** | 1405 |
| **Status** | Good — operational coverage is strong |
| **Referenced By** | `devops/`, `releases/`, `deployment/` |
| **Depends On** | `deployment/`, `security/` |
| **Priority** | **HIGH** |
| **Last Architectural Impact** | Khordad 1405 — first deployment runbook |
| **Review Needed** | Yes — secrets rotation overlaps `security/` and `operations/` |
| **Redundant** | Partial — `Secrets-Rotation.md` duplicates `operations/SECRETS_ROTATION.md` (760 lines) with less detail |

---

### 13. `specifications/` — 11 files, 791 lines

| Field | Value |
|-------|-------|
| **Purpose** | Formal specs for API, Database, Engineering, OCR, Vision, RAG, AI, Web, Mobile (future), Deployment, Security |
| **Author** | Unknown |
| **Sprint** | 1405 |
| **Status** | New — avg ~72 lines/file. These appear to be lightweight summary specs, but many duplicate content from `*_SPEC_*` files in `architecture/`, `deployment/`, and `engineering/` |
| **Referenced By** | `decisions/` (ADR-008: documentation as code) |
| **Depends On** | `architecture/`, `engineering/`, `ai/`, `backend/`, `deployment/`, `security/` |
| **Priority** | **MEDIUM** (high redundancy with existing SPEC files) |
| **Last Architectural Impact** | Khordad 1405 — created as part of doc-as-code initiative |
| **Review Needed** | **Yes** — every file duplicates a SPEC file elsewhere in the tree; need deduplication strategy |
| **Redundant** | **Yes** — `API_SPEC.md` duplicates `deployment/XENNIC_API_SPEC_v1.md` and `architecture/XENNIC_ARCHITECTURE_SPEC_v1.md`; `DATABASE_SPEC.md` duplicates `architecture/XENNIC_DATABASE_SPEC_v2.md`; `ENGINEERING_SPEC.md` duplicates `engineering/XENNIC_ENGINEERING_ENGINE_SPEC_v1.md`; `DEPLOYMENT_SPEC.md` duplicates `deployment/XENNIC_INFRASTRUCTURE_SPEC_v1.md`; `SECURITY_SPEC.md` overlaps `security/` entirely |

---

### 14. `services/` — 8 files, 491 lines

| Field | Value |
|-------|-------|
| **Purpose** | Individual service docs: AI service, API gateway (placeholder), consultations, engineering engine, engineering service, marketplace, subscription/billing, vision service |
| **Author** | Unknown |
| **Sprint** | 1404–1405 |
| **Status** | Minimal — avg ~61 lines/file. `vision-service.md` (105 lines) is the longest. `api-gateway.md` (33 lines) is a placeholder |
| **Referenced By** | `architecture/`, `deployment/` |
| **Depends On** | `architecture/MICROSERVICES.md`, `architecture/SERVICE_ARCHITECTURE.md` |
| **Priority** | **MEDIUM** |
| **Last Architectural Impact** | Khordad 1405 — service boundary definitions |
| **Review Needed** | Yes — `ENGINEERING_ENGINE.md` (59 lines) duplicates `engineering/ENGINEERING_ENGINE.md` (78 lines) |
| **Redundant** | Yes — service docs largely summarise what `architecture/SERVICE_ARCHITECTURE.md` already covers |

---

### 15. `decisions/` — 6 files, 350 lines

| Field | Value |
|-------|-------|
| **Purpose** | ADR-006 through ADR-010 (Dependency Management, DB Migration Strategy, Documentation as Code, API Versioning, Testing Strategy). ADR-001 through ADR-005 are inline-only in `XENNIC_MASTER_ARCHITECTURE.md` (no separate files). Index file (68 lines) |
| **Author** | Unknown |
| **Sprint** | 1405 |
| **Status** | Good — well-structured, follows template |
| **Referenced By** | `architecture/`, `project/` |
| **Depends On** | None |
| **Priority** | **HIGH** |
| **Last Architectural Impact** | Khordad 1405 — ADR-010 testing strategy |
| **Review Needed** | **Yes** — ADR numbering collision: ADR-001 through ADR-010 also exist in `knowledge/runtime/` with completely different decisions. Need namespace separation (e.g., `ARCH-ADR-001` vs `KNOW-ADR-001`) |
| **Redundant** | No (within its namespace) |

---

### 16. `testing/` — 5 files, 439 lines

| Field | Value |
|-------|-------|
| **Purpose** | Test strategy, unit tests, integration tests, E2E tests, performance testing |
| **Author** | Unknown |
| **Sprint** | 1405 |
| **Status** | Moderate — good structure, avg ~88 lines/file |
| **Referenced By** | `devops/`, `releases/`, `project/` |
| **Depends On** | `architecture/`, `backend/` |
| **Priority** | **HIGH** |
| **Last Architectural Impact** | Khordad 1405 — test strategy aligned with ADR-010 |
| **Review Needed** | No |
| **Redundant** | No |

---

### 17. `devops/` — 6 files, 585 lines

| Field | Value |
|-------|-------|
| **Purpose** | CI/CD pipeline, GitHub Actions, monitoring, logging infrastructure, backup plan, disaster recovery |
| **Author** | Unknown |
| **Sprint** | 1405 |
| **Status** | Moderate — avg ~97 lines/file |
| **Referenced By** | `deployment/`, `runbooks/`, `releases/` |
| **Depends On** | `deployment/`, `monitoring/` |
| **Priority** | **HIGH** |
| **Last Architectural Impact** | Khordad 1405 — CI/CD pipeline docs |
| **Review Needed** | Yes — `DISASTER_RECOVERY.md` overlaps `runbooks/Disaster-Recovery.md`; `BACKUP_PLAN.md` overlaps `database/BACKUP_STRATEGY.md` |
| **Redundant** | Yes — DR and backup docs duplicated in `database/`, `runbooks/`, and `devops/` |

---

### 18. `project-management/` — 2 files, 1,618 lines

| Field | Value |
|-------|-------|
| **Purpose** | Development governance (734 lines), master roadmap (884 lines) |
| **Author** | Unknown |
| **Sprint** | 1404–1405 |
| **Status** | Good — comprehensive governance framework |
| **Referenced By** | `project/`, `decisions/` |
| **Depends On** | `architecture/` |
| **Priority** | **HIGH** |
| **Last Architectural Impact** | Khordad 1405 — governance v1 |
| **Review Needed** | No |
| **Redundant** | No |

---

### 19. `user/` — 5 files, 379 lines

| Field | Value |
|-------|-------|
| **Purpose** | User guide, admin guide, installation guide, FAQ, troubleshooting |
| **Author** | Unknown |
| **Sprint** | 1405 |
| **Status** | Lightweight — avg ~76 lines/file. Sufficient for MVP but needs expansion for production |
| **Referenced By** | `frontend/` |
| **Depends On** | `frontend/`, `backend/` |
| **Priority** | **MEDIUM** |
| **Last Architectural Impact** | Khordad 1405 — initial user docs |
| **Review Needed** | Yes — `INSTALLATION_GUIDE.md` overlaps `deployment/SERVER_SETUP.md` and `runbooks/Deployment.md` |
| **Redundant** | No |

---

### 20. `development/` — 2 files, 184 lines

| Field | Value |
|-------|-------|
| **Purpose** | Developer guide (132 lines), scripts reference (52 lines) |
| **Author** | Unknown |
| **Sprint** | 1405 |
| **Status** | Minimal — developer guide is too brief for onboarding |
| **Referenced By** | `project/`, `AGENTS.md` |
| **Depends On** | `architecture/` |
| **Priority** | **MEDIUM** |
| **Last Architectural Impact** | Khordad 1405 |
| **Review Needed** | Yes — needs expansion |
| **Redundant** | No |

---

### 21. `templates/` — 7 files, 446 lines

| Field | Value |
|-------|-------|
| **Purpose** | Templates for API, service, module (NestJS DDD), feature, database, ADR, architecture docs |
| **Author** | Unknown |
| **Sprint** | 1405 |
| **Status** | Good — well-structured templates (avg ~64 lines/file) |
| **Referenced By** | `decisions/`, all other categories |
| **Depends On** | None |
| **Priority** | **MEDIUM** |
| **Last Architectural Impact** | Khordad 1405 — ADR-008 (doc as code) |
| **Review Needed** | No |
| **Redundant** | No |

---

### 22. `monitoring/` — 3 files, 120 lines

| Field | Value |
|-------|-------|
| **Purpose** | Prometheus (38 lines), Grafana (35 lines), Loki (47 lines) setup docs |
| **Author** | Unknown |
| **Sprint** | 1405 |
| **Status** | Minimal — placeholder-level detail |
| **Referenced By** | `devops/` |
| **Depends On** | `deployment/` |
| **Priority** | **LOW** |
| **Last Architectural Impact** | Khordad 1405 |
| **Review Needed** | Yes — all three docs are too brief to be actionable |
| **Redundant** | No |

---

### 23. `reference/` — 3 files, 219 lines

| Field | Value |
|-------|-------|
| **Purpose** | Glossary (60 lines), dependencies (76 lines), naming conventions (83 lines) |
| **Author** | Unknown |
| **Sprint** | 1405 |
| **Status** | Minimal — glossary and naming conventions duplicate concepts from `knowledge/` |
| **Referenced By** | `development/`, all categories |
| **Depends On** | `knowledge/` |
| **Priority** | **LOW** |
| **Last Architectural Impact** | Khordad 1405 |
| **Review Needed** | Yes — `GLOSSARY.md` overlaps `knowledge/semantics/acronym-dictionary.md` and `bilingual-lexicon.md`; `NAMING_CONVENTIONS.md` overlaps `knowledge/governance/naming-conventions.md` |
| **Redundant** | Yes — all three files duplicate `knowledge/` content |

---

### 24. `infrastructure/` — 2 files, 211 lines

| Field | Value |
|-------|-------|
| **Purpose** | Infrastructure overview (70 lines), README (141 lines) |
| **Author** | Unknown |
| **Sprint** | 1405 |
| **Status** | Minimal |
| **Referenced By** | `deployment/` |
| **Depends On** | `deployment/`, `architecture/` |
| **Priority** | **LOW** |
| **Last Architectural Impact** | Khordad 1405 |
| **Review Needed** | Yes — overlaps heavily with `deployment/XENNIC_INFRASTRUCTURE_SPEC_v1.md` |
| **Redundant** | Yes — duplicates `deployment/` content |

---

### 25. `operations/` — 1 file, 760 lines

| Field | Value |
|-------|-------|
| **Purpose** | Secrets rotation (standalone file) |
| **Author** | Unknown |
| **Sprint** | 1405 |
| **Status** | Comprehensive — 760 lines is the longest operations doc |
| **Referenced By** | `security/`, `runbooks/` |
| **Depends On** | `security/` |
| **Priority** | **MEDIUM** |
| **Last Architectural Impact** | Khordad 1405 |
| **Review Needed** | Yes — duplicates `runbooks/Secrets-Rotation.md` (350 lines) |
| **Redundant** | Yes — `runbooks/Secrets-Rotation.md` covers same topic |

---

### 26. `storage/` — 1 file, 421 lines

| Field | Value |
|-------|-------|
| **Purpose** | Storage architecture (file storage, object storage, CDN strategy) |
| **Author** | Unknown |
| **Sprint** | 1405 |
| **Status** | Good — standalone and well-contained |
| **Referenced By** | `deployment/`, `ai/` |
| **Depends On** | `architecture/` |
| **Priority** | **MEDIUM** |
| **Last Architectural Impact** | Khordad 1405 |
| **Review Needed** | No |
| **Redundant** | No |

---

### 27. `standards/` — 1 file, 630 lines

| Field | Value |
|-------|-------|
| **Purpose** | Xennic coding standards |
| **Author** | Unknown |
| **Sprint** | 1405 |
| **Status** | Good — comprehensive (630 lines) |
| **Referenced By** | `development/`, `project/` |
| **Depends On** | None |
| **Priority** | **HIGH** |
| **Last Architectural Impact** | Khordad 1405 |
| **Review Needed** | No |
| **Redundant** | No |

---

### 28. `roadmap/` — 1 file, 57 lines

| Field | Value |
|-------|-------|
| **Purpose** | Platform roadmap |
| **Author** | Unknown |
| **Sprint** | 1405 |
| **Status** | Minimal — 57 lines is insufficient for a roadmap |
| **Referenced By** | `project/` |
| **Depends On** | `project-management/` |
| **Priority** | **LOW** |
| **Last Architectural Impact** | Khordad 1405 |
| **Review Needed** | Yes — duplicates `project-management/XENNIC_MASTER_ROADMAP_v1.md` (884 lines) |
| **Redundant** | **Yes** — `project-management/XENNIC_MASTER_ROADMAP_v1.md` supersedes this entirely |

---

### 29. `product/` — 1 file, 41 lines

| Field | Value |
|-------|-------|
| **Purpose** | Product vision statement |
| **Author** | Unknown |
| **Sprint** | 1404 |
| **Status** | Minimal — 41 lines |
| **Referenced By** | `roadmap/`, `project-management/` |
| **Depends On** | None |
| **Priority** | **MEDIUM** |
| **Last Architectural Impact** | Farvardin 1404 (initial) |
| **Review Needed** | Yes — needs expansion to define product strategy |
| **Redundant** | No |

---

### 30. `api/` — 1 file, 90 lines

| Field | Value |
|-------|-------|
| **Purpose** | API reference (endpoints, response format, error codes) |
| **Author** | Unknown |
| **Sprint** | 1405 |
| **Status** | Minimal — 90 lines only covers auth endpoints |
| **Referenced By** | `backend/`, `frontend/`, `user/` |
| **Depends On** | `backend/` |
| **Priority** | **LOW** |
| **Last Architectural Impact** | Khordad 1405 |
| **Review Needed** | Yes — should be auto-generated from OpenAPI spec; manual maintenance is error-prone |
| **Redundant** | Yes — duplicates `backend/API_DESIGN.md` and auto-generated `packages/openapi/v1/openapi.json` |

---

### 31. Root Files — 7 files, ~1,179 lines

| Field | Value |
|-------|-------|
| **Purpose** | `README.md` (71 lines) — platform overview; `DOCUMENTATION_STATUS.md` (245 lines) — outdated status; `REVIEW_REPORT.md` (166 lines) — outdated review; `STATUS_REPORT.md` (80 lines) — current status; `LANDING-PATCH.md` (50 lines) — patch notes; `TEST_GUIDE.md` (175 lines) — testing guide; `XENNIC_MASTER_PROJECT_PROMPT.md` (140 lines) — master prompt |
| **Author** | Unknown |
| **Sprint** | Various |
| **Status** | `DOCUMENTATION_STATUS.md` and `REVIEW_REPORT.md` are **stale** (claim 120/149 files vs actual 276). `STATUS_REPORT.md` and `LANDING-PATCH.md` are current |
| **Referenced By** | All categories |
| **Depends On** | All categories |
| **Priority** | **HIGH** (`README.md`, `STATUS_REPORT.md`) / **MEDIUM** (others) |
| **Last Architectural Impact** | Khordad 1405 |
| **Review Needed** | **Yes** — `DOCUMENTATION_STATUS.md` and `REVIEW_REPORT.md` need full rewrite |
| **Redundant** | Yes — `DOCUMENTATION_STATUS.md` + `REVIEW_REPORT.md` overlap this manifest |

---

## Cross-Cutting Concerns

### Redundancy Hotspots

| Topic | Duplicated Across |
|-------|-------------------|
| **Database Design / ERD** | `architecture/XENNIC_DATABASE_SPEC_v2.md`, `architecture/XENNIC_ERD_v1.md`, `database/ERD.md`, `database/DATABASE_DESIGN.md`, `specifications/DATABASE_SPEC.md` |
| **Secrets Rotation** | `security/Secrets.md`, `security/SECRETS_MANAGEMENT.md`, `runbooks/Secrets-Rotation.md`, `operations/SECRETS_ROTATION.md` |
| **Disaster Recovery** | `devops/DISASTER_RECOVERY.md`, `runbooks/Disaster-Recovery.md`, `database/BACKUP_AND_RESTORE.md` |
| **API Specs** | `deployment/XENNIC_API_SPEC_v1.md`, `specifications/API_SPEC.md`, `architecture/XENNIC_ARCHITECTURE_SPEC_v1.md`, `api/API_REFERENCE.md` |
| **Roadmap** | `roadmap/ROADMAP.md` (57 lines) vs `project-management/XENNIC_MASTER_ROADMAP_v1.md` (884 lines) |
| **Naming Conventions** | `reference/NAMING_CONVENTIONS.md`, `knowledge/governance/naming-conventions.md` |
| **Glossary** | `reference/GLOSSARY.md`, `knowledge/semantics/acronym-dictionary.md`, `knowledge/semantics/bilingual-lexicon.md` |

### ADR Numbering Collision

| Namespace | Files | ADR Range |
|-----------|-------|-----------|
| `decisions/` | `ADR-006` through `ADR-010` (+ INDEX; ADR-001–005 inline) | 001–010 (project architecture) |
| `knowledge/runtime/` | `adr-001` through `adr-010` | 001–010 (knowledge runtime) |
| `knowledge/reasoning/` | `adr-011` through `adr-020` | 011–020 (knowledge reasoning) |

**Problem**: ADR-001 through ADR-010 in `decisions/` have no relationship to ADR-001 through ADR-010 in `knowledge/runtime/`. A reader searching for ADR-005 cannot know which file to open.

**Recommendation**: Prefix ADR files by domain (e.g., `ARCH-ADR-001` for project decisions, `KNOW-RUNTIME-ADR-001` for knowledge runtime, `KNOW-REASON-ADR-011` for knowledge reasoning).

### Empty Subdirectories

9 knowledge subdirectories contain zero files (placeholders for future content):

`knowledge/cases/`, `knowledge/catalogs/`, `knowledge/manuals/`, `knowledge/manufacturers/`, `knowledge/rag/`, `knowledge/references/`, `knowledge/schemas/`, `knowledge/standards/`, `knowledge/tariffs/`

These represent planned but unimplemented documentation domains.

### Stale Index Documents

| Document | Claimed Count | Actual Count | Status |
|----------|--------------|--------------|--------|
| `DOCUMENTATION_STATUS.md` | 120 files, 20,572 lines | 276 files, 51,189 lines | **Stale** — off by 156 files / 30,617 lines |
| `REVIEW_REPORT.md` | 149 files, 22,751 lines | 276 files, 51,189 lines | **Stale** — off by 127 files / 28,438 lines |

### Priority Distribution

| Priority | Count | Categories |
|----------|-------|------------|
| **CRITICAL** | 7 | architecture, engineering, ai, backend, database, deployment, security |
| **HIGH** | 8 | frontend, project, releases, runbooks, decisions, testing, devops, project-management, standards |
| **MEDIUM** | 9 | specifications, services, user, development, templates, operations, storage, product, root files |
| **LOW** | 5 | monitoring, reference, infrastructure, roadmap, api |

### Review Needed Summary

| Review Status | Count | Categories |
|---------------|-------|------------|
| **Yes** | 20 | architecture, engineering, ai, backend, database, deployment, security, knowledge, releases, runbooks, specifications, services, decisions, devops, user, development, monitoring, reference, infrastructure, roadmap, product, api, root files |
| **No** | 11 | frontend, project, testing, project-management, templates, standards, storage |

### Redundancy Summary

| Status | Count | Categories |
|--------|-------|------------|
| **Yes** | 12 | architecture (partial), ai (partial), backend (partial), database (partial), deployment, knowledge, project (partial), releases (partial), runbooks (partial), specifications, services (partial), reference, infrastructure, operations, roadmap, api |
| **No** | 15 | engineering, frontend, decisions, testing, devops (partial), project-management, user, development, templates, monitoring, storage, standards, product |

---

## Recommendations

1. **Deduplicate** the `specifications/` directory — every file duplicates an existing `*_SPEC_*` file. Either remove `specifications/` or make it the canonical location and remove the scattered SPEC files.
2. **Resolve ADR numbering collision** by renaming with domain prefixes (`ARCH-ADR-`, `KNOW-RUNTIME-ADR-`, `KNOW-REASON-ADR-`).
3. **Rebuild `DOCUMENTATION_STATUS.md` and `REVIEW_REPORT.md`** to reflect actual inventory (276 files).
4. **Consolidate secrets management** into one canonical doc (recommend `security/Secrets.md`).
5. **Merge or alias** `roadmap/ROADMAP.md` → `project-management/XENNIC_MASTER_ROADMAP_v1.md`.
6. **Fill or remove** 9 empty knowledge subdirectories.
7. **Align `xennic-docs/` snapshot** — either sync from `docs/` or document the divergence explicitly.
