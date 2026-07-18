# KPI Dashboard Construction — ساخت داشبورد KPI

> **شناسه:** PRM-321
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Analytics Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-320](./120-performance-report-generation.md), [MET-\*](../60-METRICS/)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                      |
| ------------------ | -------------------------- |
| **id**             | PRM-321                    |
| **name_fa**        | ساخت داشبورد KPI           |
| **name_en**        | KPI Dashboard Construction |
| **family**         | FAM-OPS                    |
| **subfamily**      | OPS-RPT                    |
| **type**           | PT-04                      |
| **complexity**     | C-3                        |
| **authority**      | A-3                        |
| **owner**          | Analytics Lead             |
| **version**        | 1.0.0-draft                |
| **status**         | draft                      |
| **security_level** | SL-02                      |

---

## 2. Purpose

PRM-321 ساخت داشبورد KPI از گزارش عملکرد را تعریف می‌کند. این پرامپت KPIهای کلیدی را انتخاب، اولویت‌بندی و به صورت بصری ساختاریافته برای نمایش به ذی‌نفعان آماده می‌کند.

### اصول ساخت داشبورد

| ID    | اصل                                               |
| ----- | ------------------------------------------------- |
| KD-01 | KPIها باید بر اساس اهمیت و تأثیر اولویت‌بندی شوند |
| KD-02 | داشبورد باید برای مخاطب هدف قابل فهم باشد         |
| KD-03 | روندهای صعودی/نزولی باید مشخص باشند               |
| KD-04 | مقایسه با اهداف و دوره قبل ضروری است              |

---

## 3. Scope

### Inside Scope

| حوزه            | توضیح                               |
| --------------- | ----------------------------------- |
| انتخاب KPI      | انتخاب KPIهای کلیدی از گزارش عملکرد |
| اولویت‌بندی     | تعیین ترتیب نمایش بر اساس اهمیت     |
| نرمال‌سازی بصری | یکسان‌سازی واحدها و مقیاس‌ها        |
| روندها          | نمایش تغییرات نسبت به دوره قبل      |
| خروجی داشبورد   | تولید ساختار داده داشبورد           |

### Outside Scope

| حوزه        | دلیل         |
| ----------- | ------------ |
| تولید گزارش | حوزه PRM-320 |
| تحلیل روند  | حوزه PRM-322 |
| اعتبارسنجی  | حوزه PRM-325 |

---

## 4. Consumers

| مصرف‌کننده         | نقش              | نوع مصرف |
| ------------------ | ---------------- | -------- |
| AI-010 (Analytics) | ساخت داشبورد KPI | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-320 Output",
        "scope": ["performance-report", "kpi-summary"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-05",
        "source": "MET-*",
        "scope": ["kpi-definitions", "target-values"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 5000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع   | دامنه              | کاربرد                   |
| ------ | ------------------ | ------------------------ |
| MET-\* | تعاریف KPI و اهداف | انتخاب و اولویت‌بندی KPI |

---

## 7. Variables

| متغیر                | نوع    | اجباری | توضیح                         | اعتبارسنجی  |
| -------------------- | ------ | ------ | ----------------------------- | ----------- |
| `performance_report` | VAR-06 | بله    | گزارش عملکرد از PRM-320       | —           |
| `dashboard_audience` | VAR-01 | بله    | مخاطب (executive/team/public) | —           |
| `max_kpis`           | VAR-04 | خیر    | حداکثر KPI در داشبورد         | default: 10 |

---

## 8. Constraints

| ID     | محدودیت                                         |
| ------ | ----------------------------------------------- |
| CST-01 | حداکثر ۱۰ KPI اصلی در داشبورد                   |
| CST-02 | همه KPIها باید با MET-\* مستند شده باشند        |
| CST-03 | روندها باید با داده‌های تاریخی قابل تأیید باشند |

---

## 9. Input Contract

| ورودی                | نوع    | منبع    | اجباری |
| -------------------- | ------ | ------- | ------ |
| `performance_report` | object | PRM-320 | بله    |
| `dashboard_audience` | string | AI-010  | بله    |
| `max_kpis`           | number | AI-010  | خیر    |

---

## 10. Output Contract

| خروجی                    | نوع    | توضیح                          |
| ------------------------ | ------ | ------------------------------ |
| `dashboard`              | object | ساختار داده داشبورد            |
| `kpi_cards`              | array  | کارت‌های KPI با مقادیر و روند  |
| `kpi_priorities`         | array  | اولویت‌بندی KPIها              |
| `audience_level`         | string | سطح دسترسی مخاطب               |
| `dashboard_completeness` | number | درصد کامل بودن داشبورد (۰–۱۰۰) |

---

## 11. Validation Rules

| ID     | قاعده                                | سطح    | نقض     |
| ------ | ------------------------------------ | ------ | ------- |
| VAL-01 | حداکثر ۱۰ KPI                        | معماری | عدم ثبت |
| VAL-02 | همه KPIها مستند در MET-\*            | معماری | هشدار   |
| VAL-03 | روندها با داده‌های تاریخی قابل تأیید | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                     | مسئول              |
| ----- | ----------------- | ------------------------- | ------------------ |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار             |
| QG-02 | Review → Approved | KPIها معتبر               | Analytics Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper    |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                           |
| ------- | ------------------- | ------ | ------------------------------ |
| PRM-320 | DEP-01 (Requires)   | ^1.0.0 | گزارش عملکرد برای ساخت داشبورد |
| MET-\*  | DEP-03 (References) | ^1.0.0 | تعاریف KPI                     |

---

## 14. Human Override

| سناریو                            | اقدام                        |
| --------------------------------- | ---------------------------- |
| kpi انتخاب‌شده در MET-\* ثبت نشده | حذف KPI + اطلاع‌رسانی        |
| dashboard_completeness < ۷۰       | Escalation به Analytics Lead |

---

## 15. Governance Notes

| ID     | یادداشت                                                 |
| ------ | ------------------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR برای تغییر ساختار داشبورد |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-321",
  "name": "KPI Dashboard Construction",
  "family": "FAM-OPS",
  "subfamily": "OPS-RPT",
  "type": "PT-04",
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
    { "type": "CTX-04", "source": "PRM-320", "required": true },
    { "type": "CTX-05", "source": "MET-*", "required": true }
  ],
  "max_tokens": 5000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "performance_report", "type": "VAR-06", "required": true },
    { "id": "dashboard_audience", "type": "VAR-01", "required": true },
    { "id": "max_kpis", "type": "VAR-04", "required": false, "default": 10 }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["performance_report", "dashboard_audience"],
    "optional": ["max_kpis"]
  },
  "output": {
    "required": ["dashboard", "kpi_cards", "kpi_priorities"],
    "optional": ["audience_level", "dashboard_completeness"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Maximum 10 KPIs", "severity": "error" },
    { "id": "VAL-02", "description": "All KPIs documented in MET-*", "severity": "warning" },
    {
      "id": "VAL-03",
      "description": "Trends verifiable with historical data",
      "severity": "warning"
    }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-010"],
  "dependencies": ["PRM-320"],
  "documentation_refs": ["MET-*"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                          | توسط        |
| ----------- | ---------- | ------------------------------ | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — ساخت داشبورد KPI | معمار سیستم |
