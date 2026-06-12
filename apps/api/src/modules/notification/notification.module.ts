import { Module } from '@nestjs/common';

import { NotificationController } from './presentation/controllers/notification.controller.js';
import { NotificationService } from './application/services/notification.service.js';
import { NotificationRepository } from './infrastructure/repositories/notification.repository.js';

@Module({
  controllers: [NotificationController],
  providers: [
    NotificationService,
    {
      provide:  'INotificationRepository',
      useClass: NotificationRepository,
    },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
