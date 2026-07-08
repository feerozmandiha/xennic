export const IFEATURE_FLAG = 'IFeatureFlag' as const;

export interface FeatureFlagDefinition {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  workspaceOverrides?: Record<string, boolean>;
  userOverrides?: Record<string, boolean>;
  dependencies?: string[];
  expiresAt?: string;
}

export interface IFeatureFlag {
  isEnabled(key: string, workspaceId?: string, userId?: string): Promise<boolean>;
  enable(key: string, workspaceId?: string): Promise<void>;
  disable(key: string, workspaceId?: string): Promise<void>;
  define(flag: FeatureFlagDefinition): Promise<void>;
  listFlags(): Promise<FeatureFlagDefinition[]>;
}
