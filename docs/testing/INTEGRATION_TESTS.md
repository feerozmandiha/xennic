# تست یکپارچه‌سازی — Integration Tests

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

راهنمای تست یکپارچه‌سازی (Integration Tests) برای پلتفرم Xennic.

---

## Scope

API endpoints, database interactions, inter-service communication.

---

## Architecture

```mermaid
graph TB
    subgraph "Test Suite"
        API_TEST["API Integration Tests"]
        DB_TEST["Database Integration Tests"]
        INT_TEST["Inter-service Integration"]
    end
    
    API_TEST --> SU["Supertest"]
    API_TEST --> TEST_DB["Test Database\n(Isolated)"]
    DB_TEST --> TEST_DB
    DB_TEST --> PRISMA["Prisma Client"]
    INT_TEST --> TEST_BROKER["Test RabbitMQ"]
```

---

## Setup

```typescript
beforeAll(async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  
  app = moduleFixture.createNestApplication();
  await app.init();
});

afterAll(async () => {
  await app.close();
});
```

## Test Database

```yaml
database:
  test:
    url: postgresql://localhost:5432/xennic_test
    setup: prisma migrate deploy
    teardown: drop schema
    isolation: transaction rollback
```

---

## Related Documents

| سند | مسیر |
|-----|------|
| Test Strategy | `testing/TEST_STRATEGY.md` |
| Unit Tests | `testing/UNIT_TESTS.md` |
| E2E Tests | `testing/E2E_TESTS.md` |
| Database | `database/DATABASE_DESIGN.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
