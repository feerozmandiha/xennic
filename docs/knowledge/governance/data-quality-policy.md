# خط‌مشی کیفیت داده — Data Quality Policy

**Version:** 1.0.0 | **Status:** Published | **Last Updated:** Tir 1405

---

## 1. Quality Dimensions (ابعاد کیفیت)

| # | Dimension | FA | Weight | Definition | Measurement |
|---|-----------|----|--------|------------|-------------|
| 1 | Accuracy | مطابقت با منبع اصلی | 0.30 | Degree to which extracted data matches the original source verbatim | Human spot-check ratio; automated cross-reference success rate |
| 2 | Completeness | پوشش کامل فراداده | 0.25 | Percentage of required metadata fields populated at ingestion | Required field fill rate; chunk coverage |
| 3 | Consistency | یکپارچگی با طبقه‌بندی | 0.20 | Alignment with taxonomy codes, ontology entities, and naming conventions | Taxonomy validation pass rate; schema conformance |
| 4 | Timeliness | به‌روزرسانی به موقع | 0.15 | Currency of the document relative to its latest official version | Days since latest edition; version lag |
| 5 | Traceability | قابلیت ردیابی تا منبع | 0.10 | Clarity of provenance chain from original source to ingested artifact | Provenance chain depth; checksum verification |

---

## 2. Quality Gates (دروازه‌های کیفیت)

### 2.1 Ingestion Gate

Triggered when a document enters the knowledge pipeline.

| Check | Method | Failure Action |
|-------|--------|----------------|
| Format validation | MIME type verification; magic byte check | Reject with `INVALID_FORMAT` |
| Checksum verification | SHA-256 comparison with source (if available) | Flag for human review |
| Language detection | CLD3 or equivalent language classifier | Reject if unsupported language |
| Virus/malware scan | ClamAV or equivalent | Reject with `SECURITY_FAILURE` |
| File size limit | Max 500 MB per document | Reject with `SIZE_EXCEEDED` |
| Page count limit | Max 5000 pages | Reject with `PAGE_EXCEEDED` |

### 2.2 Processing Gate

Triggered after OCR/text extraction and metadata enrichment.

| Check | Method | Failure Action |
|-------|--------|----------------|
| Metadata completeness | All required fields from [Metadata Schema](./metadata-schema.md) | Reject with `INCOMPLETE_METADATA` |
| Taxonomy compliance | Domain + doc_type + application codes valid against [Taxonomy](./taxonomy.md) | Reject with `INVALID_TAXONOMY` |
| Naming convention | File name matches pattern from [Naming Conventions](./naming-conventions.md) | Auto-rename or reject |
| Entity extraction validation | Extracted entities conform to [Ontology](./ontology.md) | Flag for partial review |
| Chunk validation | All chunks have valid IDs and non-empty content | Reprocess chunks |

### 2.3 Review Gate

| Source Tier | Review Type | Reviewer | SLA |
|-------------|-------------|----------|-----|
| Tier 1 (International Standards) | Full human review | Senior electrical engineer | 5 business days |
| Tier 2 (National Regulations) | Full human review | Compliance specialist | 5 business days |
| Tier 3 (Manufacturer Docs) | Conditional review | Domain expert | 2 business days |
| Tier 4 (Peer Reviewed) | Conditional review | Technical reviewer | 3 business days |
| Tier 5 (Community Knowledge) | Full human review | Knowledge curator | 7 business days |

### 2.4 Publication Gate

Triggered before the document is made available to RAG queries.

| Check | Threshold | Action |
|-------|-----------|--------|
| Confidence score | ≥ 0.7 | Auto-publish |
| Evidence chain | ≥ 1 evidence item per claim | Auto-publish |
| Hallucination risk | Low or Medium | Auto-publish |
| Hallucination risk | High | Block and flag for expert review |
| Quality score | ≥ 0.8 | Auto-publish |
| Quality score | 0.6 – 0.8 | Conditional publish (see §4) |
| Quality score | < 0.6 | Reject |

---

## 3. Quality Scoring Formula

$$
Q = (A \times 0.30) + (C_p \times 0.25) + (C_s \times 0.20) + (T \times 0.15) + (R \times 0.10)
$$

| Symbol | Dimension | Scoring Rule |
|--------|-----------|--------------|
| \(A\) | Accuracy | 1.0 = perfect match; 0.8 = minor discrepancies; 0.5 = significant errors; 0.0 = unusable |
| \(C_p\) | Completeness | Fraction of required fields populated (0.0 – 1.0) |
| \(C_s\) | Consistency | Fraction of taxonomy/ontology checks passed (0.0 – 1.0) |
| \(T\) | Timeliness | 1.0 = current edition; 0.7 = one edition behind; 0.4 = two+ behind; 0.0 = obsolete |
| \(R\) | Traceability | Depth of provenance chain / 5 (max 1.0 for chain of 5+ steps) |

### Worked Example

A document with:
- Accuracy = 0.95 (minor OCR errors)
- Completeness = 0.88 (11 of 13 required fields)
- Consistency = 1.0 (taxonomy valid)
- Timeliness = 0.7 (one edition behind)
- Traceability = 0.8 (chain depth of 4)

$$
Q = (0.95 \times 0.30) + (0.88 \times 0.25) + (1.0 \times 0.20) + (0.7 \times 0.15) + (0.8 \times 0.10) = 0.285 + 0.220 + 0.200 + 0.105 + 0.080 = 0.890
$$

Result: **Auto-publish** (Q ≥ 0.8).

---

## 4. Remediation Process (فرایند اصلاح)

### Score < 0.6: Reject

1. Document is removed from all indices.
2. Automated notification sent to the ingestion pipeline operator.
3. A quality report is generated listing all failed dimensions.
4. Human review is mandatory before re-ingestion.
5. Re-ingestion attempts are limited to 3 per document.

### Score 0.6 – 0.8: Conditional Accept

1. Document is published but flagged with `quality_warning`.
2. An improvement plan is auto-generated:
   - Missing metadata fields are listed
   - Taxonomy corrections are suggested
   - Source verification steps are outlined
3. A 30-day remediation window is opened.
4. If quality score is not improved to ≥ 0.8 within 30 days, the document is deprecated.

### Score ≥ 0.8: Auto-Accept

1. Document is published immediately.
2. Confidence badge is set to `high`.
3. Document is eligible for AI citation without human pre-approval.
4. Periodic re-validation is scheduled (see §5).

---

## 5. Continuous Monitoring

| Period | Action | Responsible |
|--------|--------|-------------|
| Daily | Automated quality score recalculation for recently ingested documents | Pipeline |
| Weekly | Sampling check: 5% of auto-accepted docs reviewed by humans | QA team |
| Monthly | Full quality audit of Tier 1-2 documents | Knowledge curator |
| Quarterly | Taxonomy and ontology drift analysis | Governance board |
| Yearly | Policy review and update | Governance board |

---

## 6. Quality Metrics Dashboard

The following KPIs are tracked and reported monthly:

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Average quality score | ≥ 0.85 | < 0.75 |
| Ingestion rejection rate | < 5% | > 10% |
| Human review turnaround | ≤ 5 business days | > 7 business days |
| Conditional accept ratio | < 15% of all documents | > 25% |
| Re-validation pass rate | ≥ 90% | < 80% |
| Provenance chain completeness | ≥ 95% | < 85% |
