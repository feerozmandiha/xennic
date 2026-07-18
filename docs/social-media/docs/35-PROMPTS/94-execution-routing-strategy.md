# Execution Routing Strategy — استراتژی مسیریابی اجرا

> **شناسه:** PRM-904
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Orchestrator Lead
> **وابستگی:** PRM-903
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                      |
| ------------------ | -------------------------- |
| **id**             | PRM-904                    |
| **name_fa**        | استراتژی مسیریابی اجرا     |
| **name_en**        | Execution Routing Strategy |
| **family**         | FAM-SYS                    |
| **subfamily**      | SYS-ORC                    |
| **type**           | PT-04                      |
| **complexity**     | C-4                        |
| **authority**      | A-4                        |
| **owner**          | Orchestrator Lead          |
| **version**        | 1.0.0-draft                |
| **status**         | draft                      |
| **security_level** | SL-03                      |

---

## 2. Purpose

PRM-904 سومین گام زنجیره SYS-ORC. توالی اجرای زیروظایف تخصیص‌یافته را بر اساس وابستگی‌ها و اولویت تعیین می‌کند.

### اصول مسیریابی

| ID    | اصل                                      |
| ----- | ---------------------------------------- |
| ER-01 | توالی بر اساس وابستگی‌های تعریف‌شده باشد |
| ER-02 | مسیر اجرا تغییرناپذیر (immutable) باشد   |

---

## 3. Scope

### Inside Scope

| حوزه            | توضیح                    |
| --------------- | ------------------------ |
| تعیین توالی     | ordering execution plan  |
| مدیریت هم‌روندی | concurrent vs sequential |

### Outside Scope

| حوزه        | دلیل         |
| ----------- | ------------ |
| بازیابی خطا | حوزه PRM-905 |
| اعتبارسنجی  | حوزه PRM-906 |

---

## 4. Consumers

| مصرف‌کننده            | نقش           | نوع مصرف |
| --------------------- | ------------- | -------- |
| AI-014 (Orchestrator) | مسیریابی اجرا | Chain    |

---

## 5. Inputs

| ورودی                    | نوع    | منبع    | اجباری |
| ------------------------ | ------ | ------- | ------ |
| `capability_assignments` | object | PRM-903 | بله    |
| `task_dependencies`      | array  | PRM-902 | بله    |

---

## 6. Outputs

| خروجی            | نوع    | توضیح               |
| ---------------- | ------ | ------------------- |
| `execution_plan` | object | توالی اجرا          |
| `routing_map`    | object | نگاشت کامل مسیریابی |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-903",
        "scope": ["capability-assignments"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-902",
        "scope": ["task-dependencies"],
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

| منبع    | دامنه      | کاربرد |
| ------- | ---------- | ------ |
| PRM-903 | تخصیص‌ها   | ورودی  |
| PRM-902 | وابستگی‌ها | ورودی  |

---

## 9. Prompt Structure

سومین گام زنجیره — تعیین توالی و مسیر اجرا.

```
capability_assignments + task_dependencies → PRM-904 → execution_plan → PRM-905
```

---

## 10. Variable Definitions

| متغیر                    | نوع    | اجباری | توضیح                   |
| ------------------------ | ------ | ------ | ----------------------- |
| `capability_assignments` | VAR-03 | بله    | تخصیص زیروظیفه به Agent |
| `task_dependencies`      | VAR-03 | بله    | وابستگی زیروظایف        |

---

## 11. Execution Constraints

| ID     | محدودیت                         |
| ------ | ------------------------------- |
| CST-01 | توالی غیرچرخه‌ای باشد           |
| CST-02 | وابستگی‌های تعریف‌شده رعایت شود |

---

## 12. Validation Rules

| ID     | قاعده                                 | سطح    | نقض |
| ------ | ------------------------------------- | ------ | --- |
| VAL-01 | execution_plan شامل تمام زیروظایف است | معماری | خطا |
| VAL-02 | توالی با وابستگی‌ها سازگار است        | معماری | خطا |

---

## 13. Failure Conditions

| شرط           | اقدام                                   |
| ------------- | --------------------------------------- |
| توالی چرخه‌ای | بازگشت خطا + درخواست بازبینی وابستگی‌ها |

---

## 14. Quality Gates

| گیت   | مکان              | معیار         | مسئول             |
| ----- | ----------------- | ------------- | ----------------- |
| QG-01 | Draft → Review    | هویت کامل     | خودکار            |
| QG-02 | Review → Approved | مسیریابی کامل | Orchestrator Lead |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                | توسط        |
| ----------- | ---------- | ------------------------------------ | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — استراتژی مسیریابی اجرا | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-904",
  "name": "Execution Routing Strategy",
  "family": "FAM-SYS",
  "subfamily": "SYS-ORC",
  "type": "PT-04",
  "complexity": "C-4",
  "authority": "A-4",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [
    { "type": "CTX-02", "source": "PRM-903", "required": true },
    { "type": "CTX-02", "source": "PRM-902", "required": true }
  ],
  "max_tokens": 5000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "capability_assignments", "type": "VAR-03", "required": true },
    { "id": "task_dependencies", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["capability_assignments", "task_dependencies"],
    "optional": []
  },
  "output": {
    "required": ["execution_plan", "routing_map"],
    "optional": []
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Execution plan includes all subtasks", "severity": "error" },
    {
      "id": "VAL-02",
      "description": "Sequence is compatible with dependencies",
      "severity": "error"
    }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-03",
  "consumers": ["AI-014"],
  "dependencies": ["PRM-902", "PRM-903"],
  "documentation_refs": ["AI-000"]
}
```
