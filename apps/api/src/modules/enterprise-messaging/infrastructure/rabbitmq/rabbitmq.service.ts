import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private model: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private readonly logger = new Logger(RabbitMQService.name);
  private readonly url: string;

  constructor() {
    this.url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  }

  async onModuleInit(): Promise<void> {
    this.model = await amqp.connect(this.url);
    this.channel = await this.model.createChannel();
    this.logger.log('Connected to RabbitMQ');
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.channel?.close();
      await this.model?.close();
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection', error instanceof Error ? error.message : '');
    }
  }

  async publish(exchange: string, routingKey: string, message: any): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    const buffer = Buffer.from(typeof message === 'string' ? message : JSON.stringify(message));
    this.channel.publish(exchange, routingKey, buffer);
  }

  async subscribe(queue: string, handler: (msg: any) => Promise<void>): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    await this.channel.consume(queue, async (msg: amqp.ConsumeMessage | null) => {
      if (!msg) return;
      try {
        const content = JSON.parse(msg.content.toString());
        await handler(content);
        this.channel!.ack(msg);
      } catch (error) {
        this.logger.error('Error handling message', error instanceof Error ? error.message : '');
        this.channel!.nack(msg, false, false);
      }
    });
  }

  async sendToQueue(queue: string, message: any): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    const buffer = Buffer.from(typeof message === 'string' ? message : JSON.stringify(message));
    this.channel.sendToQueue(queue, buffer);
  }

  async assertExchange(name: string, type: string, options?: amqp.Options.AssertExchange): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    await this.channel.assertExchange(name, type, options);
  }

  async assertQueue(name: string, options?: amqp.Options.AssertQueue): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    await this.channel.assertQueue(name, options);
  }

  async bindQueue(queue: string, exchange: string, pattern: string): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    await this.channel.bindQueue(queue, exchange, pattern);
  }

  async ack(msg: amqp.ConsumeMessage): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    this.channel.ack(msg);
  }

  async nack(msg: amqp.ConsumeMessage): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    this.channel.nack(msg, false, false);
  }

  async purgeQueue(queue: string): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    await this.channel.purgeQueue(queue);
  }

  async deleteQueue(queue: string): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    await this.channel.deleteQueue(queue);
  }
}
