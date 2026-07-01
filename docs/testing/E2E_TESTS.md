# تست سرتاسری — E2E Tests

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

راهنمای تست سرتاسری (End-to-End) در پلتفرم Xennic.

---

## Scope

Critical user flows, multi-service scenarios, UI automation.

---

## Tooling

| ابزار | کاربرد |
|-------|--------|
| Playwright | Browser automation |
| Supertest | API chain testing |
| Docker Compose | Test environment |

---

## Flow

```mermaid
sequenceDiagram
    participant T as Test Runner
    participant UI as Browser (Playwright)
    participant API as API Server
    participant DB as Database
    
    T->>UI: Navigate to login page
    UI->>API: POST /auth/login
    API->>DB: Verify credentials
    DB-->>API: User found
    API-->>UI: Token response
    T->>UI: Fill calculation form
    UI->>API: POST /api/v1/calculations
    API->>API: Execute calculation
    API-->>UI: Result
    T->>UI: Verify result displayed
```

---

## Critical Flows

| اولویت | جریان | توضیح |
|--------|-------|-------|
| P0 | User Registration & Login | Auth flow |
| P0 | Project CRUD | Core functionality |
| P0 | Calculation Execution | Engineering core |
| P0 | Document Upload | AI pipeline |
| P1 | Subscription Purchase | Billing |
| P1 | Team Management | Collaboration |
| P2 | Report Generation | Export |
| P2 | Knowledge Search | RAG pipeline |

---

## Related Documents

| سند | مسیر |
|-----|------|
| Test Strategy | `testing/TEST_STRATEGY.md` |
| Integration Tests | `testing/INTEGRATION_TESTS.md` |
| CI/CD | `devops/CI_CD.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
