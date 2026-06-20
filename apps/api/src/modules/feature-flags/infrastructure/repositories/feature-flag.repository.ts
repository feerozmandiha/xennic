import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IFeatureFlagRepository } from '../../domain/interfaces/feature-flag.repository.interface.js';
import { FeatureFlagEntity } from '../../domain/entities/feature-flag.entity.js';

@Injectable()
export class FeatureFlagRepository implements IFeatureFlagRepository {
  async save(f: FeatureFlagEntity): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO "feature_flags" (id, name, description, enabled, plan_id, workspace_id, created_at)
        VALUES (${f.id}, ${f.name}, ${f.description}, ${f.enabled}, ${f.planId}, ${f.workspaceId}, ${f.createdAt})
      `;
    } catch (err) {
      throw new Error(`FeatureFlagRepository.save failed: ${(err as Error).message}`);
    }
  }

  async update(f: FeatureFlagEntity): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE "feature_flags"
        SET name = ${f.name}, description = ${f.description}, enabled = ${f.enabled},
            plan_id = ${f.planId}, workspace_id = ${f.workspaceId}
        WHERE id = ${f.id}
      `;
    } catch (err) {
      throw new Error(`FeatureFlagRepository.update failed: ${(err as Error).message}`);
    }
  }

  async findById(id: string): Promise<FeatureFlagEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "feature_flags" WHERE id = ${id} LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._map(rows[0]);
    } catch { return null; }
  }

  async findByName(name: string): Promise<FeatureFlagEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "feature_flags" WHERE name = ${name} LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._map(rows[0]);
    } catch { return null; }
  }

  async findAll(options?: { offset?: number; limit?: number }): Promise<FeatureFlagEntity[]> {
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 50;
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "feature_flags" ORDER BY name ASC LIMIT ${limit} OFFSET ${offset}
      `;
      return rows.map(r => this._map(r));
    } catch { return []; }
  }

  async count(): Promise<number> {
    try {
      const result = await prisma.$queryRaw<{ count: string }[]>`
        SELECT COUNT(*)::text as count FROM "feature_flags"
      `;
      return Number(result[0]?.count ?? 0);
    } catch { return 0; }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.$executeRaw`DELETE FROM "feature_flags" WHERE id = ${id}`;
    } catch (err) {
      throw new Error(`FeatureFlagRepository.delete failed: ${(err as Error).message}`);
    }
  }

  private _map(row: any): FeatureFlagEntity {
    return FeatureFlagEntity.reconstitute({
      id: row.id,
      name: row.name,
      description: row.description ?? null,
      enabled: row.enabled,
      planId: row.plan_id ?? null,
      workspaceId: row.workspace_id ?? null,
      createdAt: row.created_at,
    });
  }
}
