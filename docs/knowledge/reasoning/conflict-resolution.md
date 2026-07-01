# تضاد و رفع تضاد — Conflict Resolution

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Conflict Types — انواع تضاد

### 1. Conflicting Standards — تضاد استانداردها

| مشخصه | توضیح |
|-------|-------|
| **مشکل** | Two standards give different values/methods for same parameter |
| **رفع** | Higher tier wins. Within same tier, more specific wins. Same tier & scope → flag for human review. |
| **مثال** | IEEE 80 gives touch voltage formula, Tavanir gives fixed value. Within Iran → Tavanir wins (jurisdictional override per source-hierarchy.md Rule 5). |

### 2. Conflicting Regulations — تضاد مقررات

| مشخصه | توضیح |
|-------|-------|
| **مشکل** | National vs regional regulation conflict |
| **رفع** | More specific jurisdiction wins (regional within national scope) |
| **مثال** | Tavanir national regulation vs Regional Distribution Co. supplement → supplement adds to, cannot override national |

### 3. Conflicting Manufacturer Data — تضاد داده‌های سازنده

| مشخصه | توضیح |
|-------|-------|
| **مشکل** | Two manufacturers give different specifications for equivalent products |
| **رفع** | Prefer manufacturer with higher market share or certification. Present both with comparison table. |

### 4. Conflicting Evidence — تضاد شواهد

| مشخصه | توضیح |
|-------|-------|
| **مشکل** | Two evidence nodes from same source tier contradict |
| **رفع** | More recent wins. Same recency → more specific clause wins. Same specificity → flag for human. |

### 5. Conflicting Conclusions — تضاد نتایج

| مشخصه | توضیح |
|-------|-------|
| **مشکل** | Two reasoning paths reach different conclusions |
| **رفع** | Higher confidence path wins. If confidences within 0.05 → present both with "Alternative approaches exist" |

---

## Resolution Hierarchy (Priority Order) — سلسله‌مراتب رفع تضاد

| اولویت | قانون | توضیح |
|--------|-------|-------|
| 1 | **Source Tier** | Highest tier always prevails (source-hierarchy.md Rule 2) |
| 2 | **Jurisdiction** | Local regulation > International standard within jurisdiction (Rule 5) |
| 3 | **Temporal** | More recent > older within same tier (Rule 6) |
| 4 | **Specificity** | More specific > more general within same tier/recency |
| 5 | **Consensus** | Supported by more sources > supported by fewer |
| 6 | **Human Escalation** | If none of the above resolves → human review |

---

## Conflict Resolution Workflow — گردش کار رفع تضاد

```
Step 1: Detect conflict
        ↓
Step 2: Classify conflict type
        ↓
Step 3: Apply resolution hierarchy rules
        ↓
Step 4: Resolved? → Yes → Document resolution logic + justification
        ↓ No
Step 5: Flag for human review with conflict summary
        ↓
Step 6: Resolution result
```

| گام | اقدام | خروجی |
|-----|-------|-------|
| **۱** | Detect two or more sources/conclusions disagree | Conflict detected |
| **۲** | Classify type (standards/regulations/manufacturer/evidence/conclusion) | Type classification |
| **۳** | Apply resolution hierarchy rules | Resolution candidate |
| **۴** | If resolved → document logic + justification | Resolution record |
| **۵** | If unresolved → flag for human review | Conflict summary |
| **۶** | Choose: one conclusion kept, one rejected, or both as alternatives | Final resolution |

---

## Human Conflict Resolution — رفع تضاد انسانی

| مؤلفه | توضیح |
|-------|-------|
| **Dashboard** | Presents conflicting sources, tier info, jurisdiction, dates |
| **Reviewer Actions** | Choose winner, define override rule, request additional evidence |
| **Precedent** | Human resolution creates a precedent (stored as resolution rule for future automation) |
