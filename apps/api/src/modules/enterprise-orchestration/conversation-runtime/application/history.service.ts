import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import type { IConversationRepository } from '../domain/conversation-repository.interface.js';
import { ExecutionHistory, type HistoryEvent } from '../domain/execution-history.entity.js';

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);

  constructor(
    @Inject('IConversationRepository')
    private readonly repository: IConversationRepository,
  ) {}

  async recordEvent(
    executionId: string,
    type: string,
    data: Record<string, unknown>,
    actor?: string | null,
  ): Promise<HistoryEvent> {
    let history = await this.repository.getHistory(executionId);
    if (!history) {
      history = ExecutionHistory.create({ workflowExecutionId: executionId });
      await this.repository.saveHistory(history);
    }

    const event = history.record({ type, data, actor: actor ?? null });
    this.logger.debug(`Recorded event ${event.id} of type ${type} for execution ${executionId}`);
    return event;
  }

  async getHistory(executionId: string): Promise<ExecutionHistory | null> {
    const history = await this.repository.getHistory(executionId);
    if (!history) {
      throw new NotFoundException(`History for execution ${executionId} not found`);
    }
    return history;
  }

  async getEventsByType(executionId: string, type: string): Promise<HistoryEvent[]> {
    const history = await this.repository.getHistory(executionId);
    if (!history) {
      return [];
    }
    return history.findByType(type);
  }

  async getTimeline(executionId: string): Promise<HistoryEvent[]> {
    const history = await this.repository.getHistory(executionId);
    if (!history) {
      return [];
    }
    return history.getTimeline();
  }

  async clear(executionId: string): Promise<void> {
    const history = await this.repository.getHistory(executionId);
    if (history) {
      history.events.length = 0;
      await this.repository.saveHistory(history);
      this.logger.log(`Cleared history for execution ${executionId}`);
    }
  }
}
