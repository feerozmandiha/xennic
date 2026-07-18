# Reporting Consistency Validation — اعتبارسنجی سازگاری گزارش

> **شناسه:** PRM-326
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Analytics Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-325](./130-analytics-validation.md), [PRM-301](./30-publishing-instruction.md), [EDT-001](../24-EDITORIAL/10-content-guidelines.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                            |
| ------------------ | -------------------------------- |
| **id**             | PRM-326                          |
| **name_fa**        | اعتبارسنجی سازگاری گزارش         |
| **name_en**        | Reporting Consistency Validation |
| **family**         | FAM-OPS                          |
| **subfamily**      | OPS-RPT                          |
| **type**           | PT-06                            |
| **complexity**     | C-2                              |
| **authority**      | A-2                              |
| **owner**          | Analytics Lead                   |
| **version**        | 1.0.0-draft                      |
| **status**         | draft                            |
| **security_level** | SL-01                            |

---

## 2. Purpose

PRM-326 سازگاری گزارش‌های تولیدشده با ساختار، فرمت و استانداردهای گزارش‌دهی سازمانی را بررسی می‌کند. این پرامپت تضمین می‌کند که همه گزارش‌ها از الگوی یکسان پیروی می‌کنند.

### اصول سازگاری

| ID    | اصل                                                 |
| ----- | --------------------------------------------------- |
| RC-01 | همه گزارش‌ها باید از الگوی ساختاری یکسان پیروی کنند |
| RC-02 | نام‌گذاری KPIها باید در همه گزارش‌ها یکسان باشد     |
| RC-03 | واحدهای اندازه‌گیری باید در سراسر گزارش یکسان باشند |

---

## 3. Scope

### Inside Scope

| حوزه         | توضیح                         |
| ------------ | ----------------------------- |
| ساختار گزارش | تطبیق با الگوی استاندارد      |
| نام‌گذاری    | یکسان‌سازی نام KPIها          |
| واحدها       | تطبیق واحدهای اندازه‌گیری     |
| فراداده      | بررسی کامل بودن فراداده گزارش |

### Outside Scope

| حوزه            | دلیل         |
| --------------- | ------------ |
| اعتبارسنجی داده | حوزه PRM-325 |
| داشبورد اجرایی  | حوزه PRM-327 |
| کیفیت تحلیلی    | حوزه PRM-328 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                | نوع مصرف |
| ------------------ | ------------------ | -------- |
| AI-010 (Analytics) | اعتبارسنجی سازگاری | Chain    |
| AI-011 (Knowledge) | تأیید انطباق دانشی | System   |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-325 Output",
        "scope": ["validation-result", "critical-issues"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-301",
        "scope": ["reporting-standards", "format-requirements"],
        "injection": "append",
        "required": true
      }
    ],
    "max_tokens": 3000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع    | دامنه              | کاربرد       |
| ------- | ------------------ | ------------ |
| PRM-301 | استانداردهای گزارش | تطبیق ساختار |

---

## 7. Variables

| متغیر         | نوع    | اجباری | توضیح                             | اعتبارسنجی |
| ------------- | ------ | ------ | --------------------------------- | ---------- |
| `report_data` | VAR-06 | بله    | داده‌های گزارش برای بررسی سازگاری | —          |

---

## 8. Constraints

| ID     | محدودیت                                          |
| ------ | ------------------------------------------------ |
| CST-01 | ساختار گزارش با الگوی استاندارد تطبیق داشته باشد |
| CST-02 | نام KPIها در همه بخش‌ها یکسان باشد               |

---

## 9. Input Contract

| ورودی         | نوع    | منبع         | اجباری |
| ------------- | ------ | ------------ | ------ |
| `report_data` | object | PRM-320..325 | بله    |

---

## 10. Output Contract

| خروجی                | نوع    | توضیح                           |
| -------------------- | ------ | ------------------------------- |
| `consistency_result` | string | نتیجه (consistent/inconsistent) |
| `structure_match`    | number | درصد تطبیق ساختار (۰–۱۰۰)       |
| `naming_issues`      | array  | مشکلات نام‌گذاری                |
| `unit_issues`        | array  | مشکلات واحد اندازه‌گیری         |

---

## 11. Validation Rules

| ID     | قاعده                 | سطح    | نقض     |
| ------ | --------------------- | ------ | ------- |
| VAL-01 | structure_match ≥ ۹۰٪ | معماری | عدم ثبت |
| VAL-02 | naming_issues = ۰     | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                  | مسئول              |
| ----- | ----------------- | ---------------------- | ------------------ |
| QG-01 | Draft → Review    | هویت کامل, input معتبر | خودکار             |
| QG-02 | Review → Approved | استانداردها کامل       | Analytics Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001         | Registry Keeper    |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                    |
| ------- | ------------------- | ------ | ----------------------- |
| PRM-325 | DEP-03 (References) | ^1.0.0 | داده‌های اعتبارسنجی‌شده |
| PRM-301 | DEP-03 (References) | ^1.0.0 | استانداردهای گزارش      |

---

## 14. Human Override

| سناریو            | اقدام                        |
| ----------------- | ---------------------------- |
| ناسازگاری ساختاری | Escalation به Analytics Lead |

---

## 15. Governance Notes

| ID     | یادداشت                                       |
| ------ | --------------------------------------------- |
| GOV-01 | A-2 (Tactical) — نیازمند تأیید Analytics Lead |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-326",
  "name": "Reporting Consistency Validation",
  "family": "FAM-OPS",
  "subfamily": "OPS-RPT",
  "type": "PT-06",
  "complexity": "C-2",
  "authority": "A-2",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [
    { "type": "CTX-04", "source": "PRM-325", "required": true },
    { "type": "CTX-02", "source": "PRM-301", "required": true }
  ],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [{ "id": "report_data", "type": "VAR-06", "required": true }]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["report_data"],
    "optional": []
  },
  "output": {
    "required": ["consistency_result", "structure_match"],
    "optional": ["naming_issues", "unit_issues"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Structure match >= 90%", "severity": "error" },
    { "id": "VAL-02", "description": "No naming issues", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-01",
  "consumers": ["AI-010", "AI-011"],
  "dependencies": [],
  "documentation_refs": ["PRM-301"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                  | توسط        |
| ----------- | ---------- | -------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی سازگاری گزارش | معمار سیستم |
