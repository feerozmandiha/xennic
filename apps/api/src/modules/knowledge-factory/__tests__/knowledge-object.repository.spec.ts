jest.mock('@xennic/database', () => ({
  prisma: {
    knowledge_objects: {
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeObjectRepository } from '../infrastructure/repositories/knowledge-object.repository.js';
import { KnowledgeObject } from '../domain/knowledge-object.entity.js';

describe('KnowledgeObjectRepository', () => {
  let repo: KnowledgeObjectRepository;
  const mockKo = KnowledgeObject.reconstitute({
    id: 'ko-1', xid: 'XID-001', workspaceId: 'ws-1',
    title: 'Test Knowledge', slug: 'test-knowledge', language: 'fa',
    tier: 'silver', taxonomy: [], ontologyRefs: [], documentVersion: 1,
    status: 'active', authorityScore: 0.85, semanticTags: ['transformer'],
    citations: [], content: { text: 'test' }, createdAt: new Date(), updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KnowledgeObjectRepository],
    }).compile();
    repo = module.get<KnowledgeObjectRepository>(KnowledgeObjectRepository);
  });

  it('saves a knowledge object', async () => {
    await expect(repo.save(mockKo)).resolves.toBeUndefined();
  });

  it('updates a knowledge object', async () => {
    await expect(repo.update(mockKo)).resolves.toBeUndefined();
  });

  it('deletes a knowledge object', async () => {
    await expect(repo.delete('ko-1')).resolves.toBeUndefined();
  });

  it('findById returns null for missing', async () => {
    const result = await repo.findById('nonexistent');
    expect(result).toBeNull();
  });

  it('findByXid returns null for missing', async () => {
    const result = await repo.findByXid('XID-MISSING');
    expect(result).toBeNull();
  });

  it('findBySlug returns null for missing', async () => {
    const result = await repo.findBySlug('nonexistent');
    expect(result).toBeNull();
  });

  it('searchMetadata returns empty when nothing found', async () => {
    const result = await repo.searchMetadata({ workspaceId: 'ws-1' });
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
