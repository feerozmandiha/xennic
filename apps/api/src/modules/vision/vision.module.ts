import { Module } from '@nestjs/common';
import { VisionClientService } from './infrastructure/http/vision-client.service.js';
import { VisionService } from './application/services/vision.service.js';
import { VisionUploadController } from './presentation/vision-upload.controller.js';
import { EngineeringModule } from '../engineering/engineering.module.js';
import { WorkspaceModule } from '../workspace/workspace.module.js';
import { RbacModule } from '../rbac/rbac.module.js';

@Module({
  imports: [
    EngineeringModule,
    WorkspaceModule,
    RbacModule,
  ],
  controllers: [VisionUploadController],
  providers: [VisionClientService, VisionService],
  exports: [VisionService, VisionClientService],
})
export class VisionModule {}
