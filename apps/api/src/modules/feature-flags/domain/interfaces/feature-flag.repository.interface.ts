import type { FeatureFlagEntity } from '../entities/feature-flag.entity.js';

export interface IFeatureFlagRepository {
  save(flag: FeatureFlagEntity): Promise<void>;
  update(flag: FeatureFlagEntity): Promise<void>;
  findById(id: string): Promise<FeatureFlagEntity | null>;
  findByName(name: string): Promise<FeatureFlagEntity | null>;
  findAll(options?: { offset?: number; limit?: number }): Promise<FeatureFlagEntity[]>;
  count(): Promise<number>;
  delete(id: string): Promise<void>;
}
