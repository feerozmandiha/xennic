# مشخصات API — API Specification

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **مالک**: Backend Team | **آخرین بروزرسانی**: خرداد ۱۴۰۵ | **بازبینی بعدی**: شهریور ۱۴۰۵

---

## Purpose

مشخصات رسمی API پلتفرم Xennic به عنوان قرارداد پیاده‌سازی.

---

## Scope

REST endpoints, authentication, response format, error handling.

---

## Contract

### Base URL
```
https://api.xennic.com/api/v1
```

### Response Format

Success:
```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

Error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ورودی نامعتبر",
    "details": []
  }
}
```

### Authentication
| Method | Location | Format |
|--------|----------|--------|
| Bearer Token | Authorization Header | JWT (RS256) |
| API Key | X-API-Key Header | UUID v4 |

### Rate Limiting
| Tier | Limit | Window |
|------|-------|--------|
| Public | 100 | 1 hour |
| Authenticated | 1000 | 1 hour |
| Professional | 10000 | 1 hour |

### Versioning
| Strategy | Location |
|----------|----------|
| URI Prefix | /api/v1/ |

---

## Related Documents

| سند | مسیر |
|-----|------|
| API Design | `backend/API_DESIGN.md` |
| API Reference | `api/API_REFERENCE.md` |
| Authentication | `backend/AUTHENTICATION.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
