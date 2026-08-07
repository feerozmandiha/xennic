import type { FileVersionEntity } from '../entities/file-version.entity.js';

export interface IFileVersionRepository {
  save(version: FileVersionEntity): Promise<void>;

  findById(id: string): Promise<FileVersionEntity | null>;

  findByFileId(
    fileId: string,
    options?: { offset?: number; limit?: number },
  ): Promise<FileVersionEntity[]>;

  findByFileIdAndVersion(fileId: string, version: number): Promise<FileVersionEntity | null>;

  getLatestVersion(fileId: string): Promise<FileVersionEntity | null>;

  getNextVersionNumber(fileId: string): Promise<number>;

  countByFileId(fileId: string): Promise<number>;

  delete(id: string): Promise<void>;
}
