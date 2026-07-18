# Decision Framing — چارچوب‌بندی تصمیمات استراتژیک

> **شناسه:** PRM-103
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Content Strategist
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-101](./10-enterprise-strategic-planning.md), [PRM-102](./12-goal-decomposition.md), [PRM-401](../35-PROMPTS/40-brand-voice-context.md), [ARCH-030](../00-ARCHITECTURE/30-governance-architecture.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                         |
| ------------------ | ----------------------------- |
| **id**             | PRM-103                       |
| **name_fa**        | چارچوب‌بندی تصمیمات استراتژیک |
| **name_en**        | Decision Framing              |
| **family**         | FAM-STR                       |
| **subfamily**      | STR-DEC                       |
| **type**           | PT-07                         |
| **complexity**     | C-3                           |
| **authority**      | A-3                           |
| **owner**          | Content Strategist            |
| **version**        | 1.0.0-draft                   |
| **status**         | draft                         |
| **security_level** | SL-03                         |

---

## 2. Purpose

PRM-103 چارچوب تصمیم‌گیری استراتژیک را برای Agentهای SMOS تعریف می‌کند. این پرامپت از نوع Meta (PT-07) است — نحوه انتخاب و اولویت‌بندی بین گزینه‌های استراتژیک را تعیین می‌کند.

### اصول تصمیم‌گیری

| ID    | اصل                                                         |
| ----- | ----------------------------------------------------------- |
| DF-01 | تصمیمات باید مبتنی بر داده‌های عینی و معیارهای مشخص باشند   |
| DF-02 | هر تصمیم باید دارای trade-off analysis باشد                 |
| DF-03 | ریسک‌ها باید شناسایی، ارزیابی و مستند شوند                  |
| DF-04 | تصمیمات باید قابل ردیابی به اهداف استراتژیک باشند           |
| DF-05 | تصمیمات خارج از مرز اختیار باید به سطح بالاتر Escalate شوند |

---

## 3. Scope

### Inside Scope

| حوزه                              | توضیح                                         |
| --------------------------------- | --------------------------------------------- |
| تحلیل گزینه‌ها (Options Analysis) | ارزیابی گزینه‌های موجود بر اساس معیارهای مشخص |
| Trade-off Analysis                | تحلیل هزینه-فایده و ریسک-بازده                |
| Prioritization                    | اولویت‌بندی گزینه‌ها بر اساس امتیاز مرکب      |
| Recommendation                    | ارائه توصیه نهایی با مستندات                  |
| Escalation Detection              | تشخیص نیاز به ارجاع به انسان                  |

### Outside Scope

| حوزه           | دلیل          |
| -------------- | ------------- |
| تدوین استراتژی | حوزه PRM-101  |
| تجزیه اهداف    | حوزه PRM-102  |
| اجرای تصمیم    | حوزه PRM-201+ |

---

## 4. Prompt Category

| دسته                    | مقدار                                             |
| ----------------------- | ------------------------------------------------- |
| **Family**              | FAM-STR (Strategic)                               |
| **Subfamily**           | STR-DEC (Decision)                                |
| **Type**                | PT-07 (Meta)                                      |
| **Composition Pattern** | CP-04 (Conditional) — مسیرهای مختلف بر اساس تصمیم |
| **Layer**               | PLYR-01 (Governance)                              |

---

## 5. Supported Agents

| Agent                           | نقش                        | نوع مصرف      |
| ------------------------------- | -------------------------- | ------------- |
| AI-001 (Content Strategy)       | تصمیم‌گیری استراتژیک محتوا | Instruction   |
| AI-012 (Continuous Improvement) | تصمیم‌گیری بهینه‌سازی      | Reference     |
| AI-014 (Orchestrator)           | انتخاب مسیر اجرایی         | Orchestration |

---

## 6. Supported Automation

| Workflow             | مصرف                           |
| -------------------- | ------------------------------ |
| AUT-Content Pipeline | تصمیم‌گیری درباره مسیر محتوا   |
| AUT-Approval         | تأمین مستندات تصمیم برای تأیید |

---

## 7. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-102 Output",
        "scope": ["goal-tree", "milestones", "dependency-graph"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-06",
        "source": "ARCH-030",
        "scope": ["authority-boundaries", "decision-framework", "risk-levels"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "AI-010 Output",
        "scope": ["performance-data", "trend-analysis"],
        "injection": "prepend",
        "required": false
      }
    ],
    "max_tokens": 3500,
    "priority": "high"
  }
}
```

---

## 8. Required Knowledge

| منبع     | دامنه           | کاربرد                     |
| -------- | --------------- | -------------------------- |
| ARCH-030 | حکمرانی تصمیمات | مرزهای اختیار و سطوح تصمیم |
| ARCH-032 | حکمرانی AI      | محدودیت‌های خودکاری        |
| CON-000  | قانون اساسی     | اصول عالی تصمیم‌گیری       |

---

## 9. Required Variables

| متغیر               | نوع    | اجباری | توضیح                  | اعتبارسنجی                                    |
| ------------------- | ------ | ------ | ---------------------- | --------------------------------------------- |
| `decision_context`  | VAR-01 | بله    | شرح مسئله و بافت تصمیم | min_length: 50                                |
| `options`           | VAR-07 | بله    | گزینه‌های موجود        | item_type: VAR-06, min_items: 2, max_items: 8 |
| `decision_criteria` | VAR-07 | بله    | معیارهای تصمیم‌گیری    | item_type: VAR-01, min_items: 2, max_items: 7 |
| `authority_level`   | VAR-04 | بله    | سطح اختیار مورد نیاز   | members: [A-0, A-1, A-2, A-3, A-4]            |
| `risk_tolerance`    | VAR-04 | خیر    | تحمل ریسک              | members: [low, medium, high], default: medium |

---

## 10. Prompt Constraints

| ID     | محدودیت                                          |
| ------ | ------------------------------------------------ |
| CST-01 | حداقل ۲ و حداکثر ۸ گزینه برای تصمیم‌گیری         |
| CST-02 | هر معیار باید وزن (۱–۱۰) داشته باشد              |
| CST-03 | تصمیمات A-4 باید به انسان Escalate شوند          |
| CST-04 | Trade-off analysis برای هر گزینه اجباری است      |
| CST-05 | امتیاز نهایی باید به صورت عددی (۰–۱۰۰) ارائه شود |

---

## 11. Prompt Composition

| الگو        | شناسه | شرح                              |
| ----------- | ----- | -------------------------------- |
| Conditional | CP-04 | مسیرهای مختلف بر اساس سطح اختیار |

---

## 12. Input Contract

| ورودی               | نوع    | منبع           | اجباری |
| ------------------- | ------ | -------------- | ------ |
| `decision_context`  | string | انسان / AI-014 | بله    |
| `options`           | array  | انسان / AI-001 | بله    |
| `decision_criteria` | array  | انسان          | بله    |
| `authority_level`   | enum   | AI-014         | بله    |
| `risk_tolerance`    | enum   | انسان          | خیر    |

---

## 13. Output Contract

| خروجی                | نوع     | توضیح                                 |
| -------------------- | ------- | ------------------------------------- |
| `decision_analysis`  | object  | تحلیل کامل شامل امتیازدهی به گزینه‌ها |
| `recommendation`     | object  | توصیه نهایی با امتیاز مرکب            |
| `trade_off_analysis` | array   | تحلیل هزینه-فایده هر گزینه            |
| `risk_assessment`    | array   | ریسک‌های هر گزینه با severity         |
| `escalation_flag`    | boolean | 是否需要 ارجاع به انسان               |

---

## 14. Validation Rules

| ID     | قاعده                    | سطح    | نقض     |
| ------ | ------------------------ | ------ | ------- |
| VAL-01 | حداقل ۲ گزینه            | معماری | عدم ثبت |
| VAL-02 | حداکثر ۸ گزینه           | معماری | هشدار   |
| VAL-03 | همه معیارها دارای وزن    | معماری | هشدار   |
| VAL-04 | A-4 → Escalation         | معماری | عدم ثبت |
| VAL-05 | Trade-off analysis موجود | معماری | هشدار   |
| VAL-06 | امتیاز نهایی ۰–۱۰۰       | معماری | هشدار   |

---

## 15. Quality Gates

| گیت   | مکان              | معیار                        | مسئول           |
| ----- | ----------------- | ---------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل، متغیرها تعریف‌شده | خودکار          |
| QG-02 | Review → Approved | انطباق با ARCH-030, PRM-000  | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)    | Registry Keeper |

---

## 16. Security Considerations

| ID     | ملاحظه                                        |
| ------ | --------------------------------------------- |
| SEC-01 | تحلیل تصمیمات SL-03 — حاوی جهت‌گیری استراتژیک |
| SEC-02 | گزینه‌های ردشده باید در audit log باقی بمانند |
| SEC-03 | Escalation به انسان از کانال امن انجام شود    |

---

## 17. Cross References

| سند                                                          | رابطه                                                     |
| ------------------------------------------------------------ | --------------------------------------------------------- |
| [PRM-101](./10-enterprise-strategic-planning.md)             | upstream                                                  |
| [PRM-102](./12-goal-decomposition.md)                        | upstream                                                  |
| [PRM-104](./16-governance-compliance.md)                     | downstream — تصمیمات باید با governance تطابق داشته باشند |
| [ARCH-030](../00-ARCHITECTURE/30-governance-architecture.md) | reference — چارچوب حکمرانی                                |
| [ARCH-032](../00-ARCHITECTURE/32-ai-governance.md)           | reference — حکمرانی AI                                    |

---

## 18. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-103",
  "name": "Decision Framing",
  "family": "FAM-STR",
  "subfamily": "STR-DEC",
  "type": "PT-07",
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
    { "type": "CTX-04", "source": "PRM-102", "required": true },
    { "type": "CTX-06", "source": "ARCH-030", "required": true },
    { "type": "CTX-04", "source": "AI-010", "required": false }
  ],
  "max_tokens": 3500,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "decision_context", "type": "VAR-01", "required": true, "min_length": 50 },
    { "id": "options", "type": "VAR-07", "required": true, "min_items": 2, "max_items": 8 },
    {
      "id": "decision_criteria",
      "type": "VAR-07",
      "required": true,
      "min_items": 2,
      "max_items": 7
    },
    {
      "id": "authority_level",
      "type": "VAR-04",
      "required": true,
      "members": ["A-0", "A-1", "A-2", "A-3", "A-4"]
    },
    {
      "id": "risk_tolerance",
      "type": "VAR-04",
      "required": false,
      "members": ["low", "medium", "high"],
      "default": "medium"
    }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["decision_context", "options", "decision_criteria", "authority_level"],
    "optional": ["risk_tolerance"]
  },
  "output": {
    "required": ["decision_analysis", "recommendation", "trade_off_analysis", "escalation_flag"],
    "optional": ["risk_assessment"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Minimum 2 options", "severity": "error" },
    { "id": "VAL-02", "description": "Maximum 8 options", "severity": "warning" },
    { "id": "VAL-04", "description": "A-4 requires escalation", "severity": "error" },
    { "id": "VAL-05", "description": "Trade-off analysis required", "severity": "warning" },
    { "id": "VAL-06", "description": "Final score 0-100", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-03",
  "consumers": ["AI-001", "AI-012", "AI-014"],
  "dependencies": ["PRM-101", "PRM-102", "ARCH-030"],
  "documentation_refs": ["ARCH-030", "ARCH-032", "CON-000"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                       | توسط        |
| ----------- | ---------- | ------------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — چارچوب‌بندی تصمیمات استراتژیک | معمار سیستم |
