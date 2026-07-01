# Xennic Platform — Module Catalog

**Version**: 1.0.0 | **Last Updated**: Tir 1405 (June 2026) | **Status**: Active

---

## Overview

This document catalogs every module in the Xennic monorepo. Modules are grouped into five tiers: NestJS Backend, Frontend Features, Shared Packages, Python Microservices, and Infrastructure.

---

## Risk Level Definitions

| Risk | Meaning |
|------|---------|
| **CRITICAL** | Business-threatening; security, data loss, or core auth |
| **HIGH** | Significant impact on major feature or downstream modules |
| **MEDIUM** | Moderate impact; isolated to a single domain |
| **LOW** | Minimal disruption; well-tested or internal-only |

## Alpha Readiness

| Status | Meaning |
|--------|---------|
| **YES** | Feature-complete, tested, production-grade |
| **CONDITIONAL** | Core functionality works; gaps remain (coverage, edge cases) |
| **NO** | Not ready; WIP or placeholder |

---

# 1. NestJS Backend Modules (`apps/api/src/modules/`)

---

## 1.1 AppModule (Root)

| Field | Value |
|-------|-------|
| **Module Name** | `ApiModule` |
| **Description** | Root application module. Imports all feature modules and configures global ThrottlerModule (rate limiting: short 10/10s, medium 100/60s, long 1000/1h). |
| **Owner** | Backend Team |
| **Current Status** | Stable |
| **Public APIs** | `GET /` → `{ message: 'Hello World!' }` (health check placeholder) |
| **Internal APIs** | None |
| **Dependencies** | All feature modules, `@nestjs/throttler` |
| **Database Usage** | Indirect via imported modules |
| **External Services** | None |
| **Related Documents** | `docs/architecture/NESTJS_MODULES.md`, `docs/architecture/SYSTEM_ARCHITECTURE.md` |
| **Risk Level** | LOW |
| **Alpha Readiness** | YES |
| **Future Work** | Remove placeholder root endpoint |

---

## 1.2 AuthModule

| Field | Value |
|-------|-------|
| **Module Name** | `AuthModule` |
| **Description** | Authentication with JWT (RS256), Argon2id password hashing, session management, refresh token rotation, and password reset flow. Supports register, login, refresh, logout, forgot/reset/change password, and /me. |
| **Owner** | Backend Team |
| **Current Status** | Stable |
| **Public APIs** | `POST auth/register`, `POST auth/login`, `POST auth/refresh-token`, `POST auth/logout`, `GET auth/me`, `POST auth/forgot-password`, `POST auth/reset-password`, `PUT auth/change-password` |
| **Internal APIs** | `AuthService`, `JwtService` (exported for guards) |
| **Dependencies** | `UserModule`, `EmailModule`, `JwtModule`, `Argon2Service` |
| **Database Usage** | `users`, `sessions`, `refresh_tokens`, `password_reset_tokens` |
| **External Services** | None |
| **Related Documents** | `docs/architecture/XENNIC_AUTHORIZATION_SPEC_v1.md`, `docs/security/` |
| **Risk Level** | CRITICAL |
| **Alpha Readiness** | YES |
| **Future Work** | Add OAuth2/OIDC social login, WebAuthn/passkeys |

---

## 1.3 UserModule

| Field | Value |
|-------|-------|
| **Module Name** | `UserModule` |
| **Description** | User profile CRUD, hashing infrastructure (Argon2id). Manages user identity lifecycle within the platform. |
| **Owner** | Backend Team |
| **Current Status** | Stable |
| **Public APIs** | `UserController` — CRUD user profiles |
| **Internal APIs** | `UserService` (exported), `Argon2Service` (used by AuthModule) |
| **Dependencies** | None (repository-only) |
| **Database Usage** | `users` |
| **External Services** | None |
| **Related Documents** | `docs/api/`, `docs/architecture/NESTJS_MODULES.md` |
| **Risk Level** | HIGH |
| **Alpha Readiness** | YES |
| **Future Work** | Admin user management UI, bulk operations |

---

## 1.4 WorkspacesModule

| Field | Value |
|-------|-------|
| **Module Name** | `WorkspaceModule` |
| **Description** | Multi-tenant workspace management. CRUD workspaces, members, invitations, settings, and dashboard aggregation. Core tenant isolation boundary. |
| **Owner** | Backend Team |
| **Current Status** | Stable |
| **Public APIs** | `WorkspaceController`, `WorkspaceMemberController`, `InvitationAcceptController`, `WorkspaceSettingsController`, `DashboardController` |
| **Internal APIs** | `WorkspaceService`, `WorkspaceSettingsService`, `DashboardService` (all exported) |
| **Dependencies** | None explicit (standalone) |
| **Database Usage** | `workspaces`, `workspace_members`, `workspace_invitations`, `workspace_settings` |
| **External Services** | None |
| **Related Documents** | `docs/architecture/XENNIC_DATABASE_SPEC_v2.md`, `docs/architecture/SYSTEM_ARCHITECTURE.md` |
| **Risk Level** | CRITICAL |
| **Alpha Readiness** | YES |
| **Future Work** | Workspace analytics dashboard, workspace-level SSO |

---

## 1.5 RbacModule (Roles & Permissions)

| Field | Value |
|-------|-------|
| **Module Name** | `RbacModule` |
| **Description** | Role-Based Access Control with 12 roles, 136 permissions, audit logging, and authorization services. Includes `PermissionsGuard`, `WorkspaceGuard`, and `AuthorizationService`. |
| **Owner** | Backend Team |
| **Current Status** | Stable |
| **Public APIs** | `RoleController` — CRUD roles, `PermissionController` — CRUD permissions |
| **Internal APIs** | `AuthorizationService`, `RoleService`, `PermissionService` (all exported); `PermissionsGuard`, `WorkspaceGuard` |
| **Dependencies** | None |
| **Database Usage** | `roles`, `permissions`, `role_permissions`, `user_roles`, `audit_logs` |
| **External Services** | None |
| **Related Documents** | `docs/architecture/XENNIC_AUTHORIZATION_SPEC_v1.md` |
| **Risk Level** | CRITICAL |
| **Alpha Readiness** | YES |
| **Future Work** | ABAC policy engine, permission inheritance |

---

## 1.6 ProjectModule

| Field | Value |
|-------|-------|
| **Module Name** | `ProjectModule` |
| **Description** | Project CRUD within a workspace. Projects aggregate engineering calculations, notes, reports, and members. |
| **Owner** | Backend Team |
| **Current Status** | Stable |
| **Public APIs** | `ProjectController` — CRUD projects, members, notes |
| **Internal APIs** | `ProjectService` (exported) |
| **Dependencies** | `WorkspaceModule`, `RbacModule` |
| **Database Usage** | `projects`, `project_members`, `project_notes`, `project_reports` |
| **External Services** | None |
| **Related Documents** | `docs/backend/` |
| **Risk Level** | MEDIUM |
| **Alpha Readiness** | YES |
| **Future Work** | Project templates, Gantt charts, milestones |

---

## 1.7 EngineeringModule

| Field | Value |
|-------|-------|
| **Module Name** | `EngineeringModule` |
| **Description** | Engineering calculation management. Provides calculation catalog, executes calculations via Python engineering-service, proxies energy bill OCR and analysis. Plan-based access control (Free/Pro/Enterprise). |
| **Owner** | Engineering Team |
| **Current Status** | Stable |
| **Public APIs** | `GET engineering/calculations`, `POST engineering/calculations`, `GET engineering/calculations/:id`, `DELETE engineering/calculations/:id`, `GET engineering/catalog`, `GET engineering/health`, `POST engineering/energy/ocr-bill`, `POST engineering/energy/analyze`, `POST engineering/energy/manual-analyze`, `POST engineering/energy/ocr-preview` |
| **Internal APIs** | `EngineeringService`, `EngineeringClientService`, `ICalculationRepository` (all exported) |
| **Dependencies** | `WorkspaceModule`, `RbacModule`, `SubscriptionModule`, Python `engineering-service` (HTTP) |
| **Database Usage** | `calculations`, `calculation_templates` |
| **External Services** | Engineering Service (port 8001), Vision Service (port 8003 for OCR) |
| **Related Documents** | `docs/engineering/`, `docs/services/engineering-service.md` |
| **Risk Level** | HIGH |
| **Alpha Readiness** | CONDITIONAL |
| **Future Work** | Async calculation queue, real-time status via WebSocket, 50+ calculator types |

---

## 1.8 KnowledgeModule

| Field | Value |
|-------|-------|
| **Module Name** | `KnowledgeModule` |
| **Description** | Knowledge Management System — block-based content, multi-language, taxonomy (categories, topics, tags, disciplines, audiences), workflow (draft/review/publish), versioning, comments, analytics, and standards linking. |
| **Owner** | Content Team |
| **Current Status** | Stable |
| **Public APIs** | `KnowledgeController`, `KnowledgeStandardsController`, `PublicKnowledgeController`, `TaxonomyController` |
| **Internal APIs** | `KnowledgeService` (exported) |
| **Dependencies** | `WorkspaceModule`, `RbacModule` |
| **Database Usage** | `knowledge`, `knowledge_translations`, `knowledge_taxonomy`, `knowledge_media`, `knowledge_formulas`, `knowledge_examples`, `knowledge_standards`, `knowledge_versions`, `knowledge_comments`, `knowledge_workflows`, `knowledge_workflow_history`, `knowledge_analytics`, `categories`, `topics`, `tags`, `disciplines`, `audiences` |
| **External Services** | None |
| **Related Documents** | `docs/knowledge/`, `docs/specifications/` |
| **Risk Level** | MEDIUM |
| **Alpha Readiness** | CONDITIONAL |
| **Future Work** | AI-powered content suggestions, batch import/export, full-text search optimization |

---

## 1.9 AiModule

| Field | Value |
|-------|-------|
| **Module Name** | `AiModule` |
| **Description** | AI conversation management. Creates/manages conversations with LLM agents, tracks token usage and costs. Integrates with Python ai-service for LLM inference. |
| **Owner** | AI Team |
| **Current Status** | Active Development |
| **Public APIs** | `AiController` — conversation CRUD, message streaming |
| **Internal APIs** | `AiService`, `LlmProvider` (both exported) |
| **Dependencies** | `WorkspaceModule`, Python `ai-service` (HTTP) |
| **Database Usage** | `conversations`, `messages`, `agents`, `ai_usage` |
| **External Services** | AI Service (port 8002), OpenAI/Anthropic/Google APIs, Qdrant vector store |
| **Related Documents** | `docs/ai/`, `docs/services/` |
| **Risk Level** | MEDIUM |
| **Alpha Readiness** | CONDITIONAL |
| **Future Work** | Agent customization, RAG pipeline improvements, streaming optimizations |

---

## 1.10 NotificationModule

| Field | Value |
|-------|-------|
| **Module Name** | `NotificationModule` |
| **Description** | In-app and push notification delivery. Supports multi-channel (in-app, email, webhook). Queue-based sending via repository pattern. |
| **Owner** | Backend Team |
| **Current Status** | Stable |
| **Public APIs** | `NotificationController` — list, mark read, dismiss |
| **Internal APIs** | `NotificationService` (exported) |
| **Dependencies** | None |
| **Database Usage** | `notifications` |
| **External Services** | RabbitMQ (planned for async delivery) |
| **Related Documents** | `docs/backend/` |
| **Risk Level** | LOW |
| **Alpha Readiness** | CONDITIONAL |
| **Future Work** | Real-time WebSocket push, email notification channel, push notification (FCM/APNs) |

---

## 1.11 StorageModule

| Field | Value |
|-------|-------|
| **Module Name** | `StorageModule` |
| **Description** | File management with MinIO object storage. Upload, download, delete, version files. Supports multipart upload up to 100 MB, file versioning, and bucket lifecycle policies. |
| **Owner** | Backend Team |
| **Current Status** | Stable |
| **Public APIs** | `StorageController` — file CRUD, upload, download, version listing |
| **Internal APIs** | `StorageService`, `MinioService` (both exported) |
| **Dependencies** | `WorkspaceModule`, `RbacModule`, `@fastify/multipart` |
| **Database Usage** | `files`, `file_versions` |
| **External Services** | MinIO (S3-compatible, port 9000) |
| **Related Documents** | `docs/storage/`, `docs/architecture/SYSTEM_ARCHITECTURE.md` |
| **Risk Level** | MEDIUM |
| **Alpha Readiness** | CONDITIONAL |
| **Future Work** | Presigned URLs, CDN integration, upload progress tracking, file preview |

---

## 1.12 MarketplaceModule

| Field | Value |
|-------|-------|
| **Module Name** | `MarketplaceModule` |
| **Description** | Electrical equipment marketplace. Vendor, product, and order management with multi-language product translations. Products categorized by engineering domain (cable, transformer, MCCB, etc.). |
| **Owner** | Product Team |
| **Current Status** | Active Development |
| **Public APIs** | `VendorsController`, `ProductsController`, `OrdersController` |
| **Internal APIs** | `VendorService`, `ProductService`, `OrderService` |
| **Dependencies** | None (standalone) |
| **Database Usage** | `vendors`, `products`, `product_translations`, `orders`, `order_items` |
| **External Services** | None |
| **Related Documents** | `docs/specifications/` |
| **Risk Level** | LOW |
| **Alpha Readiness** | NO |
| **Future Work** | Shopping cart, payment gateway integration, vendor dashboard, RFQ system |

---

## 1.13 BillingModule

| Field | Value |
|-------|-------|
| **Module Name** | `BillingModule` |
| **Description** | Invoice and payment processing with Zarinpal gateway integration. Handles payment callbacks, invoice generation, and transaction recording. |
| **Owner** | Backend Team |
| **Current Status** | Active Development |
| **Public APIs** | `BillingController`, `BillingCallbackController` |
| **Internal APIs** | `BillingService`, `SubscriptionBillingService` (both exported); `ZARINPAL_GATEWAY` |
| **Dependencies** | `SubscriptionModule`, `WorkspaceModule`, `RbacModule` |
| **Database Usage** | `invoices`, `payments`, `transactions`, `payment_methods`, `subscription_payments` |
| **External Services** | Zarinpal payment gateway |
| **Related Documents** | `docs/backend/`, `docs/specifications/` |
| **Risk Level** | HIGH |
| **Alpha Readiness** | NO |
| **Future Work** | Multiple gateway support (PayPing, Stripe), recurring billing, invoice PDF generation |

---

## 1.14 SubscriptionModule

| Field | Value |
|-------|-------|
| **Module Name** | `SubscriptionModule` |
| **Description** | Plan and subscription management. Defines plans (Free/Pro/Enterprise), manages workspace subscriptions, and enforces feature-based access. |
| **Owner** | Backend Team |
| **Current Status** | Stable |
| **Public APIs** | `SubscriptionController`, `WorkspaceSubscriptionController` |
| **Internal APIs** | `SubscriptionService` (exported) |
| **Dependencies** | `WorkspaceModule`, `RbacModule` |
| **Database Usage** | `plans`, `subscriptions`, `usage_logs` |
| **External Services** | None |
| **Related Documents** | `docs/backend/` |
| **Risk Level** | HIGH |
| **Alpha Readiness** | CONDITIONAL |
| **Future Work** | Metered billing, usage alerts, plan downgrade/upgrade flows |

---

## 1.15 HealthModule

| Field | Value |
|-------|-------|
| **Module Name** | `HealthModule` |
| **Description** | Simple health check endpoint for the API service. Returns status, service name, and timestamp. |
| **Owner** | DevOps Team |
| **Current Status** | Stable |
| **Public APIs** | `GET health` → `{ status: 'ok', service: 'xennic-api', timestamp }` |
| **Internal APIs** | `HealthService` |
| **Dependencies** | None |
| **Database Usage** | None |
| **External Services** | None |
| **Related Documents** | `docs/monitoring/`, `docs/deployment/` |
| **Risk Level** | LOW |
| **Alpha Readiness** | YES |
| **Future Work** | Add database connectivity check, external service dependency checks |

---

## 1.16 AdminModule

| Field | Value |
|-------|-------|
| **Module Name** | `AdminModule` |
| **Description** | Platform administration — system settings, taxonomy management, user/workspace oversight. Protected by `AdminGuard` (`@SuperAdminOnly()`). |
| **Owner** | Backend Team |
| **Current Status** | Stable |
| **Public APIs** | `AdminController`, `AdminCheckController`, `AdminTaxonomyController` |
| **Internal APIs** | `AdminService` (exported), `AdminGuard` |
| **Dependencies** | `WorkspaceModule` |
| **Database Usage** | `system_settings` |
| **External Services** | None |
| **Related Documents** | `docs/admin/` |
| **Risk Level** | HIGH |
| **Alpha Readiness** | CONDITIONAL |
| **Future Work** | Admin analytics dashboard, user impersonation, audit log viewer |

---

## 1.17 SearchModule

| Field | Value |
|-------|-------|
| **Module Name** | `SearchModule` |
| **Description** | Global full-text search across workspaces, projects, calculations, knowledge, and marketplace products. |
| **Owner** | Backend Team |
| **Current Status** | Active Development |
| **Public APIs** | `SearchController` — unified search endpoint |
| **Internal APIs** | `SearchService` (exported) |
| **Dependencies** | `AuthModule`, `RbacModule`, `WorkspaceModule` |
| **Database Usage** | Full-text search across multiple tables via search repository |
| **External Services** | None |
| **Related Documents** | `docs/backend/` |
| **Risk Level** | MEDIUM |
| **Alpha Readiness** | NO |
| **Future Work** | Meilisearch/Elasticsearch integration, search ranking, faceted search |

---

## 1.18 StandardsModule

| Field | Value |
|-------|-------|
| **Module Name** | `StandardsModule` |
| **Description** | Engineering standards management (IEC, IEEE, ANSI, etc.). Standards link to knowledge articles and underpin calculation versions. |
| **Owner** | Engineering Team |
| **Current Status** | Stable |
| **Public APIs** | `StandardController` — CRUD engineering standards |
| **Internal APIs** | `StandardService` (exported) |
| **Dependencies** | `WorkspaceModule`, `RbacModule` |
| **Database Usage** | `engineering_standards` |
| **External Services** | None |
| **Related Documents** | `docs/engineering/`, `docs/standards/` |
| **Risk Level** | LOW |
| **Alpha Readiness** | CONDITIONAL |
| **Future Work** | Standard version comparison, compliance checking |

---

## 1.19 ApiKeysModule

| Field | Value |
|-------|-------|
| **Module Name** | `ApiKeysModule` |
| **Description** | API key management for programmatic access to the Xennic API. Keys are hashed at rest with workspace-level isolation. |
| **Owner** | Backend Team |
| **Current Status** | Active Development |
| **Public APIs** | `ApiKeyController` — CRUD API keys |
| **Internal APIs** | `ApiKeyService` (exported) |
| **Dependencies** | `WorkspaceModule`, `RbacModule` |
| **Database Usage** | `api_keys` |
| **External Services** | None |
| **Related Documents** | `docs/api/` |
| **Risk Level** | MEDIUM |
| **Alpha Readiness** | NO |
| **Future Work** | Key rotation, usage quotas, scoped permissions per key |

---

## 1.20 WebhooksModule

| Field | Value |
|-------|-------|
| **Module Name** | `WebhooksModule` |
| **Description** | Outgoing webhook delivery for platform events. Supports event-based triggers with HMAC signing. |
| **Owner** | Backend Team |
| **Current Status** | Active Development |
| **Public APIs** | `WebhookController` — CRUD webhook endpoints |
| **Internal APIs** | `WebhookService` (exported) |
| **Dependencies** | `WorkspaceModule`, `RbacModule` |
| **Database Usage** | `webhooks` |
| **External Services** | None (outgoing HTTP) |
| **Related Documents** | `docs/api/` |
| **Risk Level** | MEDIUM |
| **Alpha Readiness** | NO |
| **Future Work** | Retry logic with exponential backoff, event filtering, delivery logs |

---

## 1.21 EmailModule

| Field | Value |
|-------|-------|
| **Module Name** | `EmailModule` |
| **Description** | Email delivery service using Nodemailer. Handles transactional emails (password reset, invitations, notifications). |
| **Owner** | Backend Team |
| **Current Status** | Stable |
| **Public APIs** | `EmailController` — send test email |
| **Internal APIs** | `EmailService` (exported) |
| **Dependencies** | Nodemailer |
| **Database Usage** | Email templates stored via `EmailRepository` |
| **External Services** | SMTP server |
| **Related Documents** | `docs/backend/` |
| **Risk Level** | LOW |
| **Alpha Readiness** | YES |
| **Future Work** | Email template management, SendGrid/Mailgun provider, template variables |

---

## 1.22 FeatureFlagsModule

| Field | Value |
|-------|-------|
| **Module Name** | `FeatureFlagsModule` |
| **Description** | Feature flag management for controlling feature availability per plan or workspace. Includes an injectable `FeatureFlagGuard`. |
| **Owner** | Backend Team |
| **Current Status** | Stable |
| **Public APIs** | `FeatureFlagAdminController`, `FeatureFlagController` |
| **Internal APIs** | `FeatureFlagService`, `FeatureFlagGuard` (both exported) |
| **Dependencies** | None |
| **Database Usage** | `feature_flags` |
| **External Services** | None |
| **Related Documents** | `docs/backend/` |
| **Risk Level** | LOW |
| **Alpha Readiness** | YES |
| **Future Work** | A/B testing integration, gradual rollout percentages |

---

## 1.23 VisionModule

| Field | Value |
|-------|-------|
| **Module Name** | `VisionModule` |
| **Description** | Vision service integration — upload engineering drawings/single-line diagrams for OCR and analysis. Proxies to Python vision-service. |
| **Owner** | AI Team |
| **Current Status** | Active Development |
| **Public APIs** | `VisionUploadController` — upload and process engineering diagrams |
| **Internal APIs** | `VisionService`, `VisionClientService` (both exported) |
| **Dependencies** | `EngineeringModule`, `WorkspaceModule`, `RbacModule`, Python `vision-service` (HTTP) |
| **Database Usage** | None directly (uses StorageModule for file persistence) |
| **External Services** | Vision Service (port 8003), PaddleOCR, Tesseract |
| **Related Documents** | `docs/ai/`, `docs/services/` |
| **Risk Level** | MEDIUM |
| **Alpha Readiness** | NO |
| **Future Work** | SLD auto-routing, panel schedule extraction, CAD file parsing |

---

## 1.24 ConsultationsModule

| Field | Value |
|-------|-------|
| **Module Name** | `ConsultationsModule` |
| **Description** | Engineering consultation requests. Users can request expert consultations with AI-assisted triage. |
| **Owner** | Product Team |
| **Current Status** | Active Development |
| **Public APIs** | `ConsultationsController` — CRUD consultation requests |
| **Internal APIs** | `ConsultationsService` (exported) |
| **Dependencies** | `WorkspaceModule`, `SubscriptionModule`, `AiModule` (LLM provider) |
| **Database Usage** | Consultation entities |
| **External Services** | AI Service via LlmProvider |
| **Related Documents** | `docs/specifications/` |
| **Risk Level** | LOW |
| **Alpha Readiness** | NO |
| **Future Work** | Expert matching, scheduling, video consultation |

---

# 2. Frontend Feature Modules (`apps/web/src/features/`)

---

## 2.1 Auth

| Field | Value |
|-------|-------|
| **Module Name** | `Auth` |
| **Description** | Login, register, forgot-password, reset-password pages and auth flow hooks. |
| **Owner** | Frontend Team |
| **Current Status** | Stable |
| **Public APIs** | Login form, register form, forgot password form, AuthContext |
| **Internal APIs** | `useAuth` hook, auth service calls |
| **Dependencies** | `@xennic/shared`, i18n, `next-intl` |
| **Database Usage** | None |
| **External Services** | NestJS Auth API |
| **Related Documents** | `docs/frontend/` |
| **Risk Level** | HIGH |
| **Alpha Readiness** | YES |
| **Future Work** | OAuth flow UI, biometric auth support |

---

## 2.2 Landing

| Field | Value |
|-------|-------|
| **Module Name** | `Landing` |
| **Description** | Public landing/marketing pages. Showcases platform features, pricing, and value proposition. |
| **Owner** | Frontend Team |
| **Current Status** | Stable |
| **Public APIs** | Landing page components (hero, features, pricing, contact) |
| **Internal APIs** | None |
| **Dependencies** | i18n |
| **Database Usage** | None |
| **External Services** | None |
| **Related Documents** | `docs/frontend/` |
| **Risk Level** | LOW |
| **Alpha Readiness** | YES |
| **Future Work** | SEO optimization, blog integration, case studies |

---

## 2.3 Dashboard

| Field | Value |
|-------|-------|
| **Module Name** | `Dashboard` |
| **Description** | Main workspace dashboard showing recent calculations, projects, AI conversations, and activity feed. |
| **Owner** | Frontend Team |
| **Current Status** | Stable |
| **Public APIs** | Dashboard widgets, activity feed, statistics cards |
| **Internal APIs** | Workspace dashboard API calls |
| **Dependencies** | `WorkspaceModule`, `DashboardService` |
| **Database Usage** | None (client-side) |
| **External Services** | NestJS API |
| **Related Documents** | `docs/frontend/` |
| **Risk Level** | LOW |
| **Alpha Readiness** | YES |
| **Future Work** | Customizable widgets, drag-and-drop layout |

---

## 2.4 Engineering

| Field | Value |
|-------|-------|
| **Module Name** | `Engineering` |
| **Description** | Engineering calculation UI — 40+ calculation types across 10 categories (Basic, Cable, Transformer, Protection, Power Quality, Power System, Switchgear, Grounding, Renewable, Economics, Lighting, Harmonic). Calculator input forms, results visualization, and history. |
| **Owner** | Frontend Team |
| **Current Status** | Stable |
| **Public APIs** | Calculator components, category listing, input forms, result renderers |
| **Internal APIs** | Engineering API calls, catalog fetcher |
| **Dependencies** | `@xennic/shared`, i18n, charting library |
| **Database Usage** | None (client-side) |
| **External Services** | NestJS Engineering API, Engineering Service |
| **Related Documents** | `docs/engineering/`, `docs/frontend/` |
| **Risk Level** | HIGH |
| **Alpha Readiness** | CONDITIONAL |
| **Future Work** | Real-time calculation preview, comparison mode, batch calculations |

---

## 2.5 Power System Studies

| Field | Value |
|-------|-------|
| **Module Name** | `Power System Studies` |
| **Description** | Power system analysis UI — load flow, short circuit, motor starting, busbar sizing, network builder. Integrated into the Engineering feature. |
| **Owner** | Engineering Team |
| **Current Status** | Stable |
| **Public APIs** | Power system study components |
| **Internal APIs** | Engineering API calls |
| **Dependencies** | Engineering feature |
| **Database Usage** | None |
| **External Services** | Engineering Service (Python) |
| **Related Documents** | `docs/engineering/power-system.md` |
| **Risk Level** | MEDIUM |
| **Alpha Readiness** | CONDITIONAL |
| **Future Work** | Load flow visualization, one-line diagram editor |

---

## 2.6 AI Chat

| Field | Value |
|-------|-------|
| **Module Name** | `AI Chat` |
| **Description** | AI assistant chat interface. Conversations with Electrical Engineer and Document Analyst agents. Supports streaming responses. |
| **Owner** | AI Team |
| **Current Status** | Active Development |
| **Public APIs** | Chat component, conversation list, message history |
| **Internal APIs** | AI API calls, streaming handler |
| **Dependencies** | `@xennic/shared` |
| **Database Usage** | None (client-side) |
| **External Services** | NestJS AI API, AI Service |
| **Related Documents** | `docs/ai/`, `docs/frontend/` |
| **Risk Level** | LOW |
| **Alpha Readiness** | CONDITIONAL |
| **Future Work** | File attachment support, agent switching, conversation search |

---

## 2.7 Vision Upload

| Field | Value |
|-------|-------|
| **Module Name** | `Vision Upload` |
| **Description** | Upload engineering drawings, single-line diagrams, and panel schedules for AI-powered analysis and digitization. |
| **Owner** | AI Team |
| **Current Status** | Active Development |
| **Public APIs** | Upload component, preview, analysis results display |
| **Internal APIs** | Vision API calls |
| **Dependencies** | Storage feature |
| **Database Usage** | None |
| **External Services** | NestJS Vision API, Vision Service |
| **Related Documents** | `docs/ai/vision.md` |
| **Risk Level** | LOW |
| **Alpha Readiness** | NO |
| **Future Work** | Batch upload, CAD file support, real-time OCR preview |

---

## 2.8 Energy Bill Analyzer

| Field | Value |
|-------|-------|
| **Module Name** | `Energy Bill Analyzer` |
| **Description** | Upload or manually enter electricity bills for OCR-based analysis. Provides consumption analysis, cost breakdown, and savings recommendations. |
| **Owner** | Engineering Team |
| **Current Status** | Active Development |
| **Public APIs** | Bill upload form, manual entry form, analysis dashboard |
| **Internal APIs** | Energy analysis API calls |
| **Dependencies** | Engineering feature |
| **Database Usage** | None |
| **External Services** | NestJS Engineering API, Vision Service (OCR) |
| **Related Documents** | `docs/engineering/energy.md` |
| **Risk Level** | LOW |
| **Alpha Readiness** | CONDITIONAL |
| **Future Work** | Historical bill tracking, tariff comparison, PDF report export |

---

## 2.9 Workspace Management

| Field | Value |
|-------|-------|
| **Module Name** | `Workspace Management` |
| **Description** | Workspace settings, member management, invitations, and workspace switching. |
| **Owner** | Frontend Team |
| **Current Status** | Stable |
| **Public APIs** | Workspace settings forms, member list, invitation dialog, workspace switcher |
| **Internal APIs** | Workspace API calls |
| **Dependencies** | Auth feature |
| **Database Usage** | None |
| **External Services** | NestJS Workspace API |
| **Related Documents** | `docs/frontend/` |
| **Risk Level** | MEDIUM |
| **Alpha Readiness** | YES |
| **Future Work** | Workspace analytics dashboard, role management UI |

---

## 2.10 Knowledge Management

| Field | Value |
|-------|-------|
| **Module Name** | `Knowledge Management` |
| **Description** | Browse, search, create, and edit knowledge articles. Block-based content editor (Persian/English), taxonomy filtering, workflow management, comments, and bookmarks. |
| **Owner** | Content Team |
| **Current Status** | Stable |
| **Public APIs** | Knowledge browser, article editor, taxonomy explorer, search |
| **Internal APIs** | Knowledge API calls |
| **Dependencies** | i18n, rich text editor |
| **Database Usage** | None |
| **External Services** | NestJS Knowledge API |
| **Related Documents** | `docs/knowledge/`, `docs/frontend/` |
| **Risk Level** | MEDIUM |
| **Alpha Readiness** | CONDITIONAL |
| **Future Work** | AI content assistant, batch import, reading progress tracking |

---

## 2.11 Marketplace

| Field | Value |
|-------|-------|
| **Module Name** | `Marketplace` |
| **Description** | Browse electrical equipment catalog, product details, vendor listings, and place orders. |
| **Owner** | Product Team |
| **Current Status** | Active Development |
| **Public APIs** | Product browser, vendor page, cart, order history |
| **Internal APIs** | Marketplace API calls |
| **Dependencies** | i18n |
| **Database Usage** | None |
| **External Services** | NestJS Marketplace API |
| **Related Documents** | `docs/specifications/` |
| **Risk Level** | LOW |
| **Alpha Readiness** | NO |
| **Future Work** | Shopping cart, checkout flow, vendor dashboard |

---

## 2.12 Projects

| Field | Value |
|-------|-------|
| **Module Name** | `Projects` |
| **Description** | Project management UI — create/edit projects, manage members, view notes and associated calculations. |
| **Owner** | Frontend Team |
| **Current Status** | Stable |
| **Public APIs** | Project list, project detail, member management, notes |
| **Internal APIs** | Project API calls |
| **Dependencies** | Workspace feature |
| **Database Usage** | None |
| **External Services** | NestJS Project API |
| **Related Documents** | `docs/frontend/` |
| **Risk Level** | LOW |
| **Alpha Readiness** | YES |
| **Future Work** | Gantt chart, project templates, status tracking |

---

## 2.13 Billing / Subscription

| Field | Value |
|-------|-------|
| **Module Name** | `Billing / Subscription` |
| **Description** | Plan selection, subscription management, invoice history, and payment method management. |
| **Owner** | Frontend Team |
| **Current Status** | Active Development |
| **Public APIs** | Plan comparison, subscription settings, invoice list, payment form |
| **Internal APIs** | Billing API calls |
| **Dependencies** | Workspace feature |
| **Database Usage** | None |
| **External Services** | NestJS Billing API, Zarinpal |
| **Related Documents** | `docs/specifications/` |
| **Risk Level** | HIGH |
| **Alpha Readiness** | NO |
| **Future Work** | Upgrade/downgrade flows, payment history export, PDF invoice download |

---

## 2.14 Search

| Field | Value |
|-------|-------|
| **Module Name** | `Search` |
| **Description** | Command palette (⌘K) global search. Searches across workspaces, projects, calculations, knowledge, and marketplace. |
| **Owner** | Frontend Team |
| **Current Status** | Active Development |
| **Public APIs** | Command palette component, search results |
| **Internal APIs** | Search API calls |
| **Dependencies** | Keyboard shortcut library |
| **Database Usage** | None |
| **External Services** | NestJS Search API |
| **Related Documents** | `docs/frontend/` |
| **Risk Level** | LOW |
| **Alpha Readiness** | CONDITIONAL |
| **Future Work** | Keyboard navigation improvements, recent searches, search suggestions |

---

## 2.15 Settings

| Field | Value |
|-------|-------|
| **Module Name** | `Settings` |
| **Description** | User profile settings (name, email, password, avatar, language, theme). |
| **Owner** | Frontend Team |
| **Current Status** | Stable |
| **Public APIs** | Profile form, security settings, appearance settings |
| **Internal APIs** | User API calls |
| **Dependencies** | Auth feature, i18n |
| **Database Usage** | None |
| **External Services** | NestJS User API |
| **Related Documents** | `docs/frontend/` |
| **Risk Level** | LOW |
| **Alpha Readiness** | YES |
| **Future Work** | Notification preferences, API key management UI, two-factor setup |

---

## 2.16 Storage

| Field | Value |
|-------|-------|
| **Module Name** | `Storage` |
| **Description** | File browser UI — upload, download, delete, preview files. Grid/list view with file type filtering. |
| **Owner** | Frontend Team |
| **Current Status** | Active Development |
| **Public APIs** | File browser, upload dialog, preview modal |
| **Internal APIs** | Storage API calls |
| **Dependencies** | Workspace feature |
| **Database Usage** | None |
| **External Services** | NestJS Storage API, MinIO |
| **Related Documents** | `docs/storage/` |
| **Risk Level** | LOW |
| **Alpha Readiness** | NO |
| **Future Work** | Drag-and-drop upload, folder support, file sharing, image preview |

---

## 2.17 Notifications

| Field | Value |
|-------|-------|
| **Module Name** | `Notifications` |
| **Description** | In-app notification bell with dropdown list, read/unread state, and mark-all-read. |
| **Owner** | Frontend Team |
| **Current Status** | Active Development |
| **Public APIs** | Notification bell, notification list, toast notifications |
| **Internal APIs** | Notification API calls, polling/websocket |
| **Dependencies** | Auth feature |
| **Database Usage** | None |
| **External Services** | NestJS Notification API |
| **Related Documents** | `docs/frontend/` |
| **Risk Level** | LOW |
| **Alpha Readiness** | CONDITIONAL |
| **Future Work** | Real-time WebSocket push, notification preferences, email digests |

---

## 2.18 Consultations

| Field | Value |
|-------|-------|
| **Module Name** | `Consultations` |
| **Description** | Request expert engineering consultations. Submit details, track status, communicate with experts. |
| **Owner** | Product Team |
| **Current Status** | Active Development |
| **Public APIs** | Consultation request form, status tracker, message thread |
| **Internal APIs** | Consultation API calls |
| **Dependencies** | Auth feature |
| **Database Usage** | None |
| **External Services** | NestJS Consultations API |
| **Related Documents** | `docs/specifications/` |
| **Risk Level** | LOW |
| **Alpha Readiness** | NO |
| **Future Work** | Expert matching algorithm, video call integration, rating system |

---

## 2.19 Admin

| Field | Value |
|-------|-------|
| **Module Name** | `Admin` |
| **Description** | Platform administration dashboard — system settings, user management, feature flag control, taxonomy management, and audit log viewer. |
| **Owner** | Backend Team |
| **Current Status** | Active Development |
| **Public APIs** | Admin dashboard, user management, feature flags, taxonomy editor |
| **Internal APIs** | Admin API calls |
| **Dependencies** | Auth feature (super admin check) |
| **Database Usage** | None |
| **External Services** | NestJS Admin API |
| **Related Documents** | `docs/admin/` |
| **Risk Level** | HIGH |
| **Alpha Readiness** | NO |
| **Future Work** | Usage analytics dashboard, system health dashboard, user impersonation |

---

## 2.20 Guest

| Field | Value |
|-------|-------|
| **Module Name** | `Guest` |
| **Description** | Guest access mode — limited platform preview without login. Supports limited calculation access and knowledge browsing. |
| **Owner** | Product Team |
| **Current Status** | Active Development |
| **Public APIs** | Guest calculator, guest knowledge browser |
| **Internal APIs** | Guest session hooks |
| **Dependencies** | Auth feature, Engineering feature |
| **Database Usage** | None |
| **External Services** | NestJS API |
| **Related Documents** | `docs/specifications/` |
| **Risk Level** | LOW |
| **Alpha Readiness** | NO |
| **Future Work** | Guest-to-registered conversion flow, rate-limited guest access |

---

# 3. Shared Packages (`packages/`)

---

## 3.1 @xennic/config

| Field | Value |
|-------|-------|
| **Module Name** | `@xennic/config` |
| **Description** | Shared configuration: TypeScript base tsconfig, Prettier config, environment variable validation (Zod). |
| **Owner** | Platform Team |
| **Current Status** | Stable |
| **Public APIs** | `env.ts` — environment variable loader, `tsconfig.base.json`, `prettier.config.cjs` |
| **Internal APIs** | None |
| **Dependencies** | `zod`, `typescript`, `prettier` |
| **Database Usage** | None |
| **External Services** | None |
| **Related Documents** | `docs/architecture/PACKAGES_REFERENCE.md` |
| **Risk Level** | LOW |
| **Alpha Readiness** | YES |
| **Future Work** | Environment-specific config profiles |

---

## 3.2 @xennic/database

| Field | Value |
|-------|-------|
| **Module Name** | `@xennic/database` |
| **Description** | Prisma client singleton with tenant isolation extension. Provides workspace-scoped repository and `TenantContext` for multi-tenant database access. |
| **Owner** | Backend Team |
| **Current Status** | Stable |
| **Public APIs** | `prisma` (extended client), `TenantContext`, `tenantStorage`, `WorkspaceRepository` |
| **Internal APIs** | `createTenantExtension()`, repository interfaces |
| **Dependencies** | `@prisma/client`, `@xennic/types` |
| **Database Usage** | PostgreSQL 17 via Prisma ORM |
| **External Services** | PostgreSQL, PgBouncer |
| **Related Documents** | `docs/database/`, `docs/architecture/XENNIC_DATABASE_SPEC_v2.md` |
| **Risk Level** | CRITICAL |
| **Alpha Readiness** | YES |
| **Future Work** | Read replicas, connection pooling optimization, query monitoring |

---

## 3.3 @xennic/openapi

| Field | Value |
|-------|-------|
| **Module Name** | `@xennic/openapi` |
| **Description** | Auto-generated OpenAPI 3.0 specification from NestJS Swagger decorators. **Never edit manually** — regenerated via `pnpm generate:openapi`. |
| **Owner** | Backend Team |
| **Current Status** | Stable |
| **Public APIs** | `v1/openapi.json` |
| **Internal APIs** | None |
| **Dependencies** | NestJS API (source of truth) |
| **Database Usage** | None |
| **External Services** | None |
| **Related Documents** | `docs/api/` |
| **Risk Level** | LOW |
| **Alpha Readiness** | YES |
| **Future Work** | Multi-version OpenAPI support, client SDK generation |

---

## 3.4 @xennic/shared

| Field | Value |
|-------|-------|
| **Module Name** | `@xennic/shared` |
| **Description** | Shared utilities: `AppError` classes, `Result` monad, structured logging (Pino), constants, `isAuthenticated` / `isWorkspaceMember` guards, and general utility functions. |
| **Owner** | Platform Team |
| **Current Status** | Stable |
| **Public APIs** | `AppError`, `Result`, `logger`, `constants`, `guards`, `utils` |
| **Internal APIs** | None |
| **Dependencies** | `pino`, `pino-pretty` |
| **Database Usage** | None |
| **External Services** | None |
| **Related Documents** | `docs/architecture/PACKAGES_REFERENCE.md` |
| **Risk Level** | LOW |
| **Alpha Readiness** | YES |
| **Future Work** | Add pagination helper, validation utility, caching abstraction |

---

## 3.5 @xennic/types

| Field | Value |
|-------|-------|
| **Module Name** | `@xennic/types` |
| **Description** | Shared TypeScript interfaces: `BaseEntity`, `TenantContext`, and related domain types used across all NestJS modules and packages. |
| **Owner** | Platform Team |
| **Current Status** | Stable |
| **Public APIs** | `BaseEntity`, `TenantContext`, type exports |
| **Internal APIs** | None |
| **Dependencies** | None |
| **Database Usage** | None |
| **External Services** | None |
| **Related Documents** | `docs/architecture/PACKAGES_REFERENCE.md` |
| **Risk Level** | LOW |
| **Alpha Readiness** | YES |
| **Future Work** | Add domain event types, generic pagination types |

---

# 4. Python Microservices (`workspace/services/`)

---

## 4.1 engineering-service

| Field | Value |
|-------|-------|
| **Module Name** | `engineering-service` |
| **Description** | FastAPI-based electrical engineering calculation engine. 40+ calculator types across 13 categories: Basic, Cable, Transformer, Protection, Power Quality, Power System, Switchgear, Grounding, Lighting, Harmonic, Renewable, Economics, Energy Analyzer. |
| **Owner** | Engineering Team |
| **Current Status** | Stable |
| **Public APIs** | `/api/v1/engineering/basic/*`, `/cable/*`, `/transformer/*`, `/protection/*`, `/power-quality/*`, `/power-system/*`, `/switchgear/*`, `/grounding/*`, `/lighting/*`, `/harmonic/*`, `/renewable/*`, `/economics/*`, `/energy/*` — each exposing calculator endpoints; `GET /health` |
| **Internal APIs** | `CalculatorBase` (abstract), per-calculator service classes |
| **Dependencies** | `fastapi`, `pydantic`, `numpy`, `scipy`, `pandas`, `pandapower` (power system) |
| **Database Usage** | None (stateless computation engine) |
| **External Services** | None |
| **Related Documents** | `docs/engineering/`, `docs/services/` |
| **Risk Level** | HIGH |
| **Alpha Readiness** | CONDITIONAL |
| **Future Work** | Async job queue for long calculations, result caching, 10+ additional calculator types |

---

## 4.2 ai-service

| Field | Value |
|-------|-------|
| **Module Name** | `ai-service` |
| **Description** | FastAPI-based AI orchestration service. Multi-provider LLM support (OpenAI, Anthropic, Google Gemini), LangGraph agent workflows, RAG with Qdrant vector store (file-based fallback). Agents: Electrical Engineer, Document Analyst. |
| **Owner** | AI Team |
| **Current Status** | Active Development |
| **Public APIs** | `POST /chat` (streaming + non-streaming), `GET /agents` (list agents), `POST /rag/query`, `POST /documents/upload`; `GET /health` |
| **Internal APIs** | `AgentRegistry`, `VectorStore`, `EmbeddingPipeline`, `Retriever`, `Chunker` |
| **Dependencies** | `openai`, `anthropic`, `google-generativeai`, `langchain`, `langgraph`, `qdrant-client`, `httpx` |
| **Database Usage** | None (uses Qdrant for vector storage, file system for fallback) |
| **External Services** | OpenAI API, Anthropic API, Google Gemini API, Qdrant |
| **Related Documents** | `docs/ai/`, `docs/services/` |
| **Risk Level** | MEDIUM |
| **Alpha Readiness** | CONDITIONAL |
| **Future Work** | Multi-agent orchestration, tool use, memory management, custom agent builder |

---

## 4.3 vision-service

| Field | Value |
|-------|-------|
| **Module Name** | `vision-service` |
| **Description** | FastAPI-based computer vision service. Multi-stage pipeline: preprocessing, OCR (Tesseract, optional PaddleOCR), detection, extraction, validation, and knowledge integration. Supports bill OCR and engineering diagram analysis. |
| **Owner** | AI Team |
| **Current Status** | Active Development |
| **Public APIs** | `POST /api/v1/vision/bill/read` — OCR bill upload and analysis; `GET /health` |
| **Internal APIs** | Stage pipeline: `preprocessing → ocr → detection → extraction → validation → knowledge` |
| **Dependencies** | `opencv-contrib-python`, `Pillow`, `scikit-image`, `pytesseract`, `PyMuPDF`, `numpy`, `httpx` |
| **Database Usage** | None |
| **External Services** | Optional PaddleOCR |
| **Related Documents** | `docs/services/`, `docs/ai/vision.md` |
| **Risk Level** | MEDIUM |
| **Alpha Readiness** | NO |
| **Future Work** | SLD digitization, panel schedule extraction, CAD file parsing, PaddleOCR GPU support |

---

# 5. Other

---

## 5.1 api-gateway (placeholder)

| Field | Value |
|-------|-------|
| **Module Name** | `api-gateway` |
| **Description** | Placeholder directory for future API Gateway service (Kong or custom). Currently empty — no implementation. |
| **Owner** | DevOps Team |
| **Current Status** | Placeholder |
| **Public APIs** | None |
| **Internal APIs** | None |
| **Dependencies** | None |
| **Database Usage** | None |
| **External Services** | None |
| **Related Documents** | `docs/architecture/SERVICE_ARCHITECTURE.md` |
| **Risk Level** | LOW |
| **Alpha Readiness** | NO |
| **Future Work** | Implement API Gateway (Kong), rate limiting at edge, routing, authentication offload |

---

# Appendix A: Module Count Summary

| Tier | Count |
|------|-------|
| NestJS Backend Modules | 24 |
| Frontend Feature Modules | 20 |
| Shared Packages | 5 |
| Python Microservices | 3 |
| Other | 1 |
| **Total** | **53** |

---

# Appendix B: Risk Distribution

| Risk Level | Count | Modules |
|------------|-------|---------|
| CRITICAL | 3 | AuthModule, WorkspacesModule, RbacModule, @xennic/database |
| HIGH | 8 | UserModule, EngineeringModule, BillingModule, SubscriptionModule, AdminModule, Auth (FE), Engineering (FE), Billing (FE), engineering-service |
| MEDIUM | 12 | ProjectModule, KnowledgeModule, AiModule, StorageModule, SearchModule, ApiKeysModule, WebhooksModule, VisionModule, Vision Upload (FE), Power System Studies (FE), Knowledge (FE), Workspace (FE), ai-service, vision-service |
| LOW | 27 | HealthModule, NotificationModule, MarketplaceModule, StandardsModule, EmailModule, FeatureFlagsModule, ConsultationsModule, Landing (FE), Dashboard (FE), AI Chat (FE), Energy Bill Analyzer (FE), Projects (FE), Search (FE), Settings (FE), Storage (FE), Notifications (FE), Consultations (FE), Admin (FE), Guest (FE), @xennic/config, @xennic/openapi, @xennic/shared, @xennic/types, api-gateway |

---

# Appendix C: Alpha Readiness Distribution

| Status | Count | Modules |
|--------|-------|---------|
| YES | 18 | ApiModule, AuthModule, UserModule, WorkspacesModule, RbacModule, ProjectModule, HealthModule, EmailModule, FeatureFlagsModule, Auth (FE), Landing (FE), Dashboard (FE), Workspace (FE), Projects (FE), Settings (FE), @xennic/config, @xennic/database, @xennic/openapi, @xennic/shared, @xennic/types |
| CONDITIONAL | 14 | EngineeringModule, KnowledgeModule, AiModule, NotificationModule, StorageModule, SubscriptionModule, AdminModule, StandardsModule, Engineering (FE), Power System Studies (FE), AI Chat (FE), Energy Bill Analyzer (FE), Knowledge (FE), Notifications (FE), Search (FE), engineering-service, ai-service |
| NO | 11 | MarketplaceModule, BillingModule, SearchModule, ApiKeysModule, WebhooksModule, VisionModule, ConsultationsModule, Marketplace (FE), Vision Upload (FE), Billing (FE), Storage (FE), Consultations (FE), Admin (FE), Guest (FE), vision-service, api-gateway |

---

*End of Module Catalog*
