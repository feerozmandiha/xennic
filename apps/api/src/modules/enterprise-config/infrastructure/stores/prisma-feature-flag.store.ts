import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { IFeatureFlag, FeatureFlagDefinition } from '../../domain/interfaces/feature-flag.interface.js';

@Injectable()
export class PrismaFeatureFlagStore implements IFeatureFlag {
  async isEnabled(key: string, workspaceId?: string, _userId?: string): Promise<boolean> {
    const flag = await prisma.feature_flags.findFirst({
      where: { name: key, workspace_id: workspaceId ?? null },
    });
    return flag?.enabled ?? false;
  }

  async enable(key: string, workspaceId?: string): Promise<void> {
    await prisma.feature_flags.upsert({
      where: { name: key },
      create: { name: key, enabled: true, workspace_id: workspaceId ?? null },
      update: { enabled: true, workspace_id: workspaceId ?? null },
    });
  }

  async disable(key: string, workspaceId?: string): Promise<void> {
    await prisma.feature_flags.upsert({
      where: { name: key },
      create: { name: key, enabled: false, workspace_id: workspaceId ?? null },
      update: { enabled: false, workspace_id: workspaceId ?? null },
    });
  }

  async define(flag: FeatureFlagDefinition): Promise<void> {
    await prisma.feature_flags.upsert({
      where: { name: flag.key },
      create: {
        name: flag.key,
        description: flag.description,
        enabled: flag.enabled,
        workspace_id: null,
      },
      update: {
        description: flag.description,
        enabled: flag.enabled,
      },
    });
  }

  async listFlags(): Promise<FeatureFlagDefinition[]> {
    const rows = await prisma.feature_flags.findMany({ orderBy: { name: 'asc' } });
    return rows.map(r => ({
      key: r.name,
      name: r.name,
      description: r.description ?? '',
      enabled: r.enabled,
    }));
  }
}
