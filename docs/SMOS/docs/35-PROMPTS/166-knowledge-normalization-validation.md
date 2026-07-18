# Knowledge Normalization Validation — اعتبارسنجی نرمال‌سازی دانش

> **شناسه:** PRM-406
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Knowledge Architect
> **وابستگی:** PRM-405, [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [ARCH-012](../00-ARCHITECTURE/12-knowledge-model.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                              |
| ------------------ | ---------------------------------- |
| **id**             | PRM-406                            |
| **name_fa**        | اعتبارسنجی نرمال‌سازی دانش         |
| **name_en**        | Knowledge Normalization Validation |
| **family**         | FAM-KNW                            |
| **subfamily**      | KNW-RTR                            |
| **type**           | PT-06                              |
| **complexity**     | C-2                                |
| **authority**      | A-3                                |
| **owner**          | Knowledge Architect                |
| **version**        | 1.0.0-draft                        |
| **status**         | draft                              |
| **security_level** | SL-02                              |

---

## 2. Purpose

PRM-406 چهارمین پرامپت زنجیره KNW-RTR. دانش استخراج‌شده (PRM-405) را نرمال‌سازی کرده و یکپارچگی ساختاری را اعتبارسنجی می‌کند: حذف تکرار، یکسان‌سازی اصطلاحات و تطابق با مدل دانش.

### اصول نرمال‌سازی

| ID    | اصل                                         |
| ----- | ------------------------------------------- |
| KN-01 | دانش باید بدون تکرار مفهومی باشد            |
| KN-02 | اصطلاحات باید طبق واژه‌نامه رسمی یکسان شوند |
| KN-03 | ساختار باید با مدل دانش ARCH-012 منطبق باشد |

---

## 3. Scope

### Inside Scope

| حوزه                | توضیح                       |
| ------------------- | --------------------------- |
| حذف تکرار           | شناسایی و حذف مفاهیم تکراری |
| یکسان‌سازی اصطلاحات | تطابق با واژه‌نامه رسمی     |
| اعتبارسنجی ساختار   | تطابق با مدل دانش           |

### Outside Scope

| حوزه               | دلیل         |
| ------------------ | ------------ |
| ارزیابی کیفیت دانش | حوزه PRM-407 |
| ثبت نهایی          | حوزه PRM-408 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                    | نوع مصرف |
| ------------------ | ---------------------- | -------- |
| AI-011 (Knowledge) | نرمال‌سازی دانش        | Chain    |
| AI-004 (Review)    | بررسی کیفیت نرمال‌سازی | Quality  |

---

## 5. Inputs

| ورودی                  | نوع    | منبع     | اجباری |
| ---------------------- | ------ | -------- | ------ |
| `extracted_concepts`   | array  | PRM-405  | بله    |
| `extracted_relations`  | array  | PRM-405  | خیر    |
| `canonical_vocabulary` | object | ARCH-003 | بله    |
| `knowledge_model`      | object | ARCH-012 | بله    |

---

## 6. Outputs

| خروجی                  | نوع     | توضیح                    |
| ---------------------- | ------- | ------------------------ |
| `normalized_concepts`  | array   | مفاهیم نرمال‌سازی‌شده    |
| `normalized_relations` | array   | روابط نرمال‌سازی‌شده     |
| `normalization_log`    | array   | گزارش تغییرات نرمال‌سازی |
| `normalization_valid`  | boolean | وضعیت اعتبارسنجی         |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "ARCH-012",
        "scope": ["knowledge-object-model"],
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
    "max_tokens": 3000,
    "priority": "high"
  }
}
```

---

## 8. Knowledge Requirements

| منبع     | دامنه          | کاربرد              |
| -------- | -------------- | ------------------- |
| ARCH-012 | مدل اشیاء دانش | نرمال‌سازی ساختار   |
| ARCH-003 | واژه‌نامه رسمی | یکسان‌سازی اصطلاحات |

---

## 9. Prompt Structure

PRM-406 چهارمین گام زنجیره KNW-RTR. دانش استخراج‌شده را نرمال‌سازی و اعتبارسنجی می‌کند.

```
extracted_knowledge + canonical_refs → PRM-406 → normalized_knowledge → PRM-407
```

---

## 10. Variable Definitions

| متغیر                  | نوع    | اجباری | توضیح                         | اعتبارسنجی      |
| ---------------------- | ------ | ------ | ----------------------------- | --------------- |
| `extracted_concepts`   | VAR-05 | بله    | مفاهیم استخراج‌شده از PRM-405 | منطبق با VAL-01 |
| `extracted_relations`  | VAR-05 | خیر    | روابط استخراج‌شده             | —               |
| `canonical_vocabulary` | VAR-03 | بله    | واژه‌نامه رسمی از ARCH-003    | —               |
| `knowledge_model`      | VAR-03 | بله    | مدل دانش از ARCH-012          | —               |

---

## 11. Execution Constraints

| ID     | محدودیت                                |
| ------ | -------------------------------------- |
| CST-01 | حذف تکرار بدون از دست دادن معنا        |
| CST-02 | اصطلاحات با ARCH-003 تطابق داشته باشند |
| CST-03 | ساختار با ARCH-012 منطبق باشد          |

---

## 12. Validation Rules

| ID     | قاعده                            | سطح    | نقض     |
| ------ | -------------------------------- | ------ | ------- |
| VAL-01 | مفاهیم تکراری حذف شده‌اند        | معماری | عدم ثبت |
| VAL-02 | اصطلاحات با ARCH-003 تطابق دارند | معماری | بازگشت  |
| VAL-03 | ساختار با ARCH-012 منطبق است     | معماری | هشدار   |
| VAL-04 | گزارش تغییرات موجود است          | معماری | هشدار   |

---

## 13. Failure Conditions

| شرط                                       | اقدام                                      |
| ----------------------------------------- | ------------------------------------------ |
| دانش استخراج‌شده با ARCH-012 ناسازگار است | Escalation به AI-011 + Knowledge Architect |
| واژه‌نامه رسمی موجود نیست                 | توقف + اطلاع به Registry Keeper            |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                          | مسئول           |
| ----- | ----------------- | ------------------------------ | --------------- |
| QG-01 | Draft → Review    | هویت کامل, ورودی PRM-405 معتبر | خودکار          |
| QG-02 | Review → Approved | نرمال‌سازی کامل + AI-004 تأیید | AI-004          |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)      | Registry Keeper |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                    | توسط        |
| ----------- | ---------- | ---------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی نرمال‌سازی دانش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-406",
  "name": "Knowledge Normalization Validation",
  "family": "FAM-KNW",
  "subfamily": "KNW-RTR",
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
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "extracted_concepts", "type": "VAR-05", "required": true },
    { "id": "extracted_relations", "type": "VAR-05", "required": false },
    { "id": "canonical_vocabulary", "type": "VAR-03", "required": true },
    { "id": "knowledge_model", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["extracted_concepts", "canonical_vocabulary", "knowledge_model"],
    "optional": ["extracted_relations"]
  },
  "output": {
    "required": ["normalized_concepts", "normalization_valid"],
    "optional": ["normalized_relations", "normalization_log"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Duplicate concepts removed", "severity": "error" },
    { "id": "VAL-02", "description": "Terms conform to ARCH-003", "severity": "error" },
    { "id": "VAL-03", "description": "Structure conforms to ARCH-012", "severity": "warning" },
    { "id": "VAL-04", "description": "Change log is present", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-011", "AI-004"],
  "dependencies": ["PRM-405"],
  "documentation_refs": ["ARCH-012", "ARCH-003"]
}
```
