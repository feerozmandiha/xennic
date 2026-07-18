# Sentiment Observation — مشاهده احساسات

> **شناسه:** PRM-316
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Community Manager
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-315](./110-community-interaction-validation.md), [PLAT-\*](../20-PLATFORMS/), [EDT-002](../24-EDITORIAL/20-content-taxonomy.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                 |
| ------------------ | --------------------- |
| **id**             | PRM-316               |
| **name_fa**        | مشاهده احساسات        |
| **name_en**        | Sentiment Observation |
| **family**         | FAM-OPS               |
| **subfamily**      | OPS-CMG               |
| **type**           | PT-04                 |
| **complexity**     | C-3                   |
| **authority**      | A-3                   |
| **owner**          | Community Manager     |
| **version**        | 1.0.0-draft           |
| **status**         | draft                 |
| **security_level** | SL-02                 |

---

## 2. Purpose

PRM-316 مشاهده و تحلیل روند احساسات جامعه در بازه‌های زمانی مشخص را تعریف می‌کند. این پرامپت با تجمیع داده‌های تعامل، تحلیل احساسات کلان و شناسایی روندهای نوظهور، بینش عملیاتی برای تیم جامعه فراهم می‌کند.

### اصول مشاهده احساسات

| ID    | اصل                                                  |
| ----- | ---------------------------------------------------- |
| SO-01 | تحلیل احساسات باید در بازه‌های زمانی مشخص انجام شود  |
| SO-02 | روندهای مثبت، منفی و خنثی به‌طور جداگانه ردیابی شوند |
| SO-03 | تغییرات ناگهانی در احساسات باید شناسایی و گزارش شوند |
| SO-04 | داده‌های احساسات برای AI-010 قابل مصرف باشد          |

---

## 3. Scope

### Inside Scope

| حوزه           | توضیح                                 |
| -------------- | ------------------------------------- |
| تجمیع داده     | جمع‌آوری داده‌های تعامل از بازه زمانی |
| تحلیل روند     | شناسایی روندهای احساسی                |
| تشخیص ناهنجاری | شناسایی تغییرات ناگهانی در احساسات    |
| گزارش احساسات  | تولید گزارش احساسات بازه‌ای           |

### Outside Scope

| حوزه                | دلیل                  |
| ------------------- | --------------------- |
| تعامل تکی           | حوزه PRM-310..PRM-315 |
| Incident Assessment | حوزه PRM-318          |
| تحلیل عملکرد        | حوزه AI-010           |

---

## 4. Consumers

| مصرف‌کننده         | نقش                              | نوع مصرف |
| ------------------ | -------------------------------- | -------- |
| AI-009 (Community) | مشاهده و تحلیل احساسات           | Chain    |
| AI-010 (Analytics) | مصرف داده‌های احساسات برای تحلیل | System   |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-315 Output",
        "scope": ["interaction-record", "interaction-quality-score"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "historical-sentiment",
        "scope": ["baseline-scores", "trend-data"],
        "injection": "prepend",
        "required": false
      },
      {
        "type": "CTX-02",
        "source": "EDT-002",
        "scope": ["content-themes", "topic-categories"],
        "injection": "append",
        "required": false
      }
    ],
    "max_tokens": 5000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع    | دامنه                 | کاربرد              |
| ------- | --------------------- | ------------------- |
| PLAT-\* | داده‌های تعامل پلتفرم | منبع داده           |
| EDT-002 | دسته‌بندی موضوعی      | تحلیل بر اساس موضوع |

---

## 7. Variables

| متغیر                    | نوع    | اجباری | توضیح                         | اعتبارسنجی     |
| ------------------------ | ------ | ------ | ----------------------------- | -------------- |
| `observation_period`     | VAR-04 | بله    | بازه زمانی (ساعت/روز/هفته)    | min: 1h        |
| `interaction_records`    | VAR-06 | بله    | رکوردهای تعامل از PRM-315     | —              |
| `include_trend_analysis` | VAR-03 | خیر    | تحلیل روند در بازه‌های بلندتر | default: false |

---

## 8. Constraints

| ID     | محدودیت                                  |
| ------ | ---------------------------------------- |
| CST-01 | observation_period ≥ ۱ ساعت              |
| CST-02 | حداقل ۱۰ تعامل برای تحلیل معنی‌دار       |
| CST-03 | داده‌های تاریخی برای تحلیل روند لازم است |

---

## 9. Input Contract

| ورودی                    | نوع     | منبع    | اجباری |
| ------------------------ | ------- | ------- | ------ |
| `observation_period`     | number  | AI-009  | بله    |
| `interaction_records`    | array   | PRM-315 | بله    |
| `include_trend_analysis` | boolean | AI-009  | خیر    |

---

## 10. Output Contract

| خروجی                     | نوع     | توضیح                                     |
| ------------------------- | ------- | ----------------------------------------- |
| `sentiment_report`        | object  | گزارش احساسات بازه‌ای                     |
| `overall_sentiment_score` | number  | امتیاز کلی احساسات (۰–۱۰۰)                |
| `sentiment_breakdown`     | object  | تفکیک احساسات (positive/neutral/negative) |
| `trend_direction`         | string  | جهت روند (improving/stable/declining)     |
| `anomaly_detected`        | boolean | آیا ناهنجاری شناسایی شد                   |
| `key_topics`              | array   | موضوعات کلیدی با تغییر احساسات            |

---

## 11. Validation Rules

| ID     | قاعده                           | سطح    | نقض     |
| ------ | ------------------------------- | ------ | ------- |
| VAL-01 | observation_period ≥ ۱ ساعت     | معماری | عدم ثبت |
| VAL-02 | حداقل ۱۰ تعامل برای تحلیل       | معماری | هشدار   |
| VAL-03 | داده‌های تاریخی موجود برای روند | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                     | مسئول              |
| ----- | ----------------- | ------------------------- | ------------------ |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار             |
| QG-02 | Review → Approved | متدولوژی تحلیل معتبر      | Community Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper    |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                              |
| ------- | ------------------- | ------ | --------------------------------- |
| PRM-315 | DEP-01 (Requires)   | ^1.0.0 | رکوردهای تعامل برای تحلیل احساسات |
| EDT-002 | DEP-03 (References) | ^1.0.0 | دسته‌بندی موضوعی برای تحلیل       |

---

## 14. Human Override

| سناریو                  | اقدام                                      |
| ----------------------- | ------------------------------------------ |
| anomaly_detected = true | Escalation به Community Manager برای بررسی |
| تعداد تعامل کافی نیست   | تمدید بازه مشاهده                          |

---

## 15. Governance Notes

| ID     | یادداشت                                         |
| ------ | ----------------------------------------------- |
| GOV-01 | A-3 (Strategic) — گزارش‌های احساسات نیازمند ADR |
| GOV-02 | داده‌های احساسات برای AI-010 و AI-012 قابل مصرف |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-316",
  "name": "Sentiment Observation",
  "family": "FAM-OPS",
  "subfamily": "OPS-CMG",
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
    { "type": "CTX-04", "source": "PRM-315", "required": true },
    { "type": "CTX-04", "source": "historical-sentiment", "required": false },
    { "type": "CTX-02", "source": "EDT-002", "required": false }
  ],
  "max_tokens": 5000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "observation_period", "type": "VAR-04", "required": true },
    { "id": "interaction_records", "type": "VAR-06", "required": true },
    { "id": "include_trend_analysis", "type": "VAR-03", "required": false, "default": false }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["observation_period", "interaction_records"],
    "optional": ["include_trend_analysis"]
  },
  "output": {
    "required": ["sentiment_report", "overall_sentiment_score", "sentiment_breakdown"],
    "optional": ["trend_direction", "anomaly_detected", "key_topics"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Observation period >= 1 hour", "severity": "error" },
    {
      "id": "VAL-02",
      "description": "At least 10 interactions for analysis",
      "severity": "warning"
    },
    { "id": "VAL-03", "description": "Historical data available for trend", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-009", "AI-010"],
  "dependencies": ["PRM-315"],
  "documentation_refs": ["EDT-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                        | توسط        |
| ----------- | ---------- | ---------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — مشاهده احساسات | معمار سیستم |
