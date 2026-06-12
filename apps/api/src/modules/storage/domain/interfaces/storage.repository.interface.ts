import type { FileEntity } from '../entities/file.entity.js';

export interface IStorageRepository {
  save(file: FileEntity): Promise<void>;
  findById(id: string): Promise<FileEntity | null>;
  findAll(
    workspaceId: string,
    options?: { mimeType?: string; bucket?: string; offset?: number; limit?: number }
  ): Promise<FileEntity[]>;
  count(workspaceId: string): Promise<number>;
  softDelete(id: string): Promise<void>;
  getTotalSize(workspaceId: string): Promise<number>;
}
