export enum ConfigScope {
  SYSTEM = 'system',
  WORKSPACE = 'workspace',
  USER = 'user',
  PROJECT = 'project',
}

export enum ConfigValueType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
  SECRET = 'secret',
}

export interface ConfigEntry {
  key: string;
  value: unknown;
  scope: ConfigScope;
  scopeId?: string;
  type: ConfigValueType;
  description: string;
  version: number;
  tags: string[];
  isEncrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfigVersion {
  id: string;
  configKey: string;
  value: unknown;
  version: number;
  changeType: 'created' | 'updated' | 'deleted';
  changedBy: string;
  changedAt: Date;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  scope: ConfigScope;
  scopeId?: string;
  rules?: FeatureFlagRule[];
  description: string;
}

export interface FeatureFlagRule {
  attribute: string;
  operator: 'eq' | 'neq' | 'in' | 'nin' | 'gt' | 'lt' | 'contains';
  value: unknown;
}
