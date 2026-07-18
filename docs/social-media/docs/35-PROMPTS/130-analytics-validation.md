# Analytics Validation — اعتبارسنجی تحلیلی

> **شناسه:** PRM-325
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Analytics Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-324](./128-recommendation-package-assembly.md), [PLAT-\*](../20-PLATFORMS/), [MET-\*](../60-METRICS/)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                |
| ------------------ | -------------------- |
| **id**             | PRM-325              |
| **name_fa**        | اعتبارسنجی تحلیلی    |
| **name_en**        | Analytics Validation |
| **family**         | FAM-OPS              |
| **subfamily**      | OPS-RPT              |
| **type**           | PT-06                |
| **complexity**     | C-2                  |
| **authority**      | A-3                  |
| **owner**          | Analytics Lead       |
| **version**        | 1.0.0-draft          |
| **status**         | draft                |
| **security_level** | SL-02                |

---

## 2. Purpose

PRM-325 اعتبارسنجی داده‌ها و محاسبات تحلیلی را انجام می‌دهد. این پرامپت صحت داده‌های خام، یکپارچگی محاسبات و انطباق با استانداردهای MET-\* را بررسی می‌کند.

### اصول اعتبارسنجی

| ID    | اصل                                          |
| ----- | -------------------------------------------- |
| AV-01 | داده‌های خام باید با منبع مطابقت داشته باشند |
| AV-02 | محاسبات KPI باید با MET-\* همخوان باشند      |
| AV-03 | خطاهای بحرانی مسدودکننده هستند               |

---

## 3. Scope

### Inside Scope

| حوزه             | توضیح                 |
| ---------------- | --------------------- |
| صحت داده         | تطبیق داده‌ها با منبع |
| یکپارچگی محاسبات | بررسی فرمول‌های KPI   |
| انطباق MET-\*    | تطبیق با استانداردها  |

### Outside Scope

| حوزه        | دلیل         |
| ----------- | ------------ |
| کیفیت گزارش | حوزه PRM-328 |
| تکمیل گزارش | حوزه PRM-329 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                | نوع مصرف   |
| ------------------ | ------------------ | ---------- |
| AI-010 (Analytics) | اعتبارسنجی داده‌ها | Chain      |
| AI-004 (Review)    | تأیید انطباق       | Validation |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-324 Output",
        "scope": ["recommendation-package", "recommendations"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-05",
        "source": "MET-*",
        "scope": ["kpi-definitions", "calculation-methods"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 3000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع   | دامنه                | کاربرد    |
| ------ | -------------------- | --------- |
| MET-\* | تعاریف و محاسبات KPI | تأیید صحت |

---

## 7. Variables

| متغیر            | نوع    | اجباری | توضیح                           | اعتبارسنجی    |
| ---------------- | ------ | ------ | ------------------------------- | ------------- |
| `analytics_data` | VAR-06 | بله    | داده‌های تحلیلی برای اعتبارسنجی | —             |
| `strict_mode`    | VAR-03 | خیر    | حالت سختگیرانه                  | default: true |

---

## 8. Constraints

| ID     | محدودیت                            |
| ------ | ---------------------------------- |
| CST-01 | داده‌ها با منبع مطابقت داشته باشند |
| CST-02 | محاسبات با MET-\* همخوان باشند     |

---

## 9. Input Contract

| ورودی            | نوع     | منبع         | اجباری |
| ---------------- | ------- | ------------ | ------ |
| `analytics_data` | object  | PRM-320..324 | بله    |
| `strict_mode`    | boolean | AI-010       | خیر    |

---

## 10. Output Contract

| خروجی                  | نوع    | توضیح                          |
| ---------------------- | ------ | ------------------------------ |
| `validation_result`    | string | نتیجه (valid/flagged/rejected) |
| `data_integrity_score` | number | یکپارچگی داده (۰–۱۰۰)          |
| `calculation_errors`   | array  | خطاهای محاسباتی                |
| `kpi_consistency`      | object | انطباق KPIها با MET-\*         |
| `critical_issues`      | array  | مسائل بحرانی                   |

---

## 11. Validation Rules

| ID     | قاعده                | سطح    | نقض     |
| ------ | -------------------- | ------ | ------- |
| VAL-01 | data_integrity ≥ ۹۵٪ | معماری | عدم ثبت |
| VAL-02 | خطاهای محاسباتی = ۰  | معماری | عدم ثبت |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                     | مسئول              |
| ----- | ----------------- | ------------------------- | ------------------ |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار             |
| QG-02 | Review → Approved | معیارهای اعتبارسنجی مشخص  | Analytics Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper    |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                           |
| ------- | ------------------- | ------ | ------------------------------ |
| PRM-324 | DEP-03 (References) | ^1.0.0 | داده‌های توصیه برای اعتبارسنجی |
| MET-\*  | DEP-03 (References) | ^1.0.0 | استانداردهای KPI               |

---

## 14. Human Override

| سناریو              | اقدام                        |
| ------------------- | ---------------------------- |
| critical_issues > ۰ | Escalation به Analytics Lead |

---

## 15. Governance Notes

| ID     | یادداشت                                                |
| ------ | ------------------------------------------------------ |
| GOV-01 | A-3 (Strategic) — نیازمند ADR برای معیارهای اعتبارسنجی |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-325",
  "name": "Analytics Validation",
  "family": "FAM-OPS",
  "subfamily": "OPS-RPT",
  "type": "PT-06",
  "complexity": "C-2",
  "authority": "A-3",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [
    { "type": "CTX-04", "source": "PRM-324", "required": true },
    { "type": "CTX-05", "source": "MET-*", "required": true }
  ],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "analytics_data", "type": "VAR-06", "required": true },
    { "id": "strict_mode", "type": "VAR-03", "required": false, "default": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["analytics_data"],
    "optional": ["strict_mode"]
  },
  "output": {
    "required": ["validation_result", "data_integrity_score", "critical_issues"],
    "optional": ["calculation_errors", "kpi_consistency"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Data integrity >= 95%", "severity": "error" },
    { "id": "VAL-02", "description": "No calculation errors", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-010", "AI-004"],
  "dependencies": [],
  "documentation_refs": ["MET-*"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                           | توسط        |
| ----------- | ---------- | ------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی تحلیلی | معمار سیستم |
