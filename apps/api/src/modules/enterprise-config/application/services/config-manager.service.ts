import { Injectable, Logger } from '@nestjs/common';
import type {
  ConfigScope,
  ConfigEntry,
  IConfigStore,
} from '../../domain/interfaces/config-store.interface.js';
import type {
  FeatureFlagDefinition,
  IFeatureFlag,
} from '../../domain/interfaces/feature-flag.interface.js';

@Injectable()
export class ConfigManagerService implements IConfigStore, IFeatureFlag {
  private readonly logger = new Logger(ConfigManagerService.name);
  private readonly configStore = new Map<string, ConfigEntry>();
  private readonly featureFlags = new Map<string, FeatureFlagDefinition>();

  private _configKey(key: string, scope: ConfigScope, scopeId?: string): string {
    return scopeId ? `${scope}:${scopeId}:${key}` : `${scope}:${key}`;
  }

  async get<T>(key: string, scope: ConfigScope, scopeId?: string): Promise<T | undefined> {
    const entry = this.configStore.get(this._configKey(key, scope, scopeId));
    if (!entry) {
      const globalEntry = this.configStore.get(this._configKey(key, 'system'));
      return globalEntry?.value as T | undefined;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, scope: ConfigScope, scopeId?: string): Promise<void> {
    const configKey = this._configKey(key, scope, scopeId);
    const existing = this.configStore.get(configKey);
    this.configStore.set(configKey, {
      key,
      value,
      scope,
      scopeId,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: (existing?.version ?? 0) + 1,
    });
    this.logger.debug(`Config set: ${configKey} = ${JSON.stringify(value)}`);
  }

  async delete(key: string, scope: ConfigScope, scopeId?: string): Promise<boolean> {
    return this.configStore.delete(this._configKey(key, scope, scopeId));
  }

  async list(scope: ConfigScope, scopeId?: string): Promise<ConfigEntry[]> {
    const entries: ConfigEntry[] = [];
    for (const [ckey, entry] of this.configStore) {
      if (ckey.startsWith(`${scope}:${scopeId ? `${scopeId}:` : ''}`)) {
        entries.push(entry);
      }
    }
    return entries;
  }

  async isEnabled(key: string, workspaceId?: string, userId?: string): Promise<boolean> {
    const flag = this.featureFlags.get(key);
    if (!flag) return false;

    if (userId && flag.userOverrides?.[userId] !== undefined) {
      return flag.userOverrides[userId];
    }
    if (workspaceId && flag.workspaceOverrides?.[workspaceId] !== undefined) {
      return flag.workspaceOverrides[workspaceId];
    }
    if (flag.expiresAt && new Date(flag.expiresAt) < new Date()) {
      return false;
    }
    if (flag.dependencies && flag.dependencies.length > 0) {
      for (const dep of flag.dependencies) {
        if (!(await this.isEnabled(dep, workspaceId, userId))) return false;
      }
    }
    return flag.enabled;
  }

  async enable(key: string, workspaceId?: string): Promise<void> {
    const flag = this.featureFlags.get(key);
    if (!flag) throw new Error(`Feature flag not found: ${key}`);

    if (workspaceId) {
      flag.workspaceOverrides = { ...flag.workspaceOverrides, [workspaceId]: true };
    } else {
      flag.enabled = true;
    }
    this.logger.log(
      `Feature flag ${key} enabled${workspaceId ? ` for workspace ${workspaceId}` : ''}`,
    );
  }

  async disable(key: string, workspaceId?: string): Promise<void> {
    const flag = this.featureFlags.get(key);
    if (!flag) throw new Error(`Feature flag not found: ${key}`);

    if (workspaceId) {
      flag.workspaceOverrides = { ...flag.workspaceOverrides, [workspaceId]: false };
    } else {
      flag.enabled = false;
    }
    this.logger.log(
      `Feature flag ${key} disabled${workspaceId ? ` for workspace ${workspaceId}` : ''}`,
    );
  }

  async define(flag: FeatureFlagDefinition): Promise<void> {
    this.featureFlags.set(flag.key, flag);
    this.logger.log(`Feature flag defined: ${flag.key} (${flag.enabled ? 'enabled' : 'disabled'})`);
  }

  async listFlags(): Promise<FeatureFlagDefinition[]> {
    return Array.from(this.featureFlags.values());
  }
}
