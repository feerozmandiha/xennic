import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import type { IFeatureFlagRepository } from '../../domain/interfaces/feature-flag.repository.interface.js';
import { FeatureFlagEntity } from '../../domain/entities/feature-flag.entity.js';

@Injectable()
export class FeatureFlagService {
  private readonly logger = new Logger(FeatureFlagService.name);

  constructor(
    @Inject('IFeatureFlagRepository')
    private readonly repository: IFeatureFlagRepository,
  ) {}

  async create(data: {
    name: string;
    description?: string;
    enabled?: boolean;
    planId?: string;
    workspaceId?: string;
  }): Promise<FeatureFlagEntity> {
    if (!data.name || data.name.trim().length === 0) {
      throw new BadRequestException('Feature flag name is required');
    }
    const slug = data.name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    if (!slug) {
      throw new BadRequestException('Feature flag name must contain at least one alphanumeric character');
    }

    const existing = await this.repository.findByName(slug);
    if (existing) {
      throw new ConflictException(`Feature flag "${slug}" already exists`);
    }

    const flag = FeatureFlagEntity.create({
      name: slug,
      description: data.description,
      enabled: data.enabled,
      planId: data.planId,
      workspaceId: data.workspaceId,
    });

    await this.repository.save(flag);
    this.logger.log(`Feature flag created: ${slug} (enabled=${flag.enabled})`);
    return flag;
  }

  async findAll(page = 1, limit = 50): Promise<{
    data: FeatureFlagEntity[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repository.findAll({ offset, limit }),
      this.repository.count(),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<FeatureFlagEntity> {
    return this._get(id);
  }

  async toggle(id: string, enabled: boolean): Promise<FeatureFlagEntity> {
    const flag = await this._get(id);
    if (enabled) flag.enable();
    else flag.disable();
    await this.repository.update(flag);
    this.logger.log(`Feature flag "${flag.name}" → ${enabled ? 'ENABLED' : 'DISABLED'}`);
    return flag;
  }

  async update(id: string, data: { description?: string; planId?: string | null; workspaceId?: string | null }): Promise<FeatureFlagEntity> {
    const flag = await this._get(id);
    if (data.description !== undefined) flag.setDescription(data.description);
    if (data.planId !== undefined) Object.assign(flag, { planId: data.planId });
    if (data.workspaceId !== undefined) Object.assign(flag, { workspaceId: data.workspaceId });
    await this.repository.update(flag);
    return flag;
  }

  async delete(id: string): Promise<void> {
    const flag = await this._get(id);
    await this.repository.delete(flag.id);
    this.logger.log(`Feature flag deleted: ${flag.name}`);
  }

  async isEnabled(name: string, options?: { workspaceId?: string; planId?: string }): Promise<boolean> {
    const flag = await this.repository.findByName(name);
    if (!flag) return false;
    if (!flag.enabled) return false;

    // Check scope: workspace-specific overrides plan and global
    if (flag.workspaceId) {
      return flag.workspaceId === options?.workspaceId;
    }

    // Check plan scope
    if (flag.planId) {
      return flag.planId === options?.planId;
    }

    // Global flag
    return true;
  }

  async getEnabledFeatures(options?: { workspaceId?: string; planId?: string }): Promise<string[]> {
    const all = await this.repository.findAll({ limit: 200 });
    const enabled: string[] = [];
    for (const flag of all) {
      if (flag.enabled) {
        if (flag.workspaceId && flag.workspaceId === options?.workspaceId) {
          enabled.push(flag.name);
        } else if (flag.planId && flag.planId === options?.planId) {
          enabled.push(flag.name);
        } else if (!flag.planId && !flag.workspaceId) {
          enabled.push(flag.name);
        }
      }
    }
    return enabled;
  }

  private async _get(id: string): Promise<FeatureFlagEntity> {
    const flag = await this.repository.findById(id);
    if (!flag) throw new NotFoundException(`Feature flag "${id}" not found`);
    return flag;
  }
}
