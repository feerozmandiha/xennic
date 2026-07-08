# Definition of Ready (DoR) — Xennic Platform

> No implementation may start until **all** DoR criteria pass.

---

## 1. DoR Checklist (Mandatory)

- [ ] **Gap ID** assigned and verified in master registry
- [ ] **ADR** exists or is being created
- [ ] **RFC** submitted and approved (if required by RFC category rules)
- [ ] **Acceptance criteria** defined and testable
- [ ] **Dependencies** identified and unblocked
- [ ] **Effort estimated** (hours) with confidence level
- [ ] **Risk assessment** completed
- [ ] **Rollback strategy** defined
- [ ] **Affected modules** identified (source + target)
- [ ] **Required libraries/packages** identified
- [ ] **Environment requirements** known (env vars, secrets, services)
- [ ] **Test strategy** defined (unit, integration, e2e)
- [ ] **Security impact** assessed (no regression, no new vulns)
- [ ] **Performance impact** assessed

---

## 2. DoR Exemptions

### Eligible categories

| Exemption | Criteria | Expiry |
|-----------|----------|--------|
| **Hotfix** | P0 security issue in production | Must be regularised within 1 sprint |
| **Trivial change** | Typo fix, dependency bump, comment-only change | None |

### Exemption approval process

1. Implementer requests exemption via a comment on the gap/ticket, stating the category and rationale.
2. Tech Lead approves or rejects within 4 business hours (P0) or 1 business day (trivial).
3. Approved exemptions are tagged `dor-exempt-{hotfix|trivial}` in the tracker.
4. Hotfixes must still pass the **Security** and **Rollback** sections of the DoD checklist.

---

## 3. DoR Review Process

### Reviewer

- **Tech Lead** is the default DoR reviewer.
- The Tech Lead may designate a **senior engineer** as reviewer for non-critical items.

### Documentation of pass / fail

- **Pass**: Reviewer checks the gap item as `dor-passed` in the tracker and links the completed checklist.
- **Fail**: Reviewer sets the gap to `dor-failed`, lists the blocking criteria, and assigns back to the implementer.

### Re-review triggers

- Any change in scope, dependencies, or acceptance criteria.
- More than 14 calendar days since the last DoR pass.
- New security or performance concern discovered during refinement.

---

## 4. DoR Template

Copy the following block into each implementation item before sprint planning:

```markdown
### DoR Checklist

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Gap ID assigned | ☐ | |
| 2 | ADR exists / being created | ☐ | |
| 3 | RFC submitted & approved | ☐ | N/A if exempt |
| 4 | Acceptance criteria defined & testable | ☐ | |
| 5 | Dependencies identified & unblocked | ☐ | |
| 6 | Effort estimated (hours) + confidence | ☐ | |
| 7 | Risk assessment completed | ☐ | |
| 8 | Rollback strategy defined | ☐ | |
| 9 | Affected modules (source → target) | ☐ | |
| 10 | Required libraries/packages identified | ☐ | |
| 11 | Environment requirements known | ☐ | |
| 12 | Test strategy defined | ☐ | |
| 13 | Security impact assessed | ☐ | |
| 14 | Performance impact assessed | ☐ | |

**Reviewer:** __________________ **Date:** ___________ **Result:** ☐ Pass ☐ Fail
```
