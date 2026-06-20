import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IWebhookRepository } from '../../domain/interfaces/webhook.repository.interface.js';
import { WebhookEntity, type WebhookEvent } from '../../domain/entities/webhook.entity.js';

@Injectable()
export class WebhookRepository implements IWebhookRepository {
  async save(w: WebhookEntity): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO "webhooks" (id, workspace_id, url, secret, events, is_active, created_at)
        VALUES (${w.id}, ${w.workspaceId}, ${w.url}, ${w.secret},
                ${JSON.stringify(w.events)}::jsonb, ${w.isActive}, ${w.createdAt})
      `;
    } catch (err) {
      throw new Error(`WebhookRepository.save failed: ${(err as Error).message}`);
    }
  }

  async update(w: WebhookEntity): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE "webhooks"
        SET url = ${w.url}, events = ${JSON.stringify(w.events)}::jsonb,
            is_active = ${w.isActive}
        WHERE id = ${w.id}
      `;
    } catch (err) {
      throw new Error(`WebhookRepository.update failed: ${(err as Error).message}`);
    }
  }

  async findById(id: string): Promise<WebhookEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "webhooks" WHERE id = ${id} LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._map(rows[0]);
    } catch {
      return null;
    }
  }

  async findAllByWorkspace(
    workspaceId: string,
    options?: { offset?: number; limit?: number },
  ): Promise<WebhookEntity[]> {
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "webhooks"
        WHERE workspace_id = ${workspaceId}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      return rows.map(r => this._map(r));
    } catch {
      return [];
    }
  }

  async findActiveByEvent(workspaceId: string, event: WebhookEvent): Promise<WebhookEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "webhooks"
        WHERE workspace_id = ${workspaceId}
          AND is_active = true
          AND events @> ${JSON.stringify([event])}::jsonb
        ORDER BY created_at ASC
      `;
      return rows.map(r => this._map(r));
    } catch {
      return [];
    }
  }

  async countByWorkspace(workspaceId: string): Promise<number> {
    try {
      const result = await prisma.$queryRaw<{ count: string }[]>`
        SELECT COUNT(*)::text as count FROM "webhooks"
        WHERE workspace_id = ${workspaceId}
      `;
      return Number(result[0]?.count ?? 0);
    } catch {
      return 0;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.$executeRaw`DELETE FROM "webhooks" WHERE id = ${id}`;
    } catch (err) {
      throw new Error(`WebhookRepository.delete failed: ${(err as Error).message}`);
    }
  }

  private _map(row: any): WebhookEntity {
    const events = typeof row.events === 'string' ? JSON.parse(row.events) : (row.events ?? []);
    return WebhookEntity.reconstitute({
      id: row.id,
      workspaceId: row.workspace_id,
      url: row.url,
      secret: row.secret ?? null,
      events: Array.isArray(events) ? events : [],
      isActive: row.is_active,
      createdAt: row.created_at,
    });
  }
}
