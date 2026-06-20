export type FeatureFlagScope = 'global' | 'plan' | 'workspace';

export class FeatureFlagEntity {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    private _enabled: boolean,
    public readonly planId: string | null,
    public readonly workspaceId: string | null,
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    name: string;
    description?: string;
    enabled?: boolean;
    planId?: string;
    workspaceId?: string;
  }): FeatureFlagEntity {
    return new FeatureFlagEntity(
      crypto.randomUUID(),
      data.name,
      data.description ?? null,
      data.enabled ?? false,
      data.planId ?? null,
      data.workspaceId ?? null,
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    name: string;
    description: string | null;
    enabled: boolean;
    planId: string | null;
    workspaceId: string | null;
    createdAt: Date;
  }): FeatureFlagEntity {
    return new FeatureFlagEntity(
      data.id, data.name, data.description,
      data.enabled, data.planId, data.workspaceId,
      data.createdAt,
    );
  }

  get enabled(): boolean { return this._enabled; }

  enable(): void { this._enabled = true; }
  disable(): void { this._enabled = false; }
  setDescription(desc: string): void { Object.assign(this, { description: desc }); }

  get scope(): FeatureFlagScope {
    if (this.workspaceId) return 'workspace';
    if (this.planId) return 'plan';
    return 'global';
  }
}
