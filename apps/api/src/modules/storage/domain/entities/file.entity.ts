export type FileBucket = 'public' | 'private' | 'reports' | 'documents' | 'engineering' | 'ai';

export class FileEntity {
  private constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly bucket: FileBucket,
    public readonly path: string,
    public readonly filename: string,
    public readonly originalName: string,
    public readonly extension: string,
    public readonly mimeType: string,
    public readonly size: number,
    public readonly checksum: string | null,
    public readonly uploadedBy: string,
    public readonly createdAt: Date,
    public deletedAt: Date | null,
  ) {}

  static create(data: {
    workspaceId: string;
    bucket: FileBucket;
    path: string;
    filename: string;
    originalName: string;
    extension: string;
    mimeType: string;
    size: number;
    checksum?: string;
    uploadedBy: string;
  }): FileEntity {
    return new FileEntity(
      crypto.randomUUID(),
      data.workspaceId,
      data.bucket,
      data.path,
      data.filename,
      data.originalName,
      data.extension,
      data.mimeType,
      data.size,
      data.checksum ?? null,
      data.uploadedBy,
      new Date(),
      null,
    );
  }

  static reconstitute(data: {
    id: string;
    workspaceId: string;
    bucket: string;
    path: string;
    filename: string;
    originalName: string;
    extension: string;
    mimeType: string;
    size: number;
    checksum: string | null;
    uploadedBy: string;
    createdAt: Date;
    deletedAt: Date | null;
  }): FileEntity {
    return new FileEntity(
      data.id, data.workspaceId,
      data.bucket as FileBucket,
      data.path, data.filename, data.originalName,
      data.extension, data.mimeType, data.size,
      data.checksum, data.uploadedBy,
      data.createdAt, data.deletedAt,
    );
  }

  softDelete(): void {
    this.deletedAt = new Date();
  }

  isDeleted(): boolean { return this.deletedAt !== null; }

  isImage(): boolean {
    return this.mimeType.startsWith('image/');
  }

  isPdf(): boolean {
    return this.mimeType === 'application/pdf';
  }

  /** URL-safe path در MinIO */
  get objectKey(): string {
    return `${this.workspaceId}/${this.path}`;
  }

  get sizeHuman(): string {
    if (this.size < 1024) return `${this.size} B`;
    if (this.size < 1024 * 1024) return `${(this.size / 1024).toFixed(1)} KB`;
    return `${(this.size / (1024 * 1024)).toFixed(1)} MB`;
  }
}
