import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IAuditRepository } from '../../application/ports/audit-repository.interface.js';
import { CalculationAuditEntity } from '../../domain/entities/calculation-audit.entity.js';

@Injectable()
export class PrismaAuditRepository implements IAuditRepository {
  private readonly logger = new Logger(PrismaAuditRepository.name);

  async save(entry: CalculationAuditEntity): Promise<void> {
    await prisma.calculation_audit.create({
      data: {
        id: entry.id,
        workspace_id: entry.workspaceId,
        user_id: entry.userId,
        action: entry.action,
        entity_type: entry.entityType,
        entity_id: entry.entityId,
        inputs: entry.inputs as any,
        outputs: entry.outputs as any,
        formula_version: entry.formulaVersion,
        ai_response: entry.aiResponse as any,
        execution_path: entry.executionPath as any,
        error_message: entry.errorMessage,
        duration_ms: entry.durationMs,
        correlation_id: entry.correlationId,
        created_at: entry.createdAt,
      },
    });
  }

  async findByWorkspaceId(
    workspaceId: string,
    options?: { page?: number; limit?: number; action?: string; entityType?: string },
  ): Promise<{ data: CalculationAuditEntity[]; total: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const where: Record<string, unknown> = { workspace_id: workspaceId };
    if (options?.action) where.action = options.action;
    if (options?.entityType) where.entity_type = options.entityType;
    const [rows, total] = await Promise.all([
      prisma.calculation_audit.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.calculation_audit.count({ where }),
    ]);
    return {
      data: rows.map((r) =>
        CalculationAuditEntity.reconstitute({
          ...r,
          inputs: r.inputs as any,
          outputs: r.outputs as any,
          ai_response: r.ai_response as any,
          execution_path: r.execution_path as any,
        }),
      ),
      total,
    };
  }

  async findById(id: string): Promise<CalculationAuditEntity | null> {
    const row = await prisma.calculation_audit.findUnique({ where: { id } });
    return row
      ? CalculationAuditEntity.reconstitute({
          ...row,
          inputs: row.inputs as any,
          outputs: row.outputs as any,
          ai_response: row.ai_response as any,
          execution_path: row.execution_path as any,
        })
      : null;
  }
}
