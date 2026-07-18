# Enterprise Strategic Planning — برنامه‌ریزی استراتژیک سازمانی

> **شناسه:** PRM-101
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Content Strategist
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-401](../35-PROMPTS/40-brand-voice-context.md), [PRM-402](../35-PROMPTS/42-content-taxonomy-context.md), [ARCH-001](../00-ARCHITECTURE/01-system-overview.md), [ARCH-020](../00-ARCHITECTURE/20-multi-platform-strategy.md), [EDT-001](../24-EDITORIAL/10-content-guidelines.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                         |
| ------------------ | ----------------------------- |
| **id**             | PRM-101                       |
| **name_fa**        | برنامه‌ریزی استراتژیک سازمانی |
| **name_en**        | Enterprise Strategic Planning |
| **family**         | FAM-STR                       |
| **subfamily**      | STR-PLN                       |
| **type**           | PT-02                         |
| **complexity**     | C-3                           |
| **authority**      | A-3                           |
| **owner**          | Content Strategist            |
| **version**        | 1.0.0-draft                   |
| **status**         | draft                         |
| **security_level** | SL-03                         |

---

## 2. Purpose

PRM-101 دستورالعمل برنامه‌ریزی استراتژیک محتوای سازمانی را برای Agentهای استراتژیک SMOS تعریف می‌کند. این پرامپت فرایند تدوین استراتژی محتوا را از تحلیل وضعیت موجود تا تعیین اهداف و مسیرهای استراتژیک هدایت می‌کند.

### اصول برنامه‌ریزی

| ID    | اصل                                                                             |
| ----- | ------------------------------------------------------------------------------- |
| SP-01 | استراتژی باید مبتنی بر داده و تحلیل باشد نه شهود                                |
| SP-02 | اهداف باید SMART (Specific, Measurable, Achievable, Relevant, Time-bound) باشند |
| SP-03 | استراتژی باید با DNA برند (نور، نیرو، یکتا) همخوانی داشته باشد                  |
| SP-04 | استراتژی باید برای همه پلتفرم‌ها قابل اجرا باشد                                 |
| SP-05 | استراتژی باید دارای افق زمانی (quarterly, annual) مشخص باشد                     |

---

## 3. Scope

### Inside Scope

| حوزه                    | توضیح                                           |
| ----------------------- | ----------------------------------------------- |
| تحلیل وضعیت موجود محتوا | ارزیابی عملکرد جاری در همه پلتفرم‌ها            |
| تعیین اهداف استراتژیک   | اهداف کمی و کیفی برای افق زمانی مشخص            |
| تعیین مسیرهای استراتژیک | اولویت‌های محتوایی، پلتفرمی و مخاطبی            |
| تخصیص منابع             | پیشنهاد تخصیص بودجه محتوا، نیروی انسانی و ابزار |
| تعیین KPIهای استراتژیک  | شاخص‌های کلیدی عملکرد در سطح استراتژیک          |

### Outside Scope

| حوزه                               | دلیل                              |
| ---------------------------------- | --------------------------------- |
| برنامه‌ریزی عملیاتی (ماهانه/هفتگی) | حوزه PRM-102 (Goal Decomposition) |
| تصمیم‌گیری تاکتیکی                 | حوزه PRM-103 (Decision Framing)   |
| اجرای محتوا                        | حوزه PRM-201 (Content Production) |
| جزئیات پلتفرمی                     | حوزه PLAT-\*                      |

---

## 4. Prompt Category

| دسته                    | مقدار                                               |
| ----------------------- | --------------------------------------------------- |
| **Family**              | FAM-STR (Strategic)                                 |
| **Subfamily**           | STR-PLN (Planning)                                  |
| **Type**                | PT-02 (Instruction)                                 |
| **Composition Pattern** | CP-01 (Sequential) — بعد از PRM-402, قبل از PRM-102 |
| **Layer**               | PLYR-01 (Governance)                                |

---

## 5. Supported Agents

| Agent                     | نقش                             | نوع مصرف      |
| ------------------------- | ------------------------------- | ------------- |
| AI-001 (Content Strategy) | اجراکننده اصلی — تدوین استراتژی | Instruction   |
| AI-014 (Orchestrator)     | مسیریابی و هماهنگی              | Orchestration |

---

## 6. Supported Automation

| Workflow             | مصرف                                  |
| -------------------- | ------------------------------------- |
| AUT-Content Pipeline | تأمین استراتژی برای خط لوله محتوا     |
| AUT-Reporting        | تأمین اهداف استراتژیک برای گزارش‌گیری |

---

## 7. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-402",
        "scope": ["content-categories", "ct-id-matrix", "platform-compatibility"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-401",
        "scope": ["brand-dna", "voice-dimensions"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "AI-010 Output",
        "scope": ["performance-history", "trend-data", "kpi-summary"],
        "injection": "prepend",
        "required": false
      },
      {
        "type": "CTX-04",
        "source": "AI-013 Output",
        "scope": ["market-research", "competitor-analysis", "trend-report"],
        "injection": "prepend",
        "required": false
      }
    ],
    "max_tokens": 4000,
    "priority": "high"
  }
}
```

---

## 8. Required Knowledge

| منبع     | دامنه               | کاربرد               |
| -------- | ------------------- | -------------------- |
| ARCH-001 | معماری سیستم        | درک ساختار SMOS      |
| ARCH-020 | استراتژی چندپلتفرمی | جهت‌گیری پلتفرمی     |
| EDT-001  | ECOS                | چرخه حیات محتوا      |
| EDT-002  | تاکسونومی محتوا     | طبقه‌بندی برای تحلیل |
| BRD-002  | صدای برند           | انطباق استراتژیک     |
| PLAT-\*  | مشخصات پلتفرم‌ها    | محدودیت‌ها و فرصت‌ها |

---

## 9. Required Variables

| متغیر                   | نوع    | اجباری | توضیح                    | اعتبارسنجی                                                                                  |
| ----------------------- | ------ | ------ | ------------------------ | ------------------------------------------------------------------------------------------- |
| `planning_horizon`      | VAR-04 | بله    | افق زمانی استراتژی       | members: [quarterly, annual, biennial]                                                      |
| `strategic_goals`       | VAR-07 | بله    | اهداف استراتژیک سطح بالا | item_type: VAR-01, max_items: 5, min_items: 1                                               |
| `current_state_summary` | VAR-01 | خیر    | خلاصه وضعیت موجود        | max_length: 2000                                                                            |
| `budget_constraints`    | VAR-06 | خیر    | محدودیت‌های بودجه‌ای     | —                                                                                           |
| `priority_platforms`    | VAR-07 | بله    | پلتفرم‌های اولویت‌دار    | item_type: VAR-04, members: [website, instagram, linkedin, telegram, youtube, aparat, bale] |

---

## 10. Prompt Constraints

| ID     | محدودیت                                            |
| ------ | -------------------------------------------------- |
| CST-01 | اهداف استراتژیک حداکثر ۵ عدد                       |
| CST-02 | هر هدف باید شامل KPI قابل اندازه‌گیری باشد         |
| CST-03 | استراتژی باید حداقل ۳ مسیر استراتژیک داشته باشد    |
| CST-04 | استراتژی نباید به ابزار یا پلتفرم خاصی وابسته باشد |
| CST-05 | انحراف از DNA برند در اهداف استراتژیک ممنوع        |

---

## 11. Prompt Composition

```
PRM-101 ← PRM-402 (Content Taxonomy Context)
       ← PRM-401 (Brand Voice Context)
       ← AI-010 Output (Performance Data)
       → PRM-102 (Goal Decomposition)
```

| الگو       | شناسه | شرح                             |
| ---------- | ----- | ------------------------------- |
| Sequential | CP-01 | PRM-101 → PRM-102 (تجزیه اهداف) |

---

## 12. Input Contract

| ورودی                   | نوع    | منبع           | اجباری |
| ----------------------- | ------ | -------------- | ------ |
| `planning_horizon`      | enum   | انسان / AI-014 | بله    |
| `strategic_goals`       | array  | انسان / AI-014 | بله    |
| `current_state_summary` | string | AI-010         | خیر    |
| `budget_constraints`    | object | انسان          | خیر    |
| `priority_platforms`    | array  | انسان          | بله    |

---

## 13. Output Contract

| خروجی                  | نوع    | توضیح                                  |
| ---------------------- | ------ | -------------------------------------- |
| `strategy_document`    | object | سند استراتژی شامل اهداف، مسیرها، KPIها |
| `strategic_objectives` | array  | لیست اهداف استراتژیک با KPI            |
| `strategic_pathways`   | array  | مسیرهای استراتژیک با اولویت            |
| `resource_allocation`  | object | پیشنهاد تخصیص منابع                    |
| `risk_assessment`      | array  | ریسک‌های استراتژیک و راهکار            |

---

## 14. Validation Rules

| ID     | قاعده                  | سطح    | نقض     |
| ------ | ---------------------- | ------ | ------- |
| VAL-01 | اهداف حداکثر ۵ عدد     | معماری | هشدار   |
| VAL-02 | هر هدف دارای KPI کمی   | معماری | هشدار   |
| VAL-03 | حداقل ۳ مسیر استراتژیک | معماری | هشدار   |
| VAL-04 | انطباق با DNA برند     | معماری | عدم ثبت |
| VAL-05 | افق زمانی معتبر        | معماری | عدم ثبت |
| VAL-06 | سازگاری با EDT-002     | معماری | هشدار   |

---

## 15. Quality Gates

| گیت   | مکان              | معیار                                | مسئول           |
| ----- | ----------------- | ------------------------------------ | --------------- |
| QG-01 | Draft → Review    | هویت کامل، متغیرها تعریف‌شده         | خودکار          |
| QG-02 | Review → Approved | انطباق با PRM-000, ARCH-001, BRD-002 | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR برای A-3         | Registry Keeper |

---

## 16. Security Considerations

| ID     | ملاحظه                                                                  |
| ------ | ----------------------------------------------------------------------- |
| SEC-01 | استراتژی محتوا SL-03 (Confidential) — دسترسی محدود به نقش‌های استراتژیک |
| SEC-02 | اهداف تجاری نباید در خروجی‌های عمومی فاش شوند                           |
| SEC-03 | داده‌های عملکرد رقبا نباید در سند استراتژی ذخیره شوند                   |

---

## 17. Cross References

| سند                                                          | رابطه                                      |
| ------------------------------------------------------------ | ------------------------------------------ |
| [PRM-102](./12-goal-decomposition.md)                        | downstream — خروجی به PRM-102 می‌رود       |
| [PRM-401](./40-brand-voice-context.md)                       | upstream — بافت برند را دریافت می‌کند      |
| [PRM-402](./42-content-taxonomy-context.md)                  | upstream — بافت تاکسونومی را دریافت می‌کند |
| [ARCH-001](../00-ARCHITECTURE/01-system-overview.md)         | reference — معماری سیستم                   |
| [ARCH-020](../00-ARCHITECTURE/20-multi-platform-strategy.md) | reference — استراتژی چندپلتفرمی            |
| [EDT-001](../24-EDITORIAL/10-content-guidelines.md)          | reference — چرخه حیات محتوا                |

---

## 18. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-101",
  "name": "Enterprise Strategic Planning",
  "family": "FAM-STR",
  "subfamily": "STR-PLN",
  "type": "PT-02",
  "complexity": "C-3",
  "authority": "A-3",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [
    { "type": "CTX-02", "source": "PRM-402", "required": true },
    { "type": "CTX-02", "source": "PRM-401", "required": true },
    { "type": "CTX-04", "source": "AI-010", "required": false },
    { "type": "CTX-04", "source": "AI-013", "required": false }
  ],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    {
      "id": "planning_horizon",
      "type": "VAR-04",
      "required": true,
      "members": ["quarterly", "annual", "biennial"]
    },
    { "id": "strategic_goals", "type": "VAR-07", "required": true, "max_items": 5 },
    { "id": "current_state_summary", "type": "VAR-01", "required": false, "max_length": 2000 },
    { "id": "budget_constraints", "type": "VAR-06", "required": false },
    { "id": "priority_platforms", "type": "VAR-07", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["planning_horizon", "strategic_goals", "priority_platforms"],
    "optional": ["current_state_summary", "budget_constraints"]
  },
  "output": {
    "required": ["strategy_document", "strategic_objectives", "strategic_pathways"],
    "optional": ["resource_allocation", "risk_assessment"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Objectives max 5", "severity": "warning" },
    { "id": "VAL-02", "description": "Each objective has measurable KPI", "severity": "warning" },
    { "id": "VAL-03", "description": "Minimum 3 strategic pathways", "severity": "warning" },
    { "id": "VAL-04", "description": "Brand DNA alignment", "severity": "error" },
    { "id": "VAL-05", "description": "Valid planning horizon", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-03",
  "consumers": ["AI-001", "AI-014"],
  "dependencies": ["PRM-401", "PRM-402"],
  "documentation_refs": ["ARCH-001", "ARCH-020", "EDT-001"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                       | توسط        |
| ----------- | ---------- | ------------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — برنامه‌ریزی استراتژیک سازمانی | معمار سیستم |
