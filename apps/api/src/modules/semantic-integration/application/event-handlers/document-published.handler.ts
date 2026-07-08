import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IGraphNodeRepository } from '../../../knowledge-intelligence/domain/interfaces/graph-node.repository.interface.js';
import type { IGraphEdgeRepository } from '../../../knowledge-intelligence/domain/interfaces/graph-edge.repository.interface.js';
import type { IGraphMetricsRepository } from '../../../knowledge-intelligence/domain/interfaces/graph-metrics.repository.interface.js';
import { KnowledgeConfidenceService } from '../../../knowledge-intelligence/application/services/knowledge-confidence.service.js';
import { KnowledgeFreshnessService } from '../../../knowledge-intelligence/application/services/knowledge-freshness.service.js';
import { KnowledgeAuthorityService } from '../../../knowledge-intelligence/application/services/knowledge-authority.service.js';
import { KnowledgeCompletenessService } from '../../../knowledge-intelligence/application/services/knowledge-completeness.service.js';
import { DomainEventPublisher } from '../services/domain-event-publisher.service.js';
import { EventProcessLogRepository } from '../../infrastructure/persistence/event-process-log.repository.js';
import type { DomainEvent } from '../../domain/events/domain-event.types.js';
import { EventType, createDomainEvent } from '../../domain/events/domain-event.types.js';
import type { IEventHandler } from '../../domain/interfaces/event-handler.interface.js';

@Injectable()
export class DocumentPublishedHandler implements IEventHandler {
  readonly handledEvent = EventType.DocumentPublished;
  private readonly logger = new Logger(DocumentPublishedHandler.name);
  private readonly HANDLER_NAME = 'DocumentPublishedHandler';

  constructor(
    @Inject('IGraphNodeRepository')
    private readonly graphNodeRepository: IGraphNodeRepository,
    @Inject('IGraphEdgeRepository')
    private readonly graphEdgeRepository: IGraphEdgeRepository,
    @Inject('IGraphMetricsRepository')
    private readonly graphMetricsRepository: IGraphMetricsRepository,
    private readonly confidenceService: KnowledgeConfidenceService,
    private readonly freshnessService: KnowledgeFreshnessService,
    private readonly authorityService: KnowledgeAuthorityService,
    private readonly completenessService: KnowledgeCompletenessService,
    private readonly eventPublisher: DomainEventPublisher,
    private readonly processLogRepository: EventProcessLogRepository,
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    const { workspaceId } = event.metadata;
    const data = event.data as {
      documentId: string;
      knowledgeId: string;
      filename: string;
      originalName: string;
      mimeType: string;
      documentType: string;
      classification: Record<string, unknown>;
    };

    if (await this.processLogRepository.hasBeenProcessed(event.eventId, this.HANDLER_NAME)) {
      this.logger.debug(`Event ${event.eventId} already processed by ${this.HANDLER_NAME}`);
      return;
    }

    const startTime = Date.now();

    try {
      this.logger.log(`Processing DocumentPublished for ${data.documentId}`);

      const existingNode = await this.graphNodeRepository.findByEntity('knowledge_document', data.documentId);
      let nodeId: string;

      if (existingNode) {
        nodeId = existingNode.id;
        this.logger.log(`Graph node already exists for document ${data.documentId}: ${nodeId}`);
      } else {
        const graphNode = await this.graphNodeRepository.create({
          workspaceId,
          type: 'document',
          entityType: 'knowledge_document',
          entityId: data.documentId,
          label: data.originalName ?? data.filename,
          properties: {
            knowledgeId: data.knowledgeId,
            mimeType: data.mimeType,
            documentType: data.documentType,
            classification: data.classification,
            publishedAt: new Date().toISOString(),
          },
        });
        nodeId = graphNode.id;
        this.logger.log(`Created graph node ${nodeId} for document ${data.documentId}`);
      }

      const confidence = await this.confidenceService.calculateConfidence(nodeId);
      const freshness = await this.freshnessService.calculateFreshness(nodeId);
      const authority = await this.authorityService.calculateAuthority(nodeId);
      const completeness = await this.completenessService.calculateCompleteness(nodeId);

      await this.graphMetricsRepository.save({
        nodeId,
        confidence,
        freshness,
        authority,
        completeness,
      });

      this.logger.log(`Saved metrics for node ${nodeId}: confidence=${confidence}, freshness=${freshness}, authority=${authority}, completeness=${completeness}`);

      const compositeScore = (confidence + freshness + authority + completeness) / 4;

      const graphNodeEvent = createDomainEvent(
        EventType.GraphNodeCreated,
        {
          nodeId,
          workspaceId,
          entityId: data.documentId,
          entityType: 'knowledge_document',
          type: 'document',
          label: data.originalName ?? data.filename,
        },
        { workspaceId, retryCount: 0 },
        { causationId: event.eventId, tracingId: event.tracingId },
      );
      await this.eventPublisher.publish(graphNodeEvent);

      const metricsEvent = createDomainEvent(
        EventType.MetricsCalculated,
        {
          nodeId,
          workspaceId,
          confidence,
          freshness,
          authority,
          completeness,
          compositeScore,
        },
        { workspaceId, retryCount: 0 },
        { causationId: event.eventId, tracingId: event.tracingId },
      );
      await this.eventPublisher.publish(metricsEvent);

      await this.processLogRepository.log({
        eventId: event.eventId,
        eventType: event.eventType,
        handlerName: this.HANDLER_NAME,
        status: 'completed',
        durationMs: Date.now() - startTime,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`DocumentPublishedHandler failed for ${event.eventId}: ${message}`);

      await this.processLogRepository.log({
        eventId: event.eventId,
        eventType: event.eventType,
        handlerName: this.HANDLER_NAME,
        status: 'failed',
        errorMessage: message,
        durationMs: Date.now() - startTime,
      });

      throw error;
    }
  }
}
