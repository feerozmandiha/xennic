jest.mock('@xennic/database', () => ({
  prisma: {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeFactoryMetricsService } from './knowledge-factory-metrics.service.js';

describe('KnowledgeFactoryMetricsService', () => {
  let service: KnowledgeFactoryMetricsService;

  const mockDocumentRepository = {
    countByStatus: jest.fn(),
  };

  const mockEventBus = {
    queues: new Map(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeFactoryMetricsService,
        { provide: 'IKnowledgeDocumentRepository', useValue: mockDocumentRepository },
        { provide: 'PipelineEventBus', useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<KnowledgeFactoryMetricsService>(KnowledgeFactoryMetricsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should collect metrics from repository', async () => {
    mockDocumentRepository.countByStatus
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(2);

    const metrics = await service.getMetrics();
    expect(metrics.documentsUploaded).toBe(10);
    expect(metrics.documentsProcessed).toBe(5);
    expect(metrics.documentsFailed).toBe(2);
  });

  it('should return queue depths', async () => {
    const mockQueue = {
      getJobCounts: jest.fn().mockResolvedValue({ waiting: 5, active: 2, delayed: 0 }),
    };
    mockEventBus.queues.set('knowledge-factory-intake', mockQueue as any);

    const metrics = await service.getMetrics();
    expect(metrics.queueDepths['knowledge-factory-intake']).toBe(7);
  });
});
