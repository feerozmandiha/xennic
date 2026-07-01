jest.mock('@xennic/database', () => ({
  prisma: {
    provenance_records: {
      create: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
    },
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ProvenanceRepository } from '../infrastructure/repositories/provenance.repository.js';
import { ProvenanceRecord } from '../domain/provenance.entity.js';

describe('ProvenanceRepository', () => {
  let repo: ProvenanceRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProvenanceRepository],
    }).compile();
    repo = module.get<ProvenanceRepository>(ProvenanceRepository);
  });

  it('saves a provenance record', async () => {
    const record = new ProvenanceRecord({
      id: 'prov-1', knowledgeObjectId: 'ko-1',
      sourceDocument: 'doc.pdf', page: 5, section: '3.1',
      citationChain: [], createdAt: new Date(),
    });
    await expect(repo.save(record)).resolves.toBeUndefined();
  });

  it('findByKnowledgeObjectId returns empty when none exist', async () => {
    const results = await repo.findByKnowledgeObjectId('ko-1');
    expect(results).toHaveLength(0);
  });

  it('findByTraceId returns empty when none exist', async () => {
    const results = await repo.findByTraceId('trace-1');
    expect(results).toHaveLength(0);
  });

  it('findByChunkId returns null when not found', async () => {
    const result = await repo.findByChunkId('chunk-1');
    expect(result).toBeNull();
  });
});
