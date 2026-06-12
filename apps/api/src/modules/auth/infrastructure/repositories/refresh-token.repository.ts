import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface.js';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token.entity.js';
import * as crypto from 'crypto';

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async save(token: RefreshTokenEntity): Promise<void> {
    try {
      const existingToken = await prisma.$queryRaw<any[]>`
        SELECT id FROM "refresh_tokens" WHERE id = ${token.id}
      `;

      if (existingToken && existingToken.length > 0) {
        await prisma.$executeRaw`
          UPDATE "refresh_tokens" SET
            revoked_at = ${token.revokedAt}
          WHERE id = ${token.id}
        `;
      } else {
        await prisma.$executeRaw`
          INSERT INTO "refresh_tokens" (
            id, user_id, token_hash, expires_at, revoked_at, created_at
          ) VALUES (
            ${token.id}, ${token.userId}, ${token.tokenHash},
            ${token.expiresAt}, ${token.revokedAt}, ${token.createdAt}
          )
        `;
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error saving refresh token:', error.message);
      throw new Error(`Failed to save refresh token: ${error.message}`);
    }
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null> {
    try {
      const tokens = await prisma.$queryRaw<any[]>`
        SELECT * FROM "refresh_tokens" WHERE token_hash = ${tokenHash}
      `;

      if (!tokens || tokens.length === 0) return null;
      const token = tokens[0];

      return RefreshTokenEntity.reconstitute({
        id: token.id,
        userId: token.user_id,
        tokenHash: token.token_hash,
        expiresAt: token.expires_at,
        revokedAt: token.revoked_at,
        createdAt: token.created_at,
      });
    } catch (err) {
      const error = err as Error;
      console.error('Error finding refresh token by hash:', error.message);
      return null;
    }
  }

  async findByUserId(userId: string): Promise<RefreshTokenEntity[]> {
    try {
      const tokens = await prisma.$queryRaw<any[]>`
        SELECT * FROM "refresh_tokens" WHERE user_id = ${userId}
      `;

      return tokens.map((token) =>
        RefreshTokenEntity.reconstitute({
          id: token.id,
          userId: token.user_id,
          tokenHash: token.token_hash,
          expiresAt: token.expires_at,
          revokedAt: token.revoked_at,
          createdAt: token.created_at,
        }),
      );
    } catch (err) {
      const error = err as Error;
      console.error('Error finding refresh tokens by user id:', error.message);
      return [];
    }
  }

  async revoke(id: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE "refresh_tokens" SET revoked_at = ${new Date()}
        WHERE id = ${id}
      `;
    } catch (err) {
      const error = err as Error;
      console.error('Error revoking refresh token:', error.message);
      throw new Error(`Failed to revoke refresh token: ${error.message}`);
    }
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE "refresh_tokens" SET revoked_at = ${new Date()}
        WHERE user_id = ${userId} AND revoked_at IS NULL
      `;
    } catch (err) {
      const error = err as Error;
      console.error('Error revoking all refresh tokens:', error.message);
      throw new Error(`Failed to revoke all refresh tokens: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        DELETE FROM "refresh_tokens" WHERE id = ${id}
      `;
    } catch (err) {
      const error = err as Error;
      console.error('Error deleting refresh token:', error.message);
      throw new Error(`Failed to delete refresh token: ${error.message}`);
    }
  }
}