# ADR-010 Testing Strategy

**نسخه**: ۱.۰.۰ | **وضعیت**: Accepted | **تاریخ**: خرداد ۱۴۰۵

---

## Problem

نیاز به راهبرد جامع تست‌نویسی برای تضمین کیفیت پلتفرم.

## Decision

Testing Pyramid با ابزارهای زیر:

1. **Unit Tests**: Vitest (NestJS), pytest (Python) — پوشش > 70%
2. **Integration Tests**: Supertest + Testcontainers — پوشش > 50%
3. **E2E Tests**: Playwright — پوشش > 30%
4. **Performance Tests**: k6 — بار ۱۰۰۰ کاربر هم‌زمان
5. **CI Integration**: GitHub Actions — اجرا در هر PR

## Alternatives

| گزینه | مزایا | معایب |
|-------|-------|-------|
| Testing Pyramid (chosen) | متوازن | زمان اجرا |
| E2E-heavy | پوشش زیاد | کند و شکننده |
| Unit-only | سریع | پوشش یکپارچه‌سازی کم |

## Consequences

### Pros
- پوشش تست در سه لایه
- CI integration
- قابلیت اطمینان بالا

### Cons
- زمان اجرای تست‌ها
- نگهداری تست‌های E2E

## Status

Accepted

## References

- `testing/TEST_STRATEGY.md`
- `testing/UNIT_TESTS.md`
- `testing/INTEGRATION_TESTS.md`
- `testing/E2E_TESTS.md`

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
