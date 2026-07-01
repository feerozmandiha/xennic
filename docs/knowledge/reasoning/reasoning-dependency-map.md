# نقشه وابستگی‌های استدلال — Reasoning Dependency Map

> **Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## وابستگی‌های مؤلفه دانش — Knowledge Object Dependencies

| Component | Depends On | Dependency Type | Impact if Unavailable |
|-----------|-----------|-----------------|----------------------|
| Knowledge Selection | Qdrant, Knowledge API | Hard | Cannot retrieve EKOs → reasoning fails |
| Evidence Collection | Knowledge Graph | Hard | Cannot build evidence chains |
| Evidence Collection | Knowledge API (for EKO metadata) | Soft | Falls back to vector DB only |
| Rule Engine | Rules database | Hard | Cannot apply rules |
| Constraint Engine | Constraints database | Hard | Cannot validate constraints |
| Formula Engine | Formula registry | Hard | Cannot execute formulas |
| Citation Engine | Knowledge API (source metadata) | Hard | Cannot generate citations |
| Confidence Engine | No external deps | — | Self-contained calculation |
| Conflict Resolution | Knowledge API (source tiers) | Hard | Cannot resolve conflicts |
| Truth Validator | All above | Hard | Cannot validate truth elements |

---

## وابستگی‌های استدلال (بر اساس مرحله) — Reasoning Dependencies (by Stage)

| Stage | Depends On | Parallel With |
|-------|-----------|---------------|
| Context Building | AI Service (LLM) | — (first stage) |
| Knowledge Selection | Qdrant, Knowledge Graph | — (sequential after context) |
| Evidence Collection | Knowledge Selection | — (sequential) |
| Reasoning | Evidence Collection | — (sequential) |
| Constraint Checking | Reasoning | Formula Evaluation |
| Formula Evaluation | Reasoning | Constraint Checking |
| Conflict Resolution | Constraint + Formula | — (join after both) |
| Confidence Calculation | Conflict Resolution | Citation Generation |
| Citation Generation | Conflict Resolution | Confidence Calculation |
| Conclusion Assembly | Confidence + Citation | — (join after both) |

---

## مسیر بحرانی — Critical Path

```
Context → Knowledge Selection → Evidence Collection → Reasoning
    → Constraint + Formula (parallel) → Conflict Resolution
    → Confidence + Citations (parallel) → Conclusion
```

**Estimated latency:**
- Simple queries: **5–15 seconds**
- Complex queries: **15–60 seconds**

---

## مؤلفه‌های مسدودکننده — Blocking Components

| Component | Blocked Downstream |
|-----------|-------------------|
| Qdrant | Knowledge selection blocked |
| Knowledge Graph | Evidence collection blocked |
| Rules Database | Rule engine blocked |
| Human Review | Blocking wait if escalated (until review complete) |

---

## مؤلفه‌های غیرمسدودکننده — Non-Blocking Components

| Component | Behavior Under Failure |
|-----------|----------------------|
| AI Service | Falls back to pattern matching for context building |
| Citation Engine formatting | Can be asynchronous, post-delivery |
