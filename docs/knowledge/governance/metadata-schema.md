# شِمای فرادادهٔ جامع — Universal Metadata Schema

**Version:** 1.0.0 | **Status:** Published | **Last Updated:** Tir 1405

---

## 1. Core Metadata (فرادادهٔ هسته)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | UUID | ✅ | Unique document identifier | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| `title` | Text | ✅ | Full document title (bilingual preferred) | `IEC 60038 – Standard Voltages` |
| `title_fa` | Text | ✅ | Persian title | `استاندارد IEC 60038 – ولتاژهای استاندارد` |
| `title_en` | Text | ✅ | English title | `IEC 60038 – Standard Voltages` |
| `description` | Text | ✅ | Abstract or scope summary | `Defines standard voltage ratings for AC and DC systems up to 1 kV` |
| `language` | Enum | ✅ | Document language | `fa`, `en`, `de`, `fr`, `ar` |
| `document_type` | Enum | ✅ | Type classification | `standard`, `tariff`, `catalog`, `datasheet`, `manual`, `article`, `book`, `regulation`, `case` |
| `format` | Enum | ✅ | File format | `pdf`, `docx`, `html`, `epub`, `dwg`, `xlsx` |
| `page_count` | Integer | Optional | Number of pages | `147` |
| `file_size` | Integer | Optional | Size in bytes | `2457600` |
| `created_at` | DateTime | ✅ | Ingestion timestamp | `2025-06-15T10:30:00Z` |
| `updated_at` | DateTime | ✅ | Last modification timestamp | `2025-06-20T14:00:00Z` |
| `version` | String | ✅ | Document version | `1.0.0`, `1403` |
| `status` | Enum | ✅ | Lifecycle stage | `draft`, `reviewed`, `approved`, `archived` |
| `tags` | Array[String] | Optional | Bilingual keyword tags | `["voltage", "ولتاژ", "standard", "استاندارد"]` |
| `workspace_id` | UUID | ✅ | Multi-tenant scope | `wks-001` |

---

## 2. Electrical Engineering Metadata (فرادادهٔ مهندسی برق)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `voltage_level` | Enum | Optional | Nominal voltage category | `LV` (< 1 kV), `MV` (1–36 kV), `HV` (36–230 kV), `EHV` (> 230 kV) |
| `equipment_type` | Enum | Optional | Primary equipment category | `transformer`, `cable`, `circuit_breaker`, `surge_arrester`, `motor`, `switchgear`, `busbar` |
| `standard_reference` | String | Optional | Applicable standard code | `IEC 60909`, `IEEE 80`, `ISIRI 1234` |
| `engineering_discipline` | Enum | Optional | Sub-discipline | `power`, `protection`, `grounding`, `lightning`, `cable`, `switchgear`, `motor`, `renewable`, `building`, `industrial` |
| `calculation_parameters` | JSON | Optional | Key numeric parameters | `{"voltage": 20, "current": 630, "frequency": 50}` |
| `design_criteria` | JSON | Optional | Design boundary conditions | `{"ambient_temp": 40, "altitude": 1000, "soil_resistivity": 100}` |

---

## 3. AI Intelligence Metadata (فرادادهٔ هوش مصنوعی)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `confidence_score` | Float | ✅ | AI certainty (0.0 – 1.0) | `0.92` |
| `source_tier` | Integer | ✅ | Authority tier per source hierarchy | `1` |
| `reasoning_path` | Array[String] | Optional | Trace of AI reasoning steps | `["extracted from §4.2 of IEC 60909", "validated against manufacturer datasheet"]` |
| `evidence_count` | Integer | Optional | Number of supporting evidence items | `3` |
| `verified_by` | String | Optional | Reviewer or validating agent | `human_reviewer@xennic.io` |
| `review_status` | Enum | ✅ | Human review status | `pending`, `approved`, `rejected`, `needs_revision` |
| `hallucination_risk` | Enum | ✅ | Estimated hallucination risk | `low`, `medium`, `high` |
| `last_validated` | DateTime | ✅ | Most recent validation timestamp | `2025-06-18T09:00:00Z` |
| `validation_method` | Enum | ✅ | How validation was performed | `cross_reference`, `expert_review`, `automated_check` |

---

## 4. RAG Metadata (فرادادهٔ RAG)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `chunk_count` | Integer | ✅ | Number of chunks this document was split into | `24` |
| `chunk_strategy` | Enum | ✅ | Segmentation approach | `semantic`, `fixed_length`, `hierarchical`, `recursive` |
| `embedding_model` | String | ✅ | Model used for vector embedding | `intfloat/multilingual-e5-large` |
| `embedding_dimension` | Integer | ✅ | Embedding vector size | `1024` |
| `retrieval_count` | Integer | Optional | How many times document was retrieved | `156` |
| `rerank_score` | Float | Optional | Cross-encoder reranker score | `0.87` |
| `hybrid_search_weight` | Float | ✅ | Weight for dense vs. sparse retrieval | `0.7` (dense) |

---

## 5. Traceability Metadata (فرادادهٔ ردیابی)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `source_document_id` | UUID | Optional | Parent document (if derived) | `a1b2c3d4-...` |
| `derived_from` | String | Optional | Original source description | `Scanned version of IEC 60038:2021` |
| `superseded_by` | UUID | Optional | Newer version of this document | `z9y8x7w6-...` |
| `related_documents` | Array[UUID] | Optional | Semantically related docs | `["uuid-1", "uuid-2", "uuid-3"]` |
| `citations` | Array[String] | Optional | List of citations within document | `["IEC 60909 §4.2", "IEEE 80 §7.3"]` |
| `provenance_chain` | Array[Object] | Optional | Full chain of custody | `[{"agent": "vision-service", "action": "ocr", "timestamp": "..."}]` |
| `ingestion_pipeline` | String | ✅ | Pipeline that processed this doc | `vision-ocr-v2`, `api-upload-v1`, `batch-import-v1` |
| `original_source_url` | String | Optional | Where the document was obtained | `https://webstore.iec.ch/publication/...` |
| `checksum` | String | ✅ | SHA-256 for integrity verification | `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

---

## Schema Extension Rules

1. New metadata sections may be added via governance amendment without breaking existing documents.
2. All Timestamps MUST be UTC in ISO 8601 format.
3. Enum values are lowercase, hyphen-separated (e.g., `circuit_breaker`, not `CircuitBreaker`).
4. JSON fields MUST validate against a JSON Schema stored in `schemas/metadata/`.
5. Required fields MUST be populated at ingestion time; missing required fields cause ingestion rejection.
