import type { SourceType, EkoStatus } from './constants.js';

export class EkosEntity {
  constructor(
    public readonly id: string,
    public readonly documentId: string,
    public readonly workspaceId: string,
    public sourceType: SourceType,
    public content: string,
    public metadata: Record<string, unknown>,
    public checksum: string,
    public status: EkoStatus,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static reconstitute(data: {
    id: string;
    documentId: string;
    workspaceId: string;
    sourceType: SourceType;
    content: string;
    metadata: Record<string, unknown>;
    checksum: string;
    status: EkoStatus;
    createdAt: Date;
    updatedAt: Date;
  }): EkosEntity {
    return new EkosEntity(
      data.id,
      data.documentId,
      data.workspaceId,
      data.sourceType,
      data.content,
      data.metadata,
      data.checksum,
      data.status,
      data.createdAt,
      data.updatedAt,
    );
  }

  updateStatus(status: EkoStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }
}
