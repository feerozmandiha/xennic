import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as path from 'path';
import { MinioService } from '../../infrastructure/minio/minio.service.js';
import type { IStorageRepository } from '../../domain/interfaces/storage.repository.interface.js';
import { FileEntity, type FileBucket } from '../../domain/entities/file.entity.js';

// ── Config ────────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

const ALLOWED_MIME_TYPES = new Set([
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  // Text / Data
  'text/plain', 'text/csv', 'application/json',
  // Engineering
  'application/octet-stream', 'application/zip',
  'application/x-dwg', 'application/x-dxf',
]);

@Injectable()
export class StorageService {
  constructor(
    private readonly minioService: MinioService,
    @Inject('IStorageRepository')
    private readonly storageRepository: IStorageRepository,
  ) {}

  // ── Upload ────────────────────────────────────────────────────────────────

  async upload(data: {
    workspaceId: string;
    uploadedBy: string;
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    bucket?: FileBucket;
  }): Promise<FileEntity> {
    // validation
    if (data.buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB`
      );
    }
    if (!ALLOWED_MIME_TYPES.has(data.mimeType)) {
      throw new BadRequestException(`File type "${data.mimeType}" is not allowed`);
    }

    const ext        = path.extname(data.originalName).toLowerCase().slice(1);
    const filename   = `${crypto.randomUUID()}.${ext || 'bin'}`;
    const bucket     = data.bucket ?? this._detectBucket(data.mimeType);
    const objectPath = `${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${filename}`;
    const checksum   = crypto.createHash('sha256').update(data.buffer).digest('hex');

    // upload به MinIO
    await this.minioService.uploadBuffer(
      bucket,
      `${data.workspaceId}/${objectPath}`,
      data.buffer,
      data.mimeType,
      data.buffer.length,
    );

    // ذخیره metadata در DB
    const file = FileEntity.create({
      workspaceId:  data.workspaceId,
      bucket,
      path:         objectPath,
      filename,
      originalName: data.originalName,
      extension:    ext,
      mimeType:     data.mimeType,
      size:         data.buffer.length,
      checksum,
      uploadedBy:   data.uploadedBy,
    });

    await this.storageRepository.save(file);
    return file;
  }

  // ── Download / URL ────────────────────────────────────────────────────────

  async getDownloadUrl(
    id: string,
    workspaceId: string,
    expirySeconds = 3600,
  ): Promise<{ url: string; file: FileEntity }> {
    const file = await this._getFile(id, workspaceId);
    const url  = await this.minioService.getPresignedUrl(
      file.bucket,
      file.objectKey,
      expirySeconds,
    );
    return { url, file };
  }

  async download(id: string, workspaceId: string): Promise<{ buffer: Buffer; file: FileEntity }> {
    const file   = await this._getFile(id, workspaceId);
    const buffer = await this.minioService.getObject(file.bucket, file.objectKey);
    return { buffer, file };
  }

  // ── List ──────────────────────────────────────────────────────────────────

  async findAll(
    workspaceId: string,
    page = 1,
    limit = 20,
    bucket?: string,
  ): Promise<{ data: FileEntity[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.storageRepository.findAll(workspaceId, { bucket, offset, limit }),
      this.storageRepository.count(workspaceId),
    ]);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, workspaceId: string): Promise<FileEntity> {
    return this._getFile(id, workspaceId);
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async delete(id: string, workspaceId: string): Promise<void> {
    const file = await this._getFile(id, workspaceId);
    await this.storageRepository.softDelete(file.id);
    // فایل در MinIO نگه داشته می‌شود (soft delete) — cleanup جداگانه
  }

  async hardDelete(id: string, workspaceId: string): Promise<void> {
    const file = await this._getFile(id, workspaceId);
    await this.minioService.deleteObject(file.bucket, file.objectKey);
    await this.storageRepository.softDelete(file.id);
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  async getStorageStats(workspaceId: string): Promise<{
    totalFiles: number;
    totalSizeBytes: number;
    totalSizeHuman: string;
  }> {
    const [total, sizeBytes] = await Promise.all([
      this.storageRepository.count(workspaceId),
      this.storageRepository.getTotalSize(workspaceId),
    ]);

    return {
      totalFiles:      total,
      totalSizeBytes:  sizeBytes,
      totalSizeHuman:  this._formatBytes(sizeBytes),
    };
  }

  // ── Health ────────────────────────────────────────────────────────────────

  async health() {
    return this.minioService.health();
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private async _getFile(id: string, workspaceId: string): Promise<FileEntity> {
    const file = await this.storageRepository.findById(id);
    if (!file || file.isDeleted()) {
      throw new NotFoundException(`File "${id}" not found`);
    }
    if (file.workspaceId !== workspaceId) {
      throw new ForbiddenException('Access denied to this file');
    }
    return file;
  }

  private _detectBucket(mimeType: string): FileBucket {
    if (mimeType === 'application/pdf')              return 'documents';
    if (mimeType.startsWith('image/'))               return 'public';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'reports';
    if (mimeType.includes('word'))                   return 'documents';
    return 'private';
  }

  private _formatBytes(bytes: number): string {
    if (bytes < 1024)             return `${bytes} B`;
    if (bytes < 1024 * 1024)      return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 ** 3)        return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  }
}
