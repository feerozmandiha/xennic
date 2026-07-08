import type { CalculationPluginEntity } from '../../domain/entities/calculation-plugin.entity.js';

export interface IPluginRepository {
  findById(id: string): Promise<CalculationPluginEntity | null>;
  findBySlug(slug: string): Promise<CalculationPluginEntity | null>;
  findAll(options?: { enabled?: boolean }): Promise<CalculationPluginEntity[]>;
  save(plugin: CalculationPluginEntity): Promise<void>;
  delete(id: string): Promise<void>;
  existsBySlug(slug: string): Promise<boolean>;
}

export const IPLUGIN_REPOSITORY = 'IPluginRepository';
