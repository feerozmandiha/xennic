# Conversation Continuity — تداوم مکالمه

> **شناسه:** PRM-317
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Community Manager
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-315](./110-community-interaction-validation.md), [BRD-002](../22-BRAND/20-brand-voice.md), [EDT-002](../24-EDITORIAL/20-content-taxonomy.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                   |
| ------------------ | ----------------------- |
| **id**             | PRM-317                 |
| **name_fa**        | تداوم مکالمه            |
| **name_en**        | Conversation Continuity |
| **family**         | FAM-OPS                 |
| **subfamily**      | OPS-CMG                 |
| **type**           | PT-04                   |
| **complexity**     | C-2                     |
| **authority**      | A-2                     |
| **owner**          | Community Manager       |
| **version**        | 1.0.0-draft             |
| **status**         | draft                   |
| **security_level** | SL-01                   |

---

## 2. Purpose

PRM-317 تداوم مکالمه با کاربران در طول زمان و بین پلتفرم‌ها را مدیریت می‌کند. این پرامپت با نگهداری بافت مکالمه، شناسایی بازگشت کاربر و ادامه‌دهی طبیعی گفتگو، تجربه کاربری یکپارچه ایجاد می‌کند.

### اصول تداوم مکالمه

| ID    | اصل                                                 |
| ----- | --------------------------------------------------- |
| CC-01 | هر مکالمه باید بافت خود را در طول زمان حفظ کند      |
| CC-02 | بازگشت کاربر باید با ارجاع به تعامل قبلی همراه باشد |
| CC-03 | تداوم باید بین پلتفرم‌ها نیز برقرار باشد            |
| CC-04 | مکالمه نباید تکراری یا خسته‌کننده باشد              |

---

## 3. Scope

### Inside Scope

| حوزه                 | توضیح                              |
| -------------------- | ---------------------------------- |
| بافت مکالمه          | نگهداری و بازیابی تاریخچه تعامل    |
| بازگشت کاربر         | تشخیص کاربر بازگشتی و ادامه مکالمه |
| یکپارچگی بین‌پلتفرمی | تداوم مکالمه در پلتفرم‌های مختلف   |
| به‌روزرسانی بافت     | ثبت تعامل جدید در تاریخچه          |

### Outside Scope

| حوزه                | دلیل         |
| ------------------- | ------------ |
| تحلیل احساسات       | حوزه PRM-316 |
| Incident Assessment | حوزه PRM-318 |
| Handoff             | حوزه PRM-319 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                 | نوع مصرف |
| ------------------ | ------------------- | -------- |
| AI-009 (Community) | مدیریت تداوم مکالمه | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-315 Output",
        "scope": ["interaction-record", "validation-result"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-05",
        "source": "conversation-history",
        "scope": ["previous-interactions", "user-context"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "BRD-002",
        "scope": ["continuity-rules", "voice-consistency"],
        "injection": "append",
        "required": false
      }
    ],
    "max_tokens": 3000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع    | دامنه           | کاربرد                       |
| ------- | --------------- | ---------------------------- |
| BRD-002 | قواعد تداوم صدا | حفظ یکپارچگی صدا در طول زمان |

---

## 7. Variables

| متغیر                  | نوع    | اجباری | توضیح                      | اعتبارسنجی     |
| ---------------------- | ------ | ------ | -------------------------- | -------------- |
| `interaction_record`   | VAR-06 | بله    | رکورد تعامل جدید           | —              |
| `conversation_history` | VAR-06 | بله    | تاریخچه مکالمات قبلی       | —              |
| `cross_platform`       | VAR-03 | خیر    | آیا مکالمه بین‌پلتفرمی است | default: false |

---

## 8. Constraints

| ID     | محدودیت                                     |
| ------ | ------------------------------------------- |
| CST-01 | بافت مکالمه نباید بیش از ۳۰ روز نگهداری شود |
| CST-02 | هر تعامل باید در تاریخچه ثبت شود            |
| CST-03 | پاسخ نباید محتوای تکراری داشته باشد         |

---

## 9. Input Contract

| ورودی                  | نوع     | منبع    | اجباری |
| ---------------------- | ------- | ------- | ------ |
| `interaction_record`   | object  | PRM-315 | بله    |
| `conversation_history` | array   | AI-009  | بله    |
| `cross_platform`       | boolean | AI-009  | خیر    |

---

## 10. Output Contract

| خروجی                      | نوع     | توضیح                              |
| -------------------------- | ------- | ---------------------------------- |
| `continuity_context`       | object  | بافت به‌روزرسانی‌شده مکالمه        |
| `is_returning_user`        | boolean | آیا کاربر بازگشتی است              |
| `previous_interaction_ref` | string  | ارجاع به تعامل قبلی (در صورت وجود) |
| `continuity_score`         | number  | امتیاز تداوم مکالمه (۰–۱۰۰)        |
| `updated_history`          | array   | تاریخچه به‌روزرسانی‌شده            |

---

## 11. Validation Rules

| ID     | قاعده                         | سطح    | نقض     |
| ------ | ----------------------------- | ------ | ------- |
| VAL-01 | بافت مکالمه ≤ ۳۰ روز          | معماری | عدم ثبت |
| VAL-02 | تعامل جدید در تاریخچه ثبت شود | معماری | عدم ثبت |
| VAL-03 | پاسخ غیرتکراری                | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                  | مسئول              |
| ----- | ----------------- | ---------------------- | ------------------ |
| QG-01 | Draft → Review    | هویت کامل, input معتبر | خودکار             |
| QG-02 | Review → Approved | قواعد تداوم مشخص       | Community Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001         | Registry Keeper    |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                          |
| ------- | ------------------- | ------ | ----------------------------- |
| PRM-315 | DEP-01 (Requires)   | ^1.0.0 | رکورد تعامل برای تداوم مکالمه |
| BRD-002 | DEP-03 (References) | ^1.0.0 | قواعد تداوم صدا               |

---

## 14. Human Override

| سناریو                       | اقدام                           |
| ---------------------------- | ------------------------------- |
| continuity_score < ۵۰        | بازبینی دستی تداوم مکالمه       |
| cross_platform inconsistency | Escalation به Community Manager |

---

## 15. Governance Notes

| ID     | یادداشت                                          |
| ------ | ------------------------------------------------ |
| GOV-01 | A-2 (Tactical) — نیازمند تأیید Community Manager |
| GOV-02 | حریم خصوصی کاربر در نگهداری تاریخچه رعایت شود    |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-317",
  "name": "Conversation Continuity",
  "family": "FAM-OPS",
  "subfamily": "OPS-CMG",
  "type": "PT-04",
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
    { "type": "CTX-04", "source": "PRM-315", "required": true },
    { "type": "CTX-05", "source": "conversation-history", "required": true },
    { "type": "CTX-02", "source": "BRD-002", "required": false }
  ],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "interaction_record", "type": "VAR-06", "required": true },
    { "id": "conversation_history", "type": "VAR-06", "required": true },
    { "id": "cross_platform", "type": "VAR-03", "required": false, "default": false }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["interaction_record", "conversation_history"],
    "optional": ["cross_platform"]
  },
  "output": {
    "required": ["continuity_context", "is_returning_user", "updated_history"],
    "optional": ["previous_interaction_ref", "continuity_score"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Conversation context <= 30 days", "severity": "error" },
    { "id": "VAL-02", "description": "New interaction logged in history", "severity": "error" },
    { "id": "VAL-03", "description": "Response is non-repetitive", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-01",
  "consumers": ["AI-009"],
  "dependencies": ["PRM-315"],
  "documentation_refs": ["BRD-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                      | توسط        |
| ----------- | ---------- | -------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — تداوم مکالمه | معمار سیستم |
