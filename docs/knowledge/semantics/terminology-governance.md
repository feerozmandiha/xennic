# حاکمیت اصطلاحات — Terminology Governance

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. Purpose (هدف)

Define the process for creating, modifying, deprecating, and removing terms from the Xennic engineering vocabulary.

---

## 2. New Term Approval Process (فرایند تأیید اصطلاح جدید)

| Step | Action | Responsible |
|------|--------|-------------|
| 1 | **Proposal**: Submit via form with term name (FA/EN), definition, domain, source | Requester |
| 2 | **Triage**: Check for duplicates, appropriate domain, need | KB Admin |
| 3 | **Review**: Domain expert review for accuracy | Domain Expert |
| 4 | **Standards Check**: Verify against existing standards terminology | Standards Liaison |
| 5 | **Conflict Resolution**: If similar term exists, decide merge or new entry | Terminology Steward |
| 6 | **Multi-language Check**: Verify Persian term accuracy | Language Reviewer |
| 7 | **Approval**: Knowledge Board or delegated authority | Knowledge Board |
| 8 | **Publication**: Add to vocabulary with new term_id | KB Admin |

---

## 3. Term Modification Process (فرایند تغییر اصطلاح)

| Type | Scope | Approval Required | Examples |
|------|-------|-------------------|----------|
| Minor | Direct fix by KB admin, logged | None | Typo, formatting |
| Moderate | Review by domain expert | Domain Expert | Definition clarification, additional alias |
| Major | Full approval process as new term | Knowledge Board | Meaning change, domain change |

---

## 4. Deprecation Process (فرایند منسوخ‌سازی)

| Step | Action |
|------|--------|
| 1 | Identify term as deprecated (superseded, incorrect, withdrawn) |
| 2 | Mark with status `deprecated` and provide reason |
| 3 | Add pointer to replacement term |
| 4 | Deprecated terms remain in system for backward compatibility (5 year retention) |
| 5 | AI services: prefer replacement, flag deprecated usage |

---

## 5. Versioning Policy (خط‌مشی نسخه‌بندی)

| Property | Rule |
|----------|------|
| Version number | Integer, starting at 1 |
| Increment | Any modification increments version |
| History | Version history maintained |
| API | Exposes current and historical versions |

---

## 6. Review Authority (مراجع تأیید)

| Action | Authority | Timeline |
|--------|-----------|----------|
| New term (Tier 1 domain) | Knowledge Board + Domain Expert | 5 business days |
| New term (Tier 2–5 domain) | Domain Expert | 3 business days |
| Minor modification | KB Admin | 1 business day |
| Major modification | Knowledge Board | 5 business days |
| Deprecation | Domain Expert + KB | 3 business days |

---

## 7. Roles (نقش‌ها)

| Role | FA | Responsibility |
|------|----|----------------|
| Terminology Steward | متولی اصطلاحات | Maintains vocabulary integrity, resolves conflicts |
| Domain Expert | کارشناس حوزه | Validates technical accuracy per domain |
| Language Reviewer | بازبین زبانی | Validates Persian/English translation quality |
| Standards Liaison | رابط استانداردها | Ensures alignment with IEC/ISIRI/Tavanir terminology |
