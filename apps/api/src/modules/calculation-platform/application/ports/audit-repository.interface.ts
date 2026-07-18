import type { CalculationAuditEntity } from '../../domain/entities/calculation-audit.entity.js';

export interface IAuditRepository {
  save(entry: CalculationAuditEntity): Promise<void>;
  findByWorkspaceId(
    workspaceId: string,
    options?: { page?: number; limit?: number; action?: string; entityType?: string },
  ): Promise<{ data: CalculationAuditEntity[]; total: number }>;
  findById(id: string): Promise<CalculationAuditEntity | null>;
}

export const IAUDIT_REPOSITORY = 'IAuditRepository';
