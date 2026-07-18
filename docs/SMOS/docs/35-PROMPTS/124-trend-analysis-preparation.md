# Trend Analysis Preparation — آماده‌سازی تحلیل روند

> **شناسه:** PRM-322
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Analytics Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-321](./122-kpi-dashboard-construction.md), [EDT-002](../24-EDITORIAL/20-content-taxonomy.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                      |
| ------------------ | -------------------------- |
| **id**             | PRM-322                    |
| **name_fa**        | آماده‌سازی تحلیل روند      |
| **name_en**        | Trend Analysis Preparation |
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

PRM-322 تحلیل روند عملکرد در بازه‌های زمانی متوالی را تعریف می‌کند. این پرامپت با مقایسه داده‌های دوره جاری با دوره‌های قبل، الگوهای رشد، افول و فصلی را شناسایی می‌کند.

### اصول تحلیل روند

| ID    | اصل                                          |
| ----- | -------------------------------------------- |
| TA-01 | روندها باید با حداقل دو دوره قبل مقایسه شوند |
| TA-02 | الگوهای فصلی باید شناسایی و تفکیک شوند       |
| TA-03 | تغییرات ناگهانی باید برچسب‌گذاری شوند        |

---

## 3. Scope

### Inside Scope

| حوزه           | توضیح                            |
| -------------- | -------------------------------- |
| مقایسه دوره‌ای | تطبیق KPIها با دوره‌های قبل      |
| تشخیص الگو     | شناسایی روندهای صعودی/نزولی/ثابت |
| فصلی‌زدایی     | تفکیک روند فصلی از روند واقعی    |
| ناهنجاری       | برچسب‌گذاری تغییرات غیرعادی      |

### Outside Scope

| حوزه        | دلیل         |
| ----------- | ------------ |
| تولید گزارش | حوزه PRM-320 |
| داشبورد     | حوزه PRM-321 |
| بینش مخاطب  | حوزه PRM-323 |

---

## 4. Consumers

| مصرف‌کننده         | نقش               | نوع مصرف |
| ------------------ | ----------------- | -------- |
| AI-010 (Analytics) | تحلیل روند عملکرد | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-321 Output",
        "scope": ["dashboard", "kpi-cards"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "historical-data",
        "scope": ["previous-periods", "baseline-metrics"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "EDT-002",
        "scope": ["content-themes", "seasonal-patterns"],
        "injection": "append",
        "required": false
      }
    ],
    "max_tokens": 4000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع    | دامنه              | کاربرد          |
| ------- | ------------------ | --------------- |
| EDT-002 | الگوهای فصلی محتوا | تفکیک روند فصلی |

---

## 7. Variables

| متغیر                 | نوع    | اجباری | توضیح                  | اعتبارسنجی      |
| --------------------- | ------ | ------ | ---------------------- | --------------- |
| `dashboard`           | VAR-06 | بله    | داشبورد KPI از PRM-321 | —               |
| `comparison_periods`  | VAR-04 | بله    | تعداد دوره‌های مقایسه  | min: 2, max: 12 |
| `include_seasonality` | VAR-03 | خیر    | تحلیل فصلی             | default: true   |

---

## 8. Constraints

| ID     | محدودیت                                 |
| ------ | --------------------------------------- |
| CST-01 | حداقل ۲ دوره مقایسه شود                 |
| CST-02 | روندها با داده‌های خام قابل تأیید باشند |

---

## 9. Input Contract

| ورودی                 | نوع     | منبع    | اجباری |
| --------------------- | ------- | ------- | ------ |
| `dashboard`           | object  | PRM-321 | بله    |
| `comparison_periods`  | number  | AI-010  | بله    |
| `include_seasonality` | boolean | AI-010  | خیر    |

---

## 10. Output Contract

| خروجی              | نوع    | توضیح                         |
| ------------------ | ------ | ----------------------------- |
| `trend_analysis`   | object | تحلیل کامل روندها             |
| `trend_summary`    | object | خلاصه روندهای کلیدی           |
| `seasonal_factors` | object | عوامل فصلی شناسایی‌شده        |
| `anomalies`        | array  | ناهنجاری‌های شناسایی‌شده      |
| `trend_confidence` | number | اطمینان از تحلیل روند (۰–۱۰۰) |

---

## 11. Validation Rules

| ID     | قاعده                 | سطح    | نقض     |
| ------ | --------------------- | ------ | ------- |
| VAL-01 | ≥ ۲ دوره مقایسه       | معماری | عدم ثبت |
| VAL-02 | trend_confidence ≥ ۶۰ | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                     | مسئول              |
| ----- | ----------------- | ------------------------- | ------------------ |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار             |
| QG-02 | Review → Approved | متدولوژی تحلیل معتبر      | Analytics Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper    |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                         |
| ------- | ------------------- | ------ | ---------------------------- |
| PRM-321 | DEP-01 (Requires)   | ^1.0.0 | داده‌های KPI برای تحلیل روند |
| EDT-002 | DEP-03 (References) | ^1.0.0 | الگوهای فصلی                 |

---

## 14. Human Override

| سناریو                 | اقدام                        |
| ---------------------- | ---------------------------- |
| ناهنجاری غیرقابل توضیح | Escalation به Analytics Lead |

---

## 15. Governance Notes

| ID     | یادداشت                                           |
| ------ | ------------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR برای متدولوژی تحلیل |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-322",
  "name": "Trend Analysis Preparation",
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
    { "type": "CTX-04", "source": "PRM-321", "required": true },
    { "type": "CTX-04", "source": "historical-data", "required": true },
    { "type": "CTX-02", "source": "EDT-002", "required": false }
  ],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "dashboard", "type": "VAR-06", "required": true },
    { "id": "comparison_periods", "type": "VAR-04", "required": true },
    { "id": "include_seasonality", "type": "VAR-03", "required": false, "default": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["dashboard", "comparison_periods"],
    "optional": ["include_seasonality"]
  },
  "output": {
    "required": ["trend_analysis", "trend_summary"],
    "optional": ["seasonal_factors", "anomalies", "trend_confidence"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "At least 2 comparison periods", "severity": "error" },
    { "id": "VAL-02", "description": "Trend confidence >= 60", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-010"],
  "dependencies": ["PRM-321"],
  "documentation_refs": ["EDT-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                               | توسط        |
| ----------- | ---------- | ----------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — آماده‌سازی تحلیل روند | معمار سیستم |
