import { ConflictException } from '@nestjs/common';

const mockData = {
  findFirst: jest.fn(),
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

jest.mock('@xennic/database', () => ({
  prisma: {
    knowledge_object_versions: mockData,
    $transaction: jest.fn().mockImplementation(async (ops) => Promise.all(ops)),
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { VersionManagerService } from '../application/services/version-manager.service.js';

describe('VersionManagerService', () => {
  let service: VersionManagerService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockData.findFirst.mockResolvedValue(null);
    mockData.findUnique.mockResolvedValue(null);
    mockData.findMany.mockResolvedValue([]);
    mockData.create.mockResolvedValue({
      id: 'ver-1', knowledge_object_id: 'ko-1', version: 1,
      status: 'active', snapshot: { text: 'content' }, created_at: new Date(),
    });
    mockData.update.mockImplementation(async ({ where, data }) => ({
      id: 'ver-1', knowledge_object_id: 'ko-1', version: where?.knowledge_object_id_version?.version ?? 1,
      status: data?.status ?? 'active', snapshot: { text: 'content' }, created_at: new Date(),
    }));
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VersionManagerService],
    }).compile();
    service = module.get<VersionManagerService>(VersionManagerService);
  });

  it('creates version 1 for new document', async () => {
    const ver = await service.createVersion('ko-1', { text: 'content' }, 'Initial version');
    expect(ver.version).toBe(1);
    expect(ver.status).toBe('active');
  });

  it('creates version 2 when a version already exists', async () => {
    mockData.findFirst.mockResolvedValue({ version: 1 });
    mockData.create.mockResolvedValue({
      id: 'ver-2', knowledge_object_id: 'ko-1', version: 2,
      status: 'active', snapshot: { text: 'updated' }, created_at: new Date(),
    });
    const ver = await service.createVersion('ko-1', { text: 'updated' });
    expect(ver.version).toBe(2);
  });

  it('returns empty list when no versions exist', async () => {
    const versions = await service.getVersions('ko-1');
    expect(versions).toHaveLength(0);
  });

  it('returns null for nonexistent version', async () => {
    const ver = await service.getVersion('ko-1', 99);
    expect(ver).toBeNull();
  });

  it('returns a version when found', async () => {
    mockData.findUnique.mockResolvedValue({
      id: 'ver-1', knowledge_object_id: 'ko-1', version: 1,
      status: 'active', snapshot: { text: 'content' }, created_at: new Date(),
    });
    const ver = await service.getVersion('ko-1', 1);
    expect(ver).not.toBeNull();
    expect(ver!.version).toBe(1);
  });

  it('updates version status', async () => {
    mockData.findUnique.mockResolvedValue({
      id: 'ver-1', knowledge_object_id: 'ko-1', version: 1,
      status: 'active', snapshot: { text: 'content' }, created_at: new Date(),
    });
    const ver = await service.updateStatus('ko-1', 1, 'deprecated', 'No longer valid');
    expect(ver.status).toBe('deprecated');
  });

  it('rejects updating nonexistent version', async () => {
    await expect(
      service.updateStatus('ko-1', 99, 'deprecated'),
    ).rejects.toThrow(ConflictException);
  });

  it('supersedes old version with new', async () => {
    await expect(service.supersede('ko-1', 1, 2)).resolves.toBeUndefined();
  });

  it('supersede calls $transaction with two updates', async () => {
    await service.supersede('ko-1', 1, 2);
    const { prisma } = require('@xennic/database');
    expect(prisma.$transaction).toHaveBeenCalled();
    const ops = (prisma.$transaction as jest.Mock).mock.calls[0][0];
    expect(ops).toHaveLength(2);
  });
});
