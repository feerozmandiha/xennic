# Knowledge Registration Validation — اعتبارسنجی ثبت دانش

> **شناسه:** PRM-408
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Knowledge Architect
> **وابستگی:** PRM-407, [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                             |
| ------------------ | --------------------------------- |
| **id**             | PRM-408                           |
| **name_fa**        | اعتبارسنجی ثبت دانش               |
| **name_en**        | Knowledge Registration Validation |
| **family**         | FAM-KNW                           |
| **subfamily**      | KNW-RTR                           |
| **type**           | PT-06                             |
| **complexity**     | C-3                               |
| **authority**      | A-3                               |
| **owner**          | Knowledge Architect               |
| **version**        | 1.0.0-draft                       |
| **status**         | draft                             |
| **security_level** | SL-02                             |

---

## 2. Purpose

PRM-408 آخرین پرامپت زنجیره KNW-RTR. دانش نهایی را برای ثبت در پایگاه دانش سازمانی اعتبارسنجی می‌کند: صحت فراداده، یکتایی شناسه، کامل بودن ثبت و آمادگی برای مصرف.

### اصول ثبت

| ID    | اصل                                   |
| ----- | ------------------------------------- |
| KR-01 | هر دانش یک شناسه یکتا دارد            |
| KR-02 | فراداده کامل و مطابق استاندارد است    |
| KR-03 | دانش برای مصرف توسط Agentها آماده است |

---

## 3. Scope

### Inside Scope

| حوزه                   | توضیح                            |
| ---------------------- | -------------------------------- |
| اعتبارسنجی شناسه       | یکتایی و قالب شناسه دانش         |
| اعتبارسنجی فراداده     | کامل بودن فراداده طبق EDT-002    |
| اعتبارسنجی آمادگی مصرف | قابلیت استفاده توسط مصرف‌کنندگان |

### Outside Scope

| حوزه          | دلیل         |
| ------------- | ------------ |
| ارزیابی کیفیت | حوزه PRM-407 |
| استخراج مجدد  | حوزه PRM-405 |

---

## 4. Consumers

| مصرف‌کننده            | نقش                             | نوع مصرف      |
| --------------------- | ------------------------------- | ------------- |
| AI-011 (Knowledge)    | ثبت نهایی دانش                  | Chain         |
| AI-012 (Improvement)  | مصرف دانش ثبت‌شده               | Secondary     |
| AI-001 (Strategy)     | مصرف دانش ثبت‌شده برای استراتژی | Secondary     |
| AI-014 (Orchestrator) | نظارت بر تکمیل زنجیره           | Orchestration |

---

## 5. Inputs

| ورودی                   | نوع    | منبع    | اجباری |
| ----------------------- | ------ | ------- | ------ |
| `quality_assessment`    | object | PRM-407 | بله    |
| `normalized_concepts`   | array  | PRM-406 | بله    |
| `normalized_relations`  | array  | PRM-406 | خیر    |
| `registration_metadata` | object | AI-011  | بله    |

---

## 6. Outputs

| خروجی                  | نوع     | توضیح             |
| ---------------------- | ------- | ----------------- |
| `knowledge_asset`      | object  | دارایی دانش نهایی |
| `registration_id`      | string  | شناسه ثبت نهایی   |
| `registration_log`     | array   | گزارش ثبت         |
| `knowledge_registered` | boolean | وضعیت تکمیل نهایی |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-03",
        "source": "PRM-001",
        "scope": ["registry-format"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 2000,
    "priority": "high"
  }
}
```

---

## 8. Knowledge Requirements

| منبع    | دامنه    | کاربرد                     |
| ------- | -------- | -------------------------- |
| PRM-001 | قالب ثبت | اعتبارسنجی شناسه و فراداده |

---

## 9. Prompt Structure

PRM-408 آخرین گام زنجیره KNW-RTR. دانش نهایی را ثبت و رویداد تکمیل را صادر می‌کند.

```
quality_assessment + normalized_knowledge → PRM-408 → knowledge_asset → knowledge_registered
```

---

## 10. Variable Definitions

| متغیر                   | نوع    | اجباری | توضیح                                  | اعتبارسنجی                |
| ----------------------- | ------ | ------ | -------------------------------------- | ------------------------- |
| `quality_assessment`    | VAR-06 | بله    | ارزیابی کیفیت از PRM-407               | quality_assessment = pass |
| `normalized_concepts`   | VAR-05 | بله    | مفاهیم نهایی                           | منطبق با VAL-01..VAL-04   |
| `normalized_relations`  | VAR-05 | خیر    | روابط نهایی                            | —                         |
| `registration_metadata` | VAR-06 | بله    | فراداده ثبت شامل نویسنده, تاریخ, دامنه | —                         |

---

## 11. Execution Constraints

| ID     | محدودیت                       |
| ------ | ----------------------------- |
| CST-01 | شناسه دانش یکتا باشد          |
| CST-02 | فراداده کامل طبق PRM-001 باشد |
| CST-03 | کیفیت حداقل pass باشد         |

---

## 12. Validation Rules

| ID     | قاعده                      | سطح    | نقض                 |
| ------ | -------------------------- | ------ | ------------------- |
| VAL-01 | شناسه دانش یکتا است        | معماری | عدم ثبت             |
| VAL-02 | فراداده کامل است           | معماری | عدم ثبت             |
| VAL-03 | کیفیت قابل قبول است (pass) | معماری | بازگشت + escalation |
| VAL-04 | آمادگی مصرف تأیید شده است  | معماری | هشدار               |

---

## 13. Failure Conditions

| شرط                   | اقدام                                    |
| --------------------- | ---------------------------------------- |
| کیفیت قابل قبول نیست  | Escalation به AI-011 + بازگشت به PRM-407 |
| شناسه دانش تکراری است | تولید شناسه جدید + ثبت در log            |
| فراداده ناقص است      | بازگشت error + درخواست تکمیل             |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                          | مسئول           |
| ----- | ----------------- | ------------------------------ | --------------- |
| QG-01 | Draft → Review    | هویت کامل, ورودی PRM-407 معتبر | خودکار          |
| QG-02 | Review → Approved | ثبت کامل + AI-014 تأیید        | AI-014          |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)      | Registry Keeper |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                             | توسط        |
| ----------- | ---------- | --------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی ثبت دانش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-408",
  "name": "Knowledge Registration Validation",
  "family": "FAM-KNW",
  "subfamily": "KNW-RTR",
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
  "sources": [{ "type": "CTX-03", "source": "PRM-001", "required": true }],
  "max_tokens": 2000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "quality_assessment", "type": "VAR-06", "required": true },
    { "id": "normalized_concepts", "type": "VAR-05", "required": true },
    { "id": "normalized_relations", "type": "VAR-05", "required": false },
    { "id": "registration_metadata", "type": "VAR-06", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["quality_assessment", "normalized_concepts", "registration_metadata"],
    "optional": ["normalized_relations"]
  },
  "output": {
    "required": ["knowledge_asset", "registration_id", "knowledge_registered"],
    "optional": ["registration_log"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Knowledge identifier is unique", "severity": "error" },
    { "id": "VAL-02", "description": "Metadata is complete", "severity": "error" },
    { "id": "VAL-03", "description": "Quality is acceptable (pass)", "severity": "error" },
    { "id": "VAL-04", "description": "Consumption readiness confirmed", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-011", "AI-012", "AI-001", "AI-014"],
  "dependencies": ["PRM-407"],
  "documentation_refs": ["PRM-001"]
}
```
