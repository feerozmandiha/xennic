import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type {
  IEventReplayer,
  ReplayRequest,
  ReplayResult,
  ReplayHistoryEntry,
} from '../../domain/interfaces/event-replayer.interface.js';
import type { DomainEventPublisher } from '../../../semantic-integration/application/services/domain-event-publisher.service.js';
import { EventOutboxRepository } from '../../../semantic-integration/infrastructure/persistence/event-outbox.repository.js';

@Injectable()
export class EventReplayService implements IEventReplayer {
  private readonly logger = new Logger(EventReplayService.name);
  private readonly history: ReplayHistoryEntry[] = [];

  constructor(
    private readonly outboxRepository: EventOutboxRepository,
    private readonly publisher: DomainEventPublisher,
  ) {}

  async replay(request: ReplayRequest): Promise<ReplayResult> {
    const replayId = randomUUID();
    this.logger.log(`Starting replay ${replayId}: ${JSON.stringify(request)}`);

    const startTime = Date.now();
    const errors: Array<{ eventId: string; error: string }> = [];
    let replayedCount = 0;

    try {
      const events = await this._fetchEvents(request);

      for (const row of events) {
        try {
          await this.outboxRepository.insert({
            eventId: row.eventId,
            eventType: row.eventType,
            eventVersion: row.eventVersion,
            correlationId: row.correlationId,
            causationId: row.causationId,
            tracingId: row.tracingId,
            source: `replay-${replayId}`,
            payload: row.payload,
            metadata: { ...row.metadata, replayId },
            workspaceId: row.workspaceId,
            maxRetries: 3,
          });
          replayedCount++;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          errors.push({ eventId: row.eventId, error: message });
        }
      }

      this.logger.log(`Replay ${replayId}: ${replayedCount} events reinserted, ${errors.length} failed`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Replay ${replayId} failed: ${message}`);
      errors.push({ eventId: 'replay-error', error: message });
    }

    const durationMs = Date.now() - startTime;

    const result: ReplayResult = {
      replayedCount,
      failedCount: errors.length,
      errors,
      durationMs,
    };

    this.history.push({
      id: replayId,
      request,
      result,
      triggeredBy: request.workspaceId ?? 'system',
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  async getReplayHistory(limit = 20): Promise<ReplayHistoryEntry[]> {
    return this.history.slice(-limit).reverse();
  }

  private async _fetchEvents(request: ReplayRequest) {
    return this.outboxRepository.findDelivered({
      eventType: request.eventType,
      workspaceId: request.workspaceId,
      correlationId: request.correlationId,
      limit: request.maxEvents,
    });
  }
}
