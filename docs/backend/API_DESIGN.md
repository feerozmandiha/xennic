# طراحی API — API Design

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

استانداردها و اصول طراحی API در پلتفرم Xennic را توصیف می‌کند.

---

## Scope

تمامی APIهای REST پلتفرم: NestJS API، Vision Service، Engineering Service، AI Service.

---

## اصول طراحی

| اصل | توضیح |
|------|--------|
| **RESTful** | استفاده از HTTP methods و resource-based URLs |
| **API First** | طراحی API قبل از پیاده‌سازی |
| **OpenAPI 3.1** | مستندسازی خودکار با Swagger |
| **Versioned** | همه APIها با prefix `/api/v1` |
| **Stateless** | احراز هویت با JWT (بدون session) |
| **Consistent** | فرمت پاسخ یکتا در تمام سرویس‌ها |

---

## URL Structure

```
/api/v1/{domain}/{resource}[/{id}][/{action}]
```

مثال‌ها:
```
/api/v1/auth/login
/api/v1/engineering/motor
/api/v1/knowledge/123-abc
/api/v1/vision/nameplate/read
```

---

## فرمت پاسخ (Response Format)

### موفق
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### خطا
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "اعتبارسنجی ناموفق",
    "details": [
      { "field": "email", "message": "ایمیل نامعتبر است" }
    ]
  }
}
```

---

## HTTP Methods

| Method | کاربرد | مثال |
|--------|--------|------|
| `GET` | خواندن resource | `GET /api/v1/users` |
| `POST` | ایجاد resource | `POST /api/v1/auth/login` |
| `PUT` | به‌روزرسانی کامل | `PUT /api/v1/users/123` |
| `PATCH` | به‌روزرسانی جزئی | `PATCH /api/v1/users/123` |
| `DELETE` | حذف resource | `DELETE /api/v1/users/123` |

---

## HTTP Status Codes

| کد | معنی | موارد استفاده |
|----|-------|---------------|
| ۲۰۰ | OK | موفق |
| ۲۰۱ | Created | ایجاد resource |
| ۴۰۰ | Bad Request | خطای validation |
| ۴۰۱ | Unauthorized | نیاز به احراز هویت |
| ۴۰۳ | Forbidden | دسترسی غیرمجاز |
| ۴۰۴ | Not Found | resource یافت نشد |
| ۴۲۲ | Unprocessable Entity | خطای اعتبارسنجی |
| ۴۲۹ | Too Many Requests | rate limit |
| ۵۰۰ | Internal Server Error | خطای سرور |

---

## Validation

NestJS API از `class-validator` با تنظیمات زیر استفاده می‌کند:

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,              // حذف فیلدهای اضافی
  forbidNonWhitelisted: true,    // رد فیلدهای اضافی
  transform: true,               // تبدیل خودکار نوع
}));
```

---

## Pagination

### Request
```
GET /api/v1/knowledge?page=1&limit=20&sort=created_at&order=desc
```

### Response
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## نرخ‌گذاری (Rate Limiting)

| Tier | محدودیت |
|------|---------|
| Guest | ۱۰ req/min |
| Authenticated | ۶۰ req/min |
| Pro | ۳۰۰ req/min |
| Enterprise | ۱۰۰۰ req/min |

---

## Swagger / OpenAPI

| سرویس | آدرس |
|-------|------|
| NestJS API | http://localhost:3000/api/docs |
| Vision Service | http://localhost:8003/docs |
| Engineering Service | http://localhost:8001/docs |
| AI Service | http://localhost:8002/docs |

تولید خودکار OpenAPI:
```bash
pnpm generate:openapi
# خروجی: packages/openapi/v1/openapi.json
```

---

## Related Documents

| سند | مسیر |
|-----|------|
| Authentication | `backend/AUTHENTICATION.md` |
| Authorization | `backend/AUTHORIZATION.md` |
| Error Handling | `backend/ERROR_HANDLING.md` |
| API Reference | `api/API_REFERENCE.md` |
| API Spec | `deployment/XENNIC_API_SPEC_v1.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
