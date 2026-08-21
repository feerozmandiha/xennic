import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StorageService } from './storage.service.js';
import { MinioService } from '../../infrastructure/minio/minio.service.js';
import { FileEntity } from '../../domain/entities/file.entity.js';

function makeFile(overrides: Record<string, any> = {}): FileEntity {
  return FileEntity.reconstitute({
    id: 'file-1',
    workspaceId: 'ws-1',
    bucket: 'public',
    path: '2026/08/a.jpg',
    filename: 'a.jpg',
    originalName: 'cable.jpg',
    extension: 'jpg',
    mimeType: 'image/jpeg',
    size: 1024,
    checksum: null,
    uploadedBy: 'user-1',
    createdAt: new Date(),
    deletedAt: null,
    ...overrides,
  } as any);
}

describe('StorageService.downloadPublicImage', () => {
  let service: StorageService;

  const minio = { getObject: jest.fn() };
  const repo = { findById: jest.fn() };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: MinioService, useValue: minio },
        { provide: 'IStorageRepository', useValue: repo },
      ],
    }).compile();

    service = module.get(StorageService);
    jest.clearAllMocks();
    minio.getObject.mockResolvedValue(Buffer.from('binary-image'));
  });

  it('returns the bytes of a public image without a workspace scope', async () => {
    repo.findById.mockResolvedValue(makeFile());

    const { buffer, file } = await service.downloadPublicImage('file-1');

    expect(buffer.toString()).toBe('binary-image');
    expect(file.mimeType).toBe('image/jpeg');
    expect(minio.getObject).toHaveBeenCalledWith('public', 'ws-1/2026/08/a.jpg');
  });

  it('refuses a file outside the public bucket', async () => {
    repo.findById.mockResolvedValue(makeFile({ bucket: 'private' }));

    await expect(service.downloadPublicImage('file-1')).rejects.toThrow(NotFoundException);
    expect(minio.getObject).not.toHaveBeenCalled();
  });

  it('refuses a non-image file even in the public bucket', async () => {
    repo.findById.mockResolvedValue(makeFile({ mimeType: 'application/pdf' }));

    await expect(service.downloadPublicImage('file-1')).rejects.toThrow(NotFoundException);
    expect(minio.getObject).not.toHaveBeenCalled();
  });

  it('refuses a soft-deleted file', async () => {
    repo.findById.mockResolvedValue(makeFile({ deletedAt: new Date() }));

    await expect(service.downloadPublicImage('file-1')).rejects.toThrow(NotFoundException);
  });

  it('refuses an unknown file', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.downloadPublicImage('missing')).rejects.toThrow(NotFoundException);
  });
});
