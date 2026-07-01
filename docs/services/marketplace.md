# Marketplace — بازارگاه محتوای مهندسی

**نسخه**: ۱.۰.۰ | **وضعیت**: فعال | **دامنه**: NestJS API (ماژول `marketplace`)

---

## نمای کلی

بازارگاه Xennic بستری برای خرید و فروش محصولات مهندسی برق شامل تجهیزات (کابل، ترانسفورماتور، MCCB و ...)، محتوای آموزشی، و خدمات مهندسی است.

---

## دیتابیس (۴ مدل Prisma)

### Vendors (فروشندگان)
```prisma
model vendors {
  id       String    @id @default(uuid())
  name     String
  slug     String    @unique
  status   String    @default("active")
  products products[]
}
```

### Products (محصولات)
```prisma
model products {
  id             String    @id @default(uuid())
  vendor_id      String
  type           String    // physical | digital | service
  category       String?   // cable | transformer | mccb | fuse | switchgear | lighting | ppe
  specifications Json?     // key-value specs
  sku            String    @unique
  price          Decimal
  currency       String    @default("USD")
  status         String    @default("active")
  translations   product_translations[]
  order_items    order_items[]
}
```

### Orders (سفارش‌ها)
| مدل | توضیح |
|------|--------|
| `orders` | سفارش با workspace_id, user_id, status, total_amount |
| `order_items` | آیتم‌های سفارش با quantity, unit_price |
| `product_translations` | ترجمه عنوان و توضیحات محصول |

---

## دسته‌بندی محصولات

| دسته | مثال |
|------|--------|
| `cable` | کابل‌های مسی و آلومینیومی |
| `transformer` | ترانسفورماتورهای توزیع و قدرت |
| `mccb` | کلیدهای کامپکت |
| `fuse` | فیوزها |
| `switchgear` | تابلوهای برق |
| `lighting` | تجهیزات روشنایی |
| `ppe` | تجهیزات حفاظت فردی |

---

## API Endpoints

| مسیر | متد | توضیح |
|------|------|-------|
| `/api/v1/marketplace/products` | GET | لیست محصولات |
| `/api/v1/marketplace/products` | POST | ایجاد محصول |
| `/api/v1/marketplace/products/:id` | GET | جزئیات محصول |
| `/api/v1/marketplace/products/:id` | PUT | ویرایش محصول |
| `/api/v1/marketplace/vendors` | GET | لیست فروشندگان |
| `/api/v1/marketplace/vendors` | POST | ثبت فروشنده |
| `/api/v1/marketplace/orders` | GET | لیست سفارش‌ها |
| `/api/v1/marketplace/orders` | POST | ثبت سفارش |
| `/api/v1/marketplace/orders/:id` | GET | جزئیات سفارش |
