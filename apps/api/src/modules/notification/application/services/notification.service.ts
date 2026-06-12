import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { INotificationRepository } from '../../domain/interfaces/notification.repository.interface.js';
import {
  NotificationEntity,
  type NotificationType,
  type NotificationChannel,
} from '../../domain/entities/notification.entity.js';

// ── Notification Templates ────────────────────────────────────────────────────

const TEMPLATES: Record<NotificationType, { title: string; content: string }> = {
  workspace_invite:         { title: 'دعوت به Workspace',          content: 'شما به workspace دعوت شده‌اید.' },
  workspace_member_added:   { title: 'عضو جدید',                    content: 'یک عضو جدید به workspace اضافه شد.' },
  workspace_member_removed: { title: 'حذف عضو',                    content: 'یک عضو از workspace حذف شد.' },
  project_added:            { title: 'پروژه جدید',                  content: 'شما به یک پروژه اضافه شدید.' },
  project_updated:          { title: 'بروزرسانی پروژه',              content: 'پروژه بروزرسانی شد.' },
  calculation_complete:     { title: 'محاسبه کامل شد',              content: 'محاسبه مهندسی شما به پایان رسید.' },
  subscription_changed:     { title: 'تغییر اشتراک',                content: 'اشتراک workspace شما تغییر کرد.' },
  subscription_expiring:    { title: 'انقضای اشتراک',               content: 'اشتراک workspace شما به زودی منقضی می‌شود.' },
  file_shared:              { title: 'فایل به اشتراک گذاشته شد',   content: 'یک فایل با شما به اشتراک گذاشته شد.' },
  system:                   { title: 'اطلاعیه سیستم',               content: 'یک پیام سیستمی دارید.' },
  security_alert:           { title: '⚠️ هشدار امنیتی',             content: 'یک رویداد امنیتی شناسایی شد.' },
};

export interface SendNotificationInput {
  userId:   string;
  type:     NotificationType;
  channel?: NotificationChannel;
  title?:   string;
  content?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationService {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  // ── Send ──────────────────────────────────────────────────────────────────

  /**
   * ارسال یک notification به یک کاربر
   */
  async send(input: SendNotificationInput): Promise<NotificationEntity> {
    const template = TEMPLATES[input.type];
    const channel  = input.channel ?? 'in_app';

    const notification = NotificationEntity.create({
      userId:   input.userId,
      type:     input.type,
      channel,
      title:    input.title   ?? template.title,
      content:  input.content ?? template.content,
      metadata: input.metadata,
    });

    await this.notificationRepository.save(notification);

    // برای in_app، وضعیت را فوری به sent تغییر می‌دهیم
    if (channel === 'in_app') {
      notification.markAsSent();
      await this.notificationRepository.update(notification);
    }

    // TODO: برای email/sms در آینده با queue ارسال می‌شود
    // await this.emailQueue.add({ notificationId: notification.id })

    return notification;
  }

  /**
   * ارسال به چند کاربر همزمان
   */
  async sendToMany(
    userIds:  string[],
    type:     NotificationType,
    options?: { title?: string; content?: string; channel?: NotificationChannel; metadata?: Record<string, unknown> },
  ): Promise<void> {
    await Promise.all(
      userIds.map(userId =>
        this.send({ userId, type, ...options }).catch(err =>
          console.error(`Failed to notify user ${userId}:`, err)
        )
      )
    );
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  async getMyNotifications(
    userId: string,
    page   = 1,
    limit  = 20,
    status?: string,
  ): Promise<{
    data: NotificationEntity[];
    meta: { page: number; limit: number; unread: number };
  }> {
    const offset = (page - 1) * limit;
    const [data, unread] = await Promise.all([
      this.notificationRepository.findByUser(userId, {
        status: status as any,
        channel: 'in_app',
        offset,
        limit,
      }),
      this.notificationRepository.countUnread(userId),
    ]);

    return { data, meta: { page, limit, unread } };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.countUnread(userId);
  }

  // ── Mark Read ─────────────────────────────────────────────────────────────

  async markAsRead(id: string, userId: string): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) throw new NotFoundException(`Notification "${id}" not found`);
    if (notification.userId !== userId) throw new ForbiddenException('Access denied');

    notification.markAsRead();
    await this.notificationRepository.update(notification);
    return notification;
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.markAllAsRead(userId);
    return { count };
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async delete(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) throw new NotFoundException(`Notification "${id}" not found`);
    if (notification.userId !== userId) throw new ForbiddenException('Access denied');
    await this.notificationRepository.delete(id);
  }

  // ── System Notifications (برای استفاده داخلی از سایر modules) ────────────

  async notifyWorkspaceInvite(userId: string, workspaceName: string): Promise<void> {
    await this.send({
      userId,
      type:    'workspace_invite',
      content: `شما به workspace "${workspaceName}" دعوت شده‌اید.`,
    });
  }

  async notifySubscriptionChanged(userId: string, planName: string): Promise<void> {
    await this.send({
      userId,
      type:    'subscription_changed',
      content: `اشتراک workspace شما به پلن "${planName}" تغییر یافت.`,
    });
  }

  async notifyCalculationComplete(userId: string, calculationType: string): Promise<void> {
    await this.send({
      userId,
      type:    'calculation_complete',
      content: `محاسبه "${calculationType}" با موفقیت انجام شد.`,
    });
  }

  async notifySecurityAlert(userId: string, message: string): Promise<void> {
    await this.send({
      userId,
      type:    'security_alert',
      content: message,
    });
  }
}
