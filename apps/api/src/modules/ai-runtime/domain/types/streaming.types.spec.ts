import { StreamChunk } from './streaming.types';

describe('StreamChunk', () => {
  it('should create a token chunk', () => {
    const chunk = StreamChunk.token('hello');
    expect(chunk.type).toBe('token');
    expect(chunk.data).toBe('hello');
  });

  it('should create a done chunk', () => {
    const chunk = StreamChunk.done();
    expect(chunk.type).toBe('done');
  });

  it('should create an error chunk', () => {
    const chunk = StreamChunk.error('test error');
    expect(chunk.type).toBe('error');
    expect(chunk.metadata).toEqual({ message: 'test error' });
  });

  it('should create a tool call chunk', () => {
    const chunk = StreamChunk.toolCall('calculator', '{"a":1}');
    expect(chunk.type).toBe('tool_call');
    expect(chunk.metadata.toolName).toBe('calculator');
  });
});
