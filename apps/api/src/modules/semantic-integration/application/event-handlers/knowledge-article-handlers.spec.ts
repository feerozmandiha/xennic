jest.mock('@xennic/database', () => ({ prisma: {} }), { virtual: true });

import { createDomainEvent, EventType } from '../../domain/events/domain-event.types.js';
import { KnowledgeArticleArchivedHandler } from './knowledge-article-archived.handler.js';
import { KnowledgeArticlePublishedHandler } from './knowledge-article-published.handler.js';

const WORKSPACE_ID = 'workspace-1';
const ARTICLE_ID = 'article-1';
const NODE_ID = 'node-1';

const publishedEvent = () =>
  createDomainEvent(
    EventType.KnowledgeArticlePublished,
    {
      articleId: ARTICLE_ID,
      workspaceId: WORKSPACE_ID,
      slug: 'article-one',
      title: 'Article one',
      language: 'fa',
      visibility: 'workspace',
      version: 2,
      readingTime: 4,
      difficulty: 'beginner',
      authorId: 'user-1',
      publishedAt: new Date().toISOString(),
      contentProperties: ['title', 'doc'],
    },
    { workspaceId: WORKSPACE_ID, retryCount: 0 },
  );

const archivedEvent = () =>
  createDomainEvent(
    EventType.KnowledgeArticleArchived,
    {
      articleId: ARTICLE_ID,
      workspaceId: WORKSPACE_ID,
      archivedAt: new Date().toISOString(),
    },
    { workspaceId: WORKSPACE_ID, retryCount: 0 },
  );

describe('Knowledge article semantic event handlers', () => {
  describe('KnowledgeArticlePublishedHandler', () => {
    const node = {
      id: NODE_ID,
      workspaceId: WORKSPACE_ID,
      properties: {},
    };
    const nodeRepository = {
      findByEntity: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    const metricsRepository = { save: jest.fn() };
    const confidenceService = { calculateConfidence: jest.fn() };
    const freshnessService = { calculateFreshness: jest.fn() };
    const authorityService = { calculateAuthority: jest.fn() };
    const completenessService = { calculateCompleteness: jest.fn() };
    const processLogRepository = {
      hasBeenProcessed: jest.fn(),
      log: jest.fn(),
    };

    const createHandler = () =>
      new KnowledgeArticlePublishedHandler(
        nodeRepository as any,
        metricsRepository as any,
        confidenceService as any,
        freshnessService as any,
        authorityService as any,
        completenessService as any,
        processLogRepository as any,
      );

    beforeEach(() => {
      jest.clearAllMocks();
      processLogRepository.hasBeenProcessed.mockResolvedValue(false);
      nodeRepository.findByEntity.mockResolvedValue(null);
      nodeRepository.create.mockResolvedValue(node);
      confidenceService.calculateConfidence.mockResolvedValue(0.7);
      freshnessService.calculateFreshness.mockResolvedValue(1);
      authorityService.calculateAuthority.mockResolvedValue(0.6);
      completenessService.calculateCompleteness.mockResolvedValue(0.8);
      metricsRepository.save.mockResolvedValue(undefined);
      processLogRepository.log.mockResolvedValue(undefined);
    });

    it('creates the Knowledge graph projection and computes all metrics', async () => {
      const event = publishedEvent();

      await createHandler().handle(event);

      expect(nodeRepository.findByEntity).toHaveBeenCalledWith('knowledge', ARTICLE_ID);
      expect(nodeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: WORKSPACE_ID,
          entityType: 'knowledge',
          entityId: ARTICLE_ID,
          type: 'document',
          label: 'Article one',
        }),
      );
      expect(metricsRepository.save).toHaveBeenCalledWith({
        nodeId: NODE_ID,
        confidence: 0.7,
        freshness: 1,
        authority: 0.6,
        completeness: 0.8,
      });
      expect(processLogRepository.log).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: event.eventId,
          handlerName: 'KnowledgeArticlePublishedHandler',
          status: 'completed',
        }),
      );
    });

    it('does not process an event twice', async () => {
      processLogRepository.hasBeenProcessed.mockResolvedValue(true);

      await createHandler().handle(publishedEvent());

      expect(nodeRepository.findByEntity).not.toHaveBeenCalled();
      expect(metricsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('KnowledgeArticleArchivedHandler', () => {
    const nodeRepository = {
      findByEntity: jest.fn(),
      deleteByEntity: jest.fn(),
    };
    const processLogRepository = {
      hasBeenProcessed: jest.fn(),
      log: jest.fn(),
    };

    const createHandler = () =>
      new KnowledgeArticleArchivedHandler(nodeRepository as any, processLogRepository as any);

    beforeEach(() => {
      jest.clearAllMocks();
      processLogRepository.hasBeenProcessed.mockResolvedValue(false);
      processLogRepository.log.mockResolvedValue(undefined);
      nodeRepository.findByEntity.mockResolvedValue({
        id: NODE_ID,
        workspaceId: WORKSPACE_ID,
      });
      nodeRepository.deleteByEntity.mockResolvedValue(undefined);
    });

    it('removes the active graph projection for an archived article', async () => {
      const event = archivedEvent();

      await createHandler().handle(event);

      expect(nodeRepository.deleteByEntity).toHaveBeenCalledWith('knowledge', ARTICLE_ID);
      expect(processLogRepository.log).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: event.eventId,
          handlerName: 'KnowledgeArticleArchivedHandler',
          status: 'completed',
        }),
      );
    });

    it('is idempotent when the projection has already been removed', async () => {
      nodeRepository.findByEntity.mockResolvedValue(null);

      await createHandler().handle(archivedEvent());

      expect(nodeRepository.deleteByEntity).not.toHaveBeenCalled();
      expect(processLogRepository.log).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'completed' }),
      );
    });
  });
});
