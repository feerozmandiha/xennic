import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { FileVersionEntity } from '../../domain/entities/file-version.entity.js';
import { FileVersionService } from './file-version.service.js';

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

  const fileId = 'file-1';
  const workspaceId = 'workspace-1';
  const otherWorkspaceId = 'workspace-2';

  const file = {
    id: fileId,
    workspaceId,
    isDeleted: () => false,
  };

  const version = FileVersionEntity.create({
    fileId,
    version: 1,
    path: '2026/07/version-1.pdf',
    size: 100,
    mimeType: 'application/pdf',
    originalName: 'document.pdf',
    checksum: 'checksum-1',
    createdBy: 'user-1',
  });

  beforeEach(() => {
    fileVersionRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByFileId: jest.fn().mockResolvedValue([version]),
      findByFileIdAndVersion: jest.fn().mockResolvedValue(version),
      getLatestVersion: jest.fn().mockResolvedValue(version),
      getNextVersionNumber: jest.fn().mockResolvedValue(2),
      countByFileId: jest.fn().mockResolvedValue(2),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    storageRepository = {
      findById: jest.fn().mockResolvedValue(file),
    };

    service = new FileVersionService(fileVersionRepository as never, storageRepository as never);
  });

  describe('createVersion', () => {
    it('creates and persists a new version', async () => {
      const result = await service.createVersion({
        fileId,
        workspaceId,
        path: '2026/07/version-2.pdf',
        size: 200,
        mimeType: 'application/pdf',
        originalName: 'document.pdf',
        checksum: 'checksum-2',
        createdBy: 'user-1',
      });

      expect(result.version).toBe(2);
      expect(result.fileId).toBe(fileId);
      expect(fileVersionRepository.save).toHaveBeenCalledWith(result);
    });

    it('rejects a missing file', async () => {
      storageRepository.findById.mockResolvedValue(null);

      await expect(
        service.createVersion({
          fileId,
          workspaceId,
          path: 'version.pdf',
          size: 100,
          mimeType: 'application/pdf',
          originalName: 'document.pdf',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects a file from another workspace', async () => {
      await expect(
        service.createVersion({
          fileId,
          workspaceId: otherWorkspaceId,
          path: 'version.pdf',
          size: 100,
          mimeType: 'application/pdf',
          originalName: 'document.pdf',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects a negative size', async () => {
      await expect(
        service.createVersion({
          fileId,
          workspaceId,
          path: 'version.pdf',
          size: -1,
          mimeType: 'application/pdf',
          originalName: 'document.pdf',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('converts a unique constraint error to ConflictException', async () => {
      fileVersionRepository.save.mockRejectedValue(new Error('unique constraint violation'));

      await expect(
        service.createVersion({
          fileId,
          workspaceId,
          path: 'version.pdf',
          size: 100,
          mimeType: 'application/pdf',
          originalName: 'document.pdf',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('listVersions', () => {
    it('returns paginated versions', async () => {
      const result = await service.listVersions(fileId, workspaceId, 1, 20);

      expect(result.data).toEqual([version]);
      expect(result.meta).toEqual({
        page: 1,
        limit: 20,
        total: 2,
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
  });

  describe('getVersion', () => {
    it('returns a version for the correct workspace', async () => {
      const result = await service.getVersion(fileId, 1, workspaceId);

      expect(result).toBe(version);
    });

    it('rejects an invalid version number', async () => {
      await expect(service.getVersion(fileId, 0, workspaceId)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('returns not found when the version does not exist', async () => {
      fileVersionRepository.findByFileIdAndVersion.mockResolvedValue(null);

      await expect(service.getVersion(fileId, 1, workspaceId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('revertVersion', () => {
    it('creates a new version from the source version', async () => {
      const result = await service.revertVersion(fileId, 1, workspaceId, 'user-1');

      expect(result.version).toBe(2);
      expect(result.path).toBe(version.path);
      expect(result.changeReason).toBe('Reverted from previous version');
      expect(fileVersionRepository.save).toHaveBeenCalled();
    });
  });

  describe('deleteVersion', () => {
    it('deletes a non-initial version', async () => {
      await service.deleteVersion(fileId, 2, workspaceId);

      expect(fileVersionRepository.delete).toHaveBeenCalledWith(version.id);
    });

    it('does not delete the only version', async () => {
      fileVersionRepository.countByFileId.mockResolvedValue(1);

      await expect(service.deleteVersion(fileId, 1, workspaceId)).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(fileVersionRepository.delete).not.toHaveBeenCalled();
    });
  });
});
