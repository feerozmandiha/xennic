# Reporting Completion Validation — اعتبارسنجی تکمیل گزارش‌دهی

> **شناسه:** PRM-329
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Analytics Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-328](./136-analytics-quality-assessment.md), [PLAT-\*](../20-PLATFORMS/)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                           |
| ------------------ | ------------------------------- |
| **id**             | PRM-329                         |
| **name_fa**        | اعتبارسنجی تکمیل گزارش‌دهی      |
| **name_en**        | Reporting Completion Validation |
| **family**         | FAM-OPS                         |
| **subfamily**      | OPS-RPT                         |
| **type**           | PT-06                           |
| **complexity**     | C-3                             |
| **authority**      | A-3                             |
| **owner**          | Analytics Lead                  |
| **version**        | 1.0.0-draft                     |
| **status**         | draft                           |
| **security_level** | SL-02                           |

---

## 2. Purpose

PRM-329 آخرین گیت در زنجیره OPS-RPT است که تکمیل کامل فرآیند گزارش‌دهی تحلیلی را تأیید می‌کند. این پرامپت تضمین می‌کند که همه خروجی‌های PRM-320 تا PRM-328 کامل، معتبر و برای مصرف توسط Agentهای پایین‌دست (AI-011, AI-012, AI-001) آماده هستند.

### اصول تکمیل

| ID    | اصل                                               |
| ----- | ------------------------------------------------- |
| RC-01 | همه خروجی‌های زنجیره باید کامل باشند              |
| RC-02 | بسته تحویلی باید قابل مصرف توسط Agentهای هدف باشد |
| RC-03 | خطاهای باقی‌مانده باید مستند شوند                 |

---

## 3. Scope

### Inside Scope

| حوزه            | توضیح                               |
| --------------- | ----------------------------------- |
| بررسی کامل بودن | تأیید وجود همه خروجی‌ها             |
| یکپارچگی بسته   | انسجام خروجی‌های زنجیره             |
| مستندسازی خطاها | ثبت خطاهای باقی‌مانده               |
| تحویل           | آماده‌سازی برای Agentهای مصرف‌کننده |

### Outside Scope

| حوزه         | دلیل         |
| ------------ | ------------ |
| کیفیت تحلیلی | حوزه PRM-328 |
| بهبود        | حوزه AI-012  |

---

## 4. Consumers

| مصرف‌کننده           | نقش                | نوع مصرف |
| -------------------- | ------------------ | -------- |
| AI-010 (Analytics)   | تأیید تکمیل        | Chain    |
| AI-011 (Knowledge)   | دریافت خروجی نهایی | System   |
| AI-012 (Improvement) | دریافت ارزیابی     | System   |
| AI-001 (Strategy)    | دریافت بینش        | System   |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-328 Output",
        "scope": ["quality-result", "quality-score"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-05",
        "source": "PLAT-*",
        "scope": ["reporting-requirements", "completion-criteria"],
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

| منبع         | دامنه            | کاربرد          |
| ------------ | ---------------- | --------------- |
| PRM-320..328 | خروجی‌های زنجیره | بررسی کامل بودن |

---

## 7. Variables

| متغیر           | نوع    | اجباری | توضیح                            | اعتبارسنجی                              |
| --------------- | ------ | ------ | -------------------------------- | --------------------------------------- |
| `chain_outputs` | VAR-06 | بله    | همه خروجی‌های PRM-320 تا PRM-328 | —                                       |
| `target_agents` | VAR-07 | خیر    | Agentهای هدف برای تحویل          | default: ["AI-011", "AI-012", "AI-001"] |

---

## 8. Constraints

| ID     | محدودیت                                         |
| ------ | ----------------------------------------------- |
| CST-01 | همه خروجی‌های اجباری زنجیره وجود داشته باشند    |
| CST-02 | امتیاز کیفیت ≥ ۷۵٪ (از PRM-328)                 |
| CST-03 | بسته تحویلی به همه Agentهای هدف قابل تحویل باشد |

---

## 9. Input Contract

| ورودی           | نوع    | منبع         | اجباری |
| --------------- | ------ | ------------ | ------ |
| `chain_outputs` | object | PRM-320..328 | بله    |
| `target_agents` | array  | AI-010       | خیر    |

---

## 10. Output Contract

| خروجی                           | نوع     | توضیح                                |
| ------------------------------- | ------- | ------------------------------------ |
| `completion_result`             | string  | نتیجه (completed/partial/incomplete) |
| `completeness_checklist`        | object  | چک‌لیست کامل بودن                    |
| `remaining_errors`              | array   | خطاهای باقی‌مانده                    |
| `delivery_package`              | object  | بسته تحویلی به Agentها               |
| `analytics_reporting_completed` | boolean | وضعیت نهایی (true/false)             |

---

## 11. Validation Rules

| ID     | قاعده                            | سطح    | نقض     |
| ------ | -------------------------------- | ------ | ------- |
| VAL-01 | همه خروجی‌های اجباری موجود باشند | معماری | عدم ثبت |
| VAL-02 | quality_score ≥ ۷۵٪              | معماری | عدم ثبت |
| VAL-03 | completion_result = completed    | معماری | عدم ثبت |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                     | مسئول           |
| ----- | ----------------- | ------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار          |
| QG-02 | Review → Approved | چک‌لیست کامل              | Analytics Lead  |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper |

---

## 13. Dependencies

| شناسه        | نوع               | نسخه   | دلیل             |
| ------------ | ----------------- | ------ | ---------------- |
| PRM-328      | DEP-01 (Requires) | ^1.0.0 | ارزیابی کیفیت    |
| PRM-320..327 | DEP-04 (Chain)    | ^1.0.0 | خروجی‌های زنجیره |

---

## 14. Human Override

| سناریو              | اقدام                                |
| ------------------- | ------------------------------------ |
| quality_score < ۷۵٪ | مسدود — Escalation به Analytics Lead |
| partial completion  | مسدود — Escalation با چک‌لیست        |

---

## 15. Governance Notes

| ID     | یادداشت                                            |
| ------ | -------------------------------------------------- |
| GOV-01 | A-3 (Strategic) — آخرین گیت زنجیره OPS-RPT         |
| GOV-02 | خروجی نهایی به AI-011, AI-012, AI-001 تحویل می‌شود |
| GOV-03 | وضعیت final: analytics_reporting_completed         |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-329",
  "name": "Reporting Completion Validation",
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
    { "type": "CTX-04", "source": "PRM-328", "required": true },
    { "type": "CTX-05", "source": "PLAT-*", "required": false }
  ],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "chain_outputs", "type": "VAR-06", "required": true },
    {
      "id": "target_agents",
      "type": "VAR-07",
      "required": false,
      "default": ["AI-011", "AI-012", "AI-001"]
    }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["chain_outputs"],
    "optional": ["target_agents"]
  },
  "output": {
    "required": ["completion_result", "completeness_checklist", "analytics_reporting_completed"],
    "optional": ["remaining_errors", "delivery_package"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "All required outputs present", "severity": "error" },
    { "id": "VAL-02", "description": "Quality score >= 75%", "severity": "error" },
    { "id": "VAL-03", "description": "Completion result = completed", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-010", "AI-011", "AI-012", "AI-001"],
  "dependencies": ["PRM-328"],
  "documentation_refs": ["PLAT-*"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                    | توسط        |
| ----------- | ---------- | ---------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی تکمیل گزارش‌دهی | معمار سیستم |
