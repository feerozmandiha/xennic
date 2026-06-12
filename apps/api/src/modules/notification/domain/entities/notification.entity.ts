export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push';
export type NotificationStatus  = 'pending' | 'sent' | 'read' | 'failed';
export type NotificationType =
  | 'workspace_invite'
  | 'workspace_member_added'
  | 'workspace_member_removed'
  | 'project_added'
  | 'project_updated'
  | 'calculation_complete'
  | 'subscription_changed'
  | 'subscription_expiring'
  | 'file_shared'
  | 'system'
  | 'security_alert';

export class NotificationEntity {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: NotificationType,
    public readonly channel: NotificationChannel,
    public readonly title: string,
    public readonly content: string,
    private _status: NotificationStatus,
    public sentAt: Date | null,
    public readonly createdAt: Date,
    // اطلاعات اضافی اختیاری
    public readonly metadata?: Record<string, unknown>,
  ) {}

  static create(data: {
    userId: string;
    type: NotificationType;
    channel: NotificationChannel;
    title: string;
    content: string;
    metadata?: Record<string, unknown>;
  }): NotificationEntity {
    return new NotificationEntity(
      crypto.randomUUID(),
      data.userId,
      data.type,
      data.channel,
      data.title,
      data.content,
      'pending',
      null,
      new Date(),
      data.metadata,
    );
  }

  static reconstitute(data: {
    id: string;
    userId: string;
    type: string;
    channel: string;
    title: string;
    content: string;
    status: string;
    sentAt: Date | null;
    createdAt: Date;
    metadata?: Record<string, unknown>;
  }): NotificationEntity {
    return new NotificationEntity(
      data.id,
      data.userId,
      data.type as NotificationType,
      data.channel as NotificationChannel,
      data.title,
      data.content,
      data.status as NotificationStatus,
      data.sentAt,
      data.createdAt,
      data.metadata,
    );
  }

  // ── getters ──────────────────────────────────────────────────────────────

  get status(): NotificationStatus { return this._status; }

  // ── business methods ─────────────────────────────────────────────────────

  markAsSent(): void {
    this._status = 'sent';
    this.sentAt  = new Date();
  }

  markAsRead(): void {
    if (this._status === 'pending') this.markAsSent();
    this._status = 'read';
  }

  markAsFailed(): void {
    this._status = 'failed';
  }

  isPending(): boolean { return this._status === 'pending'; }
  isRead(): boolean    { return this._status === 'read'; }
  isSent(): boolean    { return this._status === 'sent'; }
}
