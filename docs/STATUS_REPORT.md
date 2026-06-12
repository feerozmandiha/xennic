XENNIC — وضعیت توسعه (2026-06-06)
✅ تکمیل‌شده در این Session
Task	فایل‌ها	وضعیت
BUG-001: lastName getter	user.entity.ts, user-response.dto.ts	✅
RBAC Repositories	role/permission/audit-log.repository.ts	✅
RBAC Services	role.service.ts, permission.service.ts	✅
RBAC Controllers	role/permission.controller.ts	✅
Project Module (کامل)	۸ فایل	✅
TS Errors Fix	import type, toDate() helper	✅
📊 وضعیت Backend (NestJS) — apps/api
Module	Domain	Service	Repository	Controller	وضعیت
Health	—	✅	—	✅	✅ کامل
Auth	✅	✅	✅	✅	✅ کامل
User	✅	✅	✅	✅	✅ کامل
Workspace	✅	✅	✅	✅	⚠️ workspace_members جدول ناقص
RBAC	✅	✅	✅	✅	✅ کامل
Project	✅	✅	✅	✅	✅ کامل
Subscription	—	—	—	—	🔴 نشده
Billing	—	—	—	—	🔴 نشده
Storage/Files	—	—	—	—	🔴 نشده
Notification	—	—	—	—	🔴 نشده
Engineering (gateway)	—	—	—	—	🔴 نشده
AI (gateway)	—	—	—	—	🔴 نشده
📊 وضعیت Engineering Service (Python/FastAPI)
Calculator	کد	وضعیت
Ohm's Law	BASIC-001	✅
Active/Apparent/Reactive Power	BASIC-002/3/4	✅
Power Factor	BASIC-005	✅
Cable Ampacity	CABLE-001	✅
Voltage Drop	CABLE-002	✅
Short Circuit Withstand	CABLE-003	✅
PE Sizing	CABLE-004	✅
Transformer Sizing/Losses/Regulation/K-Factor	TRF-001..4	✅
MCCB Selection	PROT-001	✅
Power Quality (THD/TDD/IEEE519)	PQ-001..6	🔴 نشده
Solar Engineering	SOLAR-001..3	🔴 نشده
Earthing	EARTH-001..2	🔴 نشده
Lighting	LIGHT-001	🔴 نشده
Power System Studies	PS-001..2	🔴 نشده
Arc Flash	ARC-001	🔴 نشده
🗺️ اولویت‌های پیشنهادی — مرحله بعد
🔴 اولویت اول — تکمیل workspace_members
دلیل: WorkspaceGuard فعلاً فقط owner را تأیید می‌کند (TODO در کد).
تا این نشود، Project + RBAC guard ها به‌درستی multi-user کار نمی‌کنند.

فایل‌های نیاز:

workspace_member.entity.ts
workspace_member.repository.ts
اضافه کردن findMembers / addMember / removeMember به WorkspaceService
تکمیل isUserMember() در WorkspaceService
🟡 اولویت دوم — Engineering Gateway در NestJS
دلیل: Engineering Service (Python/FastAPI روی port 8001) هیچ اتصالی به NestJS ندارد.
کاربر باید از طریق NestJS API به محاسبات دسترسی داشته باشد.

فایل‌های نیاز:

engineering.module.ts
engineering-gateway.service.ts (HTTP proxy به port 8001)
engineering.controller.ts (forward کردن requests)
🟡 اولویت سوم — Power Quality Module
دلیل: از مهم‌ترین بخش‌های engineering service است.

🔵 اولویت چهارم — Subscription Module
دلیل: بدون آن plan-based access control کار نمی‌کند.