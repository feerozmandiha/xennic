import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IGraphNodeRepository } from '../../../knowledge-intelligence/domain/interfaces/graph-node.repository.interface.js';
import { EventProcessLogRepository } from '../../infrastructure/persistence/event-process-log.repository.js';
import {
  EventType,
  type DomainEvent,
  type KnowledgeArticleArchivedPayload,
} from '../../domain/events/domain-event.types.js';
import type { IEventHandler } from '../../domain/interfaces/event-handler.interface.js';

/** Removes archived Knowledge articles from the active semantic graph. */
@Injectable()
export class KnowledgeArticleArchivedHandler implements IEventHandler {
  readonly handledEvent = EventType.KnowledgeArticleArchived;
  private readonly logger = new Logger(KnowledgeArticleArchivedHandler.name);
  private readonly handlerName = KnowledgeArticleArchivedHandler.name;

  constructor(
    @Inject('IGraphNodeRepository')
    private readonly graphNodeRepository: IGraphNodeRepository,
    private readonly processLogRepository: EventProcessLogRepository,
  ) {}

  async handle(event: DomainEvent<KnowledgeArticleArchivedPayload>): Promise<void> {
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

      const existing = await this.graphNodeRepository.findByEntity('knowledge', data.articleId);
      if (existing && existing.workspaceId !== data.workspaceId) {
        throw new Error('Existing knowledge graph node belongs to another workspace');
      }

      if (existing) {
        await this.graphNodeRepository.deleteByEntity('knowledge', data.articleId);
      }

      await this.processLogRepository.log({
        eventId: event.eventId,
        eventType: event.eventType,
        handlerName: this.handlerName,
        status: 'completed',
        durationMs: Date.now() - startedAt,
      });

      this.logger.log(`Removed archived Knowledge article ${data.articleId} from the graph`);
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
      this.logger.error(
        `Failed to archive graph projection for event ${event.eventId}: ${message}`,
      );
      throw error;
    }
  }
}
