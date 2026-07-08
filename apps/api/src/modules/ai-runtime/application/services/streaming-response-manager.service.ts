import { Injectable, Logger } from '@nestjs/common';
import type { IStreamingHandler } from '../../domain/interfaces/streaming-handler.interface.js';
import { StreamChunk } from '../../domain/types/streaming.types.js';
import type { StreamEventType } from '../../domain/types/streaming.types.js';
import { SseStreamingHandler } from '../../infrastructure/streaming/sse-streaming.handler.js';

@Injectable()
export class StreamingResponseManagerService {
  private readonly logger = new Logger(StreamingResponseManagerService.name);
  private readonly _handlers = new Map<string, IStreamingHandler>();

  createHandler(
    streamId: string,
    write: (data: string) => void,
    close: () => void,
  ): IStreamingHandler {
    const handler = new SseStreamingHandler(write, close);
    this._handlers.set(streamId, handler);
    return handler;
  }

  getHandler(streamId: string): IStreamingHandler | null {
    return this._handlers.get(streamId) ?? null;
  }

  async sendToken(
    streamId: string,
    token: string,
  ): Promise<void> {
    const handler = this._handlers.get(streamId);
    if (handler) {
      await handler.onChunk(StreamChunk.token(token));
    }
  }

  async sendEvent(
    streamId: string,
    type: StreamEventType,
    data: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const handler = this._handlers.get(streamId);
    if (handler) {
      await handler.onChunk(new StreamChunk(type, data, metadata));
    }
  }

  async endStream(streamId: string): Promise<void> {
    const handler = this._handlers.get(streamId);
    if (handler) {
      await handler.onChunk(StreamChunk.done());
      this._handlers.delete(streamId);
    }
  }

  async errorStream(streamId: string, error: Error): Promise<void> {
    const handler = this._handlers.get(streamId);
    if (handler) {
      await handler.onError(error);
      this._handlers.delete(streamId);
    }
  }

  async streamResponse(
    streamId: string,
    response: string,
    delayMs = 15,
  ): Promise<void> {
    const words = response.split(' ');
    for (const word of words) {
      await this.sendToken(streamId, word + ' ');
      await new Promise(r => setTimeout(r, delayMs));
    }
    await this.endStream(streamId);
  }
}
