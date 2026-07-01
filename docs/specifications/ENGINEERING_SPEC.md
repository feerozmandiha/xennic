# مشخصات مهندسی — Engineering Specification

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **مالک**: Engineering Team | **آخرین بروزرسانی**: خرداد ۱۴۰۵ | **بازبینی بعدی**: شهریور ۱۴۰۵

---

## Purpose

مشخصات رسمی موتور مهندسی برق پلتفرم Xennic.

---

## Scope

Calculators, standards, validation, formulas.

---

## Contract

### Calculator Registry

| کد | دسته | محاسبات |
|----|------|---------|
| BASIC | Basic Electrical | 5 calculators |
| CABLE | Cable Sizing | 5 calculators |
| TRANSFORMER | Transformer | 5 calculators |
| PROTECTION | Protection Devices | 8 calculators |
| POWER_SYSTEM | Power Systems | 5 calculators |
| POWER_QUALITY | Power Quality | 8 calculators |
| RENEWABLE | Renewable Energy | 8 calculators |
| MOTOR | Motor | 5 calculators |
| LIGHTING | Lighting | 3 calculators |
| GROUNDING | Grounding | 3 calculators |
| SHORT_CIRCUIT | Short Circuit | 3 calculators |
| ARC_FLASH | Arc Flash | 3 calculators |
| LOAD_FLOW | Load Flow | 2 calculators |
| **Total** | | **63 calculators** |

### Standards
| استاندارد | دامنه |
|-----------|-------|
| IEC 60076, 60287, 60364, 60909, 60947, 61439, 62548 | IEC |
| IEEE 80, 519, 1584 | IEEE |
| NFPA 70E | NFPA |
| EN 12464 | CEN |

### Validation Pipeline
1. Input validation (type, range, format)
2. Business rules (domain logic)
3. Boundary checks (min/max)
4. Cross-field validation (relationships)

---

## Related Documents

| سند | مسیر |
|-----|------|
| Engineering Engine | `engineering/ENGINEERING_ENGINE.md` |
| Calculation Engine | `engineering/CALCULATION_ENGINE.md` |
| Formulas | `engineering/FORMULAS.md` |
| Eng Spec | `engineering/XENNIC_ENGINEERING_ENGINE_SPEC_v1.md` |
| Calc Catalog | `engineering/XENNIC_CALCULATION_CATALOG_v1.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
