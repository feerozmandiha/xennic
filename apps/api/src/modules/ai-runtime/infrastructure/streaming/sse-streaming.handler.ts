import type { IStreamingHandler } from '../../domain/interfaces/streaming-handler.interface.js';
import type { StreamChunk } from '../../domain/types/streaming.types.js';

export class SseStreamingHandler implements IStreamingHandler {
  private _closed = false;

  constructor(
    private readonly write: (data: string) => void,
    private readonly close: () => void,
  ) {}

  onStart(): void {
    this._send('event: start\ndata: {"type":"start"}\n\n');
  }

  onChunk(chunk: StreamChunk): void {
    if (this._closed) return;
    const payload = JSON.stringify({
      type: chunk.type,
      data: chunk.data,
      metadata: chunk.metadata,
      timestamp: chunk.timestamp.toISOString(),
    });
    this._send(`event: ${chunk.type}\ndata: ${payload}\n\n`);
  }

  onError(error: Error): void {
    if (this._closed) return;
    const payload = JSON.stringify({
      type: 'error',
      message: error.message,
    });
    this._send(`event: error\ndata: ${payload}\n\n`);
    this._close();
  }

  onDone(): void {
    if (this._closed) return;
    this._send('event: done\ndata: {"type":"done"}\n\n');
    this._close();
  }

  private _send(data: string): void {
    try {
      this.write(data);
    } catch {
      this._closed = true;
    }
  }

  private _close(): void {
    this._closed = true;
    this.close();
  }
}
