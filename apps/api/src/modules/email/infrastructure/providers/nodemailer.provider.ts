import { Injectable, Logger } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import type { IEmailProvider, SendMailInput } from '../../domain/interfaces/email-provider.interface.js';

@Injectable()
export class NodemailerProvider implements IEmailProvider {
  private readonly logger = new Logger(NodemailerProvider.name);
  private readonly transporter: Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    if (!host) {
      this.logger.warn('SMTP_HOST not set — email sending disabled');
      return;
    }
    const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
    const user = process.env.SMTP_USER ?? '';
    const pass = process.env.SMTP_PASS ?? '';

    this.transporter = createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true',
      auth: user ? { user, pass } : undefined,
    });

    this.logger.log(`Nodemailer initialized: ${host}:${port} (${user || 'no auth'})`);
  }

  isEnabled(): boolean {
    return this.transporter !== null;
  }

  async send(input: SendMailInput): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`Email not sent (SMTP not configured): to=${input.to}, subject="${input.subject}"`);
      return;
    }

    const fromName = process.env.SMTP_FROM_NAME || 'Xennic';
    const fromAddr = process.env.SMTP_FROM_ADDRESS || 'noreply@xennic.com';

    try {
      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromAddr}>`,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text || input.html.replace(/<[^>]*>/g, ''),
      });

      this.logger.log(`Email sent: to=${input.to}, msgId=${info.messageId}`);
    } catch (err) {
      this.logger.error(`Email failed: to=${input.to}, error=${(err as Error).message}`);
      throw err;
    }
  }
}
