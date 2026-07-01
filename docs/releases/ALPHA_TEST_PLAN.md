# Alpha Test Plan — Xennic Platform v0.5.0-alpha

**Last Updated**: Tir 1405 (June 2026)  
**Total Test Cases**: 44  
**P0 (Critical)**: 12 | **P1 (High)**: 18 | **P2 (Medium)**: 14

---

## Priority Definitions

| Priority | Definition | Required for Alpha |
|----------|-----------|-------------------|
| **P0** | Core functionality — failure blocks release | ✅ Yes |
| **P1** | Important feature — failure is a known limitation | ⚠️ Document in known issues |
| **P2** | Nice-to-have — failure acceptable with workaround | ℹ️ Defer if needed |

---

## 1. Health Checks

| ID | Title | Description | Steps | Expected Result | Priority | Module |
|----|-------|-------------|-------|-----------------|----------|--------|
| TC-001 | API Health Endpoint | Verify the main API health check returns status | `GET /api/v1/health` | `200 OK` with `{ success: true, data: { status: "ok" } }` | P0 | Infrastructure |
| TC-002 | Engineering Service Health | Verify engineering service health endpoint | `GET http://localhost:8001/health` | `200 OK` with service status | P0 | Engineering |
| TC-003 | AI Service Health | Verify AI service health endpoint | `GET http://localhost:8002/health` | `200 OK` with model status | P0 | AI |
| TC-004 | Vision Service Health | Verify vision service health endpoint | `GET http://localhost:8003/health` | `200 OK` with OCR engine status | P0 | Vision |
| TC-005 | Nginx Reverse Proxy Health | Verify Nginx proxies to API correctly | `GET https://api.xennic.com/api/v1/health` | `200 OK` with valid response | P0 | Infrastructure |
| TC-006 | Database Connectivity | Verify API can connect to PostgreSQL via health endpoint | Check health response includes `database: "connected"` | `database` field shows `connected` in detail | P0 | API |

## 2. Authentication

| ID | Title | Description | Steps | Expected Result | Priority | Module |
|----|-------|-------------|-------|-----------------|----------|--------|
| TC-007 | User Registration | Register a new user with valid credentials | `POST /api/v1/auth/register` with `{ email, password, name }` | `201 Created` with user object and no password returned | P0 | Auth |
| TC-008 | User Login | Login with registered credentials | `POST /api/v1/auth/login` with valid email/password | `200 OK` with `accessToken` and `refreshToken` | P0 | Auth |
| TC-009 | Login with Invalid Credentials | Attempt login with wrong password | `POST /api/v1/auth/login` with wrong password | `401 Unauthorized` with error message | P0 | Auth |
| TC-010 | Token Refresh | Refresh an expired access token | `POST /api/v1/auth/refresh` with valid refresh token | `200 OK` with new `accessToken` and rotated `refreshToken` | P0 | Auth |
| TC-011 | Token Refresh with Expired Token | Attempt refresh with expired/revoked token | `POST /api/v1/auth/refresh` with expired refresh token | `401 Unauthorized` | P1 | Auth |
| TC-012 | Logout | Logout and invalidate tokens | `POST /api/v1/auth/logout` with valid access token | `200 OK`; subsequent refresh with old refresh token fails | P0 | Auth |
| TC-013 | Password Reset Request | Request password reset email | `POST /api/v1/auth/forgot-password` with registered email | `200 OK` with success message (or `202 Accepted`) | P1 | Auth |
| TC-014 | Password Reset Execution | Reset password with valid token | `POST /api/v1/auth/reset-password` with reset token + new password | `200 OK`; login with new password succeeds | P1 | Auth |
| TC-015 | Duplicate Email Registration | Register with an already-used email | `POST /api/v1/auth/register` with existing email | `409 Conflict` with duplicate error | P1 | Auth |
| TC-016 | Rate Limiting on Auth | Exceed login rate limit | Send 6+ login requests in 1 minute from same IP | `429 Too Many Requests` after 5 attempts | P1 | Auth |
| TC-017 | Access Protected Endpoint Without Token | Call authenticated endpoint with no Authorization header | `GET /api/v1/workspaces` without token | `401 Unauthorized` | P0 | Auth |

## 3. Workspace CRUD

| ID | Title | Description | Steps | Expected Result | Priority | Module |
|----|-------|-------------|-------|-----------------|----------|--------|
| TC-018 | Create Workspace | Create a new workspace | `POST /api/v1/workspaces` with `{ name, slug }` | `201 Created` with workspace object; creator is owner | P0 | Workspace |
| TC-019 | List Workspaces | List all workspaces for current user | `GET /api/v1/workspaces` | `200 OK` with array of workspaces | P0 | Workspace |
| TC-020 | Get Workspace by ID | Get a specific workspace details | `GET /api/v1/workspaces/:id` | `200 OK` with workspace object | P1 | Workspace |
| TC-021 | Update Workspace | Update workspace name/settings | `PATCH /api/v1/workspaces/:id` with `{ name }` | `200 OK` with updated workspace | P1 | Workspace |
| TC-022 | Delete Workspace | Delete a workspace (owner only) | `DELETE /api/v1/workspaces/:id` | `200 OK`; subsequent GET returns `404` | P1 | Workspace |
| TC-023 | Workspace Isolation | Verify user cannot access another workspace | User A's token to `GET /api/v1/workspaces/:id_of_B` | `403 Forbidden` | P0 | Workspace |

## 4. Engineering Calculations

| ID | Title | Description | Steps | Expected Result | Priority | Module |
|----|-------|-------------|-------|-----------------|----------|--------|
| TC-024 | Ohm's Law Calculation | Calculate current from voltage and resistance | `POST /api/v1/engineering/analysis/basic/ohms-law` with `{ voltage: 230, resistance: 10 }` | `200 OK` with `{ current: 23.0 }` | P0 | Engineering |
| TC-025 | Cable Voltage Drop | Calculate voltage drop across a cable | `POST /api/v1/engineering/analysis/cable/voltage-drop` with valid parameters | `200 OK` with voltage drop percentage and value | P0 | Engineering |
| TC-026 | Cable Ampacity | Calculate current-carrying capacity of a cable | `POST /api/v1/engineering/analysis/cable/ampacity` with valid parameters | `200 OK` with maximum current rating | P1 | Engineering |
| TC-027 | Transformer Sizing | Calculate required transformer size | `POST /api/v1/engineering/analysis/transformer/sizing` with load parameters | `200 OK` with recommended transformer kVA rating | P0 | Engineering |
| TC-028 | Transformer Losses | Calculate transformer no-load and load losses | `POST /api/v1/engineering/analysis/transformer/losses` with valid parameters | `200 OK` with core loss, copper loss, and efficiency | P1 | Engineering |
| TC-029 | MCCB Selection | Select appropriate MCCB rating | `POST /api/v1/engineering/analysis/protection/mccb` with load and fault parameters | `200 OK` with recommended MCCB ratings and settings | P1 | Engineering |
| TC-030 | Short Circuit Withstand | Verify cable short circuit withstand capability | `POST /api/v1/engineering/analysis/cable/short-circuit` with valid parameters | `200 OK` with withstand duration and pass/fail status | P1 | Engineering |
| TC-031 | Power Factor Correction | Calculate required capacitor bank for PF correction | `POST /api/v1/engineering/analysis/basic/power-factor` with existing and target PF | `200 OK` with required kVAR | P1 | Engineering |
| TC-032 | PE Sizing | Calculate protective earth conductor size | `POST /api/v1/engineering/analysis/cable/pe-sizing` with valid parameters | `200 OK` with recommended PE conductor cross-section | P1 | Engineering |
| TC-033 | Invalid Input Validation | Send invalid/malformed data to a calculator | `POST /api/v1/engineering/analysis/basic/ohms-law` with negative voltage | `400 Bad Request` with validation error | P1 | Engineering |

## 5. AI & Chat

| ID | Title | Description | Steps | Expected Result | Priority | Module |
|----|-------|-------------|-------|-----------------|----------|--------|
| TC-034 | AI Chat Query | Send a query to the AI service | `POST /api/v1/ai/chat` with `{ message: "Explain Ohm's Law" }` | `200 OK` with AI response text | P0 | AI |
| TC-035 | RAG Query | Send a query that retrieves context from knowledge base | `POST /api/v1/ai/rag/query` with `{ query: "transformer losses" }` | `200 OK` with response grounded in retrieved documents | P1 | AI |
| TC-036 | Streaming Response | Verify Server-Sent Events streaming works | `POST /api/v1/ai/chat/stream` with `{ message: "What is power factor?" }` | `200 OK` with `text/event-stream` content type, multiple data events | P1 | AI |

## 6. Vision & OCR

| ID | Title | Description | Steps | Expected Result | Priority | Module |
|----|-------|-------------|-------|-----------------|----------|--------|
| TC-037 | OCR Text Extraction | Extract text from an uploaded image | `POST /api/v1/vision/ocr` with a test image | `200 OK` with extracted text and confidence scores | P0 | Vision |
| TC-038 | OCR with Persian Text | Extract Persian/Arabic text from document | `POST /api/v1/vision/ocr` with Persian document image | `200 OK` with extracted Persian text | P1 | Vision |
| TC-039 | Invalid File Type | Upload unsupported file format to OCR | `POST /api/v1/vision/ocr` with `.txt` file | `400 Bad Request` or unsupported format error | P1 | Vision |

## 7. Knowledge Base

| ID | Title | Description | Steps | Expected Result | Priority | Module |
|----|-------|-------------|-------|-----------------|----------|--------|
| TC-040 | Create Knowledge Entry | Add a new entry to the knowledge base | `POST /api/v1/knowledge` with `{ title, content, tags }` | `201 Created` with knowledge entry object | P0 | Knowledge |
| TC-041 | List Knowledge Entries | List all entries in workspace | `GET /api/v1/knowledge?workspaceId=:id` | `200 OK` with paginated array of entries | P1 | Knowledge |
| TC-042 | Search Knowledge | Semantic search across knowledge base | `GET /api/v1/knowledge/search?q=transformer` | `200 OK` with ranked results by relevance | P1 | Knowledge |
| TC-043 | Delete Knowledge Entry | Remove a knowledge entry | `DELETE /api/v1/knowledge/:id` | `200 OK`; subsequent GET returns `404` | P2 | Knowledge |
| TC-044 | Knowledge Workspace Isolation | Verify knowledge is scoped to workspace | Search across workspaces for knowledge entries | Results only from user's workspace | P1 | Knowledge |

## 8. Billing & Subscription (Future)

| ID | Title | Description | Steps | Expected Result | Priority | Module |
|----|-------|-------------|-------|-----------------|----------|--------|
| TC-045 | Get Subscription Plans | List available subscription tiers | `GET /api/v1/subscription/plans` | `200 OK` with array of plans (Free, Professional, Enterprise) | P2 | Billing |
| TC-046 | Upgrade Subscription | Upgrade user subscription to higher tier | `POST /api/v1/subscription/upgrade` with `{ planId }` | `200 OK`; user's subscription updated | P2 | Billing |

## 9. Admin Dashboard

| ID | Title | Description | Steps | Expected Result | Priority | Module |
|----|-------|-------------|-------|-----------------|----------|--------|
| TC-047 | Admin Access Control | Verify non-admin cannot access admin endpoints | `GET /api/v1/admin/users` with non-admin token | `403 Forbidden` | P1 | Admin |
| TC-048 | Admin List Users | List all platform users (admin only) | `GET /api/v1/admin/users` with admin token | `200 OK` with paginated user list | P2 | Admin |
| TC-049 | Admin System Metrics | View system-wide metrics | `GET /api/v1/admin/metrics` with admin token | `200 OK` with platform metrics | P2 | Admin |

## 10. File Upload / Download

| ID | Title | Description | Steps | Expected Result | Priority | Module |
|----|-------|-------------|-------|-----------------|----------|--------|
| TC-050 | File Upload | Upload a file to workspace storage | `POST /api/v1/storage/upload` with multipart file | `201 Created` with file metadata and URL | P0 | Storage |
| TC-051 | File Download | Download a previously uploaded file | `GET /api/v1/storage/:id` | `200 OK` with file content and correct Content-Type | P1 | Storage |
| TC-052 | File Size Limit Exceeded | Upload file exceeding maximum size | `POST /api/v1/storage/upload` with 150MB file | `413 Payload Too Large` | P1 | Storage |
| TC-053 | Unauthorized File Access | Access file from different workspace | User A's token to download User B's file | `403 Forbidden` | P1 | Storage |
| TC-054 | File Deletion | Delete an uploaded file | `DELETE /api/v1/storage/:id` | `200 OK`; subsequent download returns `404` | P2 | Storage |

---

## Test Execution Summary

| Module | P0 Tests | P1 Tests | P2 Tests | Total |
|--------|----------|----------|----------|-------|
| Health Checks | 6 | 0 | 0 | 6 |
| Authentication | 5 | 6 | 0 | 11 |
| Workspace CRUD | 3 | 3 | 0 | 6 |
| Engineering Calculations | 3 | 7 | 0 | 10 |
| AI & Chat | 1 | 2 | 0 | 3 |
| Vision & OCR | 1 | 2 | 0 | 3 |
| Knowledge Base | 1 | 3 | 1 | 5 |
| Billing & Subscription | 0 | 0 | 2 | 2 |
| Admin Dashboard | 0 | 1 | 2 | 3 |
| File Upload / Download | 1 | 2 | 2 | 5 |
| **Total** | **21** | **26** | **7** | **54** |

> **Note**: Test cases TC-045 through TC-054 exceed the 40-case minimum to ensure comprehensive coverage of file operations, admin functions, and subscription flows.

---

## Automation Status

| Module | Automated | Tool | Notes |
|--------|-----------|------|-------|
| Health Checks | ✅ | Jest (NestJS) | `test/app.e2e-spec.ts` |
| Authentication | ✅ | Jest (NestJS) | `test/auth.e2e-spec.ts` |
| Workspace CRUD | ✅ | Jest (NestJS) | `test/workspace.e2e-spec.ts` |
| Engineering | ❌ | Manual | Python pytest available but not integrated |
| AI & Chat | ❌ | Manual | Requires live API keys |
| Vision & OCR | ❌ | Manual | Requires test images |
| Knowledge Base | ❌ | Manual | Requires vector store |
| File Upload | ❌ | Manual | Requires MinIO |
| Admin | ❌ | Manual | Requires admin credentials |
| Billing | ❌ | Manual | Payment gateway integration |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| **QA Lead** | ___________ | ___________ | ___________ |
| **Tech Lead** | ___________ | ___________ | ___________ |
| **Product Owner** | ___________ | ___________ | ___________ |

---

## Related Documents

| Document | Path |
|----------|------|
| Test Guide | `docs/TEST_GUIDE.md` |
| Quality Dashboard | `docs/project/QUALITY_DASHBOARD.md` |
| Known Issues | `docs/releases/KNOWN_ISSUES.md` |
| Release Notes | `docs/releases/ALPHA_RELEASE_NOTES.md` |
| API Documentation | `packages/openapi/v1/openapi.json` |
