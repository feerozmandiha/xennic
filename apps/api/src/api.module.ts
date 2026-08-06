import { ThrottlerModule } from '@nestjs/throttler';
import { Module } from '@nestjs/common';
import { ApiController } from './api.controller.js';
import { ApiService } from './api.service.js';
import { HealthModule } from './modules/health/health.module.js';
import { WorkspaceModule } from './modules/workspace/workspace.module.js';
import { UserModule } from './modules/user/user.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { RbacModule } from './modules/rbac/rbac.module.js';
import { ProjectModule } from './modules/project/project.module.js';
import { EngineeringModule } from './modules/engineering/engineering.module.js';
import { SubscriptionModule } from './modules/subscription/subscription.module.js';
import { StorageModule } from './modules/storage/storage.module.js';
import { NotificationModule } from './modules/notification/notification.module.js';
import { AiModule } from './modules/ai/ai.module.js';
import { ConsultationsModule } from './modules/consultations/consultations.module.js';
import { BillingModule } from './modules/billing/billing.module.js'; // ✅ صورتحساب
import { AdminModule } from './modules/admin/admin.module.js'; // ✅ ادمین
import { SearchModule } from './modules/search/search.module.js'; // ✅ جستجوی سراسری
import { KnowledgeModule } from './modules/knowledge/knowledge.module.js'; // ✅ سیستم دانش
import { StandardsModule } from './modules/standards/standards.module.js'; // ✅ استانداردها
import { MarketplaceModule } from './modules/marketplace/marketplace.module.js'; // ✅ بازارگاه
import { ApiKeysModule } from './modules/api-keys/api-keys.module.js'; // ✅ کلید API
import { WebhooksModule } from './modules/webhooks/webhooks.module.js'; // ✅ وب‌هوک
import { EmailModule } from './modules/email/email.module.js'; // ✅ ایمیل
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module.js'; // ✅ Feature Flags
import { VisionModule } from './modules/vision/vision.module.js'; // ✅ بینایی ماشین
import { AiProviderManagementModule } from './modules/ai-provider-management/ai-provider-management.module.js'; // ✅ مدیریت ارائه‌دهندگان AI
import { MonitoringModule } from './modules/monitoring/monitoring.module.js'; // ✅ مانیتورینگ
import { CalculationPlatformModule } from './modules/calculation-platform/calculation-platform.module.js'; // ✅ Sprint C1
// ═══════════════════════════════════════════════════════════════════════════
// فعال‌سازی ماژول‌های خفته — feat/activate-dormant-platform-modules (2026-08-06)
// این ماژول‌ها از قبل ساخته و گواهی شده بودند اما در گراف برنامه رجیستر نبودند.
// ═══════════════════════════════════════════════════════════════════════════
import { SemanticIntegrationModule } from './modules/semantic-integration/semantic-integration.module.js'; // ✅ لایه یکپارچگی رویداد (Outbox + Event Bus + Relay) — به‌همراه KnowledgeFactory/KnowledgeIntelligence/AiRuntime
import { EnterpriseMessagingModule } from './modules/enterprise-messaging/enterprise-messaging.module.js'; // ✅ Sprint E1
import { EnterpriseEventArchitectureModule } from './modules/enterprise-event-architecture/enterprise-event-architecture.module.js'; // ✅ Sprint E1
import { EnterpriseSagaModule } from './modules/enterprise-saga/enterprise-saga.module.js'; // ✅ Sprint E1
import { EnterpriseCacheModule } from './modules/enterprise-cache/enterprise-cache.module.js'; // ✅ Sprint E1
import { EnterpriseObservabilityModule } from './modules/enterprise-observability/enterprise-observability.module.js'; // ✅ Sprint E1
import { EnterpriseConfigModule } from './modules/enterprise-config/enterprise-config.module.js'; // ✅ Sprint E1
import { EnterpriseApiPlatformModule } from './modules/enterprise-api-platform/enterprise-api-platform.module.js'; // ✅ Sprint E1
import { EnterpriseSearchFederationModule } from './modules/enterprise-search-federation/enterprise-search-federation.module.js'; // ✅ Sprint E1
import { EnterpriseIntelligenceModule } from './modules/enterprise-intelligence/enterprise-intelligence.module.js'; // ✅ Sprint I1 (۱۰ زیرماژول)
import { EnterpriseOrchestrationModule } from './modules/enterprise-orchestration/enterprise-orchestration.module.js'; // ✅ Sprint O1 (۹ زیرماژول)

@Module({
  imports: [
    HealthModule,
    WorkspaceModule,
    UserModule,
    AuthModule,
    RbacModule,
    ProjectModule,
    EngineeringModule,
    SubscriptionModule,
    BillingModule, // ✅ ماژول صورتحساب
    StorageModule,
    NotificationModule,
    AiModule,
    ConsultationsModule,
    AdminModule, // ✅ مدیریت پلتفرم
    SearchModule, // ✅ جستجوی سراسری
    KnowledgeModule, // ✅ سیستم دانش
    StandardsModule, // ✅ استانداردهای مهندسی
    MarketplaceModule, // ✅ بازارگاه
    ApiKeysModule, // ✅ کلید API
    WebhooksModule, // ✅ وب‌هوک
    EmailModule, // ✅ ایمیل
    FeatureFlagsModule, // ✅ Feature Flags
    VisionModule, // ✅ Vision
    AiProviderManagementModule, // ✅ مدیریت ارائه‌دهندگان AI
    MonitoringModule, // ✅ مانیتورینگ (OpenTelemetry + Prometheus + logging)
    CalculationPlatformModule, // ✅ Sprint C1 — Enterprise Calculation Platform
    // ═══ فعال‌سازی ماژول‌های خفته (2026-08-06) ═══
    SemanticIntegrationModule, // لایه یکپارچگی رویداد: Outbox + Semantic Event Bus + Outbox Relay + DocumentPublished/CacheInvalidation handlers
    EnterpriseMessagingModule, // Command/Query Bus + Message Queue + DLQ
    EnterpriseEventArchitectureModule, // Schema Registry + Event Replay
    EnterpriseSagaModule, // Saga Orchestrator + Compensation
    EnterpriseCacheModule, // Cache Manager + Invalidation (Global)
    EnterpriseObservabilityModule, // Tracing + Metrics + Logging (Global)
    EnterpriseConfigModule, // Config Manager + Feature Flag Store
    EnterpriseApiPlatformModule, // API Discovery + Token-Bucket Rate Limiter
    EnterpriseSearchFederationModule, // Federated Search + Ranking
    EnterpriseIntelligenceModule, // Sprint I1 — ۱۰ زیرماژول هوش سازمانی (Global)
    EnterpriseOrchestrationModule, // Sprint O1 — ۹ زیرماژول ارکستراسیون (Global)
    // ✅ SEC-001C: Rate Limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 10000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'long',
        ttl: 3600000,
        limit: 1000,
      },
    ]),
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
