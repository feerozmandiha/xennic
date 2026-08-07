import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as path from 'path';
import { FileVersionEntity } from '../../domain/entities/file-version.entity.js';
import type { IFileVersionRepository } from '../../domain/interfaces/file-version.repository.interface.js';
import type { IStorageRepository } from '../../domain/interfaces/storage.repository.interface.js';
import { FileEntity } from '../../domain/entities/file.entity.js';
import { MinioService } from '../../infrastructure/minio/minio.service.js';
import { AuditLogEntity } from '../../../rbac/domain/entities/audit-log.entity.js';
import { AuditLogRepository } from '../../../rbac/infrastructure/repositories/audit-log.repository.js';

// ── Config ────────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
const MAX_CHANGE_REASON_LENGTH = 500;

const ALLOWED_MIME_TYPES = new Set([
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Text / Data
  'text/plain',
  'text/csv',
  'application/json',
  // Engineering
  'application/octet-stream',
  'application/zip',
  'application/x-dwg',
  'application/x-dxf',
]);

@Injectable()
export class FileVersionService {
  constructor(
    @Inject('IFileVersionRepository')
    private readonly fileVersionRepository: IFileVersionRepository,
    @Inject('IStorageRepository')
    private readonly storageRepository: IStorageRepository,
    private readonly minioService: MinioService,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  // ── Create ─────────────────────────────────────────────────────────────────
  //
  // G1 (Order 047): بارگذاری object در MinIO در داخل Service انجام می‌شود
  // (Storage Orchestration). Controller فقط multipart را parse می‌کند و buffer را
  // تحویل می‌دهد. ترتیب عملیات:
  //   1. اعتبارسنجی + ساخت object key جدید
  //   2. upload به MinIO (اگر شکست بخورد — هیچ رکورد Version ساخته نمی‌شود)
  //   3. ذخیره metadata در DB (اگر شکست بخورد — object بارگذاری‌شده rollback می‌شود)

  async createVersion(data: {
    fileId: string;
    workspaceId: string;
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    changeReason?: string | null;
    createdBy?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): Promise<FileVersionEntity> {
    const file = await this.getAuthorizedFile(data.fileId, data.workspaceId);

    this.validateChangeReason(data.changeReason);

    if (data.buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `Version too large. Maximum size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB`,
      );
    }

    if (!ALLOWED_MIME_TYPES.has(data.mimeType)) {
      throw new BadRequestException(`File type "${data.mimeType}" is not allowed`);
    }

    const originalName = this.sanitizeOriginalName(data.originalName);
    const objectPath = this.buildObjectPath(originalName);
    const checksum = crypto.createHash('sha256').update(data.buffer).digest('hex');

    const versionNumber = await this.fileVersionRepository.getNextVersionNumber(file.id);

    const version = FileVersionEntity.create({
      fileId: file.id,
      version: versionNumber,
      path: objectPath,
      size: data.buffer.length,
      mimeType: data.mimeType,
      originalName,
      checksum,
      changeReason: data.changeReason ?? null,
      createdBy: data.createdBy ?? null,
    });

    // 2. upload به MinIO — خطای MinIO باید propagate شود؛ هیچ رکوردی ساخته نمی‌شود
    await this.minioService.uploadBuffer(
      file.bucket,
      this.objectKey(file, version.path),
      data.buffer,
      data.mimeType,
      data.buffer.length,
    );

    try {
      // 3. ذخیره metadata
      await this.fileVersionRepository.save(version);
    } catch (error) {
      // rollback — حذف object بارگذاری‌شده
      await this.minioService.deleteObject(file.bucket, this.objectKey(file, version.path));

      const message = error instanceof Error ? error.message : String(error);
      if (message.toLowerCase().includes('unique')) {
        throw new ConflictException('File version already exists');
      }
      throw error;
    }

    await this.audit({
      workspaceId: file.workspaceId,
      action: 'file_version_created',
      entityId: version.id,
      userId: data.createdBy,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      newValues: {
        fileId: version.fileId,
        version: version.version,
        size: version.size,
        mimeType: version.mimeType,
        originalName: version.originalName,
      },
    });

    return version;
  }

  // ── List ───────────────────────────────────────────────────────────────────

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

  // ── Get ────────────────────────────────────────────────────────────────────

  async getVersion(
    fileId: string,
    version: number,
    workspaceId: string,
  ): Promise<FileVersionEntity> {
    const { version: found } = await this.getVersionWithFile(fileId, version, workspaceId);
    return found;
  }

  async getLatestVersion(fileId: string, workspaceId: string): Promise<FileVersionEntity | null> {
    await this.getAuthorizedFile(fileId, workspaceId);
    return this.fileVersionRepository.getLatestVersion(fileId);
  }

  // ── Download / URL ─────────────────────────────────────────────────────────

  async getVersionContent(
    fileId: string,
    version: number,
    workspaceId: string,
  ): Promise<{ buffer: Buffer; version: FileVersionEntity }> {
    const { version: found, file } = await this.getVersionWithFile(fileId, version, workspaceId);
    const buffer = await this.minioService.getObject(file.bucket, this.objectKey(file, found.path));
    return { buffer, version: found };
  }

  async getVersionDownloadUrl(
    fileId: string,
    version: number,
    workspaceId: string,
    expirySeconds = 3600,
  ): Promise<{ url: string; version: FileVersionEntity }> {
    const { version: found, file } = await this.getVersionWithFile(fileId, version, workspaceId);
    const url = await this.minioService.getPresignedUrl(
      file.bucket,
      this.objectKey(file, found.path),
      expirySeconds,
    );
    return { url, version: found };
  }

  // ── Revert ─────────────────────────────────────────────────────────────────
  //
  // G2 (Order 047): revert یک object مستقل و جدید در MinIO می‌سازد (server-side copy)
  // و از استفاده مجدد از object path نسخه قبلی جلوگیری می‌کند.

  async revertVersion(
    fileId: string,
    version: number,
    workspaceId: string,
    createdBy?: string | null,
    changeReason = 'Reverted from previous version',
    ipAddress?: string | null,
    userAgent?: string | null,
  ): Promise<FileVersionEntity> {
    const { version: source, file } = await this.getVersionWithFile(fileId, version, workspaceId);

    this.validateChangeReason(changeReason);

    const versionNumber = await this.fileVersionRepository.getNextVersionNumber(file.id);

    const reverted = FileVersionEntity.create({
      fileId: file.id,
      version: versionNumber,
      path: this.buildObjectPath(source.originalName),
      size: source.size,
      mimeType: source.mimeType,
      originalName: source.originalName,
      checksum: source.checksum,
      changeReason,
      createdBy: createdBy ?? null,
    });

    // copy سرور-ساید به object مستقل جدید
    await this.minioService.copyObject(
      file.bucket,
      this.objectKey(file, source.path),
      file.bucket,
      this.objectKey(file, reverted.path),
    );

    try {
      await this.fileVersionRepository.save(reverted);
    } catch (error) {
      await this.minioService.deleteObject(file.bucket, this.objectKey(file, reverted.path));

      const message = error instanceof Error ? error.message : String(error);
      if (message.toLowerCase().includes('unique')) {
        throw new ConflictException('File version already exists');
      }
      throw error;
    }

    await this.audit({
      workspaceId: file.workspaceId,
      action: 'file_version_reverted',
      entityId: reverted.id,
      userId: createdBy,
      ipAddress,
      userAgent,
      oldValues: {
        sourceVersion: source.version,
        sourcePath: source.path,
      },
      newValues: {
        fileId: reverted.fileId,
        version: reverted.version,
        path: reverted.path,
        changeReason,
      },
    });

    return reverted;
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  //
  // G3/G5 (Order 047): حذف Version هم رکورد DB را حذف می‌کند هم object مستقل آن
  // را از MinIO. سیاست حذف:
  //   - Version اولیه (v1) حذف نمی‌شود → BadRequestException
  //   - آخرین Version فعال (max) حذف نمی‌شود → ConflictException

  async deleteVersion(
    fileId: string,
    version: number,
    workspaceId: string,
    ipAddress?: string | null,
    userAgent?: string | null,
  ): Promise<void> {
    const { version: target, file } = await this.getVersionWithFile(fileId, version, workspaceId);

    if (target.isInitialVersion) {
      throw new BadRequestException('The initial file version cannot be deleted');
    }

    const latest = await this.fileVersionRepository.getLatestVersion(file.id);
    if (latest && latest.version === target.version) {
      throw new ConflictException('The latest active version cannot be deleted');
    }

    await this.minioService.deleteObject(file.bucket, this.objectKey(file, target.path));
    await this.fileVersionRepository.delete(target.id);

    await this.audit({
      workspaceId: file.workspaceId,
      action: 'file_version_deleted',
      entityId: target.id,
      userId: null,
      ipAddress,
      userAgent,
      oldValues: {
        fileId: target.fileId,
        version: target.version,
        path: target.path,
        size: target.size,
      },
    });
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async getAuthorizedFile(fileId: string, workspaceId: string): Promise<FileEntity> {
    const file = await this.storageRepository.findById(fileId);

    if (!file || file.isDeleted()) {
      throw new NotFoundException(`File "${fileId}" not found`);
    }

    if (file.workspaceId !== workspaceId) {
      throw new ForbiddenException('Access denied to this file');
    }

    return file;
  }

  private async getVersionWithFile(
    fileId: string,
    version: number,
    workspaceId: string,
  ): Promise<{ version: FileVersionEntity; file: FileEntity }> {
    const file = await this.getAuthorizedFile(fileId, workspaceId);

    if (!Number.isInteger(version) || version < 1) {
      throw new BadRequestException('Version must be a positive integer');
    }

    const found = await this.fileVersionRepository.findByFileIdAndVersion(file.id, version);

    if (!found) {
      throw new NotFoundException(`Version "${version}" for file "${fileId}" not found`);
    }

    return { version: found, file };
  }

  /** کلید object در MinIO — مطابق قرارداد FileEntity.objectKey */
  private objectKey(file: FileEntity, versionPath: string): string {
    return `${file.workspaceId}/${versionPath}`;
  }

  /** پاک‌سازی نام فایل ورودی — جلوگیری از path traversal و نویسه‌های مخرب */
  private sanitizeOriginalName(name: string): string {
    const clean = String(name ?? '')
      .replace(/[/\\\0\r\n]/g, '')
      .trim();

    return clean || 'file';
  }

  private buildObjectPath(originalName: string): string {
    const ext =
      path
        .extname(originalName)
        .toLowerCase()
        .slice(1)
        .replace(/[^a-z0-9]/g, '') || 'bin';
    const filename = `${crypto.randomUUID()}.${ext}`;
    const now = new Date();
    return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${filename}`;
  }

  private validateChangeReason(changeReason: string | null | undefined): void {
    if (changeReason == null) return;

    if (typeof changeReason !== 'string' || changeReason.length > MAX_CHANGE_REASON_LENGTH) {
      throw new BadRequestException(
        `Change reason must be a string with at most ${MAX_CHANGE_REASON_LENGTH} characters`,
      );
    }
  }

  private async audit(data: {
    workspaceId: string;
    action: string;
    entityId: string;
    userId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
  }): Promise<void> {
    await this.auditLogRepository.save(
      AuditLogEntity.create({
        workspaceId: data.workspaceId,
        userId: data.userId ?? undefined,
        ipAddress: data.ipAddress ?? undefined,
        userAgent: data.userAgent ?? undefined,
        action: data.action,
        entity: 'file_version',
        entityId: data.entityId,
        oldValues: data.oldValues,
        newValues: data.newValues,
      }),
    );
  }
}
