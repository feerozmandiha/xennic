# Executive Response Generation — تولید پاسخ اجرایی

> **شناسه:** PRM-105
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** System Architect
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-103](./14-decision-framing.md), [PRM-104](./16-governance-compliance.md), [PRM-401](../35-PROMPTS/40-brand-voice-context.md), [AI-014](../40-AI-AGENTS/99-enterprise-ai-orchestrator.md), [BRD-002](../22-BRAND/20-brand-voice.md), [ARCH-032](../00-ARCHITECTURE/32-ai-governance.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                         |
| ------------------ | ----------------------------- |
| **id**             | PRM-105                       |
| **name_fa**        | تولید پاسخ اجرایی             |
| **name_en**        | Executive Response Generation |
| **family**         | FAM-STR                       |
| **subfamily**      | STR-PLN                       |
| **type**           | PT-02                         |
| **complexity**     | C-3                           |
| **authority**      | A-4                           |
| **owner**          | System Architect              |
| **version**        | 1.0.0-draft                   |
| **status**         | draft                         |
| **security_level** | SL-04                         |

---

## 2. Purpose

PRM-105 دستورالعمل تولید پاسخ‌های اجرایی سطح بالا را برای AI-014 (Orchestrator) تعریف می‌کند. این پرامپت برای شرایطی طراحی شده است که Orchestrator نیاز به ارائه گزارش، خلاصه یا توصیه به مدیریت ارشد یا ذی‌نفعان خارجی دارد.

### اصول پاسخ اجرایی

| ID    | اصل                                                       |
| ----- | --------------------------------------------------------- |
| ER-01 | پاسخ باید مختصر، دقیق و مبتنی بر داده باشد                |
| ER-02 | لحن پاسخ باید Executive-level (A-4) با رعایت BRD-002 باشد |
| ER-03 | همه ادعاها باید به منبع مشخص (PRM, AI, KNW) ارجاع دهند    |
| ER-04 | توصیه‌ها باید با تحلیل cost-benefit همراه باشند           |
| ER-05 | پاسخ باید شامل action items با ownership مشخص باشد        |

---

## 3. Scope

### Inside Scope

| حوزه                     | توضیح                                  |
| ------------------------ | -------------------------------------- |
| Executive Summary        | خلاصه اجرایی وضعیت، تصمیمات و توصیه‌ها |
| Strategic Recommendation | توصیه‌های استراتژیک با مستندات         |
| Status Report            | گزارش وضعیت پیشرفت اهداف استراتژیک     |
| Escalation Report        | گزارش موارد نیازمند تصمیم مدیریت ارشد  |
| Risk Communication       | ارتباط ریسک‌های شناسایی‌شده با راهکار  |

### Outside Scope

| حوزه                   | دلیل                  |
| ---------------------- | --------------------- |
| تولید محتوای بازاریابی | حوزه PRM-201, PRM-301 |
| پاسخ به جامعه          | حوزه PRM-303          |
| تحلیل فنی              | حوزه AI-010           |

---

## 4. Prompt Category

| دسته                    | مقدار                                        |
| ----------------------- | -------------------------------------------- |
| **Family**              | FAM-STR (Strategic)                          |
| **Subfamily**           | STR-PLN (Planning)                           |
| **Type**                | PT-02 (Instruction)                          |
| **Composition Pattern** | CP-04 (Conditional) — نوع پاسخ بر اساس مخاطب |
| **Layer**               | PLYR-01 (Governance)                         |

---

## 5. Supported Agents

| Agent                     | نقش                                | نوع مصرف    |
| ------------------------- | ---------------------------------- | ----------- |
| AI-014 (Orchestrator)     | تنها اجراکننده — تولید پاسخ اجرایی | Instruction |
| AI-001 (Content Strategy) | تأمین بافت استراتژیک (اختیاری)     | Reference   |

---

## 6. Supported Automation

| Workflow       | مصرف                          |
| -------------- | ----------------------------- |
| AUT-Escalation | تولید خودکار گزارش Escalation |
| AUT-Reporting  | تولید گزارش وضعیت اجرایی      |

---

## 7. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "AI-014 Session",
        "scope": ["session-summary", "execution-log", "agent-reports"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-401",
        "scope": ["voice-dimensions", "tone-mode"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-06",
        "source": "ARCH-032",
        "scope": ["ai-governance-rules", "reporting-obligations"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "AI-010 Output",
        "scope": ["kpi-dashboard", "performance-summary", "trend-report"],
        "injection": "prepend",
        "required": false
      }
    ],
    "max_tokens": 4500,
    "priority": "critical"
  }
}
```

---

## 8. Required Knowledge

| منبع     | دامنه               | کاربرد                     |
| -------- | ------------------- | -------------------------- |
| BRD-002  | صدای برند           | لحن و سبک پاسخ اجرایی      |
| ARCH-001 | معماری سیستم        | ارجاع به ساختار SMOS       |
| CON-000  | قانون اساسی         | اصول در پاسخ‌های استراتژیک |
| AI-014   | مشخصات Orchestrator | مرزهای اختیار در پاسخ      |

---

## 9. Required Variables

| متغیر               | نوع    | اجباری | توضیح                    | اعتبارسنجی                                                                                  |
| ------------------- | ------ | ------ | ------------------------ | ------------------------------------------------------------------------------------------- |
| `response_type`     | VAR-04 | بله    | نوع پاسخ اجرایی          | members: [executive_summary, status_report, recommendation, escalation, risk_communication] |
| `target_audience`   | VAR-04 | بله    | مخاطب پاسخ               | members: [ceo, board, investor, partner, public]                                            |
| `session_data`      | VAR-06 | بله    | داده جلسه جاری از AI-014 | —                                                                                           |
| `urgency_level`     | VAR-04 | خیر    | سطح فوریت                | members: [routine, important, critical], default: routine                                   |
| `format_preference` | VAR-04 | خیر    | فرمت خروجی               | members: [narrative, bulleted, structured, memo], default: structured                       |

---

## 10. Prompt Constraints

| ID     | محدودیت                                                              |
| ------ | -------------------------------------------------------------------- |
| CST-01 | حداکثر ۱۰۰۰ کلمه برای executive_summary                              |
| CST-02 | هر توصیه باید شامل rationale و impact باشد                           |
| CST-03 | Action items باید دارای owner و deadline باشند                       |
| CST-04 | پاسخ‌های سطح critical باید副本 به Governance Board ارسال شوند        |
| CST-05 | پاسخ عمومی (public) باید با PRM-401 و BRD-002 مطابقت کامل داشته باشد |

---

## 11. Prompt Composition

| الگو        | شناسه | شرح                                                    |
| ----------- | ----- | ------------------------------------------------------ |
| Conditional | CP-04 | مسیرهای مختلف بر اساس response_type و target_audience  |
| Sequential  | CP-01 | PRM-103 → PRM-104 → PRM-105 (زنجیره تصمیم→انطباق→پاسخ) |

---

## 12. Input Contract

| ورودی               | نوع    | منبع           | اجباری |
| ------------------- | ------ | -------------- | ------ |
| `response_type`     | enum   | انسان / AI-014 | بله    |
| `target_audience`   | enum   | انسان / AI-014 | بله    |
| `session_data`      | object | AI-014         | بله    |
| `urgency_level`     | enum   | انسان          | خیر    |
| `format_preference` | enum   | انسان          | خیر    |

---

## 13. Output Contract

| خروجی                 | نوع    | توضیح                       |
| --------------------- | ------ | --------------------------- |
| `executive_response`  | object | پاسخ اجرایی نهایی           |
| `response_summary`    | string | خلاصه یک‌خطی پاسخ           |
| `key_recommendations` | array  | توصیه‌های کلیدی با اولویت   |
| `action_items`        | array  | اقدامات با owner و deadline |
| `supporting_data`     | array  | داده‌ها و ارجاعات پشتیبان   |

---

## 14. Validation Rules

| ID     | قاعده                                | سطح    | نقض     |
| ------ | ------------------------------------ | ------ | ------- |
| VAL-01 | پاسخ ≤ ۱۰۰۰ کلمه (executive_summary) | معماری | هشدار   |
| VAL-02 | هر توصیه دارای rationale             | معماری | هشدار   |
| VAL-03 | Action items دارای owner + deadline  | معماری | هشدار   |
| VAL-04 | پاسخ public مطابق BRD-002            | معماری | عدم ثبت |
| VAL-05 | ارجاع به منبع برای داده‌های عددی     | معماری | هشدار   |
| VAL-06 | پاسخ‌های A-4 نیازمند human review    | معماری | عدم ثبت |

---

## 15. Quality Gates

| گیت   | مکان              | معیار                                        | مسئول            |
| ----- | ----------------- | -------------------------------------------- | ---------------- |
| QG-01 | Draft → Review    | هویت کامل، session_data معتبر                | خودکار           |
| QG-02 | Review → Approved | انطباق با BRD-002, ARCH-032, AI-014          | Prompt Architect |
| QG-03 | Approved → Active | ADR (A-4), ثبت در PRM-001, تأیید مدیریت ارشد | Registry Keeper  |

---

## 16. Security Considerations

| ID     | ملاحظه                                                           |
| ------ | ---------------------------------------------------------------- |
| SEC-01 | پاسخ‌های اجرایی SL-04 (Restricted) — بالاترین سطح امنیتی         |
| SEC-02 | پاسخ عمومی (public) نباید حاوی اطلاعات محرمانه باشد              |
| SEC-03 | پاسخ‌های board/ceo باید رمزنگاری‌شده تحویل شوند                  |
| SEC-04 | همه پاسخ‌های اجرایی باید در audit log ثبت شوند                   |
| SEC-05 | پاسخ‌های critical باید رسید تحویل (delivery receipt) داشته باشند |

---

## 17. Cross References

| سند                                                                      | رابطه                               |
| ------------------------------------------------------------------------ | ----------------------------------- |
| [PRM-103](./14-decision-framing.md)                                      | upstream — داده تصمیمات برای پاسخ   |
| [PRM-104](./16-governance-compliance.md)                                 | upstream — تأیید انطباق قبل از پاسخ |
| [AI-014](../40-AI-AGENTS/99-enterprise-ai-orchestrator.md)               | reference — مشخصات Orchestrator     |
| [AI-010](../40-AI-AGENTS/80-analytics-performance-intelligence-agent.md) | reference — داده عملکرد             |
| [BRD-002](../22-BRAND/20-brand-voice.md)                                 | reference — لحن اجرایی              |
| [ARCH-032](../00-ARCHITECTURE/32-ai-governance.md)                       | reference — حکمرانی پاسخ            |

---

## 18. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-105",
  "name": "Executive Response Generation",
  "family": "FAM-STR",
  "subfamily": "STR-PLN",
  "type": "PT-02",
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
    { "type": "CTX-04", "source": "AI-014", "required": true },
    { "type": "CTX-02", "source": "PRM-401", "required": true },
    { "type": "CTX-06", "source": "ARCH-032", "required": true },
    { "type": "CTX-04", "source": "AI-010", "required": false }
  ],
  "max_tokens": 4500,
  "priority": "critical"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    {
      "id": "response_type",
      "type": "VAR-04",
      "required": true,
      "members": [
        "executive_summary",
        "status_report",
        "recommendation",
        "escalation",
        "risk_communication"
      ]
    },
    {
      "id": "target_audience",
      "type": "VAR-04",
      "required": true,
      "members": ["ceo", "board", "investor", "partner", "public"]
    },
    { "id": "session_data", "type": "VAR-06", "required": true },
    {
      "id": "urgency_level",
      "type": "VAR-04",
      "required": false,
      "members": ["routine", "important", "critical"],
      "default": "routine"
    },
    {
      "id": "format_preference",
      "type": "VAR-04",
      "required": false,
      "members": ["narrative", "bulleted", "structured", "memo"],
      "default": "structured"
    }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["response_type", "target_audience", "session_data"],
    "optional": ["urgency_level", "format_preference"]
  },
  "output": {
    "required": ["executive_response", "response_summary", "key_recommendations"],
    "optional": ["action_items", "supporting_data"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Response ≤ 1000 words", "severity": "warning" },
    { "id": "VAL-02", "description": "Each recommendation has rationale", "severity": "warning" },
    { "id": "VAL-04", "description": "Public response → BRD-002 compliance", "severity": "error" },
    {
      "id": "VAL-05",
      "description": "Data references for numerical claims",
      "severity": "warning"
    },
    { "id": "VAL-06", "description": "A-4 responses need human review", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-04",
  "consumers": ["AI-014"],
  "dependencies": ["PRM-103", "PRM-104", "PRM-401", "ARCH-032"],
  "documentation_refs": ["AI-014", "BRD-002", "CON-000", "ARCH-001"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                           | توسط        |
| ----------- | ---------- | ------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — تولید پاسخ اجرایی | معمار سیستم |
