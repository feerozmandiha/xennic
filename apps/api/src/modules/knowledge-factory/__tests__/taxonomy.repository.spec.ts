jest.mock('@xennic/database', () => ({
  prisma: {
    categories: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    },
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { TaxonomyRepository } from '../infrastructure/repositories/taxonomy.repository.js';

describe('TaxonomyRepository', () => {
  let repo: TaxonomyRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaxonomyRepository],
    }).compile();
    repo = module.get<TaxonomyRepository>(TaxonomyRepository);
  });

  it('getByLevel returns empty list', async () => {
    const nodes = await repo.getByLevel(1);
    expect(nodes).toHaveLength(0);
  });

  it('getChildren returns empty list', async () => {
    const nodes = await repo.getChildren('parent-1');
    expect(nodes).toHaveLength(0);
  });

  it('getParent returns null when no parent', async () => {
    const parent = await repo.getParent('node-1');
    expect(parent).toBeNull();
  });

  it('getAncestors returns empty for root node', async () => {
    const ancestors = await repo.getAncestors('node-1');
    expect(ancestors).toHaveLength(0);
  });

  it('getDescendants returns empty', async () => {
    const descendants = await repo.getDescendants('node-1');
    expect(descendants).toHaveLength(0);
  });

  it('findById returns null when missing', async () => {
    const result = await repo.findById('nonexistent');
    expect(result).toBeNull();
  });

  it('findBySlug returns null when missing', async () => {
    const result = await repo.findBySlug('nonexistent');
    expect(result).toBeNull();
  });

  it('creates and updates nodes', async () => {
    const node = {
      id: 'cat-1', slug: 'test-cat', name: 'Test Category',
      level: 1, sortOrder: 0, isActive: true,
    };
    await expect(repo.create(node as any)).resolves.toBeUndefined();
    await expect(repo.update(node as any)).resolves.toBeUndefined();
  });
});
