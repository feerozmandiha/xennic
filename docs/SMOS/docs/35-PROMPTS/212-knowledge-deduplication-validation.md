# Knowledge Deduplication Validation — اعتبارسنجی حذف تکرار دانش

> **شناسه:** PRM-416
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Knowledge Architect
> **وابستگی:** PRM-415, [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [ARCH-012](../00-ARCHITECTURE/12-knowledge-model.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                              |
| ------------------ | ---------------------------------- |
| **id**             | PRM-416                            |
| **name_fa**        | اعتبارسنجی حذف تکرار دانش          |
| **name_en**        | Knowledge Deduplication Validation |
| **family**         | FAM-KNW                            |
| **subfamily**      | KNW-EXT                            |
| **type**           | PT-06                              |
| **complexity**     | C-2                                |
| **authority**      | A-3                                |
| **owner**          | Knowledge Architect                |
| **version**        | 1.0.0-draft                        |
| **status**         | draft                              |
| **security_level** | SL-02                              |

---

## 2. Purpose

PRM-416 هفتمین پرامپت زنجیره KNW-EXT. دانش طبقه‌بندی‌شده را از نظر وجود رکوردهای تکراری با دانش موجود بررسی می‌کند.

### اصول حذف تکرار

| ID    | اصل                                    |
| ----- | -------------------------------------- |
| KD-01 | دانش تکراری با دانش موجود ادغام شود    |
| KD-02 | تکرار با معیارهای ARCH-012 شناسایی شود |

---

## 3. Scope

### Inside Scope

| حوزه           | توضیح                  |
| -------------- | ---------------------- |
| شناسایی تکرار  | مقایسه با دانش ثبت‌شده |
| ادغام پیشنهادی | توصیه به ادغام یا حذف  |

### Outside Scope

| حوزه               | دلیل         |
| ------------------ | ------------ |
| اعتبارسنجی سازگاری | حوزه PRM-417 |
| ارزیابی یکپارچگی   | حوزه PRM-418 |

---

## 4. Consumers

| مصرف‌کننده         | نقش         | نوع مصرف |
| ------------------ | ----------- | -------- |
| AI-011 (Knowledge) | حذف تکرار   | Chain    |
| AI-004 (Review)    | بررسی کیفیت | Quality  |

---

## 5. Inputs

| ورودی                      | نوع    | منبع    | اجباری |
| -------------------------- | ------ | ------- | ------ |
| `classified_knowledge`     | array  | PRM-415 | بله    |
| `existing_knowledge_index` | object | AI-011  | بله    |

---

## 6. Outputs

| خروجی                    | نوع     | توضیح            |
| ------------------------ | ------- | ---------------- |
| `deduplicated_knowledge` | array   | دانش بدون تکرار  |
| `duplicate_report`       | array   | گزارش تکرارها    |
| `deduplication_valid`    | boolean | وضعیت اعتبارسنجی |

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
      }
    ],
    "max_tokens": 2000,
    "priority": "high"
  }
}
```

---

## 8. Knowledge Requirements

| منبع     | دامنه          | کاربرد        |
| -------- | -------------- | ------------- |
| ARCH-012 | مدل اشیاء دانش | شناسایی تکرار |

---

## 9. Prompt Structure

PRM-416 هفتمین گام زنجیره KNW-EXT. تکرار را شناسایی می‌کند.

```
classified_knowledge + existing_index → PRM-416 → deduplicated_knowledge → PRM-417
```

---

## 10. Variable Definitions

| متغیر                      | نوع    | اجباری | توضیح              | اعتبارسنجی |
| -------------------------- | ------ | ------ | ------------------ | ---------- |
| `classified_knowledge`     | VAR-05 | بله    | دانش طبقه‌بندی‌شده | —          |
| `existing_knowledge_index` | VAR-06 | بله    | فهرست دانش موجود   | —          |

---

## 11. Execution Constraints

| ID     | محدودیت                                |
| ------ | -------------------------------------- |
| CST-01 | تکرار با معیارهای ARCH-012 شناسایی شود |

---

## 12. Validation Rules

| ID     | قاعده                    | سطح    | نقض     |
| ------ | ------------------------ | ------ | ------- |
| VAL-01 | گزارش تکرار مستند است    | معماری | عدم ثبت |
| VAL-02 | ادغام پیشنهادی مستند است | معماری | هشدار   |

---

## 13. Failure Conditions

| شرط                         | اقدام                |
| --------------------------- | -------------------- |
| دانش تکراری قابل ادغام نیست | Escalation به AI-011 |

---

## 14. Quality Gates

| گیت   | مکان              | معیار          | مسئول           |
| ----- | ----------------- | -------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل      | خودکار          |
| QG-02 | Review → Approved | AI-004 تأیید   | AI-004          |
| QG-03 | Approved → Active | ثبت در PRM-001 | Registry Keeper |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                   | توسط        |
| ----------- | ---------- | --------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی حذف تکرار دانش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-416",
  "name": "Knowledge Deduplication Validation",
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
  "sources": [{ "type": "CTX-02", "source": "ARCH-012", "required": true }],
  "max_tokens": 2000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "classified_knowledge", "type": "VAR-05", "required": true },
    { "id": "existing_knowledge_index", "type": "VAR-06", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["classified_knowledge", "existing_knowledge_index"],
    "optional": []
  },
  "output": {
    "required": ["deduplicated_knowledge", "deduplication_valid"],
    "optional": ["duplicate_report"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Duplicate report is documented", "severity": "error" },
    { "id": "VAL-02", "description": "Merge proposal is documented", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-011", "AI-004"],
  "dependencies": ["PRM-415"],
  "documentation_refs": ["ARCH-012"]
}
```
