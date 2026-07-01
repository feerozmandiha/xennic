# API Reference — مرجع API

**نسخه**: ۱.۰.۰ | **Prefix**: `/api/v1`

---

## فرمت پاسخ

### موفق
```json
{ "success": true, "data": { ... }, "meta": { "page": 1, "limit": 10, "total": 100 } }
```

### خطا
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }
```

---

## NestJS API — پورت ۳۰۰۰

### احراز هویت
| مسیر | متد | توضیح |
|------|------|-------|
| `/api/v1/auth/register` | POST | ثبت‌نام |
| `/api/v1/auth/login` | POST | ورود (JWT) |
| `/api/v1/auth/refresh` | POST | refresh token |
| `/api/v1/auth/profile` | GET | پروفایل |

### محاسبات مهندسی
| مسیر | متد | توضیح |
|------|------|-------|
| `/api/v1/engineering/motor` | POST | تحلیل موتور |
| `/api/v1/engineering/transformer` | POST | تحلیل ترانسفورماتور |
| `/api/v1/engineering/history` | GET | سابقه تحلیل‌ها |

### هوش مصنوعی
| مسیر | متد | توضیح |
|------|------|-------|
| `/api/v1/ai/chat` | POST | مکالمه |
| `/api/v1/ai/analyze` | POST | تحلیل متن |
| `/api/v1/ai/search` | POST | جستجوی دانش |

---

## Vision Service — پورت ۸۰۰۳

| مسیر | متد | توضیح |
|------|------|-------|
| `/api/v1/vision/upload` | POST | آپلود و تحلیل خودکار |
| `/api/v1/vision/nameplate/read` | POST | OCR پلاک |
| `/api/v1/vision/nameplate/analyze` | POST | OCR + تحلیل |
| `/api/v1/vision/bill/read` | POST | OCR قبض |
| `/api/v1/vision/ocr` | POST | OCR عمومی |
| `/health` | GET | health check |

---

## Engineering Service — پورت ۸۰۰۱

| مسیر | متد | توضیح |
|------|------|-------|
| `/api/v1/engineering/analysis/motor` | POST | تحلیل موتور |
| `/api/v1/engineering/analysis/transformer` | POST | تحلیل ترانسفورماتور |
| `/api/v1/engineering/validate` | POST | اعتبارسنجی |
| `/health` | GET | health check |

---

## AI Service — پورت ۸۰۰۲

| مسیر | متد | توضیح |
|------|------|-------|
| `/api/v1/ai/chat` | POST | مکالمه |
| `/api/v1/ai/embeddings` | POST | embedding |
| `/api/v1/ai/search` | POST | جستجوی برداری |
| `/api/v1/ai/knowledge` | POST | دانش فنی |
| `/health` | GET | health check |

---

## Swagger

| سرویس | آدرس |
|-------|------|
| NestJS API | http://localhost:3000/api/docs |
| Vision Service | http://localhost:8003/docs |
| Engineering Service | http://localhost:8001/docs |
| AI Service | http://localhost:8002/docs |
