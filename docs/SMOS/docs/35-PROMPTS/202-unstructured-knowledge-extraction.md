# Unstructured Knowledge Extraction — استخراج دانش از منابع بدون ساختار

> **شناسه:** PRM-411
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Knowledge Architect
> **وابستگی:** PRM-410, [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [ARCH-012](../00-ARCHITECTURE/12-knowledge-model.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                             |
| ------------------ | --------------------------------- |
| **id**             | PRM-411                           |
| **name_fa**        | استخراج دانش از منابع بدون ساختار |
| **name_en**        | Unstructured Knowledge Extraction |
| **family**         | FAM-KNW                           |
| **subfamily**      | KNW-EXT                           |
| **type**           | PT-04                             |
| **complexity**     | C-3                               |
| **authority**      | A-3                               |
| **owner**          | Knowledge Architect               |
| **version**        | 1.0.0-draft                       |
| **status**         | draft                             |
| **security_level** | SL-02                             |

---

## 2. Purpose

PRM-411 دومین پرامپت زنجیره KNW-EXT. دانش را از منابع بدون ساختار (متون آزاد، مقالات، گفتگوها) استخراج کرده و به ساختار مدل دانش سازمانی تبدیل می‌کند.

### اصول استخراج از متن آزاد

| ID    | اصل                                        |
| ----- | ------------------------------------------ |
| UE-01 | متن منبع بدون تفسیر خارج از متن پردازش شود |
| UE-02 | مفاهیم با ARCH-012 تطابق داده شوند         |

---

## 3. Scope

### Inside Scope

| حوزه                | توضیح                             |
| ------------------- | --------------------------------- |
| استخراج از متن آزاد | مقالات، گفتگوها، متون بدون ساختار |
| تبدیل به ساختار     | تبدیل به مدل دانش ARCH-012        |

### Outside Scope

| حوزه                         | دلیل         |
| ---------------------------- | ------------ |
| شناسایی موجودیت              | حوزه PRM-412 |
| استخراج از منابع ساختاریافته | حوزه PRM-410 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                      | نوع مصرف  |
| ------------------ | ------------------------ | --------- |
| AI-011 (Knowledge) | استخراج دانش از متن آزاد | Chain     |
| AI-010 (Analytics) | مصرف داده استخراجی       | Secondary |
| AI-013 (Research)  | مصرف برای پژوهش          | Secondary |

---

## 5. Inputs

| ورودی                 | نوع    | منبع     | اجباری |
| --------------------- | ------ | -------- | ------ |
| `unstructured_source` | string | AI-011   | بله    |
| `source_metadata`     | object | AI-011   | خیر    |
| `target_model`        | object | ARCH-012 | بله    |

---

## 6. Outputs

| خروجی                 | نوع     | توضیح            |
| --------------------- | ------- | ---------------- |
| `extracted_knowledge` | array   | دانش استخراج‌شده |
| `source_annotations`  | array   | حاشیه‌نویسی منبع |
| `extraction_complete` | boolean | وضعیت تکمیل      |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "ARCH-012",
        "scope": ["knowledge-domains", "knowledge-object-model"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 4000,
    "priority": "high"
  }
}
```

---

## 8. Knowledge Requirements

| منبع     | دامنه                     | کاربرد            |
| -------- | ------------------------- | ----------------- |
| ARCH-012 | دامنه‌ها و مدل اشیاء دانش | ساختاردهی استخراج |

---

## 9. Prompt Structure

PRM-411 دومین گام زنجیره KNW-EXT. منابع بدون ساختار را پردازش می‌کند.

```
structured_output + unstructured_source → PRM-411 → extracted_knowledge → PRM-412
```

---

## 10. Variable Definitions

| متغیر                 | نوع    | اجباری | توضیح                | اعتبارسنجی |
| --------------------- | ------ | ------ | -------------------- | ---------- |
| `unstructured_source` | VAR-01 | بله    | متن منبع بدون ساختار | —          |
| `source_metadata`     | VAR-06 | خیر    | فراداده منبع         | —          |
| `target_model`        | VAR-03 | بله    | مدل هدف از ARCH-012  | —          |

---

## 11. Execution Constraints

| ID     | محدودیت                              |
| ------ | ------------------------------------ |
| CST-01 | متن منبع بدون تفسیر پردازش شود       |
| CST-02 | مفاهیم با ARCH-012 تطابق داشته باشند |

---

## 12. Validation Rules

| ID     | قاعده                                        | سطح    | نقض     |
| ------ | -------------------------------------------- | ------ | ------- |
| VAL-01 | مفاهیم استخراج‌شده دارای ارجاع به منبع هستند | معماری | عدم ثبت |
| VAL-02 | ساختار با ARCH-012 منطبق است                 | معماری | هشدار   |

---

## 13. Failure Conditions

| شرط                       | اقدام                          |
| ------------------------- | ------------------------------ |
| متن منبع قابل پردازش نیست | بازگشت error + درخواست بازبینی |

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
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — استخراج دانش از متن آزاد | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-411",
  "name": "Unstructured Knowledge Extraction",
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
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "unstructured_source", "type": "VAR-01", "required": true },
    { "id": "source_metadata", "type": "VAR-06", "required": false },
    { "id": "target_model", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["unstructured_source", "target_model"],
    "optional": ["source_metadata"]
  },
  "output": {
    "required": ["extracted_knowledge", "extraction_complete"],
    "optional": ["source_annotations"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    {
      "id": "VAL-01",
      "description": "Extracted knowledge has source references",
      "severity": "error"
    },
    { "id": "VAL-02", "description": "Structure conforms to ARCH-012", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-011", "AI-010", "AI-013"],
  "dependencies": ["PRM-410"],
  "documentation_refs": ["ARCH-012"]
}
```
