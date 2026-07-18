# Agent Capability Matching — تطبیق قابلیت عامل

> **شناسه:** PRM-903
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Orchestrator Lead
> **وابستگی:** PRM-902
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                     |
| ------------------ | ------------------------- |
| **id**             | PRM-903                   |
| **name_fa**        | تطبیق قابلیت عامل         |
| **name_en**        | Agent Capability Matching |
| **family**         | FAM-SYS                   |
| **subfamily**      | SYS-ORC                   |
| **type**           | PT-07                     |
| **complexity**     | C-3                       |
| **authority**      | A-4                       |
| **owner**          | Orchestrator Lead         |
| **version**        | 1.0.0-draft               |
| **status**         | draft                     |
| **security_level** | SL-02                     |

---

## 2. Purpose

PRM-903 دومین گام زنجیره SYS-ORC. زیروظایف خروجی PRM-902 را با قابلیت‌های ثبت‌شده Agentها تطبیق می‌دهد.

### اصول تطبیق

| ID    | اصل                                               |
| ----- | ------------------------------------------------- |
| CM-01 | هر زیروظیفه به یک Agent با قابلیت کامل تطبیق یابد |
| CM-02 | در صورت عدم تطبیق، خطا برگردانده شود              |

---

## 3. Scope

### Inside Scope

| حوزه                   | توضیح                    |
| ---------------------- | ------------------------ |
| تطبیق زیروظیفه ↔ Agent | بر اساس قابلیت           |
| اولویت‌بندی Agent      | در صورت چندگزینه‌ای بودن |

### Outside Scope

| حوزه          | دلیل         |
| ------------- | ------------ |
| تجزیه وظایف   | حوزه PRM-902 |
| مسیریابی اجرا | حوزه PRM-904 |

---

## 4. Consumers

| مصرف‌کننده            | نقش                  | نوع مصرف  |
| --------------------- | -------------------- | --------- |
| AI-014 (Orchestrator) | تطبیق قابلیت         | Chain     |
| AI-001 (Strategy)     | مشاوره در صورت ابهام | Secondary |

---

## 5. Inputs

| ورودی                       | نوع    | منبع    | اجباری |
| --------------------------- | ------ | ------- | ------ |
| `task_breakdown`            | array  | PRM-902 | بله    |
| `agent_capability_registry` | object | AI-000  | بله    |

---

## 6. Outputs

| خروجی                    | نوع    | توضیح                           |
| ------------------------ | ------ | ------------------------------- |
| `capability_assignments` | object | نگاشت زیروظیفه → Agent          |
| `unmatched_tasks`        | array  | وظایف بدون تطبیق (در صورت وجود) |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "AI-000",
        "scope": ["agent-capability-registry"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-902",
        "scope": ["task-breakdown"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 4000,
    "priority": "high"
  }
}
```

---

## 8. Knowledge Requirements

| منبع    | دامنه            | کاربرد |
| ------- | ---------------- | ------ |
| AI-000  | قابلیت‌های Agent | تطبیق  |
| PRM-902 | زیروظایف         | ورودی  |

---

## 9. Prompt Structure

دومین گام زنجیره SYS-ORC — تطبیق زیروظیفه با Agent.

```
task_breakdown + agent_capability_registry → PRM-903 → capability_assignments → PRM-904
```

---

## 10. Variable Definitions

| متغیر                       | نوع    | اجباری | توضیح                  |
| --------------------------- | ------ | ------ | ---------------------- |
| `task_breakdown`            | VAR-03 | بله    | زیروظایف خروجی PRM-902 |
| `agent_capability_registry` | VAR-03 | بله    | رجیستری قابلیت‌ها      |

---

## 11. Execution Constraints

| ID     | محدودیت                                 |
| ------ | --------------------------------------- |
| CST-01 | هر زیروظیفه به یک Agent تخصیص یابد      |
| CST-02 | Agent انتخاب‌شده قابلیت کامل داشته باشد |

---

## 12. Validation Rules

| ID     | قاعده                              | سطح    | نقض |
| ------ | ---------------------------------- | ------ | --- |
| VAL-01 | تخصیص کامل است                     | معماری | خطا |
| VAL-02 | قابلیت Agent با وظیفه همخوانی دارد | معماری | خطا |

---

## 13. Failure Conditions

| شرط                 | اقدام                                |
| ------------------- | ------------------------------------ |
| زیروظیفه بدون تطبیق | بازگشت unmatched_tasks + توقف زنجیره |

---

## 14. Quality Gates

| گیت   | مکان              | معیار      | مسئول             |
| ----- | ----------------- | ---------- | ----------------- |
| QG-01 | Draft → Review    | هویت کامل  | خودکار            |
| QG-02 | Review → Approved | تطبیق کامل | Orchestrator Lead |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                           | توسط        |
| ----------- | ---------- | ------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — تطبیق قابلیت عامل | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-903",
  "name": "Agent Capability Matching",
  "family": "FAM-SYS",
  "subfamily": "SYS-ORC",
  "type": "PT-07",
  "complexity": "C-3",
  "authority": "A-4",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [
    { "type": "CTX-02", "source": "AI-000", "required": true },
    { "type": "CTX-02", "source": "PRM-902", "required": true }
  ],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "task_breakdown", "type": "VAR-03", "required": true },
    { "id": "agent_capability_registry", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["task_breakdown", "agent_capability_registry"],
    "optional": []
  },
  "output": {
    "required": ["capability_assignments"],
    "optional": ["unmatched_tasks"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Complete assignment", "severity": "error" },
    { "id": "VAL-02", "description": "Agent capability matches task", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-014", "AI-001"],
  "dependencies": ["PRM-902"],
  "documentation_refs": ["AI-000"]
}
```
