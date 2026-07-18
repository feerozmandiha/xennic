# Knowledge Entity Identification — شناسایی موجودیت دانش

> **شناسه:** PRM-412
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Knowledge Architect
> **وابستگی:** PRM-411, [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [ARCH-003](../00-ARCHITECTURE/03-canonical-vocabulary.md), [ARCH-012](../00-ARCHITECTURE/12-knowledge-model.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                           |
| ------------------ | ------------------------------- |
| **id**             | PRM-412                         |
| **name_fa**        | شناسایی موجودیت دانش            |
| **name_en**        | Knowledge Entity Identification |
| **family**         | FAM-KNW                         |
| **subfamily**      | KNW-EXT                         |
| **type**           | PT-04                           |
| **complexity**     | C-2                             |
| **authority**      | A-3                             |
| **owner**          | Knowledge Architect             |
| **version**        | 1.0.0-draft                     |
| **status**         | draft                           |
| **security_level** | SL-02                           |

---

## 2. Purpose

PRM-412 سومین پرامپت زنجیره KNW-EXT. موجودیت‌های دانشی را از خروجی استخراج شناسایی و برچسب‌گذاری می‌کند.

### اصول شناسایی

| ID    | اصل                                               |
| ----- | ------------------------------------------------- |
| EI-01 | موجودیت‌ها با واژه‌نامه رسمی ARCH-003 تطابق دارند |
| EI-02 | هر موجودیت یک نوع مشخص دارد                       |

---

## 3. Scope

### Inside Scope

| حوزه                | توضیح                     |
| ------------------- | ------------------------- |
| شناسایی نوع موجودیت | شخص، مفهوم، رویداد، مکان  |
| برچسب‌گذاری         | تخصیص برچسب طبق واژه‌نامه |

### Outside Scope

| حوزه           | دلیل         |
| -------------- | ------------ |
| استخراج رابطه  | حوزه PRM-413 |
| طبقه‌بندی دانش | حوزه PRM-415 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                | نوع مصرف  |
| ------------------ | ------------------ | --------- |
| AI-011 (Knowledge) | شناسایی موجودیت‌ها | Chain     |
| AI-010 (Analytics) | مصرف موجودیت‌ها    | Secondary |
| AI-013 (Research)  | مصرف برای پژوهش    | Secondary |

---

## 5. Inputs

| ورودی                  | نوع    | منبع     | اجباری |
| ---------------------- | ------ | -------- | ------ |
| `extracted_knowledge`  | array  | PRM-411  | بله    |
| `canonical_vocabulary` | object | ARCH-003 | بله    |
| `entity_types`         | object | ARCH-012 | بله    |

---

## 6. Outputs

| خروجی                     | نوع     | توضیح                   |
| ------------------------- | ------- | ----------------------- |
| `identified_entities`     | array   | موجودیت‌های شناسایی‌شده |
| `entity_annotations`      | array   | برچسب‌های هر موجودیت    |
| `identification_complete` | boolean | وضعیت تکمیل             |

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

| منبع     | دامنه          | کاربرد        |
| -------- | -------------- | ------------- |
| ARCH-012 | مدل اشیاء دانش | انواع موجودیت |
| ARCH-003 | واژه‌نامه رسمی | برچسب‌گذاری   |

---

## 9. Prompt Structure

PRM-412 سومین گام زنجیره KNW-EXT. موجودیت‌ها را شناسایی می‌کند.

```
extracted_knowledge + canonical_refs → PRM-412 → identified_entities → PRM-413
```

---

## 10. Variable Definitions

| متغیر                  | نوع    | اجباری | توضیح                       | اعتبارسنجی |
| ---------------------- | ------ | ------ | --------------------------- | ---------- |
| `extracted_knowledge`  | VAR-05 | بله    | دانش استخراج‌شده از PRM-411 | —          |
| `canonical_vocabulary` | VAR-03 | بله    | واژه‌نامه رسمی              | —          |
| `entity_types`         | VAR-03 | بله    | انواع موجودیت از ARCH-012   | —          |

---

## 11. Execution Constraints

| ID     | محدودیت                                   |
| ------ | ----------------------------------------- |
| CST-01 | موجودیت‌ها با ARCH-003 مطابقت داشته باشند |
| CST-02 | هر موجودیت یک نوع داشته باشد              |

---

## 12. Validation Rules

| ID     | قاعده                             | سطح    | نقض     |
| ------ | --------------------------------- | ------ | ------- |
| VAL-01 | هر موجودیت دارای نوع است          | معماری | عدم ثبت |
| VAL-02 | برچسب‌ها با ARCH-003 مطابقت دارند | معماری | هشدار   |

---

## 13. Failure Conditions

| شرط                              | اقدام                             |
| -------------------------------- | --------------------------------- |
| موجودیت با هیچ نوعی مطابقت ندارد | Escalation به Knowledge Architect |

---

## 14. Quality Gates

| گیت   | مکان              | معیار          | مسئول               |
| ----- | ----------------- | -------------- | ------------------- |
| QG-01 | Draft → Review    | هویت کامل      | خودکار              |
| QG-02 | Review → Approved | شناسایی کامل   | Knowledge Architect |
| QG-03 | Approved → Active | ثبت در PRM-001 | Registry Keeper     |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                              | توسط        |
| ----------- | ---------- | ---------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — شناسایی موجودیت دانش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-412",
  "name": "Knowledge Entity Identification",
  "family": "FAM-KNW",
  "subfamily": "KNW-EXT",
  "type": "PT-04",
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
    { "id": "extracted_knowledge", "type": "VAR-05", "required": true },
    { "id": "canonical_vocabulary", "type": "VAR-03", "required": true },
    { "id": "entity_types", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["extracted_knowledge", "canonical_vocabulary", "entity_types"],
    "optional": []
  },
  "output": {
    "required": ["identified_entities", "identification_complete"],
    "optional": ["entity_annotations"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Each entity has a type", "severity": "error" },
    { "id": "VAL-02", "description": "Annotations conform to ARCH-003", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-011", "AI-010", "AI-013"],
  "dependencies": ["PRM-411"],
  "documentation_refs": ["ARCH-012", "ARCH-003"]
}
```
