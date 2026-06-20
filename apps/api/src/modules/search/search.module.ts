import { Module } from '@nestjs/common';
import { SearchController } from './presentation/controllers/search.controller.js';
import { SearchService } from './application/services/search.service.js';
import { SearchRepository } from './infrastructure/repositories/search.repository.js';
import { SEARCH_REPOSITORY } from './domain/interfaces/search.repository.interface.js';
import { AuthModule } from '../auth/auth.module.js';
import { RbacModule } from '../rbac/rbac.module.js';
import { WorkspaceModule } from '../workspace/workspace.module.js';

@Module({
  imports: [AuthModule, RbacModule, WorkspaceModule],
  controllers: [SearchController],
  providers: [
    SearchService,
    {
      provide: SEARCH_REPOSITORY,
      useClass: SearchRepository,
    },
  ],
  exports: [SearchService],
})
export class SearchModule {}
