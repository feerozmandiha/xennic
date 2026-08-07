# مستند رسمی واسط‌های برنامه‌نویسی پلتفرم ذخیره‌سازی (Storage API Inventory)

========================================================================

**شناسه سند:** XENNIC-STORAGE-API-001  
**تاریخ سند:** ۲۸ تیر ۱۴۰۵ (2026-07-18)  
**نسخه هدف:** 1.1.0  
**مسئول تدوین:** دستیار معماری و حاکمیت Storage (شناسه: `XENNIC-STORAGE-ARCH-001`)  
**وضعیت واسط‌ها:** پیاده‌سازی شده / در حال ارتقا

این سند فهرست جامعی از تمام اندپوینت‌های فعال و پیشنهادی پلتفرم ذخیره‌سازی مرکزی زنیک را شامل متدهای احراز هویت، بدنه ورودی و فرمت خروجی توصیف می‌کند.

---

## ۱. فهرست اندپوینت‌های هسته ذخیره‌سازی (Core Storage APIs)

پایه آدرس روت تمام اندپوینت‌ها: `/api/v1/storage`

### ۱.۱. آپلود فایل جدید (Upload File)

- **آدرس:** `POST /upload`
- **فرمت ارسال:** `multipart/form-data`
- **محافظت امنیتی (Guards):** `JwtAuthGuard`, `WorkspaceGuard`, `PermissionsGuard`
- **مجوز دسترسی (Permission):** `files.upload`
- **هدرهای اجباری:**
  - `Authorization: Bearer <token>`
  - `x-workspace-id: <workspace_uuid>`
- **بدنه درخواست (Request Body):**
  - فیلد باینری با نام `file` (حداکثر حجم ۱۰۰ مگابایت)
- **پاسخ موفق (HTTP 201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "id": "1d8487b4-3580-4965-a827-6f77e68db35b",
      "workspaceId": "019f75f0-xennic-45be-9ab6-267035eb4450",
      "bucket": "documents",
      "filename": "73bb1fc7-cf25-46f9-bb83-cb5b3d7c390a.pdf",
      "originalName": "electrical_standards.pdf",
      "extension": "pdf",
      "mimeType": "application/pdf",
      "size": 1548292,
      "sizeHuman": "1.5 MB",
      "checksum": "a5e954c278de...",
      "uploadedBy": "user-uuid",
      "createdAt": "2026-07-18T10:14:00.000Z",
      "downloadUrl": "http://localhost:9000/documents/..."
    }
  }
  ```

### ۱.۲. لیست فایل‌های مستأجر (List Files)

- **آدرس:** `GET /files`
- **محافظت امنیتی (Guards):** `JwtAuthGuard`, `WorkspaceGuard`, `PermissionsGuard`
- **مجوز دسترسی (Permission):** `files.read`
- **پارامترهای جست‌وجو (Query Params):**
  - `page`: شماره صفحه (پیش‌فرض: 1)
  - `limit`: تعداد در هر صفحه (پیش‌فرض: 20)
  - `bucket`: فیلتر بر اساس نام باکت (اختیاری)
- **پاسخ موفق (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "1d8487b4-...",
        "workspaceId": "...",
        "bucket": "documents",
        "originalName": "electrical_standards.pdf",
        "sizeHuman": "1.5 MB",
        "createdAt": "2026-07-18T10:14:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
  ```

### ۱.۳. دریافت جزئیات فایل و آدرس دانلود موقت (Get File Details & URL)

- **آدرس:** `GET /files/:id`
- **محافظت امنیتی (Guards):** `JwtAuthGuard`, `WorkspaceGuard`, `PermissionsGuard`
- **مجوز دسترسی (Permission):** `files.read`
- **پارامتر مسیر (Param):** `:id` شناسه فایل (UUID)
- **پاسخ موفق (HTTP 200 OK):** بازگشت جزئیات کامل فایل مشابه آپلود به همراه لینک دانلود مستقیم یک‌ساعته (`downloadUrl`).

### ۱.۴. دانلود مستقیم فایل (Direct Binary Stream Download)

- **آدرس:** `GET /files/:id/download`
- **محافظت امنیتی (Guards):** `JwtAuthGuard`, `WorkspaceGuard`
- **مجوز دسترسی (Permission):** `files.read`
- **پارامتر مسیر (Param):** `:id` شناسه فایل (UUID)
- **نوع پاسخ:** جریان باینری (Buffer Stream) همراه با هدرهای `Content-Type` و `Content-Disposition`.

### ۱.۵. حذف نرم فایل (Soft Delete)

- **آدرس:** `DELETE /files/:id`
- **محافظت امنیتی (Guards):** `JwtAuthGuard`, `WorkspaceGuard`, `PermissionsGuard`
- **مجوز دسترسی (Permission):** `files.delete`
- **پاسخ موفق:** `HTTP 204 No Content` (تغییر وضعیت رکورد دیتابیس به حذف شده).

### ۱.۶. آمار فضای دیسک مصرفی (Storage Statistics)

- **آدرس:** `GET /stats`
- **محافظت امنیتی (Guards):** `JwtAuthGuard`, `WorkspaceGuard`
- **مجوز دسترسی (Permission):** `files.read`
- **پاسخ موفق (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "totalFiles": 142,
      "totalSizeBytes": 538291048,
      "totalSizeHuman": "513.3 MB"
    }
  }
  ```

### ۱.۷. بررسی وضعیت اتصال به آبجکت استوریج (Health Check)

- **آدرس:** `GET /health`
- **محافظت امنیتی (Guards):** فاقد گارد (عمومی)
- **پاسخ موفق (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "status": "ok",
      "buckets": ["public", "private", "reports", "documents", "engineering", "ai"]
    }
  }
  ```

---

## ۲. اندپوینت‌های پیشنهادی فاز یک هدف (Proposed APIs)

جهت رفع نواقص کشف‌شده در بخش ممیزی، اندپوینت‌های زیر در فاز یک اضافه خواهند شد:

### ۲.۱. دسترسی بدون فیلتر به دارایی‌های عمومی (Public Asset safe Route)

- **آدرس:** `GET /public/:id`
- **محافظت امنیتی (Guards):** **فاقد هرگونه گارد احراز هویت (Unauthenticated)**
- **پارامتر مسیر (Param):** `:id` شناسه فایل عمومی
- **شرح عملکرد:** این متد فورا فایل را از باکت عمومی `public` فراخوانی کرده و به مرورگر استریم می‌کند. در صورتی که فایل ارجاع داده شده در باکتی غیر از باکت `public` ذخیره شده باشد، سرویس موظف به بازگرداندن خطای `403 Forbidden` است تا از نشت اطلاعات حساس مستأجرین به خارج جلوگیری شود.

### ۲.۲. آپلود نسخه جدید فایل (Upload New Version)

- **آدرس:** `POST /files/:id/versions`
- **فرمت ارسال:** `multipart/form-data`
- **محافظت امنیتی (Guards):** `JwtAuthGuard`, `WorkspaceGuard`, `PermissionsGuard`
- **مجوز دسترسی (Permission):** `files.upload`
- **بدنه درخواست (Request Body):** فیلد باینری `file` با سایز مجاز.
- **پاسخ موفق (HTTP 201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "fileId": "1d8487b4-...",
      "version": 2,
      "path": "2026/07/version_file_name.pdf",
      "checksum": "checksum_v2...",
      "createdAt": "2026-07-18T11:00:00.000Z"
    }
  }
  ```

### ۲.۳. مشاهده تاریخچه نسخه‌ها (List Versions)

- **آدرس:** `GET /files/:id/versions`
- **محافظت امنیتی (Guards):** `JwtAuthGuard`, `WorkspaceGuard`
- **مجوز دسترسی (Permission):** `files.read`
- **پاسخ موفق (HTTP 200 OK):** لیست تمام نسخه‌های آرشیو شده به همراه شماره نسخه و تاریخ ایجاد جهت بازیابی یا لود نسخه‌های قدیمی‌تر.
