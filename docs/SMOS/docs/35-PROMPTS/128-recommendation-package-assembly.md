# Recommendation Package Assembly — مونتاژ بسته توصیه

> **شناسه:** PRM-324
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Analytics Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-323](./126-audience-insight-generation.md), [PRM-301](./30-publishing-instruction.md), [EDT-001](../24-EDITORIAL/10-content-guidelines.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                           |
| ------------------ | ------------------------------- |
| **id**             | PRM-324                         |
| **name_fa**        | مونتاژ بسته توصیه               |
| **name_en**        | Recommendation Package Assembly |
| **family**         | FAM-OPS                         |
| **subfamily**      | OPS-RPT                         |
| **type**           | PT-07                           |
| **complexity**     | C-3                             |
| **authority**      | A-3                             |
| **owner**          | Analytics Lead                  |
| **version**        | 1.0.0-draft                     |
| **status**         | draft                           |
| **security_level** | SL-02                           |

---

## 2. Purpose

PRM-324 مونتاژ بسته توصیه عملیاتی از بینش‌های تحلیلی را تعریف می‌کند. این پرامپت توصیه‌های مبتنی بر داده را اولویت‌بندی، ساختاردهی و برای مصرف توسط Agentهای دیگر (AI-001, AI-012) آماده می‌کند.

### اصول مونتاژ توصیه

| ID    | اصل                                                  |
| ----- | ---------------------------------------------------- |
| RP-01 | توصیه‌ها باید مبتنی بر داده و قابل اندازه‌گیری باشند |
| RP-02 | هر توصیه باید دارای اولویت و زمان‌بندی باشد          |
| RP-03 | بسته باید برای Agentهای مصرف‌کننده قابل فهم باشد     |

---

## 3. Scope

### Inside Scope

| حوزه        | توضیح                                   |
| ----------- | --------------------------------------- |
| اولویت‌بندی | تعیین اولویت توصیه‌ها بر اساس تأثیر     |
| ساختاردهی   | دسته‌بندی توصیه‌ها (محتوا/انتشار/تعامل) |
| زمان‌بندی   | تعیین بازه اجرای هر توصیه               |
| بسته تحویلی | آماده‌سازی برای AI-001, AI-012          |

### Outside Scope

| حوزه          | دلیل         |
| ------------- | ------------ |
| تولید بینش    | حوزه PRM-323 |
| اعتبارسنجی    | حوزه PRM-325 |
| ارزیابی کیفیت | حوزه PRM-328 |

---

## 4. Consumers

| مصرف‌کننده           | نقش                    | نوع مصرف |
| -------------------- | ---------------------- | -------- |
| AI-010 (Analytics)   | مونتاژ بسته توصیه      | Chain    |
| AI-012 (Improvement) | دریافت توصیه‌های بهبود | System   |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-323 Output",
        "scope": ["audience-insights", "growth-opportunities"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-301",
        "scope": ["publishing-workflow", "optimization-areas"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "EDT-001",
        "scope": ["content-lifecycle", "quality-standards"],
        "injection": "append",
        "required": false
      }
    ],
    "max_tokens": 4000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع    | دامنه               | کاربرد         |
| ------- | ------------------- | -------------- |
| PRM-301 | حوزه‌های بهینه‌سازی | تطبیق توصیه‌ها |

---

## 7. Variables

| متغیر               | نوع    | اجباری | توضیح                     | اعتبارسنجی                    |
| ------------------- | ------ | ------ | ------------------------- | ----------------------------- |
| `audience_insights` | VAR-06 | بله    | بینش‌های مخاطب از PRM-323 | —                             |
| `target_agents`     | VAR-07 | خیر    | Agentهای هدف برای توصیه   | default: ["AI-001", "AI-012"] |

---

## 8. Constraints

| ID     | محدودیت                                     |
| ------ | ------------------------------------------- |
| CST-01 | هر توصیه باید KPI هدف داشته باشد            |
| CST-02 | توصیه‌ها باید به Agent هدف قابل نگاشت باشند |

---

## 9. Input Contract

| ورودی               | نوع    | منبع    | اجباری |
| ------------------- | ------ | ------- | ------ |
| `audience_insights` | object | PRM-323 | بله    |
| `target_agents`     | array  | AI-010  | خیر    |

---

## 10. Output Contract

| خروجی                    | نوع    | توضیح                       |
| ------------------------ | ------ | --------------------------- |
| `recommendation_package` | object | بسته توصیه کامل             |
| `recommendations`        | array  | فهرست توصیه‌ها با اولویت    |
| `agent_mapping`          | object | نگاشت توصیه به Agent هدف    |
| `impact_estimate`        | object | تخمین تأثیر هر توصیه        |
| `package_completeness`   | number | درصد کامل بودن بسته (۰–۱۰۰) |

---

## 11. Validation Rules

| ID     | قاعده                         | سطح    | نقض     |
| ------ | ----------------------------- | ------ | ------- |
| VAL-01 | هر توصیه KPI هدف دارد         | معماری | عدم ثبت |
| VAL-02 | توصیه به Agent هدف قابل نگاشت | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                     | مسئول              |
| ----- | ----------------- | ------------------------- | ------------------ |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار             |
| QG-02 | Review → Approved | توصیه‌ها قابل اجرا        | Analytics Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper    |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                      |
| ------- | ------------------- | ------ | ------------------------- |
| PRM-323 | DEP-01 (Requires)   | ^1.0.0 | بینش‌های مخاطب برای توصیه |
| PRM-301 | DEP-03 (References) | ^1.0.0 | حوزه‌های بهینه‌سازی       |

---

## 14. Human Override

| سناریو                          | اقدام             |
| ------------------------------- | ----------------- |
| توصیه بدون KPI قابل اندازه‌گیری | حذف + اطلاع‌رسانی |

---

## 15. Governance Notes

| ID     | یادداشت                                              |
| ------ | ---------------------------------------------------- |
| GOV-01 | A-3 (Strategic) — بسته برای AI-001, AI-012 قابل مصرف |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-324",
  "name": "Recommendation Package Assembly",
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
    { "type": "CTX-04", "source": "PRM-323", "required": true },
    { "type": "CTX-04", "source": "PRM-301", "required": true },
    { "type": "CTX-02", "source": "EDT-001", "required": false }
  ],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "audience_insights", "type": "VAR-06", "required": true },
    { "id": "target_agents", "type": "VAR-07", "required": false, "default": ["AI-001", "AI-012"] }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["audience_insights"],
    "optional": ["target_agents"]
  },
  "output": {
    "required": ["recommendation_package", "recommendations", "agent_mapping"],
    "optional": ["impact_estimate", "package_completeness"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Each recommendation has target KPI", "severity": "error" },
    {
      "id": "VAL-02",
      "description": "Recommendation mappable to target agent",
      "severity": "warning"
    }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-010", "AI-012"],
  "dependencies": ["PRM-323"],
  "documentation_refs": ["PRM-301", "EDT-001"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                           | توسط        |
| ----------- | ---------- | ------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — مونتاژ بسته توصیه | معمار سیستم |
