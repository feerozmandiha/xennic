import type { StreamChunk } from '../types/streaming.types.js';

export const I_STREAMING_HANDLER = 'IStreamingHandler';

export interface IStreamingHandler {
  onStart(): void | Promise<void>;
  onChunk(chunk: StreamChunk): void | Promise<void>;
  onError(error: Error): void | Promise<void>;
  onDone(): void | Promise<void>;
}
