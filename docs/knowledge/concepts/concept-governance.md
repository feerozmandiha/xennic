# حاکمیت مفاهیم — Concept Governance

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. Concept Lifecycle States

| State | Description | FA |
|-------|-------------|----|
| Proposed | Idea submitted for consideration | پیشنهاد شده |
| Draft | Under development | پیش‌نویس |
| Review | Under peer/expert review | در حال بررسی |
| Approved | Approved for publication | تأیید شده |
| Published | Available for AI consumption | منتشر شده |
| Superseded | Replaced by newer version | جایگزین شده |
| Retired | Removed from active use | بازنشسته شده |

**State Transition Diagram:**

```
Proposed → Draft → Review → Approved → Published → Superseded → Retired
            ↑        ↓
            └── Rejected ←┘
```

---

## 2. Concept Creation Process

| Step | Activity | Owner | Deliverable | Duration |
|------|----------|-------|-------------|----------|
| 1 | Proposal submission (template with all required fields) | Concept Author | Completed proposal form | 1 day |
| 2 | Initial triage (domain fit, overlap check) | Domain Expert | Triage decision | 2 business days |
| 3 | Draft development (author assigned) | Concept Author | Draft concept document | 10 business days |
| 4 | Peer review (minimum 2 reviewers) | Technical Reviewer | Review comments | 5 business days |
| 5 | Domain expert sign-off | Domain Expert | Sign-off certificate | 2 business days |
| 6 | Final approval (knowledge board) | Knowledge Board | Approval record | 3 business days |
| 7 | Publication | Knowledge Base Team | Published concept | 1 business day |

**Total target SLA:** 23 business days from proposal to publication.

---

## 3. Concept Review Process

### 3.1 Review Types

| Review Type | Focus | Reviewer Role |
|-------------|-------|---------------|
| Technical Review | Accuracy of engineering content, calculations, definitions | Technical Reviewer |
| Standards Compliance Review | Alignment with standards, regulatory correctness | Standards Reviewer |
| Language Review | Clarity, consistency, bilingual correctness | Language Reviewer |

### 3.2 Reviewer Qualifications

| Requirement | Technical Reviewer | Standards Reviewer | Language Reviewer |
|-------------|-------------------|--------------------|-------------------|
| Min. domain experience | 5 years | 5 years | 3 years |
| Subject matter expertise | ✅ Required | ✅ Required | Optional |
| Standards body familiarity | Preferred | ✅ Required | Not required |
| Bilingual (FA/EN) | Preferred | Preferred | ✅ Required |
| Certifications | Professional Engineer preferred | Standards committee experience | Technical translation experience |

### 3.3 Review Criteria

| Criterion | Weight | Description | Scoring (0–1) |
|-----------|--------|-------------|----------------|
| Accuracy | 0.25 | Technical correctness of the concept definition | 0.0 – 1.0 |
| Completeness | 0.20 | All required fields, sources, and relationships populated | 0.0 – 1.0 |
| Source Quality | 0.20 | Sources cited per tier hierarchy; authoritative references | 0.0 – 1.0 |
| Clarity | 0.15 | Definition is unambiguous and well-structured | 0.0 – 1.0 |
| Consistency | 0.10 | Aligns with existing concepts and taxonomy | 0.0 – 1.0 |
| Bilingual Integrity | 0.10 | FA/EN terms match; translations are accurate | 0.0 – 1.0 |

**Passing threshold:** Weighted score > 0.7. Any criterion scoring < 0.3 requires mandatory revision.

### 3.4 Review Timeline

| Stage | Target | Escalation |
|-------|--------|------------|
| Peer review assignment | 1 business day | Auto-assign if unassigned after 24h |
| Review completion | 5 business days | Escalate to Domain Lead on day 6 |
| Author revision (if needed) | 3 business days | Escalate to Knowledge Board on day 4 |
| Re-review | 2 business days | Auto-escalate if incomplete |

---

## 4. Concept Approval Workflow

### 4.1 Approval Authority Levels

| Tier | Concept Source | Approval Authority | Can Delegate |
|------|---------------|--------------------|--------------|
| 1 | Standards-derived (IEC, IEEE, ISO, ANSI) | Chief Engineer | No |
| 2 | Regulation-derived (ISIRI, Tavanir, Ministry of Energy) | Domain Lead | No |
| 3 | Manufacturer documentation | Knowledge Board | To Domain Lead |
| 4 | Peer reviewed research | Knowledge Board | To Domain Lead |
| 5 | Community / verified industry knowledge | Knowledge Board | No |

### 4.2 Approval Criteria Checklist

| # | Criterion | Description | Required For |
|---|-----------|-------------|--------------|
| 1 | Source Verification | All sources confirmed authentic and correctly cited | All tiers |
| 2 | Technical Accuracy | Engineering content verified by qualified reviewer | All tiers |
| 3 | Standards Compliance | Concept does not contradict applicable standards | Tiers 1–3 |
| 4 | Taxonomy Alignment | Concept correctly classified per governance taxonomy | All tiers |
| 5 | Relationship Mapping | All known relationships to existing concepts defined | All tiers |
| 6 | Metadata Completeness | All required metadata fields populated | All tiers |
| 7 | Bilingual Integrity | FA/EN titles, descriptions, and aliases verified | All tiers |
| 8 | Quality Gate Passed | Quality score > 0.7 with no critical issues | All tiers |
| 9 | Conflict Check | No unresolved conflicts with existing concepts | All tiers |
| 10 | Legal Clearance | Copyright and licensing verified (for external sources) | Tiers 1, 4, 5 |

### 4.3 Approval Workflow Steps

```
Approval Initiation
       ↓
  ┌─────────────────────────────────────┐
  │ Checklist Evaluation (all 10 items) │
  │ ─ Pending / Pass / Fail per item    │
  └─────────────────────────────────────┘
       ↓
  ┌─────────────────────────────────────┐
  │ Any Failures?                       │
  │ Yes → Return to Author with notes   │
  │ No  → Proceed                       │
  └─────────────────────────────────────┘
       ↓
  ┌─────────────────────────────────────┐
  │ Route to Correct Authority          │
  │ (Chief Engineer / Domain Lead / KB) │
  └─────────────────────────────────────┘
       ↓
  ┌─────────────────────────────────────┐
  │ Final Sign-Off                      │
  │ Approved / Rejected / Conditional   │
  └─────────────────────────────────────┘
```

---

## 5. Concept Versioning

### 5.1 Version Format

**MAJOR.MINOR.PATCH** (e.g., `1.2.3`)

| Component | Increment Trigger | Example |
|-----------|-------------------|---------|
| MAJOR | Breaking changes to definition or relationships | `1.0.0` → `2.0.0` |
| MINOR | Non-breaking additions (new aliases, additional sources) | `1.0.0` → `1.1.0` |
| PATCH | Corrections, formatting, metadata updates | `1.0.0` → `1.0.1` |

### 5.2 Version Rules

| # | Rule | Description |
|---|------|-------------|
| 1 | Initial version | All new concepts start at `1.0.0` |
| 2 | No skipping | All intermediate versions must exist in changelog |
| 3 | Supersession | When a concept is superseded, the new version increments MAJOR |
| 4 | Retraction | A retracted concept receives `PATCH` increment with retraction notice |
| 5 | Concurrent versions | Only one version may be `Published` at any time |

### 5.3 Changelog Requirements

Every concept MUST maintain a changelog with:

| Field | Required | Description |
|-------|----------|-------------|
| `version` | ✅ | Version number |
| `date` | ✅ | Date of version |
| `author` | ✅ | Person who made the change |
| `change_type` | ✅ | `added`, `modified`, `corrected`, `retired` |
| `description` | ✅ | Summary of changes |
| `approval_ref` | ✅ | Reference to approval record |

### 5.4 Changelog Example

```json
{
  "changelog": [
    {
      "version": "1.0.0",
      "date": "1405-04-01",
      "author": "A. Mohammadi",
      "change_type": "added",
      "description": "Initial concept definition",
      "approval_ref": "XEN-APPR-2025-001"
    },
    {
      "version": "1.0.1",
      "date": "1405-05-15",
      "author": "M. Hosseini",
      "change_type": "corrected",
      "description": "Fixed calculation formula in §3.2",
      "approval_ref": "XEN-APPR-2025-012"
    }
  ]
}
```

---

## 6. Concept Retirement Policy

### 6.1 Retirement Triggers

| Trigger | Description | Action |
|---------|-------------|--------|
| Superseded | Newer version of the concept published | Retire old version |
| Standard Withdrawn | The standard from which the concept derives is withdrawn | Retire within 90 days |
| Domain Obsolete | The engineering domain is no longer relevant | Retire after impact assessment |
| Regulatory Change | Regulation replaced or revoked | Retire within 30 days |
| Error Discovery | Concept contains fundamental error | Immediate retirement + alert |

### 6.2 Retirement Process

```
Retirement Trigger
       ↓
Impact Assessment (3 business days)
  → Which concepts reference this one?
  → Which AI services use this concept?
  → What is the blast radius?
       ↓
Notification (1 business day)
  → Concept Author
  → Knowledge Board
  → AI Service owners (if affected)
       ↓
Grace Period
  → Default: 90 days
  → Safety-critical: 30 days
  → Immediate error: 0 days (instant retired)
       ↓
Retirement Execution
  → Status set to "Retired"
  → Reason recorded in metadata
  → Superseded-by link if applicable
  → Removed from active RAG index
  → Preservation in cold storage
```

### 6.3 Retired Concept Rules

| # | Rule | Description |
|---|------|-------------|
| 1 | Retention | Retired concepts remain in knowledge base with `Retired` status and documented reason |
| 2 | Traceability | Metadata must include `retired_at`, `retired_by`, `retirement_reason` |
| 3 | AI Restriction | AI services MUST NOT cite retired concepts (configurable grace period via `grace_until` field) |
| 4 | Audit | Retirement events are permanently logged in audit trail |
| 5 | Restoration | A retired concept may be un-retired only via Knowledge Board approval |

### 6.4 AI Service Grace Period

| Scenario | Grace Period | Behavior During Grace |
|----------|-------------|----------------------|
| Superseded (new version available) | 90 days | AI may cite old version with "superseded by vX.Y.Z" warning |
| Standard withdrawn | 30 days | AI may cite with "standard withdrawn" disclaimer |
| Error discovered | 0 days | Immediate block; AI must not cite |
| Domain obsolete | 180 days | AI may cite with "domain may be obsolete" disclaimer |

---

## 7. Roles and Responsibilities

| Role | FA | Responsibilities | Reports To |
|------|-----|-----------------|------------|
| Concept Author | نویسندهٔ مفهوم | Creates and maintains concepts; responds to review comments | Domain Lead |
| Technical Reviewer | بازبین فنی | Validates technical accuracy and engineering correctness | Chief Engineer |
| Standards Reviewer | بازبین استاندارد | Validates standards compliance and regulatory alignment | Standards Lead |
| Domain Expert | متخصص حوزه | Provides domain expertise; sign-off on technical content | Knowledge Board |
| Knowledge Board | هیئت دانش | Final approval authority; governance oversight | CTO / Steering Committee |
| Language Reviewer | بازبین زبانی | Validates bilingual consistency and translation accuracy | Knowledge Board |

### 7.1 Role Eligibility

| Role | Min. Experience | Certification Required | Conflicts of Interest |
|------|----------------|----------------------|-----------------------|
| Concept Author | 3 years in domain | None | May not be sole reviewer |
| Technical Reviewer | 5 years in domain | Professional Engineer preferred | Must not be author |
| Standards Reviewer | 5 years; 2 in standards work | Standards committee experience | Must not be author |
| Domain Expert | 8 years in domain | Published work in field | Must not be sole reviewer |
| Knowledge Board | 10 years in industry | Appointed by CTO | Collective decision; no single veto |
| Language Reviewer | 3 years technical translation | Certified translator preferred | Must be bilingual (FA/EN) |

---

## 8. Exception Handling

| Scenario | Process | Authority |
|----------|---------|-----------|
| Urgent publication (safety-critical) | Expedited review (2 business days) | Chief Engineer |
| Concept conflict | Conflict resolution meeting | Knowledge Board |
| Appeal of rejection | Formal appeal with justification | Steering Committee |
| Cross-domain concept | Joint review by both domain experts | Knowledge Board |
| External contribution | Contributor agreement + standard review | Legal + Knowledge Board |

---

## 9. Compliance and Enforcement

| # | Rule | Consequence of Violation |
|---|------|--------------------------|
| 1 | All concepts must follow lifecycle states | Concept rejected at ingestion gate |
| 2 | All reviews require minimum 2 reviewers | Auto-assign until quota met |
| 3 | Quality gate must pass (> 0.7) before approval | Blocked at transition gate |
| 4 | Version history must be maintained | Concept flagged; author notified |
| 5 | Retired concepts not cited by AI | Automated audit alert; AI service owner notified |
| 6 | Roles must satisfy eligibility criteria | Assignment rejected by system |
