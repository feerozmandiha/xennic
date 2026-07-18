import { randomUUID } from 'crypto';

export type ProviderType =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'mistral'
  | 'groq'
  | 'openrouter'
  | 'together'
  | 'deepseek'
  | 'cohere'
  | 'voyageai'
  | 'ollama'
  | 'lm_studio'
  | 'azure_openai'
  | 'openai_compatible'
  | 'custom';

export type ProviderStatus = 'active' | 'inactive' | 'error';
export type ProviderVisibility = 'global' | 'admin_only' | 'workspace';

export class AIProviderEntity {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public displayName: string,
    public readonly providerType: ProviderType,
    public baseUrl: string | null,
    public orgId: string | null,
    public status: ProviderStatus,
    public enabled: boolean,
    public priority: number,
    public defaultWeight: number,
    public visibility: ProviderVisibility,
    public headers: Record<string, string>,
    public metadata: Record<string, unknown>,
    public readonly createdBy: string,
    public updatedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
  ) {}

  static create(
    name: string,
    displayName: string,
    providerType: ProviderType,
    createdBy: string,
    options?: {
      baseUrl?: string;
      orgId?: string;
      priority?: number;
      defaultWeight?: number;
      visibility?: ProviderVisibility;
      headers?: Record<string, string>;
      metadata?: Record<string, unknown>;
    },
  ): AIProviderEntity {
    const now = new Date();
    return new AIProviderEntity(
      randomUUID(),
      name,
      displayName,
      providerType,
      options?.baseUrl ?? null,
      options?.orgId ?? null,
      'active',
      true,
      options?.priority ?? 0,
      options?.defaultWeight ?? 1.0,
      options?.visibility ?? 'global',
      options?.headers ?? {},
      options?.metadata ?? {},
      createdBy,
      null,
      now,
      now,
      null,
    );
  }

  static reconstitute(data: {
    id: string;
    name: string;
    display_name: string;
    provider_type: string;
    base_url: string | null;
    org_id: string | null;
    status: string;
    enabled: boolean;
    priority: number;
    default_weight: number;
    visibility: string;
    headers: Record<string, string>;
    metadata: Record<string, unknown>;
    created_by: string;
    updated_by: string | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
  }): AIProviderEntity {
    return new AIProviderEntity(
      data.id,
      data.name,
      data.display_name,
      data.provider_type as ProviderType,
      data.base_url,
      data.org_id,
      data.status as ProviderStatus,
      data.enabled,
      data.priority,
      data.default_weight,
      data.visibility as ProviderVisibility,
      data.headers,
      data.metadata,
      data.created_by,
      data.updated_by,
      data.created_at,
      data.updated_at,
      data.deleted_at,
    );
  }

  update(
    updates: Partial<{
      displayName: string;
      baseUrl: string | null;
      orgId: string | null;
      priority: number;
      defaultWeight: number;
      visibility: ProviderVisibility;
      headers: Record<string, string>;
      metadata: Record<string, unknown>;
      updatedBy: string;
    }>,
  ): void {
    if (updates.displayName !== undefined) this.displayName = updates.displayName;
    if (updates.baseUrl !== undefined) this.baseUrl = updates.baseUrl;
    if (updates.orgId !== undefined) this.orgId = updates.orgId;
    if (updates.priority !== undefined) this.priority = updates.priority;
    if (updates.defaultWeight !== undefined) this.defaultWeight = updates.defaultWeight;
    if (updates.visibility !== undefined) this.visibility = updates.visibility;
    if (updates.headers !== undefined) this.headers = updates.headers;
    if (updates.metadata !== undefined) this.metadata = updates.metadata;
    this.updatedBy = updates.updatedBy ?? null;
    this.updatedAt = new Date();
  }

  enable(updatedBy: string): void {
    this.enabled = true;
    this.updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  disable(updatedBy: string): void {
    this.enabled = false;
    this.updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  setStatus(status: ProviderStatus, updatedBy: string): void {
    this.status = status;
    this.updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  softDelete(deletedBy: string): void {
    this.deletedAt = new Date();
    this.updatedBy = deletedBy;
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
