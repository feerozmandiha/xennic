# Knowledge Extraction Completion Validation — اعتبارسنجی تکمیل استخراج دانش

> **شناسه:** PRM-419
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Knowledge Architect
> **وابستگی:** PRM-418, [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                                      |
| ------------------ | ------------------------------------------ |
| **id**             | PRM-419                                    |
| **name_fa**        | اعتبارسنجی تکمیل استخراج دانش              |
| **name_en**        | Knowledge Extraction Completion Validation |
| **family**         | FAM-KNW                                    |
| **subfamily**      | KNW-EXT                                    |
| **type**           | PT-06                                      |
| **complexity**     | C-3                                        |
| **authority**      | A-3                                        |
| **owner**          | Knowledge Architect                        |
| **version**        | 1.0.0-draft                                |
| **status**         | draft                                      |
| **security_level** | SL-02                                      |

---

## 2. Purpose

PRM-419 آخرین پرامپت زنجیره KNW-EXT. تکمیل فرآیند استخراج را تأیید کرده و رویداد `knowledge_extraction_completed` را صادر می‌کند.

### اصول تکمیل

| ID    | اصل                              |
| ----- | -------------------------------- |
| KX-01 | همه گام‌های زنجیره تکمیل شده‌اند |
| KX-02 | دانش نهایی قابل مصرف است         |

---

## 3. Scope

### Inside Scope

| حوزه               | توضیح                      |
| ------------------ | -------------------------- |
| تأیید تکمیل زنجیره | همه PRM-410–418            |
| تأیید آمادگی مصرف  | قابلیت استفاده برای AI-011 |

### Outside Scope

| حوزه             | دلیل             |
| ---------------- | ---------------- |
| ارزیابی یکپارچگی | حوزه PRM-418     |
| استخراج مجدد     | حوزه PRM-410–415 |

---

## 4. Consumers

| مصرف‌کننده            | نقش             | نوع مصرف      |
| --------------------- | --------------- | ------------- |
| AI-011 (Knowledge)    | تکمیل استخراج   | Chain         |
| AI-012 (Improvement)  | مصرف دانش نهایی | Secondary     |
| AI-014 (Orchestrator) | نظارت بر تکمیل  | Orchestration |

---

## 5. Inputs

| ورودی                    | نوع    | منبع    | اجباری |
| ------------------------ | ------ | ------- | ------ |
| `integrity_assessment`   | object | PRM-418 | بله    |
| `deduplicated_knowledge` | array  | PRM-416 | بله    |
| `completion_metadata`    | object | AI-011  | بله    |

---

## 6. Outputs

| خروجی                            | نوع     | توضیح               |
| -------------------------------- | ------- | ------------------- |
| `extraction_completion_report`   | object  | گزارش تکمیل استخراج |
| `knowledge_package`              | object  | بسته دانش نهایی     |
| `knowledge_extraction_completed` | boolean | وضعیت تکمیل نهایی   |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-03",
        "source": "PRM-001",
        "scope": ["registry-format"],
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

| منبع    | دامنه    | کاربرد      |
| ------- | -------- | ----------- |
| PRM-001 | قالب ثبت | تأیید تکمیل |

---

## 9. Prompt Structure

PRM-419 آخرین گام زنجیره KNW-EXT. رویداد تکمیل را صادر می‌کند.

```
integrity_assessment + knowledge → PRM-419 → knowledge_package → knowledge_extraction_completed
```

---

## 10. Variable Definitions

| متغیر                    | نوع    | اجباری | توضیح                       | اعتبارسنجی                  |
| ------------------------ | ------ | ------ | --------------------------- | --------------------------- |
| `integrity_assessment`   | VAR-06 | بله    | ارزیابی یکپارچگی از PRM-418 | integrity_assessment = pass |
| `deduplicated_knowledge` | VAR-05 | بله    | دانش نهایی                  | —                           |
| `completion_metadata`    | VAR-06 | بله    | فراداده تکمیل               | —                           |

---

## 11. Execution Constraints

| ID     | محدودیت                  |
| ------ | ------------------------ |
| CST-01 | همه گام‌ها تکمیل شده‌اند |
| CST-02 | یکپارچگی قابل قبول است   |

---

## 12. Validation Rules

| ID     | قاعده                            | سطح    | نقض                 |
| ------ | -------------------------------- | ------ | ------------------- |
| VAL-01 | همه گام‌های زنجیره تکمیل شده‌اند | معماری | عدم ثبت             |
| VAL-02 | یکپارچگی قابل قبول است           | معماری | بازگشت + escalation |
| VAL-03 | بسته دانش قابل مصرف است          | معماری | هشدار               |

---

## 13. Failure Conditions

| شرط                     | اقدام                                    |
| ----------------------- | ---------------------------------------- |
| یکپارچگی قابل قبول نیست | Escalation به AI-011 + بازگشت به PRM-418 |
| گامی از زنجیره ناقص است | Escalation به AI-014                     |

---

## 14. Quality Gates

| گیت   | مکان              | معیار          | مسئول           |
| ----- | ----------------- | -------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل      | خودکار          |
| QG-02 | Review → Approved | AI-014 تأیید   | AI-014          |
| QG-03 | Approved → Active | ثبت در PRM-001 | Registry Keeper |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                       | توسط        |
| ----------- | ---------- | ------------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی تکمیل استخراج دانش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-419",
  "name": "Knowledge Extraction Completion Validation",
  "family": "FAM-KNW",
  "subfamily": "KNW-EXT",
  "type": "PT-06",
  "complexity": "C-3",
  "authority": "A-3",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [{ "type": "CTX-03", "source": "PRM-001", "required": true }],
  "max_tokens": 2000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "integrity_assessment", "type": "VAR-06", "required": true },
    { "id": "deduplicated_knowledge", "type": "VAR-05", "required": true },
    { "id": "completion_metadata", "type": "VAR-06", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["integrity_assessment", "deduplicated_knowledge", "completion_metadata"],
    "optional": []
  },
  "output": {
    "required": [
      "extraction_completion_report",
      "knowledge_package",
      "knowledge_extraction_completed"
    ],
    "optional": []
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "All chain steps completed", "severity": "error" },
    { "id": "VAL-02", "description": "Integrity acceptable", "severity": "error" },
    { "id": "VAL-03", "description": "Knowledge package is consumable", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-011", "AI-012", "AI-014"],
  "dependencies": ["PRM-418"],
  "documentation_refs": ["PRM-001"]
}
```
