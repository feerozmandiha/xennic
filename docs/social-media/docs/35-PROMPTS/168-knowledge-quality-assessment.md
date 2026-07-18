# Knowledge Quality Assessment — ارزیابی کیفیت دانش

> **شناسه:** PRM-407
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Knowledge Architect
> **وابستگی:** PRM-406, [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [EDT-001](../24-EDITORIAL/10-content-guidelines.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                        |
| ------------------ | ---------------------------- |
| **id**             | PRM-407                      |
| **name_fa**        | ارزیابی کیفیت دانش           |
| **name_en**        | Knowledge Quality Assessment |
| **family**         | FAM-KNW                      |
| **subfamily**      | KNW-RTR                      |
| **type**           | PT-06                        |
| **complexity**     | C-3                          |
| **authority**      | A-3                          |
| **owner**          | Knowledge Architect          |
| **version**        | 1.0.0-draft                  |
| **status**         | draft                        |
| **security_level** | SL-02                        |

---

## 2. Purpose

PRM-407 پنجمین پرامپت زنجیره KNW-RTR. کیفیت دانش نرمال‌سازی‌شده (PRM-406) را بر اساس معیارهای دقت، کامل بودن، سازگاری و قابلیت استفاده ارزیابی می‌کند.

### ابعاد کیفیت

| ID    | بعد          | توضیح                            |
| ----- | ------------ | -------------------------------- |
| KQ-01 | Accuracy     | تطابق دانش با منبع اصلی          |
| KQ-02 | Completeness | پوشش کامل محدوده استخراج         |
| KQ-03 | Consistency  | سازگاری درونی و با دانش موجود    |
| KQ-04 | Usability    | قابلیت استفاده توسط مصرف‌کنندگان |

---

## 3. Scope

### Inside Scope

| حوزه                   | توضیح                         |
| ---------------------- | ----------------------------- |
| ارزیابی دقت            | بررسی تطابق با منبع           |
| ارزیابی کامل بودن      | پوشش محدوده استخراج           |
| ارزیابی سازگاری        | سازگاری درونی و با دانش موجود |
| ارزیابی قابلیت استفاده | مناسب بودن برای مصرف‌کنندگان  |

### Outside Scope

| حوزه            | دلیل         |
| --------------- | ------------ |
| ثبت نهایی دانش  | حوزه PRM-408 |
| نرمال‌سازی مجدد | حوزه PRM-406 |

---

## 4. Consumers

| مصرف‌کننده           | نقش                     | نوع مصرف  |
| -------------------- | ----------------------- | --------- |
| AI-011 (Knowledge)   | ارزیابی کیفیت دانش      | Chain     |
| AI-012 (Improvement) | مصرف ارزیابی برای بهبود | Secondary |
| AI-004 (Review)      | بررسی کیفیت             | Quality   |

---

## 5. Inputs

| ورودی                  | نوع    | منبع    | اجباری |
| ---------------------- | ------ | ------- | ------ |
| `normalized_concepts`  | array  | PRM-406 | بله    |
| `normalized_relations` | array  | PRM-406 | خیر    |
| `normalization_log`    | array  | PRM-406 | بله    |
| `quality_criteria`     | object | AI-011  | خیر    |

---

## 6. Outputs

| خروجی                | نوع     | توضیح                               |
| -------------------- | ------- | ----------------------------------- |
| `quality_score`      | object  | امتیاز کیفیت در هر بعد              |
| `quality_issues`     | array   | مسائل کیفی شناسایی‌شده              |
| `quality_assessment` | string  | ارزیابی کلی (pass/conditional/fail) |
| `quality_complete`   | boolean | وضعیت تکمیل                         |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "EDT-001",
        "scope": ["quality-standards"],
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

## 8. Knowledge Requirements

| منبع    | دامنه                    | کاربرد           |
| ------- | ------------------------ | ---------------- |
| EDT-001 | استانداردهای کیفیت محتوا | معیارهای ارزیابی |

---

## 9. Prompt Structure

PRM-407 پنجمین گام زنجیره KNW-RTR. کیفیت دانش نرمال‌سازی‌شده را ارزیابی می‌کند.

```
normalized_knowledge → PRM-407 → quality_assessment → PRM-408
```

---

## 10. Variable Definitions

| متغیر                  | نوع    | اجباری | توضیح                            | اعتبارسنجی            |
| ---------------------- | ------ | ------ | -------------------------------- | --------------------- |
| `normalized_concepts`  | VAR-05 | بله    | مفاهیم نرمال‌سازی‌شده از PRM-406 | منطبق با VAL-01       |
| `normalized_relations` | VAR-05 | خیر    | روابط نرمال‌سازی‌شده             | —                     |
| `normalization_log`    | VAR-06 | بله    | گزارش نرمال‌سازی                 | —                     |
| `quality_criteria`     | VAR-04 | خیر    | معیارهای کیفیت سفارشی            | default: KQ-01..KQ-04 |

---

## 11. Execution Constraints

| ID     | محدودیت                             |
| ------ | ----------------------------------- |
| CST-01 | هر چهار بعد کیفیت ارزیابی شوند      |
| CST-02 | مسائل کیفی مستند و اولویت‌بندی شوند |

---

## 12. Validation Rules

| ID     | قاعده                           | سطح    | نقض     |
| ------ | ------------------------------- | ------ | ------- |
| VAL-01 | امتیاز دقت محاسبه شده است       | معماری | عدم ثبت |
| VAL-02 | امتیاز کامل بودن محاسبه شده است | معماری | عدم ثبت |
| VAL-03 | مسائل کیفی اولویت‌بندی شده‌اند  | معماری | هشدار   |
| VAL-04 | ارزیابی کلی مشخص است            | معماری | عدم ثبت |

---

## 13. Failure Conditions

| شرط                               | اقدام                            |
| --------------------------------- | -------------------------------- |
| کیفیت در هیچ بعدی acceptable نیست | Escalation به AI-011 + AI-012    |
| normalized_concepts ناقص است      | بازگشت error + بازگشت به PRM-406 |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                          | مسئول           |
| ----- | ----------------- | ------------------------------ | --------------- |
| QG-01 | Draft → Review    | هویت کامل, ورودی PRM-406 معتبر | خودکار          |
| QG-02 | Review → Approved | کیفیت قابل قبول + AI-004 تأیید | AI-004          |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)      | Registry Keeper |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                            | توسط        |
| ----------- | ---------- | -------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — ارزیابی کیفیت دانش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-407",
  "name": "Knowledge Quality Assessment",
  "family": "FAM-KNW",
  "subfamily": "KNW-RTR",
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
  "sources": [{ "type": "CTX-02", "source": "EDT-001", "required": true }],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "normalized_concepts", "type": "VAR-05", "required": true },
    { "id": "normalized_relations", "type": "VAR-05", "required": false },
    { "id": "normalization_log", "type": "VAR-06", "required": true },
    { "id": "quality_criteria", "type": "VAR-04", "required": false }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["normalized_concepts", "normalization_log"],
    "optional": ["normalized_relations", "quality_criteria"]
  },
  "output": {
    "required": ["quality_score", "quality_assessment", "quality_complete"],
    "optional": ["quality_issues"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Accuracy score is computed", "severity": "error" },
    { "id": "VAL-02", "description": "Completeness score is computed", "severity": "error" },
    { "id": "VAL-03", "description": "Quality issues are prioritized", "severity": "warning" },
    { "id": "VAL-04", "description": "Overall assessment is provided", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-011", "AI-012", "AI-004"],
  "dependencies": ["PRM-406"],
  "documentation_refs": ["EDT-001"]
}
```
