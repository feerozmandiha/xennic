import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { IResultRepository } from '../../application/ports/result-repository.interface.js';
import { CalculationResultEntity } from '../../domain/entities/calculation-result.entity.js';

const prisma = new PrismaClient();

@Injectable()
export class PrismaResultRepository implements IResultRepository {
  private readonly logger = new Logger(PrismaResultRepository.name);

  async findById(id: string): Promise<CalculationResultEntity | null> {
    const row = await prisma.calculation_results.findUnique({ where: { id } });
    if (!row) return null;
    return CalculationResultEntity.reconstitute({
      ...row,
      inputs: row.inputs as any,
      outputs: row.outputs as any | null,
      ai_review: row.ai_review as any | null,
    });
  }

  async findByWorkspaceId(workspaceId: string, options?: { page?: number; limit?: number; definitionId?: string }): Promise<{ data: CalculationResultEntity[]; total: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const where: Record<string, unknown> = { workspace_id: workspaceId };
    if (options?.definitionId) where.definition_id = options.definitionId;
    const [rows, total] = await Promise.all([
      prisma.calculation_results.findMany({
        where,
        orderBy: { executed_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.calculation_results.count({ where }),
    ]);
    return {
      data: rows.map(r => CalculationResultEntity.reconstitute({
        ...r,
        inputs: r.inputs as any,
        outputs: r.outputs as any | null,
        ai_review: r.ai_review as any | null,
      })),
      total,
    };
  }

  async save(result: CalculationResultEntity): Promise<void> {
    await prisma.calculation_results.upsert({
      where: { id: result.id },
      update: {
        outputs: result.outputs as any,
        status: result.status,
        error_message: result.errorMessage,
        duration_ms: result.durationMs,
        ai_review: result.aiReview as any,
        confidence: result.confidence,
      },
      create: {
        id: result.id,
        workspace_id: result.workspaceId,
        definition_id: result.definitionId,
        version_id: result.versionId,
        user_id: result.userId,
        inputs: result.inputs as any,
        outputs: result.outputs as any,
        status: result.status,
        error_message: result.errorMessage,
        engine_version: result.engineVersion,
        duration_ms: result.durationMs,
        ai_review: result.aiReview as any,
        confidence: result.confidence,
        correlation_id: result.correlationId,
        executed_at: result.executedAt,
        created_at: result.createdAt,
      },
    });
  }
}
