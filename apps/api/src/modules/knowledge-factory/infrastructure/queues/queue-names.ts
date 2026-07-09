export const QUEUE_NAMES = {
  INTAKE: 'knowledge-factory:intake',
  CLASSIFY: 'knowledge-factory:classify',
  PARSE: 'knowledge-factory:parse',
  NORMALIZE: 'knowledge-factory:normalize',
  CHUNK: 'knowledge-factory:chunk',
  EMBED: 'knowledge-factory:embed',
  PUBLISH: 'knowledge-factory:publish',
  DEAD_LETTER: 'knowledge-factory:dead-letter',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
