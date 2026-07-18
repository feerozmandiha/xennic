# Research Planning Strategy — استراتژی برنامه‌ریزی پژوهش

> **شناسه:** PRM-420
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Knowledge Architect
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [ARCH-012](../00-ARCHITECTURE/12-knowledge-model.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                      |
| ------------------ | -------------------------- |
| **id**             | PRM-420                    |
| **name_fa**        | استراتژی برنامه‌ریزی پژوهش |
| **name_en**        | Research Planning Strategy |
| **family**         | FAM-KNW                    |
| **subfamily**      | KNW-RSR                    |
| **type**           | PT-04                      |
| **complexity**     | C-2                        |
| **authority**      | A-3                        |
| **owner**          | Knowledge Architect        |
| **version**        | 1.0.0-draft                |
| **status**         | draft                      |
| **security_level** | SL-02                      |

---

## 2. Purpose

PRM-420 نخستین پرامپت زنجیره KNW-RSR. استراتژی پژوهش را بر اساس نیاز مصرف‌کننده تعریف می‌کند: دامنه، اهداف، سؤالات پژوهش و جدول زمانی.

### اصول برنامه‌ریزی

| ID    | اصل                                        |
| ----- | ------------------------------------------ |
| RP-01 | اهداف پژوهش با نیاز مصرف‌کننده همخوان باشد |
| RP-02 | سؤالات پژوهش مشخص و قابل پاسخ باشند        |

---

## 3. Scope

### Inside Scope

| حوزه               | توضیح         |
| ------------------ | ------------- |
| تعریف دامنه پژوهش  | محدوده موضوعی |
| تعریف سؤالات پژوهش | سؤالات کلیدی  |

### Outside Scope

| حوزه           | دلیل         |
| -------------- | ------------ |
| انتخاب منبع    | حوزه PRM-421 |
| جمع‌آوری شواهد | حوزه PRM-422 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                       | نوع مصرف  |
| ------------------ | ------------------------- | --------- |
| AI-013 (Research)  | تعریف استراتژی پژوهش      | Chain     |
| AI-011 (Knowledge) | مصرف استراتژی             | Secondary |
| AI-001 (Strategy)  | مصرف برای تحلیل استراتژیک | Secondary |
| AI-002 (Planning)  | مصرف برای برنامه‌ریزی     | Secondary |

---

## 5. Inputs

| ورودی              | نوع    | منبع     | اجباری |
| ------------------ | ------ | -------- | ------ |
| `research_request` | object | AI-013   | بله    |
| `domain_reference` | object | ARCH-012 | بله    |

---

## 6. Outputs

| خروجی                | نوع     | توضیح             |
| -------------------- | ------- | ----------------- |
| `research_plan`      | object  | برنامه پژوهش کامل |
| `research_questions` | array   | سؤالات پژوهش      |
| `planning_complete`  | boolean | وضعیت تکمیل       |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "ARCH-012",
        "scope": ["knowledge-domains"],
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

| منبع     | دامنه          | کاربرد             |
| -------- | -------------- | ------------------ |
| ARCH-012 | دامنه‌های دانش | تعریف محدوده پژوهش |

---

## 9. Prompt Structure

PRM-420 نخستین گام زنجیره KNW-RSR. برنامه پژوهش را تعریف می‌کند.

```
research_request → PRM-420 → research_plan → PRM-421
```

---

## 10. Variable Definitions

| متغیر              | نوع    | اجباری | توضیح                       | اعتبارسنجی |
| ------------------ | ------ | ------ | --------------------------- | ---------- |
| `research_request` | VAR-06 | بله    | درخواست پژوهش از مصرف‌کننده | —          |
| `domain_reference` | VAR-03 | بله    | دامنه دانش از ARCH-012      | —          |

---

## 11. Execution Constraints

| ID     | محدودیت                              |
| ------ | ------------------------------------ |
| CST-01 | اهداف با نیاز مصرف‌کننده همخوان باشد |
| CST-02 | سؤالات پژوهش قابل پاسخ باشند         |

---

## 12. Validation Rules

| ID     | قاعده                     | سطح    | نقض     |
| ------ | ------------------------- | ------ | ------- |
| VAL-01 | سؤالات پژوهش مشخص هستند   | معماری | عدم ثبت |
| VAL-02 | دامنه پژوهش تعریف شده است | معماری | هشدار   |

---

## 13. Failure Conditions

| شرط                  | اقدام                            |
| -------------------- | -------------------------------- |
| درخواست پژوهش نامشخص | بازگشت error + درخواست شفاف‌سازی |

---

## 14. Quality Gates

| گیت   | مکان              | معیار          | مسئول               |
| ----- | ----------------- | -------------- | ------------------- |
| QG-01 | Draft → Review    | هویت کامل      | خودکار              |
| QG-02 | Review → Approved | برنامه کامل    | Knowledge Architect |
| QG-03 | Approved → Active | ثبت در PRM-001 | Registry Keeper     |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                    | توسط        |
| ----------- | ---------- | ---------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — استراتژی برنامه‌ریزی پژوهش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-420",
  "name": "Research Planning Strategy",
  "family": "FAM-KNW",
  "subfamily": "KNW-RSR",
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
  "sources": [{ "type": "CTX-02", "source": "ARCH-012", "required": true }],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "research_request", "type": "VAR-06", "required": true },
    { "id": "domain_reference", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["research_request", "domain_reference"],
    "optional": []
  },
  "output": {
    "required": ["research_plan", "planning_complete"],
    "optional": ["research_questions"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Research questions are specified", "severity": "error" },
    { "id": "VAL-02", "description": "Research domain defined", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-013", "AI-011", "AI-001", "AI-002"],
  "dependencies": [],
  "documentation_refs": ["ARCH-012"]
}
```
