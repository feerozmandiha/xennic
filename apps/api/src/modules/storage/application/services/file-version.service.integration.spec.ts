process.env.MINIO_ENDPOINT ??= 'localhost:9000';
process.env.MINIO_ACCESS_KEY ??= 'xennic-test-access';
process.env.MINIO_SECRET_KEY ??= 'xennic-test-secret-1234';

jest.mock('@xennic/database', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require('@prisma/client');
  return { prisma: new PrismaClient() };
});

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@xennic/database';
import { FileVersionRepository } from '../../infrastructure/repositories/file-version.repository.js';
import { FileVersionService } from './file-version.service.js';
import { FileEntity } from '../../domain/entities/file.entity.js';
import { MinioService } from '../../infrastructure/minio/minio.service.js';
import { AuditLogRepository } from '../../../rbac/infrastructure/repositories/audit-log.repository.js';

describe('FileVersionService (integration)', () => {
  const fileVersionRepo = new FileVersionRepository();
  const minioService = new MinioService();
  const auditLogRepo = new AuditLogRepository();
  const service = new FileVersionService(fileVersionRepo, {} as any, minioService, auditLogRepo);

  const testWorkspaceCode = `test-ws-svc-${crypto.randomUUID().slice(0, 8)}`;
  const testWorkspaceId = `test-ws-svc-${crypto.randomUUID()}`;
  const testUserId = `test-user-svc-${crypto.randomUUID()}`;
  const testFileId = `test-file-svc-${crypto.randomUUID()}`;
  const otherWorkspaceFileId = `test-file-svc-other-${crypto.randomUUID()}`;

  const testFile = FileEntity.reconstitute({
    id: testFileId,
    workspaceId: testWorkspaceId,
    bucket: 'documents',
    path: 'test/doc.pdf',
    filename: 'doc.pdf',
    originalName: 'doc.pdf',
    extension: '.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    checksum: null,
    uploadedBy: testUserId,
    createdAt: new Date(),
    deletedAt: null,
  });

  const otherWorkspaceFile = FileEntity.reconstitute({
    id: otherWorkspaceFileId,
    workspaceId: 'other-workspace',
    bucket: 'documents',
    path: 'test/other.pdf',
    filename: 'other.pdf',
    originalName: 'other.pdf',
    extension: '.pdf',
    mimeType: 'application/pdf',
    size: 2048,
    checksum: null,
    uploadedBy: testUserId,
    createdAt: new Date(),
    deletedAt: null,
  });

  const deletedFileId = `test-file-svc-deleted-${crypto.randomUUID()}`;
  const deletedFile = FileEntity.reconstitute({
    id: deletedFileId,
    workspaceId: testWorkspaceId,
    bucket: 'documents',
    path: 'test/deleted.pdf',
    filename: 'deleted.pdf',
    originalName: 'deleted.pdf',
    extension: '.pdf',
    mimeType: 'application/pdf',
    size: 512,
    checksum: null,
    uploadedBy: testUserId,
    createdAt: new Date(),
    deletedAt: new Date(),
  });

  const dynamicFiles = new Map<string, FileEntity>();

  const storageRepoMock = {
    findById: jest.fn().mockImplementation(async (id: string) => {
      if (id === testFileId) return testFile;
      if (id === otherWorkspaceFileId) return otherWorkspaceFile;
      if (id === deletedFileId) return deletedFile;
      return dynamicFiles.get(id) ?? null;
    }),
  };

  // object های ساخته‌شده در MinIO — برای cleanup در afterAll
  const createdObjects: string[] = [];

  const create = (
    fileId: string,
    wsId: string,
    buffer: Buffer,
    overrides: Record<string, unknown> = {},
  ) =>
    service.createVersion({
      fileId,
      workspaceId: wsId,
      buffer,
      originalName: 'svc.pdf',
      mimeType: 'application/pdf',
      createdBy: testUserId,
      ...(overrides as any),
    });

  beforeAll(async () => {
    (service as any).storageRepository = storageRepoMock;

    await (prisma as any).$executeRawUnsafe(
      `INSERT INTO workspaces (id, code, name, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, '00000000-0000-0000-0000-000000000000', NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      testWorkspaceId,
      testWorkspaceCode,
      'Test Service Workspace',
    );

    await (prisma as any).$executeRawUnsafe(
      `INSERT INTO workspaces (id, code, name, created_by, created_at, updated_at)
       VALUES ('other-workspace', 'other-ws', 'Other Workspace', '00000000-0000-0000-0000-000000000000', NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
    );

    await (prisma as any).$executeRawUnsafe(
      `INSERT INTO users (id, email, password, first_name, last_name, is_admin, is_active, created_at, updated_at)
       VALUES ($1, $2, 'test-hash', 'Test', 'ServiceUser', false, true, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      testUserId,
      `${testUserId}@test.local`,
    );

    await (prisma as any).$executeRawUnsafe(
      `INSERT INTO files (id, workspace_id, bucket, path, filename, original_name, extension, mime_type, size, uploaded_by, created_at)
       VALUES ($1, $2, 'documents', 'test/doc.pdf', 'doc.pdf', 'doc.pdf', '.pdf', 'application/pdf', 1024, $3, NOW())
       ON CONFLICT (id) DO NOTHING`,
      testFileId,
      testWorkspaceId,
      testUserId,
    );

    await (prisma as any).$executeRawUnsafe(
      `INSERT INTO files (id, workspace_id, bucket, path, filename, original_name, extension, mime_type, size, uploaded_by, created_at)
       VALUES ($1, 'other-workspace', 'documents', 'test/other.pdf', 'other.pdf', 'other.pdf', '.pdf', 'application/pdf', 2048, $2, NOW())
       ON CONFLICT (id) DO NOTHING`,
      otherWorkspaceFileId,
      testUserId,
    );

    await (prisma as any).$executeRawUnsafe(
      `INSERT INTO files (id, workspace_id, bucket, path, filename, original_name, extension, mime_type, size, uploaded_by, created_at, deleted_at)
       VALUES ($1, $2, 'documents', 'test/deleted.pdf', 'deleted.pdf', 'deleted.pdf', '.pdf', 'application/pdf', 512, $3, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      deletedFileId,
      testWorkspaceId,
      testUserId,
    );
  });

  afterAll(async () => {
    for (const key of createdObjects) {
      await minioService.deleteObject('documents', key).catch(() => {});
    }

    await (prisma as any).$executeRawUnsafe(
      `DELETE FROM file_versions WHERE file_id IN ($1, $2, $3)`,
      testFileId,
      otherWorkspaceFileId,
      deletedFileId,
    );
    await (prisma as any).$executeRawUnsafe(
      `DELETE FROM file_versions WHERE file_id LIKE 'test-file-svc-single-%'`,
    );
    await (prisma as any).$executeRawUnsafe(
      `DELETE FROM files WHERE id IN ($1, $2, $3) OR id LIKE 'test-file-svc-single-%'`,
      testFileId,
      otherWorkspaceFileId,
      deletedFileId,
    );
    await (prisma as any).$executeRawUnsafe(`DELETE FROM users WHERE id = $1`, testUserId);
    await (prisma as any).$executeRawUnsafe(
      `DELETE FROM workspaces WHERE id IN ($1, 'other-workspace')`,
      testWorkspaceId,
    );
    await (prisma as any).$executeRawUnsafe(
      `DELETE FROM audit_logs WHERE entity = 'file_version' AND workspace_id = $1`,
      testWorkspaceId,
    );
  });

  describe('createVersion', () => {
    it('should upload the object to MinIO and create version 1 for a new file', async () => {
      const version = await create(testFileId, testWorkspaceId, Buffer.from('v1-content'), {
        changeReason: 'First version',
      });

      createdObjects.push(`${testWorkspaceId}/${version.path}`);

      expect(version).toBeDefined();
      expect(version.version).toBe(1);
      expect(version.fileId).toBe(testFileId);
      expect(version.changeReason).toBe('First version');

      const content = await minioService.getObject(
        'documents',
        `${testWorkspaceId}/${version.path}`,
      );
      expect(content.toString()).toBe('v1-content');
    });

    it('should create version 2 on second call', async () => {
      const version = await create(testFileId, testWorkspaceId, Buffer.from('v2-content'));
      createdObjects.push(`${testWorkspaceId}/${version.path}`);

      expect(version.version).toBe(2);
    });

    it('should reject a disallowed MIME type', async () => {
      await expect(
        service.createVersion({
          fileId: testFileId,
          workspaceId: testWorkspaceId,
          buffer: Buffer.from('exe'),
          originalName: 'malware.exe',
          mimeType: 'application/x-executable',
          createdBy: testUserId,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('workspace authorization', () => {
    it('should reject cross-workspace access', async () => {
      await expect(
        create(otherWorkspaceFileId, testWorkspaceId, Buffer.from('hack')),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('missing file rejection', () => {
    it('should throw NotFoundException for non-existent file', async () => {
      await expect(
        create(crypto.randomUUID(), testWorkspaceId, Buffer.from('ghost')),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleted file rejection', () => {
    it('should throw NotFoundException for deleted file', async () => {
      await expect(create(deletedFileId, testWorkspaceId, Buffer.from('dead'))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('listVersions', () => {
    it('should return paginated versions', async () => {
      const result = await service.listVersions(testFileId, testWorkspaceId, 1, 10);

      expect(result.data.length).toBeGreaterThanOrEqual(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBeGreaterThanOrEqual(1);
      expect(result.meta.totalPages).toBeGreaterThanOrEqual(1);
    });

    it('should reject listVersions for unauthorized workspace', async () => {
      await expect(service.listVersions(testFileId, 'wrong-workspace')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getVersion', () => {
    it('should return specific version', async () => {
      const version = await service.getVersion(testFileId, 1, testWorkspaceId);
      expect(version).toBeDefined();
      expect(version.version).toBe(1);
    });

    it('should throw for non-existent version', async () => {
      await expect(service.getVersion(testFileId, 999, testWorkspaceId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw for invalid version number', async () => {
      await expect(service.getVersion(testFileId, 0, testWorkspaceId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getVersionContent', () => {
    it('should return the version content from MinIO', async () => {
      const { buffer, version } = await service.getVersionContent(testFileId, 1, testWorkspaceId);

      expect(version.version).toBe(1);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.toString()).toBe('v1-content');
    });

    it('should reject content download for a deleted file', async () => {
      await expect(service.getVersionContent(deletedFileId, 1, testWorkspaceId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('revertVersion', () => {
    it('should create a NEW object and a new version from an existing one', async () => {
      const reverted = await service.revertVersion(
        testFileId,
        1,
        testWorkspaceId,
        testUserId,
        'Reverting to v1',
      );

      createdObjects.push(`${testWorkspaceId}/${reverted.path}`);

      expect(reverted).toBeDefined();
      expect(reverted.version).toBeGreaterThanOrEqual(3);
      expect(reverted.path).not.toBe('2026/07/svc-v1.pdf');
      expect(reverted.changeReason).toBe('Reverting to v1');

      // content باید با نسخه مبدأ یکی باشد (server-side copy)
      const revertedContent = await minioService.getObject(
        'documents',
        `${testWorkspaceId}/${reverted.path}`,
      );
      expect(revertedContent.toString()).toBe('v1-content');
    });
  });

  describe('deleteVersion', () => {
    it('should delete an intermediate version and its MinIO object', async () => {
      const versions = await service.listVersions(testFileId, testWorkspaceId, 1, 100);
      const intermediate = versions.data.find(
        (v) => v.version > 1 && v.version < versions.data[0].version,
      );
      if (!intermediate) return;

      await service.deleteVersion(testFileId, intermediate.version, testWorkspaceId);

      const found = await fileVersionRepo.findById(intermediate.id);
      expect(found).toBeNull();

      await expect(
        minioService.getObject('documents', `${testWorkspaceId}/${intermediate.path}`),
      ).rejects.toThrow();
    });

    it('should reject deleting the initial version', async () => {
      const singleFileId = `test-file-svc-single-${crypto.randomUUID()}`;
      await (prisma as any).$executeRawUnsafe(
        `INSERT INTO files (id, workspace_id, bucket, path, filename, original_name, extension, mime_type, size, uploaded_by, created_at)
         VALUES ($1, $2, 'documents', 'test/single.pdf', 'single.pdf', 'single.pdf', '.pdf', 'application/pdf', 500, $3, NOW())`,
        singleFileId,
        testWorkspaceId,
        testUserId,
      );

      const singleFile = FileEntity.reconstitute({
        id: singleFileId,
        workspaceId: testWorkspaceId,
        bucket: 'documents',
        path: 'test/single.pdf',
        filename: 'single.pdf',
        originalName: 'single.pdf',
        extension: '.pdf',
        mimeType: 'application/pdf',
        size: 500,
        checksum: null,
        uploadedBy: testUserId,
        createdAt: new Date(),
        deletedAt: null,
      });
      dynamicFiles.set(singleFileId, singleFile);

      const created = await create(singleFileId, testWorkspaceId, Buffer.from('single-v1'));
      createdObjects.push(`${testWorkspaceId}/${created.path}`);

      await expect(service.deleteVersion(singleFileId, 1, testWorkspaceId)).rejects.toThrow(
        BadRequestException,
      );

      dynamicFiles.delete(singleFileId);
      await (prisma as any).$executeRawUnsafe(
        `DELETE FROM file_versions WHERE file_id = $1`,
        singleFileId,
      );
      await (prisma as any).$executeRawUnsafe(`DELETE FROM files WHERE id = $1`, singleFileId);
    });

    it('should reject deleting the latest active version', async () => {
      const latest = await service.getLatestVersion(testFileId, testWorkspaceId);

      await expect(
        service.deleteVersion(testFileId, latest!.version, testWorkspaceId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('data persistence', () => {
    it('should persist created data correctly', async () => {
      const version = await create(testFileId, testWorkspaceId, Buffer.from('persist'), {
        originalName: 'persist.pdf',
      });
      createdObjects.push(`${testWorkspaceId}/${version.path}`);

      const fetched = await fileVersionRepo.findById(version.id);
      expect(fetched).not.toBeNull();
      expect(fetched!.size).toBe(7);
      expect(fetched!.originalName).toBe('persist.pdf');
    });
  });
});
