# Audience Insight Generation — تولید بینش مخاطب

> **شناسه:** PRM-323
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Analytics Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-322](./124-trend-analysis-preparation.md), [EDT-002](../24-EDITORIAL/20-content-taxonomy.md), [PLAT-\*](../20-PLATFORMS/)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                       |
| ------------------ | --------------------------- |
| **id**             | PRM-323                     |
| **name_fa**        | تولید بینش مخاطب            |
| **name_en**        | Audience Insight Generation |
| **family**         | FAM-OPS                     |
| **subfamily**      | OPS-RPT                     |
| **type**           | PT-07                       |
| **complexity**     | C-3                         |
| **authority**      | A-3                         |
| **owner**          | Analytics Lead              |
| **version**        | 1.0.0-draft                 |
| **status**         | draft                       |
| **security_level** | SL-02                       |

---

## 2. Purpose

PRM-323 تولید بینش عملیاتی درباره مخاطبان را تعریف می‌کند. این پرامپت با تحلیل داده‌های جمعیت‌شناختی، رفتاری و تعاملی، پروفایل مخاطب، اولویت‌های محتوایی و فرصت‌های رشد را شناسایی می‌کند.

### اصول تولید بینش

| ID    | اصل                                           |
| ----- | --------------------------------------------- |
| AI-01 | بینش‌ها باید مبتنی بر داده و قابل اقدام باشند |
| AI-02 | پروفایل مخاطب باید بر اساس تعاملات واقعی باشد |
| AI-03 | فرصت‌های رشد باید اولویت‌بندی شوند            |

---

## 3. Scope

### Inside Scope

| حوزه               | توضیح                     |
| ------------------ | ------------------------- |
| تحلیل جمعیت‌شناختی | شناسایی ویژگی‌های مخاطب   |
| رفتار تعاملی       | الگوهای تعامل مخاطب       |
| اولویت‌های محتوایی | موضوعات مورد علاقه        |
| فرصت‌های رشد       | شناسایی شکاف‌ها و فرصت‌ها |

### Outside Scope

| حوزه       | دلیل         |
| ---------- | ------------ |
| تحلیل روند | حوزه PRM-322 |
| بسته توصیه | حوزه PRM-324 |
| اعتبارسنجی | حوزه PRM-325 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                     | نوع مصرف |
| ------------------ | ----------------------- | -------- |
| AI-010 (Analytics) | تولید بینش مخاطب        | Chain    |
| AI-001 (Strategy)  | مصرف بینش برای استراتژی | System   |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-322 Output",
        "scope": ["trend-analysis", "trend-summary"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "EDT-002",
        "scope": ["ct-id-profiles", "audience-attributes"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-05",
        "source": "PLAT-*",
        "scope": ["demographic-data", "audience-insights"],
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

| منبع    | دامنه                 | کاربرد                   |
| ------- | --------------------- | ------------------------ |
| EDT-002 | پروفایل‌های CT-ID     | تطبیق رفتار با نوع محتوا |
| PLAT-\* | داده‌های جمعیت‌شناختی | تحلیل مخاطب              |

---

## 7. Variables

| متغیر                          | نوع    | اجباری | توضیح                 | اعتبارسنجی    |
| ------------------------------ | ------ | ------ | --------------------- | ------------- |
| `trend_analysis`               | VAR-06 | بله    | تحلیل روند از PRM-322 | —             |
| `include_growth_opportunities` | VAR-03 | خیر    | شناسایی فرصت‌های رشد  | default: true |

---

## 8. Constraints

| ID     | محدودیت                               |
| ------ | ------------------------------------- |
| CST-01 | بینش‌ها مبتنی بر داده‌های واقعی باشند |
| CST-02 | حداقل ۳ بینش قابل اقدام تولید شود     |

---

## 9. Input Contract

| ورودی                          | نوع     | منبع    | اجباری |
| ------------------------------ | ------- | ------- | ------ |
| `trend_analysis`               | object  | PRM-322 | بله    |
| `include_growth_opportunities` | boolean | AI-010  | خیر    |

---

## 10. Output Contract

| خروجی                  | نوع    | توضیح                      |
| ---------------------- | ------ | -------------------------- |
| `audience_insights`    | object | بینش‌های مخاطب             |
| `audience_profiles`    | array  | پروفایل‌های مخاطب          |
| `content_preferences`  | array  | اولویت‌های محتوایی         |
| `growth_opportunities` | array  | فرصت‌های رشد               |
| `insight_confidence`   | number | اطمینان از بینش‌ها (۰–۱۰۰) |

---

## 11. Validation Rules

| ID     | قاعده                 | سطح    | نقض     |
| ------ | --------------------- | ------ | ------- |
| VAL-01 | بینش‌ها مبتنی بر داده | معماری | عدم ثبت |
| VAL-02 | ≥ ۳ بینش قابل اقدام   | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                     | مسئول              |
| ----- | ----------------- | ------------------------- | ------------------ |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار             |
| QG-02 | Review → Approved | بینش‌ها قابل اقدام        | Analytics Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper    |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                       |
| ------- | ------------------- | ------ | -------------------------- |
| PRM-322 | DEP-01 (Requires)   | ^1.0.0 | تحلیل روند برای بینش مخاطب |
| EDT-002 | DEP-03 (References) | ^1.0.0 | پروفایل‌های CT-ID          |
| PLAT-\* | DEP-03 (References) | ^1.0.0 | داده‌های جمعیت‌شناختی      |

---

## 14. Human Override

| سناریو          | اقدام                        |
| --------------- | ---------------------------- |
| بینش‌های متناقض | Escalation به Analytics Lead |

---

## 15. Governance Notes

| ID     | یادداشت                                         |
| ------ | ----------------------------------------------- |
| GOV-01 | A-3 (Strategic) — بینش‌ها برای AI-001 قابل مصرف |
| GOV-02 | داده‌های مخاطب محرمانه (SL-02)                  |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-323",
  "name": "Audience Insight Generation",
  "family": "FAM-OPS",
  "subfamily": "OPS-RPT",
  "type": "PT-07",
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
    { "type": "CTX-04", "source": "PRM-322", "required": true },
    { "type": "CTX-02", "source": "EDT-002", "required": true },
    { "type": "CTX-05", "source": "PLAT-*", "required": false }
  ],
  "max_tokens": 5000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "trend_analysis", "type": "VAR-06", "required": true },
    { "id": "include_growth_opportunities", "type": "VAR-03", "required": false, "default": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["trend_analysis"],
    "optional": ["include_growth_opportunities"]
  },
  "output": {
    "required": ["audience_insights", "audience_profiles"],
    "optional": ["content_preferences", "growth_opportunities", "insight_confidence"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Insights data-driven", "severity": "error" },
    { "id": "VAL-02", "description": "At least 3 actionable insights", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-010", "AI-001"],
  "dependencies": ["PRM-322"],
  "documentation_refs": ["EDT-002", "PLAT-*"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                          | توسط        |
| ----------- | ---------- | ------------------------------ | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — تولید بینش مخاطب | معمار سیستم |
