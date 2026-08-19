import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IGraphMetricsRepository } from '../../../knowledge-intelligence/domain/interfaces/graph-metrics.repository.interface.js';
import type { IGraphNodeRepository } from '../../../knowledge-intelligence/domain/interfaces/graph-node.repository.interface.js';
import { KnowledgeAuthorityService } from '../../../knowledge-intelligence/application/services/knowledge-authority.service.js';
import { KnowledgeCompletenessService } from '../../../knowledge-intelligence/application/services/knowledge-completeness.service.js';
import { KnowledgeConfidenceService } from '../../../knowledge-intelligence/application/services/knowledge-confidence.service.js';
import { KnowledgeFreshnessService } from '../../../knowledge-intelligence/application/services/knowledge-freshness.service.js';
import { EventProcessLogRepository } from '../../infrastructure/persistence/event-process-log.repository.js';
import {
  EventType,
  type DomainEvent,
  type KnowledgeArticlePublishedPayload,
} from '../../domain/events/domain-event.types.js';
import type { IEventHandler } from '../../domain/interfaces/event-handler.interface.js';

/** Projects a published Knowledge article into the active semantic graph. */
@Injectable()
export class KnowledgeArticlePublishedHandler implements IEventHandler {
  readonly handledEvent = EventType.KnowledgeArticlePublished;
  private readonly logger = new Logger(KnowledgeArticlePublishedHandler.name);
  private readonly handlerName = KnowledgeArticlePublishedHandler.name;

  constructor(
    @Inject('IGraphNodeRepository')
    private readonly graphNodeRepository: IGraphNodeRepository,
    @Inject('IGraphMetricsRepository')
    private readonly graphMetricsRepository: IGraphMetricsRepository,
    private readonly confidenceService: KnowledgeConfidenceService,
    private readonly freshnessService: KnowledgeFreshnessService,
    private readonly authorityService: KnowledgeAuthorityService,
    private readonly completenessService: KnowledgeCompletenessService,
    private readonly processLogRepository: EventProcessLogRepository,
  ) {}

  async handle(event: DomainEvent<KnowledgeArticlePublishedPayload>): Promise<void> {
    if (await this.processLogRepository.hasBeenProcessed(event.eventId, this.handlerName)) {
      this.logger.debug(`Event ${event.eventId} was already processed`);
      return;
    }

    const startedAt = Date.now();

    try {
      const data = event.data;
      if (data.workspaceId !== event.metadata.workspaceId) {
        throw new Error('Knowledge article event workspace does not match its metadata');
      }

      const properties: Record<string, unknown> = {
        slug: data.slug,
        language: data.language,
        visibility: data.visibility,
        version: data.version,
        readingTime: data.readingTime,
        difficulty: data.difficulty,
        authorId: data.authorId,
        publishedAt: data.publishedAt,
        contentProperties: data.contentProperties,
      };

<<<<<<< ours
      const existing = await this.graphNodeRepository.findByEntity('knowledge', data.articleId);
=======
      const existing = await this.graphNodeRepository.findByEntity(
        'knowledge',
        data.articleId,
        data.workspaceId,
      );
>>>>>>> theirs
      if (existing && existing.workspaceId !== data.workspaceId) {
        throw new Error('Existing knowledge graph node belongs to another workspace');
      }

      const node = existing
        ? await this.graphNodeRepository.update(existing.id, {
            label: data.title,
            properties: { ...existing.properties, ...properties },
          })
        : await this.graphNodeRepository.create({
            workspaceId: data.workspaceId,
            type: 'document',
            entityType: 'knowledge',
            entityId: data.articleId,
            label: data.title,
            properties,
          });

      const confidence = await this.confidenceService.calculateConfidence(node.id);
      const freshness = await this.freshnessService.calculateFreshness(node.id);
      const authority = await this.authorityService.calculateAuthority(node.id);
      const completeness = await this.completenessService.calculateCompleteness(node.id);

      await this.graphMetricsRepository.save({
        nodeId: node.id,
        confidence,
        freshness,
        authority,
        completeness,
      });

      await this.processLogRepository.log({
        eventId: event.eventId,
        eventType: event.eventType,
        handlerName: this.handlerName,
        status: 'completed',
        durationMs: Date.now() - startedAt,
      });

      this.logger.log(`Projected Knowledge article ${data.articleId} to graph node ${node.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await this.processLogRepository.log({
        eventId: event.eventId,
        eventType: event.eventType,
        handlerName: this.handlerName,
        status: 'failed',
        errorMessage: message,
        durationMs: Date.now() - startedAt,
      });
      this.logger.error(`Failed to project event ${event.eventId}: ${message}`);
      throw error;
    }
  }
}
