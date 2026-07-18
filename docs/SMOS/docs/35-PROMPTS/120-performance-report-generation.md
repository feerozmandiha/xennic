# Performance Report Generation — تولید گزارش عملکرد

> **شناسه:** PRM-320
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Analytics Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-308](./92-distribution-completion-validation.md), [PRM-319](./118-community-handoff-validation.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                         |
| ------------------ | ----------------------------- |
| **id**             | PRM-320                       |
| **name_fa**        | تولید گزارش عملکرد            |
| **name_en**        | Performance Report Generation |
| **family**         | FAM-OPS                       |
| **subfamily**      | OPS-RPT                       |
| **type**           | PT-04                         |
| **complexity**     | C-2                           |
| **authority**      | A-3                           |
| **owner**          | Analytics Lead                |
| **version**        | 1.0.0-draft                   |
| **status**         | draft                         |
| **security_level** | SL-02                         |

---

## 2. Purpose

PRM-320 تولید گزارش عملکرد را از داده‌های خام پلتفرم‌های اجتماعی تعریف می‌کند. این پرامپت با جمع‌آوری، نرمال‌سازی و تلفیق داده‌های عملکرد از پلتفرم‌های مختلف، گزارش یکپارچه عملکرد تولید می‌کند.

### اصول تولید گزارش

| ID    | اصل                                                  |
| ----- | ---------------------------------------------------- |
| PG-01 | داده‌ها باید از همه پلتفرم‌های هدف جمع‌آوری شوند     |
| PG-02 | نرمال‌سازی داده‌ها پیش از تلفیق انجام شود            |
| PG-03 | گزارش باید ساختار یکسان برای همه بازه‌ها داشته باشد  |
| PG-04 | KPIها باید با EDH (Enterprise Data Hub) همخوان باشند |

---

## 3. Scope

### Inside Scope

| حوزه          | توضیح                        |
| ------------- | ---------------------------- |
| جمع‌آوری داده | دریافت داده از همه پلتفرم‌ها |
| نرمال‌سازی    | یکسان‌سازی واحدها و فرمت‌ها  |
| تلفیق         | ترکیب داده‌های بین‌پلتفرمی   |
| خروجی گزارش   | تولید گزارش ساختاریافته      |

### Outside Scope

| حوزه           | دلیل         |
| -------------- | ------------ |
| KPI Dashboard  | حوزه PRM-321 |
| Trend Analysis | حوزه PRM-322 |
| اعتبارسنجی     | حوزه PRM-325 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                | نوع مصرف |
| ------------------ | ------------------ | -------- |
| AI-010 (Analytics) | تولید گزارش عملکرد | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-308, PRM-319",
        "scope": ["distribution-report", "handoff-report"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-05",
        "source": "PLAT-*",
        "scope": ["platform-metrics", "data-schemas"],
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

| منبع    | دامنه                   | کاربرد                  |
| ------- | ----------------------- | ----------------------- |
| PLAT-\* | KPIها و معیارهای پلتفرم | استخراج داده‌های عملکرد |

---

## 7. Variables

| متغیر                | نوع    | اجباری | توضیح                               | اعتبارسنجی    |
| -------------------- | ------ | ------ | ----------------------------------- | ------------- |
| `reporting_period`   | VAR-04 | بله    | بازه گزارش (day/week/month/quarter) | —             |
| `platform_data`      | VAR-06 | بله    | داده‌های خام از پلتفرم‌ها           | —             |
| `include_benchmarks` | VAR-03 | خیر    | مقایسه با معیارهای پایه             | default: true |

---

## 8. Constraints

| ID     | محدودیت                             |
| ------ | ----------------------------------- |
| CST-01 | داده‌ها پیش از تلفیق نرمال شوند     |
| CST-02 | KPIها با EDH همخوان باشند           |
| CST-03 | گزارش شامل همه پلتفرم‌های فعال باشد |

---

## 9. Input Contract

| ورودی                | نوع     | منبع   | اجباری |
| -------------------- | ------- | ------ | ------ |
| `reporting_period`   | string  | AI-010 | بله    |
| `platform_data`      | array   | AI-010 | بله    |
| `include_benchmarks` | boolean | AI-010 | خیر    |

---

## 10. Output Contract

| خروجی                  | نوع    | توضیح                            |
| ---------------------- | ------ | -------------------------------- |
| `performance_report`   | object | گزارش عملکرد یکپارچه             |
| `kpi_summary`          | object | خلاصه KPIهای کلیدی               |
| `platform_breakdown`   | object | تفکیک عملکرد به ازای پلتفرم      |
| `benchmark_comparison` | object | مقایسه با معیارها (در صورت وجود) |
| `report_quality_score` | number | امتیاز کیفیت گزارش (۰–۱۰۰)       |

---

## 11. Validation Rules

| ID     | قاعده                            | سطح    | نقض     |
| ------ | -------------------------------- | ------ | ------- |
| VAL-01 | داده‌های همه پلتفرم‌ها نرمال شده | معماری | عدم ثبت |
| VAL-02 | KPIها با EDH همخوان              | معماری | هشدار   |
| VAL-03 | report_quality_score ≥ ۷۰        | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                     | مسئول              |
| ----- | ----------------- | ------------------------- | ------------------ |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار             |
| QG-02 | Review → Approved | ساختار گزارش استاندارد    | Analytics Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper    |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                      |
| ------- | ------------------- | ------ | ------------------------- |
| PRM-308 | DEP-03 (References) | ^1.0.0 | داده‌های توزیع برای گزارش |
| PRM-319 | DEP-03 (References) | ^1.0.0 | داده‌های تعامل جامعه      |
| PLAT-\* | DEP-03 (References) | ^1.0.0 | KPIها و معیارهای پلتفرم   |

---

## 14. Human Override

| سناریو                 | اقدام                                |
| ---------------------- | ------------------------------------ |
| داده‌های یک پلتفرم缺失 | حذف آن پلتفرم از گزارش + اطلاع‌رسانی |
| ناهنجاری در داده‌ها    | Escalation به Analytics Lead         |

---

## 15. Governance Notes

| ID     | یادداشت                                               |
| ------ | ----------------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR برای تغییر ساختار گزارش |
| GOV-02 | داده‌های خام پلتفرم محرمانه محسوب می‌شوند             |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-320",
  "name": "Performance Report Generation",
  "family": "FAM-OPS",
  "subfamily": "OPS-RPT",
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
    { "type": "CTX-04", "source": "PRM-308", "required": true },
    { "type": "CTX-04", "source": "PRM-319", "required": true },
    { "type": "CTX-05", "source": "PLAT-*", "required": true }
  ],
  "max_tokens": 5000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "reporting_period", "type": "VAR-04", "required": true },
    { "id": "platform_data", "type": "VAR-06", "required": true },
    { "id": "include_benchmarks", "type": "VAR-03", "required": false, "default": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["reporting_period", "platform_data"],
    "optional": ["include_benchmarks"]
  },
  "output": {
    "required": ["performance_report", "kpi_summary", "platform_breakdown"],
    "optional": ["benchmark_comparison", "report_quality_score"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "All platform data normalized", "severity": "error" },
    { "id": "VAL-02", "description": "KPIs align with EDH", "severity": "warning" },
    { "id": "VAL-03", "description": "Report quality score >= 70", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-010"],
  "dependencies": [],
  "documentation_refs": ["PLAT-*"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                            | توسط        |
| ----------- | ---------- | -------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — تولید گزارش عملکرد | معمار سیستم |
