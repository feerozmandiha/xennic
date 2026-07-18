# Learning Consistency Validation — اعتبارسنجی سازگاری یادگیری

> **شناسه:** PRM-436
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Improvement Validator
> **وابستگی:** PRM-435
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                           |
| ------------------ | ------------------------------- |
| **id**             | PRM-436                         |
| **name_fa**        | اعتبارسنجی سازگاری یادگیری      |
| **name_en**        | Learning Consistency Validation |
| **family**         | FAM-KNW                         |
| **subfamily**      | KNW-LRN                         |
| **type**           | PT-06                           |
| **complexity**     | C-2                             |
| **authority**      | A-3                             |
| **owner**          | Improvement Validator           |
| **version**        | 1.0.0-draft                     |
| **status**         | draft                           |
| **security_level** | SL-02                           |

---

## 2. Purpose

PRM-436 هفتمین گام زنجیره KNW-LRN. سازگاری و انسجام داخلی تمام خروجی‌های زنجیره یادگیری را با اهداف اولیه سازمانی اعتبارسنجی می‌کند.

### اصول اعتبارسنجی

| ID    | اصل                                  |
| ----- | ------------------------------------ |
| CV-01 | خروجی‌ها با اهداف اولیه سازگار باشند |
| CV-02 | هیچ تضاد داخلی بین توصیه‌ها نباشد    |

---

## 3. Scope

### Inside Scope

| حوزه                   | توضیح                    |
| ---------------------- | ------------------------ |
| بررسی سازگاری توصیه‌ها | با درس‌آموخته‌ها و اهداف |
| تشخیص تضاد             | ناسازگاری بین خروجی‌ها   |

### Outside Scope

| حوزه              | دلیل         |
| ----------------- | ------------ |
| ارزیابی کیفیت     | حوزه PRM-437 |
| مونتاژ بسته بهبود | حوزه PRM-438 |

---

## 4. Consumers

| مصرف‌کننده           | نقش                | نوع مصرف |
| -------------------- | ------------------ | -------- |
| AI-012 (Improvement) | اعتبارسنجی سازگاری | Chain    |
| AI-004 (Review)      | اعتبارسنجی         | Quality  |

---

## 5. Inputs

| ورودی                    | نوع    | منبع    | اجباری |
| ------------------------ | ------ | ------- | ------ |
| `recommendation_package` | object | PRM-435 | بله    |
| `learning_synthesis`     | object | PRM-433 | بله    |
| `lessons_learned`        | array  | PRM-430 | بله    |

---

## 6. Outputs

| خروجی                | نوع    | توضیح                       |
| -------------------- | ------ | --------------------------- |
| `consistency_report` | object | گزارش سازگاری یادگیری       |
| `consistency_status` | string | وضعیت (pass, warning, fail) |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-435-output",
        "scope": ["recommendations"],
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

| منبع     | دامنه        | کاربرد     |
| -------- | ------------ | ---------- |
| توصیه‌ها | همه توصیه‌ها | اعتبارسنجی |

---

## 9. Prompt Structure

PRM-436 هفتمین گام زنجیره KNW-LRN. سازگاری را بررسی می‌کند.

```
recommendation_package + learning_synthesis + lessons_learned → PRM-436 → consistency_report → PRM-437
```

---

## 10. Variable Definitions

| متغیر                    | نوع    | اجباری | توضیح         |
| ------------------------ | ------ | ------ | ------------- |
| `recommendation_package` | VAR-06 | بله    | بسته توصیه‌ها |
| `learning_synthesis`     | VAR-06 | بله    | ترکیب یادگیری |
| `lessons_learned`        | VAR-03 | بله    | درس‌آموخته‌ها |

---

## 11. Execution Constraints

| ID     | محدودیت                                |
| ------ | -------------------------------------- |
| CST-01 | توصیه‌ها با درس‌آموخته‌ها سازگار باشند |
| CST-02 | تضادها مستند شوند                      |

---

## 12. Validation Rules

| ID     | قاعده                              | سطح    | نقض   |
| ------ | ---------------------------------- | ------ | ----- |
| VAL-01 | توصیه‌ها با درس‌آموخته‌ها سازگارند | معماری | خطا   |
| VAL-02 | تضاد مستند شده است                 | معماری | هشدار |

---

## 13. Failure Conditions

| شرط         | اقدام                             |
| ----------- | --------------------------------- |
| تضاد بحرانی | بازگشت error + ارجاع برای بازبینی |

---

## 14. Quality Gates

| گیت   | مکان              | معیار         | مسئول                 |
| ----- | ----------------- | ------------- | --------------------- |
| QG-01 | Draft → Review    | هویت کامل     | خودکار                |
| QG-02 | Review → Approved | سازگاری تأیید | Improvement Validator |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                    | توسط        |
| ----------- | ---------- | ---------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی سازگاری یادگیری | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-436",
  "name": "Learning Consistency Validation",
  "family": "FAM-KNW",
  "subfamily": "KNW-LRN",
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
  "sources": [{ "type": "CTX-02", "source": "PRM-435-output", "required": true }],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "recommendation_package", "type": "VAR-06", "required": true },
    { "id": "learning_synthesis", "type": "VAR-06", "required": true },
    { "id": "lessons_learned", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["recommendation_package", "learning_synthesis", "lessons_learned"],
    "optional": []
  },
  "output": {
    "required": ["consistency_report", "consistency_status"],
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
      "description": "Recommendations consistent with lessons",
      "severity": "error"
    },
    { "id": "VAL-02", "description": "Contradictions documented", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-012", "AI-004"],
  "dependencies": ["PRM-435"],
  "documentation_refs": []
}
```
