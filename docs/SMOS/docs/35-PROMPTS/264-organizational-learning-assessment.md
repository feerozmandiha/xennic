# Organizational Learning Assessment — ارزیابی یادگیری سازمانی

> **شناسه:** PRM-437
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Improvement Validator
> **وابستگی:** PRM-436
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                              |
| ------------------ | ---------------------------------- |
| **id**             | PRM-437                            |
| **name_fa**        | ارزیابی یادگیری سازمانی            |
| **name_en**        | Organizational Learning Assessment |
| **family**         | FAM-KNW                            |
| **subfamily**      | KNW-LRN                            |
| **type**           | PT-06                              |
| **complexity**     | C-3                                |
| **authority**      | A-3                                |
| **owner**          | Improvement Validator              |
| **version**        | 1.0.0-draft                        |
| **status**         | draft                              |
| **security_level** | SL-02                              |

---

## 2. Purpose

PRM-437 هشتمین گام زنجیره KNW-LRN. کیفیت کلی فرآیند یادگیری سازمانی را بر اساس معیارهای عمق، دقت، کاربردپذیری و تأثیر ارزیابی می‌کند.

### اصول ارزیابی

| ID    | اصل                                  |
| ----- | ------------------------------------ |
| OA-01 | ارزیابی قابل اندازه‌گیری و عینی باشد |
| OA-02 | معیارها سازمانی و قابل تکرار باشند   |

---

## 3. Scope

### Inside Scope

| حوزه                         | توضیح            |
| ---------------------------- | ---------------- |
| ارزیابی کیفیت یادگیری        | عمق، دقت، کاربرد |
| امتیازدهی به یادگیری سازمانی | نمره کیفیت       |

### Outside Scope

| حوزه              | دلیل         |
| ----------------- | ------------ |
| سازگاری           | حوزه PRM-436 |
| مونتاژ بسته بهبود | حوزه PRM-438 |

---

## 4. Consumers

| مصرف‌کننده           | نقش             | نوع مصرف |
| -------------------- | --------------- | -------- |
| AI-012 (Improvement) | ارزیابی یادگیری | Chain    |
| AI-004 (Review)      | اعتبارسنجی      | Quality  |

---

## 5. Inputs

| ورودی                    | نوع    | منبع    | اجباری |
| ------------------------ | ------ | ------- | ------ |
| `consistency_report`     | object | PRM-436 | بله    |
| `recommendation_package` | object | PRM-435 | بله    |
| `learning_synthesis`     | object | PRM-433 | بله    |

---

## 6. Outputs

| خروجی                 | نوع    | توضیح           |
| --------------------- | ------ | --------------- |
| `learning_assessment` | object | ارزیابی یادگیری |
| `learning_score`      | number | امتیاز (۰–۱۰)   |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-436-output",
        "scope": ["consistency"],
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

| منبع          | دامنه | کاربرد  |
| ------------- | ----- | ------- |
| گزارش سازگاری | وضعیت | ارزیابی |

---

## 9. Prompt Structure

PRM-437 هشتمین گام زنجیره KNW-LRN. کیفیت یادگیری را ارزیابی می‌کند.

```
consistency_report + recommendation_package + learning_synthesis → PRM-437 → learning_assessment → PRM-438
```

---

## 10. Variable Definitions

| متغیر                    | نوع    | اجباری | توضیح         |
| ------------------------ | ------ | ------ | ------------- |
| `consistency_report`     | VAR-06 | بله    | گزارش سازگاری |
| `recommendation_package` | VAR-06 | بله    | بسته توصیه‌ها |
| `learning_synthesis`     | VAR-06 | بله    | ترکیب یادگیری |

---

## 11. Execution Constraints

| ID     | محدودیت                      |
| ------ | ---------------------------- |
| CST-01 | امتیاز یادگیری مستند باشد    |
| CST-02 | معیارها سازمانی و عینی باشند |

---

## 12. Validation Rules

| ID     | قاعده                         | سطح    | نقض   |
| ------ | ----------------------------- | ------ | ----- |
| VAL-01 | امتیاز یادگیری محاسبه شده است | معماری | خطا   |
| VAL-02 | معیارها مستند شده‌اند         | معماری | هشدار |

---

## 13. Failure Conditions

| شرط                         | اقدام                          |
| --------------------------- | ------------------------------ |
| امتیاز زیر آستانه قابل قبول | بازگشت error + پیشنهاد بازبینی |

---

## 14. Quality Gates

| گیت   | مکان              | معیار        | مسئول                 |
| ----- | ----------------- | ------------ | --------------------- |
| QG-01 | Draft → Review    | هویت کامل    | خودکار                |
| QG-02 | Review → Approved | ارزیابی کامل | Improvement Validator |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                 | توسط        |
| ----------- | ---------- | ------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — ارزیابی یادگیری سازمانی | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-437",
  "name": "Organizational Learning Assessment",
  "family": "FAM-KNW",
  "subfamily": "KNW-LRN",
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
  "sources": [{ "type": "CTX-02", "source": "PRM-436-output", "required": true }],
  "max_tokens": 3500,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "consistency_report", "type": "VAR-06", "required": true },
    { "id": "recommendation_package", "type": "VAR-06", "required": true },
    { "id": "learning_synthesis", "type": "VAR-06", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["consistency_report", "recommendation_package", "learning_synthesis"],
    "optional": []
  },
  "output": {
    "required": ["learning_assessment", "learning_score"],
    "optional": []
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Learning score calculated", "severity": "error" },
    { "id": "VAL-02", "description": "Assessment criteria documented", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-012", "AI-004"],
  "dependencies": ["PRM-436"],
  "documentation_refs": []
}
```
