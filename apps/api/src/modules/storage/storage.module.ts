import { Module } from '@nestjs/common';

import { StorageController } from './presentation/controllers/storage.controller.js';
import { StorageService } from './application/services/storage.service.js';
import { MinioService } from './infrastructure/minio/minio.service.js';
import { StorageRepository } from './infrastructure/repositories/storage.repository.js';

import { WorkspaceModule } from '../workspace/workspace.module.js';
import { RbacModule } from '../rbac/rbac.module.js';

@Module({
  imports: [
    WorkspaceModule,
    RbacModule,
    // Fastify multipart را در main.ts register می‌کنیم — نه اینجا
  ],
  controllers: [StorageController],
  providers: [
    StorageService,
    MinioService,
    {
      provide:  'IStorageRepository',
      useClass: StorageRepository,
    },
  ],
  exports: [StorageService, MinioService],
})
export class StorageModule {}
