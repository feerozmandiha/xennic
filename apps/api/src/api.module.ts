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
import { ArticlesModule }      from './modules/articles/articles.module.js';
import { ConsultationsModule } from './modules/consultations/consultations.module.js';
import { AdminModule }         from './modules/admin/admin.module.js';         // ✅ ادمین

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
    StorageModule,
    NotificationModule,
    AiModule,
    ArticlesModule,
    ConsultationsModule,
    AdminModule,         // ✅ مدیریت پلتفرم
  ],
  controllers: [ApiController],
  providers:   [ApiService],
})
export class ApiModule {}
