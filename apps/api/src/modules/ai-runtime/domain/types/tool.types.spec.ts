import { ToolDefinition, ToolResult } from './tool.types';

describe('ToolDefinition', () => {
  it('should create a tool definition', () => {
    const tool = new ToolDefinition(
      'test-tool',
      'A test tool',
      [{ name: 'input', type: 'string', description: 'Input value', required: true }],
      'test-handler',
    );
    expect(tool.name).toBe('test-tool');
    expect(tool.status).toBe('available');
  });
});

describe('ToolResult', () => {
  it('should create a success result', () => {
    const result = new ToolResult('call-1', 'tool-1', 'success', { value: 42 });
    expect(result.status).toBe('success');
    expect(result.output).toEqual({ value: 42 });
  });

  it('should create an error result', () => {
    const result = new ToolResult('call-1', 'tool-1', 'error', null, 'Something broke');
    expect(result.status).toBe('error');
    expect(result.error).toBe('Something broke');
  });
});
