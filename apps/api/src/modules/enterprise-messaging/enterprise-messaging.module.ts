import { Module, Global, OnModuleInit, Logger } from '@nestjs/common';
import { InProcessCommandBus } from './infrastructure/bus/in-process-command-bus.js';
import { InProcessQueryBus } from './infrastructure/bus/in-process-query-bus.js';
import { InProcessMessageQueue } from './infrastructure/bus/in-process-message-queue.js';
import { JsonMessageSerializer } from './infrastructure/serialization/message-serializer.js';
import { MessageBusService } from './application/services/message-bus.service.js';

@Global()
@Module({
  providers: [
    InProcessCommandBus,
    InProcessQueryBus,
    InProcessMessageQueue,
    JsonMessageSerializer,
    MessageBusService,
  ],
  exports: [
    InProcessCommandBus,
    InProcessQueryBus,
    InProcessMessageQueue,
    JsonMessageSerializer,
    MessageBusService,
  ],
})
export class EnterpriseMessagingModule implements OnModuleInit {
  private readonly logger = new Logger(EnterpriseMessagingModule.name);

  onModuleInit(): void {
    this.logger.log('Enterprise Messaging Module initialized: Command/Query/Event buses ready');
  }
}
