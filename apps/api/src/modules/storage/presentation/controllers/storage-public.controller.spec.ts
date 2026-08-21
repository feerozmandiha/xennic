import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StoragePublicController } from './storage-public.controller.js';
import { StorageService } from '../../application/services/storage.service.js';
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

describe('StoragePublicController', () => {
  let controller: StoragePublicController;

  const service = { downloadPublicImage: jest.fn() };

  function makeRes() {
    const res: any = {
      headers: {} as Record<string, string>,
      body: undefined as unknown,
      header(key: string, value: string) {
        res.headers[key] = value;
        return res;
      },
      send(payload: unknown) {
        res.body = payload;
        return res;
      },
    };
    return res;
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [StoragePublicController],
      providers: [{ provide: StorageService, useValue: service }],
    }).compile();

    controller = module.get(StoragePublicController);
    jest.clearAllMocks();
  });

  it('streams the image inline with a cacheable content type', async () => {
    const buffer = Buffer.from('binary-image');
    service.downloadPublicImage.mockResolvedValue({ buffer, file: makeFile() });

    const res = makeRes();
    await controller.image('file-1', res);

    expect(service.downloadPublicImage).toHaveBeenCalledWith('file-1');
    expect(res.body).toBe(buffer);
    expect(res.headers['Content-Type']).toBe('image/jpeg');
    expect(res.headers['Content-Length']).toBe(String(buffer.length));
    expect(res.headers['Content-Disposition']).toBe('inline');
    expect(res.headers['Cache-Control']).toContain('public');
  });

  it('propagates a not-found for a non-public or non-image file', async () => {
    service.downloadPublicImage.mockRejectedValue(new NotFoundException('Image "x" not found'));

    await expect(controller.image('x', makeRes())).rejects.toThrow(NotFoundException);
  });
});
