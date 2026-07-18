# Source Selection Strategy — استراتژی انتخاب منبع پژوهش

> **شناسه:** PRM-421
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Research Architect
> **وابستگی:** PRM-420
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                      |
| ------------------ | -------------------------- |
| **id**             | PRM-421                    |
| **name_fa**        | استراتژی انتخاب منبع پژوهش |
| **name_en**        | Source Selection Strategy  |
| **family**         | FAM-KNW                    |
| **subfamily**      | KNW-RSR                    |
| **type**           | PT-07                      |
| **complexity**     | C-3                        |
| **authority**      | A-3                        |
| **owner**          | Research Architect         |
| **version**        | 1.0.0-draft                |
| **status**         | draft                      |
| **security_level** | SL-02                      |

---

## 2. Purpose

PRM-421 دومین گام زنجیره KNW-RSR. بر اساس برنامه پژوهش از PRM-420، مناسب‌ترین منابع دانش را برای پژوهش انتخاب و اولویت‌بندی می‌کند.

### اصول انتخاب منبع

| ID    | اصل                                      |
| ----- | ---------------------------------------- |
| SS-01 | منابع با سؤالات پژوهش مطابقت داشته باشند |
| SS-02 | منابع معتبر و قابل استناد باشند          |

---

## 3. Scope

### Inside Scope

| حوزه                | توضیح                |
| ------------------- | -------------------- |
| شناسایی منابع مرتبط | داخلی (KNW) و خارجی  |
| اولویت‌بندی منابع   | اعتبار، تازگی، تطابق |

### Outside Scope

| حوزه               | دلیل         |
| ------------------ | ------------ |
| تعریف سؤالات پژوهش | حوزه PRM-420 |
| جمع‌آوری شواهد     | حوزه PRM-422 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                       | نوع مصرف  |
| ------------------ | ------------------------- | --------- |
| AI-013 (Research)  | انتخاب منابع پژوهش        | Chain     |
| AI-011 (Knowledge) | مصرف انتخاب منابع         | Secondary |
| AI-001 (Strategy)  | مصرف برای تحلیل استراتژیک | Secondary |

---

## 5. Inputs

| ورودی           | نوع    | منبع             | اجباری |
| --------------- | ------ | ---------------- | ------ |
| `research_plan` | object | PRM-420          | بله    |
| `source_index`  | object | PRM-001 Registry | بله    |

---

## 6. Outputs

| خروجی              | نوع    | توضیح                      |
| ------------------ | ------ | -------------------------- |
| `source_selection` | object | انتخاب و اولویت‌بندی منابع |
| `source_priority`  | array  | اولویت منابع با دلیل       |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-001",
        "scope": ["source-registry"],
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

## 8. Knowledge Requirements

| منبع    | دامنه              | کاربرد      |
| ------- | ------------------ | ----------- |
| PRM-001 | رجیستری منابع دانش | انتخاب منبع |

---

## 9. Prompt Structure

PRM-421 دومین گام زنجیره KNW-RSR. منابع پژوهش را انتخاب می‌کند.

```
research_plan → PRM-421 → source_selection → PRM-422
```

---

## 10. Variable Definitions

| متغیر           | نوع    | اجباری | توضیح                   |
| --------------- | ------ | ------ | ----------------------- |
| `research_plan` | VAR-06 | بله    | برنامه پژوهش از PRM-420 |
| `source_index`  | VAR-03 | بله    | فهرست منابع از PRM-001  |

---

## 11. Execution Constraints

| ID     | محدودیت                         |
| ------ | ------------------------------- |
| CST-01 | هر منبع با سؤال پژوهش مرتبط شود |
| CST-02 | منابع معتبر اولویت داشته باشند  |

---

## 12. Validation Rules

| ID     | قاعده                       | سطح    | نقض   |
| ------ | --------------------------- | ------ | ----- |
| VAL-01 | دست‌کم یک منبع انتخاب شود   | معماری | خطا   |
| VAL-02 | منابع اولویت‌بندی شده باشند | معماری | هشدار |

---

## 13. Failure Conditions

| شرط                | اقدام                              |
| ------------------ | ---------------------------------- |
| هیچ منبعی یافت نشد | بازگشت error + پیشنهاد گسترش دامنه |

---

## 14. Quality Gates

| گیت   | مکان              | معیار             | مسئول              |
| ----- | ----------------- | ----------------- | ------------------ |
| QG-01 | Draft → Review    | هویت کامل         | خودکار             |
| QG-02 | Review → Approved | انتخاب منابع کامل | Research Architect |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                    | توسط        |
| ----------- | ---------- | ---------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — استراتژی انتخاب منبع پژوهش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-421",
  "name": "Source Selection Strategy",
  "family": "FAM-KNW",
  "subfamily": "KNW-RSR",
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
  "sources": [{ "type": "CTX-02", "source": "PRM-001", "required": true }],
  "max_tokens": 3500,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "research_plan", "type": "VAR-06", "required": true },
    { "id": "source_index", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["research_plan", "source_index"],
    "optional": []
  },
  "output": {
    "required": ["source_selection", "source_priority"],
    "optional": []
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "At least one source selected", "severity": "error" },
    { "id": "VAL-02", "description": "Sources are prioritized", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-013", "AI-011", "AI-001"],
  "dependencies": ["PRM-420"],
  "documentation_refs": ["PRM-001"]
}
```
