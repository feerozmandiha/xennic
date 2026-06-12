import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { ICalculationRepository } from '../../domain/interfaces/calculation.repository.interface.js';
import { CalculationEntity } from '../../domain/entities/calculation.entity.js';

@Injectable()
export class CalculationRepository implements ICalculationRepository {

  async save(calc: CalculationEntity): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO "calculations" (
          id, workspace_id, project_id, user_id,
          type, version, inputs, results,
          engine_version, standard_version, created_at
        ) VALUES (
          ${calc.id},
          ${calc.workspaceId},
          ${calc.projectId},
          ${calc.userId},
          ${calc.type},
          ${calc.version},
          ${JSON.stringify(calc.inputs)}::jsonb,
          ${JSON.stringify(calc.results)}::jsonb,
          ${calc.engineVersion},
          ${calc.standardVersion},
          ${calc.createdAt}
        )
      `;
    } catch (err) {
      // محاسبه باید ادامه یابد حتی اگر ذخیره شکست بخورد
      const error = err as Error;
      console.error('CalculationRepository.save failed:', error.message);
    }
  }

  async findById(id: string): Promise<CalculationEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "calculations" WHERE id = ${id} LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._map(rows[0]);
    } catch {
      return null;
    }
  }

  async findAll(
    workspaceId: string,
    options?: {
      projectId?: string;
      type?: string;
      offset?: number;
      limit?: number;
    },
  ): Promise<CalculationEntity[]> {
    const offset = options?.offset ?? 0;
    const limit  = options?.limit  ?? 20;

    try {
      let rows: any[];

      if (options?.projectId && options?.type) {
        rows = await prisma.$queryRaw<any[]>`
          SELECT * FROM "calculations"
          WHERE workspace_id = ${workspaceId}
            AND project_id   = ${options.projectId}
            AND type         = ${options.type}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else if (options?.projectId) {
        rows = await prisma.$queryRaw<any[]>`
          SELECT * FROM "calculations"
          WHERE workspace_id = ${workspaceId}
            AND project_id   = ${options.projectId}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else if (options?.type) {
        rows = await prisma.$queryRaw<any[]>`
          SELECT * FROM "calculations"
          WHERE workspace_id = ${workspaceId}
            AND type         = ${options.type}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else {
        rows = await prisma.$queryRaw<any[]>`
          SELECT * FROM "calculations"
          WHERE workspace_id = ${workspaceId}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      }

      return rows.map((r) => this._map(r));
    } catch (err) {
      const error = err as Error;
      console.error('CalculationRepository.findAll error:', error.message);
      return [];
    }
  }

  async count(workspaceId: string, projectId?: string): Promise<number> {
    try {
      let result: any[];
      if (projectId) {
        result = await prisma.$queryRaw<any[]>`
          SELECT COUNT(*) as count FROM "calculations"
          WHERE workspace_id = ${workspaceId} AND project_id = ${projectId}
        `;
      } else {
        result = await prisma.$queryRaw<any[]>`
          SELECT COUNT(*) as count FROM "calculations"
          WHERE workspace_id = ${workspaceId}
        `;
      }
      return Number(result[0]?.count ?? 0);
    } catch {
      return 0;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.$executeRaw`DELETE FROM "calculations" WHERE id = ${id}`;
    } catch (err) {
      const error = err as Error;
      throw new Error(`CalculationRepository.delete failed: ${error.message}`);
    }
  }

  private _map(row: any): CalculationEntity {
    return CalculationEntity.reconstitute({
      id:              row.id,
      workspaceId:     row.workspace_id,
      projectId:       row.project_id    ?? null,
      userId:          row.user_id,
      type:            row.type,
      version:         row.version,
      inputs:          row.inputs        ?? {},
      results:         row.results       ?? {},
      engineVersion:   row.engine_version,
      standardVersion: row.standard_version,
      durationMs:      row.duration_ms   ?? 0,
      createdAt:       row.created_at,
    });
  }
}
