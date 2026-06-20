import type { WebhookEntity, WebhookEvent } from '../entities/webhook.entity.js';

export interface IWebhookRepository {
  save(webhook: WebhookEntity): Promise<void>;
  update(webhook: WebhookEntity): Promise<void>;
  findById(id: string): Promise<WebhookEntity | null>;
  findAllByWorkspace(
    workspaceId: string,
    options?: { offset?: number; limit?: number },
  ): Promise<WebhookEntity[]>;
  findActiveByEvent(workspaceId: string, event: WebhookEvent): Promise<WebhookEntity[]>;
  countByWorkspace(workspaceId: string): Promise<number>;
  delete(id: string): Promise<void>;
}
