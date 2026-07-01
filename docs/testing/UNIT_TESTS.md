# تست واحد — Unit Tests

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

راهنمای تست‌نویسی واحد (Unit Tests) در پلتفرم Xennic.

---

## Scope

NestJS services, Python modules, shared packages.

---

## Tools

| پلتفرم | فریم‌ورک | Runner |
|--------|----------|--------|
| NestJS (TS) | Vitest | Vitest CLI |
| Python | pytest | pytest |
| Shared packages | Vitest | Vitest CLI |

---

## Structure

```typescript
// NestJS Service Test
describe('CalculationService', () => {
  let service: CalculationService;
  let mockRepository: MockType<Repository<Calculation>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculationService,
        { provide: getRepositoryToken(Calculation), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<CalculationService>(CalculationService);
  });

  it('should calculate cable ampacity correctly', () => {
    const result = service.calculateAmpacity({ current: 100, temperature: 30 });
    expect(result.isValid).toBe(true);
    expect(result.value).toBeGreaterThan(0);
  });
});
```

## Naming Convention

```
[method/function] should [expected behavior] when [condition]
```

## Best Practices

| قانون | توضیح |
|-------|--------|
| Isolated | No database or network calls |
| Fast | Complete in milliseconds |
| Deterministic | Same input = same output |
| Readable | Clear test descriptions |
| One Assertion | Per test case |

---

## Related Documents

| سند | مسیر |
|-----|------|
| Test Strategy | `testing/TEST_STRATEGY.md` |
| Integration Tests | `testing/INTEGRATION_TESTS.md` |
| Coding Standards | `reference/CODING_STANDARDS.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
