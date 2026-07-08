import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { EventOutboxRepository } from '../../infrastructure/persistence/event-outbox.repository.js';
import { EventProcessLogRepository } from '../../infrastructure/persistence/event-process-log.repository.js';
import { SemanticEventBus } from './semantic-event-bus.service.js';
import { EventType, type DomainEvent } from '../../domain/events/domain-event.types.js';
import { OUTBOX_POLL_INTERVAL_MS, OUTBOX_BATCH_SIZE } from '../../semantic-integration.constants.js';

@Injectable()
export class OutboxRelayService implements OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelayService.name);
  private _timer: ReturnType<typeof setInterval> | null = null;
  private _isProcessing = false;

  constructor(
    private readonly outboxRepository: EventOutboxRepository,
    private readonly processLogRepository: EventProcessLogRepository,
    private readonly eventBus: SemanticEventBus,
  ) {}

  start(): void {
    if (this._timer) return;
    this.logger.log(`Starting outbox relay (poll every ${OUTBOX_POLL_INTERVAL_MS}ms)`);
    this._timer = setInterval(() => this.poll(), OUTBOX_POLL_INTERVAL_MS);
  }

  stop(): void {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  onModuleDestroy(): void {
    this.stop();
  }

  private async poll(): Promise<void> {
    if (this._isProcessing) return;
    this._isProcessing = true;

    try {
      const rows = await this.outboxRepository.findPending(OUTBOX_BATCH_SIZE);
      if (rows.length === 0) return;

      this.logger.debug(`Processing ${rows.length} pending outbox events`);

      for (const row of rows) {
        const startTime = Date.now();

        try {
          const event = this._reconstituteEvent(row);
          await this.eventBus.publish(event);
          await this.outboxRepository.markDelivered(row.id);

          await this.processLogRepository.log({
            eventId: row.eventId,
            eventType: row.eventType,
            handlerName: 'outbox-relay',
            status: 'completed',
            durationMs: Date.now() - startTime,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`Failed to process outbox event ${row.id}: ${message}`);
          await this.outboxRepository.markFailed(row.id, message);

          await this.processLogRepository.log({
            eventId: row.eventId,
            eventType: row.eventType,
            handlerName: 'outbox-relay',
            status: 'failed',
            errorMessage: message,
            durationMs: Date.now() - startTime,
          });
        }
      }
    } finally {
      this._isProcessing = false;
    }
  }

  private _reconstituteEvent(row: {
    eventId: string;
    eventType: string;
    eventVersion: number;
    correlationId: string;
    causationId: string;
    tracingId: string;
    source: string;
    payload: unknown;
    metadata: Record<string, unknown>;
    workspaceId: string;
  }): DomainEvent {
    return Object.freeze({
      eventId: row.eventId,
      eventType: row.eventType as EventType,
      eventVersion: row.eventVersion,
      correlationId: row.correlationId,
      causationId: row.causationId,
      tracingId: row.tracingId,
      timestamp: new Date().toISOString(),
      source: row.source,
      data: row.payload,
      metadata: {
        workspaceId: row.workspaceId,
        userId: (row.metadata as any)?.userId ?? undefined,
        retryCount: (row.metadata as any)?.retryCount ?? 0,
      },
    }) as unknown as DomainEvent;
  }
}
