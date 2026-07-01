# قوانین اعتبارسنجی — Validation Rules

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

قوانین اعتبارسنجی (Validation) محاسبات مهندسی پلتفرم Xennic.

---

## Scope

Input validation, business rules, boundary checks.

---

## Validation Types

| نوع | توضیح | زمان |
|------|-------|------|
| **Input Validation** | نوع، محدوده، فرمت | قبل از محاسبه |
| **Business Rules** | قوانین مهندسی | حین محاسبه |
| **Boundary Checks** | محدوده مقادیر | بعد از محاسبه |
| **Cross-field Validation** | روابط بین فیلدها | بعد از محاسبه |

---

## Validation Rules

### General Rules
```typescript
const GENERAL_RULES = [
  { field: 'voltage', min: 0, max: 1000000, unit: 'V' },
  { field: 'current', min: 0, max: 10000, unit: 'A' },
  { field: 'power', min: 0, max: 100000000, unit: 'W' },
  { field: 'frequency', values: [50, 60], unit: 'Hz' },
  { field: 'phases', values: [1, 3], unit: '' },
  { field: 'power_factor', min: 0, max: 1, unit: '' },
  { field: 'speed', min: 0, max: 100000, unit: 'RPM' },
  { field: 'temperature', min: -40, max: 200, unit: '°C' },
];
```

### Domain-specific Rules
```typescript
const MOTOR_RULES = [
  { rule: 'power_voltage_match', check: (p, v) => p <= v * 1000 },
  { rule: 'speed_range', check: (rpm) => rpm >= 0 && rpm <= 20000 },
  { rule: 'power_factor_range', check: (pf) => pf >= 0.2 && pf <= 1.0 },
];

const CABLE_RULES = [
  { rule: 'max_voltage_drop', max: 0.05 }, // 5%
  { rule: 'min_conductor_size', min: 1.5 }, // mm²
  { rule: 'max_ambient_temp', max: 50 }, // °C
];
```

---

## Cross-field Rules

```typescript
const CROSS_FIELD_RULES = [
  // Power = Voltage × Current × Power Factor
  {
    rule: 'power_check',
    validate: (inputs) => {
      const { power, voltage, current, power_factor } = inputs;
      const calculated = voltage * current * power_factor;
      const diff = Math.abs(power - calculated) / calculated;
      return diff < 0.1; // Within 10%
    },
  },
  // Current should match standard sizes
  {
    rule: 'current_standard',
    validate: (inputs) => {
      const STANDARD_CURRENTS = [1, 2, 4, 6, 10, 16, 25, 32, 40, 63, 100, 160, 250, 400, 630];
      return STANDARD_CURRENTS.some(sc => Math.abs(inputs.current - sc) / sc < 0.1);
    },
  },
];
```

---

## Related Documents

| سند | مسیر |
|-----|------|
| Calculation Engine | `engineering/CALCULATION_ENGINE.md` |
| Formulas | `engineering/FORMULAS.md` |
| Engineering Engine | `engineering/ENGINEERING_ENGINE.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
