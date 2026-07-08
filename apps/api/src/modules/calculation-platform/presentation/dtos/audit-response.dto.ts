import type { CalculationAuditEntity } from '../../domain/entities/calculation-audit.entity.js';

export class AuditResponseDto {
  id!: string; workspaceId!: string; userId!: string;
  action!: string; entityType!: string; entityId!: string | null;
  errorMessage!: string | null; durationMs!: number | null;
  correlationId!: string | null; createdAt!: string;

  static fromEntity(entity: CalculationAuditEntity): AuditResponseDto {
    return { id: entity.id, workspaceId: entity.workspaceId, userId: entity.userId, action: entity.action, entityType: entity.entityType, entityId: entity.entityId, errorMessage: entity.errorMessage, durationMs: entity.durationMs, correlationId: entity.correlationId, createdAt: entity.createdAt.toISOString() };
  }
  static fromEntities(entities: CalculationAuditEntity[]): AuditResponseDto[] {
    return entities.map(AuditResponseDto.fromEntity);
  }
}
