import { randomUUID } from 'crypto';
import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import type { IWebhookRepository } from '../../domain/interfaces/webhook.repository.interface.js';
import {
  WebhookEntity,
  type WebhookEvent,
  ALL_WEBHOOK_EVENTS,
} from '../../domain/entities/webhook.entity.js';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @Inject('IWebhookRepository')
    private readonly webhookRepository: IWebhookRepository,
  ) {}

  async create(data: {
    workspaceId: string;
    url: string;
    secret?: string;
    events: WebhookEvent[];
  }): Promise<WebhookEntity> {
    this._validateUrl(data.url);
    this._validateEvents(data.events);

    const webhook = WebhookEntity.create({
      workspaceId: data.workspaceId,
      url: data.url,
      secret: data.secret,
      events: data.events,
    });

    await this.webhookRepository.save(webhook);
    return webhook;
  }

  async findAll(
    workspaceId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: WebhookEntity[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.webhookRepository.findAllByWorkspace(workspaceId, { offset, limit }),
      this.webhookRepository.countByWorkspace(workspaceId),
    ]);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, workspaceId: string): Promise<WebhookEntity> {
    return this._getWebhook(id, workspaceId);
  }

  async update(
    id: string,
    workspaceId: string,
    data: { url?: string; events?: WebhookEvent[]; isActive?: boolean },
  ): Promise<WebhookEntity> {
    const webhook = await this._getWebhook(id, workspaceId);

    if (data.url !== undefined) {
      this._validateUrl(data.url);
      webhook.updateUrl(data.url);
    }

    if (data.events !== undefined) {
      this._validateEvents(data.events);
      webhook.updateEvents(data.events);
    }

    if (data.isActive !== undefined) {
      if (data.isActive) {
        webhook.activate();
      } else {
        webhook.deactivate();
      }
    }

    await this.webhookRepository.update(webhook);
    return webhook;
  }

  async delete(id: string, workspaceId: string): Promise<void> {
    const webhook = await this._getWebhook(id, workspaceId);
    await this.webhookRepository.delete(webhook.id);
  }

  async dispatch(
    workspaceId: string,
    event: WebhookEvent,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const webhooks = await this.webhookRepository.findActiveByEvent(workspaceId, event);
    if (webhooks.length === 0) return;

    const body = JSON.stringify({
      event,
      workspaceId,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    await Promise.allSettled(
      webhooks.map(wh => this._deliver(wh, body)),
    );
  }

  private async _deliver(webhook: WebhookEntity, body: string): Promise<void> {
    try {
      const signature = webhook.signPayload(body);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Xennic-Event': body ? JSON.parse(body).event : 'unknown',
        'X-Xennic-Signature': signature,
        'X-Xennic-Delivery': randomUUID(),
      };

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body,
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        this.logger.warn(
          `Webhook ${webhook.id} returned ${response.status} for ${webhook.url}`,
        );
      }
    } catch (err) {
      this.logger.error(
        `Webhook delivery failed for ${webhook.id} (${webhook.url}): ${(err as Error).message}`,
      );
    }
  }

  private _validateUrl(url: string): void {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new BadRequestException('Webhook URL must use HTTP or HTTPS protocol');
      }
    } catch {
      throw new BadRequestException('Invalid webhook URL');
    }
  }

  private _validateEvents(events: WebhookEvent[]): void {
    if (!events || events.length === 0) {
      throw new BadRequestException('At least one event must be specified');
    }
    const invalid = events.filter(e => !ALL_WEBHOOK_EVENTS.includes(e));
    if (invalid.length > 0) {
      throw new BadRequestException(`Invalid webhook event(s): ${invalid.join(', ')}`);
    }
  }

  private async _getWebhook(id: string, workspaceId: string): Promise<WebhookEntity> {
    const webhook = await this.webhookRepository.findById(id);
    if (!webhook) {
      throw new NotFoundException(`Webhook "${id}" not found`);
    }
    if (webhook.workspaceId !== workspaceId) {
      throw new ForbiddenException('Access denied to this webhook');
    }
    return webhook;
  }
}
