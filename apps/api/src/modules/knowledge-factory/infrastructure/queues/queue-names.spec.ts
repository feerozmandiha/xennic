import { QUEUE_NAMES } from './queue-names.js';

describe('QUEUE_NAMES', () => {
  it('should have all expected queues', () => {
    expect(Object.keys(QUEUE_NAMES)).toEqual([
      'INTAKE',
      'CLASSIFY',
      'PARSE',
      'NORMALIZE',
      'CHUNK',
      'EMBED',
      'PUBLISH',
      'DEAD_LETTER',
    ]);
  });

  it('should have correct queue name values', () => {
    expect(QUEUE_NAMES.INTAKE).toBe('knowledge-factory-intake');
    expect(QUEUE_NAMES.CLASSIFY).toBe('knowledge-factory-classify');
    expect(QUEUE_NAMES.PARSE).toBe('knowledge-factory-parse');
    expect(QUEUE_NAMES.NORMALIZE).toBe('knowledge-factory-normalize');
    expect(QUEUE_NAMES.CHUNK).toBe('knowledge-factory-chunk');
    expect(QUEUE_NAMES.EMBED).toBe('knowledge-factory-embed');
    expect(QUEUE_NAMES.PUBLISH).toBe('knowledge-factory-publish');
    expect(QUEUE_NAMES.DEAD_LETTER).toBe('knowledge-factory-dead-letter');
  });
});
