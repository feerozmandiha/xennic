# Knowledge Enrichment — غنی‌سازی دانش

> **شناسه:** PRM-414
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Knowledge Architect
> **وابستگی:** PRM-413, [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [ARCH-012](../00-ARCHITECTURE/12-knowledge-model.md), [KNW-\*](../45-KNOWLEDGE/)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                |
| ------------------ | -------------------- |
| **id**             | PRM-414              |
| **name_fa**        | غنی‌سازی دانش        |
| **name_en**        | Knowledge Enrichment |
| **family**         | FAM-KNW              |
| **subfamily**      | KNW-EXT              |
| **type**           | PT-04                |
| **complexity**     | C-3                  |
| **authority**      | A-3                  |
| **owner**          | Knowledge Architect  |
| **version**        | 1.0.0-draft          |
| **status**         | draft                |
| **security_level** | SL-02                |

---

## 2. Purpose

PRM-414 پنجمین پرامپت زنجیره KNW-EXT. دانش استخراج‌شده را با اطلاعات اضافی از پایگاه دانش سازمانی غنی‌سازی می‌کند.

### اصول غنی‌سازی

| ID    | اصل                                      |
| ----- | ---------------------------------------- |
| KE-01 | غنی‌سازی فقط با منابع تأییدشده انجام شود |
| KE-02 | اطلاعات اضافی با دانش اصلی سازگار باشد   |

---

## 3. Scope

### Inside Scope

| حوزه                | توضیح                |
| ------------------- | -------------------- |
| افزودن فراداده      | تکمیل فراداده از KNW |
| پیوند به دانش موجود | ایجاد ارجاع به KNW   |

### Outside Scope

| حوزه           | دلیل         |
| -------------- | ------------ |
| طبقه‌بندی دانش | حوزه PRM-415 |
| حذف تکراری     | حوزه PRM-416 |

---

## 4. Consumers

| مصرف‌کننده         | نقش               | نوع مصرف  |
| ------------------ | ----------------- | --------- |
| AI-011 (Knowledge) | غنی‌سازی دانش     | Chain     |
| AI-010 (Analytics) | مصرف دانش غنی‌شده | Secondary |

---

## 5. Inputs

| ورودی                  | نوع    | منبع    | اجباری |
| ---------------------- | ------ | ------- | ------ |
| `extracted_relations`  | array  | PRM-413 | بله    |
| `identified_entities`  | array  | PRM-412 | بله    |
| `knowledge_base_index` | object | KNW-\*  | بله    |

---

## 6. Outputs

| خروجی                 | نوع     | توضیح             |
| --------------------- | ------- | ----------------- |
| `enriched_knowledge`  | array   | دانش غنی‌سازی‌شده |
| `enrichment_links`    | array   | پیوندهای ایجادشده |
| `enrichment_complete` | boolean | وضعیت تکمیل       |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "ARCH-012",
        "scope": ["knowledge-index"],
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

| منبع   | دامنه               | کاربرد   |
| ------ | ------------------- | -------- |
| KNW-\* | پایگاه دانش سازمانی | غنی‌سازی |

---

## 9. Prompt Structure

PRM-414 پنجمین گام زنجیره KNW-EXT. دانش را با اطلاعات مکمل غنی می‌کند.

```
extracted_knowledge + kb_index → PRM-414 → enriched_knowledge → PRM-415
```

---

## 10. Variable Definitions

| متغیر                  | نوع    | اجباری | توضیح                 | اعتبارسنجی |
| ---------------------- | ------ | ------ | --------------------- | ---------- |
| `extracted_relations`  | VAR-05 | بله    | روابط از PRM-413      | —          |
| `identified_entities`  | VAR-05 | بله    | موجودیت‌ها از PRM-412 | —          |
| `knowledge_base_index` | VAR-06 | بله    | فهرست دانش موجود      | —          |

---

## 11. Execution Constraints

| ID     | محدودیت                           |
| ------ | --------------------------------- |
| CST-01 | غنی‌سازی با منابع تأییدشده        |
| CST-02 | اطلاعات اضافی سازگار با دانش اصلی |

---

## 12. Validation Rules

| ID     | قاعده                             | سطح    | نقض     |
| ------ | --------------------------------- | ------ | ------- |
| VAL-01 | پیوندها به دانش موجود معتبر هستند | معماری | عدم ثبت |
| VAL-02 | غنی‌سازی با دانش اصلی سازگار است  | معماری | هشدار   |

---

## 13. Failure Conditions

| شرط                        | اقدام              |
| -------------------------- | ------------------ |
| هیچ منبع غنی‌سازی یافت نشد | ادامه با دانش اصلی |

---

## 14. Quality Gates

| گیت   | مکان              | معیار          | مسئول               |
| ----- | ----------------- | -------------- | ------------------- |
| QG-01 | Draft → Review    | هویت کامل      | خودکار              |
| QG-02 | Review → Approved | غنی‌سازی کامل  | Knowledge Architect |
| QG-03 | Approved → Active | ثبت در PRM-001 | Registry Keeper     |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                       | توسط        |
| ----------- | ---------- | --------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — غنی‌سازی دانش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-414",
  "name": "Knowledge Enrichment",
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
    { "id": "extracted_relations", "type": "VAR-05", "required": true },
    { "id": "identified_entities", "type": "VAR-05", "required": true },
    { "id": "knowledge_base_index", "type": "VAR-06", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["extracted_relations", "identified_entities", "knowledge_base_index"],
    "optional": []
  },
  "output": {
    "required": ["enriched_knowledge", "enrichment_complete"],
    "optional": ["enrichment_links"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Links to existing knowledge are valid", "severity": "error" },
    {
      "id": "VAL-02",
      "description": "Enrichment is consistent with original knowledge",
      "severity": "warning"
    }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-011", "AI-010"],
  "dependencies": ["PRM-413"],
  "documentation_refs": ["ARCH-012"]
}
```
