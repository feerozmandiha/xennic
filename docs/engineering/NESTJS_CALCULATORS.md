# NestJS Engineering Calculators — ماشین‌حساب‌های مهندسی NestJS

**نسخه**: ۰.۴.۰ | **وضعیت**: فعال | **دامنه**: ماژول `engineering` (NestJS API)

---

## نمای کلی

ماژول مهندسی NestJS شامل **۱۳ دسته ماشین‌حساب** تخصصی مهندسی برق است که از طریق `apps/api/src/modules/engineering/` در دسترس هستند. این ماشین‌حساب‌ها با معماری Calculator Registry و Base Calculator طراحی شده‌اند.

تمامی ماشین‌حساب‌ها:
- دارای **ورودی، اعتبارسنجی، فرمول، استاندارد مرجع، نسخه، و خروجی** هستند
- قابل استناد و حسابرسی هستند
- از BaseCalculator ارث‌بری می‌کنند

---

## دسته‌بندی ماشین‌حساب‌ها

| دسته | مسیر calculators/ | تعداد |
|------|-------------------|-------|
| Basic | `basic/` | ۵ |
| Cable | `cable/` | ۵ |
| Transformer | `transformer/` | ۵ |
| Protection | `protection/` | ۸ |
| Power System | `power_system/` | ۵ |
| Power Quality | `power_quality/` | ۸ |
| Renewable | `renewable/` | ۸ |
| Lighting | `lighting/` | ۲ |
| Grounding | `grounding/` | ۱ |
| Economics | `economics/` | ۳ |
| Switchgear | `switchgear/` | ۱ |
| Energy Analyzer | `energy_analyzer/` | ۱ |
| Harmonic | `harmonic/` | ۱ |

---

## Basic (پایه)

| کد | نام | فرمول |
|----|------|-------|
| BASIC-001 | Ohm's Law | V = I × R |
| BASIC-002 | Active Power | P = V × I × PF |
| BASIC-003 | Apparent Power | S = V × I |
| BASIC-004 | Reactive Power | Q = √(S² - P²) |
| BASIC-005 | Power Factor | PF = P / S |

## Cable (کابل)

| کد | نام | استاندارد |
|----|------|-----------|
| CABLE-001 | Ampacity | IEC 60287 |
| CABLE-002 | Voltage Drop | IEC 60364 |
| CABLE-003 | Short Circuit Withstand | IEC 60949 |
| CABLE-004 | PE Conductor Sizing | IEC 60364 |
| CABLE-005 | Tray Sizing | IEC 60364 |

## Transformer (ترانسفورماتور)

| کد | نام | استاندارد |
|----|------|-----------|
| TRF-001 | Sizing | IEC 60076 |
| TRF-002 | Losses | IEC 60076 |
| TRF-003 | Voltage Regulation | IEC 60076 |
| TRF-004 | K-Factor | IEEE C57.110 |
| TRF-005 | Efficiency | IEC 60076 |

## Protection (حفاظت)

| کد | نام | استاندارد |
|----|------|-----------|
| PROT-001 | MCCB Selection | IEC 60947 |
| PROT-002 | Fuse Selection | IEC 60269 |
| PROT-003 | Short Circuit Calculation | IEC 60909 |
| PROT-004 | Coordination Study | IEC 60947 |
| PROT-005 | Selectivity Analysis | IEC 60947 |
| PROT-006 | Arc Flash | IEEE 1584 |
| PROT-007 | Arc Incident Energy | NFPA 70E |
| PROT-008 | Grounding Protection | IEEE 80 |

## Power System (سیستم قدرت)

| کد | نام | ابزار |
|----|------|-------|
| PS-001 | Load Flow | pandapower |
| PS-002 | Short Circuit (IEC 60909) | pandapower |
| PS-003 | Motor Starting | pandapower |
| PS-004 | Busbar Sizing | IEC 61439 |
| PS-005 | Network Builder | pandapower |

## Power Quality (کیفیت توان)

| کد | نام | استاندارد |
|----|------|-----------|
| PQ-001 | THD | IEEE 519 |
| PQ-002 | TDD | IEEE 519 |
| PQ-003 | K-Factor | IEEE C57.110 |
| PQ-004 | Resonance Analysis | IEC 61000 |
| PQ-005 | Passive Filter Design | IEC 61000 |
| PQ-006 | Active Filter Sizing | IEEE 519 |
| PQ-007 | Power Factor Correction | IEC 61000 |
| PQ-008 | Capacitor Bank Sizing | IEC 60871 |

## Renewable (تجدیدپذیر)

| کد | نام | استاندارد |
|----|------|-----------|
| SOLAR-001 | PV Array Sizing | IEC 62548 |
| SOLAR-002 | Inverter Sizing | IEC 61724 |
| SOLAR-003 | Battery Storage Sizing | IEC 61427 |
| SOLAR-004 | Battery Charger Sizing | IEC 61427 |
| SOLAR-005 | Solar + Battery | - |
| SOLAR-006 | Backup Time | - |
| SOLAR-007 | Motor Starting (Solar) | - |
| SOLAR-008 | Motor Efficiency | IEC 60034 |

## Lighting (روشنایی)

| کد | نام | استاندارد |
|----|------|-----------|
| LIGHT-001 | Lumen Method | EN 12464 |
| LIGHT-002 | Road Lighting | CIE 115 |

## سایر

| کد | نام | استاندارد |
|----|------|-----------|
| EARTH-001 | Grounding Grid Design | IEEE 80 |
| ECO-001 | ROI | - |
| ECO-002 | NPV | - |
| ECO-003 | IRR | - |
| SWG-001 | Main Switch Sizing | IEC 61439 |
| EA-001 | Energy Analysis | ISO 50001 |
| HARM-001 | Advanced Harmonic Analysis | IEEE 519 |

---

## معماری Calculator

```typescript
// base_calculator.ts
abstract class BaseCalculator {
  abstract id: string;
  abstract name: string;
  abstract description: string;
  abstract standard: string;
  abstract version: string;
  abstract validate(inputs: Record<string, any>): ValidationResult;
  abstract calculate(inputs: Record<string, any>): CalculationResult;
}
```

Calculator Registry:
```typescript
// registry.ts — Singleton
class CalculatorRegistry {
  private calculators: Map<string, BaseCalculator> = new Map();
  
  register(calculator: BaseCalculator): void { ... }
  get(id: string): BaseCalculator { ... }
  getAll(): BaseCalculator[] { ... }
}
```

---

## API Endpoints

| مسیر | متد | توضیح |
|------|------|-------|
| `/api/v1/engineering/calculate` | POST | اجرای محاسبه (با calculator_id در body) |
| `/api/v1/engineering/calculators` | GET | لیست ماشین‌حساب‌های موجود |
| `/api/v1/engineering/calculators/:id` | GET | جزئیات و schema یک ماشین‌حساب |
| `/api/v1/engineering/validate` | POST | فقط اعتبارسنجی ورودی |
| `/api/v1/engineering/history` | GET | سابقه محاسبات |
| `/api/v1/engineering/history/:id` | GET | جزئیات محاسبه |
