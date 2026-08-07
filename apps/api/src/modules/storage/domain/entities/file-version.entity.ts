export class FileVersionEntity {
  private constructor(
    public readonly id: string,
    public readonly fileId: string,
    public readonly version: number,
    public readonly path: string,
    public readonly size: number,
    public readonly mimeType: string,
    public readonly originalName: string,
    public readonly checksum: string | null,
    public readonly changeReason: string | null,
    public readonly createdBy: string | null,
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    fileId: string;
    version: number;
    path: string;
    size: number;
    mimeType: string;
    originalName: string;
    checksum?: string | null;
    changeReason?: string | null;
    createdBy?: string | null;
  }): FileVersionEntity {
    if (!data.fileId) {
      throw new Error('File id is required');
    }

    if (!Number.isInteger(data.version) || data.version < 1) {
      throw new Error('Version must be a positive integer');
    }

    if (data.size < 0) {
      throw new Error('Version size cannot be negative');
    }

    if (!data.path) {
      throw new Error('Version path is required');
    }

    if (!data.mimeType) {
      throw new Error('Version MIME type is required');
    }

    if (!data.originalName) {
      throw new Error('Version original name is required');
    }

    return new FileVersionEntity(
      crypto.randomUUID(),
      data.fileId,
      data.version,
      data.path,
      data.size,
      data.mimeType,
      data.originalName,
      data.checksum ?? null,
      data.changeReason ?? null,
      data.createdBy ?? null,
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    fileId: string;
    version: number;
    path: string;
    size: number | bigint;
    mimeType: string;
    originalName: string;
    checksum: string | null;
    changeReason: string | null;
    createdBy: string | null;
    createdAt: Date;
  }): FileVersionEntity {
    return new FileVersionEntity(
      data.id,
      data.fileId,
      data.version,
      data.path,
      Number(data.size),
      data.mimeType,
      data.originalName,
      data.checksum,
      data.changeReason,
      data.createdBy,
      data.createdAt,
    );
  }

  get isInitialVersion(): boolean {
    return this.version === 1;
  }

  get sizeHuman(): string {
    if (this.size < 1024) return `${this.size} B`;
    if (this.size < 1024 * 1024) {
      return `${(this.size / 1024).toFixed(1)} KB`;
    }
    if (this.size < 1024 ** 3) {
      return `${(this.size / 1024 ** 2).toFixed(1)} MB`;
    }
    return `${(this.size / 1024 ** 3).toFixed(2)} GB`;
  }
}
