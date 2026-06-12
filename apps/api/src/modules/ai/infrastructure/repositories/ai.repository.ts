import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IAiRepository } from '../../domain/interfaces/ai.repository.interface.js';
import {
  AgentEntity, ConversationEntity, MessageEntity,
} from '../../domain/entities/conversation.entity.js';

@Injectable()
export class AiRepository implements IAiRepository {

  // ── Agents ────────────────────────────────────────────────────────────────

  async findAgentBySlug(slug: string): Promise<AgentEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "agents" WHERE slug = ${slug} AND is_active = true LIMIT 1
      `;
      if (!rows.length) return null;
      return this._mapAgent(rows[0]);
    } catch { return null; }
  }

  async findActiveAgents(): Promise<AgentEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "agents" WHERE is_active = true ORDER BY name ASC
      `;
      return rows.map(r => this._mapAgent(r));
    } catch { return []; }
  }

  // ── Conversations ─────────────────────────────────────────────────────────

  async createConversation(conv: ConversationEntity): Promise<void> {
    await prisma.$executeRaw`
      INSERT INTO "conversations" (id, workspace_id, agent_id, title, created_at, updated_at)
      VALUES (${conv.id}, ${conv.workspaceId}, ${conv.agentId},
              ${conv.title}, ${conv.createdAt}, ${conv.updatedAt})
    `;
  }

  async findConversation(id: string): Promise<ConversationEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "conversations" WHERE id = ${id} LIMIT 1
      `;
      if (!rows.length) return null;
      const msgs = await this.findMessages(id);
      return this._mapConversation(rows[0], msgs);
    } catch { return null; }
  }

  async findConversationsByWorkspace(
    workspaceId: string, limit: number, offset: number,
  ): Promise<ConversationEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT c.*, COUNT(m.id) as message_count
        FROM "conversations" c
        LEFT JOIN "messages" m ON m.conversation_id = c.id
        WHERE c.workspace_id = ${workspaceId}
        GROUP BY c.id
        ORDER BY c.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      return rows.map(r => this._mapConversation(r, []));
    } catch { return []; }
  }

  async updateConversationTitle(id: string, title: string): Promise<void> {
    await prisma.$executeRaw`
      UPDATE "conversations" SET title = ${title}, updated_at = NOW() WHERE id = ${id}
    `;
  }

  async deleteConversation(id: string): Promise<void> {
    await prisma.$executeRaw`DELETE FROM "conversations" WHERE id = ${id}`;
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  async saveMessage(msg: {
    id: string; conversationId: string; role: string;
    content: string; metadata: Record<string, unknown>; createdAt: Date;
  }): Promise<void> {
    const metaJson = JSON.stringify(msg.metadata);
    await prisma.$executeRaw`
      INSERT INTO "messages" (id, conversation_id, role, content, metadata, created_at)
      VALUES (${msg.id}, ${msg.conversationId}, ${msg.role},
              ${msg.content}, ${metaJson}::jsonb, ${msg.createdAt})
    `;
    // Update conversation updated_at
    await prisma.$executeRaw`
      UPDATE "conversations" SET updated_at = NOW() WHERE id = ${msg.conversationId}
    `;
  }

  async findMessages(conversationId: string): Promise<MessageEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "messages"
        WHERE conversation_id = ${conversationId}
        ORDER BY created_at ASC
      `;
      return rows.map(r => MessageEntity.reconstitute({
        id:             r.id,
        conversationId: r.conversation_id,
        role:           r.role,
        content:        r.content,
        metadata:       r.metadata ?? {},
        createdAt:      r.created_at,
      }));
    } catch { return []; }
  }

  // ── Usage ─────────────────────────────────────────────────────────────────

  async recordUsage(data: {
    workspaceId: string; userId: string; agentId?: string;
    provider: string; model: string;
    promptTokens: number; completionTokens: number; totalTokens: number;
    cost: number;
  }): Promise<void> {
    try {
      const id = crypto.randomUUID();
      await prisma.$executeRaw`
        INSERT INTO "ai_usage"
          (id, workspace_id, user_id, agent_id, provider, model,
           prompt_tokens, completion_tokens, total_tokens, cost, created_at)
        VALUES
          (${id}, ${data.workspaceId}, ${data.userId},
           ${data.agentId ?? null}, ${data.provider}, ${data.model},
           ${data.promptTokens}, ${data.completionTokens}, ${data.totalTokens},
           ${data.cost}, NOW())
      `;
    } catch { /* non-critical */ }
  }

  async getUsageStats(workspaceId: string, month: Date): Promise<{
    totalRequests: number; totalTokens: number; totalCost: number;
  }> {
    try {
      const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
      const endOfMonth   = new Date(month.getFullYear(), month.getMonth() + 1, 1);

      const rows = await prisma.$queryRaw<any[]>`
        SELECT
          COUNT(*) as total_requests,
          COALESCE(SUM(total_tokens), 0) as total_tokens,
          COALESCE(SUM(cost), 0) as total_cost
        FROM "ai_usage"
        WHERE workspace_id = ${workspaceId}
          AND created_at >= ${startOfMonth}
          AND created_at <  ${endOfMonth}
      `;
      const r = rows[0];
      return {
        totalRequests: Number(r?.total_requests ?? 0),
        totalTokens:   Number(r?.total_tokens   ?? 0),
        totalCost:     Number(r?.total_cost      ?? 0),
      };
    } catch {
      return { totalRequests: 0, totalTokens: 0, totalCost: 0 };
    }
  }

  // ── Private mappers ───────────────────────────────────────────────────────

  private _mapAgent(r: any): AgentEntity {
    return AgentEntity.reconstitute({
      id: r.id, name: r.name, slug: r.slug,
      version: r.version, isActive: r.is_active, createdAt: r.created_at,
    });
  }

  private _mapConversation(r: any, messages: MessageEntity[]): ConversationEntity {
    return ConversationEntity.reconstitute({
      id: r.id, workspaceId: r.workspace_id, agentId: r.agent_id,
      title: r.title ?? null,
      createdAt: r.created_at, updatedAt: r.updated_at,
      messages,
    });
  }
}
