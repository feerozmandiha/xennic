import { Injectable, Logger } from '@nestjs/common';
import { connect, type Channel, type ChannelModel, type ConsumeMessage } from 'amqplib';
import type { EventEnvelope } from './event-types.js';

@Injectable()
export class EventConsumer {
  private readonly logger = new Logger(EventConsumer.name);
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private readonly url: string;

  constructor() {
    this.url = process.env['RABBITMQ_URL'] ?? 'amqp://guest:guest@localhost:5672';
  }

  private connected = false;

  async connect(): Promise<void> {
    if (process.env['SKIP_INFRA_CONNECT'] === 'true') {
      this.logger.warn('Skipping RabbitMQ consumer connection (SKIP_INFRA_CONNECT)');
      return;
    }
    try {
      const conn = await Promise.race([
        connect(this.url),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), 5000),
        ),
      ]);
      this.connection = conn;
      this.channel = await this.connection.createChannel();
      this.connected = true;
      this.logger.log('Event consumer connected to RabbitMQ');
    } catch (err) {
      this.logger.warn(`RabbitMQ not available: ${(err as Error).message} — consumer disabled`);
    }
  }

  async subscribe<T>(
    queue: string,
    exchange: string,
    routingKey: string,
    handler: (event: EventEnvelope<T>) => Promise<void>,
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available. Call connect() first.');
    }

    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.bindQueue(queue, exchange, routingKey);

    await this.channel.consume(queue, async (msg) => {
      if (!msg) return;
      try {
        const event: EventEnvelope<T> = JSON.parse(msg.content.toString());
        await handler(event);
        this.channel!.ack(msg);
      } catch (error) {
        this.logger.error(`Error processing event from ${queue}`, error);
        this.channel!.nack(msg, false, true);
      }
    });

    this.logger.log(
      `Subscribed to ${exchange} -> ${queue} with routing key "${routingKey}"`,
    );
  }

  async subscribeWithRetry<T>(
    queue: string,
    exchange: string,
    routingKey: string,
    handler: (event: EventEnvelope<T>) => Promise<void>,
    maxRetries = 3,
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available. Call connect() first.');
    }

    const dlx = `${exchange}.dlx`;
    const dlq = `${queue}.dlq`;
    const retryExchange = `${exchange}.retry`;

    await this.channel.assertExchange(dlx, 'topic', { durable: true });

    await this.channel.assertQueue(queue, {
      durable: true,
      deadLetterExchange: dlx,
      deadLetterRoutingKey: queue,
    });

    await this.channel.bindQueue(queue, exchange, routingKey);

    await this.channel.assertQueue(dlq, { durable: true });

    await this.channel.bindQueue(dlq, dlx, queue);

    await this.channel.assertExchange(retryExchange, 'x-delayed-message', {
      durable: true,
      arguments: { 'x-delayed-type': 'topic' },
    });

    await this.channel.bindQueue(queue, retryExchange, routingKey);

    await this.channel.consume(queue, async (msg) => {
      if (!msg) return;
      try {
        const event: EventEnvelope<T> = JSON.parse(msg.content.toString());
        await handler(event);
        this.channel!.ack(msg);
      } catch (error) {
        this.logger.error(
          `Handler failed for event from ${queue}, sending to DLX`,
          error,
        );
        this.channel!.nack(msg, false, false);
      }
    });

    await this.channel.consume(dlq, async (msg) => {
      if (!msg) return;
      const retryCount =
        (msg.properties.headers?.['x-retry-count'] as number) ?? 0;

      if (retryCount < maxRetries) {
        const headers = {
          ...msg.properties.headers,
          'x-retry-count': retryCount + 1,
          'x-delay': Math.min(1000 * 2 ** retryCount, 30000),
        };

        this.channel!.publish(retryExchange, routingKey, msg.content, {
          ...msg.properties,
          headers,
        });

        this.channel!.ack(msg);
        this.logger.warn(
          `Retrying event (attempt ${retryCount + 1}/${maxRetries}) from ${queue}`,
        );
      } else {
        this.channel!.ack(msg);
        this.logger.error(
          `Event from ${queue} failed after ${maxRetries} retries. Message dead.`,
        );
      }
    });

    this.logger.log(
      `Subscribed with retry to ${exchange} -> ${queue} (DLQ: ${dlq}, maxRetries: ${maxRetries})`,
    );
  }

  ack(msg: ConsumeMessage): void {
    if (this.channel) {
      this.channel.ack(msg);
    }
  }

  nack(msg: ConsumeMessage, requeue = false): void {
    if (this.channel) {
      this.channel.nack(msg, false, requeue);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch (error) {
      this.logger.error('Error disconnecting event consumer', error);
    } finally {
      this.channel = null;
      this.connection = null;
    }
  }
}
