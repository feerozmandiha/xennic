jest.mock('@xennic/database', () => ({
  prisma: {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeFactoryHealthService } from './knowledge-factory-health.service.js';

describe('KnowledgeFactoryHealthService', () => {
  let service: KnowledgeFactoryHealthService;

  const mockDocumentRepository = {
    findByWorkspace: jest.fn(),
  };

  const mockEventBus = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeFactoryHealthService,
        { provide: 'IKnowledgeDocumentRepository', useValue: mockDocumentRepository },
        { provide: 'PipelineEventBus', useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<KnowledgeFactoryHealthService>(KnowledgeFactoryHealthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return healthy status when database is connected', async () => {
    mockDocumentRepository.findByWorkspace.mockResolvedValue({ data: [], total: 0 });

    const result = await service.check();
    expect(result.status).toBe('ok');
    expect(result.details.database).toBe('connected');
  });

  it('should return degraded status when database is unreachable', async () => {
    mockDocumentRepository.findByWorkspace.mockRejectedValue(new Error('Connection failed'));

    const result = await service.check();
    expect(result.status).toBe('degraded');
    expect(result.details.database).toBe('error');
  });
});
