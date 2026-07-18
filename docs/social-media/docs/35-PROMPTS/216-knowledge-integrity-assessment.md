# Knowledge Integrity Assessment — ارزیابی یکپارچگی دانش

> **شناسه:** PRM-418
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Knowledge Architect
> **وابستگی:** PRM-417, [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [ARCH-012](../00-ARCHITECTURE/12-knowledge-model.md), [EDT-001](../24-EDITORIAL/10-content-guidelines.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                          |
| ------------------ | ------------------------------ |
| **id**             | PRM-418                        |
| **name_fa**        | ارزیابی یکپارچگی دانش          |
| **name_en**        | Knowledge Integrity Assessment |
| **family**         | FAM-KNW                        |
| **subfamily**      | KNW-EXT                        |
| **type**           | PT-06                          |
| **complexity**     | C-3                            |
| **authority**      | A-3                            |
| **owner**          | Knowledge Architect            |
| **version**        | 1.0.0-draft                    |
| **status**         | draft                          |
| **security_level** | SL-02                          |

---

## 2. Purpose

PRM-418 نهمین پرامپت زنجیره KNW-EXT. یکپارچگی کلی دانش را از نظر کامل بودن، دقت و قابلیت اطمینان ارزیابی می‌کند.

### ابعاد یکپارچگی

| ID    | بعد          | توضیح           |
| ----- | ------------ | --------------- |
| KI-01 | Completeness | پوشش کامل دامنه |
| KI-02 | Accuracy     | تطابق با منبع   |
| KI-03 | Reliability  | قابلیت اعتماد   |

---

## 3. Scope

### Inside Scope

| حوزه                   | توضیح         |
| ---------------------- | ------------- |
| ارزیابی کامل بودن      | پوشش دامنه    |
| ارزیابی دقت            | تطابق با منبع |
| ارزیابی قابلیت اطمینان | اعتبار منبع   |

### Outside Scope

| حوزه              | دلیل         |
| ----------------- | ------------ |
| ثبت نهایی استخراج | حوزه PRM-419 |
| حذف تکرار         | حوزه PRM-416 |

---

## 4. Consumers

| مصرف‌کننده           | نقش                     | نوع مصرف  |
| -------------------- | ----------------------- | --------- |
| AI-011 (Knowledge)   | ارزیابی یکپارچگی        | Chain     |
| AI-012 (Improvement) | مصرف ارزیابی برای بهبود | Secondary |
| AI-010 (Analytics)   | مصرف آمار یکپارچگی      | Secondary |
| AI-004 (Review)      | بررسی کیفیت             | Quality   |

---

## 5. Inputs

| ورودی                    | نوع    | منبع    | اجباری |
| ------------------------ | ------ | ------- | ------ |
| `consistency_report`     | object | PRM-417 | بله    |
| `deduplicated_knowledge` | array  | PRM-416 | بله    |
| `integrity_criteria`     | object | AI-011  | خیر    |

---

## 6. Outputs

| خروجی                  | نوع     | توضیح                               |
| ---------------------- | ------- | ----------------------------------- |
| `integrity_score`      | object  | امتیاز یکپارچگی                     |
| `integrity_issues`     | array   | مسائل یکپارچگی                      |
| `integrity_assessment` | string  | ارزیابی کلی (pass/conditional/fail) |
| `integrity_complete`   | boolean | وضعیت تکمیل                         |

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

| منبع    | دامنه              | کاربرد           |
| ------- | ------------------ | ---------------- |
| EDT-001 | استانداردهای کیفیت | معیارهای ارزیابی |

---

## 9. Prompt Structure

PRM-418 نهمین گام زنجیره KNW-EXT. یکپارچگی دانش را ارزیابی می‌کند.

```
consistency_report + knowledge → PRM-418 → integrity_assessment → PRM-419
```

---

## 10. Variable Definitions

| متغیر                    | نوع    | اجباری | توضیح                    | اعتبارسنجی            |
| ------------------------ | ------ | ------ | ------------------------ | --------------------- |
| `consistency_report`     | VAR-06 | بله    | گزارش سازگاری از PRM-417 | —                     |
| `deduplicated_knowledge` | VAR-05 | بله    | دانش بدون تکرار          | —                     |
| `integrity_criteria`     | VAR-04 | خیر    | معیارهای سفارشی          | default: KI-01..KI-03 |

---

## 11. Execution Constraints

| ID     | محدودیت                         |
| ------ | ------------------------------- |
| CST-01 | هر سه بعد یکپارچگی ارزیابی شوند |
| CST-02 | مسائل اولویت‌بندی شوند          |

---

## 12. Validation Rules

| ID     | قاعده                                | سطح    | نقض     |
| ------ | ------------------------------------ | ------ | ------- |
| VAL-01 | امتیاز کامل بودن محاسبه شده است      | معماری | عدم ثبت |
| VAL-02 | امتیاز دقت محاسبه شده است            | معماری | عدم ثبت |
| VAL-03 | امتیاز قابلیت اطمینان محاسبه شده است | معماری | عدم ثبت |
| VAL-04 | ارزیابی کلی مشخص است                 | معماری | عدم ثبت |

---

## 13. Failure Conditions

| شرط                     | اقدام                         |
| ----------------------- | ----------------------------- |
| یکپارچگی قابل قبول نیست | Escalation به AI-011 + AI-012 |

---

## 14. Quality Gates

| گیت   | مکان              | معیار          | مسئول           |
| ----- | ----------------- | -------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل      | خودکار          |
| QG-02 | Review → Approved | AI-004 تأیید   | AI-004          |
| QG-03 | Approved → Active | ثبت در PRM-001 | Registry Keeper |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                               | توسط        |
| ----------- | ---------- | ----------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — ارزیابی یکپارچگی دانش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-418",
  "name": "Knowledge Integrity Assessment",
  "family": "FAM-KNW",
  "subfamily": "KNW-EXT",
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
    { "id": "consistency_report", "type": "VAR-06", "required": true },
    { "id": "deduplicated_knowledge", "type": "VAR-05", "required": true },
    { "id": "integrity_criteria", "type": "VAR-04", "required": false }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["consistency_report", "deduplicated_knowledge"],
    "optional": ["integrity_criteria"]
  },
  "output": {
    "required": ["integrity_score", "integrity_assessment", "integrity_complete"],
    "optional": ["integrity_issues"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Completeness score computed", "severity": "error" },
    { "id": "VAL-02", "description": "Accuracy score computed", "severity": "error" },
    { "id": "VAL-03", "description": "Reliability score computed", "severity": "error" },
    { "id": "VAL-04", "description": "Overall assessment specified", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-011", "AI-012", "AI-010", "AI-004"],
  "dependencies": ["PRM-417"],
  "documentation_refs": ["EDT-001"]
}
```
