# ADR-009 API Versioning Strategy

**نسخه**: ۱.۰.۰ | **وضعیت**: Accepted | **تاریخ**: خرداد ۱۴۰۵

---

## Problem

نیاز به راهبرد نسخه‌بندی API برای مدیریت backward compatibility.

## Decision

URI-based versioning با پیشوند `/api/v1/`:

1. **URI Prefix**: `/api/v{major}/`
2. **Major Version**: Breaking changes باعث افزایش major number
3. **Minor/Patch**: تغییرات backward-compatible بدون تغییر URI
4. **Deprecation**: APIهای deprecated با هدر `Sunset` اعلام می‌شوند
5. **Support Window**: هر major حداقل ۶ ماه پشتیبانی

## Alternatives

| گزینه | مزایا | معایب |
|-------|-------|-------|
| URI Prefix (chosen) | ساده، قابل کشف | URL طولانی |
| Header-based | URL پاک | سخت برای کشف |
| Query Parameter | ساده | آلودگی query |

## Consequences

### Pros
- کشف آسان endpoints
- پیاده‌سازی ساده
- تست‌پذیری بالا

### Cons
- تغییر URI هنگام breaking changes
- مشتریان باید URL را به‌روز کنند

## Status

Accepted

## References

- `specifications/API_SPEC.md`
- `backend/API_DESIGN.md`
- `project/VERSIONING.md`

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
