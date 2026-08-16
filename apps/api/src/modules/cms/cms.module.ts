import { Module } from '@nestjs/common';
import { CmsPublicController } from './presentation/controllers/cms.controller.js';
import { CmsAdminController } from './presentation/controllers/cms-admin.controller.js';
import { CmsService } from './application/services/cms.service.js';
import { CmsContentRepository } from './infrastructure/repositories/cms-content.repository.js';
import { LocalBlobStorage } from './infrastructure/storage/local-blob.storage.js';

@Module({
  controllers: [CmsPublicController, CmsAdminController],
  providers: [
    CmsService,
    LocalBlobStorage,
    {
      provide: 'ICmsContentRepository',
      useClass: CmsContentRepository,
    },
  ],
  exports: [CmsService, LocalBlobStorage],
})
export class CmsModule {}
