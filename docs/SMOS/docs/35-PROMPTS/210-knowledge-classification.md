# Knowledge Classification — طبقه‌بندی دانش

> **شناسه:** PRM-415
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Knowledge Architect
> **وابستگی:** PRM-414, [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [EDT-002](../24-EDITORIAL/20-content-taxonomy.md), [ARCH-012](../00-ARCHITECTURE/12-knowledge-model.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                    |
| ------------------ | ------------------------ |
| **id**             | PRM-415                  |
| **name_fa**        | طبقه‌بندی دانش           |
| **name_en**        | Knowledge Classification |
| **family**         | FAM-KNW                  |
| **subfamily**      | KNW-EXT                  |
| **type**           | PT-04                    |
| **complexity**     | C-2                      |
| **authority**      | A-3                      |
| **owner**          | Knowledge Architect      |
| **version**        | 1.0.0-draft              |
| **status**         | draft                    |
| **security_level** | SL-02                    |

---

## 2. Purpose

PRM-415 ششمین پرامپت زنجیره KNW-EXT. دانش غنی‌سازی‌شده را مطابق تاکسونومی سازمانی طبقه‌بندی می‌کند.

### اصول طبقه‌بندی

| ID    | اصل                             |
| ----- | ------------------------------- |
| KC-01 | هر دانش حداقل یک دسته دارد      |
| KC-02 | طبقه‌بندی با EDT-002 سازگار است |

---

## 3. Scope

### Inside Scope

| حوزه        | توضیح                     |
| ----------- | ------------------------- |
| تخصیص دسته  | بر اساس تاکسونومی EDT-002 |
| تخصیص برچسب | برچسب‌های فراداده‌ای      |

### Outside Scope

| حوزه               | دلیل         |
| ------------------ | ------------ |
| حذف تکراری         | حوزه PRM-416 |
| اعتبارسنجی سازگاری | حوزه PRM-417 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                     | نوع مصرف  |
| ------------------ | ----------------------- | --------- |
| AI-011 (Knowledge) | طبقه‌بندی دانش          | Chain     |
| AI-010 (Analytics) | مصرف دسته‌بندی          | Secondary |
| AI-001 (Strategy)  | مصرف برای تحلیل دسته‌ها | Secondary |
| AI-002 (Planning)  | مصرف برای برنامه‌ریزی   | Secondary |

---

## 5. Inputs

| ورودی                | نوع    | منبع     | اجباری |
| -------------------- | ------ | -------- | ------ |
| `enriched_knowledge` | array  | PRM-414  | بله    |
| `taxonomy_reference` | object | EDT-002  | بله    |
| `domain_reference`   | object | ARCH-012 | بله    |

---

## 6. Outputs

| خروجی                     | نوع     | توضیح                 |
| ------------------------- | ------- | --------------------- |
| `classified_knowledge`    | array   | دانش طبقه‌بندی‌شده    |
| `classification_labels`   | array   | برچسب‌های تخصیص‌یافته |
| `classification_complete` | boolean | وضعیت تکمیل           |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-05",
        "source": "EDT-002",
        "scope": ["content-taxonomy", "content-types"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "ARCH-012",
        "scope": ["knowledge-domains"],
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

| منبع     | دامنه           | کاربرد     |
| -------- | --------------- | ---------- |
| EDT-002  | تاکسونومی محتوا | طبقه‌بندی  |
| ARCH-012 | دامنه‌های دانش  | دامنه‌بندی |

---

## 9. Prompt Structure

PRM-415 ششمین گام زنجیره KNW-EXT. دانش را طبقه‌بندی می‌کند.

```
enriched_knowledge + taxonomy → PRM-415 → classified_knowledge → PRM-416
```

---

## 10. Variable Definitions

| متغیر                | نوع    | اجباری | توضیح                | اعتبارسنجی |
| -------------------- | ------ | ------ | -------------------- | ---------- |
| `enriched_knowledge` | VAR-05 | بله    | دانش غنی‌سازی‌شده    | —          |
| `taxonomy_reference` | VAR-03 | بله    | تاکسونومی از EDT-002 | —          |
| `domain_reference`   | VAR-03 | بله    | دامنه‌ها از ARCH-012 | —          |

---

## 11. Execution Constraints

| ID     | محدودیت                          |
| ------ | -------------------------------- |
| CST-01 | هر دانش حداقل یک دسته داشته باشد |
| CST-02 | طبقه‌بندی با EDT-002 سازگار باشد |

---

## 12. Validation Rules

| ID     | قاعده                            | سطح    | نقض   |
| ------ | -------------------------------- | ------ | ----- |
| VAL-01 | هر دانش حداقل یک دسته دارد       | معماری | هشدار |
| VAL-02 | طبقه‌بندی با EDT-002 مطابقت دارد | معماری | هشدار |

---

## 13. Failure Conditions

| شرط                              | اقدام                             |
| -------------------------------- | --------------------------------- |
| دانش با هیچ دسته‌ای مطابقت ندارد | Escalation به Knowledge Architect |

---

## 14. Quality Gates

| گیت   | مکان              | معیار          | مسئول               |
| ----- | ----------------- | -------------- | ------------------- |
| QG-01 | Draft → Review    | هویت کامل      | خودکار              |
| QG-02 | Review → Approved | طبقه‌بندی کامل | Knowledge Architect |
| QG-03 | Approved → Active | ثبت در PRM-001 | Registry Keeper     |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                        | توسط        |
| ----------- | ---------- | ---------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — طبقه‌بندی دانش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-415",
  "name": "Knowledge Classification",
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
    { "type": "CTX-05", "source": "EDT-002", "required": true },
    { "type": "CTX-02", "source": "ARCH-012", "required": true }
  ],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "enriched_knowledge", "type": "VAR-05", "required": true },
    { "id": "taxonomy_reference", "type": "VAR-03", "required": true },
    { "id": "domain_reference", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["enriched_knowledge", "taxonomy_reference", "domain_reference"],
    "optional": []
  },
  "output": {
    "required": ["classified_knowledge", "classification_complete"],
    "optional": ["classification_labels"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    {
      "id": "VAL-01",
      "description": "Each knowledge has at least one category",
      "severity": "warning"
    },
    { "id": "VAL-02", "description": "Classification conforms to EDT-002", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-011", "AI-010", "AI-001", "AI-002"],
  "dependencies": ["PRM-414"],
  "documentation_refs": ["EDT-002", "ARCH-012"]
}
```
