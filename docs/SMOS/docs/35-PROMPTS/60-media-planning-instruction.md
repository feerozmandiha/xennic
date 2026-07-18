# Media Planning Instruction — برنامه‌ریزی تولید دارایی رسانه

> **شناسه:** PRM-230
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Media Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-402](./42-content-taxonomy-context.md), [PRM-401](./40-brand-voice-context.md), [EDT-002](../24-EDITORIAL/20-content-taxonomy.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                          |
| ------------------ | ------------------------------ |
| **id**             | PRM-230                        |
| **name_fa**        | برنامه‌ریزی تولید دارایی رسانه |
| **name_en**        | Media Planning Instruction     |
| **family**         | FAM-CON                        |
| **subfamily**      | CON-MED                        |
| **type**           | PT-04                          |
| **complexity**     | C-2                            |
| **authority**      | A-3                            |
| **owner**          | Media Producer                 |
| **version**        | 1.0.0-draft                    |
| **status**         | draft                          |
| **security_level** | SL-02                          |

---

## 2. Purpose

PRM-230 برنامه‌ریزی سازمانی تولید دارایی رسانه را تعریف می‌کند. این پرامپت اهداف رسانه‌ای، انتخاب دارایی، سلسله‌مراتب رسانه، اولویت‌های تولید و نگاشت وابستگی‌ها را مشخص می‌کند.

### اصول برنامه‌ریزی رسانه

| ID    | اصل                                                             |
| ----- | --------------------------------------------------------------- |
| MP-01 | هر دارایی رسانه باید هدف مشخصی در استراتژی محتوا داشته باشد     |
| MP-02 | انتخاب نوع دارایی باید با CT-ID و پلتفرم هدف همخوانی داشته باشد |
| MP-03 | سلسله‌مراتب رسانه باید قابل ردیابی به سند استراتژی باشد         |
| MP-04 | اولویت‌های تولید باید با تقویم تحریریه هماهنگ باشد              |

---

## 3. Scope

### Inside Scope

| حوزه              | توضیح                                  |
| ----------------- | -------------------------------------- |
| اهداف رسانه‌ای    | تعریف هدف هر دارایی در زنجیره محتوا    |
| انتخاب دارایی     | تعیین نوع دارایی رسانه متناسب با محتوا |
| سلسله‌مراتب رسانه | روابط parent/child بین دارایی‌ها       |
| اولویت‌های تولید  | تخصیص اولویت بر اساس تقویم و وابستگی   |
| نگاشت وابستگی     | وابستگی‌های بین دارایی‌های رسانه       |

### Outside Scope

| حوزه                | دلیل                  |
| ------------------- | --------------------- |
| تولید محتوای متعارف | حوزه PRM-201, PRM-203 |
| قواعد ترکیب بصری    | حوزه PRM-231          |
| انطباق برند         | حوزه PRM-232          |
| دسترس‌پذیری         | حوزه PRM-233          |
| آمادگی تولید        | حوزه PRM-234          |

---

## 4. Consumers

| مصرف‌کننده                      | نقش                            | نوع مصرف |
| ------------------------------- | ------------------------------ | -------- |
| AI-006 (Media Asset Production) | برنامه‌ریزی تولید دارایی رسانه | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "AI-002 Output",
        "scope": ["content-calendar", "production-priorities", "content-brief"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-402",
        "scope": ["content-attributes", "ct-id-rules"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PLAT-*",
        "scope": ["platform-media-requirements", "asset-specifications"],
        "injection": "append",
        "required": false
      }
    ],
    "max_tokens": 3000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع    | دامنه     | کاربرد                         |
| ------- | --------- | ------------------------------ |
| EDT-002 | تاکسونومی | تطابق نوع دارایی با CT-ID      |
| PLAT-\* | پلتفرم‌ها | مشخصات فنی دارایی در هر پلتفرم |

---

## 7. Variables

| متغیر              | نوع    | اجباری | توضیح                           | اعتبارسنجی                             |
| ------------------ | ------ | ------ | ------------------------------- | -------------------------------------- |
| `content_brief`    | VAR-06 | بله    | خلاصه محتوایی از AI-002         | —                                      |
| `target_platforms` | VAR-07 | خیر    | پلتفرم‌های هدف برای تطابق ابعاد | —                                      |
| `priority_tier`    | VAR-04 | خیر    | اولویت تولید                    | members: [p0, p1, p2, p3], default: p1 |

---

## 8. Constraints

| ID     | محدودیت                                             |
| ------ | --------------------------------------------------- |
| CST-01 | هر دارایی حداقل یک هدف مشخص دارد                    |
| CST-02 | انتخاب دارایی باید با قابلیت‌های AI-006 سازگار باشد |
| CST-03 | سلسله‌مراتب رسانه باید غیرچرخه‌ای باشد              |

---

## 9. Input Contract

| ورودی              | نوع    | منبع   | اجباری |
| ------------------ | ------ | ------ | ------ |
| `content_brief`    | object | AI-002 | بله    |
| `target_platforms` | array  | AI-006 | خیر    |
| `priority_tier`    | enum   | AI-006 | خیر    |

---

## 10. Output Contract

| خروجی                   | نوع    | توضیح                           |
| ----------------------- | ------ | ------------------------------- |
| `media_plan`            | object | برنامه کامل تولید دارایی رسانه  |
| `asset_goals`           | array  | اهداف هر دارایی رسانه           |
| `production_priorities` | array  | اولویت‌های تولید با وابستگی     |
| `media_hierarchy`       | object | سلسله‌مراتب دارایی‌ها           |
| `dependency_map`        | object | نگاشت وابستگی‌های بین دارایی‌ها |

---

## 11. Validation Rules

| ID     | قاعده                                         | سطح    | نقض     |
| ------ | --------------------------------------------- | ------ | ------- |
| VAL-01 | هر دارایی حداقل یک هدف مشخص دارد              | معماری | هشدار   |
| VAL-02 | انتخاب دارایی با قابلیت‌های AI-006 سازگار است | معماری | عدم ثبت |
| VAL-03 | سلسله‌مراتب رسانه غیرچرخه‌ای                  | معماری | عدم ثبت |
| VAL-04 | اولویت‌ها با تقویم تحریریه هماهنگ است         | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                     | مسئول           |
| ----- | ----------------- | ------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, context معتبر  | خودکار          |
| QG-02 | Review → Approved | انطباق با EDT-002         | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                                 |
| ------- | ------------------- | ------ | ------------------------------------ |
| PRM-402 | DEP-03 (References) | ^1.0.0 | بافت تاکسونومی برای تطابق نوع دارایی |
| PRM-401 | DEP-03 (References) | ^1.0.0 | هماهنگی با صدای برند                 |

---

## 14. Human Override

| سناریو                              | اقدام                         |
| ----------------------------------- | ----------------------------- |
| تعارض اولویت با تقویم تحریریه       | Escalation به Content Planner |
| انتخاب دارایی خارج از قابلیت AI-006 | Escalation به Media Producer  |

---

## 15. Governance Notes

| ID     | یادداشت                                        |
| ------ | ---------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR + تأیید مدیر     |
| GOV-02 | تغییر در اولویت‌بندی نیازمند هماهنگی با AI-002 |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-230",
  "name": "Media Planning Instruction",
  "family": "FAM-CON",
  "subfamily": "CON-MED",
  "type": "PT-04",
  "complexity": "C-2",
  "authority": "A-3",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [
    { "type": "CTX-04", "source": "AI-002 Output", "required": true },
    { "type": "CTX-02", "source": "PRM-402", "required": true },
    { "type": "CTX-02", "source": "PLAT-*", "required": false }
  ],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "content_brief", "type": "VAR-06", "required": true },
    { "id": "target_platforms", "type": "VAR-07", "required": false },
    {
      "id": "priority_tier",
      "type": "VAR-04",
      "required": false,
      "members": ["p0", "p1", "p2", "p3"],
      "default": "p1"
    }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["content_brief"],
    "optional": ["target_platforms", "priority_tier"]
  },
  "output": {
    "required": ["media_plan", "asset_goals", "production_priorities"],
    "optional": ["media_hierarchy", "dependency_map"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    {
      "id": "VAL-01",
      "description": "Each asset has at least one defined goal",
      "severity": "warning"
    },
    {
      "id": "VAL-02",
      "description": "Asset selection compatible with AI-006 capabilities",
      "severity": "error"
    },
    { "id": "VAL-03", "description": "Media hierarchy is acyclic", "severity": "error" },
    {
      "id": "VAL-04",
      "description": "Priorities aligned with editorial calendar",
      "severity": "warning"
    }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-006"],
  "dependencies": ["PRM-402", "PRM-401"],
  "documentation_refs": ["EDT-002", "PLAT-*"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                        | توسط        |
| ----------- | ---------- | -------------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — برنامه‌ریزی تولید دارایی رسانه | معمار سیستم |
