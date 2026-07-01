# Engineering Engine — موتور محاسبات مهندسی برق

**نسخه**: ۱.۰.۰ | **وضعیت**: فعال

---

## ماژول‌های فعلی

### 1. Motor Analysis
| تابع | ورودی‌ها | خروجی‌ها |
|------|---------|---------|
| توان ظاهری | V, I, فاز | S (kVA) |
| توان حقیقی | V, I, فاز, PF | P (kW) |
| گشتاور | توان, دور | T (Nm) |
| جریان نامی | توان, V, PF | I (A) |
| راندمان | P_in, P_out | η (%) |

### 2. Transformer Analysis
| تابع | ورودی‌ها | خروجی‌ها |
|------|---------|---------|
| توان | V, I, فاز | S (kVA) |
| نسبت تبدیل | V1, V2 | Ratio |
| جریان اتصال کوتاه | S, V, Z% | I_sc (kA) |

### 3. Protection Analysis
- رله حرارتی: I_n, سرویس → I_set
- رله مغناطیسی: I_n, ضریب → I_mag

### 4. Cable Analysis
- افت ولتاژ: طول, I, A, ρ → ΔV
- ظرفیت جریان: نوع, سطح مقطع, دما → I_max

---

## فرمت ورودی/خروجی

### Motor Analysis
**ورودی:**
```json
{
  "voltage": 380, "current": 8.5, "power": 5500,
  "power_factor": 0.85, "frequency": 50, "phases": 3, "speed": 1450
}
```

**خروجی:**
```json
{
  "success": true,
  "data": {
    "apparent_power": 5.59,
    "real_power": 4.75,
    "torque": 36.2,
    "efficiency": 86.4
  }
}
```

> برای کاتالوگ کامل محاسباتی توسعه‌یافته به `XENNIC_CALCULATION_CATALOG_v1.md` و `XENNIC_ENGINEERING_ENGINE_SPEC_v1.md` مراجعه کنید.
