import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';

export interface OutboxRow {
  id: string;
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
  status: 'pending' | 'delivered' | 'failed' | 'dead_letter';
  retryCount: number;
  maxRetries: number;
  lastError: string | null;
  createdAt: Date;
  lastAttemptAt: Date | null;
}

@Injectable()
export class EventOutboxRepository {
  private readonly logger = new Logger(EventOutboxRepository.name);

  async insert(event: {
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
    maxRetries?: number;
  }): Promise<void> {
    await prisma.event_outbox.create({
      data: {
        event_id: event.eventId,
        event_type: event.eventType,
        event_version: event.eventVersion,
        correlation_id: event.correlationId,
        causation_id: event.causationId,
        tracing_id: event.tracingId,
        source: event.source,
        payload: event.payload as Record<string, unknown>,
        metadata: event.metadata as Record<string, unknown>,
        workspace_id: event.workspaceId,
        max_retries: event.maxRetries ?? 3,
      },
    });
  }

  async findPending(batchSize: number): Promise<OutboxRow[]> {
    const rows = await prisma.event_outbox.findMany({
      where: { status: 'pending' },
      orderBy: { created_at: 'asc' },
      take: batchSize,
    });
    return rows.map(this._mapRow);
  }

  async markDelivered(id: string): Promise<void> {
    await prisma.event_outbox.update({
      where: { id },
      data: { status: 'delivered', last_attempt_at: new Date() },
    });
  }

  async markFailed(id: string, error: string): Promise<void> {
    const row = await prisma.event_outbox.findUnique({ where: { id } });
    if (!row) return;

    const newRetryCount = row.retry_count + 1;
    const isDeadLetter = newRetryCount >= row.max_retries;

    await prisma.event_outbox.update({
      where: { id },
      data: {
        status: isDeadLetter ? 'dead_letter' : 'pending',
        retry_count: newRetryCount,
        last_error: error,
        last_attempt_at: new Date(),
      },
    });
  }

  async findDelivered(params: {
    eventType?: string;
    workspaceId?: string;
    correlationId?: string;
    limit?: number;
  }): Promise<OutboxRow[]> {
    const where: Record<string, unknown> = { status: 'delivered' };
    if (params.eventType) where.event_type = params.eventType;
    if (params.workspaceId) where.workspace_id = params.workspaceId;
    if (params.correlationId) where.correlation_id = params.correlationId;

    const rows = await prisma.event_outbox.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: params.limit ?? 100,
    });
    return rows.map(this._mapRow);
  }

  private _mapRow(row: any): OutboxRow {
    return {
      id: row.id,
      eventId: row.event_id,
      eventType: row.event_type,
      eventVersion: row.event_version,
      correlationId: row.correlation_id,
      causationId: row.causation_id,
      tracingId: row.tracing_id,
      source: row.source,
      payload: row.payload,
      metadata: typeof row.metadata === 'object' ? row.metadata : {},
      workspaceId: row.workspace_id,
      status: row.status,
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
      lastError: row.last_error,
      createdAt: row.created_at,
      lastAttemptAt: row.last_attempt_at,
    };
  }
}
