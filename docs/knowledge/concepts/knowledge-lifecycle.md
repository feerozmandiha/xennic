# چرخه حیات دانش — Knowledge Lifecycle

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. Lifecycle Overview

```
                    ┌──────────┐
                    │  Draft   │
                    │ پیش‌نویس │
                    └────┬─────┘
                         │ Submit for review
                         ↓
                    ┌──────────┐
               ┌───→│  Review  │
               │    │  بررسی   │
               │    └────┬─────┘
               │         │
               │    ┌────┴────┐
               │    │         │
               │    ↓         ↓
          ┌────────┐   ┌───────────┐
          │ Rejected│   │ Approved  │
          │ رد شده  │   │ تأیید شده │
          └────────┘   └─────┬─────┘
                             │ Sign-off
                             ↓
                    ┌───────────┐
                    │ Published │
                    │  منتشر شده│
                    └─────┬─────┘
                          │
                    ┌─────┴──────┐
                    │            │
                    ↓            ↓
            ┌────────────┐   ┌────────┐
            │ Superseded │   │Archived│
            │ جایگزین شده│   │بایگانی │
            └──────┬─────┘   └────────┘
                   │ 2 years
                   ↓
            ┌────────┐
            │Archived│
            │بایگانی │
            └────────┘
```

### Alternative Paths

```
Draft ──────────────────────────→ Archived (withdrawn before review)
Review ─────────────────────────→ Archived (withdrawn during review)
Published ──────────────────────→ Archived (content obsolete, bypass superseded)
Published ←──restore──→ Archived (Knowledge Board approval required)
```

---

## 2. Stage Definitions

### Stage 1: Draft — پیش‌نویس

| Property | Value |
|----------|-------|
| Owner | Concept Author |
| Approval Authority | N/A (author self-approves draft state) |
| Entry Criteria | Concept proposal accepted |
| Exit Criteria | All required fields populated; at least one source referenced |
| Activities | Content development, source collection, initial validation |
| Visibility | Author and collaborators only |
| Max Duration | 30 days (auto-flag if exceeded) |

**Required Metadata at Exit:**
- Title (FA + EN)
- Description (FA + EN)
- At least one source reference with tier classification
- Concept type (Fact / Rule / Constraint / Assumption / Calculation / Conclusion)
- Taxonomy classification (domain, engineering_discipline)

**Auto-Flag Behavior:**
- Day 25: Reminder to author (automated email)
- Day 30: Flag raised to Domain Lead
- Day 40: Escalated to Knowledge Board; concept may be reassigned or retired

---

### Stage 2: Review — بررسی

| Property | Value |
|----------|-------|
| Owner | Technical Reviewer (assigned) |
| Approval Authority | Domain Expert |
| Entry Criteria | Draft complete, submitted for review |
| Exit Criteria | All review comments resolved; quality gate score > 0.7 |
| Activities | Peer review, technical validation, source verification, quality scoring |
| Visibility | Review team and domain experts |
| Max Duration | 10 business days |

**Review Assignment Rules:**
- Minimum 2 reviewers assigned
- At least 1 reviewer must be from outside the author's team
- No reviewer may have a conflict of interest with the concept content
- Reviewer assignment auto-routed based on concept domain and tier

**Exit Gate Requirements:**
| Check | Threshold | Effect if Failed |
|-------|-----------|------------------|
| Quality score | > 0.7 | Return to Draft for revision |
| Critical issues | Zero | Escalate to Domain Lead |
| Review comments resolved | 100% | Block until resolution |
| Standards compliance | Pass | Flag for standards re-review |

---

### Stage 3: Approved — تأیید شده

| Property | Value |
|----------|-------|
| Owner | Domain Expert |
| Approval Authority | Knowledge Board |
| Entry Criteria | Review passed, quality score > 0.7, no critical issues |
| Exit Criteria | Knowledge Board sign-off |
| Activities | Final formatting, metadata enrichment, relationship mapping |
| Visibility | Extended team |
| Max Duration | 5 business days |

**Pre-Publication Checklist:**

| # | Item | Verified By |
|---|------|-------------|
| 1 | All review comments addressed | Technical Reviewer |
| 2 | Quality score recalculated > 0.7 | Automated |
| 3 | Metadata fully populated per schema | Automated |
| 4 | All relationships mapped to existing concepts | Domain Expert |
| 5 | Bilingual terminology verified | Language Reviewer |
| 6 | Conflict scan passed (no overlap with existing concepts) | Automated |
| 7 | Changelog entry prepared | Author |
| 8 | Knowledge Board delegate notified | System |

---

### Stage 4: Published — منتشر شده

| Property | Value |
|----------|-------|
| Owner | Knowledge Base Team |
| Approval Authority | Knowledge Board |
| Entry Criteria | Approved, all metadata complete |
| Exit Criteria | N/A (terminal state unless superseded or archived) |
| Activities | Indexing, vector embedding, Graph RAG integration |
| Visibility | All users and AI services |
| Max Duration | Indefinite (until superseded or archived) |

**Publication Steps:**
1. Final metadata validation
2. Vector embedding generation (via embedding service)
3. Knowledge graph node/edge creation
4. RAG index update
5. AI service cache invalidation (if applicable)
6. Publication event broadcast (webhook to subscribed services)
7. Changelog finalized and recorded

**Post-Publication Monitoring:**
| Metric | Frequency | Threshold | Action |
|--------|-----------|-----------|--------|
| Retrieval count | Daily | N/A | Trend tracking |
| AI citation accuracy | Weekly | > 95% | Investigate errors |
| User feedback score | Monthly | > 3.5 / 5 | Review negative feedback |
| Cross-reference validation | Quarterly | 100% match | Investigate drift |

---

### Stage 5: Superseded — جایگزین شده

| Property | Value |
|----------|-------|
| Owner | Knowledge Base Team |
| Approval Authority | Domain Expert |
| Entry Criteria | New version published that replaces this concept |
| Exit Criteria | Supersession notice published, redirects configured |
| Activities | Link to new version, update relationship graph, notify dependents |
| Visibility | All users (marked as "Superseded — see vX.Y.Z") |
| Max Duration | 2 years in superseded state, then eligible for archive |

**Supersession Notification:**
```
Subject: Concept [XEN-CON-XXXX] has been superseded
Body: Concept [Title] (vX.Y.Z) has been superseded by [New Title] (vA.B.C).
      Effective: [Date]
      Reason: [Summary of changes]
      Action required: Review and update any references to the old version.
```

**Superseded State Behavior:**
- Concept remains visible in search but ranked below current version
- AI services may cite with explicit "Superseded — see vX.Y.Z" annotation (during grace period)
- All incoming relationships redirected to new version (configurable)
- Warning banner displayed on concept page

---

### Stage 6: Archived — بایگانی

| Property | Value |
|----------|-------|
| Owner | Knowledge Base Team |
| Approval Authority | Knowledge Board |
| Entry Criteria | Superseded for > 2 years OR withdrawn/obsolete |
| Exit Criteria | N/A (terminal state) |
| Activities | Move to cold storage, remove from active index, preserve for audit |
| Visibility | Administrators only (not available to AI services) |
| Max Duration | Permanent (legal/audit retention) |

**Archival Storage Requirements:**
| Asset | Storage Location | Retention |
|-------|-----------------|-----------|
| Concept metadata (JSON) | Cold storage (S3 Glacier / equivalent) | Permanent |
| Full concept text | Cold storage | Permanent |
| Audit trail | Immutable log | Permanent |
| Embedding vectors | Deleted from active index | N/A |
| Graph nodes/edges | Removed from active graph | N/A |

**Archival Audit Requirements:**
| Field | Required | Description |
|-------|----------|-------------|
| `archived_at` | ✅ | Timestamp of archival |
| `archived_by` | ✅ | Admin user ID |
| `archival_reason` | ✅ | Reason for archival |
| `permanent_deletion_date` | Conditional | If applicable (legal hold overrides) |
| `audit_reference` | ✅ | Link to audit log entry |
| `original_concept_id` | ✅ | UUID of the archived concept |

---

## 3. Stage Transition Rules

| From | To | Requires | Authority | Auto / Manual |
|------|----|----------|-----------|---------------|
| Draft | Review | Author submits for review | Author | Manual |
| Review | Approved | All reviews pass; quality > 0.7 | Domain Expert | Auto (if criteria met) |
| Review | Draft | Review returns for revision | Technical Reviewer | Manual |
| Review | Rejected | Critical issues found | Domain Expert | Manual |
| Approved | Published | Knowledge Board sign-off | Knowledge Board | Manual |
| Published | Superseded | New version approved | Domain Expert | Auto |
| Published | Archived | Content obsolete (bypass superseded) | Knowledge Board | Manual |
| Superseded | Archived | 2+ years since supersession | Knowledge Board | Auto (if criteria met) |
| Draft | Archived | Withdrawn by author or admin | Knowledge Board | Manual |
| Review | Archived | Withdrawn during review | Knowledge Board | Manual |
| Archived | Published | Restoration approved | Knowledge Board | Manual |

### Transition Rules Matrix

| Rule | Description | Enforcement |
|------|-------------|-------------|
| Forward Only | No stage may be skipped in forward direction (e.g., Draft → Approved is invalid) | System-enforced |
| Backward Allowed | Any stage may return to Draft (with reason) | Manual, requires justification |
| Rejected is Terminal | Rejected concepts may not transition forward; may only go to Archived | System-enforced |
| Superseded has Time Limit | 2 years max in superseded state; auto-archival after | System-enforced |
| Archived is Irreversible | Archived may only be reversed by Knowledge Board approval | Manual, requires quorum |

---

## 4. Quality Gates

### Gate 1: Draft → Review

| Check | Method | Pass/Fail |
|-------|--------|-----------|
| All required fields populated | Automated schema validation | Pass / Fail |
| At least 1 source referenced | Metadata check | Pass / Fail |
| Source tier classification valid | Enum validation | Pass / Fail |
| Concept type valid | Enum validation | Pass / Fail |
| No duplicate detected | Concept registry lookup | Pass / Fail |
| Minimum word count (> 50 words) | Content check | Pass / Fail |

### Gate 2: Review → Approved

| Check | Method | Score / Result |
|-------|--------|----------------|
| Technical accuracy score | Reviewer scoring (0–1) | Weighted > 0.7 |
| Source verification score | Reviewer scoring (0–1) | Weighted > 0.7 |
| Taxonomy compliance | Automated validation | Pass / Fail |
| Critical issues count | Reviewer flagging | Must be zero |
| All review comments resolved | Status check per comment | 100% resolved |
| Language review pass | Language Reviewer sign-off | Pass / Fail |

### Gate 3: Approved → Published

| Check | Method | Pass/Fail |
|-------|--------|-----------|
| Metadata completeness | Schema validation | Pass / Fail |
| Relationship mapping complete | Graph validation | Pass / Fail |
| Changelog entry present | Content check | Pass / Fail |
| Embedding generated | Vector store check | Pass / Fail |
| RAG index updated | Index status check | Pass / Fail |
| Knowledge Board sign-off recorded | Approval record check | Pass / Fail |

### Gate 4: Published → Superseded

| Check | Method | Pass/Fail |
|-------|--------|-----------|
| New version exists in Published state | Version registry check | Pass / Fail |
| Impact assessment completed | Document check | Pass / Fail |
| Dependent concepts notified | Notification log check | Pass / Fail |
| Grace period configured | Metadata check | Pass / Fail |

---

## 5. Timeline and SLAs

| Transition | Target SLA | Auto-Flag | Escalation |
|------------|-----------|-----------|------------|
| Proposal → Draft | 1 business day | Day 1 | Domain Lead |
| Draft → Review | 30 days max | Day 25 → Author | Day 30 → Knowledge Board |
| Review → Approved | 10 business days | Day 8 → Domain Lead | Day 10 → Knowledge Board |
| Review → Draft (revision) | 3 business days | Day 3 → Author | Day 5 → Domain Lead |
| Approved → Published | 5 business days | Day 4 → Knowledge Board | Day 5 → Chief Engineer |
| Published → Superseded | 1 business day | Day 1 → Knowledge Base Team | N/A |
| Published → Archived | 2 years (auto) | 90 days before → admin alert | N/A |
| Superseded → Archived | 2 years (auto) | 90 days before → admin alert | N/A |

### Escalation Ladder

```
Level 1: Author / Owner (auto-reminder)
Level 2: Domain Lead (deadline exceeded)
Level 3: Knowledge Board (deadline + 5 days)
Level 4: Chief Engineer (deadline + 10 days)
Level 5: Steering Committee (deadline + 20 days, systemic issue)
```

---

## 6. Audit Trail

### 6.1 Required Audit Events

Every lifecycle transition MUST be logged with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `event_id` | UUID | ✅ | Unique event identifier |
| `timestamp` | DateTime | ✅ | UTC ISO 8601 |
| `actor` | String | ✅ | User ID or system name |
| `actor_role` | String | ✅ | Role of the actor |
| `concept_id` | UUID | ✅ | Concept being transitioned |
| `from_state` | Enum | ✅ | Previous lifecycle stage |
| `to_state` | Enum | ✅ | New lifecycle stage |
| `reason` | Text | ✅ | Explanation for transition |
| `evidence` | JSON | Optional | Review comments, quality score, approval reference |
| `metadata_snapshot` | JSON | Optional | Metadata state at time of transition |

### 6.2 Audit Log Example

```json
{
  "event_id": "XEN-AUD-2025-0042",
  "timestamp": "2025-06-20T14:30:00Z",
  "actor": "m.hosseini@xennic.io",
  "actor_role": "Domain Expert",
  "concept_id": "XEN-CON-TRN-0023",
  "from_state": "review",
  "to_state": "approved",
  "reason": "All 3 review comments resolved. Quality score: 0.84. No critical issues.",
  "evidence": {
    "quality_score": 0.84,
    "review_count": 2,
    "comments_resolved": "3/3",
    "approval_ref": "XEN-APPR-2025-015"
  },
  "metadata_snapshot": {
    "version": "1.0.0",
    "source_tier": 1,
    "domain": "power_systems"
  }
}
```

### 6.3 Audit Retention

| Audit Data | Retention | Storage |
|------------|-----------|---------|
| Active concept transitions | Duration of concept life + 5 years | Hot storage (indexed) |
| Archived concept transitions | Permanent | Cold storage |
| System-level audit (all events) | 10 years | Warm storage |
| Deleted concept audit trail | Permanent (immutable) | Cold storage |

### 6.4 Audit Query Rights

| Role | Can Query | Scope |
|------|-----------|-------|
| Concept Author | Own concepts only | Active + archived |
| Domain Expert | Concepts within domain | Active + archived |
| Technical Reviewer | Reviewed concepts | Active only |
| Knowledge Board | All concepts | Active + archived |
| Auditor (external) | All concepts | Read-only, all storage |
| AI Services | N/A (no audit access) | N/A |

---

## 7. Lifecycle Configuration

### 7.1 Configurable Parameters

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| Draft max duration | 30 days | 7–90 days | Max time in Draft before auto-flag |
| Review max duration | 10 business days | 3–20 days | Max time in Review |
| Approved max duration | 5 business days | 1–15 days | Max time in Approved before auto-escalation |
| Superseded max duration | 2 years | 6 months – 5 years | Max time before auto-archive |
| Quality gate threshold | 0.7 | 0.0–1.0 | Minimum quality score for transition |
| Grace period (superseded) | 90 days | 0–365 days | AI citation grace period |
| Minimum reviewers | 2 | 1–5 | Minimum peer reviewers per concept |

### 7.2 Override Rules

| Scenario | Override | Authority Required |
|----------|----------|--------------------|
| Urgent publication (safety) | Skip Review stage (Draft → Approved) | Chief Engineer + Knowledge Board |
| Extended Draft | Increase max duration | Domain Lead |
| Fast-track review | Reduce review window to 2 days | Knowledge Board |
| Extended superseded period | Increase beyond 2 years | Knowledge Board |
| Bypass superseded (Published → Archived) | Immediate archival | Chief Engineer + Knowledge Board |

---
