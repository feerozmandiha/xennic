# Structured Knowledge Extraction — استخراج دانش ساختاریافته

> **شناسه:** PRM-410
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Knowledge Architect
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [ARCH-012](../00-ARCHITECTURE/12-knowledge-model.md), [EDT-002](../24-EDITORIAL/20-content-taxonomy.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                           |
| ------------------ | ------------------------------- |
| **id**             | PRM-410                         |
| **name_fa**        | استخراج دانش ساختاریافته        |
| **name_en**        | Structured Knowledge Extraction |
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

PRM-410 نخستین پرامپت زنجیره KNW-EXT. دانش را از منابع ساختاریافته (پایگاه‌ها، فهرست‌ها، اسناد با schema) استخراج می‌کند.

### اصول استخراج ساختاریافته

| ID    | اصل                                 |
| ----- | ----------------------------------- |
| SE-01 | استخراج مطابق schema منبع انجام شود |
| SE-02 | فیلدهای اجباری schema پر شوند       |

---

## 3. Scope

### Inside Scope

| حوزه                         | توضیح                                |
| ---------------------------- | ------------------------------------ |
| استخراج از منابع ساختاریافته | پایگاه‌ها، فهرست‌ها، اسناد schemaدار |
| نگاشت فیلد به مدل دانش       | تطابق با ARCH-012                    |

### Outside Scope

| حوزه                         | دلیل         |
| ---------------------------- | ------------ |
| استخراج از منابع بدون ساختار | حوزه PRM-411 |
| شناسایی موجودیت              | حوزه PRM-412 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                       | نوع مصرف  |
| ------------------ | ------------------------- | --------- |
| AI-011 (Knowledge) | استخراج دانش ساختاریافته  | Chain     |
| AI-010 (Analytics) | مصرف داده ساختاریافته     | Secondary |
| AI-001 (Strategy)  | مصرف برای تحلیل استراتژیک | Secondary |
| AI-002 (Planning)  | مصرف برای برنامه‌ریزی     | Secondary |
| AI-013 (Research)  | مصرف برای پژوهش           | Secondary |

---

## 5. Inputs

| ورودی               | نوع    | منبع     | اجباری |
| ------------------- | ------ | -------- | ------ |
| `structured_source` | object | AI-011   | بله    |
| `source_schema`     | object | AI-011   | بله    |
| `target_model`      | object | ARCH-012 | بله    |

---

## 6. Outputs

| خروجی                            | نوع     | توضیح                        |
| -------------------------------- | ------- | ---------------------------- |
| `extracted_structured_knowledge` | array   | دانش استخراج‌شده ساختاریافته |
| `field_mappings`                 | array   | نگاشت فیلدها                 |
| `extraction_complete`            | boolean | وضعیت تکمیل                  |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "ARCH-012",
        "scope": ["knowledge-object-model", "knowledge-domains"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-05",
        "source": "EDT-002",
        "scope": ["metadata-taxonomy"],
        "injection": "prepend",
        "required": false
      }
    ],
    "max_tokens": 3000,
    "priority": "high"
  }
}
```

---

## 8. Knowledge Requirements

| منبع     | دامنه             | کاربرد       |
| -------- | ----------------- | ------------ |
| ARCH-012 | مدل اشیاء دانش    | نگاشت فیلدها |
| EDT-002  | تاکسونومی فراداده | برچسب‌گذاری  |

---

## 9. Prompt Structure

PRM-410 نخستین گام زنجیره KNW-EXT. منابع ساختاریافته را به دانش تبدیل می‌کند.

```
structured_source + target_model → PRM-410 → extracted_structured_knowledge → PRM-411
```

---

## 10. Variable Definitions

| متغیر               | نوع    | اجباری | توضیح                 | اعتبارسنجی |
| ------------------- | ------ | ------ | --------------------- | ---------- |
| `structured_source` | VAR-06 | بله    | منبع دانش ساختاریافته | —          |
| `source_schema`     | VAR-03 | بله    | schema منبع           | —          |
| `target_model`      | VAR-03 | بله    | مدل هدف از ARCH-012   | —          |

---

## 11. Execution Constraints

| ID     | محدودیت                             |
| ------ | ----------------------------------- |
| CST-01 | استخراج مطابق schema منبع انجام شود |
| CST-02 | فیلدهای اجباری پر شوند              |

---

## 12. Validation Rules

| ID     | قاعده                      | سطح    | نقض     |
| ------ | -------------------------- | ------ | ------- |
| VAL-01 | نگاشت فیلدها مستند شده است | معماری | عدم ثبت |
| VAL-02 | فیلدهای اجباری پر شده‌اند  | معماری | بازگشت  |

---

## 13. Failure Conditions

| شرط                             | اقدام                             |
| ------------------------------- | --------------------------------- |
| schema منبع با مدل هدف ناسازگار | Escalation به Knowledge Architect |

---

## 14. Quality Gates

| گیت   | مکان              | معیار          | مسئول               |
| ----- | ----------------- | -------------- | ------------------- |
| QG-01 | Draft → Review    | هویت کامل      | خودکار              |
| QG-02 | Review → Approved | استخراج کامل   | Knowledge Architect |
| QG-03 | Approved → Active | ثبت در PRM-001 | Registry Keeper     |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                  | توسط        |
| ----------- | ---------- | -------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — استخراج دانش ساختاریافته | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-410",
  "name": "Structured Knowledge Extraction",
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
    { "type": "CTX-05", "source": "EDT-002", "required": false }
  ],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "structured_source", "type": "VAR-06", "required": true },
    { "id": "source_schema", "type": "VAR-03", "required": true },
    { "id": "target_model", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["structured_source", "source_schema", "target_model"],
    "optional": []
  },
  "output": {
    "required": ["extracted_structured_knowledge", "extraction_complete"],
    "optional": ["field_mappings"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Field mappings documented", "severity": "error" },
    { "id": "VAL-02", "description": "Required fields populated", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-011", "AI-010", "AI-001", "AI-002", "AI-013"],
  "dependencies": [],
  "documentation_refs": ["ARCH-012", "EDT-002"]
}
```
