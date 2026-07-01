# Engineering Service — سرویس محاسبات مهندسی

**نسخه**: ۱.۰.۰ | **پورت**: ۸۰۰۱ | **زبان**: Python 3.12 | **فریم‌ورک**: FastAPI

---

## هدف

ارائه موتور محاسباتی تخصصی مهندسی برق برای تحلیل تجهیزات الکتریکی شامل موتورها، ترانسفورماتورها، سیستم‌های حفاظتی و کابل‌ها.

---

## ماژول‌های فعلی

| ماژول | توضیح |
|-------|--------|
| **Motor Analysis** | تحلیل موتور الکتریکی (توان، گشتاور، جریان، راندمان) |
| **Transformer Analysis** | تحلیل ترانسفورماتور (نسبت تبدیل، جریان اتصال کوتاه) |
| **Protection Analysis** | تحلیل حفاظت (رله حرارتی، مغناطیسی) |
| **Cable Analysis** | تحلیل کابل (افت ولتاژ، ظرفیت جریان) |

**نکته**: برای کاتالوگ کامل محاسباتی و فرمول‌های توسعه‌یافته برنامه‌ریزی‌شده، به `engineering/XENNIC_CALCULATION_CATALOG_v1.md` و `XENNIC_ENGINEERING_ENGINE_SPEC_v1.md` مراجعه کنید.

---

## API Endpoints

| مسیر | متد | توضیح |
|------|------|-------|
| `/api/v1/engineering/analysis/motor` | POST | تحلیل کامل موتور |
| `/api/v1/engineering/analysis/transformer` | POST | تحلیل ترانسفورماتور |
| `/api/v1/engineering/analysis/protection` | POST | تحلیل حفاظت |
| `/api/v1/engineering/analysis/cable` | POST | تحلیل کابل |
| `/api/v1/engineering/validate` | POST | اعتبارسنجی داده‌ها |
| `/health` | GET | health check |

---

## فرمت ورودی/خروجی

### Motor Analysis
**ورودی:**
```json
{
  "voltage": 380, "current": 8.5, "power": 5500,
  "power_factor": 0.85, "frequency": 50,
  "phases": 3, "speed": 1450
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
