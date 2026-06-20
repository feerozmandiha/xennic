import { Module } from '@nestjs/common';
import { StandardController } from './presentation/controllers/standard.controller.js';
import { StandardService } from './application/services/standard.service.js';
import { StandardRepository } from './infrastructure/repositories/standard.repository.js';
import { WorkspaceModule } from '../workspace/workspace.module.js';
import { RbacModule } from '../rbac/rbac.module.js';

@Module({
  imports: [WorkspaceModule, RbacModule],
  controllers: [StandardController],
  providers: [
    StandardService,
    { provide: 'IStandardRepository', useClass: StandardRepository },
  ],
  exports: [StandardService],
})
export class StandardsModule {}
