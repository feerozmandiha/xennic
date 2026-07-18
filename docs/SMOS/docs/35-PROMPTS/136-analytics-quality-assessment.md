# Analytics Quality Assessment — ارزیابی کیفیت تحلیلی

> **شناسه:** PRM-328
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Analytics Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-327](./134-executive-dashboard-validation.md), [EDT-001](../24-EDITORIAL/10-content-guidelines.md), [MET-\*](../60-METRICS/)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                        |
| ------------------ | ---------------------------- |
| **id**             | PRM-328                      |
| **name_fa**        | ارزیابی کیفیت تحلیلی         |
| **name_en**        | Analytics Quality Assessment |
| **family**         | FAM-OPS                      |
| **subfamily**      | OPS-RPT                      |
| **type**           | PT-06                        |
| **complexity**     | C-3                          |
| **authority**      | A-3                          |
| **owner**          | Analytics Lead               |
| **version**        | 1.0.0-draft                  |
| **status**         | draft                        |
| **security_level** | SL-02                        |

---

## 2. Purpose

PRM-328 کیفیت کلی خروجی‌های تحلیلی زنجیره PRM-320 تا PRM-327 را ارزیابی می‌کند. این پرامپت با ترکیب نتایج اعتبارسنجی‌های پیشین (PRM-325, 326, 327) و بررسی کیفیت محتوایی و ساختاری، امتیاز کیفیت نهایی را محاسبه می‌کند.

### اصول ارزیابی

| ID    | اصل                                             |
| ----- | ----------------------------------------------- |
| QA-01 | کیفیت تحلیلی ترکیبی از اعتبارسنجی‌های پیشین است |
| QA-02 | امتیاز کیفیت باید قابل مقایسه بین دوره‌ها باشد  |
| QA-03 | نقاط ضعف باید مستند شوند                        |

---

## 3. Scope

### Inside Scope

| حوزه          | توضیح                                  |
| ------------- | -------------------------------------- |
| ترکیب نتایج   | ادغام اعتبارسنجی‌های PRM-325, 326, 327 |
| کیفیت محتوایی | بررسی دقت و عمق تحلیل                  |
| امتیاز نهایی  | محاسبه امتیاز کیفیت یکپارچه            |

### Outside Scope

| حوزه        | دلیل         |
| ----------- | ------------ |
| تکمیل گزارش | حوزه PRM-329 |

---

## 4. Consumers

| مصرف‌کننده           | نقش                     | نوع مصرف |
| -------------------- | ----------------------- | -------- |
| AI-010 (Analytics)   | ارزیابی کیفیت           | Chain    |
| AI-012 (Improvement) | مصرف ارزیابی برای بهبود | System   |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-327 Output",
        "scope": ["dashboard-result", "kpi-completeness"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-326 Output",
        "scope": ["consistency-result", "structure-match"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-325 Output",
        "scope": ["validation-result", "data-integrity-score"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "EDT-001",
        "scope": ["quality-standards", "analytics-criteria"],
        "injection": "append",
        "required": false
      }
    ],
    "max_tokens": 5000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع    | دامنه            | کاربرد         |
| ------- | ---------------- | -------------- |
| EDT-001 | معیارهای کیفیت   | ارزیابی تحلیلی |
| MET-\*  | استانداردهای KPI | تطبیق کیفیت    |

---

## 7. Variables

| متغیر                     | نوع    | اجباری | توضیح                       | اعتبارسنجی    |
| ------------------------- | ------ | ------ | --------------------------- | ------------- |
| `quality_sources`         | VAR-06 | بله    | خروجی‌های PRM-325, 326, 327 | —             |
| `include_recommendations` | VAR-03 | خیر    | تولید توصیه‌های بهبود       | default: true |

---

## 8. Constraints

| ID     | محدودیت                                 |
| ------ | --------------------------------------- |
| CST-01 | امتیاز کیفیت = ترکیب وزنی اعتبارسنجی‌ها |
| CST-02 | هر نقص کیفیت باید با منبع مشخص شود      |

---

## 9. Input Contract

| ورودی                     | نوع     | منبع              | اجباری |
| ------------------------- | ------- | ----------------- | ------ |
| `quality_sources`         | object  | PRM-325, 326, 327 | بله    |
| `include_recommendations` | boolean | AI-010            | خیر    |

---

## 10. Output Contract

| خروجی                     | نوع    | توضیح                      |
| ------------------------- | ------ | -------------------------- |
| `quality_result`          | object | نتیجه ارزیابی کیفیت        |
| `quality_score`           | number | امتیاز کیفیت نهایی (۰–۱۰۰) |
| `quality_dimensions`      | object | امتیاز هر بعد کیفیت        |
| `weaknesses`              | array  | نقاط ضعف مستند             |
| `improvement_suggestions` | array  | پیشنهادات بهبود            |

---

## 11. Validation Rules

| ID     | قاعده                   | سطح    | نقض     |
| ------ | ----------------------- | ------ | ------- |
| VAL-01 | quality_score ≥ ۷۵٪     | معماری | عدم ثبت |
| VAL-02 | هر نقص با منبع مشخص شود | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                     | مسئول           |
| ----- | ----------------- | ------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار          |
| QG-02 | Review → Approved | کیفیت ≥ ۷۵٪               | Analytics Lead  |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل             |
| ------- | ------------------- | ------ | ---------------- |
| PRM-327 | DEP-01 (Requires)   | ^1.0.0 | خروجی داشبورد    |
| PRM-326 | DEP-03 (References) | ^1.0.0 | خروجی سازگاری    |
| PRM-325 | DEP-03 (References) | ^1.0.0 | خروجی اعتبارسنجی |
| EDT-001 | DEP-03 (References) | ^1.0.0 | معیارهای کیفیت   |

---

## 14. Human Override

| سناریو              | اقدام                        |
| ------------------- | ---------------------------- |
| quality_score < ۷۵٪ | Escalation به Analytics Lead |

---

## 15. Governance Notes

| ID     | یادداشت                                         |
| ------ | ----------------------------------------------- |
| GOV-01 | A-3 (Strategic) — ارزیابی برای AI-012 قابل مصرف |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-328",
  "name": "Analytics Quality Assessment",
  "family": "FAM-OPS",
  "subfamily": "OPS-RPT",
  "type": "PT-06",
  "complexity": "C-3",
  "authority": "A-3",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [
    { "type": "CTX-04", "source": "PRM-327", "required": true },
    { "type": "CTX-04", "source": "PRM-326", "required": true },
    { "type": "CTX-04", "source": "PRM-325", "required": true },
    { "type": "CTX-02", "source": "EDT-001", "required": false }
  ],
  "max_tokens": 5000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "quality_sources", "type": "VAR-06", "required": true },
    { "id": "include_recommendations", "type": "VAR-03", "required": false, "default": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["quality_sources"],
    "optional": ["include_recommendations"]
  },
  "output": {
    "required": ["quality_result", "quality_score", "quality_dimensions"],
    "optional": ["weaknesses", "improvement_suggestions"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Quality score >= 75%", "severity": "error" },
    { "id": "VAL-02", "description": "Each weakness has identified source", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-010", "AI-012"],
  "dependencies": ["PRM-327"],
  "documentation_refs": ["EDT-001", "MET-*"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                              | توسط        |
| ----------- | ---------- | ---------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — ارزیابی کیفیت تحلیلی | معمار سیستم |
