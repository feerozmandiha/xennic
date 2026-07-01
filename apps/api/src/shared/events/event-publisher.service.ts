import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { connect, type ChannelModel, type ConfirmChannel } from 'amqplib';
import type { EventEnvelope } from './event-types.js';

@Injectable()
export class EventPublisher {
  private readonly logger = new Logger(EventPublisher.name);
  private connection: ChannelModel | null = null;
  private channel: ConfirmChannel | null = null;
  private readonly url: string;
  private readonly defaultExchange: string;

  constructor() {
    this.url = process.env['RABBITMQ_URL'] ?? 'amqp://guest:guest@localhost:5672';
    this.defaultExchange = process.env['RABBITMQ_EVENT_EXCHANGE'] ?? 'xennic.events';
  }

  private connected = false;

  async connect(): Promise<void> {
    if (process.env['SKIP_INFRA_CONNECT'] === 'true') {
      this.logger.warn('Skipping RabbitMQ connection (SKIP_INFRA_CONNECT)');
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
      this.channel = await this.connection.createConfirmChannel();

      await this.channel.assertExchange(this.defaultExchange, 'topic', {
        durable: true,
      });

      this.connected = true;
      this.logger.log(`Connected to RabbitMQ at ${this.url}`);
    } catch (err) {
      this.logger.warn(`RabbitMQ not available: ${(err as Error).message} — events disabled`);
    }
  }

  private ensureConnected(): void {
    if (!this.connected || !this.channel) {
      throw new Error('RabbitMQ is not connected');
    }
  }

  async publish<T>(exchange: string, routingKey: string, event: T): Promise<void> {
    this.ensureConnected();
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available. Call connect() first.');
    }

    await this.channel.assertExchange(exchange, 'topic', { durable: true });

    const envelope = this.createEnvelope(event, routingKey);
    const published = this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(envelope)),
      {
        contentType: 'application/json',
        persistent: true,
      },
    );

    if (!published) {
      this.logger.warn(`Event publish to ${exchange} returned false (channel may be full)`);
    }
  }

  async publishWithDelay<T>(
    exchange: string,
    routingKey: string,
    event: T,
    delayMs: number,
  ): Promise<void> {
    this.ensureConnected();
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available. Call connect() first.');
    }

    const delayedExchange = `${exchange}.delayed`;
    await this.channel.assertExchange(delayedExchange, 'x-delayed-message', {
      durable: true,
      arguments: { 'x-delayed-type': 'topic' },
    });

    const envelope = this.createEnvelope(event, routingKey);
    const published = this.channel.publish(
      delayedExchange,
      routingKey,
      Buffer.from(JSON.stringify(envelope)),
      {
        contentType: 'application/json',
        persistent: true,
        headers: { 'x-delay': delayMs },
      },
    );

    if (!published) {
      this.logger.warn(`Delayed event publish to ${delayedExchange} returned false`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ', error);
    } finally {
      this.channel = null;
      this.connection = null;
    }
  }

  async waitForConfirms(): Promise<void> {
    await this.channel?.waitForConfirms();
  }

  getDefaultExchange(): string {
    return this.defaultExchange;
  }

  private createEnvelope<T>(data: T, eventType: string): EventEnvelope<T> {
    return {
      eventId: randomUUID(),
      eventType,
      eventVersion: 1,
      correlationId: randomUUID(),
      timestamp: new Date().toISOString(),
      data,
    };
  }
}
