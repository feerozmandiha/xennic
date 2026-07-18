# Execution Recovery Strategy — استراتژی بازیابی اجرا

> **شناسه:** PRM-905
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Orchestrator Lead
> **وابستگی:** PRM-904
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                       |
| ------------------ | --------------------------- |
| **id**             | PRM-905                     |
| **name_fa**        | استراتژی بازیابی اجرا       |
| **name_en**        | Execution Recovery Strategy |
| **family**         | FAM-SYS                     |
| **subfamily**      | SYS-ORC                     |
| **type**           | PT-07                       |
| **complexity**     | C-4                         |
| **authority**      | A-4                         |
| **owner**          | Orchestrator Lead           |
| **version**        | 1.0.0-draft                 |
| **status**         | draft                       |
| **security_level** | SL-03                       |

---

## 2. Purpose

PRM-905 چهارمین گام زنجیره SYS-ORC. استراتژی بازیابی از خطاهای اجرا را در طول مسیر تعیین‌شده تعریف می‌کند.

### اصول بازیابی

| ID    | اصل                                          |
| ----- | -------------------------------------------- |
| RC-01 | هر گام مسیر دارای استراتژی بازیابی مشخص باشد |
| RC-02 | بازیابی تغییرناپذیری مسیر اجرا را حفظ کند    |

---

## 3. Scope

### Inside Scope

| حوزه                   | توضیح                      |
| ---------------------- | -------------------------- |
| تعریف استراتژی بازیابی | per-step recovery          |
| تعیین نقاط توقف        | abort vs retry vs continue |

### Outside Scope

| حوزه          | دلیل         |
| ------------- | ------------ |
| مسیریابی اجرا | حوزه PRM-904 |
| اعتبارسنجی    | حوزه PRM-906 |

---

## 4. Consumers

| مصرف‌کننده            | نقش               | نوع مصرف  |
| --------------------- | ----------------- | --------- |
| AI-014 (Orchestrator) | بازیابی اجرا      | Chain     |
| AI-012 (Improvement)  | تحلیل الگوهای خطا | Secondary |

---

## 5. Inputs

| ورودی               | نوع    | منبع    | اجباری |
| ------------------- | ------ | ------- | ------ |
| `execution_plan`    | object | PRM-904 | بله    |
| `failure_scenarios` | array  | AI-014  | بله    |

---

## 6. Outputs

| خروجی                 | نوع    | توضیح                   |
| --------------------- | ------ | ----------------------- |
| `recovery_strategies` | object | استراتژی بازیابی هر گام |
| `fallback_plan`       | object | طرح جایگزین             |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-904",
        "scope": ["execution-plan"],
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

| منبع    | دامنه     | کاربرد |
| ------- | --------- | ------ |
| PRM-904 | مسیر اجرا | ورودی  |

---

## 9. Prompt Structure

چهارمین گام — تعریف بازیابی خطا در هر گام مسیر.

```
execution_plan + failure_scenarios → PRM-905 → recovery_strategies → PRM-906
```

---

## 10. Variable Definitions

| متغیر               | نوع    | اجباری | توضیح         |
| ------------------- | ------ | ------ | ------------- |
| `execution_plan`    | VAR-03 | بله    | توالی اجرا    |
| `failure_scenarios` | VAR-03 | بله    | سناریوهای خطا |

---

## 11. Execution Constraints

| ID     | محدودیت                                     |
| ------ | ------------------------------------------- |
| CST-01 | هر گام حداقل یک استراتژی بازیابی داشته باشد |
| CST-02 | بازیابی موجب بازنگری مسیر اجرا نشود         |

---

## 12. Validation Rules

| ID     | قاعده                           | سطح    | نقض |
| ------ | ------------------------------- | ------ | --- |
| VAL-01 | تمام گام‌ها دارای بازیابی هستند | معماری | خطا |
| VAL-02 | بازیابی با مسیر اجرا سازگار است | معماری | خطا |

---

## 13. Failure Conditions

| شرط               | اقدام                      |
| ----------------- | -------------------------- |
| گامی بدون بازیابی | بازگشت خطا + درخواست تکمیل |

---

## 14. Quality Gates

| گیت   | مکان              | معیار        | مسئول             |
| ----- | ----------------- | ------------ | ----------------- |
| QG-01 | Draft → Review    | هویت کامل    | خودکار            |
| QG-02 | Review → Approved | بازیابی کامل | Orchestrator Lead |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                               | توسط        |
| ----------- | ---------- | ----------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — استراتژی بازیابی اجرا | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-905",
  "name": "Execution Recovery Strategy",
  "family": "FAM-SYS",
  "subfamily": "SYS-ORC",
  "type": "PT-07",
  "complexity": "C-4",
  "authority": "A-4",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [{ "type": "CTX-02", "source": "PRM-904", "required": true }],
  "max_tokens": 5000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "execution_plan", "type": "VAR-03", "required": true },
    { "id": "failure_scenarios", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["execution_plan", "failure_scenarios"],
    "optional": []
  },
  "output": {
    "required": ["recovery_strategies", "fallback_plan"],
    "optional": []
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "All steps have recovery strategy", "severity": "error" },
    {
      "id": "VAL-02",
      "description": "Recovery compatible with execution plan",
      "severity": "error"
    }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-03",
  "consumers": ["AI-014", "AI-012"],
  "dependencies": ["PRM-904"],
  "documentation_refs": ["AI-000"]
}
```
