# Knowledge Extraction Instruction — دستورالعمل استخراج دانش

> **شناسه:** PRM-405
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Knowledge Architect
> **وابستگی:** PRM-404, [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [ARCH-012](../00-ARCHITECTURE/12-knowledge-model.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                            |
| ------------------ | -------------------------------- |
| **id**             | PRM-405                          |
| **name_fa**        | دستورالعمل استخراج دانش          |
| **name_en**        | Knowledge Extraction Instruction |
| **family**         | FAM-KNW                          |
| **subfamily**      | KNW-RTR                          |
| **type**           | PT-04                            |
| **complexity**     | C-3                              |
| **authority**      | A-3                              |
| **owner**          | Knowledge Architect              |
| **version**        | 1.0.0-draft                      |
| **status**         | draft                            |
| **security_level** | SL-02                            |

---

## 2. Purpose

PRM-405 سومین پرامپت زنجیره KNW-RTR. اطلاعات خام را از منابع انتخابی (PRM-404) به دانش ساختاریافته تبدیل می‌کند: استخراج مفاهیم، روابط و فراداده.

### اصول استخراج

| ID    | اصل                                           |
| ----- | --------------------------------------------- |
| KX-01 | استخراج باید بدون تفسیر خارج از متن منبع باشد |
| KX-02 | روابط بین مفاهیم باید مستند شوند              |
| KX-03 | فراداده باید طبق EDT-002 ثبت شود              |

---

## 3. Scope

### Inside Scope

| حوزه            | توضیح                        |
| --------------- | ---------------------------- |
| استخراج مفهوم   | شناسایی مفاهیم کلیدی از منبع |
| استخراج رابطه   | شناسایی روابط بین مفاهیم     |
| استخراج فراداده | ثبت فراداده طبق استاندارد    |

### Outside Scope

| حوزه            | دلیل         |
| --------------- | ------------ |
| نرمال‌سازی داده | حوزه PRM-406 |
| ارزیابی کیفیت   | حوزه PRM-407 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                   | نوع مصرف  |
| ------------------ | --------------------- | --------- |
| AI-011 (Knowledge) | استخراج دانش از منابع | Chain     |
| AI-010 (Analytics) | مصرف دانش استخراج‌شده | Secondary |

---

## 5. Inputs

| ورودی                   | نوع    | منبع    | اجباری |
| ----------------------- | ------ | ------- | ------ |
| `primary_source`        | object | PRM-404 | بله    |
| `supplementary_sources` | array  | PRM-404 | خیر    |
| `extraction_scope`      | object | AI-011  | بله    |
| `taxonomy_reference`    | object | EDT-002 | بله    |

---

## 6. Outputs

| خروجی                 | نوع     | توضیح               |
| --------------------- | ------- | ------------------- |
| `extracted_concepts`  | array   | مفاهیم استخراج‌شده  |
| `extracted_relations` | array   | روابط بین مفاهیم    |
| `extracted_metadata`  | object  | فراداده استخراج‌شده |
| `extraction_complete` | boolean | وضعیت تکمیل         |

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
      },
      {
        "type": "CTX-05",
        "source": "EDT-002",
        "scope": ["metadata-taxonomy"],
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

| منبع     | دامنه               | کاربرد              |
| -------- | ------------------- | ------------------- |
| ARCH-012 | مدل دانش و دامنه‌ها | استخراج ساختاریافته |
| EDT-002  | تاکسونومی فراداده   | ثبت فراداده         |

---

## 9. Prompt Structure

PRM-405 سومین گام زنجیره KNW-RTR. منابع انتخابی را به دانش ساختاریافته تبدیل می‌کند.

```
source_selection + extraction_scope → PRM-405 → extracted_knowledge → PRM-406
```

---

## 10. Variable Definitions

| متغیر                   | نوع    | اجباری | توضیح                      | اعتبارسنجی       |
| ----------------------- | ------ | ------ | -------------------------- | ---------------- |
| `primary_source`        | VAR-06 | بله    | منبع اصلی از PRM-404       | انطباق با KS-01  |
| `supplementary_sources` | VAR-05 | خیر    | منابع مکمل از PRM-404      | —                |
| `extraction_scope`      | VAR-04 | بله    | محدوده استخراج (دامنه/عمق) | —                |
| `taxonomy_reference`    | VAR-03 | بله    | مرجع تاکسونومی فراداده     | منطبق با EDT-002 |

---

## 11. Execution Constraints

| ID     | محدودیت                             |
| ------ | ----------------------------------- |
| CST-01 | استخراج بدون تفسیر خارج از متن باشد |
| CST-02 | روابط بین مفاهیم مستند شوند         |
| CST-03 | فراداده طبق EDT-002 ثبت شود         |

---

## 12. Validation Rules

| ID     | قاعده                                | سطح    | نقض     |
| ------ | ------------------------------------ | ------ | ------- |
| VAL-01 | مفاهیم استخراج‌شده دارای شناسه هستند | معماری | عدم ثبت |
| VAL-02 | روابط دارای جهت و نوع هستند          | معماری | بازگشت  |
| VAL-03 | فراداده منطبق با EDT-002 است         | معماری | هشدار   |
| VAL-04 | تعداد مفاهیم با scope همخوان است     | معماری | هشدار   |

---

## 13. Failure Conditions

| شرط                            | اقدام                             |
| ------------------------------ | --------------------------------- |
| منبع اصلی قابل استخراج نیست    | Escalation به Knowledge Architect |
| فراداده با EDT-002 سازگار نیست | بازگشت error + بازبینی استخراج    |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                          | مسئول               |
| ----- | ----------------- | ------------------------------ | ------------------- |
| QG-01 | Draft → Review    | هویت کامل, ورودی PRM-404 معتبر | خودکار              |
| QG-02 | Review → Approved | استخراج کامل و ساختاریافته     | Knowledge Architect |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)      | Registry Keeper     |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                 | توسط        |
| ----------- | ---------- | ------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — دستورالعمل استخراج دانش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-405",
  "name": "Knowledge Extraction Instruction",
  "family": "FAM-KNW",
  "subfamily": "KNW-RTR",
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
  "sources": [
    { "type": "CTX-02", "source": "ARCH-012", "required": true },
    { "type": "CTX-05", "source": "EDT-002", "required": true }
  ],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "primary_source", "type": "VAR-06", "required": true },
    { "id": "supplementary_sources", "type": "VAR-05", "required": false },
    { "id": "extraction_scope", "type": "VAR-04", "required": true },
    { "id": "taxonomy_reference", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["primary_source", "extraction_scope", "taxonomy_reference"],
    "optional": ["supplementary_sources"]
  },
  "output": {
    "required": ["extracted_concepts", "extraction_complete"],
    "optional": ["extracted_relations", "extracted_metadata"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Extracted concepts have identifiers", "severity": "error" },
    { "id": "VAL-02", "description": "Relations have direction and type", "severity": "error" },
    { "id": "VAL-03", "description": "Metadata conforms to EDT-002", "severity": "warning" },
    { "id": "VAL-04", "description": "Concept count matches scope", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-011", "AI-010"],
  "dependencies": ["PRM-404"],
  "documentation_refs": ["ARCH-012", "EDT-002"]
}
```
