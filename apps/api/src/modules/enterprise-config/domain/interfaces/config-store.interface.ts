export const ICONFIG_STORE = 'IConfigStore' as const;

export type ConfigScope = 'system' | 'workspace' | 'user';

export interface ConfigEntry<T = unknown> {
  key: string;
  value: T;
  scope: ConfigScope;
  scopeId?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface IConfigStore {
  get<T>(key: string, scope: ConfigScope, scopeId?: string): Promise<T | undefined>;
  set<T>(key: string, value: T, scope: ConfigScope, scopeId?: string): Promise<void>;
  delete(key: string, scope: ConfigScope, scopeId?: string): Promise<boolean>;
  list(scope: ConfigScope, scopeId?: string): Promise<ConfigEntry[]>;
}
