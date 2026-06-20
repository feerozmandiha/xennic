export type EmailTemplate =
  | 'password_reset'
  | 'welcome_email'
  | 'workspace_invite'
  | 'email_verification'
  | 'subscription_change';

export type EmailStatus = 'pending' | 'sent' | 'failed';

export class EmailEntity {
  private constructor(
    public readonly id: string,
    public readonly to: string,
    public readonly subject: string,
    public readonly template: EmailTemplate,
    public readonly context: Record<string, unknown>,
    private _status: EmailStatus,
    public readonly sentAt: Date | null,
    public readonly createdAt: Date,
    public readonly errorMessage: string | null,
  ) {}

  static create(data: {
    to: string;
    subject: string;
    template: EmailTemplate;
    context: Record<string, unknown>;
  }): EmailEntity {
    return new EmailEntity(
      crypto.randomUUID(),
      data.to,
      data.subject,
      data.template,
      data.context,
      'pending',
      null,
      new Date(),
      null,
    );
  }

  static reconstitute(data: {
    id: string;
    to: string;
    subject: string;
    template: string;
    context: Record<string, unknown>;
    status: string;
    sentAt: Date | null;
    createdAt: Date;
    errorMessage: string | null;
  }): EmailEntity {
    return new EmailEntity(
      data.id,
      data.to,
      data.subject,
      data.template as EmailTemplate,
      data.context,
      data.status as EmailStatus,
      data.sentAt,
      data.createdAt,
      data.errorMessage,
    );
  }

  get status(): EmailStatus { return this._status; }

  markAsSent(): void {
    this._status = 'sent';
    Object.assign(this, { sentAt: new Date() });
  }

  markAsFailed(error: string): void {
    this._status = 'failed';
    Object.assign(this, { errorMessage: error });
  }
}
