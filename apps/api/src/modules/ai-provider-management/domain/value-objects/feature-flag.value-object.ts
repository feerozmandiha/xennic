export type FeatureFlagType =
  | 'vision'
  | 'embedding'
  | 'reasoning'
  | 'audio'
  | 'ocr'
  | 'image_generation'
  | 'translation'
  | 'tools'
  | 'json_mode';

export class FeatureFlag {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string | null,
    public readonly providerId: string | null,
    public readonly modelId: string | null,
    public readonly feature: FeatureFlagType,
    public readonly enabled: boolean,
    public readonly createdBy: string,
    public readonly createdAt: Date,
  ) {}

  static reconstitute(data: {
    id: string;
    workspace_id: string | null;
    provider_id: string | null;
    model_id: string | null;
    feature: string;
    enabled: boolean;
    created_by: string;
    created_at: Date;
  }): FeatureFlag {
    return new FeatureFlag(
      data.id,
      data.workspace_id,
      data.provider_id,
      data.model_id,
      data.feature as FeatureFlagType,
      data.enabled,
      data.created_by,
      data.created_at,
    );
  }

  matches(workspaceId?: string, providerId?: string, modelId?: string): boolean {
    if (this.workspaceId && this.workspaceId !== workspaceId) return false;
    if (this.providerId && this.providerId !== providerId) return false;
    if (this.modelId && this.modelId !== modelId) return false;
    return true;
  }
}
