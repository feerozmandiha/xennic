import { Module }              from '@nestjs/common';
import { ArticlesController }  from './presentation/controllers/articles.controller.js';
import { ArticlesService }     from './application/services/articles.service.js';
import { ArticlesRepository }  from './infrastructure/repositories/articles.repository.js';
import { WorkspaceModule }     from '../workspace/workspace.module.js';

@Module({
  imports:     [WorkspaceModule],
  controllers: [ArticlesController],
  providers:   [ArticlesService, ArticlesRepository],
  exports:     [ArticlesService],
})
export class ArticlesModule {}
