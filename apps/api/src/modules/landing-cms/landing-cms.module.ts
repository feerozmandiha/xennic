import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module.js';
import { LandingCmsService } from './application/services/landing-cms.service.js';
import { LandingPublicController } from './presentation/controllers/landing-public.controller.js';
import { LandingAdminController } from './presentation/controllers/landing-admin.controller.js';

@Module({
  imports: [StorageModule],
  controllers: [LandingPublicController, LandingAdminController],
  providers: [LandingCmsService],
  exports: [LandingCmsService],
})
export class LandingCmsModule {}
