const metricsUpsertMock = jest.fn();

jest.mock(
  '@xennic/database',
  () => ({
    prisma: {
      knowledge_graph_metrics: {
        upsert: metricsUpsertMock,
      },
    },
  }),
  { virtual: true },
);

import { GraphMetricsRepository } from './graph-metrics.repository.js';

const metricRow = {
  id: 'metric-1',
  node_id: 'node-1',
  confidence: 0.8,
  freshness: 0.7,
  authority: 0.6,
  completeness: 0.9,
  access_count: 12,
  last_accessed_at: new Date('2026-08-18T00:00:00.000Z'),
  computed_at: new Date('2026-08-17T00:00:00.000Z'),
  updated_at: new Date('2026-08-19T00:00:00.000Z'),
};

describe('GraphMetricsRepository', () => {
  const repository = new GraphMetricsRepository();

  beforeEach(() => {
    jest.clearAllMocks();
    metricsUpsertMock.mockResolvedValue(metricRow);
  });

  it('preserves access history when recomputing scores', async () => {
    await repository.save({
      nodeId: 'node-1',
      confidence: 0.8,
      freshness: 0.7,
      authority: 0.6,
      completeness: 0.9,
    });

    expect(metricsUpsertMock).toHaveBeenCalledWith({
      where: { node_id: 'node-1' },
      update: {
        confidence: 0.8,
        freshness: 0.7,
        authority: 0.6,
        completeness: 0.9,
        updated_at: expect.any(Date),
      },
      create: {
        node_id: 'node-1',
        confidence: 0.8,
        freshness: 0.7,
        authority: 0.6,
        completeness: 0.9,
        access_count: 0,
        last_accessed_at: null,
      },
    });
  });

  it('updates access fields when callers explicitly provide them', async () => {
    const lastAccessedAt = new Date('2026-08-19T01:00:00.000Z');

    await repository.save({
      nodeId: 'node-1',
      confidence: 0.8,
      freshness: 0.7,
      authority: 0.6,
      completeness: 0.9,
      accessCount: 13,
      lastAccessedAt,
    });

    expect(metricsUpsertMock.mock.calls[0]?.[0].update).toEqual({
      confidence: 0.8,
      freshness: 0.7,
      authority: 0.6,
      completeness: 0.9,
      access_count: 13,
      last_accessed_at: lastAccessedAt,
      updated_at: expect.any(Date),
    });
  });
});
