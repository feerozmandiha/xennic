import { ThrottlerModule } from '@nestjs/throttler';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApiController }       from './api.controller.js';
import { ApiService }          from './api.service.js';
import { ConfigModule }        from './config/config.module.js';
import { CorrelationIdInterceptor } from './shared/interceptors/correlation-id.interceptor.js';
import { LoggerModule }        from './shared/logger/index.js';
import { MetricsModule }       from './shared/metrics/index.js';
import { TracingModule }       from './shared/tracing/index.js';
import { RedisModule }         from './shared/redis/index.js';
import { EventModule }         from './shared/events/index.js';
import { RepositoryModule }    from './shared/repositories/index.js';
import { HealthModule }        from './modules/health/health.module.js';
import { WorkspaceModule }     from './modules/workspace/workspace.module.js';
import { UserModule }          from './modules/user/user.module.js';
import { AuthModule }          from './modules/auth/auth.module.js';
import { RbacModule }          from './modules/rbac/rbac.module.js';
import { ProjectModule }       from './modules/project/project.module.js';
import { EngineeringModule }   from './modules/engineering/engineering.module.js';
import { SubscriptionModule }  from './modules/subscription/subscription.module.js';
import { StorageModule }       from './modules/storage/storage.module.js';
import { NotificationModule }  from './modules/notification/notification.module.js';
import { AiModule }            from './modules/ai/ai.module.js';
import { ConsultationsModule } from './modules/consultations/consultations.module.js';
import { BillingModule }       from './modules/billing/billing.module.js';   // ✅ صورتحساب
import { AdminModule }         from './modules/admin/admin.module.js';         // ✅ ادمین
import { SearchModule }        from './modules/search/search.module.js';       // ✅ جستجوی سراسری
import { KnowledgeModule }     from './modules/knowledge/knowledge.module.js';  // ✅ سیستم دانش
import { StandardsModule }     from './modules/standards/standards.module.js';   // ✅ استانداردها
import { MarketplaceModule }   from './modules/marketplace/marketplace.module.js'; // ✅ بازارگاه
import { ApiKeysModule }       from './modules/api-keys/api-keys.module.js';         // ✅ کلید API
import { WebhooksModule }      from './modules/webhooks/webhooks.module.js';         // ✅ وب‌هوک
import { EmailModule }         from './modules/email/email.module.js';               // ✅ ایمیل
import { FeatureFlagsModule }  from './modules/feature-flags/feature-flags.module.js'; // ✅ Feature Flags
import { VisionModule }        from './modules/vision/vision.module.js';                // ✅ بینایی ماشین
import { KnowledgeFactoryModule } from './modules/knowledge-factory/knowledge-factory.module.js'; // ✅ کارخانه دانش
import { RagEngineModule } from './modules/rag-engine/rag-engine.module.js'; // ✅ موتور RAG مهندسی
import { EngineeringIntelligenceModule } from './modules/engineering-intelligence/engineering-intelligence.module.js'; // ✅ لایه هوش مهندسی
import { EnterpriseAgentsModule } from './modules/enterprise-agents/enterprise-agents.module.js'; // ✅ عوامل هوش مصنوعی سازمانی
import { CalculationEngineModule } from './modules/calculation-engine/calculation-engine.module.js'; // ✅ موتور محاسبات مهندسی
import { EnterpriseSecurityModule } from './modules/enterprise-security/enterprise-security.module.js'; // ✅ امنیت سازمانی
import { EnterpriseCacheModule } from './modules/enterprise-cache/enterprise-cache.module.js'; // ✅ کش سازمانی
import { EnterpriseBackgroundModule } from './modules/enterprise-background/enterprise-background.module.js'; // ✅ پس‌زمینه سازمانی
import { EnterpriseConfigModule } from './modules/enterprise-config/enterprise-config.module.js'; // ✅ تنظیمات سازمانی
import { EnterpriseBackupModule } from './modules/enterprise-backup/enterprise-backup.module.js'; // ✅ پشتیبان سازمانی
import { EnterprisePerformanceModule } from './modules/enterprise-performance/enterprise-performance.module.js'; // ✅ عملکرد سازمانی

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    MetricsModule,
    TracingModule,
    RedisModule,
    EventModule,
    RepositoryModule,
    HealthModule,
    WorkspaceModule,
    UserModule,
    AuthModule,
    RbacModule,
    ProjectModule,
    EngineeringModule,
    SubscriptionModule,
    BillingModule,       // ✅ ماژول صورتحساب
    StorageModule,
    NotificationModule,
    AiModule,
    ConsultationsModule,
    AdminModule,         // ✅ مدیریت پلتفرم
    SearchModule,        // ✅ جستجوی سراسری
    KnowledgeModule,     // ✅ سیستم دانش
    StandardsModule,     // ✅ استانداردهای مهندسی
    MarketplaceModule,   // ✅ بازارگاه
    ApiKeysModule,       // ✅ کلید API
    WebhooksModule,      // ✅ وب‌هوک
    EmailModule,         // ✅ ایمیل
    FeatureFlagsModule,  // ✅ Feature Flags
    VisionModule,        // ✅ Vision
    KnowledgeFactoryModule, // ✅ کارخانه دانش
    RagEngineModule, // ✅ موتور RAG مهندسی
    EngineeringIntelligenceModule, // ✅ لایه هوش مهندسی
    EnterpriseAgentsModule, // ✅ عوامل هوش مصنوعی سازمانی
    CalculationEngineModule, // ✅ موتور محاسبات مهندسی
    EnterpriseSecurityModule, // ✅ امنیت سازمانی
    EnterpriseCacheModule, // ✅ کش سازمانی
    EnterpriseBackgroundModule, // ✅ پس‌زمینه سازمانی
    EnterpriseConfigModule, // ✅ تنظیمات سازمانی
    EnterpriseBackupModule, // ✅ پشتیبان سازمانی
    EnterprisePerformanceModule, // ✅ عملکرد سازمانی
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
  providers:   [
    ApiService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationIdInterceptor,
    },
  ],
})
export class ApiModule {}
