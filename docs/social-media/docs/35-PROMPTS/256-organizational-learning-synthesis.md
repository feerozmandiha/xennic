# Organizational Learning Synthesis — ترکیب یادگیری سازمانی

> **شناسه:** PRM-433
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Improvement Lead
> **وابستگی:** PRM-432
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                             |
| ------------------ | --------------------------------- |
| **id**             | PRM-433                           |
| **name_fa**        | ترکیب یادگیری سازمانی             |
| **name_en**        | Organizational Learning Synthesis |
| **family**         | FAM-KNW                           |
| **subfamily**      | KNW-LRN                           |
| **type**           | PT-07                             |
| **complexity**     | C-3                               |
| **authority**      | A-3                               |
| **owner**          | Improvement Lead                  |
| **version**        | 1.0.0-draft                       |
| **status**         | draft                             |
| **security_level** | SL-02                             |

---

## 2. Purpose

PRM-433 چهارمین گام زنجیره KNW-LRN. درس‌آموخته‌ها، فرصت‌ها و علت‌های ریشه‌ای را ترکیب و به بینش‌های یادگیری سازمانی یکپارچه تبدیل می‌کند.

### اصول ترکیب

| ID    | اصل                                        |
| ----- | ------------------------------------------ |
| OS-01 | ترکیب بر اساس الگوهای مشترک باشد           |
| OS-02 | بینش‌های یادگیری مستند و قابل اشتراک باشند |

---

## 3. Scope

### Inside Scope

| حوزه                       | توضیح              |
| -------------------------- | ------------------ |
| یکپارچه‌سازی درس‌آموخته‌ها | ترکیب الگوها       |
| تولید بینش‌های یادگیری     | نتیجه‌گیری سازمانی |

### Outside Scope

| حوزه              | دلیل         |
| ----------------- | ------------ |
| تحلیل علت         | حوزه PRM-432 |
| برنامه‌ریزی تکامل | حوزه PRM-434 |

---

## 4. Consumers

| مصرف‌کننده           | نقش                | نوع مصرف  |
| -------------------- | ------------------ | --------- |
| AI-012 (Improvement) | ترکیب یادگیری      | Chain     |
| AI-001 (Strategy)    | مصرف برای استراتژی | Secondary |
| AI-013 (Research)    | مصرف برای پژوهش    | Secondary |

---

## 5. Inputs

| ورودی                       | نوع   | منبع    | اجباری |
| --------------------------- | ----- | ------- | ------ |
| `lessons_learned`           | array | PRM-430 | بله    |
| `root_causes`               | array | PRM-432 | بله    |
| `improvement_opportunities` | array | PRM-431 | بله    |

---

## 6. Outputs

| خروجی                | نوع    | توضیح                 |
| -------------------- | ------ | --------------------- |
| `learning_synthesis` | object | ترکیب یادگیری سازمانی |
| `learning_insights`  | array  | بینش‌های یادگیری      |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-430-through-432",
        "scope": ["learning-data"],
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

| منبع             | دامنه       | کاربرد        |
| ---------------- | ----------- | ------------- |
| داده‌های یادگیری | PRM-430–432 | ترکیب یادگیری |

---

## 9. Prompt Structure

PRM-433 چهارمین گام زنجیره KNW-LRN. یادگیری سازمانی را ترکیب می‌کند.

```
lessons_learned + root_causes + improvement_opportunities → PRM-433 → learning_synthesis → PRM-434
```

---

## 10. Variable Definitions

| متغیر                       | نوع    | اجباری | توضیح           |
| --------------------------- | ------ | ------ | --------------- |
| `lessons_learned`           | VAR-03 | بله    | درس‌آموخته‌ها   |
| `root_causes`               | VAR-03 | بله    | علت‌های ریشه‌ای |
| `improvement_opportunities` | VAR-03 | بله    | فرصت‌ها         |

---

## 11. Execution Constraints

| ID     | محدودیت                         |
| ------ | ------------------------------- |
| CST-01 | ترکیب الگوهای مشترک را نشان دهد |
| CST-02 | بینش‌ها قابل استناد باشند       |

---

## 12. Validation Rules

| ID     | قاعده                          | سطح    | نقض   |
| ------ | ------------------------------ | ------ | ----- |
| VAL-01 | بینش‌ها به داده‌ها ارجاع دارند | معماری | خطا   |
| VAL-02 | الگوهای مشترک شناسایی شده‌اند  | معماری | هشدار |

---

## 13. Failure Conditions

| شرط                       | اقدام                        |
| ------------------------- | ---------------------------- |
| داده کافی برای ترکیب نیست | بازگشت warning + گزارش موجود |

---

## 14. Quality Gates

| گیت   | مکان              | معیار      | مسئول            |
| ----- | ----------------- | ---------- | ---------------- |
| QG-01 | Draft → Review    | هویت کامل  | خودکار           |
| QG-02 | Review → Approved | ترکیب کامل | Improvement Lead |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                               | توسط        |
| ----------- | ---------- | ----------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — ترکیب یادگیری سازمانی | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-433",
  "name": "Organizational Learning Synthesis",
  "family": "FAM-KNW",
  "subfamily": "KNW-LRN",
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
  "sources": [{ "type": "CTX-02", "source": "PRM-430-through-432", "required": true }],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "lessons_learned", "type": "VAR-03", "required": true },
    { "id": "root_causes", "type": "VAR-03", "required": true },
    { "id": "improvement_opportunities", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["lessons_learned", "root_causes", "improvement_opportunities"],
    "optional": []
  },
  "output": {
    "required": ["learning_synthesis", "learning_insights"],
    "optional": []
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Insights reference learning data", "severity": "error" },
    { "id": "VAL-02", "description": "Common patterns identified", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-012", "AI-001", "AI-013"],
  "dependencies": ["PRM-430", "PRM-431", "PRM-432"],
  "documentation_refs": []
}
```
