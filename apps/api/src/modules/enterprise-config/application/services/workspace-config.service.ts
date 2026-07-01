import { Injectable, Logger } from '@nestjs/common';
import type { IWorkspaceConfigService } from '../../domain/interfaces/config-interfaces.js';
import type { ConfigEntry, ConfigVersion } from '../../domain/types/config.types.js';
import { ConfigValueType, ConfigScope } from '../../domain/types/config.types.js';

@Injectable()
export class WorkspaceConfigService implements IWorkspaceConfigService {
  private readonly logger = new Logger(WorkspaceConfigService.name);
  private configs = new Map<string, ConfigEntry>();
  private versions = new Map<string, ConfigVersion[]>();

  async get(key: string, workspaceId: string): Promise<unknown | null> {
    return this.configs.get(this.key(key, workspaceId))?.value ?? null;
  }

  async set(key: string, value: unknown, workspaceId: string, type?: ConfigValueType, description?: string): Promise<void> {
    const existing = this.configs.get(this.key(key, workspaceId));
    const entry: ConfigEntry = {
      key, value, scope: ConfigScope.WORKSPACE, scopeId: workspaceId, type: type ?? ConfigValueType.STRING,
      description: description ?? '', version: (existing?.version ?? 0) + 1, tags: [], isEncrypted: false,
      createdAt: existing?.createdAt ?? new Date(), updatedAt: new Date(),
    };
    this.configs.set(this.key(key, workspaceId), entry);
    this.trackVersion(key, workspaceId, entry);
    this.logger.debug(`Config set: ${workspaceId}/${key}`);
  }

  async delete(key: string, workspaceId: string): Promise<void> {
    this.configs.delete(this.key(key, workspaceId));
  }

  async list(workspaceId: string): Promise<ConfigEntry[]> {
    return Array.from(this.configs.values()).filter((e) => e.scopeId === workspaceId);
  }

  async getVersion(key: string, workspaceId: string, version: number): Promise<ConfigVersion | null> {
    const versions = this.versions.get(this.key(key, workspaceId));
    return versions?.find((v) => v.version === version) ?? null;
  }

  async listVersions(key: string, workspaceId: string): Promise<ConfigVersion[]> {
    return this.versions.get(this.key(key, workspaceId)) ?? [];
  }

  private key(k: string, ws: string): string { return `${ws}:${k}`; }

  private trackVersion(key: string, workspaceId: string, entry: ConfigEntry): void {
    const k = this.key(key, workspaceId);
    if (!this.versions.has(k)) this.versions.set(k, []);
    this.versions.get(k)!.push({
      id: `${k}-v${entry.version}`, configKey: key, value: entry.value,
      version: entry.version, changeType: 'updated', changedBy: 'system', changedAt: new Date(),
    });
  }
}
