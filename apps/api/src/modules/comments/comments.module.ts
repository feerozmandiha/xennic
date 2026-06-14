import { Module } from '@nestjs/common';
import { CommentsController } from './presentation/controllers/comments.controller.js';
import { CommentsService } from './application/services/comments.service.js';
import { CommentsRepository } from './infrastructure/repositories/comments.repository.js';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository],
  exports: [CommentsService],
})
export class CommentsModule {}
