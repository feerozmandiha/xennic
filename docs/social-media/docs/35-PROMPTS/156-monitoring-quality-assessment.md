# Monitoring Quality Assessment — ارزیابی کیفیت نظارت

> **شناسه:** PRM-338
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Operations Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-337](./154-operational-intelligence-summary.md), [EDT-001](../24-EDITORIAL/10-content-guidelines.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                         |
| ------------------ | ----------------------------- |
| **id**             | PRM-338                       |
| **name_fa**        | ارزیابی کیفیت نظارت           |
| **name_en**        | Monitoring Quality Assessment |
| **family**         | FAM-OPS                       |
| **subfamily**      | OPS-MON                       |
| **type**           | PT-06                         |
| **complexity**     | C-3                           |
| **authority**      | A-3                           |
| **owner**          | Operations Lead               |
| **version**        | 1.0.0-draft                   |
| **status**         | draft                         |
| **security_level** | SL-02                         |

---

## 2. Purpose

PRM-338 کیفیت کلی خروجی‌های زنجیره OPS-MON را ارزیابی می‌کند. این پرامپت با ترکیب نتایج اعتبارسنجی‌های پیشین و بررسی کیفیت محتوایی، امتیاز کیفیت نهایی نظارت را محاسبه می‌کند.

### اصول ارزیابی

| ID    | اصل                                            |
| ----- | ---------------------------------------------- |
| MQ-01 | کیفیت نظارت ترکیبی از اعتبارسنجی‌های پیشین است |
| MQ-02 | امتیاز کیفیت باید قابل مقایسه بین دوره‌ها باشد |
| MQ-03 | نقاط ضعف باید مستند و قابل ردیابی باشند        |

---

## 3. Scope

### Inside Scope

| حوزه          | توضیح                             |
| ------------- | --------------------------------- |
| ترکیب نتایج   | ادغام اعتبارسنجی‌های PRM-335, 336 |
| کیفیت محتوایی | بررسی دقت و عمق تحلیل نظارت       |
| امتیاز نهایی  | محاسبه امتیاز کیفیت یکپارچه       |

### Outside Scope

| حوزه        | دلیل         |
| ----------- | ------------ |
| تکمیل نظارت | حوزه PRM-339 |

---

## 4. Consumers

| مصرف‌کننده           | نقش                     | نوع مصرف  |
| -------------------- | ----------------------- | --------- |
| AI-010 (Analytics)   | ارزیابی کیفیت           | Chain     |
| AI-012 (Improvement) | مصرف ارزیابی برای بهبود | Strategic |

---

## 5. Inputs

| ورودی                  | نوع    | منبع    | اجباری |
| ---------------------- | ------ | ------- | ------ |
| `intelligence_summary` | object | PRM-337 | بله    |
| `consistency_score`    | number | PRM-336 | بله    |
| `risk_score`           | number | PRM-335 | خیر    |

---

## 6. Outputs

| خروجی                     | نوع    | توضیح                      |
| ------------------------- | ------ | -------------------------- |
| `quality_result`          | object | نتیجه ارزیابی کیفیت        |
| `quality_score`           | number | امتیاز کیفیت نهایی (۰–۱۰۰) |
| `quality_dimensions`      | object | امتیاز هر بعد کیفیت        |
| `weaknesses`              | array  | نقاط ضعف مستند             |
| `improvement_suggestions` | array  | پیشنهادات بهبود            |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-337 Output",
        "scope": ["intelligence-summary", "key-findings"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-336 Output",
        "scope": ["consistency-score", "inconsistencies"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-335 Output",
        "scope": ["risk-score", "critical-risks"],
        "injection": "prepend",
        "required": false
      }
    ],
    "max_tokens": 4000,
    "priority": "high"
  }
}
```

---

## 8. Knowledge Requirements

| منبع    | دامنه          | کاربرد        |
| ------- | -------------- | ------------- |
| EDT-001 | معیارهای کیفیت | ارزیابی نظارت |

---

## 9. Prompt Structure

PRM-338 نهمین گام زنجیره OPS-MON. کیفیت کل زنجیره را ارزیابی می‌کند.

```
PRM-337, 336, 335 → PRM-338 → quality_score → PRM-339
```

---

## 10. Variable Definitions

| متغیر                  | نوع    | اجباری | توضیح             | اعتبارسنجی   |
| ---------------------- | ------ | ------ | ----------------- | ------------ |
| `intelligence_summary` | VAR-06 | بله    | خلاصه هوش عملیاتی | —            |
| `consistency_score`    | VAR-01 | بله    | امتیاز سازگاری    | range: 0-100 |

---

## 11. Execution Constraints

| ID     | محدودیت                                      |
| ------ | -------------------------------------------- |
| CST-01 | quality_score = ترکیب وزنی PRM-335, 336, 337 |
| CST-02 | هر نقص با منبع مشخص شود                      |

---

## 12. Validation Rules

| ID     | قاعده                   | سطح    | نقض     |
| ------ | ----------------------- | ------ | ------- |
| VAL-01 | quality_score ≥ ۷۰٪     | معماری | عدم ثبت |
| VAL-02 | هر نقص با منبع مشخص شود | معماری | هشدار   |

---

## 13. Failure Conditions

| شرط                 | اقدام                         |
| ------------------- | ----------------------------- |
| quality_score < ۷۰٪ | Escalation به Operations Lead |
| نقص بدون منبع       | مسدود — تکمیل مستندات         |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                     | مسئول           |
| ----- | ----------------- | ------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار          |
| QG-02 | Review → Approved | کیفیت ≥ ۷۰٪               | Operations Lead |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                             | توسط        |
| ----------- | ---------- | --------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — ارزیابی کیفیت نظارت | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-338",
  "name": "Monitoring Quality Assessment",
  "family": "FAM-OPS",
  "subfamily": "OPS-MON",
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
    { "type": "CTX-04", "source": "PRM-337", "required": true },
    { "type": "CTX-04", "source": "PRM-336", "required": true },
    { "type": "CTX-04", "source": "PRM-335", "required": false }
  ],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "intelligence_summary", "type": "VAR-06", "required": true },
    { "id": "consistency_score", "type": "VAR-01", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["intelligence_summary", "consistency_score"],
    "optional": ["risk_score"]
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
    { "id": "VAL-01", "description": "Quality score >= 70%", "severity": "error" },
    { "id": "VAL-02", "description": "Each weakness has identified source", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-010", "AI-012"],
  "dependencies": [],
  "documentation_refs": ["EDT-001"]
}
```
