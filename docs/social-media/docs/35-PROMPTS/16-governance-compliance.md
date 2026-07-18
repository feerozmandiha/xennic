# Governance Compliance — انطباق با حکمرانی سازمانی

> **شناسه:** PRM-104
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** System Architect
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-103](./14-decision-framing.md), [ARCH-030](../00-ARCHITECTURE/30-governance-architecture.md), [ARCH-032](../00-ARCHITECTURE/32-ai-governance.md), [CON-000](../05-CONSTITUTION/00-constitution.md), [GOV-001](../10-GOVERNANCE/01-documentation-standards.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                     |
| ------------------ | ------------------------- |
| **id**             | PRM-104                   |
| **name_fa**        | انطباق با حکمرانی سازمانی |
| **name_en**        | Governance Compliance     |
| **family**         | FAM-STR                   |
| **subfamily**      | STR-DEC                   |
| **type**           | PT-06                     |
| **complexity**     | C-2                       |
| **authority**      | A-3                       |
| **owner**          | System Architect          |
| **version**        | 1.0.0-draft               |
| **status**         | draft                     |
| **security_level** | SL-03                     |

---

## 2. Purpose

PRM-104 اعتبارسنجی انطباق تصمیمات، استراتژی‌ها و برنامه‌های اجرایی SMOS با چارچوب حکمرانی سازمانی را تعریف می‌کند. این پرامپت از نوع Validation (PT-06) است و به عنوان گیت کیفیت حکمرانی عمل می‌کند.

### اصول انطباق

| ID    | اصل                                                            |
| ----- | -------------------------------------------------------------- |
| GC-01 | همه تصمیمات باید با CON-000 (قانون اساسی) مطابقت داشته باشند   |
| GC-02 | سطوح اختیار باید رعایت شوند — تصمیمات A-3/A-4 نیازمند ADR      |
| GC-03 | Risk Assessment برای همه تصمیمات با severity بالا اجباری است   |
| GC-04 | انطباق با برند (BRD-002) برای همه خروجی‌های محتوایی الزامی است |
| GC-05 | همه تصمیمات باید قابل حسابرسی (Auditable) باشند                |

---

## 3. Scope

### Inside Scope

| حوزه                         | توضیح                           |
| ---------------------------- | ------------------------------- |
| اعتبارسنجی انطباق با CON-000 | بررسی تطابق با اصول قانون اساسی |
| اعتبارسنجی سطوح اختیار       | بررسی تناسب تصمیم با سطح اختیار |
| اعتبارسنجی Risk              | بررسی ریسک‌های شناسایی‌شده      |
| اعتبارسنجی Brand Compliance  | بررسی انطباق با BRD-002         |
| Audit Trail Validation       | بررسی completeness مسیر حسابرسی |

### Outside Scope

| حوزه           | دلیل         |
| -------------- | ------------ |
| تدوین استراتژی | حوزه PRM-101 |
| تصمیم‌گیری     | حوزه PRM-103 |
| بازبینی محتوا  | حوزه PRM-202 |

---

## 4. Prompt Category

| دسته                    | مقدار                                    |
| ----------------------- | ---------------------------------------- |
| **Family**              | FAM-STR (Strategic)                      |
| **Subfamily**           | STR-DEC (Decision)                       |
| **Type**                | PT-06 (Validation)                       |
| **Composition Pattern** | CP-02 (Nested) — درون PRM-103 یا PRM-105 |
| **Layer**               | PLYR-01 (Governance)                     |

---

## 5. Supported Agents

| Agent                           | نقش                                       | نوع مصرف   |
| ------------------------------- | ----------------------------------------- | ---------- |
| AI-014 (Orchestrator)           | اعتبارسنجی نهایی قبل از اجرا              | Validation |
| AI-004 (Content Review)         | اعتبارسنجی انطباق محتوا با حکمرانی (مکمل) | Reference  |
| AI-012 (Continuous Improvement) | اعتبارسنجی تغییرات پیشنهادی               | Validation |

---

## 6. Supported Automation

| Workflow             | مصرف                                 |
| -------------------- | ------------------------------------ |
| AUT-Approval         | گیت کیفیت حکمرانی قبل از تأیید نهایی |
| AUT-Content Pipeline | اعتبارسنجی قبل از انتشار             |

---

## 7. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-06",
        "source": "ARCH-030",
        "scope": ["governance-rules", "decision-authorities", "compliance-thresholds"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-06",
        "source": "ARCH-032",
        "scope": ["ai-autonomy-limits", "ai-governance-rules"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-103 Output",
        "scope": ["decision-analysis", "recommendation", "risk-assessment", "escalation-flag"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "AI-014",
        "scope": ["session-context", "authority-chain"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 3000,
    "priority": "critical"
  }
}
```

---

## 8. Required Knowledge

| منبع        | دامنه                | کاربرد                                        |
| ----------- | -------------------- | --------------------------------------------- |
| CON-000     | قانون اساسی          | ۲۳ فصل, ۱۳۳ اصل — مبنای انطباق                |
| ARCH-030    | حکمرانی سازمانی      | RACI, Authority Matrix                        |
| ARCH-032    | حکمرانی AI           | محدودیت‌های خودکاری Agentها                   |
| GOV-001–005 | استانداردهای حکمرانی | مستندات، نسخه‌بندی، نام‌گذاری، ارجاع، فراداده |

---

## 9. Required Variables

| متغیر                  | نوع    | اجباری | توضیح                          | اعتبارسنجی                                                                |
| ---------------------- | ------ | ------ | ------------------------------ | ------------------------------------------------------------------------- |
| `decision_or_artifact` | VAR-06 | بله    | تصمیم یا خروجی برای اعتبارسنجی | —                                                                         |
| `authority_level_used` | VAR-04 | بله    | سطح اختیار اعمال‌شده           | members: [A-0, A-1, A-2, A-3, A-4]                                        |
| `compliance_domains`   | VAR-07 | خیر    | دامنه‌های انطباق مورد بررسی    | item_type: VAR-04, members: [constitution, authority, risk, brand, audit] |
| `risk_profile`         | VAR-06 | خیر    | ریسک‌های شناسایی‌شده           | —                                                                         |

---

## 10. Prompt Constraints

| ID     | محدودیت                                         |
| ------ | ----------------------------------------------- |
| CST-01 | انطباق با CON-000 برای همه خروجی‌ها اجباری است  |
| CST-02 | Authority Level باید با تصمیم مطابقت داشته باشد |
| CST-03 | Riskهای High/Critical نیازمند تأیید انسانی      |
| CST-04 | Audit Trail باید کامل و قابل ردیابی باشد        |
| CST-05 | Brand Compliance امتیاز ≥ ۶۰ از ۱۰۰             |

---

## 11. Prompt Composition

| الگو   | شناسه | شرح                                                |
| ------ | ----- | -------------------------------------------------- |
| Nested | CP-02 | درون PRM-103 (Decision Framing) به عنوان گیت خروجی |

---

## 12. Input Contract

| ورودی                  | نوع    | منبع            | اجباری |
| ---------------------- | ------ | --------------- | ------ |
| `decision_or_artifact` | object | PRM-103, AI-014 | بله    |
| `authority_level_used` | enum   | AI-014          | بله    |
| `compliance_domains`   | array  | انسان / AI-014  | خیر    |
| `risk_profile`         | object | PRM-103         | خیر    |

---

## 13. Output Contract

| خروجی                  | نوع     | توضیح                          |
| ---------------------- | ------- | ------------------------------ |
| `compliance_report`    | object  | گزارش انطباق شامل ابعاد مختلف  |
| `compliance_score`     | number  | امتیاز کلی انطباق (۰–۱۰۰)      |
| `violations`           | array   | تخلفات شناسایی‌شده با severity |
| `remediation_required` | boolean | آیا اصلاح لازم است             |
| `remediation_guidance` | array   | راهنمای اصلاح برای هر تخلف     |

---

## 14. Validation Rules

| ID     | قاعده                               | سطح    | نقض     |
| ------ | ----------------------------------- | ------ | ------- |
| VAL-01 | CON-000 compliance ≥ 90%            | معماری | عدم ثبت |
| VAL-02 | Authority level match               | معماری | عدم ثبت |
| VAL-03 | Risk High/Critical → human approval | معماری | عدم ثبت |
| VAL-04 | Audit trail complete                | معماری | هشدار   |
| VAL-05 | Brand compliance ≥ 60%              | معماری | هشدار   |
| VAL-06 | Governance score ≥ 70               | معماری | هشدار   |

---

## 15. Quality Gates

| گیت   | مکان              | معیار                                 | مسئول           |
| ----- | ----------------- | ------------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل، وابستگی به ARCH-030        | خودکار          |
| QG-02 | Review → Approved | انطباق با CON-000, ARCH-030, ARCH-032 | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)             | Registry Keeper |

---

## 16. Security Considerations

| ID     | ملاحظه                                                            |
| ------ | ----------------------------------------------------------------- |
| SEC-01 | گزارش انطباق SL-03 — حاوی اطلاعات حساس حکمرانی                    |
| SEC-02 | تخلفات شناسایی‌شده باید در audit log ثبت شوند                     |
| SEC-03 | Violation با severity critical باید به Governance Board گزارش شود |

---

## 17. Cross References

| سند                                                          | رابطه                                         |
| ------------------------------------------------------------ | --------------------------------------------- |
| [PRM-103](./14-decision-framing.md)                          | upstream — خروجی این سند را اعتبارسنجی می‌کند |
| [CON-000](../05-CONSTITUTION/00-constitution.md)             | reference — مبنای انطباق                      |
| [ARCH-030](../00-ARCHITECTURE/30-governance-architecture.md) | reference — چارچوب حکمرانی                    |
| [ARCH-032](../00-ARCHITECTURE/32-ai-governance.md)           | reference — حکمرانی AI                        |
| [GOV-\*](../10-GOVERNANCE/)                                  | reference — استانداردهای حکمرانی              |

---

## 18. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-104",
  "name": "Governance Compliance",
  "family": "FAM-STR",
  "subfamily": "STR-DEC",
  "type": "PT-06",
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
    { "type": "CTX-06", "source": "ARCH-030", "required": true },
    { "type": "CTX-06", "source": "ARCH-032", "required": true },
    { "type": "CTX-04", "source": "PRM-103", "required": true },
    { "type": "CTX-04", "source": "AI-014", "required": true }
  ],
  "max_tokens": 3000,
  "priority": "critical"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "decision_or_artifact", "type": "VAR-06", "required": true },
    {
      "id": "authority_level_used",
      "type": "VAR-04",
      "required": true,
      "members": ["A-0", "A-1", "A-2", "A-3", "A-4"]
    },
    { "id": "compliance_domains", "type": "VAR-07", "required": false },
    { "id": "risk_profile", "type": "VAR-06", "required": false }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["decision_or_artifact", "authority_level_used"],
    "optional": ["compliance_domains", "risk_profile"]
  },
  "output": {
    "required": ["compliance_report", "compliance_score", "violations", "remediation_required"],
    "optional": ["remediation_guidance"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "CON-000 compliance ≥ 90%", "severity": "error" },
    { "id": "VAL-02", "description": "Authority level match", "severity": "error" },
    { "id": "VAL-03", "description": "Risk High/Critical → human approval", "severity": "error" },
    { "id": "VAL-04", "description": "Audit trail complete", "severity": "warning" },
    { "id": "VAL-05", "description": "Brand compliance ≥ 60%", "severity": "warning" },
    { "id": "VAL-06", "description": "Governance score ≥ 70", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-03",
  "consumers": ["AI-014", "AI-004", "AI-012"],
  "dependencies": ["PRM-103", "ARCH-030", "ARCH-032", "CON-000"],
  "documentation_refs": [
    "CON-000",
    "ARCH-030",
    "ARCH-032",
    "GOV-001",
    "GOV-002",
    "GOV-003",
    "GOV-004",
    "GOV-005"
  ]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                   | توسط        |
| ----------- | ---------- | --------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — انطباق با حکمرانی سازمانی | معمار سیستم |
