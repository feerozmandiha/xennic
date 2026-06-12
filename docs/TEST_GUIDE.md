# Xennic API — Test Guide
**تاریخ:** 2026-06-06

---

## ۱. راه‌اندازی API

```bash
# از ریشه ~/xennic
pnpm --filter @xennic/api dev
```

API روی `http://localhost:3000` بالا می‌آید.
Swagger UI: `http://localhost:3000/api/docs`

---

## ۲. تست‌های ترتیبی (باید به همین ترتیب اجرا شوند)

### ── STEP 1: Health Check ────────────────────────────────────────

```bash
curl -s http://localhost:3000/api/v1/health | jq
```

**انتظار:**
```json
{ "status": "ok", "service": "xennic-api" }
```

---

### ── STEP 2: Register (ثبت‌نام) ──────────────────────────────────

```bash
curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "user-agent: test-client" \
  -d '{
    "email": "engineer@xennic.com",
    "firstName": "علی",
    "lastName": "احمدی",
    "password": "Test@1234",
    "phone": "+989121234567"
  }' | jq
```

**انتظار:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "...",
    "expiresIn": 900,
    "tokenType": "Bearer",
    "user": {
      "id": "...",
      "email": "engineer@xennic.com",
      "firstName": "علی",
      "lastName": "احمدی"
    }
  }
}
```

> ⚠️ `accessToken` را کپی کنید — در تمام تست‌های بعدی نیاز است.

---

### ── STEP 3: Login ────────────────────────────────────────────────

```bash
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "user-agent: test-client" \
  -d '{
    "email": "engineer@xennic.com",
    "password": "Test@1234"
  }' | jq
```

---

### ── STEP 4: Get Current User (/me) ─────────────────────────────

```bash
# TOKEN را با مقدار واقعی جایگزین کنید
TOKEN="eyJ..."

curl -s http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

**انتظار:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "engineer@xennic.com",
    "firstName": "علی",
    "lastName": "احمدی",
    "status": "active"
  }
}
```

---

### ── STEP 5: Create Workspace ────────────────────────────────────

```bash
curl -s -X POST http://localhost:3000/api/v1/workspaces \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "شرکت مهندسی برق ایران" }' | jq
```

**انتظار:**
```json
{
  "id": "...",
  "code": "SHRKT_MHNDY_...",
  "name": "شرکت مهندسی برق ایران",
  "isDeleted": false
}
```

> ⚠️ `id` workspace را کپی کنید.

---

### ── STEP 6: Get Workspaces ──────────────────────────────────────

```bash
curl -s http://localhost:3000/api/v1/workspaces \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

### ── STEP 7: Create Project ──────────────────────────────────────

```bash
WORKSPACE_ID="workspace-uuid-here"

curl -s -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "x-workspace-id: $WORKSPACE_ID" \
  -d '{
    "name": "پروژه برق‌رسانی کارخانه",
    "description": "طراحی سیستم برق کارخانه ۵ مگاوات",
    "startDate": "2026-07-01",
    "endDate": "2026-12-31"
  }' | jq
```

---

### ── STEP 8: List Projects ───────────────────────────────────────

```bash
curl -s http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-workspace-id: $WORKSPACE_ID" | jq
```

---

### ── STEP 9: Engineering Calculation (Ohm's Law) ─────────────────

```bash
curl -s -X POST http://localhost:3000/api/v1/engineering/calculations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "x-workspace-id: $WORKSPACE_ID" \
  -d '{
    "type": "BASIC-001",
    "inputs": {
      "current_a": 10.0,
      "resistance_ohm": 23.0
    }
  }' | jq
```

**انتظار:**
```json
{
  "success": true,
  "data": {
    "calculation": { "id": "...", "type": "BASIC-001" },
    "result": {
      "results": { "voltage_v": 230.0 }
    }
  }
}
```

> ⚠️ این endpoint نیاز به اجرای engineering-service (Python) دارد

---

### ── STEP 10: Engineering Health ────────────────────────────────

```bash
curl -s http://localhost:3000/api/v1/engineering/health \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-workspace-id: $WORKSPACE_ID" | jq
```

---

### ── STEP 11: Get Roles ──────────────────────────────────────────

```bash
curl -s http://localhost:3000/api/v1/roles \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

### ── STEP 12: Get Permissions ───────────────────────────────────

```bash
curl -s "http://localhost:3000/api/v1/permissions?domain=engineering" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## ۳. تست با Swagger UI

`http://localhost:3000/api/docs` را باز کنید:

1. روی **Authorize** کلیک کنید
2. `Bearer <TOKEN>` وارد کنید
3. هر endpoint را مستقیم تست کنید

---

## ۴. خطاهای رایج و راه‌حل

| خطا | دلیل | راه‌حل |
|-----|------|---------|
| `401 Unauthorized` | Token منقضی یا نادرست | دوباره Login کنید |
| `403 Forbidden` | x-workspace-id در header نیست | header اضافه کنید |
| `503 Service Unavailable` | Engineering service خاموش است | `python -m uvicorn src.main:app --port 8001` |
| `Connection refused` | API خاموش است | `pnpm --filter @xennic/api dev` |

---

## ۵. راه‌اندازی Engineering Service (برای تست STEP 9)

```bash
# در پنجره terminal جداگانه
cd ~/xennic/workspace/services/engineering-service
python -m uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```

Health check:
```bash
curl http://localhost:8001/health | jq
```
