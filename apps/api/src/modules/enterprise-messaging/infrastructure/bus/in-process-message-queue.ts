import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type {
  IMessageQueue,
  IMessageHandler,
  MessageEnvelope,
  DeadLetterRecord,
  IDeadLetterQueue,
} from '../../domain/interfaces/message-handler.interface.js';

@Injectable()
export class InProcessMessageQueue implements IMessageQueue, IDeadLetterQueue {
  private readonly logger = new Logger(InProcessMessageQueue.name);
  private readonly handlers = new Map<string, IMessageHandler>();
  private readonly deadLetterStore: DeadLetterRecord[] = [];

  publish<T>(envelope: Omit<MessageEnvelope<T>, 'timestamp' | 'retryCount'>): Promise<void> {
    const message: MessageEnvelope<T> = {
      ...envelope,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    } as MessageEnvelope<T>;

    const handler = this.handlers.get(message.messageType);
    if (!handler) {
      this.logger.warn(`No handler for message type ${message.messageType}, sending to DLQ`);
      return this.send({
        messageId: message.messageId,
        messageType: message.messageType,
        payload: message.payload,
        error: 'No handler registered',
        failedAt: new Date().toISOString(),
        retryCount: 0,
      });
    }

    setImmediate(async () => {
      try {
        await handler.handle(message as MessageEnvelope);
        this.logger.debug(`Message ${message.messageId} handled by ${handler.constructor.name}`);
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Message ${message.messageId} failed: ${errMsg}`);

        if (message.retryCount < message.maxRetries) {
          const backoff = Math.min(1000 * 2 ** message.retryCount, 30000);
          setTimeout(() => {
            this.publish({
              ...envelope,
              retryCount: message.retryCount + 1,
            } as any);
          }, backoff);
        } else {
          await this.send({
            messageId: message.messageId,
            messageType: message.messageType,
            payload: message.payload,
            error: errMsg,
            failedAt: new Date().toISOString(),
            retryCount: message.retryCount,
          });
        }
      }
    });

    return Promise.resolve();
  }

  subscribe(handler: IMessageHandler): void {
    this.handlers.set(handler.handledMessageType, handler);
    this.logger.log(`Subscribed ${handler.constructor.name} to ${handler.handledMessageType}`);
  }

  unsubscribe(messageType: string): void {
    this.handlers.delete(messageType);
    this.logger.log(`Unsubscribed from ${messageType}`);
  }

  async send(record: DeadLetterRecord): Promise<void> {
    this.deadLetterStore.push(record);
    this.logger.warn(`Dead-lettered message ${record.messageId} (${record.messageType}): ${record.error}`);
  }

  async replay(messageId: string): Promise<void> {
    const idx = this.deadLetterStore.findIndex(r => r.messageId === messageId);
    if (idx === -1) throw new Error(`Dead letter record not found: ${messageId}`);
    const record = this.deadLetterStore[idx]!;
    this.deadLetterStore.splice(idx, 1);
    await this.publish({
      messageId: record.messageId,
      messageType: record.messageType,
      payload: record.payload,
      priority: 'normal',
      correlationId: randomUUID(),
      causationId: randomUUID(),
      maxRetries: 3,
    });
  }

  async list(limit = 50, offset = 0): Promise<DeadLetterRecord[]> {
    return this.deadLetterStore.slice(offset, offset + limit);
  }
}
