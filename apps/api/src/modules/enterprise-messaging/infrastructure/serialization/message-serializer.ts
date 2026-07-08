import { Injectable } from '@nestjs/common';
import type { MessageEnvelope } from '../../domain/interfaces/message-handler.interface.js';

export interface ISerializer<T = unknown> {
  serialize(envelope: MessageEnvelope<T>): string;
  deserialize(data: string): MessageEnvelope<T>;
}

@Injectable()
export class JsonMessageSerializer implements ISerializer {
  serialize<T>(envelope: MessageEnvelope<T>): string {
    return JSON.stringify(envelope);
  }

  deserialize<T>(data: string): MessageEnvelope<T> {
    return JSON.parse(data) as MessageEnvelope<T>;
  }
}
