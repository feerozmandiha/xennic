import { Global, Module, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module.js';
import { EventConsumer } from './event-consumer.service.js';
import { EventIdempotencyService } from './event-idempotency.service.js';
import { EventPublisher } from './event-publisher.service.js';

@Global()
@Module({
  imports: [RedisModule],
  providers: [
    EventPublisher,
    EventConsumer,
    EventIdempotencyService,
  ],
  exports: [EventPublisher, EventConsumer],
})
export class EventModule implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly consumer: EventConsumer,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.publisher.connect();
    await this.consumer.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.publisher.disconnect();
    await this.consumer.disconnect();
  }
}
