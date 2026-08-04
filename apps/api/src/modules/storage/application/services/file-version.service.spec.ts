import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { FileVersionEntity } from '../../domain/entities/file-version.entity.js';
import { FileVersionService } from './file-version.service.js';
import { AuditLogEntity } from '../../../rbac/domain/entities/audit-log.entity.js';

jest.mock('@xennic/database', () => ({ prisma: {} }));

describe('FileVersionService', () => {
  let service: FileVersionService;
  let fileVersionRepository: {
    save: jest.Mock;
    findById: jest.Mock;
    findByFileId: jest.Mock;
    findByFileIdAndVersion: jest.Mock;
    getLatestVersion: jest.Mock;
    getNextVersionNumber: jest.Mock;
    countByFileId: jest.Mock;
    delete: jest.Mock;
  };
  let storageRepository: {
    findById: jest.Mock;
  };
  let minioService: {
    uploadBuffer: jest.Mock;
    copyObject: jest.Mock;
    getObject: jest.Mock;
    getPresignedUrl: jest.Mock;
    deleteObject: jest.Mock;
  };
  let auditLogRepository: {
    save: jest.Mock;
  };

  const fileId = 'file-1';
  const workspaceId = 'workspace-1';
  const otherWorkspaceId = 'workspace-2';

  const file = {
    id: fileId,
    workspaceId,
    bucket: 'documents',
    isDeleted: () => false,
  };

  const version1 = FileVersionEntity.create({
    fileId,
    version: 1,
    path: '2026/07/version-1.pdf',
    size: 100,
    mimeType: 'application/pdf',
    originalName: 'document.pdf',
    checksum: 'checksum-1',
    createdBy: 'user-1',
  });

  const version2 = FileVersionEntity.create({
    fileId,
    version: 2,
    path: '2026/07/version-2.pdf',
    size: 200,
    mimeType: 'application/pdf',
    originalName: 'document.pdf',
    checksum: 'checksum-2',
    createdBy: 'user-1',
  });

  const version3 = FileVersionEntity.create({
    fileId,
    version: 3,
    path: '2026/07/version-3.pdf',
    size: 300,
    mimeType: 'application/pdf',
    originalName: 'document.pdf',
    checksum: 'checksum-3',
    createdBy: 'user-1',
  });

  const versionById = new Map<number, FileVersionEntity>([
    [1, version1],
    [2, version2],
    [3, version3],
  ]);

  beforeEach(() => {
    fileVersionRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByFileId: jest.fn().mockResolvedValue([version3, version2, version1]),
      findByFileIdAndVersion: jest
        .fn()
        .mockImplementation((_id: string, v: number) =>
          Promise.resolve(versionById.get(v) ?? null),
        ),
      getLatestVersion: jest.fn().mockResolvedValue(version3),
      getNextVersionNumber: jest.fn().mockResolvedValue(4),
      countByFileId: jest.fn().mockResolvedValue(3),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    storageRepository = {
      findById: jest.fn().mockResolvedValue(file),
    };

    minioService = {
      uploadBuffer: jest.fn().mockResolvedValue('object-key'),
      copyObject: jest.fn().mockResolvedValue('object-key'),
      getObject: jest.fn().mockResolvedValue(Buffer.from('pdf-content')),
      getPresignedUrl: jest.fn().mockResolvedValue('https://minio.test/url'),
      deleteObject: jest.fn().mockResolvedValue(undefined),
    };

    auditLogRepository = {
      save: jest.fn().mockResolvedValue(undefined),
    };

    service = new FileVersionService(
      fileVersionRepository as never,
      storageRepository as never,
      minioService as never,
      auditLogRepository as never,
    );
  });

  describe('createVersion', () => {
    it('uploads to MinIO then persists a new version', async () => {
      const buffer = Buffer.from('new-pdf-content');

      const result = await service.createVersion({
        fileId,
        workspaceId,
        buffer,
        originalName: 'document.pdf',
        mimeType: 'application/pdf',
        changeReason: 'Updated content',
        createdBy: 'user-1',
      });

      expect(result.version).toBe(4);
      expect(result.fileId).toBe(fileId);
      expect(result.changeReason).toBe('Updated content');
      expect(minioService.uploadBuffer).toHaveBeenCalledWith(
        'documents',
        `${workspaceId}/${result.path}`,
        buffer,
        'application/pdf',
        buffer.length,
      );
      expect(fileVersionRepository.save).toHaveBeenCalledWith(result);
    });

    it('rejects a missing file', async () => {
      storageRepository.findById.mockResolvedValue(null);

      await expect(
        service.createVersion({
          fileId,
          workspaceId,
          buffer: Buffer.from('x'),
          originalName: 'document.pdf',
          mimeType: 'application/pdf',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(minioService.uploadBuffer).not.toHaveBeenCalled();
    });

    it('rejects a file from another workspace', async () => {
      await expect(
        service.createVersion({
          fileId,
          workspaceId: otherWorkspaceId,
          buffer: Buffer.from('x'),
          originalName: 'document.pdf',
          mimeType: 'application/pdf',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects an oversized version', async () => {
      await expect(
        service.createVersion({
          fileId,
          workspaceId,
          buffer: Buffer.alloc(100 * 1024 * 1024 + 1),
          originalName: 'big.pdf',
          mimeType: 'application/pdf',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a disallowed MIME type', async () => {
      await expect(
        service.createVersion({
          fileId,
          workspaceId,
          buffer: Buffer.from('x'),
          originalName: 'evil.exe',
          mimeType: 'application/x-executable',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a too-long changeReason', async () => {
      await expect(
        service.createVersion({
          fileId,
          workspaceId,
          buffer: Buffer.from('x'),
          originalName: 'document.pdf',
          mimeType: 'application/pdf',
          changeReason: 'x'.repeat(501),
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rolls back the uploaded object when persistence fails', async () => {
      fileVersionRepository.save.mockRejectedValue(new Error('unique constraint violation'));

      await expect(
        service.createVersion({
          fileId,
          workspaceId,
          buffer: Buffer.from('x'),
          originalName: 'document.pdf',
          mimeType: 'application/pdf',
        }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(minioService.deleteObject).toHaveBeenCalledWith(
        'documents',
        expect.stringContaining(`${workspaceId}/`),
      );
    });

    it('does not write any version when MinIO upload fails', async () => {
      minioService.uploadBuffer.mockRejectedValue(new ServiceUnavailableException('boom'));

      await expect(
        service.createVersion({
          fileId,
          workspaceId,
          buffer: Buffer.from('x'),
          originalName: 'document.pdf',
          mimeType: 'application/pdf',
        }),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);

      expect(fileVersionRepository.save).not.toHaveBeenCalled();
      expect(fileVersionRepository.delete).not.toHaveBeenCalled();
    });

    it('writes an audit log entry on success', async () => {
      await service.createVersion({
        fileId,
        workspaceId,
        buffer: Buffer.from('x'),
        originalName: 'document.pdf',
        mimeType: 'application/pdf',
        createdBy: 'user-1',
      });

      const saved: AuditLogEntity = auditLogRepository.save.mock.calls[0][0];
      expect(saved).toBeInstanceOf(AuditLogEntity);
      expect(saved.action).toBe('file_version_created');
      expect(saved.entity).toBe('file_version');
      expect(saved.workspaceId).toBe(workspaceId);
    });
  });

  describe('listVersions', () => {
    it('returns paginated versions', async () => {
      const result = await service.listVersions(fileId, workspaceId, 1, 20);

      expect(result.data).toEqual([version3, version2, version1]);
      expect(result.meta).toEqual({
        page: 1,
        limit: 20,
        total: 3,
        totalPages: 1,
      });
      expect(fileVersionRepository.findByFileId).toHaveBeenCalledWith(fileId, {
        offset: 0,
        limit: 20,
      });
    });

    it('clamps invalid pagination values', async () => {
      const result = await service.listVersions(fileId, workspaceId, 0, 500);

      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(100);
    });

    it('rejects a deleted file', async () => {
      storageRepository.findById.mockResolvedValue({ ...file, isDeleted: () => true });

      await expect(service.listVersions(fileId, workspaceId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getVersion', () => {
    it('returns a version for the correct workspace', async () => {
      const result = await service.getVersion(fileId, 1, workspaceId);

      expect(result).toBe(version1);
    });

    it('rejects an invalid version number', async () => {
      await expect(service.getVersion(fileId, 0, workspaceId)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('returns not found when the version does not exist', async () => {
      fileVersionRepository.findByFileIdAndVersion.mockResolvedValue(null);

      await expect(service.getVersion(fileId, 99, workspaceId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getLatestVersion', () => {
    it('returns the latest version', async () => {
      const result = await service.getLatestVersion(fileId, workspaceId);

      expect(result).toBe(version3);
    });

    it('rejects a deleted file', async () => {
      storageRepository.findById.mockResolvedValue({ ...file, isDeleted: () => true });

      await expect(service.getLatestVersion(fileId, workspaceId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getVersionContent', () => {
    it('streams the version buffer from MinIO', async () => {
      const { buffer, version } = await service.getVersionContent(fileId, 2, workspaceId);

      expect(version).toBe(version2);
      expect(buffer.toString()).toBe('pdf-content');
      expect(minioService.getObject).toHaveBeenCalledWith(
        'documents',
        `${workspaceId}/${version2.path}`,
      );
    });

    it('rejects a deleted file', async () => {
      storageRepository.findById.mockResolvedValue({ ...file, isDeleted: () => true });

      await expect(service.getVersionContent(fileId, 1, workspaceId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getVersionDownloadUrl', () => {
    it('returns a presigned URL for the version', async () => {
      const { url, version } = await service.getVersionDownloadUrl(fileId, 1, workspaceId);

      expect(version).toBe(version1);
      expect(url).toBe('https://minio.test/url');
      expect(minioService.getPresignedUrl).toHaveBeenCalledWith(
        'documents',
        `${workspaceId}/${version1.path}`,
        3600,
      );
    });
  });

  describe('revertVersion', () => {
    it('creates a NEW object and a new version from the source', async () => {
      const result = await service.revertVersion(fileId, 1, workspaceId, 'user-1', 'Rollback');

      expect(result.version).toBe(4);
      expect(result.path).not.toBe(version1.path);
      expect(result.changeReason).toBe('Rollback');
      expect(minioService.copyObject).toHaveBeenCalledWith(
        'documents',
        `${workspaceId}/${version1.path}`,
        'documents',
        `${workspaceId}/${result.path}`,
      );
      expect(fileVersionRepository.save).toHaveBeenCalledWith(result);
    });

    it('rejects when the source version does not exist', async () => {
      fileVersionRepository.findByFileIdAndVersion.mockResolvedValue(null);

      await expect(service.revertVersion(fileId, 99, workspaceId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('rolls back the copied object when persistence fails', async () => {
      fileVersionRepository.save.mockRejectedValue(new Error('unique constraint violation'));

      await expect(service.revertVersion(fileId, 1, workspaceId)).rejects.toBeInstanceOf(
        ConflictException,
      );

      expect(minioService.deleteObject).toHaveBeenCalledWith(
        'documents',
        expect.not.stringContaining(version1.path),
      );
    });
  });

  describe('deleteVersion', () => {
    it('deletes an intermediate (non-initial, non-latest) version and its object', async () => {
      await service.deleteVersion(fileId, 2, workspaceId);

      expect(minioService.deleteObject).toHaveBeenCalledWith(
        'documents',
        `${workspaceId}/${version2.path}`,
      );
      expect(fileVersionRepository.delete).toHaveBeenCalledWith(version2.id);
    });

    it('rejects deleting the initial version', async () => {
      await expect(service.deleteVersion(fileId, 1, workspaceId)).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(fileVersionRepository.delete).not.toHaveBeenCalled();
      expect(minioService.deleteObject).not.toHaveBeenCalled();
    });

    it('rejects deleting the latest active version', async () => {
      await expect(service.deleteVersion(fileId, 3, workspaceId)).rejects.toBeInstanceOf(
        ConflictException,
      );

      expect(fileVersionRepository.delete).not.toHaveBeenCalled();
      expect(minioService.deleteObject).not.toHaveBeenCalled();
    });
  });
});
