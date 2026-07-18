import { Injectable } from '@nestjs/common';
import type { ExecutionContext } from '../../domain/types/execution.types.js';

interface ContextMessage {
  role: string;
  content: string;
  tokenCount?: number;
}

const DEFAULT_MAX_TOKENS = 4000;
const TOKEN_ESTIMATE_RATIO = 0.45;

@Injectable()
export class ConversationContextManagerService {
  buildContext(
    input: string,
    history: ContextMessage[],
    maxTokens: number = DEFAULT_MAX_TOKENS,
  ): { messages: ContextMessage[]; totalTokens: number } {
    const systemMessages = history.filter((m) => m.role === 'system');
    const nonSystemMessages = history.filter((m) => m.role !== 'system');

    const systemTokenCount = this._estimateTokens(systemMessages);
    const inputTokens = this._estimateTokenCount(input);

    let available = maxTokens - systemTokenCount - inputTokens - 50;
    const selected: ContextMessage[] = [];

    for (let i = nonSystemMessages.length - 1; i >= 0; i--) {
      const msg = nonSystemMessages[i]!;
      const tokens = this._estimateTokenCount(msg.content);
      if (tokens <= available) {
        selected.unshift(msg);
        available -= tokens;
      } else {
        break;
      }
    }

    const messages = [...systemMessages, ...selected];
    const totalTokens = this._estimateTokens(messages) + inputTokens;

    return { messages, totalTokens };
  }

  prepareExecutionContext(
    input: string,
    history: { role: string; content: string }[],
    context: ExecutionContext,
  ): ExecutionContext {
    const { messages } = this.buildContext(input, history);
    context.contextMessages = messages;
    context.stage = 'tool_resolve';
    return context;
  }

  private _estimateTokenCount(text: string): number {
    return Math.ceil(text.length * TOKEN_ESTIMATE_RATIO);
  }

  private _estimateTokens(messages: ContextMessage[]): number {
    return messages.reduce((sum, m) => {
      return sum + this._estimateTokenCount(m.content) + 4;
    }, 0);
  }
}
