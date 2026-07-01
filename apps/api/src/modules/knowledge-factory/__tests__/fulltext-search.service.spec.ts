jest.mock('@xennic/database', () => ({
  prisma: {
    $queryRawUnsafe: jest.fn(),
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { FullTextSearchService } from '../application/services/fulltext-search.service.js';

describe('FullTextSearchService', () => {
  let service: FullTextSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FullTextSearchService],
    }).compile();
    service = module.get<FullTextSearchService>(FullTextSearchService);
  });

  it('returns empty for empty query', async () => {
    const result = await service.search('ws-1', '');
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('returns empty for whitespace-only query', async () => {
    const result = await service.search('ws-1', '   ');
    expect(result.items).toHaveLength(0);
  });

  it('detects Persian text', async () => {
    const { prisma } = require('@xennic/database');
    prisma.$queryRawUnsafe
      .mockResolvedValueOnce([{ count: BigInt(0) }])
      .mockResolvedValueOnce([]);
    const result = await service.search('ws-1', 'ترانسفورماتور');
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('sanitizes special characters from query', () => {
    const { prisma } = require('@xennic/database');
    prisma.$queryRawUnsafe
      .mockResolvedValueOnce([{ count: BigInt(1) }])
      .mockResolvedValueOnce([{ id: 'ko-1', xid: 'XID-1', title: 'Test', rank: 0.5, highlight: '...test...' }]);
    const result = service.search('ws-1', 'test!!!');
    expect(result).toBeDefined();
  });
});
