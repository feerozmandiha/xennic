import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';

@Injectable()
export class EventProcessLogRepository {
  async log(params: {
    eventId: string;
    eventType: string;
    handlerName: string;
    status: 'completed' | 'failed';
    errorMessage?: string;
    durationMs?: number;
  }): Promise<void> {
    await prisma.event_process_log.upsert({
      where: {
        event_id_handler_name: { event_id: params.eventId, handler_name: params.handlerName },
      },
      update: {
        status: params.status,
        error_message: params.errorMessage ?? null,
        duration_ms: params.durationMs ?? null,
        processed_at: new Date(),
      },
      create: {
        event_id: params.eventId,
        event_type: params.eventType,
        handler_name: params.handlerName,
        status: params.status,
        error_message: params.errorMessage ?? null,
        duration_ms: params.durationMs ?? null,
      },
    });
  }

  async hasBeenProcessed(eventId: string, handlerName: string): Promise<boolean> {
    const row = await prisma.event_process_log.findUnique({
      where: { event_id_handler_name: { event_id: eventId, handler_name: handlerName } },
    });
    return row?.status === 'completed';
  }
}
