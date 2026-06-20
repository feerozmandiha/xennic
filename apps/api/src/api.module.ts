import { ThrottlerModule } from '@nestjs/throttler';
import { Module } from '@nestjs/common';
import { ApiController }       from './api.controller.js';
import { ApiService }          from './api.service.js';
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
  providers:   [ApiService],
})
export class ApiModule {}
