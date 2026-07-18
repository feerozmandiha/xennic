# Community Incident Assessment — ارزیابی حادثه اجتماعی

> **شناسه:** PRM-318
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Community Manager
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-316](./112-sentiment-observation.md), [PRM-317](./114-conversation-continuity.md), [BRD-001](../22-BRAND/10-brand-identity.md), [ARCH-030](../00-ARCHITECTURE/30-governance-architecture.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                         |
| ------------------ | ----------------------------- |
| **id**             | PRM-318                       |
| **name_fa**        | ارزیابی حادثه اجتماعی         |
| **name_en**        | Community Incident Assessment |
| **family**         | FAM-OPS                       |
| **subfamily**      | OPS-CMG                       |
| **type**           | PT-06                         |
| **complexity**     | C-3                           |
| **authority**      | A-3                           |
| **owner**          | Community Manager             |
| **version**        | 1.0.0-draft                   |
| **status**         | draft                         |
| **security_level** | SL-03                         |

---

## 2. Purpose

PRM-318 ارزیابی حوادث اجتماعی (Incidents) را در جامعه تعریف می‌کند. این پرامپت با تحلیل الگوهای غیرعادی، تجمع شکایات، حملات هماهنگ یا بحران‌های برند، شدت حادثه را تعیین و مسیر پاسخ مناسب را پیشنهاد می‌کند.

### اصول ارزیابی حادثه

| ID    | اصل                                                   |
| ----- | ----------------------------------------------------- |
| IA-01 | هر حادثه باید بر اساس شدت، دامنه و سرعت طبقه‌بندی شود |
| IA-02 | حوادث بحرانی نیازمند فعال‌سازی فوری Crisis Protocol   |
| IA-03 | ارزیابی باید مبتنی بر داده و قابل تکرار باشد          |
| IA-04 | گزارش حادثه باید برای AI-010, AI-012 قابل مصرف باشد   |

---

## 3. Scope

### Inside Scope

| حوزه          | توضیح                                      |
| ------------- | ------------------------------------------ |
| تشخیص حادثه   | شناسایی الگوهای غیرعادی و بحران            |
| طبقه‌بندی شدت | تعیین سطح بحران (low/medium/high/critical) |
| تحلیل دامنه   | ارزیابی تعداد کاربران و پلتفرم‌های درگیر   |
| توصیه اقدام   | پیشنهاد مسیر پاسخ و Escalation             |
| گزارش حادثه   | تولید گزارش جامع برای ذی‌نفعان             |

### Outside Scope

| حوزه           | دلیل                  |
| -------------- | --------------------- |
| تعامل روزمره   | حوزه PRM-310..PRM-315 |
| مشاهده احساسات | حوزه PRM-316          |
| Handoff نهایی  | حوزه PRM-319          |

---

## 4. Consumers

| مصرف‌کننده           | نقش                            | نوع مصرف |
| -------------------- | ------------------------------ | -------- |
| AI-009 (Community)   | ارزیابی حوادث اجتماعی          | Chain    |
| AI-010 (Analytics)   | مصرف داده‌های حادثه برای تحلیل | System   |
| AI-012 (Improvement) | یادگیری از حوادث برای بهبود    | System   |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-316, PRM-317",
        "scope": ["sentiment-report", "continuity-context"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "BRD-001",
        "scope": ["crisis-levels", "brand-protocols"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "ARCH-030",
        "scope": ["incident-response", "escalation-protocols"],
        "injection": "append",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "historical-incidents",
        "scope": ["past-incidents", "patterns"],
        "injection": "append",
        "required": false
      }
    ],
    "max_tokens": 6000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع     | دامنه                    | کاربرد                |
| -------- | ------------------------ | --------------------- |
| BRD-001  | سطوح بحران و پروتکل‌ها   | طبقه‌بندی شدت حادثه   |
| ARCH-030 | پروتکل‌های پاسخ به حادثه | تعیین مسیر پاسخ       |
| PLAT-\*  | محدودیت‌های پلتفرم       | دامنه حادثه در پلتفرم |

---

## 7. Variables

| متغیر                | نوع    | اجباری | توضیح                        | اعتبارسنجی  |
| -------------------- | ------ | ------ | ---------------------------- | ----------- |
| `sentiment_report`   | VAR-06 | بله    | گزارش احساسات از PRM-316     | —           |
| `continuity_context` | VAR-06 | بله    | بافت تداوم از PRM-317        | —           |
| `time_window_hours`  | VAR-04 | خیر    | پنجره زمانی برای تحلیل حادثه | default: 24 |

---

## 8. Constraints

| ID     | محدودیت                                              |
| ------ | ---------------------------------------------------- |
| CST-01 | حادثه با شدت critical نیازمند Escalation فوری        |
| CST-02 | ارزیابی باید در پنجره زمانی مشخص باشد                |
| CST-03 | گزارش حادثه باید برای AI-010 و AI-012 قابل مصرف باشد |

---

## 9. Input Contract

| ورودی                | نوع    | منبع    | اجباری |
| -------------------- | ------ | ------- | ------ |
| `sentiment_report`   | object | PRM-316 | بله    |
| `continuity_context` | object | PRM-317 | بله    |
| `time_window_hours`  | number | AI-009  | خیر    |

---

## 10. Output Contract

| خروجی                | نوع    | توضیح                                             |
| -------------------- | ------ | ------------------------------------------------- |
| `incident_report`    | object | گزارش کامل حادثه                                  |
| `incident_severity`  | string | شدت (low/medium/high/critical)                    |
| `incident_scope`     | object | دامنه (تعداد کاربران, پلتفرم‌ها, موضوعات)         |
| `recommended_action` | string | اقدام پیشنهادی (monitor/escalate/activate-crisis) |
| `incident_timestamp` | string | برچسب زمانی شناسایی                               |
| `downstream_package` | object | بسته تحویلی برای AI-010, AI-012                   |

---

## 11. Validation Rules

| ID     | قاعده                                  | سطح    | نقض     |
| ------ | -------------------------------------- | ------ | ------- |
| VAL-01 | severity = critical → escalation فوری  | معماری | عدم ثبت |
| VAL-02 | incident_scope کامل                    | معماری | هشدار   |
| VAL-03 | downstream_package برای AI-010, AI-012 | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                     | مسئول           |
| ----- | ----------------- | ------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار          |
| QG-02 | Review → Approved | پروتکل‌های بحران کامل     | Crisis Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper |

---

## 13. Dependencies

| شناسه    | نوع                 | نسخه   | دلیل                           |
| -------- | ------------------- | ------ | ------------------------------ |
| PRM-316  | DEP-01 (Requires)   | ^1.0.0 | گزارش احساسات برای تشخیص حادثه |
| PRM-317  | DEP-01 (Requires)   | ^1.0.0 | بافت تداوم برای تحلیل دامنه    |
| BRD-001  | DEP-03 (References) | ^1.0.0 | سطوح بحران برند                |
| ARCH-030 | DEP-03 (References) | ^1.0.0 | پروتکل‌های پاسخ                |
| PLAT-\*  | DEP-03 (References) | ^1.0.0 | محدودیت‌های پلتفرم             |

---

## 14. Human Override

| سناریو              | اقدام                          |
| ------------------- | ------------------------------ |
| severity = critical | Escalation فوری + Crisis Team  |
| false positive      | ثبت + به‌روزرسانی آستانه تشخیص |

---

## 15. Governance Notes

| ID     | یادداشت                                            |
| ------ | -------------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR برای Crisis Protocol |
| GOV-02 | SL-03 — اطلاعات حادثه محرمانه                      |
| GOV-03 | downstream_package برای AI-012 برای بهبود مستمر    |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-318",
  "name": "Community Incident Assessment",
  "family": "FAM-OPS",
  "subfamily": "OPS-CMG",
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
    { "type": "CTX-04", "source": "PRM-316", "required": true },
    { "type": "CTX-04", "source": "PRM-317", "required": true },
    { "type": "CTX-02", "source": "BRD-001", "required": true },
    { "type": "CTX-02", "source": "ARCH-030", "required": true },
    { "type": "CTX-04", "source": "historical-incidents", "required": false }
  ],
  "max_tokens": 6000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "sentiment_report", "type": "VAR-06", "required": true },
    { "id": "continuity_context", "type": "VAR-06", "required": true },
    { "id": "time_window_hours", "type": "VAR-04", "required": false, "default": 24 }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["sentiment_report", "continuity_context"],
    "optional": ["time_window_hours"]
  },
  "output": {
    "required": [
      "incident_report",
      "incident_severity",
      "recommended_action",
      "incident_timestamp"
    ],
    "optional": ["incident_scope", "downstream_package"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    {
      "id": "VAL-01",
      "description": "Critical severity triggers immediate escalation",
      "severity": "error"
    },
    { "id": "VAL-02", "description": "Incident scope is complete", "severity": "warning" },
    {
      "id": "VAL-03",
      "description": "Downstream package for AI-010, AI-012",
      "severity": "warning"
    }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-03",
  "consumers": ["AI-009", "AI-010", "AI-012"],
  "dependencies": ["PRM-316", "PRM-317"],
  "documentation_refs": ["BRD-001", "ARCH-030", "PLAT-*"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                               | توسط        |
| ----------- | ---------- | ----------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — ارزیابی حادثه اجتماعی | معمار سیستم |
