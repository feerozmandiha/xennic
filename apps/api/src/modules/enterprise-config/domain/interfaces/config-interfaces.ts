import type { ConfigEntry, ConfigScope, ConfigValueType, ConfigVersion, FeatureFlag, FeatureFlagRule } from '../types/config.types.js';

export interface IWorkspaceConfigService {
  get(key: string, workspaceId: string): Promise<unknown | null>;
  set(key: string, value: unknown, workspaceId: string, type?: ConfigValueType, description?: string): Promise<void>;
  delete(key: string, workspaceId: string): Promise<void>;
  list(workspaceId: string): Promise<ConfigEntry[]>;
  getVersion(key: string, workspaceId: string, version: number): Promise<ConfigVersion | null>;
  listVersions(key: string, workspaceId: string): Promise<ConfigVersion[]>;
}

export interface IDynamicConfigService {
  get(key: string): Promise<unknown | null>;
  getWithDefault<T>(key: string, defaultValue: T): Promise<T>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  watch(key: string, callback: (value: unknown) => void): Promise<void>;
  list(tags?: string[]): Promise<ConfigEntry[]>;
}

export interface IFeatureFlagService {
  isEnabled(key: string, context?: { workspaceId?: string; userId?: string }): Promise<boolean>;
  enable(key: string): Promise<void>;
  disable(key: string): Promise<void>;
  list(): Promise<FeatureFlag[]>;
  addRule(key: string, rule: FeatureFlagRule): Promise<void>;
  removeRule(key: string, ruleIndex: number): Promise<void>;
}
