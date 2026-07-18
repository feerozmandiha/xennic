# Executive Dashboard Validation — اعتبارسنجی داشبورد اجرایی

> **شناسه:** PRM-327
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Analytics Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-326](./132-reporting-consistency-validation.md), [MET-\*](../60-METRICS/)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                          |
| ------------------ | ------------------------------ |
| **id**             | PRM-327                        |
| **name_fa**        | اعتبارسنجی داشبورد اجرایی      |
| **name_en**        | Executive Dashboard Validation |
| **family**         | FAM-OPS                        |
| **subfamily**      | OPS-RPT                        |
| **type**           | PT-06                          |
| **complexity**     | C-3                            |
| **authority**      | A-3                            |
| **owner**          | Analytics Lead                 |
| **version**        | 1.0.0-draft                    |
| **status**         | draft                          |
| **security_level** | SL-02                          |

---

## 2. Purpose

PRM-327 اعتبارسنجی داشبورد اجرایی را از نظر کامل بودن داده‌ها، صحت KPIهای کلیدی و قابلیت تصمیم‌گیری انجام می‌دهد. این پرامپت تضمین می‌کند که داشبورد نیازهای مدیریت ارشد را برآورده می‌کند.

### اصول اعتبارسنجی

| ID    | اصل                                             |
| ----- | ----------------------------------------------- |
| ED-01 | KPIهای کلیدی باید کامل و صحیح باشند             |
| ED-02 | داشبورد باید قابل تصمیم‌گیری باشد               |
| ED-03 | روندها باید با زمینه کسب‌وکار تطبیق داشته باشند |

---

## 3. Scope

### Inside Scope

| حوزه              | توضیح                  |
| ----------------- | ---------------------- |
| KPIهای کلیدی      | بررسی کامل بودن و صحت  |
| قابلیت تصمیم‌گیری | ارزیابی وضوح و کاربرد  |
| تطبیق روند        | بررسی همخوانی با اهداف |

### Outside Scope

| حوزه         | دلیل         |
| ------------ | ------------ |
| کیفیت تحلیلی | حوزه PRM-328 |
| تکمیل گزارش  | حوزه PRM-329 |

---

## 4. Consumers

| مصرف‌کننده            | نقش                | نوع مصرف |
| --------------------- | ------------------ | -------- |
| AI-010 (Analytics)    | اعتبارسنجی داشبورد | Chain    |
| AI-014 (Orchestrator) | نظارت بر خروجی     | System   |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-326 Output",
        "scope": ["consistency-result", "structure-match"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-05",
        "source": "MET-*",
        "scope": ["executive-kpis", "strategic-metrics"],
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

## 6. Required Knowledge

| منبع   | دامنه         | کاربرد          |
| ------ | ------------- | --------------- |
| MET-\* | KPIهای اجرایی | تأیید کامل بودن |

---

## 7. Variables

| متغیر            | نوع    | اجباری | توضیح                            | اعتبارسنجی |
| ---------------- | ------ | ------ | -------------------------------- | ---------- |
| `dashboard_data` | VAR-06 | بله    | داده‌های داشبورد برای اعتبارسنجی | —          |

---

## 8. Constraints

| ID     | محدودیت                                     |
| ------ | ------------------------------------------- |
| CST-01 | KPIهای کلیدی ≥ ۸۰٪ کامل باشند               |
| CST-02 | داشبورد حداقل ۳ معیار تصمیم‌گیری داشته باشد |

---

## 9. Input Contract

| ورودی            | نوع    | منبع    | اجباری |
| ---------------- | ------ | ------- | ------ |
| `dashboard_data` | object | PRM-321 | بله    |

---

## 10. Output Contract

| خروجی                | نوع    | توضیح                        |
| -------------------- | ------ | ---------------------------- |
| `dashboard_result`   | string | نتیجه (valid/needs_revision) |
| `kpi_completeness`   | number | درصد کامل بودن KPIها (۰–۱۰۰) |
| `decision_readiness` | number | آمادگی تصمیم‌گیری (۰–۱۰۰)    |
| `trend_alignment`    | object | تطبیق روند با اهداف          |
| `missing_kpis`       | array  | KPIهای缺失                   |

---

## 11. Validation Rules

| ID     | قاعده                    | سطح    | نقض     |
| ------ | ------------------------ | ------ | ------- |
| VAL-01 | kpi_completeness ≥ ۸۰٪   | معماری | عدم ثبت |
| VAL-02 | decision_readiness ≥ ۷۰٪ | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                     | مسئول           |
| ----- | ----------------- | ------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار          |
| QG-02 | Review → Approved | KPIها کامل                | Analytics Lead  |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل            |
| ------- | ------------------- | ------ | --------------- |
| PRM-326 | DEP-03 (References) | ^1.0.0 | داده‌های سازگار |
| MET-\*  | DEP-03 (References) | ^1.0.0 | KPIهای اجرایی   |

---

## 14. Human Override

| سناریو                 | اقدام                        |
| ---------------------- | ---------------------------- |
| kpi_completeness < ۸۰٪ | Escalation به Analytics Lead |

---

## 15. Governance Notes

| ID     | یادداشت                                    |
| ------ | ------------------------------------------ |
| GOV-01 | A-3 (Strategic) — خروجی مستقیم برای AI-014 |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-327",
  "name": "Executive Dashboard Validation",
  "family": "FAM-OPS",
  "subfamily": "OPS-RPT",
  "type": "PT-06",
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
    { "type": "CTX-04", "source": "PRM-326", "required": true },
    { "type": "CTX-05", "source": "MET-*", "required": true }
  ],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [{ "id": "dashboard_data", "type": "VAR-06", "required": true }]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["dashboard_data"],
    "optional": []
  },
  "output": {
    "required": ["dashboard_result", "kpi_completeness", "decision_readiness"],
    "optional": ["trend_alignment", "missing_kpis"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "KPI completeness >= 80%", "severity": "error" },
    { "id": "VAL-02", "description": "Decision readiness >= 70%", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-010", "AI-014"],
  "dependencies": [],
  "documentation_refs": ["MET-*"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                   | توسط        |
| ----------- | ---------- | --------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی داشبورد اجرایی | معمار سیستم |
