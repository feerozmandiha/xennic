# Knowledge Consistency Validation — اعتبارسنجی سازگاری دانش

> **شناسه:** PRM-417
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Knowledge Architect
> **وابستگی:** PRM-416, [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [ARCH-012](../00-ARCHITECTURE/12-knowledge-model.md), [ARCH-003](../00-ARCHITECTURE/03-canonical-vocabulary.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                            |
| ------------------ | -------------------------------- |
| **id**             | PRM-417                          |
| **name_fa**        | اعتبارسنجی سازگاری دانش          |
| **name_en**        | Knowledge Consistency Validation |
| **family**         | FAM-KNW                          |
| **subfamily**      | KNW-EXT                          |
| **type**           | PT-06                            |
| **complexity**     | C-2                              |
| **authority**      | A-3                              |
| **owner**          | Knowledge Architect              |
| **version**        | 1.0.0-draft                      |
| **status**         | draft                            |
| **security_level** | SL-02                            |

---

## 2. Purpose

PRM-417 هشتمین پرامپت زنجیره KNW-EXT. سازگاری درونی دانش و تطابق آن با واژه‌نامه رسمی و مدل دانش را اعتبارسنجی می‌کند.

### اصول سازگاری

| ID    | اصل                              |
| ----- | -------------------------------- |
| KC-01 | دانش از نظر درونی سازگار باشد    |
| KC-02 | اصطلاحات با ARCH-003 یکسان باشند |

---

## 3. Scope

### Inside Scope

| حوزه                 | توضیح                |
| -------------------- | -------------------- |
| سازگاری درونی        | عدم تناقض بین مفاهیم |
| سازگاری با واژه‌نامه | تطابق با ARCH-003    |

### Outside Scope

| حوزه             | دلیل         |
| ---------------- | ------------ |
| ارزیابی یکپارچگی | حوزه PRM-418 |
| حذف تکرار        | حوزه PRM-416 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                | نوع مصرف |
| ------------------ | ------------------ | -------- |
| AI-011 (Knowledge) | اعتبارسنجی سازگاری | Chain    |
| AI-004 (Review)    | بررسی کیفیت        | Quality  |

---

## 5. Inputs

| ورودی                    | نوع    | منبع     | اجباری |
| ------------------------ | ------ | -------- | ------ |
| `deduplicated_knowledge` | array  | PRM-416  | بله    |
| `canonical_vocabulary`   | object | ARCH-003 | بله    |

---

## 6. Outputs

| خروجی                | نوع     | توضیح                     |
| -------------------- | ------- | ------------------------- |
| `consistency_report` | object  | گزارش سازگاری             |
| `inconsistencies`    | array   | ناسازگاری‌های شناسایی‌شده |
| `consistency_valid`  | boolean | وضعیت اعتبارسنجی          |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "ARCH-012",
        "scope": ["knowledge-model"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "ARCH-003",
        "scope": ["canonical-vocabulary"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 2000,
    "priority": "high"
  }
}
```

---

## 8. Knowledge Requirements

| منبع     | دامنه          | کاربرد           |
| -------- | -------------- | ---------------- |
| ARCH-012 | مدل دانش       | سازگاری ساختاری  |
| ARCH-003 | واژه‌نامه رسمی | سازگاری اصطلاحات |

---

## 9. Prompt Structure

PRM-417 هشتمین گام زنجیره KNW-EXT. سازگاری دانش را اعتبارسنجی می‌کند.

```
deduplicated_knowledge + vocabulary → PRM-417 → consistency_report → PRM-418
```

---

## 10. Variable Definitions

| متغیر                    | نوع    | اجباری | توضیح           | اعتبارسنجی |
| ------------------------ | ------ | ------ | --------------- | ---------- |
| `deduplicated_knowledge` | VAR-05 | بله    | دانش بدون تکرار | —          |
| `canonical_vocabulary`   | VAR-03 | بله    | واژه‌نامه رسمی  | —          |

---

## 11. Execution Constraints

| ID     | محدودیت                                 |
| ------ | --------------------------------------- |
| CST-01 | عدم تناقض درونی                         |
| CST-02 | اصطلاحات با ARCH-003 مطابقت داشته باشند |

---

## 12. Validation Rules

| ID     | قاعده                             | سطح    | نقض     |
| ------ | --------------------------------- | ------ | ------- |
| VAL-01 | هیچ تناقض درونی شناسایی نشده      | معماری | عدم ثبت |
| VAL-02 | اصطلاحات با ARCH-003 مطابقت دارند | معماری | هشدار   |

---

## 13. Failure Conditions

| شرط                    | اقدام                            |
| ---------------------- | -------------------------------- |
| تناقض درونی شناسایی شد | بازگشت error + بازگشت به PRM-415 |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                  | مسئول           |
| ----- | ----------------- | ---------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل              | خودکار          |
| QG-02 | Review → Approved | AI-004 تأیید + سازگاری | AI-004          |
| QG-03 | Approved → Active | ثبت در PRM-001         | Registry Keeper |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                 | توسط        |
| ----------- | ---------- | ------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی سازگاری دانش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-417",
  "name": "Knowledge Consistency Validation",
  "family": "FAM-KNW",
  "subfamily": "KNW-EXT",
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
    { "type": "CTX-02", "source": "ARCH-012", "required": true },
    { "type": "CTX-02", "source": "ARCH-003", "required": true }
  ],
  "max_tokens": 2000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "deduplicated_knowledge", "type": "VAR-05", "required": true },
    { "id": "canonical_vocabulary", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["deduplicated_knowledge", "canonical_vocabulary"],
    "optional": []
  },
  "output": {
    "required": ["consistency_report", "consistency_valid"],
    "optional": ["inconsistencies"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "No internal inconsistencies detected", "severity": "error" },
    { "id": "VAL-02", "description": "Terms conform to ARCH-003", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-011", "AI-004"],
  "dependencies": ["PRM-416"],
  "documentation_refs": ["ARCH-012", "ARCH-003"]
}
```
