import { Injectable, Logger } from '@nestjs/common';
import type { IEmailRepository } from '../../domain/interfaces/email.repository.interface.js';
import type { EmailEntity } from '../../domain/entities/email.entity.js';

@Injectable()
export class EmailRepository implements IEmailRepository {
  private readonly logger = new Logger(EmailRepository.name);
  private readonly store: Map<string, EmailEntity> = new Map();

  async save(email: EmailEntity): Promise<void> {
    this.store.set(email.id, email);
    this.logger.debug(`Email logged: id=${email.id}, to=${email.to}, template=${email.template}`);
  }

  async update(email: EmailEntity): Promise<void> {
    this.store.set(email.id, email);
  }

  async findRecentByRecipient(to: string, template: string, minutes: number): Promise<EmailEntity[]> {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return Array.from(this.store.values()).filter(
      e => e.to === to && e.template === template && e.createdAt > cutoff,
    );
  }
}
