import { randomUUID } from 'node:crypto';

export interface HistoryEvent {
  id: string;
  type: string;
  timestamp: Date;
  data: Record<string, unknown>;
  actor: string | null;
}

export interface CreateExecutionHistoryOptions {
  workflowExecutionId: string;
  metadata?: Record<string, unknown>;
}

export class ExecutionHistory {
  public readonly id: string;
  public readonly workflowExecutionId: string;
  public readonly events: HistoryEvent[];
  public readonly metadata: Record<string, unknown>;

  private constructor(
    id: string,
    workflowExecutionId: string,
    events: HistoryEvent[],
    metadata: Record<string, unknown>,
  ) {
    this.id = id;
    this.workflowExecutionId = workflowExecutionId;
    this.events = events;
    this.metadata = metadata;
  }

  static create(opts: CreateExecutionHistoryOptions): ExecutionHistory {
    return new ExecutionHistory(randomUUID(), opts.workflowExecutionId, [], opts.metadata ?? {});
  }

  static reconstitute(
    id: string,
    workflowExecutionId: string,
    events: HistoryEvent[],
    metadata: Record<string, unknown>,
  ): ExecutionHistory {
    return new ExecutionHistory(id, workflowExecutionId, events, metadata);
  }

  record(event: Omit<HistoryEvent, 'id' | 'timestamp'>): HistoryEvent {
    const newEvent: HistoryEvent = {
      id: randomUUID(),
      type: event.type,
      timestamp: new Date(),
      data: event.data,
      actor: event.actor,
    };
    this.events.push(newEvent);
    return newEvent;
  }

  findByType(type: string): HistoryEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  getTimeline(): HistoryEvent[] {
    return [...this.events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}
