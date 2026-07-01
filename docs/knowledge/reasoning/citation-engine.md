# موتور استناد — Citation Engine

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Core Requirements — الزامات اصلی

| شرط | توضیح |
|-----|-------|
| **Traceability** | Every engineering statement must be traceable to a source |
| **Evidence Reference** | Every conclusion must reference evidence |
| **Source Reference** | Every evidence must reference a source document |
| **Tier Classification** | Every source must have tier classification |
| **Dual Format** | Citations must be machine-parseable AND human-readable |

---

## Citation Graph — گراف استناد

- **Nodes:** Statements, Evidence, Sources
- **Edges:** Statement → cites → Evidence → from → Source
- **Bidirectional traversal:** from any conclusion, trace back to original source
- **Storage:** Graph stored in Knowledge Graph for queryability

```
┌────────────┐     ┌──────────────┐     ┌──────────────┐
│ Statement  │────→│   Evidence   │────→│    Source    │
│ (Conclusion)│     │   (Excerpt)  │     │ (Document)   │
└────────────┘     └──────────────┘     └──────────────┘
       ↑                                        │
       └────────────────────────────────────────┘
              Bidirectional Traversal
```

---

## Citation Format (Machine-Readable) — قالب استناد ماشینی

```json
{
  "citation": {
    "id": "cit-001",
    "statement": "Maximum earth resistance for HV substation is 1Ω",
    "evidence": {
      "id": "evi-001",
      "excerpt": "The resistance of the earth electrode shall not exceed 1 ohm for HV substations",
      "source": {
        "id": "XEN-EKO-2025-000042",
        "title": "IEEE Guide for Safety in AC Substation Grounding",
        "standard": "IEEE 80-2013",
        "clause": "§12.3",
        "tier": 1,
        "url": "https://standards.ieee.org/standard/80-2013.html"
      }
    },
    "confidence": 0.95
  }
}
```

### Fields — فیلدها

| فیلد | نوع | توضیح |
|------|-----|-------|
| `citation.id` | UUID | شناسه یکتای استناد |
| `citation.statement` | string | عبارت مهندسی که استناد به آن اشاره دارد |
| `evidence.id` | UUID | شناسه یکتای مدرک |
| `evidence.excerpt` | string | نقل‌قول مستقیم یا خلاصه |
| `source.id` | UUID | شناسه سند در Xennic KB |
| `source.standard` | string | نام استاندارد (در صورت وجود) |
| `source.clause` | string | بند یا بخش مشخص |
| `source.tier` | integer | طبقه منبع (۱-۵) |
| `source.url` | string | لینک به منبع (اختیاری) |

---

## Citation Format (Human-Readable) — قالب استناد انسانی

| نوع | مثال |
|-----|------|
| **In-text** | According to IEEE 80-2013 §12.3, the maximum earth resistance is 1Ω |
| **Footnote** | [1] IEEE 80-2013, Guide for Safety in AC Substation Grounding, §12.3 |
| **Bibliography** | IEEE. (2013). IEEE Guide for Safety in AC Substation Grounding. IEEE Std 80-2013. |

---

## Citation Ranking — رتبه‌بندی استناد

| رتبه | شرایط | توضیح |
|------|-------|-------|
| **Primary** | Tier 1-2 sources | Always include |
| **Secondary** | Tier 3-5 sources | Include only if no higher tier exists |
| **Supporting** | Multiple sources for same claim | Include to show consensus |
| **Ranking Order** | by tier → by recency → by relevance | Deterministic ordering |

---

## Source Hierarchy Integration — یکپارچگی با سلسله‌مراتب منابع

Citation engine checks source-hierarchy.md rules:

| قانون | رفتار |
|-------|-------|
| **No Tier N when Tier N-1 exists** | Auto-promote to higher tier source |
| **Jurisdictional override** | Prefer local regulation over international |
| **Temporal validity** | Prefer current edition over superseded |

---

## Citation Validation — اعتبارسنجی استناد

| نوع بررسی | توضیح |
|-----------|-------|
| **Source existence** | Does the source exist in Knowledge Base? |
| **Clause validity** | Is the referenced clause valid in current edition? |
| **Dead citation** | Source is deprecated or superseded |
| **Orphan citation** | Statement with no source → FLAG |

---

## AI Output Format — قالب خروجی هوش مصنوعی

Every AI engineering answer ends with:

```
━━━ Sources ━━━
[1] IEC 60909:2001, Short-circuit currents in three-phase AC systems, §4.2 [Tier 1]
[2] IEEE C37.010-2016, Application Guide for AC High-Voltage Circuit Breakers, §5.3 [Tier 1]

━━━ Evidence Chain ━━━
Conclusion → IEEE C37.010 §5.3 (breaker rating) → IEC 60909 §4.2 (fault current)

━━━ Confidence: 0.92 ━━━
```
