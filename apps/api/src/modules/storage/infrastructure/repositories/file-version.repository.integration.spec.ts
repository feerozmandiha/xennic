jest.mock('@xennic/database', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require('@prisma/client');
  return { prisma: new PrismaClient() };
});

import { prisma } from '@xennic/database';
import { FileVersionRepository } from './file-version.repository.js';
import { FileVersionEntity } from '../../domain/entities/file-version.entity.js';

describe('FileVersionRepository (integration)', () => {
  const repo = new FileVersionRepository();

  const testWorkspaceCode = `test-ws-${crypto.randomUUID().slice(0, 8)}`;
  const testWorkspaceId = `test-ws-${crypto.randomUUID()}`;
  const testUserId = `test-user-${crypto.randomUUID()}`;
  const testFileId = `test-file-${crypto.randomUUID()}`;
  const testFileId2 = `test-file-${crypto.randomUUID()}`;

  const versionData = {
    fileId: testFileId,
    version: 1,
    path: '2026/07/doc-v1.pdf',
    size: 1024,
    mimeType: 'application/pdf',
    originalName: 'document.pdf',
    checksum: 'abc123',
    changeReason: 'Initial upload',
    createdBy: testUserId,
  };

  beforeAll(async () => {
    await (prisma as any).$executeRawUnsafe(
      `INSERT INTO workspaces (id, code, name, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, '00000000-0000-0000-0000-000000000000', NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      testWorkspaceId,
      testWorkspaceCode,
      'Test Workspace',
    );

    await (prisma as any).$executeRawUnsafe(
      `INSERT INTO users (id, email, password, first_name, last_name, is_admin, is_active, created_at, updated_at)
       VALUES ($1, $2, 'test-hash', 'Test', 'User', false, true, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      testUserId,
      `${testUserId}@test.local`,
    );

    await (prisma as any).$executeRawUnsafe(
      `INSERT INTO files (id, workspace_id, bucket, path, filename, original_name, extension, mime_type, size, uploaded_by, created_at)
       VALUES ($1, $2, 'documents', 'test/doc.pdf', 'doc.pdf', 'doc.pdf', '.pdf', 'application/pdf', 1024, $3, NOW())`,
      testFileId,
      testWorkspaceId,
      testUserId,
    );

    await (prisma as any).$executeRawUnsafe(
      `INSERT INTO files (id, workspace_id, bucket, path, filename, original_name, extension, mime_type, size, uploaded_by, created_at)
       VALUES ($1, $2, 'documents', 'test/doc2.pdf', 'doc2.pdf', 'doc2.pdf', '.pdf', 'application/pdf', 2048, $3, NOW())`,
      testFileId2,
      testWorkspaceId,
      testUserId,
    );
  });

  afterAll(async () => {
    await (prisma as any).$executeRawUnsafe(
      `DELETE FROM file_versions WHERE file_id IN ($1, $2)`,
      testFileId,
      testFileId2,
    );
    await (prisma as any).$executeRawUnsafe(
      `DELETE FROM files WHERE id IN ($1, $2)`,
      testFileId,
      testFileId2,
    );
    await (prisma as any).$executeRawUnsafe(`DELETE FROM users WHERE id = $1`, testUserId);
    await (prisma as any).$executeRawUnsafe(
      `DELETE FROM workspaces WHERE id = $1`,
      testWorkspaceId,
    );
  });

  describe('save + findById', () => {
    it('should save a version and retrieve it by id', async () => {
      const version = FileVersionEntity.create(versionData);
      await repo.save(version);

      const found = await repo.findById(version.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(version.id);
      expect(found!.fileId).toBe(testFileId);
      expect(found!.version).toBe(1);
      expect(found!.path).toBe('2026/07/doc-v1.pdf');
      expect(found!.size).toBe(1024);
      expect(found!.mimeType).toBe('application/pdf');
      expect(found!.originalName).toBe('document.pdf');
      expect(found!.checksum).toBe('abc123');
      expect(found!.changeReason).toBe('Initial upload');
      expect(found!.createdBy).toBe(testUserId);
      expect(found!.createdAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent id', async () => {
      const found = await repo.findById(crypto.randomUUID());
      expect(found).toBeNull();
    });
  });

  describe('findByFileId', () => {
    it('should return versions ordered by version DESC', async () => {
      const v2 = FileVersionEntity.create({
        ...versionData,
        version: 2,
        path: '2026/07/doc-v2.pdf',
      });
      await repo.save(v2);

      const versions = await repo.findByFileId(testFileId);
      expect(versions.length).toBeGreaterThanOrEqual(2);
      expect(versions[0].version).toBeGreaterThanOrEqual(versions[1].version);
    });

    it('should respect pagination options', async () => {
      const versions = await repo.findByFileId(testFileId, { offset: 0, limit: 1 });
      expect(versions).toHaveLength(1);
    });

    it('should return empty array for file with no versions', async () => {
      const versions = await repo.findByFileId(crypto.randomUUID());
      expect(versions).toEqual([]);
    });
  });

  describe('findByFileIdAndVersion', () => {
    it('should return the specific version', async () => {
      const found = await repo.findByFileIdAndVersion(testFileId, 1);
      expect(found).not.toBeNull();
      expect(found!.version).toBe(1);
      expect(found!.fileId).toBe(testFileId);
    });

    it('should return null for non-existent version', async () => {
      const found = await repo.findByFileIdAndVersion(testFileId, 999);
      expect(found).toBeNull();
    });
  });

  describe('getLatestVersion', () => {
    it('should return the highest version number', async () => {
      const latest = await repo.getLatestVersion(testFileId);
      expect(latest).not.toBeNull();
      expect(latest!.version).toBe(2);
    });

    it('should return null for file with no versions', async () => {
      const latest = await repo.getLatestVersion(crypto.randomUUID());
      expect(latest).toBeNull();
    });
  });

  describe('getNextVersionNumber', () => {
    it('should return 1 when no versions exist', async () => {
      const next = await repo.getNextVersionNumber(crypto.randomUUID());
      expect(next).toBe(1);
    });

    it('should return max(version) + 1 when versions exist', async () => {
      const next = await repo.getNextVersionNumber(testFileId);
      expect(next).toBe(3);
    });
  });

  describe('countByFileId', () => {
    it('should count versions for a file', async () => {
      const count = await repo.countByFileId(testFileId);
      expect(count).toBe(2);
    });

    it('should return 0 for file with no versions', async () => {
      const count = await repo.countByFileId(crypto.randomUUID());
      expect(count).toBe(0);
    });
  });

  describe('delete', () => {
    it('should delete a version by id', async () => {
      const toDelete = FileVersionEntity.create({
        ...versionData,
        version: 99,
        path: '2026/07/doc-delete-me.pdf',
      });
      await repo.save(toDelete);

      const found = await repo.findById(toDelete.id);
      expect(found).not.toBeNull();

      await repo.delete(toDelete.id);

      const deleted = await repo.findById(toDelete.id);
      expect(deleted).toBeNull();
    });
  });

  describe('unique(file_id, version) constraint', () => {
    it('should reject duplicate file_id + version', async () => {
      const dup = FileVersionEntity.create({
        ...versionData,
        version: 1,
        path: '2026/07/doc-dup.pdf',
      });

      await expect(repo.save(dup)).rejects.toThrow();
    });
  });

  describe('FK file_id enforcement', () => {
    it('should reject version with non-existent file_id', async () => {
      const orphan = FileVersionEntity.create({
        ...versionData,
        fileId: crypto.randomUUID(),
        version: 1,
      });

      await expect(repo.save(orphan)).rejects.toThrow();
    });
  });

  describe('FK created_by enforcement', () => {
    it('should reject version with non-existent created_by', async () => {
      const bad = FileVersionEntity.create({
        ...versionData,
        version: 50,
        createdBy: crypto.randomUUID(),
      });

      await expect(repo.save(bad)).rejects.toThrow();
    });
  });

  describe('BigInt size mapping', () => {
    it('should correctly map BigInt size to number', async () => {
      const bigVersion = FileVersionEntity.create({
        ...versionData,
        version: 100,
        size: 5 * 1024 * 1024 * 1024,
        path: '2026/07/big-file.bin',
      });
      await repo.save(bigVersion);

      const found = await repo.findById(bigVersion.id);
      expect(found).not.toBeNull();
      expect(found!.size).toBe(5 * 1024 * 1024 * 1024);
      expect(typeof found!.size).toBe('number');

      await repo.delete(bigVersion.id);
    });
  });

  describe('nullable fields mapping', () => {
    it('should map null checksum correctly', async () => {
      const noChecksum = FileVersionEntity.create({
        ...versionData,
        version: 101,
        checksum: null,
        path: '2026/07/no-checksum.bin',
      });
      await repo.save(noChecksum);

      const found = await repo.findById(noChecksum.id);
      expect(found).not.toBeNull();
      expect(found!.checksum).toBeNull();

      await repo.delete(noChecksum.id);
    });

    it('should map null change_reason correctly', async () => {
      const noReason = FileVersionEntity.create({
        ...versionData,
        version: 102,
        changeReason: null,
        path: '2026/07/no-reason.bin',
      });
      await repo.save(noReason);

      const found = await repo.findById(noReason.id);
      expect(found).not.toBeNull();
      expect(found!.changeReason).toBeNull();

      await repo.delete(noReason.id);
    });

    it('should map null created_by correctly', async () => {
      const noUser = FileVersionEntity.create({
        ...versionData,
        version: 103,
        createdBy: null,
        path: '2026/07/no-user.bin',
      });
      await repo.save(noUser);

      const found = await repo.findById(noUser.id);
      expect(found).not.toBeNull();
      expect(found!.createdBy).toBeNull();

      await repo.delete(noUser.id);
    });
  });

  describe('ordering by version DESC', () => {
    it('should return versions in descending order', async () => {
      const versions = await repo.findByFileId(testFileId);
      for (let i = 0; i < versions.length - 1; i++) {
        expect(versions[i].version).toBeGreaterThanOrEqual(versions[i + 1].version);
      }
    });
  });
});
