# نسخه‌بندی پایپ‌لاین — Pipeline Versioning

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. Pipeline Versions — نسخه‌های پایپ‌لاین

**Versioning Scheme — طرح نسخه‌بندی**

| Component | Format | Example | Description |
|-----------|--------|---------|-------------|
| Pipeline Version | `MAJOR.MINOR` | `2.1` | Tracked per document in `document.pipeline_version` |
| MAJOR | Integer | `1`, `2`, `3` | Breaking changes: new required stage, changed stage interface, removed stage |
| MINOR | Integer | `0`, `1`, `2` | Non-breaking additions: new optional stage, processor update, new extraction field |

**Version Compatibility — سازگاری نسخه**

| Version Change | Backward Compatible | Forward Compatible | Migration Required |
|----------------|---------------------|--------------------|--------------------|
| MAJOR upgrade | No | No | Yes (documented migration guide) |
| MINOR upgrade | Yes | Yes | No (automatic) |
| PATCH (same version) | Yes | Yes | No |

**Version Tracking — ردیابی نسخه**

| Artifact | Version Field | Location |
|----------|--------------|----------|
| Document | `pipeline_version` | PostgreSQL `documents` table |
| Chunk | `pipeline_version` | Qdrant payload + metadata |
| Embedding | `pipeline_version`, `embedding_version` | Qdrant payload |
| Event | `pipeline_version` | RabbitMQ message header |
| Audit Log | `pipeline_version` | PostgreSQL `audit_log` table |

---

## 2. Backward Compatibility — سازگاری با نسخه‌های قبلی

**Processor Compatibility — سازگاری پردازشگرها**

| Rule | Description |
|------|-------------|
| Input Acceptance | All processors must accept input from the previous MINOR version |
| Output Equivalence | Same input document produces equivalent knowledge output across MINOR versions |
| Field Additions | New fields are optional; missing fields default to null/skip |
| Field Removals | Deprecated fields must still be accepted for 2 MAJOR cycles |

**Version Compatibility Matrix — ماتریس سازگاری نسخه**

| Pipeline v1.0 | Pipeline v1.1 | Pipeline v2.0 |
|---------------|---------------|---------------|
| v1.0 output | ✅ Reference | ✅ Accepted (minor) | ⚠️ Migration required |
| v1.1 output | ✅ Accepted (minor) | ✅ Reference | ⚠️ Migration required |
| v2.0 output | ❌ Not accepted | ❌ Not accepted | ✅ Reference |

**Breaking Changes Documentation — مستندات تغییرات شکست‌ناپذیر**

| Breaking Change | MAJOR Version | Migration Guide | Fallback Period |
|----------------|---------------|----------------|-----------------|
| New required stage in pipeline | 2.0 | `migrations/v1-to-v2.md` | 2 MAJOR cycles |
| Changed stage interface (event schema) | 2.0 | `migrations/v1-to-v2.md` | 2 MAJOR cycles |
| Removed extraction field | 3.0 | `migrations/v2-to-v3.md` | 2 MAJOR cycles |
| New validation rule (mandatory) | 2.0 | `migrations/v1-to-v2.md` | 2 MAJOR cycles |

---

## 3. Migration Strategy — راهبرد مهاجرت

**Migration Methods — روش‌های مهاجرت**

| Method | Scope | Duration | Risk | Use Case |
|--------|-------|----------|------|----------|
| **Rolling Migration** | New documents only | Continuous | Low | Default strategy; no re-processing |
| **Bulk Migration** | All existing documents | Days–weeks | Medium | Major model upgrade (embedding, LLM) |
| **Selective Migration** | Active documents only | Hours–days | Low | Based on query frequency (top 20%) |
| **Hot Migration** | Documents in active pipeline | Minutes | High | Critical bug fix in processor |

**Rolling Migration — مهاجرت تدریجی**

| Phase | Action | Duration |
|-------|--------|----------|
| 1 | Deploy new pipeline version alongside old | Day 1 |
| 2 | New documents route to new pipeline | Continuous |
| 3 | Old pipeline still serves existing documents | Until migration complete |
| 4 | Monitor output quality of new pipeline | Days 1–7 |
| 5 | Begin selective/bulk migration of old documents | Days 7+ |
| 6 | Decommission old pipeline | After 2 MAJOR cycles |

**Bulk Migration — مهاجرت انبوه**

| Step | Action | Validation |
|------|--------|------------|
| 1 | Sample 1,000 documents; process with both versions | Compare output equivalence |
| 2 | If quality OK, start bulk re-processing | Monitor error rate < 1% |
| 3 | Queue documents in priority order (active first) | Track progress dashboard |
| 4 | Compare old vs new output per document | Automated diff report |
| 5 | Commit migration; old version available for rollback | Manual sign-off |

**Rollback Capability — قابلیت بازگشت**

| Rollback Type | Trigger | Action | Recovery Time |
|---------------|---------|--------|---------------|
| **Document rollback** | Single document fails | Re-process with old pipeline | Minutes |
| **Bulk rollback** | Migration quality below threshold | Revert all migrated docs to old pipeline | Hours |
| **Full rollback** | Critical bug in new pipeline | Switch all traffic to old pipeline | Minutes |

---

## 4. Reprocessing Strategy — راهبرد پردازش مجدد

**Reprocessing Types — انواع پردازش مجدد**

| Type | Scope | Stages Re-run | Trigger |
|------|-------|---------------|---------|
| **Full Reprocessing** | Entire document | All stages from raw document | New MAJOR pipeline version |
| **Partial Reprocessing** | From specific stage | Selected stages (e.g., re-embed only) | New embedding model |
| **Selective Reprocessing** | Specific fields | Selected extraction stages | Taxonomy update |
| **On-Demand Reprocessing** | Single document | As configured | Manual request |

**Reprocessing Triggers — محرک‌های پردازش مجدد**

| Trigger | Reprocessing Type | Priority | Automation |
|---------|-------------------|----------|------------|
| New MAJOR pipeline version | Full | Medium | Automatic (queue) |
| New embedding model | Partial (re-embed) | High | Automatic (queue) |
| Discovered extraction error | Full or partial | Critical | Manual + automatic |
| Taxonomy / ontology update | Selective (concepts) | Medium | Automatic (changed entities) |
| Semantic layer update | Selective (terms) | Low | Automatic (changed terms) |
| User request (re-import) | Full | As requested | Manual |

**Reprocessing Priority Queue — صف اولویت پردازش مجدد**

| Priority | Scope | Action |
|----------|-------|--------|
| **Critical** | Documents with active queries (last 7 days) | Immediate re-processing |
| **High** | Documents with any query in last 30 days | Process within 1 hour |
| **Medium** | Documents with any query in last 90 days | Process within 24 hours |
| **Low** | All other documents | Process during off-peak |
| **Archived** | Documents not queried in 12+ months | On-demand only |

---

## 5. Chunk Versioning — نسخه‌بندی قطعات

**Chunk Version Identifier — شناسه نسخه قطعه**

| Component | Format | Example |
|-----------|--------|---------|
| Chunk ID | `XEN-CHK-{DOC_ID}-{SEQ}-{VER}` | `XEN-CHK-DOC001-042-1.2` |
| `DOC_ID` | UUID | `DOC001` |
| `SEQ` | Integer (3-digit zero-padded) | `042` |
| `VER` | Pipeline version | `1.2` |

**Chunk Lifecycle by Version — چرخه حیات قطعه بر اساس نسخه**

| Event | Effect on Chunks | Action |
|-------|-----------------|--------|
| MINOR pipeline update | Chunks remain valid | No change |
| MAJOR pipeline update | Chunks are stale | Re-chunk + re-embed |
| Embedding model change | Chunks valid, embeddings stale | Re-embed only |
| Chunking strategy change | Chunks invalid | Full re-chunk |
| Chunk schema change | Chunks invalid | Full re-chunk |

**Chunk Invalidation Rules — قوانین ابطال قطعات**

| Condition | Chunk Status | Action Required |
|-----------|-------------|-----------------|
| Same pipeline version | ✅ Valid | None |
| Same MAJOR, newer MINOR | ⚠️ Valid (compatible) | Optional re-embed |
| Newer MAJOR | ❌ Stale | Full reprocessing required |
| New embedding model (same MAJOR) | ⚠️ Chunk OK, embedding stale | Re-embed only |

---

## 6. Embedding Versioning — نسخه‌بندی Embedding

**Embedding Version Metadata — فراداده نسخه Embedding**

| Field | Description | Example |
|-------|-------------|---------|
| `model_name` | Embedding model identifier | `intfloat/multilingual-e5-large` |
| `model_version` | Model version (from registry) | `1.0.2` |
| `pipeline_version` | Pipeline version at time of embedding | `1.2` |
| `embedding_dimensions` | Vector dimensionality | `1024` |
| `created_at` | Embedding timestamp | `2025-06-26T10:30:00Z` |

**Embedding Re-Generation Strategy — راهبرد بازتولید Embedding**

| Stage | Scope | Priority | Batch Size | Rate Limit |
|-------|-------|----------|-----------|------------|
| 1 | Active documents (queried last 7 days) | Critical | 1,000/day | Immediate |
| 2 | Recent documents (last 90 days) | High | 10,000/day | Per-hour limit |
| 3 | All documents (last 12 months) | Medium | 50,000/day | Per-hour limit |
| 4 | Archived documents | Low | On-demand | Best effort |

**Embedding Quality Validation — اعتبارسنجی کیفیت Embedding**

| Test | Method | Pass Criteria |
|------|--------|---------------|
| Retrieval precision | Compare top-10 results old vs new | New >= old - 2% |
| Semantic similarity | Cosine similarity on test set | > 0.95 correlation |
| Dimensionality check | Verify dimension count | Matches expected |
| Embedding drift | Mean cosine shift on 10K sample | < 0.05 |

---

## 7. Metadata Versioning — نسخه‌بندی فراداده

**Metadata Schema Version — نسخه طرح فراداده**

| Version Field | Location | Format |
|--------------|----------|--------|
| `metadata_schema_version` | Document record | `MAJOR.MINOR` (e.g., `2.1`) |
| Schema definition | `governance/metadata-schema.md` | Documented per version |

**Schema Migration Rules — قوانین مهاجرت طرح**

| Change Type | Version Bump | Compatibility | Action |
|-------------|-------------|---------------|--------|
| New optional field | MINOR | ✅ Backward compatible | Added to builder |
| New required field | MAJOR | ❌ Breaking | Migration script required |
| Field type change | MAJOR | ❌ Breaking | Migration script + validation |
| Field deprecation | MINOR | ✅ Backward compatible | Warning log, still accepted |
| Field removal | MAJOR | ❌ Breaking | Migration script + 2-cycle notice |

**Metadata Migration Process — فرآیند مهاجرت فراداده**

| Step | Action | Responsible |
|------|--------|-------------|
| 1 | Update metadata schema in `governance/metadata-schema.md` | Governance team |
| 2 | Create migration script (`migrations/metadata-v1-to-v2.py`) | Engineering team |
| 3 | Run migration on staging — validate 1,000 documents | QA team |
| 4 | Run migration on production (batch, off-peak) | SRE team |
| 5 | Verify migrated documents match expected schema | QA team |
| 6 | Update Metadata Service to produce new schema version | Engineering team |

---

## 8. Version Lifecycle — چرخه حیات نسخه

| Phase | Description | Duration | Support |
|-------|-------------|----------|---------|
| **Active** | Current version, full support | Indefinite | ✅ Bugs, ✅ Features |
| **Maintenance** | Previous MAJOR version, critical fixes only | 2 MAJOR cycles | ✅ Critical bugs only |
| **Deprecated** | Still running but no support | Until decommissioned | ❌ No fixes |
| **EOL** | Decommissioned, no longer available | — | ❌ |

**Version Support Matrix — ماتریس پشتیبانی نسخه**

| Pipeline Version | Status | Released | EOL Date |
|-----------------|--------|----------|----------|
| v1.x | Maintenance | Q1 1405 | Q1 1407 |
| v2.x | Active | Q1 1406 | TBD |
| v3.x | Development | Q3 1406 (planned) | TBD |

---

## 9. Version Registry — ثبـت نسخه

**Pipeline Version Registry — ثبـت نسخه پایپ‌لاین**

| Version | Date | Changes | Migration |
|---------|------|---------|-----------|
| 1.0.0 | Tir 1405 | Initial pipeline definition | — |
| 1.1.0 | — | TBD | Auto (MINOR) |
| 2.0.0 | — | TBD | Migration guide required |

**Embedding Model Registry — ثبـت مدل Embedding**

| Model Name | Version | Dimensions | Language | Active |
|------------|---------|-----------|----------|--------|
| `intfloat/multilingual-e5-large` | 1.0.0 | 1024 | Multi (100+) | ✅ |
| `intfloat/multilingual-e5-base` | 1.0.0 | 768 | Multi (100+) | Fallback |
