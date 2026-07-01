# رانتایم اعتبارسنجی — Validation Runtime

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. نمای کلی معماری اعتبارسنجی — Validation Architecture Overview

The Validation Runtime governs how documents are validated across six independent layers before publication. Every document must pass through all applicable validation layers before it may enter the knowledge base.

### اصول معماری — Architecture Principles

| اصل | Principle | Description |
|-----|-----------|-------------|
| **لایه‌های مستقل** | Independent Layers | Each validation layer operates independently; layer failure does not block other layers from reporting |
| **نتایج سه‌گانه** | Ternary Outcomes | Each layer can PASS, FAIL, or FLAG (requires human review) |
| **شکست سریع** | Fail Fast | Documents with fatal validation errors are rejected immediately without processing subsequent layers |
| **بشر در حلقه** | Human in the Loop | Flagged documents enter a human review queue for domain expert assessment |
| **قابلیت ردگیری** | Full Audit Trail | Every validation decision is logged with timestamp, layer, rule, and evidence |

### نتایج اعتبارسنجی — Validation Outcomes

| Outcome | Label | Meaning | Next Action |
|---------|-------|---------|-------------|
| ✅ | **PASS** | Document meets all criteria for this layer | Proceed to next layer or publication |
| ❌ | **FAIL** | Document has a fatal validation error | Route to error queue with documented reason |
| ⚠️ | **FLAG** | Document requires human expert review | Route to human review queue |

---

## 2. معماری شش‌لایه — Six-Layer Architecture

### لایه ۱: اعتبارسنجی فایل — Layer 1: File Validation

Validates the physical document structure and integrity before any content-level processing begins.

| Check | Rule | Measurement | Failure Action |
|-------|------|-------------|----------------|
| **Format conformance** | File must be valid PDF/DOCX/HTML/MD/TIFF per source type | MIME type + magic byte verification | Reject with `INVALID_FORMAT` |
| **Size limits** | File size between 1 KB and 100 MB | File size in bytes | Reject with `SIZE_OUT_OF_RANGE` |
| **Virus scan** | No malware detected | ClamAV or equivalent scan result | Quarantine + alert with `SECURITY_FAILURE` |
| **Checksum verification** | SHA-256 hash matches submitted checksum (if provided) | Hash comparison | Flag if mismatch; reject if tamper suspected |
| **Page count** | Between 1 and 5000 pages (documents only) | Page count extraction | Reject with `PAGE_COUNT_EXCEEDED` |
| **Encryption/DRM** | Document must not be encrypted or DRM-protected | Encryption detection | Reject with `ENCRYPTED_DOCUMENT` |

**Outcome logic:** Format invalid → immediate reject. Checksum mismatch → flag for human review. All other failures → reject.

**Target success rate:** > 99%

---

### لایه ۲: اعتبارسنجی فراداده — Layer 2: Metadata Validation

Ensures the document metadata is complete, accurate, and compliant with the Xennic metadata schema.

| Check | Rule | Measurement | Failure Action |
|-------|------|-------------|----------------|
| **Required fields** | All core metadata fields populated per `metadata-schema.md` | Field presence check | Return for completion with `MISSING_REQUIRED_FIELD` |
| **Completeness** | ≥ 80% of estimated fields populated | Fill rate calculation | Flag at 60–80%; reject if < 60% |
| **Domain classification** | Must match valid taxonomy codes from `taxonomy.md` | Taxonomy validation | Reject with `INVALID_DOMAIN` |
| **Source tier** | Must be valid tier (1–5) per `source-hierarchy.md` | Tier validation | Reject with `INVALID_TIER` |
| **Language** | Detected language must match declared language | CLD3 or equivalent classifier | Flag for mismatch |
| **Date validity** | Publication date not in the future; modification date after creation date | Date logic check | Flag for human review |

**Target success rate:** > 95%

---

### لایه ۳: اعتبارسنجی معنایی — Layer 3: Semantic Validation

Verifies that the document's content is semantically well-formed and terminologically consistent.

| Check | Rule | Measurement | Failure Action |
|-------|------|-------------|----------------|
| **Vocabulary compliance** | All significant terms resolve via `engineering-vocabulary.md` | Term resolution rate | Flag unresolvable terms for semantic review |
| **Synonym resolution** | No unresolved synonyms remain in content | Synonym check | Flag unresolved synonyms |
| **Acronym resolution** | All acronyms expanded via `acronym-dictionary.md` | Acronym expansion check | Flag unexpanded acronyms |
| **Unit normalization** | All units expressed in canonical form per `unit-normalization.md` | Unit format check | Flag non-canonical units |
| **Bilingual consistency** | FA/EN terms consistent with `bilingual-lexicon.md` | Term pair validation | Flag inconsistent translations |

**Target success rate:** > 90%

---

### لایه ۴: اعتبارسنجی مهندسی — Layer 4: Engineering Validation

Validates the engineering correctness of extracted content against Xennic's canonical engineering models.

| Check | Rule | Measurement | Failure Action |
|-------|------|-------------|----------------|
| **Source hierarchy compliance** | Citations follow tier rules per `source-hierarchy.md` | Citation tier validation | Flag non-compliant citations |
| **Concept validity** | Extracted concepts match `canonical-concepts.md` | Concept resolution | Fail if unresolvable; flag if partial match |
| **Entity validity** | Extracted entities match `engineering-entities.md` | Entity resolution | Fail with `UNKNOWN_ENTITY` |
| **Relationship validity** | Relationships follow `engineering-relations.md` direction rules | Relationship rule check | Fail with `INVALID_RELATIONSHIP` |
| **Engineering plausibility** | Values cross-checked against known ranges (e.g., 132 kV line voltage plausible, 132 V not) | Range validation | Flag unusual values for engineering review |

**Target success rate:** > 85%

---

### لایه ۵: اعتبارسنجی دانش — Layer 5: Knowledge Validation

Ensures the knowledge is original, non-contradictory, and consistent with the existing knowledge corpus.

| Check | Rule | Measurement | Failure Action |
|-------|------|-------------|----------------|
| **Deduplication** | No exact duplicate (checksum match) in knowledge base | Checksum comparison | Route to merge handler with `DUPLICATE` |
| **Near-duplicate detection** | Cosine similarity ≤ 0.95 with existing documents | Embedding similarity | Flag for merge or replace |
| **Consistency check** | New knowledge must not contradict existing high-confidence knowledge | Logical consistency verification | Flag potential contradictions |
| **Completeness** | All required relationships mapped per concept model | Relationship coverage | Flag incomplete mappings |
| **Cross-reference validation** | Citations to existing standards are valid and current | Standard edition check | Fail outdated references |

**Target success rate:** > 90%

---

### لایه ۶: اعتبارسنجی انتشار — Layer 6: Publication Validation

The final gate before a knowledge object is published to any production target.

| Check | Rule | Measurement | Failure Action |
|-------|------|-------------|----------------|
| **Previous layers** | All prior layers passed or flagged-and-cleared | Status check | Block publication with `PENDING_VALIDATIONS` |
| **Final completeness** | All required fields, chunks, and relationships present | Completeness scan | Return for enrichment |
| **Confidence scoring** | Confidence score per `confidence-scoring.md` | Score computation | Route for enrichment if below threshold |
| **Minimum confidence** | ≥ 0.6 for Tier 1–2; ≥ 0.5 for Tier 3–5 | Threshold comparison | Route for enrichment |
| **RAG readiness** | Chunk count > 0; embeddings generated | Chunk + embedding check | Block with `RAG_NOT_READY` |
| **Graph readiness** | Entity nodes created; relationships mapped | Graph state check | Block with `GRAPH_NOT_READY` |

**Role:** Final gate before publication. Documents that pass all checks proceed to the Publication Runtime.

---

## 3. جدول قوانین اعتبارسنجی — Validation Rules Master Table

| # | Layer | Check | Rule | Failure Action | Escalation | SLA |
|---|-------|-------|------|----------------|------------|-----|
| 1 | File | Format conformance | Valid MIME + magic bytes | Reject | — | < 5 s |
| 2 | File | Size limits | 1 KB ≤ size ≤ 100 MB | Reject | — | < 1 s |
| 3 | File | Virus scan | No malware | Quarantine + alert | Security team | < 30 s |
| 4 | File | Checksum | SHA-256 match | Flag / Reject | Uploader | < 2 s |
| 5 | File | Page count | 1 ≤ pages ≤ 5000 | Reject | — | < 3 s |
| 6 | Metadata | Required fields | All core fields present | Return for completion | — | < 1 s |
| 7 | Metadata | Completeness | ≥ 80% fill rate | Flag at 60–80% | Reviewer | < 2 s |
| 8 | Metadata | Domain classification | Valid taxonomy code | Reject | Taxonomy admin | < 1 s |
| 9 | Metadata | Source tier | Valid tier 1–5 | Reject | — | < 1 s |
| 10 | Metadata | Language match | Detected = declared | Flag | Reviewer | < 3 s |
| 11 | Semantic | Vocabulary | Terms resolve | Flag unresolvable | Semantic reviewer | < 10 s |
| 12 | Semantic | Synonyms | Resolved | Flag unresolved | Semantic reviewer | < 5 s |
| 13 | Semantic | Acronyms | All expanded | Flag unexpanded | Semantic reviewer | < 5 s |
| 14 | Semantic | Units | Canonical form | Flag non-canonical | Unit specialist | < 5 s |
| 15 | Semantic | Bilingual terms | Consistent | Flag inconsistency | Bilingual reviewer | < 5 s |
| 16 | Engineering | Source hierarchy | Citation tier rules | Flag | Engineering reviewer | < 10 s |
| 17 | Engineering | Concepts | Match canonical list | Fail/Flag | Concept admin | < 15 s |
| 18 | Engineering | Entities | Match entity model | Fail | Entity admin | < 15 s |
| 19 | Engineering | Relationships | Valid direction rules | Fail | Relation admin | < 15 s |
| 20 | Engineering | Plausibility | Known value ranges | Flag | Engineering expert | < 10 s |
| 21 | Knowledge | Deduplication | No checksum match | Route to merge | — | < 5 s |
| 22 | Knowledge | Near-duplicate | Similarity ≤ 0.95 | Flag merge/replace | Knowledge admin | < 30 s |
| 23 | Knowledge | Consistency | No contradictions | Flag conflict | Domain expert | < 30 s |
| 24 | Knowledge | Completeness | All relationships mapped | Flag | Knowledge admin | < 15 s |
| 25 | Knowledge | Cross-reference | Valid current editions | Fail outdated | Standards admin | < 10 s |
| 26 | Publication | Previous layers | All passed/cleared | Block | — | < 2 s |
| 27 | Publication | Completeness | Final check | Return for enrichment | — | < 5 s |
| 28 | Publication | Confidence | Score ≥ threshold | Route for enrichment | Quality admin | < 10 s |
| 29 | Publication | RAG readiness | Chunks + embeddings ready | Block | Engineering | < 5 s |
| 30 | Publication | Graph readiness | Nodes + edges mapped | Block | Engineering | < 5 s |

---

## 4. مدیریت شکست‌ها — Failure Handling

### انواع اقدامات — Action Types

| Action | Description | Applicable To |
|--------|-------------|---------------|
| **Reject** | Document returned to sender with error code and reason | File format, size, virus, encryption, invalid metadata |
| **Route for revision** | Automatic return to appropriate processing stage | Missing required fields, incomplete metadata |
| **Route for human review** | Queued for domain expert review with context | Flags from any layer, near-duplicates, conflicts |
| **Merge handler** | Duplicate routed to deduplication workflow | Exact checksum duplicates |
| **Quarantine** | Document isolated for security investigation | Virus/malware detection |

### فرآیند خطا — Error Workflow

All failures are logged with:
- **Timestamp:** UTC + Iran timezone label
- **Layer:** Which validation layer raised the failure
- **Rule:** The specific rule that was violated
- **Document ID:** Unique ingestion identifier
- **Evidence:** The data that triggered the failure (truncated if large)
- **Action taken:** What system did in response

### صف خطا — Error Queue

| Component | Description |
|-----------|-------------|
| **Dead Letter Queue** | Documents that exhaust all retries (3 attempts) |
| **Error Dashboard** | Web UI showing queue depth, error distribution, per-document drill-down |
| **Alerting** | Queue depth > 20 or same error recurring > 5× in 1 hour triggers notification |

### صف بررسی انسانی — Human Review Queue

| Component | Description |
|-----------|-------------|
| **Review Dashboard** | Per-document context: validation failures, suggested actions, document preview |
| **Reviewer Actions** | Approve, reject, modify metadata, request more information |
| **Escalation** | If no action within 48 hours, escalate to next reviewer tier |
| **Re-entry** | Reviewed documents re-enter pipeline at the appropriate validation stage |

---

## 5. الزامات تأیید — Approval Requirements

| Validation Layer | Auto-Pass Criteria | Human Review Required | Never Auto-Pass |
|------------------|--------------------|-----------------------|-----------------|
| **Layer 1 (File)** | Format valid, size OK, virus clean, checksum matches | Checksum mismatch (flag) | Encrypted, malware, format invalid |
| **Layer 2 (Metadata)** | ≥ 80% completeness, valid domain, valid tier | 60–80% completeness, language mismatch | < 60% completeness |
| **Layer 3 (Semantic)** | > 90% resolution rate | < 90% resolution, unresolved synonyms | — |
| **Layer 4 (Engineering)** | Tier 3–5 sources, valid entities/relationships | Tier 1–2 always reviewed, unusual values | Unresolvable entities |
| **Layer 5 (Knowledge)** | No conflicts, similarity ≤ 0.95 | Potential conflicts, near-duplicates | — |
| **Layer 6 (Publication)** | Confidence ≥ threshold for tier | Confidence < threshold | Missing chunks or graph data |

---

## 6. اعتبارسنجی بر اساس نوع سند — Per-Document-Type Overrides

| Document Type | Skip Layer | Reason |
|---------------|------------|--------|
| **Scanned images** | Layer 1 page count | No native page structure; handled by OCR |
| **Batch imports** | Layer 2 metadata completeness | Metadata may be minimal; filled from manifest |
| **Web crawler results** | Layer 3 vocabulary | External web content may use non-standard terminology |
| **Internal Xennic documents** | Layer 4 source hierarchy | Already compliant by definition |
| **Updates to existing knowledge** | Layer 5 deduplication | Update is intentional; skip duplicate check |

---

## 7. شاخص‌های کلیدی عملکرد — Key Performance Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| File validation pass rate | > 99% | Passed / Total documents |
| Metadata completeness average | > 85% | Average fill rate across all documents |
| Semantic resolution rate | > 90% | Resolved terms / Total significant terms |
| Engineering validation pass rate | > 85% | Passed / Total engineering documents |
| Knowledge conflict rate | < 2% | Conflicting / Total published documents |
| Human review turnaround | < 48 hours | Average time from flag to decision |
| False positive flag rate | < 5% | Valid documents flagged / Total flagged |
| End-to-end validation time | < 5 min for 95% of documents | Total validation duration per document |
