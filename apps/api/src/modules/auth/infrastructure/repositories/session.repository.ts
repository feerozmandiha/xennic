import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { ISessionRepository } from '../../domain/interfaces/session.repository.interface.js';
import { SessionEntity } from '../../domain/entities/session.entity.js';

@Injectable()
export class SessionRepository implements ISessionRepository {
  async save(session: SessionEntity): Promise<void> {
    try {
      const existingSession = await prisma.$queryRaw<any[]>`
        SELECT id FROM "sessions" WHERE id = ${session.id}
      `;

      if (existingSession && existingSession.length > 0) {
        await prisma.$executeRaw`
          UPDATE "sessions" SET
            expires_at = ${session.expiresAt},
            last_activity_at = ${session.lastActivityAt}
          WHERE id = ${session.id}
        `;
      } else {
        await prisma.$executeRaw`
          INSERT INTO "sessions" (
            id, user_id, workspace_id, ip_address, user_agent,
            expires_at, last_activity_at, created_at
          ) VALUES (
            ${session.id}, ${session.userId}, ${session.workspaceId},
            ${session.ipAddress}, ${session.userAgent},
            ${session.expiresAt}, ${session.lastActivityAt}, ${session.createdAt}
          )
        `;
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error saving session:', error.message);
      throw new Error(`Failed to save session: ${error.message}`);
    }
  }

  async findById(id: string): Promise<SessionEntity | null> {
    try {
      const sessions = await prisma.$queryRaw<any[]>`
        SELECT * FROM "sessions" WHERE id = ${id}
      `;

      if (!sessions || sessions.length === 0) return null;
      const session = sessions[0];

      return SessionEntity.reconstitute({
        id: session.id,
        userId: session.user_id,
        workspaceId: session.workspace_id,
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        expiresAt: session.expires_at,
        lastActivityAt: session.last_activity_at,
        createdAt: session.created_at,
      });
    } catch (err) {
      const error = err as Error;
      console.error('Error finding session by id:', error.message);
      return null;
    }
  }

  async findByUserId(userId: string): Promise<SessionEntity[]> {
    try {
      const sessions = await prisma.$queryRaw<any[]>`
        SELECT * FROM "sessions" WHERE user_id = ${userId}
      `;

      return sessions.map((session) =>
        SessionEntity.reconstitute({
          id: session.id,
          userId: session.user_id,
          workspaceId: session.workspace_id,
          ipAddress: session.ip_address,
          userAgent: session.user_agent,
          expiresAt: session.expires_at,
          lastActivityAt: session.last_activity_at,
          createdAt: session.created_at,
        }),
      );
    } catch (err) {
      const error = err as Error;
      console.error('Error finding sessions by user id:', error.message);
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        DELETE FROM "sessions" WHERE id = ${id}
      `;
    } catch (err) {
      const error = err as Error;
      console.error('Error deleting session:', error.message);
      throw new Error(`Failed to delete session: ${error.message}`);
    }
  }

  async deleteByUserId(userId: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        DELETE FROM "sessions" WHERE user_id = ${userId}
      `;
    } catch (err) {
      const error = err as Error;
      console.error('Error deleting sessions by user id:', error.message);
      throw new Error(`Failed to delete sessions: ${error.message}`);
    }
  }

  async updateLastActivity(id: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE "sessions" SET last_activity_at = ${new Date()}
        WHERE id = ${id}
      `;
    } catch (err) {
      const error = err as Error;
      console.error('Error updating session activity:', error.message);
    }
  }
}