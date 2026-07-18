# Research Completion Validation — اعتبارسنجی تکمیل پژوهش

> **شناسه:** PRM-429
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Research Validator
> **وابستگی:** PRM-428
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                          |
| ------------------ | ------------------------------ |
| **id**             | PRM-429                        |
| **name_fa**        | اعتبارسنجی تکمیل پژوهش         |
| **name_en**        | Research Completion Validation |
| **family**         | FAM-KNW                        |
| **subfamily**      | KNW-RSR                        |
| **type**           | PT-06                          |
| **complexity**     | C-3                            |
| **authority**      | A-3                            |
| **owner**          | Research Validator             |
| **version**        | 1.0.0-draft                    |
| **status**         | draft                          |
| **security_level** | SL-02                          |

---

## 2. Purpose

PRM-429 دهمین و آخرین گام زنجیره KNW-RSR. تکمیل کامل پژوهش را با بررسی تمام خروجی‌های زنجیره، رعایت اهداف اولیه و عبور از گیت‌های کیفیت اعتبارسنجی می‌کند.

### اصول اعتبارسنجی تکمیل

| ID    | اصل                               |
| ----- | --------------------------------- |
| CV-01 | تمام گام‌های زنجیره تکمیل شده‌اند |
| CV-02 | اهداف پژوهش محقق شده‌اند          |

---

## 3. Scope

### Inside Scope

| حوزه                    | توضیح                |
| ----------------------- | -------------------- |
| بررسی تکمیل تمام گام‌ها | PRM-420 تا PRM-428   |
| تأیید دستیابی به اهداف  | تطابق با اهداف اولیه |

### Outside Scope

| حوزه         | دلیل         |
| ------------ | ------------ |
| مونتاژ گزارش | حوزه PRM-428 |
| ثبت دانش     | حوزه PRM-408 |

---

## 4. Consumers

| مصرف‌کننده            | نقش              | نوع مصرف      |
| --------------------- | ---------------- | ------------- |
| AI-013 (Research)     | اعتبارسنجی تکمیل | Chain         |
| AI-011 (Knowledge)    | مصرف نتیجه پژوهش | Secondary     |
| AI-014 (Orchestrator) | نظارت بر تکمیل   | Orchestration |
| AI-004 (Review)       | اعتبارسنجی نهایی | Quality       |

---

## 5. Inputs

| ورودی             | نوع    | منبع    | اجباری |
| ----------------- | ------ | ------- | ------ |
| `research_report` | object | PRM-428 | بله    |
| `quality_report`  | object | PRM-427 | بله    |
| `research_plan`   | object | PRM-420 | بله    |

---

## 6. Outputs

| خروجی                | نوع     | توضیح                                 |
| -------------------- | ------- | ------------------------------------- |
| `completion_report`  | object  | گزارش تکمیل پژوهش                     |
| `completion_status`  | string  | وضعیت (completed, incomplete, failed) |
| `research_completed` | boolean | رویداد پایان زنجیره                   |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-428-output",
        "scope": ["report"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 3500,
    "priority": "high"
  }
}
```

---

## 8. Knowledge Requirements

| منبع         | دامنه         | کاربرد           |
| ------------ | ------------- | ---------------- |
| گزارش پژوهش  | تمام یافته‌ها | اعتبارسنجی تکمیل |
| برنامه پژوهش | اهداف اولیه   | تطابق با اهداف   |

---

## 9. Prompt Structure

PRM-429 آخرین گام زنجیره KNW-RSR. تکمیل پژوهش را تأیید و رویداد نهایی را صادر می‌کند.

```
research_report + quality_report + research_plan → PRM-429 → completion_report → research_completed
```

---

## 10. Variable Definitions

| متغیر             | نوع    | اجباری | توضیح              |
| ----------------- | ------ | ------ | ------------------ |
| `research_report` | VAR-06 | بله    | گزارش نهایی پژوهش  |
| `quality_report`  | VAR-06 | بله    | گزارش کیفیت        |
| `research_plan`   | VAR-06 | بله    | برنامه اولیه پژوهش |

---

## 11. Execution Constraints

| ID     | محدودیت                          |
| ------ | -------------------------------- |
| CST-01 | تمام گام‌های زنجیره اجرا شده‌اند |
| CST-02 | کیفیت قابل قبول است              |

---

## 12. Validation Rules

| ID     | قاعده                                           | سطح    | نقض   |
| ------ | ----------------------------------------------- | ------ | ----- |
| VAL-01 | تمام گام‌های زنجیره (PRM-420–428) تکمیل شده‌اند | معماری | خطا   |
| VAL-02 | اهداف پژوهش محقق شده‌اند                        | معماری | خطا   |
| VAL-03 | کیفیت پژوهش در سطح قابل قبول است                | معماری | هشدار |

---

## 13. Failure Conditions

| شرط                      | اقدام                             |
| ------------------------ | --------------------------------- |
| یکی از گام‌ها تکمیل نشده | بازگشت error + مشخص کردن گام ناقص |
| کیفیت زیر آستانه         | بازگشت warning + پیشنهاد بازبینی  |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                             | مسئول              |
| ----- | ----------------- | --------------------------------- | ------------------ |
| QG-01 | Draft → Review    | هویت کامل                         | خودکار             |
| QG-02 | Review → Approved | تکمیل پژوهش تأیید                 | Research Validator |
| QG-03 | Approved → Active | رویداد research_completed صادر شد | AI-014             |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                | توسط        |
| ----------- | ---------- | ------------------------------------ | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی تکمیل پژوهش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-429",
  "name": "Research Completion Validation",
  "family": "FAM-KNW",
  "subfamily": "KNW-RSR",
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
  "sources": [{ "type": "CTX-02", "source": "PRM-428-output", "required": true }],
  "max_tokens": 3500,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "research_report", "type": "VAR-06", "required": true },
    { "id": "quality_report", "type": "VAR-06", "required": true },
    { "id": "research_plan", "type": "VAR-06", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["research_report", "quality_report", "research_plan"],
    "optional": []
  },
  "output": {
    "required": ["completion_report", "completion_status", "research_completed"],
    "optional": []
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    {
      "id": "VAL-01",
      "description": "All chain steps (PRM-420-428) completed",
      "severity": "error"
    },
    { "id": "VAL-02", "description": "Research objectives achieved", "severity": "error" },
    { "id": "VAL-03", "description": "Quality score acceptable", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-013", "AI-011", "AI-014", "AI-004"],
  "dependencies": ["PRM-428"],
  "documentation_refs": []
}
```
