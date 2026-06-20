import type { EmailEntity } from '../entities/email.entity.js';

export interface IEmailRepository {
  save(email: EmailEntity): Promise<void>;
  update(email: EmailEntity): Promise<void>;
  findRecentByRecipient(to: string, template: string, minutes: number): Promise<EmailEntity[]>;
}
