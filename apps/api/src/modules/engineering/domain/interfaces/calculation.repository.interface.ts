import type { CalculationEntity } from '../entities/calculation.entity.js';

export interface ICalculationRepository {
  save(calculation: CalculationEntity): Promise<void>;
  findById(id: string): Promise<CalculationEntity | null>;
  findAll(
    workspaceId: string,
    options?: {
      projectId?: string;
      type?: string;
      offset?: number;
      limit?: number;
    },
  ): Promise<CalculationEntity[]>;
  count(workspaceId: string, projectId?: string): Promise<number>;
  delete(id: string): Promise<void>;
}
