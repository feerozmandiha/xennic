export type ConversationStateStatus = 'awaiting_input' | 'processing' | 'completed' | 'error';

export class ConversationState {
  public readonly conversationId: string;
  public currentStep: string | null;
  public state: ConversationStateStatus;
  public readonly accumulatedContext: Record<string, unknown>;
  public turnCount: number;

  constructor(
    conversationId: string,
    currentStep: string | null,
    state: ConversationStateStatus,
    accumulatedContext: Record<string, unknown>,
    turnCount: number,
  ) {
    this.conversationId = conversationId;
    this.currentStep = currentStep;
    this.state = state;
    this.accumulatedContext = accumulatedContext;
    this.turnCount = turnCount;
  }

  static create(conversationId: string): ConversationState {
    return new ConversationState(conversationId, null, 'awaiting_input', {}, 0);
  }

  recordTurn(): void {
    this.turnCount += 1;
  }

  updateContext(key: string, value: unknown): void {
    this.accumulatedContext[key] = value;
  }

  getSummary(): Record<string, unknown> {
    return {
      conversationId: this.conversationId,
      currentStep: this.currentStep,
      state: this.state,
      turnCount: this.turnCount,
      contextKeys: Object.keys(this.accumulatedContext),
    };
  }
}
