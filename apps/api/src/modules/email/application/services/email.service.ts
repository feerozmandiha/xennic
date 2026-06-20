import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IEmailProvider } from '../../domain/interfaces/email-provider.interface.js';
import type { IEmailRepository } from '../../domain/interfaces/email.repository.interface.js';
import { EmailEntity, type EmailTemplate } from '../../domain/entities/email.entity.js';
import {
  renderPasswordResetEmail,
  renderWelcomeEmail,
  renderWorkspaceInviteEmail,
} from './email-templates.js';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject('IEmailProvider')
    private readonly emailProvider: IEmailProvider,
    @Inject('IEmailRepository')
    private readonly emailRepository: IEmailRepository,
  ) {}

  async sendPasswordReset(
    to: string,
    recipientName: string,
    resetToken: string,
    language: 'fa' | 'en' = 'fa',
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const resetLink = `${frontendUrl}/${language}/reset-password?token=${resetToken}`;
    const { subject, html } = renderPasswordResetEmail(recipientName, resetLink, language);

    await this.send({
      to,
      subject,
      template: 'password_reset',
      context: { recipientName, resetToken, resetLink, language },
      html,
    });
  }

  async sendWelcome(
    to: string,
    recipientName: string,
    language: 'fa' | 'en' = 'fa',
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const loginLink = `${frontendUrl}/${language}/login`;
    const { subject, html } = renderWelcomeEmail(recipientName, loginLink, language);

    await this.send({
      to,
      subject,
      template: 'welcome_email',
      context: { recipientName, loginLink, language },
      html,
    });
  }

  async sendWorkspaceInvite(
    to: string,
    recipientName: string,
    inviterName: string,
    workspaceName: string,
    acceptToken: string,
    language: 'fa' | 'en' = 'fa',
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const acceptLink = `${frontendUrl}/${language}/workspaces/invitations/accept?token=${acceptToken}`;
    const { subject, html } = renderWorkspaceInviteEmail(
      recipientName, inviterName, workspaceName, acceptLink, language,
    );

    await this.send({
      to,
      subject,
      template: 'workspace_invite',
      context: { recipientName, inviterName, workspaceName, acceptToken, acceptLink, language },
      html,
    });
  }

  async sendRaw(to: string, subject: string, html: string): Promise<void> {
    await this.send({ to, subject, html, template: 'email_verification', context: {} });
  }

  private async send(data: {
    to: string;
    subject: string;
    template: EmailTemplate;
    context: Record<string, unknown>;
    html: string;
  }): Promise<void> {
    const email = EmailEntity.create({
      to: data.to,
      subject: data.subject,
      template: data.template,
      context: data.context,
    });

    await this.emailRepository.save(email);

    try {
      const recent = await this.emailRepository.findRecentByRecipient(data.to, data.template, 2);
      if (recent.length > 3) {
        this.logger.warn(`Rate limit: skipping email to ${data.to} (${data.template}) — too many requests`);
        email.markAsFailed('Rate limited');
        await this.emailRepository.update(email);
        return;
      }

      await this.emailProvider.send({
        to: data.to,
        subject: data.subject,
        html: data.html,
      });

      email.markAsSent();
    } catch (err) {
      this.logger.error(`Failed to send email to ${data.to}: ${(err as Error).message}`);
      email.markAsFailed((err as Error).message);
    }

    await this.emailRepository.update(email);
  }
}
