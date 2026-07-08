import { ExecutionContext, ExecutionResult } from './execution.types';

describe('ExecutionContext', () => {
  it('should create with default values', () => {
    const ctx = new ExecutionContext('conv-1', 'ws-1', 'user-1', 'agent-1', 'hello');
    expect(ctx.conversationId).toBe('conv-1');
    expect(ctx.stage).toBe('context_build');
    expect(ctx.contextMessages).toEqual([]);
  });
});

describe('ExecutionResult', () => {
  it('should create a successful result', () => {
    const ctx = new ExecutionContext('conv-1', 'ws-1', 'user-1', 'agent-1', 'hello');
    const result = new ExecutionResult(
      true,
      'output',
      null,
      [{ stage: 'llm_call', durationMs: 100 }],
      100,
      ctx,
    );
    expect(result.success).toBe(true);
    expect(result.output).toBe('output');
  });
});
