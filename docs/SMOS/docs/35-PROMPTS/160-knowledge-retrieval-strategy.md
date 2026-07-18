# Knowledge Retrieval Strategy — استراتژی بازیابی دانش

> **شناسه:** PRM-403
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Knowledge Architect
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [ARCH-012](../00-ARCHITECTURE/12-knowledge-model.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                        |
| ------------------ | ---------------------------- |
| **id**             | PRM-403                      |
| **name_fa**        | استراتژی بازیابی دانش        |
| **name_en**        | Knowledge Retrieval Strategy |
| **family**         | FAM-KNW                      |
| **subfamily**      | KNW-RTR                      |
| **type**           | PT-04                        |
| **complexity**     | C-2                          |
| **authority**      | A-3                          |
| **owner**          | Knowledge Architect          |
| **version**        | 1.0.0-draft                  |
| **status**         | draft                        |
| **security_level** | SL-02                        |

---

## 2. Purpose

PRM-403 نخستین پرامپت در زنجیره KNW-RTR است. استراتژی بازیابی دانش سازمانی را بر اساس نیازهای مصرف‌کننده تعریف می‌کند: منابع هدف، عمق بازیابی، محدوده زمانی و فیلترهای اولیه.

### اصول بازیابی

| ID    | اصل                                                  |
| ----- | ---------------------------------------------------- |
| KR-01 | استراتژی بازیابی باید با نیاز مصرف‌کننده همخوان باشد |
| KR-02 | منابع دانش باید اولویت‌بندی شوند                     |
| KR-03 | محدوده زمانی باید مشخص و قابل توجیه باشد             |

---

## 3. Scope

### Inside Scope

| حوزه           | توضیح                               |
| -------------- | ----------------------------------- |
| تعریف استراتژی | انتخاب رویکرد بازیابی (دقیق/گسترده) |
| اولویت منابع   | تعیین تقدم منابع دانشی              |
| محدوده زمانی   | تعیین بازه زمانی بازیابی            |

### Outside Scope

| حوزه         | دلیل         |
| ------------ | ------------ |
| انتخاب منبع  | حوزه PRM-404 |
| استخراج دانش | حوزه PRM-405 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                            | نوع مصرف  |
| ------------------ | ------------------------------ | --------- |
| AI-011 (Knowledge) | تعریف استراتژی بازیابی         | Chain     |
| AI-010 (Analytics) | مصرف استراتژی برای تحلیل       | Secondary |
| AI-001 (Strategy)  | مصرف استراتژی برای برنامه‌ریزی | Secondary |
| AI-002 (Planning)  | مصرف استراتژی برای برنامه‌ریزی | Secondary |

---

## 5. Inputs

| ورودی               | نوع    | منبع   | اجباری |
| ------------------- | ------ | ------ | ------ |
| `knowledge_request` | object | AI-011 | بله    |
| `retrieval_depth`   | string | AI-011 | خیر    |

---

## 6. Outputs

| خروجی                | نوع     | توضیح                 |
| -------------------- | ------- | --------------------- |
| `retrieval_strategy` | object  | استراتژی بازیابی کامل |
| `source_priorities`  | array   | اولویت منابع دانشی    |
| `time_range`         | object  | محدوده زمانی بازیابی  |
| `strategy_complete`  | boolean | وضعیت تکمیل           |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "ARCH-012",
        "scope": ["knowledge-model", "knowledge-domains"],
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

| منبع     | دامنه            | کاربرد                 |
| -------- | ---------------- | ---------------------- |
| ARCH-012 | مدل دانش سازمانی | تعریف استراتژی بازیابی |

---

## 9. Prompt Structure

PRM-403 اولین گام زنجیره KNW-RTR. درخواست دانش را به استراتژی بازیابی تبدیل می‌کند.

```
knowledge_request → PRM-403 → retrieval_strategy → PRM-404
```

---

## 10. Variable Definitions

| متغیر               | نوع    | اجباری | توضیح                                     | اعتبارسنجی        |
| ------------------- | ------ | ------ | ----------------------------------------- | ----------------- |
| `knowledge_request` | VAR-06 | بله    | درخواست دانش از مصرف‌کننده                | —                 |
| `retrieval_depth`   | VAR-02 | خیر    | عمق بازیابی (summary/detailed/exhaustive) | default: detailed |

---

## 11. Execution Constraints

| ID     | محدودیت                                 |
| ------ | --------------------------------------- |
| CST-01 | استراتژی با نیاز مصرف‌کننده همخوان باشد |
| CST-02 | منابع دانش اولویت‌بندی شوند             |

---

## 12. Validation Rules

| ID     | قاعده                          | سطح    | نقض     |
| ------ | ------------------------------ | ------ | ------- |
| VAL-01 | استراتژی شامل محدوده زمانی است | معماری | عدم ثبت |
| VAL-02 | منابع اولویت‌بندی شده‌اند      | معماری | هشدار   |

---

## 13. Failure Conditions

| شرط                        | اقدام                             |
| -------------------------- | --------------------------------- |
| درخواست دانش نامشخص        | بازگشت error + درخواست شفاف‌سازی  |
| هیچ منبعی برای اولویت‌بندی | Escalation به Knowledge Architect |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                     | مسئول               |
| ----- | ----------------- | ------------------------- | ------------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار              |
| QG-02 | Review → Approved | استراتژی کامل             | Knowledge Architect |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper     |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                               | توسط        |
| ----------- | ---------- | ----------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — استراتژی بازیابی دانش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-403",
  "name": "Knowledge Retrieval Strategy",
  "family": "FAM-KNW",
  "subfamily": "KNW-RTR",
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
    { "id": "knowledge_request", "type": "VAR-06", "required": true },
    { "id": "retrieval_depth", "type": "VAR-02", "required": false, "default": "detailed" }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["knowledge_request"],
    "optional": ["retrieval_depth"]
  },
  "output": {
    "required": ["retrieval_strategy", "strategy_complete"],
    "optional": ["source_priorities", "time_range"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Strategy includes time range", "severity": "error" },
    { "id": "VAL-02", "description": "Sources prioritized", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-011", "AI-010", "AI-001", "AI-002"],
  "dependencies": [],
  "documentation_refs": ["ARCH-012"]
}
```
