import { Injectable } from '@nestjs/common';
import { prisma }     from '@xennic/database';
import { randomUUID } from 'node:crypto';
import {
  ConsultationEntity, ConsultationReply,
} from '../../domain/entities/consultation.entity.js';

@Injectable()
export class ConsultationsRepository {

  private _mapReply(r: any): ConsultationReply {
    return new ConsultationReply(
      r.id, r.consultation_id, r.author_id, r.author_name ?? 'کارشناس',
      r.is_expert ?? false, r.content, new Date(r.created_at),
    );
  }

  private _map(r: any, replies: ConsultationReply[] = []): ConsultationEntity {
    return new ConsultationEntity(
      r.id, r.workspace_id, r.user_id, r.user_name ?? 'کاربر',
      r.title, r.description ?? '', r.category ?? 'general',
      r.priority ?? 'normal', r.status ?? 'pending',
      JSON.parse(r.attachments ?? '[]'), JSON.parse(r.tags ?? '[]'),
      replies, new Date(r.created_at), new Date(r.updated_at),
      r.answered_at ? new Date(r.answered_at) : null,
    );
  }

  async findByWorkspace(workspaceId: string, page: number, limit: number, status?: string) {
    const offset = (page - 1) * limit;
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT c.*, u.name as user_name
        FROM "consultations" c
        LEFT JOIN "users" u ON u.id = c.user_id
        WHERE c.workspace_id = ${workspaceId}
          ${status ? prisma.$queryRaw`AND c.status = ${status}` : prisma.$queryRaw``}
        ORDER BY c.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const [{ count }] = await prisma.$queryRaw<any[]>`
        SELECT COUNT(*) FROM "consultations" WHERE workspace_id = ${workspaceId}
      `;
      return {
        data:  rows.map(r => this._map(r)),
        total: Number(count),
      };
    } catch {
      return { data: [], total: 0 };
    }
  }

  async findById(id: string): Promise<ConsultationEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT c.*, u.name as user_name
        FROM "consultations" c
        LEFT JOIN "users" u ON u.id = c.user_id
        WHERE c.id = ${id} LIMIT 1
      `;
      if (!rows.length) return null;
      const replies = await prisma.$queryRaw<any[]>`
        SELECT * FROM "consultation_replies" WHERE consultation_id = ${id}
        ORDER BY created_at ASC
      `;
      return this._map(rows[0], replies.map(r => this._mapReply(r)));
    } catch { return null; }
  }

  async create(data: {
    workspaceId: string; userId: string; userName: string;
    title: string; description: string;
    category: string; priority: string; tags: string[];
  }): Promise<ConsultationEntity> {
    const id  = randomUUID();
    const now = new Date();
    try {
      await prisma.$executeRaw`
        INSERT INTO "consultations"
          (id, workspace_id, user_id, title, description, category, priority,
           status, attachments, tags, created_at, updated_at)
        VALUES
          (${id}, ${data.workspaceId}, ${data.userId}, ${data.title},
           ${data.description}, ${data.category}, ${data.priority},
           'pending', '[]', ${JSON.stringify(data.tags)}, ${now}, ${now})
      `;
    } catch { /* جدول هنوز وجود ندارد */ }

    return new ConsultationEntity(
      id, data.workspaceId, data.userId, data.userName,
      data.title, data.description,
      data.category as any, data.priority as any,
      'pending', [], data.tags, [], now, now, null,
    );
  }

  async addReply(consultationId: string, data: {
    authorId: string; authorName: string; isExpert: boolean; content: string;
  }): Promise<ConsultationReply> {
    const id  = randomUUID();
    const now = new Date();
    try {
      await prisma.$executeRaw`
        INSERT INTO "consultation_replies"
          (id, consultation_id, author_id, author_name, is_expert, content, created_at)
        VALUES
          (${id}, ${consultationId}, ${data.authorId}, ${data.authorName},
           ${data.isExpert}, ${data.content}, ${now})
      `;
      await prisma.$executeRaw`
        UPDATE "consultations"
        SET status = 'answered', answered_at = ${now}, updated_at = ${now}
        WHERE id = ${consultationId}
      `;
    } catch { /* ignore */ }

    return new ConsultationReply(
      id, consultationId, data.authorId, data.authorName,
      data.isExpert, data.content, now,
    );
  }

  async updateStatus(id: string, status: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE "consultations" SET status = ${status}, updated_at = ${new Date()}
        WHERE id = ${id}
      `;
    } catch { /* ignore */ }
  }
}
