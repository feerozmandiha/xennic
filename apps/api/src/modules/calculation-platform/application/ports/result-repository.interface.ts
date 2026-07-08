import type { CalculationResultEntity } from '../../domain/entities/calculation-result.entity.js';

export interface IResultRepository {
  findById(id: string): Promise<CalculationResultEntity | null>;
  findByWorkspaceId(workspaceId: string, options?: { page?: number; limit?: number; definitionId?: string }): Promise<{ data: CalculationResultEntity[]; total: number }>;
  save(result: CalculationResultEntity): Promise<void>;
}

export const IRESULT_REPOSITORY = 'IResultRepository';
