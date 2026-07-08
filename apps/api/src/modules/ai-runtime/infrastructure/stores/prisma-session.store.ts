import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { ISessionStore } from '../../domain/interfaces/session-store.interface.js';
import { AgentSession } from '../../domain/types/session.types.js';

interface SessionRow {
  id: string;
  workspace_id: string;
  agent_id: string;
  user_id: string;
  status: string;
  metadata: unknown;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class PrismaSessionStore implements ISessionStore {
  async create(session: AgentSession): Promise<void> {
    await prisma.agent_sessions.create({
      data: {
        id: session.id,
        workspace_id: session.workspaceId,
        agent_id: session.agentId,
        user_id: session.userId,
        status: session.status,
        metadata: session.metadata as Record<string, unknown>,
        expires_at: session.expiresAt,
        created_at: session.createdAt,
      },
    });
  }

  async findById(id: string): Promise<AgentSession | null> {
    const row = await prisma.agent_sessions.findUnique({ where: { id } });
    if (!row) return null;

    return this.toEntity(row as SessionRow);
  }

  async findByUser(workspaceId: string, userId: string): Promise<AgentSession[]> {
    const rows = await prisma.agent_sessions.findMany({
      where: { workspace_id: workspaceId, user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    return rows.map((row: unknown) => this.toEntity(row as SessionRow));
  }

  async update(session: AgentSession): Promise<void> {
    await prisma.agent_sessions.update({
      where: { id: session.id },
      data: {
        status: session.status,
        metadata: session.metadata as Record<string, unknown>,
        expires_at: session.expiresAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.agent_sessions.delete({ where: { id } });
  }

  async cleanupExpired(): Promise<number> {
    const result = await prisma.agent_sessions.deleteMany({
      where: { expires_at: { lt: new Date() } },
    });
    return result.count;
  }

  private toEntity(row: SessionRow): AgentSession {
    return new AgentSession(
      row.id,
      row.agent_id,
      row.workspace_id,
      row.user_id,
      row.status as AgentSession['status'],
      row.created_at,
      row.expires_at,
      (row.metadata ?? {}) as Record<string, unknown>,
    );
  }
}
