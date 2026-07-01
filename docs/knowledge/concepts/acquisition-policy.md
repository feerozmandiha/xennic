# سیاست کسب دانش — Knowledge Acquisition Policy

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. Purpose

Define what knowledge may enter the Xennic knowledge base, how it is acquired, validated, and maintained. This policy ensures only authoritative, traceable, and legally compliant knowledge enters the system.

### Scope

This policy applies to:
- All documents, standards, regulations, and data ingested into the Xennic knowledge base
- All acquisition channels (API, batch import, manual upload, web crawler)
- All source tiers (1–5) as defined in the Source Trust Hierarchy
- All AI services that consume knowledge base content

### Out of Scope

- User-generated content created within Xennic applications (governed separately)
- Real-time operational data (SCADA, telemetry) — governed by data ingestion pipeline
- AI model training data — governed by AI training policy

---

## 2. Allowed Sources (by Tier)

### Tier 1 — International Standards

| Property | Value |
|----------|-------|
| Allowed Bodies | IEC, IEEE, ISO, ANSI, NEMA, CIGRE technical brochures |
| Languages | English (primary), French, German (where applicable) |
| Ingestion | Full text for publicly available portions; metadata-only for paywalled |
| Copyright | Respect copyright; only ingest portions that are publicly available or properly licensed |
| Validation | Full text required for authoritative citation; metadata-only if paywalled |

**Examples:**
| Standard | Body | Access Type |
|----------|------|-------------|
| IEC 60038 | IEC | Paywalled (metadata only) |
| IEEE 80 | IEEE | Paywalled (metadata only) |
| ISO 9001 | ISO | Paywalled (metadata only) |
| CIGRE TB 123 | CIGRE | Member access |

### Tier 2 — National Regulations

| Property | Value |
|----------|-------|
| Allowed Bodies | ISIRI, Tavanir, Ministry of Energy, SATBA |
| Languages | Persian (primary), English (translation) |
| Ingestion | Full ingestion permitted for Iranian regulations |
| Validation | Official publication verification; effective date confirmation |

**Examples:**
| Regulation | Issuer | Access Type |
|------------|--------|-------------|
| ISIRI 1234 | ISIRI | Public domain (full ingestion) |
| Tavanir Technical Regulation §4 | Tavanir | Public domain (full ingestion) |
| Ministry of Energy Code 14-3 | Ministry of Energy | Public domain (full ingestion) |
| SATBA Renewable Energy Directive | SATBA | Public domain (full ingestion) |

### Tier 3 — Manufacturer Documentation

| Property | Value |
|----------|-------|
| Allowed Sources | Published catalogs, datasheets, application guides, installation manuals |
| Languages | English (primary), Persian (where available) |
| Ingestion | Full text of officially published documents only |
| Restrictions | No internal or confidential documents; no draft/pre-release content |
| Validation | Manufacturer website verification; document authenticity check |

**Examples:**
| Document | Manufacturer | Verification Method |
|----------|-------------|-------------------|
| SIVACON Switchgear Catalog | Siemens | Web verification + checksum |
| VD4 Circuit Breaker Datasheet | ABB | Web verification |
| LV Switchboard Manual | Schneider Electric | Web verification |
| Cable Selection Guide | Prysmian | Web verification |

### Tier 4 — Peer Reviewed Research

| Property | Value |
|----------|-------|
| Allowed Sources | Published journal articles, conference papers, CIGRE papers, PhD theses |
| Languages | English (primary), Persian (accepted) |
| Ingestion | Abstracts + metadata preferred; full text only with permission |
| Restrictions | Respect copyright; DOI must exist and be resolvable |
| Validation | DOI verification; peer review status confirmation |

**Examples:**
| Publication | Type | DOI Required |
|-------------|------|--------------|
| IEEE Transactions on Power Delivery | Journal article | ✅ |
| CIGRE Session 2024 Paper | Conference paper | ✅ |
| PhD Thesis (university repository) | Thesis | Optional |
| IET Conference Proceedings | Conference paper | ✅ |

### Tier 5 — Verified Industry Knowledge

| Property | Value |
|----------|-------|
| Allowed Sources | Engineering forum content (verified); industry white papers; technical blog posts by verified engineers |
| Languages | Any |
| Ingestion | Must be independently verified before ingestion |
| Restrictions | Maximum 5% of total knowledge base content |
| Validation | Human expert review required; must cite original source |

**Examples:**
| Source | Type | Verification Required |
|--------|------|----------------------|
| Eng-Tips forum thread | Forum | Expert review + source citatio |
| LinkedIn engineering article | Blog post | Author credential verification |
| Industry white paper (vendor) | White paper | Cross-reference with standards |

---

## 3. Prohibited Sources

| Category | Examples | Reason for Prohibition |
|----------|----------|----------------------|
| Marketing materials | Product brochures without technical content | No engineering value |
| Unverified forums | Reddit, general discussion boards | Unreliable, no authority |
| Outdated standards | Superseded for > 5 years | Risk of incorrect engineering |
| Pirated content | Unlicensed PDFs, torrented documents | Legal liability |
| Confidential documents | Internal memos, NDAs, trade secrets | Legal liability + ethics |
| AI-generated content | LLM outputs, GPT-generated text | Recursive training contamination |
| Social media | Tweets, Instagram, Facebook posts | No engineering authority |
| Anonymous content | No identifiable author or source | No accountability |

### Exception Process for Prohibited Sources

An otherwise prohibited source MAY be ingested if:
1. The source contains unique engineering data not available elsewhere
2. A Domain Expert certifies its technical value
3. Legal clearance is obtained (for copyright/confidentiality concerns)
4. The Knowledge Board approves by majority vote
5. The source is flagged with `exception: true` in metadata

---

## 4. Acquisition Workflow

```
Source Discovery
       ↓
    ┌──────────┐
    │  Triage   │  ← Tier classification, copyright check, duplicate detection
    └─────┬────┘
          ↓
    ┌───────────┐
    │ Ingestion │  ← Document import via pipeline or manual upload
    └─────┬─────┘
          ↓
    ┌───────────┐
    │ Validation│  ← Source authenticity, checksum, format validation
    └─────┬─────┘
          ↓
    ┌───────────┐
    │ Extraction│  ← Metadata extraction, content parsing, entity recognition
    └─────┬─────┘
          ↓
    ┌───────────┐
    │  Quality  │  ← Quality scoring per data-quality-policy.md
    │  Scoring  │
    └─────┬─────┘
          ↓
    ┌──────────┐
    │  Review   │  ← Human review for Tier 1–2; automated for Tier 3–5
    └─────┬────┘
          ↓
    ┌───────────┐
    │Publication│  ← Index, embed, add to knowledge graph
    └───────────┘
```

### Step Details

| Step | Activities | Duration | Owner |
|------|-----------|----------|-------|
| 1. Identification | Source discovered via monitoring, user submission, or automated crawler | Continuous | Knowledge Base Team |
| 2. Triage | Tier classification, copyright check, duplicate detection, relevance scoring | 1 business day | Automated + Domain Expert |
| 3. Ingestion | Document import via pipeline (PDF, DOCX, HTML) or manual upload | Automated (< 1 hour) | Knowledge Base Team |
| 4. Validation | Source authenticity, checksum verification, malware/virus scan, format validation | Automated (< 30 min) | Automated pipeline |
| 5. Extraction | Metadata extraction (title, author, date, language), content parsing, entity recognition | Automated (< 2 hours) | NLP pipeline |
| 6. Quality Scoring | Per data-quality-policy.md: completeness, accuracy, freshness | Automated (< 10 min) | Quality scoring engine |
| 7. Review | Human review for Tier 1–2 and safety-critical content; automated review for Tier 3–5 | 1–5 business days | Domain Expert / Automated |
| 8. Publication | Add to search index, generate vector embeddings, add to knowledge graph | Automated (< 1 hour) | Knowledge Base Team |

---

## 5. Validation Workflow

### 5.1 Automated Checks

| Check | Description | Method | Fail Action |
|-------|-------------|--------|-------------|
| Format validation | File is valid PDF/DOCX/HTML | Magic byte + header check | Reject with format error |
| Checksum verification | File integrity confirmed | SHA-256 comparison | Re-request upload |
| Malware scan | No malicious content | ClamAV / equivalent | Quarantine + alert |
| Language detection | Language correctly identified | ML language detector | Flag for manual review |
| Encoding check | Character encoding valid | Unicode validation | Auto-correct or reject |
| File size limit | < 50 MB per document | Size check | Request split or compress |

### 5.2 Metadata Validation

| Check | Description | Method | Fail Action |
|-------|-------------|--------|-------------|
| Completeness | All required fields present | Schema validation | Reject with missing field list |
| Taxonomy compliance | Fields match defined taxonomy | Enum validation | Reject with invalid values |
| Source tier verification | Tier matches source type | Rule-based check | Reclassify or reject |
| Date validity | Publication date is valid and in past | Date validation | Flag for manual correction |
| Language consistency | Document language matches metadata | Cross-check detector vs. metadata | Flag for manual review |

### 5.3 Content Validation

| Check | Description | Method | Fail Action |
|-------|-------------|--------|-------------|
| Cross-reference check | Content does not contradict existing knowledge | Semantic similarity + graph query | Flag for expert review |
| Consistency check | Internal consistency of definitions and values | Rule-based + NLP | Flag for revision |
| Plagiarism check | Not a duplicate of existing content | Similarity search | Reject if > 80% overlap |
| Entity extraction | Key entities (standards, equipment, parameters) identified | NER pipeline | Flag for manual extraction |

### 5.4 Expert Validation

| Trigger | Who | Scope | Duration |
|---------|-----|-------|----------|
| Tier 1 ingestion | Domain Expert + Standards Reviewer | Full content review | 3 business days |
| Tier 2 ingestion | Domain Expert | Full content review | 2 business days |
| Safety-critical content | Chief Engineer | Full content review | 2 business days |
| Cross-tier conflict detected | Domain Expert + Technical Reviewer | Conflict resolution | 3 business days |
| Automated validation failure | Domain Expert | Root cause analysis | 1 business day |
| User-submitted content | Domain Expert | Source + content verification | 3 business days |

---

## 6. Approval Workflow

| Tier | Approval Required | Turnaround | Method | Can Auto-Approve? |
|------|------------------|------------|--------|-------------------|
| 1 | Knowledge Board + Legal | 5 business days | Manual review + sign-off | No |
| 2 | Domain Lead | 3 business days | Manual review + sign-off | No |
| 3 | Automated + spot-check | 1 business day | Automated pipeline + 10% spot-check | Yes (with spot-check) |
| 4 | Domain Lead | 3 business days | Manual review of abstract + metadata | Conditional (if low risk) |
| 5 | Knowledge Board + Domain Expert | 5 business days | Full manual review | No |

### Approval Decision Matrix

| Condition | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 |
|-----------|--------|--------|--------|--------|--------|
| All checks pass | Approve | Approve | Auto-approve | Approve | Approve |
| Minor metadata issues | Conditional | Conditional | Auto-correct | Conditional | Conditional |
| Content validation warning | Return for review | Return for review | Flag + human review | Return for review | Reject |
| Duplicate detected | Reject | Reject | Reject | Reject | Reject |
| Copyright concern | Legal review | N/A | N/A | Legal review | Legal review |
| Malware / security issue | Quarantine | Quarantine | Quarantine | Quarantine | Quarantine |

---

## 7. Retention Policy

| Tier | Retention Period | Storage Class | Review Cycle | Auto-Delete |
|------|-----------------|---------------|-------------|-------------|
| 1 | Indefinite | Hot (5 years) → Warm (5+ years) | Every 5 years | No (historical record) |
| 2 | Indefinite | Hot (5 years) → Warm (5+ years) | Every 3 years | No (regulatory record) |
| 3 | 10 years from publication | Hot (2 years) → Warm (8 years) | None | After 10 years |
| 4 | 15 years from publication | Hot (2 years) → Warm (13 years) | None | After 15 years |
| 5 | 5 years with annual review | Hot (1 year) → Warm (4 years) | Annual relevance check | After 5 years (or earlier if obsolete) |

### Retention Exceptions

| Scenario | Exception | Authority |
|----------|-----------|-----------|
| Historical significance | Indefinite retention regardless of tier | Knowledge Board |
| Legal hold | Retain until hold is lifted | Legal department |
| Safety-critical content | Minimum 25 years | Chief Engineer |
| Pending litigation | Retain until litigation resolved | Legal department |

---

## 8. Update Policy

| Tier | Monitoring Frequency | Update SLA | Notification |
|------|---------------------|------------|--------------|
| 1 | Continuous (standards body RSS/API) | Within 90 days of new edition publication | Automated alert to Knowledge Board |
| 2 | Continuous (regulatory announcements) | Within 30 days of new regulation | Automated alert to Domain Lead |
| 3 | Quarterly (manufacturer website check) | Within 60 days of new catalog/datasheet | Manual check + notification |
| 4 | No active monitoring | Update on discovery | Community-sourced notification |
| 5 | Annual review cycle | Update on discovery | Knowledge Base Team |

### Update Workflow

```
New edition detected
       ↓
    ┌─────────────┐
    │ Compare diff │  ← Automated: changed sections, deprecated content
    └──────┬──────┘
           ↓
    ┌──────────────┐
    │ Impact scan  │  ← Which concepts reference this source?
    └──────┬───────┘
           ↓
    ┌──────────────┐
    │ Update plan  │  ← Metadata update, content re-ingestion, or full re-review
    └──────┬───────┘
           ↓
    ┌──────────────┐
    │ Execute      │  ← Per tier update SLA
    │ update       │
    └──────┬───────┘
           ↓
    ┌──────────────┐
    │ Notify       │  ← Dependent concept owners, AI service owners
    │ dependents   │
    └──────────────┘
```

---

## 9. Deprecation Policy

### 9.1 Deprecation Triggers

| Trigger | Description | Example |
|---------|-------------|---------|
| Superseded by newer edition | Standard body publishes new version | IEC 60909:2016 → IEC 60909:2024 |
| Withdrawn by issuing body | Standard officially withdrawn | IEEE 80-2000 withdrawn, replaced by 2013 |
| Errors discovered | Source contains verified errors | Errata published by standards body |
| Regulation replaced | New regulation supersedes old | Tavanir tariff revision |
| Domain obsolete | Topic no longer relevant | Obsolete technology standard |

### 9.2 Deprecation Process

```
Deprecation Trigger
       ↓
    ┌────────────────┐
    │ Impact Analysis │  ← 2 business days
    └───────┬────────┘
            ↓
    ┌────────────────┐
    │ Deprecation    │  ← Notice published; affected teams notified
    │ Notice         │
    └───────┬────────┘
            ↓
    ┌────────────────┐
    │ Grace Period   │  ← 90 days default
    └───────┬────────┘
            ↓
    ┌────────────────┐
    │ Deprecation    │  ← Move to Archived status; remove from active index
    │ Execution      │
    └────────────────┘
```

### 9.3 Deprecated Source Handling

| Action | Description | Timeline |
|--------|-------------|----------|
| Status change | Source → `Deprecated` status | Day 0 |
| Notice publication | Deprecation notice on source page | Day 0 |
| Grace period | Source remains accessible but marked deprecated | Day 0–90 |
| Active index removal | Removed from RAG index | Day 90 |
| Notification to AI services | Cache invalidation + update | Day 90 |
| Cold storage move | Archived for audit | Day 90 |
| Dependent concept review | Review concepts that cite this source | Day 0–90 |

### 9.4 Grace Period Configuration

| Scenario | Grace Period | Behavior During Grace |
|----------|-------------|----------------------|
| Superseded (new version) | 90 days | AI may cite with "see newer version" note |
| Withdrawn (no replacement) | 30 days | AI may cite with "standard withdrawn" disclaimer |
| Error discovered | 0 days | Immediate removal from active index |
| Regulation replaced | 30 days | AI may cite with "check current regulation" note |

---

## 10. Copyright and Licensing

### 10.1 General Principles

| Principle | Description |
|-----------|-------------|
| Compliance | All ingested content must comply with applicable copyright law |
| Attribution | Original source and access type must be recorded for all content |
| Fair Use | Only portions necessary for engineering reasoning may be ingested |
| Licensing | Licensed content must have documented license terms and expiration |
| Audit | Copyright status is auditable per metadata field |

### 10.2 Access Type Recording

| Access Type | Code | Description |
|-------------|------|-------------|
| Public Domain | `public` | Free to use without restriction |
| Open Access | `open_access` | Freely available under open license |
| Paywalled | `paywalled` | Behind paywall; metadata only |
| Licensed | `licensed` | Under specific license terms |
| Fair Use Excerpt | `fair_use` | Limited excerpt under fair use doctrine |

### 10.3 Source-Specific Rules

| Source | Copyright Status | Ingestion Rules |
|--------|-----------------|-----------------|
| IEC standards | Copyright IEC; paywalled | Metadata only; provide purchase link |
| IEEE standards | Copyright IEEE; paywalled | Metadata only; provide purchase link |
| ISIRI standards | Public domain (Iran) | Full ingestion permitted |
| Tavanir regulations | Public domain (Iran) | Full ingestion permitted |
| Ministry of Energy codes | Public domain (Iran) | Full ingestion permitted |
| SATBA regulations | Public domain (Iran) | Full ingestion permitted |
| Tavanir tariffs | Public documents | Full ingestion permitted |
| Manufacturer catalogs | Generally freely distributed | Verify terms per manufacturer |
| IEEE journal articles | Copyright IEEE | Abstract + metadata only |
| Open access journals | Varies by license (CC, etc.) | Full text if license permits |
| CIGRE papers | CIGRE member access | Metadata only; member login required |
| PhD theses | University repository | Full text if openly available |
| User-submitted content | User warrants ownership | Rights confirmation required |

### 10.4 License Tracking

For licensed content, the following MUST be recorded:

| Field | Required | Description |
|-------|----------|-------------|
| `license_type` | ✅ | Type of license (CC-BY, CC-BY-NC, custom, etc.) |
| `license_url` | ✅ | URL to license text |
| `license_expiration` | ✅ | Date when license expires |
| `license_holder` | ✅ | Entity holding the license |
| `usage_restrictions` | ✅ | Any restrictions on use or redistribution |
| `renewal_required` | ✅ | Whether license requires renewal |

---

## 11. Special Section: Iranian Engineering Knowledge

### 11.1 Iranian Standards (ISIRI)

| Property | Value |
|----------|-------|
| Issuing Body | سازمان ملی استاندارد ایران (ISIRI) |
| Legal Status | Public documents in Iran |
| Language | Persian (primary), English (translation) |
| Ingestion | Full Persian text may be ingested |
| Metadata | Bilingual (FA/EN) required |
| Cross-Reference | Equivalent international standard MUST be recorded |
| Update Monitoring | Quarterly check of ISIRI website |

**Metadata Requirements for ISIRI Standards:**

| Field | Required | Example |
|-------|----------|---------|
| `isiri_number` | ✅ | ISIRI 1234 |
| `title_fa` | ✅ | استاندارد ملی ایران ۱۲۳۴ |
| `title_en` | ✅ | Iran National Standard 1234 |
| `equivalent_standard` | ✅ | IEC 60909 |
| `publication_date` | ✅ | 1403-06-15 |
| `effective_date` | ✅ | 1403-09-15 |
| `status` | ✅ | current / superseded / withdrawn |

### 11.2 Tavanir Regulations — مقررات توانیر

| Property | Value |
|----------|-------|
| Issuing Body | شرکت مادرتخصصی تولید و انتقال نیروی برق ایران (توانیر) |
| Legal Status | Public domain; officially published |
| Language | Persian (original), English (translation) |
| Ingestion | Full ingestion permitted |
| Update Frequency | Every 6 months review |

**Document Types:**

| Type | FA | Description |
|------|----|-------------|
| Technical Distribution Regulations | مقررات توزیع برق | Grid connection, distribution network standards |
| Technical Connection Conditions | شرایط فنی انشعاب | Customer connection requirements, service entrance specifications |
| Equipment Standards | استانداردهای تجهیزات | Approved equipment lists, technical specifications |
| Safety Regulations | مقررات ایمنی | Electrical safety requirements, earthing practices |
| Operation Codes | ضوابط بهره‌برداری | Network operation guidelines, switching procedures |

**Metadata Requirements for Tavanir Documents:**

| Field | Required | Example |
|-------|----------|---------|
| `tavanir_code` | ✅ | توانیر-۱۴۰۳-۱۲۳۴ |
| `title_fa` | ✅ | ضوابط فنی توزیع برق |
| `document_type` | ✅ | regulation, tariff, standard, guideline |
| `effective_date` | ✅ | 1403-01-01 |
| `approval_authority` | ✅ | معاونت برنامه‌ریزی توانیر |
| `jurisdiction` | ✅ | national, regional |

### 11.3 Tavanir Tariffs — تعرفه‌های توانیر

| Property | Value |
|----------|-------|
| Issuing Body | وزارت نیرو / هیئت تنظیم بازار برق ایران |
| Legal Status | Public documents |
| Language | Persian (original), English (translation) |
| Ingestion | Full ingestion permitted |
| Update Frequency | Quarterly review (seasonal tariff changes) |

**Tariff Categories:**

| Category | FA | Description |
|----------|----|-------------|
| General | تعرفه‌های عمومی | Residential, commercial, public buildings |
| Industrial | تعرفه‌های صنعتی | Industrial consumers, large factories |
| Agricultural | تعرفه‌های کشاورزی | Agricultural pumps, greenhouses |
| Commercial | تعرفه‌های تجاری | Shops, malls, office buildings |
| Special | تعرفه‌های ویژه | Large industries, mining, special contracts |
| Export | تعرفه‌های صادراتی | Energy export tariffs |

**Metadata Requirements for Tariffs:**

| Field | Required | Example |
|-------|----------|---------|
| `tariff_code` | ✅ | تعرفه-صنعتی-۱۴۰۴ |
| `title_fa` | ✅ | تعرفه برق صنعتی ۱۴۰۴ |
| `category` | ✅ | industrial, agricultural, etc. |
| `effective_date` | ✅ | 1404-01-01 |
| `expiry_date` | ✅ | 1404-12-29 |
| `rate_structure` | ✅ | flat, tiered, time-of-use |
| `approval_reference` | ✅ | مصوبه شماره ۱۴۰۳-۱۲۳۴ هیئت تنظیم بازار |

### 11.4 Regional Distribution Companies — شرکت‌های توزیع برق منطقه‌ای

| Property | Value |
|----------|-------|
| Examples | توزیع برق تهران, توزیع برق فارس, توزیع برق اصفهان, توزیع برق خراسان |
| Document Types | Local connection conditions, regional tariffs, area-specific regulations |
| Validation | Confirmed by the respective distribution company |
| Hierarchy | Regional documents supplement but CANNOT override national Tavanir regulations |
| Language | Persian (primary) |

**Regional Document Rules:**

| # | Rule | Description |
|---|------|-------------|
| 1 | Subordination | Regional documents are subordinate to national Tavanir regulations |
| 2 | Supplement Only | Regional documents may provide additional detail but not contradictory rules |
| 3 | Validation | Must be confirmed by the issuing regional company |
| 4 | Jurisdiction | Applicable only within the region's service area |
| 5 | Metadata | Must include `region` field specifying the geographic scope |

---

## 12. Metrics and Reporting

| Metric | Description | Target | Reporting Frequency |
|--------|-------------|--------|---------------------|
| Ingestion throughput | Documents ingested per week | > 50 | Weekly |
| Tier distribution | % of knowledge base per tier | T1: 20%, T2: 30%, T3: 30%, T4: 15%, T5: 5% | Monthly |
| Validation pass rate | % of documents passing automated validation | > 95% | Weekly |
| Review turnaround | Average days from ingestion to publication | < 5 business days | Monthly |
| Duplicate rejection rate | % of submissio flagged as duplicate | < 5% | Monthly |
| Copyright compliance | % of documents with complete copyright metadata | 100% | Quarterly |
| Deprecation lag | Average days between source deprecation and system update | < 30 days | Quarterly |

---

## 13. Policy Compliance

| # | Requirement | Verification | Consequence of Non-Compliance |
|---|-------------|-------------|-------------------------------|
| 1 | Only allowed sources may be ingested | Automated source tier check at triage | Ingestion rejected |
| 2 | All content must have source tier classification | Metadata validation | Ingestion rejected |
| 3 | Prohibited sources must not be ingested | Automated + manual audit | Immediate removal + incident report |
| 4 | Copyright and licensing must be recorded | Metadata completeness check | Content flagged; publication blocked |
| 5 | Iranian regulations must follow special section rules | Rule-based validation | Flagged for manual correction |
| 6 | Regional documents must not override national regulations | Cross-reference validation | Flagged for escalation to Knowledge Board |

---
