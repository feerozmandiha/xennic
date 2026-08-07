import { BadRequestException } from '@nestjs/common';
import { Readable } from 'stream';
import { FileVersionController } from './file-version.controller.js';
import { FileVersionService } from '../../application/services/file-version.service.js';
import { FileVersionEntity } from '../../domain/entities/file-version.entity.js';

jest.mock('@xennic/database', () => ({ prisma: {} }));

describe('FileVersionController', () => {
  let controller: FileVersionController;
  let service: {
    createVersion: jest.Mock;
    listVersions: jest.Mock;
    getVersion: jest.Mock;
    getLatestVersion: jest.Mock;
    getVersionContent: jest.Mock;
    getVersionDownloadUrl: jest.Mock;
    revertVersion: jest.Mock;
    deleteVersion: jest.Mock;
  };

  const fileId = 'file-1';
  const workspaceId = 'workspace-1';

  const version1 = FileVersionEntity.create({
    fileId,
    version: 1,
    path: '2026/07/v1.pdf',
    size: 10,
    mimeType: 'application/pdf',
    originalName: 'doc.pdf',
    createdBy: 'user-1',
  });

  const version2 = FileVersionEntity.create({
    fileId,
    version: 2,
    path: '2026/07/v2.pdf',
    size: 20,
    mimeType: 'application/pdf',
    originalName: 'doc.pdf',
    createdBy: 'user-1',
  });

  beforeEach(() => {
    service = {
      createVersion: jest.fn().mockResolvedValue(version2),
      listVersions: jest.fn().mockResolvedValue({
        data: [version2, version1],
        meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
      }),
      getVersion: jest.fn().mockResolvedValue(version1),
      getLatestVersion: jest.fn().mockResolvedValue(version2),
      getVersionContent: jest
        .fn()
        .mockResolvedValue({ buffer: Buffer.from('pdf-content'), version: version1 }),
      getVersionDownloadUrl: jest
        .fn()
        .mockResolvedValue({ url: 'https://minio.test/v1', version: version1 }),
      revertVersion: jest.fn().mockResolvedValue(version2),
      deleteVersion: jest.fn().mockResolvedValue(undefined),
    };

    controller = new FileVersionController(service as never);
  });

  function makeFilePart(buffer: Buffer, filename = 'doc.pdf', mimetype = 'application/pdf') {
    const stream = Readable.from([buffer]) as any;
    stream.truncated = false;
    return {
      type: 'file',
      fieldname: 'file',
      filename,
      mimetype,
      encoding: '7bit',
      file: stream,
    };
  }

  function makeFieldPart(fieldname: string, value: string) {
    return {
      type: 'field',
      fieldname,
      value,
      mimetype: 'text/plain',
      encoding: '7bit',
    };
  }

  function makeReq(parts: any[]) {
    async function* iterator() {
      for (const part of parts) yield part;
    }
    return {
      isMultipart: () => true,
      parts: jest.fn().mockReturnValue(iterator()),
      workspaceId,
      user: { userId: 'user-1' },
      ip: '127.0.0.1',
      headers: {},
    };
  }

  describe('create', () => {
    it('creates a version from a multipart upload', async () => {
      const req = makeReq([makeFilePart(Buffer.from('new-content'))]);

      const result = await controller.create(fileId, req);

      expect(result.success).toBe(true);
      expect(service.createVersion).toHaveBeenCalledWith(
        expect.objectContaining({
          fileId,
          workspaceId,
          buffer: Buffer.from('new-content'),
          originalName: 'doc.pdf',
          mimeType: 'application/pdf',
          createdBy: 'user-1',
        }),
      );
      expect(result.data.version).toBe(2);
    });

    it('passes changeReason when provided', async () => {
      const req = makeReq([
        makeFilePart(Buffer.from('new-content')),
        makeFieldPart('changeReason', 'Updated section 3'),
      ]);

      await controller.create(fileId, req);

      expect(service.createVersion).toHaveBeenCalledWith(
        expect.objectContaining({ changeReason: 'Updated section 3' }),
      );
    });

    it('rejects a non-multipart request', async () => {
      const req = { isMultipart: () => false };

      await expect(controller.create(fileId, req)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a request without a file part', async () => {
      const req = makeReq([makeFieldPart('changeReason', 'no file')]);

      await expect(controller.create(fileId, req)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a too-long changeReason', async () => {
      const req = makeReq([
        makeFilePart(Buffer.from('new-content')),
        makeFieldPart('changeReason', 'x'.repeat(501)),
      ]);

      await expect(controller.create(fileId, req)).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('returns versions with isLatest flags', async () => {
      const result = await controller.findAll(fileId, { workspaceId }, undefined, undefined);

      expect(result.success).toBe(true);
      expect(result.data[0].isLatest).toBe(true);
      expect(result.data[1].isLatest).toBe(false);
      expect(result.meta.total).toBe(2);
      expect(service.listVersions).toHaveBeenCalledWith(fileId, workspaceId, 1, 20);
    });
  });

  describe('findOne', () => {
    it('returns version detail with downloadUrl and isLatest', async () => {
      const result = await controller.findOne(fileId, '1', { workspaceId });

      expect(result.data.version).toBe(1);
      expect(result.data.downloadUrl).toBe('https://minio.test/v1');
      expect(result.data.isLatest).toBe(false);
    });
  });

  describe('download', () => {
    it('streams the version content as binary', async () => {
      const res = { header: jest.fn().mockReturnThis(), send: jest.fn() };

      await controller.download(fileId, '1', { workspaceId }, res);

      expect(service.getVersionContent).toHaveBeenCalledWith(fileId, 1, workspaceId);
      expect(res.header).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(res.header).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment; filename='),
      );
      expect(res.send).toHaveBeenCalledWith(Buffer.from('pdf-content'));
    });
  });

  describe('revert', () => {
    it('reverts to a version with a default reason', async () => {
      const result = await controller.revert(
        fileId,
        '1',
        { workspaceId, user: { userId: 'u1' } },
        {},
      );

      expect(result.data.version).toBe(2);
      expect(service.revertVersion).toHaveBeenCalledWith(
        fileId,
        1,
        workspaceId,
        'u1',
        'Reverted from previous version',
        null,
        null,
      );
    });

    it('passes the provided changeReason', async () => {
      await controller.revert(
        fileId,
        '1',
        { workspaceId, user: { userId: 'u1' } },
        {
          changeReason: 'Rollback',
        },
      );

      expect(service.revertVersion).toHaveBeenCalledWith(
        fileId,
        1,
        workspaceId,
        'u1',
        'Rollback',
        null,
        null,
      );
    });
  });

  describe('remove', () => {
    it('deletes a version', async () => {
      await controller.remove(fileId, '2', { workspaceId, user: { userId: 'u1' } });

      expect(service.deleteVersion).toHaveBeenCalledWith(fileId, 2, workspaceId, null, null);
    });
  });

  describe('route decorators & guards', () => {
    it('applies JwtAuthGuard, WorkspaceGuard, PermissionsGuard at class level', () => {
      const guards = Reflect.getMetadata('__guards__', FileVersionController);
      expect(guards).toBeDefined();
      expect(guards.length).toBe(3);
      const names = guards.map((g: any) => g.name ?? g.toString());
      expect(names.some((n: string) => n.includes('JwtAuthGuard'))).toBe(true);
      expect(names.some((n: string) => n.includes('WorkspaceGuard'))).toBe(true);
      expect(names.some((n: string) => n.includes('PermissionsGuard'))).toBe(true);
    });

    it('maps create → files.upload', () => {
      expect(Reflect.getMetadata('xennic_permissions', controller.create)).toContain(
        'files.upload',
      );
    });

    it('maps findAll → files.read', () => {
      expect(Reflect.getMetadata('xennic_permissions', controller.findAll)).toContain('files.read');
    });

    it('maps findOne → files.read', () => {
      expect(Reflect.getMetadata('xennic_permissions', controller.findOne)).toContain('files.read');
    });

    it('maps download → files.read', () => {
      expect(Reflect.getMetadata('xennic_permissions', controller.download)).toContain(
        'files.read',
      );
    });

    it('maps revert → files.upload', () => {
      expect(Reflect.getMetadata('xennic_permissions', controller.revert)).toContain(
        'files.upload',
      );
    });

    it('maps remove → files.delete', () => {
      expect(Reflect.getMetadata('xennic_permissions', controller.remove)).toContain(
        'files.delete',
      );
    });
  });

  describe('error mapping', () => {
    it('propagates service errors from create', async () => {
      service.createVersion.mockRejectedValue(new BadRequestException('bad mime'));
      const req = makeReq([makeFilePart(Buffer.from('x'))]);
      await expect(controller.create(fileId, req)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('propagates service errors from findOne', async () => {
      service.getVersion.mockRejectedValue(
        new BadRequestException('Version must be a positive integer'),
      );
      await expect(controller.findOne(fileId, 'abc', { workspaceId })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
