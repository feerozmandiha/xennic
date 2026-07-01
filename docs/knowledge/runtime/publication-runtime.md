# رانتایم انتشار — Publication Runtime

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. نمای کلی معماری انتشار — Publication Architecture Overview

The Publication Runtime governs how validated knowledge objects are distributed to all production targets. Each publication creates a versioned, traceable snapshot of the knowledge object across vector, graph, API, search, and archival systems.

### اهداف معماری — Architecture Goals

| هدف | Goal | Description |
|-----|------|-------------|
| **انتشار اتمیک** | Atomic Publication | All targets publish successfully OR all roll back; no partial states |
| **نسخه‌گذاری کامل** | Full Versioning | Every publication creates a version snapshot; previous versions remain accessible |
| **قابلیت بازگشت** | Full Rollback | Any publication can be reverted within a 1-hour success window |
| **سازگاری بین‌هدف** | Cross-Target Consistency | All targets reflect the same knowledge state at the same version |
| **همگام‌سازی ناهمگام** | Eventual Consistency | Asynchronous targets (vector DB, graph) converge within defined SLA |

---

## 2. اهداف انتشار — Publication Targets

| # | Target | Purpose | Technology | Protocol |
|---|--------|---------|------------|----------|
| 1 | **Vector Database** | Embeddings for semantic search and RAG | Qdrant | gRPC / REST |
| 2 | **Knowledge Graph** | Entity, concept, and relationship storage | Neo4j / Apache Age | Bolt / JDBC |
| 3 | **Knowledge API** | REST API for knowledge CRUD operations | NestJS (Knowledge Service) | HTTPS |
| 4 | **Engineering AI** | AI service knowledge cache for inference | AI Service (in-memory + Redis) | gRPC |
| 5 | **Search Engine** | Full-text search index | Elasticsearch / PostgreSQL FTS | REST / SQL |
| 6 | **Archive** | Long-term cold storage for audit and compliance | MinIO (S3-compatible) | S3 API |
| 7 | **Backup** | Redundant backup for disaster recovery | MinIO (separate bucket / region) | S3 API |

### وابستگی‌های انتشار — Publication Dependencies

```
Knowledge API ──────┐
                    ├──→ Vector DB ──→ Search Engine
Knowledge Graph ────┘       │
                            └──→ Engineering AI
Archive ─────────────────────────────────── Backup
```

| Target | Depends On | Can Publish In Parallel |
|--------|------------|------------------------|
| Knowledge API | — (independent) | Yes |
| Knowledge Graph | — (independent) | Yes |
| Vector Database | Knowledge API (must have KID) | No (sequential) |
| Search Engine | Vector Database (embeddings ready) | No (sequential) |
| Engineering AI | Vector Database, Knowledge Graph | No (sequential) |
| Archive | — (independent) | Yes |
| Backup | Archive | No (sequential) |

---

## 3. جریان انتشار — Publishing Workflow

### مراحل انتشار — Publication Steps

| Step | Action | Responsibility | Outcome |
|------|--------|----------------|---------|
| **1. Pre-publication check** | Verify all validations passed and no outstanding flags | Orchestrator | Proceed or block |
| **2. Lock document** | Acquire distributed lock to prevent concurrent publication | Lock Manager | Lock acquired |
| **3. Create version** | Increment version number; create version metadata record | Version Manager | Version created |
| **4. Publish to API** | Create/update knowledge object in Knowledge API | API Publisher | API record created |
| **5. Publish to Graph** | Create entity nodes and relationship edges | Graph Publisher | Graph updated |
| **6. Publish to Vector** | Generate chunks, compute embeddings, upsert to Qdrant | Vector Publisher | Vectors upserted |
| **7. Publish to Search** | Index document in full-text search engine | Search Publisher | Search index updated |
| **8. Publish to AI** | Push knowledge to AI service cache | AI Cache Publisher | AI cache primed |
| **9. Archive** | Store document + metadata in cold storage | Archive Publisher | Artifact stored |
| **10. Backup** | Replicate archive to backup storage | Backup Publisher | Backup confirmed |
| **11. Verify all targets** | Confirm each target reports success | Orchestrator | All verified |
| **12. Update lifecycle** | Set document status to Published | Lifecycle Manager | Status updated |
| **13. Release lock** | Release distributed lock | Lock Manager | Lock released |
| **14. Fire event** | Emit `KnowledgePublished` event to event bus | Event Bus | Event fired |

### قفل concurrent — Concurrent Publication Lock

| Property | Detail |
|----------|--------|
| **Lock type** | Distributed mutex (Redis-based) |
| **Scope** | Per knowledge object ID |
| **TTL** | 5 minutes (auto-release prevents deadlock) |
| **Contention** | If locked, subsequent publication attempts queue with exponential backoff |
| **Force unlock** | Admin interface allows force unlock after manual review |

---

## 4. استراتژی بازگشت — Rollback Strategy

### انواع بازگشت — Rollback Types

| Type | Trigger | Action | Timing |
|------|---------|--------|--------|
| **Automated rollback** | Publication failure (any target fails) | Roll back all completed targets immediately | Real-time |
| **Manual rollback** | Critical error detected post-publication, security issue, data corruption | Restore previous version for each target | Within 1 hour (success window) |
| **New version** | Issue detected > 1 hour after publication | Create new version with corrected data; do not delete published version | > 1 hour |

### فرآیند بازگشت — Rollback Workflow

| Step | Action | Detail |
|------|--------|--------|
| 1 | Initiate rollback | Automated (on failure) or manual (admin interface) |
| 2 | Lock document | Prevent concurrent access during rollback |
| 3 | Restore Knowledge API | Revert to previous version record |
| 4 | Restore Knowledge Graph | Delete current entities/relationships; restore previous graph state |
| 5 | Republish embeddings | Replace current vectors with previous version vectors |
| 6 | Restore search index | Re-index previous version content |
| 7 | Restore AI cache | Reload previous knowledge into AI cache |
| 8 | No action on Archive | Archive is append-only; previous version preserved |
| 9 | Verify rollback | Confirm each target reflects previous version |
| 10 | Update lifecycle | Set status to Rolled Back; record rollback reason |
| 11 | Release lock | Allow new publications |
| 12 | Fire event | Emit `KnowledgeRolledBack` event |

### جدول بازگشت‌پذیری — Rollback Capability Per Target

| Target | Rollback Method | Data Loss Risk | Rollback Time |
|--------|-----------------|----------------|---------------|
| Knowledge API | Revert to previous version record | None (versioned) | < 10 s |
| Knowledge Graph | Delete/create nodes/edges per version diff | Low (versioned) | < 30 s |
| Vector Database | Replace current vectors with previous | Low (versioned) | < 30 s |
| Search Engine | Re-index previous content | Low (versioned) | < 60 s |
| Engineering AI | Reload cache | Minimal (cache miss) | < 5 s |
| Archive | Append-only; no deletion | None | Not applicable |
| Backup | Re-trigger backup from archive | None | < 60 s |

---

## 5. مدیریت نسخه — Version Management

### ساختار نسخه — Version Structure

| Field | Type | Description |
|-------|------|-------------|
| `version_number` | Integer | Auto-incremented; starts at 1 |
| `knowledge_object_id` | UUID | Parent knowledge object |
| `published_at` | Timestamp | UTC + Iran timezone |
| `publisher` | String | System component or user that triggered publication |
| `checksums` | Map<Target, SHA-256> | Checksum of published artifact per target |
| `status` | Enum | Published, Rolled Back, Failed |
| `rollback_reason` | String | Populated if status is Rolled Back |
| `metadata` | JSON | Version-specific metadata (size, chunk count, entity count) |

### قوانین نسخه — Version Rules

- Each publication auto-increments the version number
- Previous versions remain accessible via query parameter (`?version=N`)
- Latest version serves as default for all AI retrieval and API queries
- Version history available through Knowledge API (`GET /knowledge/:id/versions`)
- Older versions are immutable once published; corrections require a new version
- Archive retains all versions permanently (audit requirement)

---

## 6. قوانین سازگاری — Consistency Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| **Eventual consistency** | Vector DB, Graph, and Search may update asynchronously | All converge within 30 seconds of publication |
| **Read-your-writes** | Knowledge API always returns latest acknowledged version | Immediate consistency on API; eventual on other targets |
| **Cross-target consistency** | All targets must publish successfully OR all roll back | Transactional publication with atomicity guarantee |
| **Temporal consistency** | Timestamps synchronized across all targets | NTP-synchronized clocks; publication timestamp stored per target |
| **Idempotency** | Re-publishing the same version is safe | Checksum comparison prevents duplicate side effects |
| **Causal consistency** | If version B depends on version A, B is never published before A completes | Dependency-aware publication ordering |

---

## 7. جدول وضعیت انتشار — Publication Status Table

| Stage | Status | Icon | Description | Next Action |
|-------|--------|------|-------------|-------------|
| **Pending** | Waiting for validation | ⏳ | Document queued; awaiting validation service to confirm readiness | Proceed when all validations passed |
| **In Progress** | Publishing in progress | 🔄 | One or more targets currently being updated | Monitor until complete or failed |
| **Published** | Successfully published | ✅ | All targets confirmed; version created; event fired | Fire `KnowledgePublished` event |
| **Partial** | Some targets failed | ⚠️ | At least one target failed during publication | Automatic rollback triggered; investigate failure |
| **Failed** | All targets failed | ❌ | All publication attempts failed | Rollback (partial), log, alert engineering team |
| **Rolled Back** | Publication reverted | ↩️ | Publication was rolled back to previous version | Investigate root cause; re-publish with fix |
| **Superseded** | Newer version exists | 📄 | A newer version has been published | Historical query only; not used for AI retrieval |

---

## 8. اعلان رویدادها — Event Definitions

| Event | Trigger | Payload | Consumers |
|-------|---------|---------|-----------|
| `KnowledgePublished` | Publication successful | `{kid, version, targets, timestamp}` | AI Service, Search Indexer, Analytics |
| `KnowledgeRolledBack` | Rollback completed | `{kid, version, previous_version, reason, timestamp}` | AI Service, Admin Dashboard |
| `PublicationFailed` | All targets failed | `{kid, version, errors, timestamp}` | Alerting, Admin Dashboard |
| `PublicationPartial` | Some targets failed; rollback initiated | `{kid, version, failed_targets, timestamp}` | Alerting, Admin Dashboard |

---

## 9. شاخص‌های کلیدی عملکرد — Key Performance Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| Publication success rate | > 99.5% | Successful / Total publication attempts |
| Publication latency (end-to-end) | < 30 s for 95% of publications | Time from trigger to all targets confirmed |
| Vector DB publication time | < 10 s | Chunk + embed + upsert duration |
| Graph publication time | < 15 s | Node + edge creation duration |
| Rollback success rate | 100% | Successful rollbacks / Total rollback attempts |
| Rollback completion time | < 60 s | Time from rollback trigger to all targets restored |
| Cross-target consistency | 100% within 30 s | All targets reflect same version within SLA |
| Version history availability | 99.99% | Successful version queries / Total version queries |
