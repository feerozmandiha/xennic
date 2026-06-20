import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IApiKeyRepository } from '../../domain/interfaces/api-key.repository.interface.js';
import { ApiKeyEntity } from '../../domain/entities/api-key.entity.js';

@Injectable()
export class ApiKeyRepository implements IApiKeyRepository {
  async save(k: ApiKeyEntity): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO "api_keys" (id, workspace_id, name, key_hash, last_used_at, expires_at, created_at)
        VALUES (${k.id}, ${k.workspaceId}, ${k.name}, ${k.keyHash}, ${k.lastUsedAt}, ${k.expiresAt}, ${k.createdAt})
      `;
    } catch (err) {
      throw new Error(`ApiKeyRepository.save failed: ${(err as Error).message}`);
    }
  }

  async update(k: ApiKeyEntity): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE "api_keys"
        SET name = ${k.name}, last_used_at = ${k.lastUsedAt}
        WHERE id = ${k.id}
      `;
    } catch (err) {
      throw new Error(`ApiKeyRepository.update failed: ${(err as Error).message}`);
    }
  }

  async findById(id: string): Promise<ApiKeyEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "api_keys" WHERE id = ${id} LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._map(rows[0]);
    } catch {
      return null;
    }
  }

  async findByKeyHash(keyHash: string): Promise<ApiKeyEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "api_keys" WHERE key_hash = ${keyHash} LIMIT 1
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
  ): Promise<ApiKeyEntity[]> {
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "api_keys"
        WHERE workspace_id = ${workspaceId}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      return rows.map(r => this._map(r));
    } catch {
      return [];
    }
  }

  async countByWorkspace(workspaceId: string): Promise<number> {
    try {
      const result = await prisma.$queryRaw<{ count: string }[]>`
        SELECT COUNT(*)::text as count FROM "api_keys"
        WHERE workspace_id = ${workspaceId}
      `;
      return Number(result[0]?.count ?? 0);
    } catch {
      return 0;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.$executeRaw`DELETE FROM "api_keys" WHERE id = ${id}`;
    } catch (err) {
      throw new Error(`ApiKeyRepository.delete failed: ${(err as Error).message}`);
    }
  }

  private _map(row: any): ApiKeyEntity {
    return ApiKeyEntity.reconstitute({
      id: row.id,
      workspaceId: row.workspace_id,
      name: row.name,
      keyHash: row.key_hash,
      lastUsedAt: row.last_used_at ?? null,
      expiresAt: row.expires_at ?? null,
      createdAt: row.created_at,
    });
  }
}
