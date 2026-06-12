import type { NotificationEntity, NotificationStatus, NotificationChannel } from '../entities/notification.entity.js';

export interface INotificationRepository {
  save(notification: NotificationEntity): Promise<void>;
  update(notification: NotificationEntity): Promise<void>;
  findById(id: string): Promise<NotificationEntity | null>;
  findByUser(
    userId: string,
    options?: {
      status?: NotificationStatus;
      channel?: NotificationChannel;
      offset?: number;
      limit?: number;
    }
  ): Promise<NotificationEntity[]>;
  countUnread(userId: string): Promise<number>;
  delete(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<number>;
}
