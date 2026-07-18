# Relationship Extraction — استخراج رابطه

> **شناسه:** PRM-413
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Knowledge Architect
> **وابستگی:** PRM-412, [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [ARCH-012](../00-ARCHITECTURE/12-knowledge-model.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                   |
| ------------------ | ----------------------- |
| **id**             | PRM-413                 |
| **name_fa**        | استخراج رابطه           |
| **name_en**        | Relationship Extraction |
| **family**         | FAM-KNW                 |
| **subfamily**      | KNW-EXT                 |
| **type**           | PT-04                   |
| **complexity**     | C-3                     |
| **authority**      | A-3                     |
| **owner**          | Knowledge Architect     |
| **version**        | 1.0.0-draft             |
| **status**         | draft                   |
| **security_level** | SL-02                   |

---

## 2. Purpose

PRM-413 چهارمین پرامپت زنجیره KNW-EXT. روابط بین موجودیت‌های شناسایی‌شده (PRM-412) را استخراج و مستند می‌کند.

### اصول استخراج رابطه

| ID    | اصل                                     |
| ----- | --------------------------------------- |
| RE-01 | هر رابطه دارای جهت و نوع مشخص است       |
| RE-02 | روابط با مدل دانش ARCH-012 سازگار هستند |

---

## 3. Scope

### Inside Scope

| حوزه                 | توضیح          |
| -------------------- | -------------- |
| استخراج روابط دودویی | بین دو موجودیت |
| تعیین نوع رابطه      | مطابق مدل دانش |

### Outside Scope

| حوزه            | دلیل         |
| --------------- | ------------ |
| شناسایی موجودیت | حوزه PRM-412 |
| غنی‌سازی دانش   | حوزه PRM-414 |

---

## 4. Consumers

| مصرف‌کننده         | نقش           | نوع مصرف  |
| ------------------ | ------------- | --------- |
| AI-011 (Knowledge) | استخراج روابط | Chain     |
| AI-010 (Analytics) | مصرف روابط    | Secondary |

---

## 5. Inputs

| ورودی                 | نوع    | منبع     | اجباری |
| --------------------- | ------ | -------- | ------ |
| `identified_entities` | array  | PRM-412  | بله    |
| `source_context`      | string | PRM-411  | بله    |
| `relation_model`      | object | ARCH-012 | بله    |

---

## 6. Outputs

| خروجی                 | نوع     | توضیح             |
| --------------------- | ------- | ----------------- |
| `extracted_relations` | array   | روابط استخراج‌شده |
| `relation_types`      | array   | انواع روابط       |
| `extraction_complete` | boolean | وضعیت تکمیل       |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "ARCH-012",
        "scope": ["knowledge-relations"],
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

| منبع     | دامنه          | کاربرد            |
| -------- | -------------- | ----------------- |
| ARCH-012 | مدل روابط دانش | تعریف انواع رابطه |

---

## 9. Prompt Structure

PRM-413 چهارمین گام زنجیره KNW-EXT. روابط بین موجودیت‌ها را استخراج می‌کند.

```
identified_entities + source_context → PRM-413 → extracted_relations → PRM-414
```

---

## 10. Variable Definitions

| متغیر                 | نوع    | اجباری | توضیح                   | اعتبارسنجی |
| --------------------- | ------ | ------ | ----------------------- | ---------- |
| `identified_entities` | VAR-05 | بله    | موجودیت‌های شناسایی‌شده | —          |
| `source_context`      | VAR-01 | بله    | متن منبع برای زمینه     | —          |
| `relation_model`      | VAR-03 | بله    | مدل روابط از ARCH-012   | —          |

---

## 11. Execution Constraints

| ID     | محدودیت                        |
| ------ | ------------------------------ |
| CST-01 | روابط دارای جهت و نوع باشند    |
| CST-02 | روابط با ARCH-012 سازگار باشند |

---

## 12. Validation Rules

| ID     | قاعده                             | سطح    | نقض     |
| ------ | --------------------------------- | ------ | ------- |
| VAL-01 | هر رابطه دارای منبع و مقصد است    | معماری | عدم ثبت |
| VAL-02 | نوع رابطه با ARCH-012 مطابقت دارد | معماری | هشدار   |

---

## 13. Failure Conditions

| شرط                            | اقدام                       |
| ------------------------------ | --------------------------- |
| هیچ رابطه‌ای قابل استخراج نیست | هشدار + ادامه با موجودیت‌ها |

---

## 14. Quality Gates

| گیت   | مکان              | معیار          | مسئول               |
| ----- | ----------------- | -------------- | ------------------- |
| QG-01 | Draft → Review    | هویت کامل      | خودکار              |
| QG-02 | Review → Approved | روابط کامل     | Knowledge Architect |
| QG-03 | Approved → Active | ثبت در PRM-001 | Registry Keeper     |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                       | توسط        |
| ----------- | ---------- | --------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — استخراج رابطه | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-413",
  "name": "Relationship Extraction",
  "family": "FAM-KNW",
  "subfamily": "KNW-EXT",
  "type": "PT-04",
  "complexity": "C-3",
  "authority": "A-3",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [{ "type": "CTX-02", "source": "ARCH-012", "required": true }],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "identified_entities", "type": "VAR-05", "required": true },
    { "id": "source_context", "type": "VAR-01", "required": true },
    { "id": "relation_model", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["identified_entities", "source_context", "relation_model"],
    "optional": []
  },
  "output": {
    "required": ["extracted_relations", "extraction_complete"],
    "optional": ["relation_types"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Each relation has source and target", "severity": "error" },
    { "id": "VAL-02", "description": "Relation type conforms to ARCH-012", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-011", "AI-010"],
  "dependencies": ["PRM-412"],
  "documentation_refs": ["ARCH-012"]
}
```
