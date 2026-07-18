export type StreamEventType = 'start' | 'token' | 'tool_call' | 'tool_result' | 'error' | 'done';

export class StreamChunk {
  constructor(
    public readonly type: StreamEventType,
    public readonly data: string,
    public readonly metadata: Record<string, unknown> = {},
    public readonly timestamp: Date = new Date(),
  ) {}

  static token(text: string): StreamChunk {
    return new StreamChunk('token', text);
  }

  static done(): StreamChunk {
    return new StreamChunk('done', '[DONE]');
  }

  static error(message: string): StreamChunk {
    return new StreamChunk('error', '', { message });
  }

  static toolCall(toolName: string, args: string): StreamChunk {
    return new StreamChunk('tool_call', '', { toolName, args });
  }

  static toolResult(toolName: string, result: unknown): StreamChunk {
    return new StreamChunk('tool_result', '', { toolName, result });
  }
}

export type StreamHandler = (chunk: StreamChunk) => void | Promise<void>;
