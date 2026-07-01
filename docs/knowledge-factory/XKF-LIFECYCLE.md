# Xennic Knowledge Factory (XKF) — Knowledge Lifecycle & Object States

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. The Knowledge Object

The fundamental unit of the Knowledge Factory is the **Engineering Knowledge Object (EKO)**.
Every piece of knowledge in XKF is represented as an EKO.

### 1.1 EKO Structure

```typescript
interface EngineeringKnowledgeObject {
  // Identity
  id: UUID;
  eko_id: string;           // "EKO-{workspace}-{type}-{sequence}"
  version: string;          // SemVer (see knowledge-object-versioning.md)

  // Core Content
  kind: EKOKind;            // FACT | RULE | CONSTRAINT | ASSUMPTION
                            // | CALCULATION | CONCLUSION
  content: {
    primary: string;        // Canonical statement in FA
    translation: string;    // EN translation
    structured: Record<string, any>;  // Machine-readable form
  };

  // Provenance
  source_document_id: UUID;
  source_document_version: string;
  pipeline_version: string;

  // Classification
  taxonomy: TaxonomyLabels;  // domain, type, tier, application
  concepts: ConceptRef[];    // Resolved concept references
  entities: EntityRef[];     // Extracted entity references
  standards: StandardRef[];  // Related standards
  formulas: FormulaRef[];    // Mathematical formulas

  // Quality & Trust
  quality_score: number;     // 0.0 – 1.0
  confidence_score: number;  // 0.0 – 1.0
  source_tier: 1 | 2 | 3 | 4 | 5;
  review_status: ReviewStatus;

  // Lifecycle
  state: EKOState;
  previous_version_id: UUID | null;
  superseded_by_id: UUID | null;
  valid_from: DateTime;
  valid_until: DateTime | null;

  // Evidence
  evidence_chain: EvidenceLink[];
  citations: Citation[];

  // Multitenancy
  workspace_id: UUID;

  // Metadata
  created_at: DateTime;
  updated_at: DateTime;
  created_by: string;       // Service or user ID
}
```

### 1.2 EKO Kinds

| Kind | Description | Example |
|------|-------------|---------|
| **FACT** | Verifiable truth, not subject to interpretation | "IEC 60038 defines standard voltage 400V for LV systems" |
| **RULE** | Engineering rule derived from standards or practice | "Cable ampacity must be derated by 0.8 for grouped installations" |
| **CONSTRAINT** | Boundary condition or limitation | "Maximum short-circuit temperature for XLPE cable: 250°C" |
| **ASSUMPTION** | Stated premise for a calculation or analysis | "Soil resistivity assumed 100 Ω·m for grounding design" |
| **CALCULATION** | Mathematical procedure with inputs and outputs | "Cable sizing per IEC 60364-5-52: S = √3 × I × L × cosφ / (γ × ΔV)" |
| **CONCLUSION** | Engineering decision derived from reasoning | "Selected cable: 3× 1×185 mm² Cu/XLPE/PVC, 20 kV" |

---

## 2. Document Lifecycle

The lifecycle of a **document** (source of knowledge) through the factory:

```
                    ┌─────────────────────────────────────────────┐
                    │              DOCUMENT LIFECYCLE             │
                    └─────────────────────────────────────────────┘

  RECEIVED ──► STAGED ──► PROCESSING ──► VALIDATED ──► PUBLISHED ──► ARCHIVED
     │            │            │              │             │             │
     │            │            ▼              │             │             │
     └──REJECTED──┘     ┌──────────┐          │             │             │
          (format)      │ FAILED   │──────────┘             │             │
                        │ (retry)  │                        │             │
                        └──────────┘                        │             │
                                                             │             │
                                                        ┌─────────┐       │
                                                        │ SUPERSEDED─────┘
                                                        └─────────┘
```

### 2.1 Document States

| State | Description | Transition Trigger |
|-------|-------------|-------------------|
| **RECEIVED** | File uploaded, checksum verified | Intake Service accepts file |
| **STAGED** | Metadata assigned, ready for queue | Classify Service completes |
| **PROCESSING** | Pipeline stages executing | Each stage updates state |
| **FAILED** | Non-recoverable pipeline error | Quality Gate rejects permanently |
| **VALIDATED** | All automated checks passed | Quality Gate approves |
| **PUBLISHED** | Available for retrieval and reasoning | Publish Service completes |
| **SUPERSEDED** | Newer version of this document exists | Version Manager triggers |
| **ARCHIVED** | Removed from active retrieval | Lifecycle Manager triggers |
| **REJECTED** | Invalid format, content, or policy violation | Intake or Classify rejects |

---

## 3. Engineering Knowledge Object (EKO) Lifecycle

Each EKO follows a finer-grained lifecycle within the document pipeline:

```
                    ┌─────────────────────────────────────────────┐
                    │               EKO LIFECYCLE                │
                    └─────────────────────────────────────────────┘

  EXTRACTED ──► RESOLVED ──► NORMALIZED ──► VALIDATED ──► PUBLISHED
      │             │              │              │             │
      │             │              │              │             │
      ▼             ▼              ▼              ▼             ▼
  ┌────────┐  ┌────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐
  │Draft   │  │Resolved│  │Normalized  │  │Quality     │  │Active    │
  │Extract │  │Concepts│  │Units/Facts │  │Checked     │  │Retrieval │
  └────────┘  └────────┘  └────────────┘  └────────────┘  └──────────┘
                                                                    │
                                                                    ▼
                                                              ┌──────────┐
                                                              │Superseded│
                                                              │Or Archived│
                                                              └──────────┘
```

### 3.1 EKO States

| State | Meaning | Stored In |
|-------|---------|-----------|
| **EXTRACTED** | Raw extraction from source, unverified | Factory internal store |
| **RESOLVED** | Terms mapped to canonical concepts | Factory internal store |
| **NORMALIZED** | Units converted, facts normalized | Factory internal store |
| **VALIDATED** | Passed quality gates (auto or human) | Factory internal store |
| **PUBLISHED** | Written to vector + graph + metadata stores | All stores |
| **SUPERSEDED** | Replaced by newer version | All stores (with pointer) |
| **ARCHIVED** | Excluded from active retrieval | Metadata store only |

---

## 4. Quality Gates

Every EKO passes through quality gates before publication.

### 4.1 Gate Definitions

| Gate | Stage | Checks | Passing Threshold | Human Escalation |
|------|-------|--------|-------------------|------------------|
| **QG-1** | Extraction | Completeness, format compliance | >0.7 | <0.5 |
| **QG-2** | Resolution | Concept match confidence | >0.8 | <0.6 |
| **QG-3** | Normalization | Unit consistency, numerical sanity | >0.9 | <0.7 |
| **QG-4** | Validation | Source tier compliance, contradiction detection | >0.8 | <0.6 |
| **QG-5** | Pre-Publish | Cross-reference integrity, provenance completeness | 1.0 | Always |

### 4.2 Scoring Formula

```
Quality Score = 0.20 × Completeness
              + 0.15 × ExtractionConfidence
              + 0.15 × ResolutionAccuracy
              + 0.10 × NormalizationCorrectness
              + 0.20 × SourceTierWeight
              + 0.10 × CrossReferenceIntegrity
              + 0.10 × ProvenanceCompleteness
```

### 4.3 Quality Actions

| Score Range | Action |
|-------------|--------|
| 0.0 – 0.3 | **REJECT** — EKO discarded, pipeline failure |
| 0.3 – 0.6 | **ESCALATE** — Human review required |
| 0.6 – 0.8 | **AUTO-APPROVE** — Published automatically with confidence note |
| 0.8 – 1.0 | **AUTO-APPROVE** — Published with high confidence |

---

## 5. Versioning Strategy

### 5.1 EKO Version Scheme

Follows `knowledge-object-versioning.md` with SemVer:

- **MAJOR**: Breaking change to the EKO's meaning or structure
- **MINOR**: New facts, expanded scope, improved accuracy
- **PATCH**: Metadata correction, typo fix, quality score update

### 5.2 Version Chain

```
EKO-001 v1.0.0 ──► EKO-001 v1.1.0 ──► EKO-001 v2.0.0 ──► EKO-001 v2.0.1
     │                  │                    │                    │
     └── Published      └── Published        └── Supersedes v1.x  └── Patch
```

### 5.3 Supersession Rules

- A new MAJOR version **supersedes** all previous versions
- A new MINOR version **supersedes** the previous MINOR only
- A new PATCH version **amends** without superseding
- Superseded EKOs remain in storage with a `superseded_by` pointer
- Queries prefer the latest non-superseded, non-archived version

---

## 6. Knowledge Retention & Purging

| Event | Retention | Action |
|-------|-----------|--------|
| Document deletion | Immediate | Soft-delete; EKOs marked as `ARCHIVED` |
| Workspace deletion | 30 days | Grace period, then hard-delete all EKOs |
| Pipeline version supersession | Permanent | Old pipeline EKOs preserved for traceability |
| Failed extraction | 90 days | Retained for debugging, then purged |
| Quality-rejected content | 30 days | Retained for audit, then purged |

---

## 7. Lifecycle Transitions (Event Map)

| From | To | Event | Trigger |
|------|----|-------|---------|
| RECEIVED | STAGED | `doc.staged` | Classification complete |
| STAGED | PROCESSING | `doc.processing_started` | Pipeline starts |
| PROCESSING | VALIDATED | `doc.validated` | All gates passed |
| PROCESSING | FAILED | `doc.failed` | Quality gate reject |
| VALIDATED | PUBLISHED | `eko.published` | Publish service completes |
| PUBLISHED | SUPERSEDED | `eko.superseded` | New version published |
| PUBLISHED | ARCHIVED | `eko.archived` | Manual or lifecycle action |
| STAGED | REJECTED | `doc.rejected` | Format or policy violation |
