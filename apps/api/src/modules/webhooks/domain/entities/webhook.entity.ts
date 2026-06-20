import { createHmac, randomBytes } from 'crypto';

export type WebhookEvent =
  | 'workspace.updated'
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'calculation.completed'
  | 'file.uploaded'
  | 'file.deleted'
  | 'knowledge.published'
  | 'knowledge.updated'
  | 'subscription.changed'
  | 'user.invited'
  | 'user.removed'
  | 'order.created'
  | 'order.updated';

export const ALL_WEBHOOK_EVENTS: WebhookEvent[] = [
  'workspace.updated',
  'project.created',
  'project.updated',
  'project.deleted',
  'calculation.completed',
  'file.uploaded',
  'file.deleted',
  'knowledge.published',
  'knowledge.updated',
  'subscription.changed',
  'user.invited',
  'user.removed',
  'order.created',
  'order.updated',
];

export class WebhookEntity {
  private constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly url: string,
    public readonly secret: string | null,
    private _events: WebhookEvent[],
    private _isActive: boolean,
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    workspaceId: string;
    url: string;
    secret?: string;
    events: WebhookEvent[];
  }): WebhookEntity {
    const secret = data.secret ?? WebhookEntity.generateSecret();
    return new WebhookEntity(
      crypto.randomUUID(),
      data.workspaceId,
      data.url,
      secret,
      data.events,
      true,
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    workspaceId: string;
    url: string;
    secret: string | null;
    events: WebhookEvent[] | string[];
    isActive: boolean;
    createdAt: Date;
  }): WebhookEntity {
    return new WebhookEntity(
      data.id,
      data.workspaceId,
      data.url,
      data.secret,
      data.events as WebhookEvent[],
      data.isActive,
      data.createdAt,
    );
  }

  get events(): WebhookEvent[] { return [...this._events]; }
  get isActive(): boolean { return this._isActive; }

  activate(): void {
    this._isActive = true;
  }

  deactivate(): void {
    this._isActive = false;
  }

  updateEvents(events: WebhookEvent[]): void {
    this._events = [...events];
  }

  updateUrl(url: string): void {
    // Basic URL validation
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid webhook URL');
    }
    Object.assign(this, { url });
  }

  subscribesTo(event: WebhookEvent): boolean {
    return this._events.includes(event);
  }

  signPayload(payload: string): string {
    if (!this.secret) return '';
    return createHmac('sha256', this.secret).update(payload).digest('hex');
  }

  static generateSecret(): string {
    return randomBytes(32).toString('hex');
  }
}
