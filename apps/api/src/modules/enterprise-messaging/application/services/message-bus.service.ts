import { Injectable, Logger } from '@nestjs/common';
import { InProcessCommandBus } from '../../infrastructure/bus/in-process-command-bus.js';
import { InProcessQueryBus } from '../../infrastructure/bus/in-process-query-bus.js';
import { InProcessMessageQueue } from '../../infrastructure/bus/in-process-message-queue.js';
import type { ICommand, ICommandHandler } from '../../domain/interfaces/command-bus.interface.js';
import type { IQuery, IQueryHandler } from '../../domain/interfaces/query-bus.interface.js';
import type { IMessageHandler } from '../../domain/interfaces/message-handler.interface.js';

@Injectable()
export class MessageBusService {
  private readonly logger = new Logger(MessageBusService.name);

  constructor(
    private readonly commandBus: InProcessCommandBus,
    private readonly queryBus: InProcessQueryBus,
    private readonly messageQueue: InProcessMessageQueue,
  ) {}

  registerCommandHandler(handler: ICommandHandler<ICommand>): void {
    this.commandBus.register(handler);
  }

  registerQueryHandler(handler: IQueryHandler<IQuery>): void {
    this.queryBus.register(handler);
  }

  registerMessageHandler(handler: IMessageHandler): void {
    this.messageQueue.subscribe(handler);
  }

  getCommandBus(): InProcessCommandBus {
    return this.commandBus;
  }

  getQueryBus(): InProcessQueryBus {
    return this.queryBus;
  }

  getMessageQueue(): InProcessMessageQueue {
    return this.messageQueue;
  }
}
