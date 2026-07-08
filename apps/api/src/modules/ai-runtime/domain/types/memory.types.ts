export type MemoryType = 'message' | 'summary' | 'fact' | 'preference';

export class MemoryEntry {
  constructor(
    public readonly id: string,
    public readonly sessionId: string,
    public readonly type: MemoryType,
    public readonly content: string,
    public readonly metadata: Record<string, unknown> = {},
    public readonly createdAt: Date = new Date(),
    public readonly score: number = 1.0,
  ) {}

  static create(
    sessionId: string,
    type: MemoryType,
    content: string,
    metadata?: Record<string, unknown>,
  ): MemoryEntry {
    return new MemoryEntry(
      crypto.randomUUID(),
      sessionId,
      type,
      content,
      metadata ?? {},
      new Date(),
      1.0,
    );
  }
}

export interface MemoryQuery {
  sessionId?: string;
  types?: MemoryType[];
  limit?: number;
  offset?: number;
  minScore?: number;
}
