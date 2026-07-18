# Goal Decomposition — تجزیه اهداف استراتژیک

> **شناسه:** PRM-102
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Content Strategist
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-101](./10-enterprise-strategic-planning.md), [PRM-401](../35-PROMPTS/40-brand-voice-context.md), [PRM-402](../35-PROMPTS/42-content-taxonomy-context.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                 |
| ------------------ | --------------------- |
| **id**             | PRM-102               |
| **name_fa**        | تجزیه اهداف استراتژیک |
| **name_en**        | Goal Decomposition    |
| **family**         | FAM-STR               |
| **subfamily**      | STR-PLN               |
| **type**           | PT-04                 |
| **complexity**     | C-3                   |
| **authority**      | A-2                   |
| **owner**          | Content Strategist    |
| **version**        | 1.0.0-draft           |
| **status**         | draft                 |
| **security_level** | SL-03                 |

---

## 2. Purpose

PRM-102 اهداف استراتژیک سطح بالا (خروجی PRM-101) را به اهداف عملیاتی، برنامه‌های اجرایی و وظایف قابل اندازه‌گیری تجزیه می‌کند. این پرامپت پل بین استراتژی و اجرا است.

### اصول تجزیه

| ID    | اصل                                                               |
| ----- | ----------------------------------------------------------------- |
| GD-01 | هر هدف استراتژیک به حداقل ۳ هدف عملیاتی تجزیه می‌شود              |
| GD-02 | هر هدف عملیاتی باید به یک Agent یا تیم خاص قابل انتساب باشد       |
| GD-03 | هر هدف عملیاتی باید دارای KPI و زمان‌بندی مشخص باشد               |
| GD-04 | تجزیه باید سلسله‌مراتبی (استراتژیک → عملیاتی → تاکتیکی) باشد      |
| GD-05 | همه اهداف عملیاتی باید قابل ردیابی به هدف استراتژیک بالادست باشند |

---

## 3. Scope

### Inside Scope

| حوزه                             | توضیح                                     |
| -------------------------------- | ----------------------------------------- |
| تجزیه اهداف استراتژیک به عملیاتی | تبدیل اهداف سطح بالا به برنامه‌های اجرایی |
| تعیین milestones                 | نقاط عطف با زمان‌بندی                     |
| تخصیص به Agent                   | انتساب هر هدف عملیاتی به Agent مسئول      |
| تعیین وابستگی‌ها                 | شناسایی پیش‌نیازهای هر هدف                |

### Outside Scope

| حوزه                    | دلیل         |
| ----------------------- | ------------ |
| تدوین استراتژی سطح بالا | حوزه PRM-101 |
| تصمیم‌گیری تاکتیکی      | حوزه PRM-103 |
| اجرای محتوا             | حوزه PRM-201 |
| زمان‌بندی دقیق انتشار   | حوزه PRM-301 |

---

## 4. Prompt Category

| دسته                    | مقدار                                               |
| ----------------------- | --------------------------------------------------- |
| **Family**              | FAM-STR (Strategic)                                 |
| **Subfamily**           | STR-PLN (Planning)                                  |
| **Type**                | PT-04 (Chain)                                       |
| **Composition Pattern** | CP-01 (Sequential) — بعد از PRM-101, قبل از PRM-103 |
| **Layer**               | PLYR-01 (Governance)                                |

---

## 5. Supported Agents

| Agent                     | نقش                       | نوع مصرف      |
| ------------------------- | ------------------------- | ------------- |
| AI-001 (Content Strategy) | تجزیه اهداف استراتژیک     | Instruction   |
| AI-002 (Content Planning) | برنامه‌ریزی عملیاتی       | Instruction   |
| AI-014 (Orchestrator)     | هماهنگی انتساب به Agentها | Orchestration |

---

## 6. Supported Automation

| Workflow             | مصرف                             |
| -------------------- | -------------------------------- |
| AUT-Content Pipeline | تأمین برنامه اجرایی برای خط لوله |
| AUT-Approval         | تأمین نقاط عطف برای فرایند تأیید |

---

## 7. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-101 Output",
        "scope": ["strategic-objectives", "strategic-pathways", "risk-assessment"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-401",
        "scope": ["brand-dna"],
        "injection": "prepend",
        "required": false
      },
      {
        "type": "CTX-02",
        "source": "PRM-402",
        "scope": ["content-categories", "lifecycle-mapping"],
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

## 8. Required Knowledge

| منبع    | دامنه            | کاربرد                         |
| ------- | ---------------- | ------------------------------ |
| EDT-001 | ECOS             | تطبیق اهداف با چرخه حیات محتوا |
| EDT-002 | تاکسونومی        | تطبیق اهداف با انواع محتوا     |
| AI-\*   | قابلیت‌های Agent | انتساب اهداف به Agent مناسب    |

---

## 9. Required Variables

| متغیر                  | نوع    | اجباری | توضیح                       | اعتبارسنجی                                             |
| ---------------------- | ------ | ------ | --------------------------- | ------------------------------------------------------ |
| `strategic_objectives` | VAR-07 | بله    | اهداف استراتژیک از PRM-101  | item_type: VAR-06, max_items: 5                        |
| `decomposition_depth`  | VAR-04 | خیر    | عمق تجزیه                   | members: [operational, tactical], default: operational |
| `timeframe_months`     | VAR-02 | بله    | بازه زمانی اجرا             | min_value: 1, max_value: 24                            |
| `agent_availability`   | VAR-06 | خیر    | وضعیت در دسترس بودن Agentها | —                                                      |

---

## 10. Prompt Constraints

| ID     | محدودیت                                                   |
| ------ | --------------------------------------------------------- |
| CST-01 | هر هدف استراتژیک حداکثر به ۵ هدف عملیاتی تجزیه می‌شود     |
| CST-02 | هر هدف عملیاتی باید دارای KPI و deadline باشد             |
| CST-03 | زنجیره تجزیه حداکثر ۳ سطح (استراتژیک → عملیاتی → تاکتیکی) |
| CST-04 | وابستگی بین اهداف باید غیرچرخه‌ای باشد                    |
| CST-05 | Milestoneها حداقل ماهانه تعریف شوند                       |

---

## 11. Prompt Composition

| الگو       | شناسه | شرح                                          |
| ---------- | ----- | -------------------------------------------- |
| Sequential | CP-01 | PRM-101 → PRM-102 → PRM-103                  |
| Nested     | CP-02 | PRM-402 به عنوان بافت تاکسونومی درون PRM-102 |

---

## 12. Input Contract

| ورودی                  | نوع     | منبع    | اجباری |
| ---------------------- | ------- | ------- | ------ |
| `strategic_objectives` | array   | PRM-101 | بله    |
| `decomposition_depth`  | enum    | انسان   | خیر    |
| `timeframe_months`     | integer | انسان   | بله    |
| `agent_availability`   | object  | AI-014  | خیر    |

---

## 13. Output Contract

| خروجی               | نوع    | توضیح                                                  |
| ------------------- | ------ | ------------------------------------------------------ |
| `operational_plan`  | object | برنامه عملیاتی شامل اهداف تجزیه‌شده                    |
| `goal_tree`         | object | درخت اهداف (سلسله‌مراتب استراتژیک → عملیاتی → تاکتیکی) |
| `milestones`        | array  | نقاط عطف با زمان‌بندی                                  |
| `agent_assignments` | array  | انتساب اهداف به Agentها                                |
| `dependency_graph`  | array  | گراف وابستگی بین اهداف                                 |

---

## 14. Validation Rules

| ID     | قاعده                                        | سطح    | نقض     |
| ------ | -------------------------------------------- | ------ | ------- |
| VAL-01 | هر هدف استراتژیک به ≤۵ هدف عملیاتی تجزیه شود | معماری | هشدار   |
| VAL-02 | هر هدف عملیاتی KPI و deadline دارد           | معماری | هشدار   |
| VAL-03 | زنجیره تجزیه ≤۳ سطح                          | معماری | هشدار   |
| VAL-04 | وابستگی‌های غیرچرخه‌ای                       | معماری | عدم ثبت |
| VAL-05 | Milestoneها حداقل ماهانه                     | معماری | هشدار   |
| VAL-06 | انتساب به Agent معتبر                        | معماری | عدم ثبت |

---

## 15. Quality Gates

| گیت   | مکان              | معیار                                | مسئول           |
| ----- | ----------------- | ------------------------------------ | --------------- |
| QG-01 | Draft → Review    | هویت کامل، ورودی PRM-101 معتبر       | خودکار          |
| QG-02 | Review → Approved | انطباق با PRM-000, ساختار درختی صحیح | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001                       | Registry Keeper |

---

## 16. Security Considerations

| ID     | ملاحظه                                                 |
| ------ | ------------------------------------------------------ |
| SEC-01 | اهداف عملیاتی SL-03 — دسترسی محدود                     |
| SEC-02 | انتساب به Agentها حاوی اطلاعات ظرفیت عملیاتی — محرمانه |

---

## 17. Cross References

| سند                                              | رابطه                         |
| ------------------------------------------------ | ----------------------------- |
| [PRM-101](./10-enterprise-strategic-planning.md) | upstream — ورودی از این سند   |
| [PRM-103](./14-decision-framing.md)              | downstream — خروجی به این سند |
| [PRM-401](./40-brand-voice-context.md)           | upstream                      |
| [PRM-402](./42-content-taxonomy-context.md)      | upstream                      |
| [AI-\*](../40-AI-AGENTS/)                        | reference — انتساب به Agentها |

---

## 18. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-102",
  "name": "Goal Decomposition",
  "family": "FAM-STR",
  "subfamily": "STR-PLN",
  "type": "PT-04",
  "complexity": "C-3",
  "authority": "A-2",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [
    { "type": "CTX-04", "source": "PRM-101", "required": true },
    { "type": "CTX-02", "source": "PRM-402", "required": true },
    { "type": "CTX-02", "source": "PRM-401", "required": false }
  ],
  "max_tokens": 3500,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "strategic_objectives", "type": "VAR-07", "required": true, "max_items": 5 },
    {
      "id": "decomposition_depth",
      "type": "VAR-04",
      "required": false,
      "members": ["operational", "tactical"],
      "default": "operational"
    },
    { "id": "timeframe_months", "type": "VAR-02", "required": true, "min": 1, "max": 24 },
    { "id": "agent_availability", "type": "VAR-06", "required": false }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["strategic_objectives", "timeframe_months"],
    "optional": ["decomposition_depth", "agent_availability"]
  },
  "output": {
    "required": ["operational_plan", "goal_tree", "milestones"],
    "optional": ["agent_assignments", "dependency_graph"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    {
      "id": "VAL-01",
      "description": "Each objective → ≤5 operational goals",
      "severity": "warning"
    },
    { "id": "VAL-02", "description": "Each goal has KPI and deadline", "severity": "warning" },
    { "id": "VAL-03", "description": "Decomposition chain ≤3 levels", "severity": "warning" },
    { "id": "VAL-04", "description": "Non-circular dependencies", "severity": "error" },
    { "id": "VAL-06", "description": "Valid agent assignment", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-03",
  "consumers": ["AI-001", "AI-002", "AI-014"],
  "dependencies": ["PRM-101", "PRM-402"],
  "documentation_refs": ["EDT-001", "EDT-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                               | توسط        |
| ----------- | ---------- | ----------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — تجزیه اهداف استراتژیک | معمار سیستم |
