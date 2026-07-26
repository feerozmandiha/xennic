import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FileVersionEntity } from '../../domain/entities/file-version.entity.js';
import type { IFileVersionRepository } from '../../domain/interfaces/file-version.repository.interface.js';
import type { IStorageRepository } from '../../domain/interfaces/storage.repository.interface.js';

@Injectable()
export class FileVersionService {
  constructor(
    @Inject('IFileVersionRepository')
    private readonly fileVersionRepository: IFileVersionRepository,
    @Inject('IStorageRepository')
    private readonly storageRepository: IStorageRepository,
  ) {}

  async createVersion(data: {
    fileId: string;
    workspaceId: string;
    path: string;
    size: number;
    mimeType: string;
    originalName: string;
    checksum?: string | null;
    changeReason?: string | null;
    createdBy?: string | null;
  }): Promise<FileVersionEntity> {
    const file = await this.storageRepository.findById(data.fileId);

    if (!file || file.isDeleted()) {
      throw new NotFoundException(`File "${data.fileId}" not found`);
    }

    if (file.workspaceId !== data.workspaceId) {
      throw new ForbiddenException('Access denied to this file');
    }

    if (data.size < 0) {
      throw new BadRequestException('Version size cannot be negative');
    }

    const versionNumber = await this.fileVersionRepository.getNextVersionNumber(data.fileId);

    const version = FileVersionEntity.create({
      fileId: data.fileId,
      version: versionNumber,
      path: data.path,
      size: data.size,
      mimeType: data.mimeType,
      originalName: data.originalName,
      checksum: data.checksum,
      changeReason: data.changeReason,
      createdBy: data.createdBy,
    });

    try {
      await this.fileVersionRepository.save(version);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (message.toLowerCase().includes('unique')) {
        throw new ConflictException('File version already exists');
      }

      throw error;
    }

    return version;
  }

  async listVersions(
    fileId: string,
    workspaceId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: FileVersionEntity[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const file = await this.getAuthorizedFile(fileId, workspaceId);

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const offset = (safePage - 1) * safeLimit;

    const [data, total] = await Promise.all([
      this.fileVersionRepository.findByFileId(file.id, {
        offset,
        limit: safeLimit,
      }),
      this.fileVersionRepository.countByFileId(file.id),
    ]);

    return {
      data,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async getVersion(
    fileId: string,
    version: number,
    workspaceId: string,
  ): Promise<FileVersionEntity> {
    await this.getAuthorizedFile(fileId, workspaceId);

    if (!Number.isInteger(version) || version < 1) {
      throw new BadRequestException('Version must be a positive integer');
    }

    const result = await this.fileVersionRepository.findByFileIdAndVersion(fileId, version);

    if (!result) {
      throw new NotFoundException(`Version "${version}" for file "${fileId}" not found`);
    }

    return result;
  }

  async revertVersion(
    fileId: string,
    version: number,
    workspaceId: string,
    createdBy?: string | null,
    changeReason = 'Reverted from previous version',
  ): Promise<FileVersionEntity> {
    const source = await this.getVersion(fileId, version, workspaceId);

    return this.createVersion({
      fileId,
      workspaceId,
      path: source.path,
      size: source.size,
      mimeType: source.mimeType,
      originalName: source.originalName,
      checksum: source.checksum,
      changeReason,
      createdBy,
    });
  }

  async deleteVersion(fileId: string, version: number, workspaceId: string): Promise<void> {
    const target = await this.getVersion(fileId, version, workspaceId);
    const total = await this.fileVersionRepository.countByFileId(fileId);

    if (total <= 1) {
      throw new BadRequestException('The initial file version cannot be deleted');
    }

    await this.fileVersionRepository.delete(target.id);
  }

  private async getAuthorizedFile(fileId: string, workspaceId: string) {
    const file = await this.storageRepository.findById(fileId);

    if (!file || file.isDeleted()) {
      throw new NotFoundException(`File "${fileId}" not found`);
    }

    if (file.workspaceId !== workspaceId) {
      throw new ForbiddenException('Access denied to this file');
    }

    return file;
  }
}
