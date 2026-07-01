# [نام API] — قالب مستندات API

**نسخه**: ۱.۰.۰ | **وضعیت**: Draft | **آخرین بروزرسانی**: [تاریخ]

---

## Purpose

هدف این API چیست؟ چه مشکلی را حل می‌کند؟

---

## Scope

دامنه شمول: endpoints, authentication, rate limits.

---

## Endpoints

### `[METHOD] /api/v1/[path]`

| پارامتر | نوع | Required | توضیح |
|---------|-----|----------|-------|
| `[param]` | `[type]` | Yes/No | [توضیح] |

**Request:**
```json
{
  "example": "value"
}
```

**Response:**
```json
{
  "success": true,
  "data": {}
}
```

---

## Authentication

| روش | توضیح |
|-----|-------|
| [Bearer Token / API Key] | [توضیح] |

## Error Codes

| کد | HTTP | توضیح |
|----|------|-------|
| [ERR_XXX] | 400 | [توضیح] |

---

## Related Documents

| سند | مسیر |
|-----|------|
| API Reference | `api/API_REFERENCE.md` |
| API Design | `backend/API_DESIGN.md` |
| Error Handling | `backend/ERROR_HANDLING.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | [تاریخ] | انتشار اولیه |
