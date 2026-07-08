export type SessionStatus = 'idle' | 'processing' | 'responding' | 'error' | 'expired';

export const VALID_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  idle:       ['processing'],
  processing: ['responding', 'error'],
  responding: ['idle', 'error'],
  error:      ['idle', 'expired'],
  expired:    [],
};

export class AgentSession {
  constructor(
    public readonly id: string,
    public readonly agentId: string,
    public readonly workspaceId: string,
    public readonly userId: string,
    public status: SessionStatus,
    public readonly createdAt: Date,
    public expiresAt: Date,
    public metadata: Record<string, unknown> = {},
  ) {}

  static create(
    agentId: string,
    workspaceId: string,
    userId: string,
    ttlMs = 3_600_000,
  ): AgentSession {
    const now = new Date();
    return new AgentSession(
      crypto.randomUUID(),
      agentId,
      workspaceId,
      userId,
      'idle',
      now,
      new Date(now.getTime() + ttlMs),
      {},
    );
  }

  isExpired(): boolean {
    return Date.now() > this.expiresAt.getTime();
  }

  canTransitionTo(target: SessionStatus): boolean {
    return VALID_TRANSITIONS[this.status]?.includes(target) ?? false;
  }

  transition(target: SessionStatus): void {
    if (!this.canTransitionTo(target)) {
      throw new Error(
        `Invalid session transition: ${this.status} → ${target}`,
      );
    }
    this.status = target;
  }
}
