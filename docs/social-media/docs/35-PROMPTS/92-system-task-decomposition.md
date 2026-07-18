# System Task Decomposition — تجزیه وظایف سیستم

> **شناسه:** PRM-902
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Orchestrator Lead
> **وابستگی:** PRM-901
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                     |
| ------------------ | ------------------------- |
| **id**             | PRM-902                   |
| **name_fa**        | تجزیه وظایف سیستم         |
| **name_en**        | System Task Decomposition |
| **family**         | FAM-SYS                   |
| **subfamily**      | SYS-ORC                   |
| **type**           | PT-04                     |
| **complexity**     | C-3                       |
| **authority**      | A-4                       |
| **owner**          | Orchestrator Lead         |
| **version**        | 1.0.0-draft               |
| **status**         | draft                     |
| **security_level** | SL-02                     |

---

## 2. Purpose

PRM-902 نخستین گام زنجیره SYS-ORC. وظایف ارسالی به Orchestrator (AI-014) را به زیروظایف قابل تخصیص به Agentهای تخصصی تجزیه می‌کند.

### اصول تجزیه

| ID    | اصل                                       |
| ----- | ----------------------------------------- |
| TD-01 | تجزیه بر اساس دامنه و قابلیت Agentها باشد |
| TD-02 | هر زیروظیفه به یک Agent قابل تخصیص باشد   |

---

## 3. Scope

### Inside Scope

| حوزه                         | توضیح                          |
| ---------------------------- | ------------------------------ |
| تجزیه وظیفه به زیروظایف      | atomic task units              |
| تخصیص اولیه به خانواده Agent | Content, Operations, Knowledge |

### Outside Scope

| حوزه          | دلیل         |
| ------------- | ------------ |
| تطبیق قابلیت  | حوزه PRM-903 |
| مسیریابی اجرا | حوزه PRM-904 |

---

## 4. Consumers

| مصرف‌کننده            | نقش         | نوع مصرف |
| --------------------- | ----------- | -------- |
| AI-014 (Orchestrator) | تجزیه وظایف | Chain    |

---

## 5. Inputs

| ورودی                   | نوع    | منبع   | اجباری |
| ----------------------- | ------ | ------ | ------ |
| `orchestration_request` | object | AI-014 | بله    |
| `agent_registry`        | object | AI-000 | بله    |

---

## 6. Outputs

| خروجی               | نوع   | توضیح                |
| ------------------- | ----- | -------------------- |
| `task_breakdown`    | array | زیروظایف تجزیه‌شده   |
| `task_dependencies` | array | وابستگی بین زیروظایف |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "AI-000",
        "scope": ["agent-registry"],
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

| منبع   | دامنه           | کاربرد      |
| ------ | --------------- | ----------- |
| AI-000 | رجیستری Agentها | تجزیه وظایف |

---

## 9. Prompt Structure

PRM-902 نخستین گام زنجیره SYS-ORC. وظایف را تجزیه می‌کند.

```
orchestration_request + agent_registry → PRM-902 → task_breakdown → PRM-903
```

---

## 10. Variable Definitions

| متغیر                   | نوع    | اجباری | توضیح               |
| ----------------------- | ------ | ------ | ------------------- |
| `orchestration_request` | VAR-06 | بله    | درخواست هماهنگ‌سازی |
| `agent_registry`        | VAR-03 | بله    | رجیستری Agentها     |

---

## 11. Execution Constraints

| ID     | محدودیت                                    |
| ------ | ------------------------------------------ |
| CST-01 | هر زیروظیفه به یک خانواده Agent تخصیص یابد |
| CST-02 | وابستگی‌های غیرچرخه‌ای باشند               |

---

## 12. Validation Rules

| ID     | قاعده                                     | سطح    | نقض |
| ------ | ----------------------------------------- | ------ | --- |
| VAL-01 | زیروظایف به خانواده Agent تخصیص یافته‌اند | معماری | خطا |
| VAL-02 | وابستگی‌ها غیرچرخه‌ای هستند               | معماری | خطا |

---

## 13. Failure Conditions

| شرط                   | اقدام                            |
| --------------------- | -------------------------------- |
| وظیفه قابل تجزیه نیست | بازگشت error + درخواست شفاف‌سازی |

---

## 14. Quality Gates

| گیت   | مکان              | معیار      | مسئول             |
| ----- | ----------------- | ---------- | ----------------- |
| QG-01 | Draft → Review    | هویت کامل  | خودکار            |
| QG-02 | Review → Approved | تجزیه کامل | Orchestrator Lead |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                           | توسط        |
| ----------- | ---------- | ------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — تجزیه وظایف سیستم | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-902",
  "name": "System Task Decomposition",
  "family": "FAM-SYS",
  "subfamily": "SYS-ORC",
  "type": "PT-04",
  "complexity": "C-3",
  "authority": "A-4",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [{ "type": "CTX-02", "source": "AI-000", "required": true }],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "orchestration_request", "type": "VAR-06", "required": true },
    { "id": "agent_registry", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["orchestration_request", "agent_registry"],
    "optional": []
  },
  "output": {
    "required": ["task_breakdown", "task_dependencies"],
    "optional": []
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Subtasks assigned to agent family", "severity": "error" },
    { "id": "VAL-02", "description": "Dependencies are acyclic", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-014"],
  "dependencies": ["PRM-901"],
  "documentation_refs": ["AI-000"]
}
```
