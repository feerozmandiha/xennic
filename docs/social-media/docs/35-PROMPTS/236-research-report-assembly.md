# Research Report Assembly — مونتاژ گزارش پژوهش

> **شناسه:** PRM-428
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Research Lead
> **وابستگی:** PRM-427
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                    |
| ------------------ | ------------------------ |
| **id**             | PRM-428                  |
| **name_fa**        | مونتاژ گزارش پژوهش       |
| **name_en**        | Research Report Assembly |
| **family**         | FAM-KNW                  |
| **subfamily**      | KNW-RSR                  |
| **type**           | PT-04                    |
| **complexity**     | C-3                      |
| **authority**      | A-3                      |
| **owner**          | Research Lead            |
| **version**        | 1.0.0-draft              |
| **status**         | draft                    |
| **security_level** | SL-02                    |

---

## 2. Purpose

PRM-428 نهمین گام زنجیره KNW-RSR. تمام خروجی‌های پیشین (برنامه، منابع، شواهد، ارزیابی، همبستگی، بینش، کیفیت) را در یک گزارش پژوهش منسجم و ساختاریافته مونتاژ می‌کند.

### اصول مونتاژ

| ID    | اصل                                    |
| ----- | -------------------------------------- |
| RA-01 | گزارش شامل همه گام‌های پژوهش باشد      |
| RA-02 | ساختار گزارش قابل فهم و قابل مرور باشد |

---

## 3. Scope

### Inside Scope

| حوزه                          | توضیح                            |
| ----------------------------- | -------------------------------- |
| یکپارچه‌سازی خروجی‌های زنجیره | ترکیب تمام نتایج                 |
| ساختاردهی گزارش               | مقدمه، روش، یافته‌ها، نتیجه‌گیری |

### Outside Scope

| حوزه             | دلیل         |
| ---------------- | ------------ |
| تولید بینش       | حوزه PRM-425 |
| اعتبارسنجی تکمیل | حوزه PRM-429 |

---

## 4. Consumers

| مصرف‌کننده           | نقش             | نوع مصرف  |
| -------------------- | --------------- | --------- |
| AI-013 (Research)    | مونتاژ گزارش    | Chain     |
| AI-010 (Analytics)   | مصرف برای تحلیل | Secondary |
| AI-012 (Improvement) | مصرف برای بهبود | Secondary |

---

## 5. Inputs

| ورودی                 | نوع    | منبع    | اجباری |
| --------------------- | ------ | ------- | ------ |
| `research_plan`       | object | PRM-420 | بله    |
| `source_selection`    | object | PRM-421 | بله    |
| `evidence_collection` | array  | PRM-422 | بله    |
| `evidence_evaluation` | array  | PRM-423 | بله    |
| `correlation_result`  | object | PRM-424 | بله    |
| `insights`            | array  | PRM-425 | بله    |
| `quality_report`      | object | PRM-427 | بله    |

---

## 6. Outputs

| خروجی               | نوع    | توضیح            |
| ------------------- | ------ | ---------------- |
| `research_report`   | object | گزارش کامل پژوهش |
| `executive_summary` | object | خلاصه اجرایی     |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-420-through-427",
        "scope": ["all-outputs"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 5000,
    "priority": "high"
  }
}
```

---

## 8. Knowledge Requirements

| منبع                     | دامنه              | کاربرد       |
| ------------------------ | ------------------ | ------------ |
| خروجی‌های PRM-420 تا ۴۲۷ | تمام گام‌های پژوهش | مونتاژ گزارش |

---

## 9. Prompt Structure

PRM-428 نهمین گام زنجیره KNW-RSR. گزارش نهایی را مونتاژ می‌کند.

```
research_plan + source_selection + evidence_collection + evidence_evaluation + correlation_result + insights + quality_report → PRM-428 → research_report → PRM-429
```

---

## 10. Variable Definitions

| متغیر                 | نوع    | اجباری | توضیح         |
| --------------------- | ------ | ------ | ------------- |
| `research_plan`       | VAR-06 | بله    | برنامه پژوهش  |
| `source_selection`    | VAR-06 | بله    | انتخاب منابع  |
| `evidence_collection` | VAR-03 | بله    | شواهد         |
| `evidence_evaluation` | VAR-03 | بله    | ارزیابی شواهد |
| `correlation_result`  | VAR-06 | بله    | همبستگی       |
| `insights`            | VAR-03 | بله    | بینش‌ها       |
| `quality_report`      | VAR-06 | بله    | گزارش کیفیت   |

---

## 11. Execution Constraints

| ID     | محدودیت                              |
| ------ | ------------------------------------ |
| CST-01 | گزارش همه گام‌های زنجیره را پوشش دهد |
| CST-02 | خلاصه اجرایی مستقل و کامل باشد       |

---

## 12. Validation Rules

| ID     | قاعده                              | سطح    | نقض |
| ------ | ---------------------------------- | ------ | --- |
| VAL-01 | تمام گام‌های زنجیره در گزارش هستند | معماری | خطا |
| VAL-02 | خلاصه اجرایی موجود است             | معماری | خطا |

---

## 13. Failure Conditions

| شرط                      | اقدام                             |
| ------------------------ | --------------------------------- |
| خروجی یکی از گام‌ها ناقص | بازگشت error + مشخص کردن گام ناقص |

---

## 14. Quality Gates

| گیت   | مکان              | معیار      | مسئول         |
| ----- | ----------------- | ---------- | ------------- |
| QG-01 | Draft → Review    | هویت کامل  | خودکار        |
| QG-02 | Review → Approved | گزارش کامل | Research Lead |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                            | توسط        |
| ----------- | ---------- | -------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — مونتاژ گزارش پژوهش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-428",
  "name": "Research Report Assembly",
  "family": "FAM-KNW",
  "subfamily": "KNW-RSR",
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
  "sources": [{ "type": "CTX-02", "source": "PRM-420-through-427", "required": true }],
  "max_tokens": 5000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "research_plan", "type": "VAR-06", "required": true },
    { "id": "source_selection", "type": "VAR-06", "required": true },
    { "id": "evidence_collection", "type": "VAR-03", "required": true },
    { "id": "evidence_evaluation", "type": "VAR-03", "required": true },
    { "id": "correlation_result", "type": "VAR-06", "required": true },
    { "id": "insights", "type": "VAR-03", "required": true },
    { "id": "quality_report", "type": "VAR-06", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": [
      "research_plan",
      "source_selection",
      "evidence_collection",
      "evidence_evaluation",
      "correlation_result",
      "insights",
      "quality_report"
    ],
    "optional": []
  },
  "output": {
    "required": ["research_report", "executive_summary"],
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
      "description": "All chain steps are included in report",
      "severity": "error"
    },
    { "id": "VAL-02", "description": "Executive summary present", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-013", "AI-010", "AI-012"],
  "dependencies": ["PRM-420", "PRM-421", "PRM-422", "PRM-423", "PRM-424", "PRM-425", "PRM-427"],
  "documentation_refs": []
}
```
