import { Injectable, Logger } from '@nestjs/common';
import { MemoryAbstractionService } from '../../../ai-runtime/application/services/memory-abstraction.service.js';
import { PromptRegistryService } from '../../../ai-runtime/application/services/prompt-registry.service.js';
import { EventProcessLogRepository } from '../../infrastructure/persistence/event-process-log.repository.js';
import type { DomainEvent } from '../../domain/events/domain-event.types.js';
import { EventType } from '../../domain/events/domain-event.types.js';
import type { IEventHandler } from '../../domain/interfaces/event-handler.interface.js';

@Injectable()
export class CacheInvalidationHandler implements IEventHandler {
  readonly handledEvent = EventType.DocumentPublished;
  private readonly logger = new Logger(CacheInvalidationHandler.name);
  private readonly HANDLER_NAME = 'CacheInvalidationHandler';

  constructor(
    private readonly memoryService: MemoryAbstractionService,
    private readonly promptService: PromptRegistryService,
    private readonly processLogRepository: EventProcessLogRepository,
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    if (await this.processLogRepository.hasBeenProcessed(event.eventId, this.HANDLER_NAME)) {
      return;
    }

    const startTime = Date.now();

    try {
      this.logger.log(`Invalidating AI Runtime caches after ${event.eventType}:${event.eventId}`);

      const errors: string[] = [];

      try {
        await this.memoryService.clearSession('*');
      } catch {
        errors.push('memory-clear');
      }

      try {
        await this.promptService.remove('*');
      } catch {
        errors.push('prompt-remove');
      }

      await this.processLogRepository.log({
        eventId: event.eventId,
        eventType: event.eventType,
        handlerName: this.HANDLER_NAME,
        status: 'completed',
        durationMs: Date.now() - startTime,
      });

      if (errors.length > 0) {
        this.logger.warn(`Cache invalidation partial: ${errors.join(', ')}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`CacheInvalidationHandler failed: ${message}`);

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
