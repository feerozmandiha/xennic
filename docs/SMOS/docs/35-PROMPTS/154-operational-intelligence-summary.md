# Operational Intelligence Summary — خلاصه هوش عملیاتی

> **شناسه:** PRM-337
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Operations Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-336](./152-monitoring-consistency-validation.md), [PRM-333](./146-operational-health-assessment.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                            |
| ------------------ | -------------------------------- |
| **id**             | PRM-337                          |
| **name_fa**        | خلاصه هوش عملیاتی                |
| **name_en**        | Operational Intelligence Summary |
| **family**         | FAM-OPS                          |
| **subfamily**      | OPS-MON                          |
| **type**           | PT-07                            |
| **complexity**     | C-3                              |
| **authority**      | A-3                              |
| **owner**          | Operations Lead                  |
| **version**        | 1.0.0-draft                      |
| **status**         | draft                            |
| **security_level** | SL-03                            |

---

## 2. Purpose

PRM-337 خلاصه هوش عملیاتی را از خروجی‌های زنجیره OPS-MON تولید می‌کند. این پرامپت یافته‌های کلیدی، روندها و توصیه‌های عملیاتی را برای مصرف توسط Agentهای استراتژیک تلفیق می‌کند.

### اصول خلاصه‌سازی

| ID    | اصل                                        |
| ----- | ------------------------------------------ |
| OI-01 | خلاصه باید شامل یافته‌های کلیدی باشد       |
| OI-02 | روندها باید با داده‌های تاریخی مقایسه شوند |
| OI-03 | توصیه‌ها باید عملی و اولویت‌بندی شده باشند |

---

## 3. Scope

### Inside Scope

| حوزه            | توضیح                     |
| --------------- | ------------------------- |
| یافته‌های کلیدی | استخراج مهم‌ترین یافته‌ها |
| روندها          | تحلیل روند سلامت و ریسک   |
| توصیه‌ها        | پیشنهاد اقدامات عملیاتی   |

### Outside Scope

| حوزه        | دلیل         |
| ----------- | ------------ |
| کیفیت نظارت | حوزه PRM-338 |
| تکمیل نظارت | حوزه PRM-339 |

---

## 4. Consumers

| مصرف‌کننده            | نقش            | نوع مصرف  |
| --------------------- | -------------- | --------- |
| AI-010 (Analytics)    | تولید خلاصه    | Chain     |
| AI-012 (Improvement)  | مصرف توصیه‌ها  | Strategic |
| AI-014 (Orchestrator) | نظارت بر وضعیت | Strategic |

---

## 5. Inputs

| ورودی                | نوع    | منبع    | اجباری |
| -------------------- | ------ | ------- | ------ |
| `consistency_result` | object | PRM-336 | بله    |
| `health_score`       | number | PRM-333 | بله    |
| `risk_assessment`    | object | PRM-335 | بله    |

---

## 6. Outputs

| خروجی                  | نوع     | توضیح             |
| ---------------------- | ------- | ----------------- |
| `intelligence_summary` | object  | خلاصه هوش عملیاتی |
| `key_findings`         | array   | یافته‌های کلیدی   |
| `operational_trends`   | array   | روندهای عملیاتی   |
| `recommendations`      | array   | توصیه‌های عملیاتی |
| `summary_complete`     | boolean | وضعیت تکمیل       |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-336 Output",
        "scope": ["consistency-result", "consistency-score"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-333 Output",
        "scope": ["health-score", "health-indicators"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-335 Output",
        "scope": ["risk-assessment", "critical-risks"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 5000,
    "priority": "high"
  }
}
```

---

## 8. Knowledge Requirements

| منبع    | دامنه           | کاربرد        |
| ------- | --------------- | ------------- |
| PLAT-\* | تاریخچه عملیاتی | مقایسه روندها |

---

## 9. Prompt Structure

PRM-337 هشتمین گام زنجیره OPS-MON. خلاصه هوش عملیاتی را از چند منبع تلفیق می‌کند.

```
PRM-336, 333, 335 → PRM-337 → intelligence_summary → PRM-338
```

---

## 10. Variable Definitions

| متغیر                | نوع    | اجباری | توضیح         | اعتبارسنجی |
| -------------------- | ------ | ------ | ------------- | ---------- |
| `consistency_result` | VAR-06 | بله    | نتیجه سازگاری | —          |
| `health_score`       | VAR-01 | بله    | امتیاز سلامت  | —          |

---

## 11. Execution Constraints

| ID     | محدودیت                         |
| ------ | ------------------------------- |
| CST-01 | خلاصه شامل ≥ ۳ یافته کلیدی باشد |
| CST-02 | توصیه‌ها اولویت‌بندی شوند       |

---

## 12. Validation Rules

| ID     | قاعده                    | سطح    | نقض   |
| ------ | ------------------------ | ------ | ----- |
| VAL-01 | ≥ ۳ یافته کلیدی          | معماری | هشدار |
| VAL-02 | توصیه‌ها اولویت‌بندی شده | معماری | هشدار |

---

## 13. Failure Conditions

| شرط                             | اقدام                             |
| ------------------------------- | --------------------------------- |
| داده کافی برای یافته وجود ندارد | بازگشت با یافته‌های موجود + هشدار |
| تضاد بین منابع                  | Escalation به Operations Lead     |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                     | مسئول           |
| ----- | ----------------- | ------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار          |
| QG-02 | Review → Approved | یافته‌ها کامل             | Operations Lead |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                           | توسط        |
| ----------- | ---------- | ------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — خلاصه هوش عملیاتی | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-337",
  "name": "Operational Intelligence Summary",
  "family": "FAM-OPS",
  "subfamily": "OPS-MON",
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
    { "type": "CTX-04", "source": "PRM-336", "required": true },
    { "type": "CTX-04", "source": "PRM-333", "required": true },
    { "type": "CTX-04", "source": "PRM-335", "required": true }
  ],
  "max_tokens": 5000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "consistency_result", "type": "VAR-06", "required": true },
    { "id": "health_score", "type": "VAR-01", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["consistency_result", "health_score"],
    "optional": ["risk_assessment"]
  },
  "output": {
    "required": ["intelligence_summary", "summary_complete"],
    "optional": ["key_findings", "operational_trends", "recommendations"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "At least 3 key findings", "severity": "warning" },
    { "id": "VAL-02", "description": "Recommendations prioritized", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-03",
  "consumers": ["AI-010", "AI-012", "AI-014"],
  "dependencies": [],
  "documentation_refs": ["PLAT-*"]
}
```
