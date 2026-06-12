import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { INotificationRepository } from '../../domain/interfaces/notification.repository.interface.js';
import {
  NotificationEntity,
  type NotificationStatus,
  type NotificationChannel,
} from '../../domain/entities/notification.entity.js';

@Injectable()
export class NotificationRepository implements INotificationRepository {

  async save(n: NotificationEntity): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO "notifications"
          (id, user_id, type, channel, title, content, status, sent_at, created_at)
        VALUES
          (${n.id}, ${n.userId}, ${n.type}, ${n.channel},
           ${n.title}, ${n.content}, ${n.status}, ${n.sentAt}, ${n.createdAt})
      `;
    } catch (err) {
      throw new Error(`NotificationRepository.save failed: ${(err as Error).message}`);
    }
  }

  async update(n: NotificationEntity): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE "notifications"
        SET status = ${n.status}, sent_at = ${n.sentAt}
        WHERE id = ${n.id}
      `;
    } catch (err) {
      throw new Error(`NotificationRepository.update failed: ${(err as Error).message}`);
    }
  }

  async findById(id: string): Promise<NotificationEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "notifications" WHERE id = ${id} LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._map(rows[0]);
    } catch { return null; }
  }

  async findByUser(
    userId: string,
    options?: {
      status?: NotificationStatus;
      channel?: NotificationChannel;
      offset?: number;
      limit?: number;
    },
  ): Promise<NotificationEntity[]> {
    const offset = options?.offset ?? 0;
    const limit  = options?.limit  ?? 20;

    try {
      let rows: any[];

      if (options?.status && options?.channel) {
        rows = await prisma.$queryRaw<any[]>`
          SELECT * FROM "notifications"
          WHERE user_id = ${userId}
            AND status  = ${options.status}
            AND channel = ${options.channel}
          ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
        `;
      } else if (options?.status) {
        rows = await prisma.$queryRaw<any[]>`
          SELECT * FROM "notifications"
          WHERE user_id = ${userId} AND status = ${options.status}
          ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
        `;
      } else if (options?.channel) {
        rows = await prisma.$queryRaw<any[]>`
          SELECT * FROM "notifications"
          WHERE user_id = ${userId} AND channel = ${options.channel}
          ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
        `;
      } else {
        rows = await prisma.$queryRaw<any[]>`
          SELECT * FROM "notifications"
          WHERE user_id = ${userId}
          ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
        `;
      }

      return rows.map(r => this._map(r));
    } catch { return []; }
  }

  async countUnread(userId: string): Promise<number> {
    try {
      const result = await prisma.$queryRaw<{ count: string }[]>`
        SELECT COUNT(*)::text as count FROM "notifications"
        WHERE user_id = ${userId}
          AND status IN ('pending', 'sent')
          AND channel = 'in_app'
      `;
      return Number(result[0]?.count ?? 0);
    } catch { return 0; }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.$executeRaw`DELETE FROM "notifications" WHERE id = ${id}`;
    } catch (err) {
      throw new Error(`NotificationRepository.delete failed: ${(err as Error).message}`);
    }
  }

  async markAllAsRead(userId: string): Promise<number> {
    try {
      await prisma.$executeRaw`
        UPDATE "notifications"
        SET status = 'read', sent_at = COALESCE(sent_at, NOW())
        WHERE user_id = ${userId}
          AND status IN ('pending', 'sent')
          AND channel = 'in_app'
      `;
      // تعداد آپدیت‌شده را برمی‌گردانیم
      const result = await prisma.$queryRaw<{ count: string }[]>`
        SELECT COUNT(*)::text as count FROM "notifications"
        WHERE user_id = ${userId} AND status = 'read' AND channel = 'in_app'
      `;
      return Number(result[0]?.count ?? 0);
    } catch { return 0; }
  }

  private _map(row: any): NotificationEntity {
    return NotificationEntity.reconstitute({
      id:        row.id,
      userId:    row.user_id,
      type:      row.type,
      channel:   row.channel,
      title:     row.title,
      content:   row.content,
      status:    row.status,
      sentAt:    row.sent_at    ?? null,
      createdAt: row.created_at,
    });
  }
}
