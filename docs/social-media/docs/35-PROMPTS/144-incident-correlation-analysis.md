# Incident Correlation Analysis — تحلیل همبستگی رویداد

> **شناسه:** PRM-332
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Operations Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-331](./142-alert-prioritization-strategy.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                         |
| ------------------ | ----------------------------- |
| **id**             | PRM-332                       |
| **name_fa**        | تحلیل همبستگی رویداد          |
| **name_en**        | Incident Correlation Analysis |
| **family**         | FAM-OPS                       |
| **subfamily**      | OPS-MON                       |
| **type**           | PT-04                         |
| **complexity**     | C-3                           |
| **authority**      | A-3                           |
| **owner**          | Operations Lead               |
| **version**        | 1.0.0-draft                   |
| **status**         | draft                         |
| **security_level** | SL-02                         |

---

## 2. Purpose

PRM-332 هشدارهای اولویت‌بندی‌شده را تحلیل کرده و همبستگی بین رویدادهای مرتبط را شناسایی می‌کند. این پرامپت الگوهای تکرارشونده، رویدادهای مرتبط و خوشه‌های علّی را کشف می‌کند.

### اصول همبستگی

| ID    | اصل                                  |
| ----- | ------------------------------------ |
| IC-01 | رویدادهای همبسته باید خوشه‌بندی شوند |
| IC-02 | الگوهای تکرارشونده باید شناسایی شوند |
| IC-03 | رابطه علّی باید مستند شود            |

---

## 3. Scope

### Inside Scope

| حوزه       | توضیح                      |
| ---------- | -------------------------- |
| خوشه‌بندی  | گروه‌بندی رویدادهای مرتبط  |
| تشخیص الگو | شناسایی الگوهای تکرارشونده |
| تحلیل علّی | تعیین روابط علّی           |

### Outside Scope

| حوزه          | دلیل         |
| ------------- | ------------ |
| سلامت عملیاتی | حوزه PRM-333 |
| ارزیابی ریسک  | حوزه PRM-335 |

---

## 4. Consumers

| مصرف‌کننده         | نقش           | نوع مصرف |
| ------------------ | ------------- | -------- |
| AI-010 (Analytics) | تحلیل همبستگی | Chain    |

---

## 5. Inputs

| ورودی                | نوع   | منبع    | اجباری |
| -------------------- | ----- | ------- | ------ |
| `prioritized_alerts` | array | PRM-331 | بله    |

---

## 6. Outputs

| خروجی                  | نوع     | توضیح                  |
| ---------------------- | ------- | ---------------------- |
| `correlated_incidents` | array   | خوشه‌های رویداد همبسته |
| `pattern_insights`     | array   | الگوهای شناسایی‌شده    |
| `causal_links`         | array   | روابط علّی مستند       |
| `correlation_complete` | boolean | وضعیت تکمیل            |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-331 Output",
        "scope": ["prioritized-alerts", "priority-matrix"],
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

| منبع    | دامنه              | کاربرد              |
| ------- | ------------------ | ------------------- |
| PLAT-\* | الگوهای شناخته‌شده | تشخیص الگوهای مشابه |

---

## 9. Prompt Structure

PRM-332 سومین گام زنجیره OPS-MON. هشدارهای اولویت‌بندی‌شده را تحلیل همبستگی می‌کند.

```
PRM-331 → prioritized_alerts → PRM-332 → correlated_incidents → PRM-333
```

---

## 10. Variable Definitions

| متغیر                | نوع    | اجباری | توضیح                    | اعتبارسنجی |
| -------------------- | ------ | ------ | ------------------------ | ---------- |
| `prioritized_alerts` | VAR-06 | بله    | هشدارهای اولویت‌بندی‌شده | —          |
| `min_cluster_size`   | VAR-01 | خیر    | حداقل اندازه خوشه        | default: 2 |

---

## 11. Execution Constraints

| ID     | محدودیت                                   |
| ------ | ----------------------------------------- |
| CST-01 | هر رویداد حداکثر به یک خوشه تعلق دارد     |
| CST-02 | الگوهای شناسایی‌شده باید قابل تکرار باشند |

---

## 12. Validation Rules

| ID     | قاعده                                 | سطح    | نقض     |
| ------ | ------------------------------------- | ------ | ------- |
| VAL-01 | همه رویدادهای همبسته در خوشه‌ها باشند | معماری | عدم ثبت |
| VAL-02 | رابطه علّی مستند شده باشد             | معماری | هشدار   |

---

## 13. Failure Conditions

| شرط                  | اقدام                              |
| -------------------- | ---------------------------------- |
| هیچ همبستگی یافت نشد | بازگشت خوشه‌های خالی + اطلاع‌رسانی |
| خوشه با تناقض        | Escalation به Operations Lead      |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                     | مسئول           |
| ----- | ----------------- | ------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار          |
| QG-02 | Review → Approved | همبستگی کامل              | Operations Lead |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                              | توسط        |
| ----------- | ---------- | ---------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — تحلیل همبستگی رویداد | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-332",
  "name": "Incident Correlation Analysis",
  "family": "FAM-OPS",
  "subfamily": "OPS-MON",
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
  "sources": [{ "type": "CTX-04", "source": "PRM-331", "required": true }],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "prioritized_alerts", "type": "VAR-06", "required": true },
    { "id": "min_cluster_size", "type": "VAR-01", "required": false, "default": 2 }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["prioritized_alerts"],
    "optional": ["min_cluster_size"]
  },
  "output": {
    "required": ["correlated_incidents", "correlation_complete"],
    "optional": ["pattern_insights", "causal_links"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "All correlated events in clusters", "severity": "error" },
    { "id": "VAL-02", "description": "Causal relationships documented", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-010"],
  "dependencies": ["PRM-331"],
  "documentation_refs": ["PLAT-*"]
}
```
