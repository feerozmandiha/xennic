# Packages Reference — راهنمای پکیج‌های مشترک

**نسخه**: ۱.۰.۰ | **تعداد**: ۵ پکیج | **زبان**: TypeScript

---

## ۱. `@xennic/config` — تنظیمات مشترک

| فایل | توضیح |
|------|--------|
| `eslint.base.js` | ESLint config پایه |
| `tsconfig.base.json` | TypeScript config پایه (strict) |
| `src/env.ts` | Environment variables type-safe |
| `src/index.ts` | خروجی config |

---

## ۲. `@xennic/database` — ابزارهای دیتابیس

| فایل | توضیح |
|------|--------|
| `src/client.ts` | Prisma Client singleton |
| `src/tenant-context.ts` | ویژگی‌های tenant (workspace_id) |
| `src/tenant-extension.ts` | Prisma extension برای tenant isolation |
| `src/repositories/workspace.repository.ts` | Repository workspace |

**Tenant Context:**
```typescript
// هر query به طور خودکار workspace_id را اعمال می‌کند
const result = await prisma.motor.findMany({
  where: { workspace_id: tenantContext.getWorkspaceId() },
});
```

---

## ۳. `@xennic/shared` — ابزارهای عمومی

| مسیر | توضیح |
|------|--------|
| `src/constants/` | ثابت‌های عمومی |
| `src/errors/app-error.ts` | کلاس خطای سفارشی |
| `src/guards/is-defined.ts` | type guard |
| `src/logger/logger.ts` | Logger (Pino-based) |
| `src/result/result.ts` | Result pattern (Success/Failure) |
| `src/utils/` | توابع کمکی |

**Result Pattern:**
```typescript
const result = await userService.findById(id);
if (result.isFailure) {
  throw new AppError(result.error);
}
return result.value;
```

---

## ۴. `@xennic/types` — انواع TypeScript مشترک

| فایل | توضیح |
|------|--------|
| `src/base-entity.ts` | اینترفیس پایه موجودیت‌ها |
| `src/tenant-context.ts` | type TenantContext |
| `src/index.ts` | export types |

---

## ۵. `@xennic/openapi` — OpenAPI Specification

| مسیر | توضیح |
|------|--------|
| `v1/openapi.json` | auto-generated، **ویرایش دستی ممنوع** |

**تولید خودکار:**
```bash
pnpm generate:openapi  # از NestJS تولید می‌شود
```
