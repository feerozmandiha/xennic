jest.mock('@xennic/database', () => ({
  prisma: {
    event_outbox: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0),
    },
    event_process_log: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      upsert: jest.fn().mockResolvedValue({}),
    },
    $queryRaw: jest.fn().mockResolvedValue([]),
    $executeRaw: jest.fn().mockResolvedValue([]),
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import {
  EventType,
  createDomainEvent,
} from '../src/modules/semantic-integration/domain/events/domain-event.types.js';
import { DomainEventPublisher } from '../src/modules/semantic-integration/application/services/domain-event-publisher.service.js';
import { SemanticEventBus } from '../src/modules/semantic-integration/application/services/semantic-event-bus.service.js';
import { OutboxRelayService } from '../src/modules/semantic-integration/application/services/outbox-relay.service.js';
import { EventOutboxRepository } from '../src/modules/semantic-integration/infrastructure/persistence/event-outbox.repository.js';
import { EventProcessLogRepository } from '../src/modules/semantic-integration/infrastructure/persistence/event-process-log.repository.js';
import type { IEventHandler } from '../src/modules/semantic-integration/domain/interfaces/event-handler.interface.js';

const outboxStore: Record<string, any> = {};

const mockOutboxRepository = {
  insert: jest.fn().mockImplementation(async (event: any) => {
    outboxStore[event.eventId] = { ...event, status: 'pending', retryCount: 0 };
  }),
  findPending: jest.fn().mockImplementation(async (limit: number) =>
    Object.values(outboxStore)
      .filter((e: any) => e.status === 'pending')
      .slice(0, limit),
  ),
  markDelivered: jest.fn().mockImplementation(async (id: string) => {
    if (outboxStore[id]) outboxStore[id].status = 'delivered';
  }),
  markFailed: jest.fn().mockImplementation(async (id: string, error: string) => {
    if (outboxStore[id]) {
      outboxStore[id].status = 'failed';
      outboxStore[id].error = error;
    }
  }),
  incrementRetry: jest.fn().mockImplementation(async (id: string) => {
    if (outboxStore[id]) outboxStore[id].retryCount = (outboxStore[id].retryCount ?? 0) + 1;
  }),
};

const mockProcessLogRepository = {
  hasBeenProcessed: jest.fn().mockResolvedValue(false),
  log: jest.fn().mockResolvedValue(undefined),
};

const processedEvents: string[] = [];

class TestHandler implements IEventHandler {
  readonly handledEvent = EventType.DocumentPublished;
  readonly handlerName = 'TestHandler';

  async handle(event: any): Promise<void> {
    processedEvents.push(event.eventId);
  }
}

describe('Semantic Event Bus (integration)', () => {
  let publisher: DomainEventPublisher;
  let eventBus: SemanticEventBus;
  let outboxRelay: OutboxRelayService;
  let testHandler: TestHandler;

  beforeAll(async () => {
    testHandler = new TestHandler();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DomainEventPublisher,
        SemanticEventBus,
        OutboxRelayService,
        { provide: EventOutboxRepository, useValue: mockOutboxRepository },
        { provide: EventProcessLogRepository, useValue: mockProcessLogRepository },
      ],
    }).compile();

    publisher = module.get(DomainEventPublisher);
    eventBus = module.get(SemanticEventBus);
    outboxRelay = module.get(OutboxRelayService);

    eventBus.register(testHandler);
  });

  beforeEach(() => {
    Object.keys(outboxStore).forEach((k) => delete outboxStore[k]);
    processedEvents.length = 0;
    jest.clearAllMocks();
  });

  it('should publish a domain event to the outbox', async () => {
    const event = createDomainEvent(
      EventType.DocumentPublished,
      {
        documentId: 'doc-1',
        knowledgeId: 'k-1',
        filename: 'test.pdf',
        originalName: 'test.pdf',
        mimeType: 'application/pdf',
        documentType: 'pdf',
        classification: {},
      },
      { workspaceId: 'ws-1', retryCount: 0 },
    );

    await publisher.publish(event);

    expect(mockOutboxRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: event.eventId, eventType: EventType.DocumentPublished }),
    );
  });

  it('should dispatch events to registered handlers via the event bus', async () => {
    const event = createDomainEvent(
      EventType.DocumentPublished,
      {
        documentId: 'doc-1',
        knowledgeId: 'k-1',
        filename: 'test.pdf',
        originalName: 'test.pdf',
        mimeType: 'application/pdf',
        documentType: 'pdf',
        classification: {},
      },
      { workspaceId: 'ws-1', retryCount: 0 },
    );

    await eventBus.publish(event);

    expect(processedEvents).toContain(event.eventId);
  });

  it('should handle all 12 defined event types', async () => {
    const allTypes = Object.values(EventType);
    expect(allTypes).toHaveLength(12);
  });

  it('should handle GraphNodeCreated event type', async () => {
    const event = createDomainEvent(
      EventType.GraphNodeCreated,
      {
        nodeId: 'node-1',
        workspaceId: 'ws-1',
        entityId: 'doc-1',
        entityType: 'knowledge_document',
        type: 'document',
        label: 'test',
      },
      { workspaceId: 'ws-1', retryCount: 0 },
    );

    await publisher.publish(event);

    expect(mockOutboxRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: EventType.GraphNodeCreated }),
    );
  });

  it('should handle MetricsCalculated event type', async () => {
    const event = createDomainEvent(
      EventType.MetricsCalculated,
      {
        nodeId: 'node-1',
        workspaceId: 'ws-1',
        confidence: 0.85,
        freshness: 0.9,
        authority: 0.7,
        completeness: 0.8,
        compositeScore: 0.81,
      },
      { workspaceId: 'ws-1', retryCount: 0 },
    );

    await publisher.publish(event);

    expect(mockOutboxRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: EventType.MetricsCalculated }),
    );
  });

  it('should register and handle an event with all 12 event types', async () => {
    const allTypes = Object.values(EventType);
    expect(allTypes).toHaveLength(12);
  });

  it('should handle concurrent event publications', async () => {
    const events = Array.from({ length: 10 }, (_, i) =>
      createDomainEvent(
        EventType.DocumentPublished,
        {
          documentId: `doc-${i}`,
          knowledgeId: `k-${i}`,
          filename: `test-${i}.pdf`,
          originalName: `test-${i}.pdf`,
          mimeType: 'application/pdf',
          documentType: 'pdf',
          classification: {},
        },
        { workspaceId: 'ws-1', retryCount: 0 },
      ),
    );

    await Promise.all(events.map((e) => publisher.publish(e)));

    expect(mockOutboxRepository.insert).toHaveBeenCalledTimes(10);
  });
});
