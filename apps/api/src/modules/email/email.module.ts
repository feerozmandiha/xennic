import { Module } from '@nestjs/common';
import { EmailController } from './presentation/controllers/email.controller.js';
import { EmailService } from './application/services/email.service.js';
import { NodemailerProvider } from './infrastructure/providers/nodemailer.provider.js';
import { EmailRepository } from './infrastructure/repositories/email.repository.js';

@Module({
  controllers: [EmailController],
  providers: [
    EmailService,
    {
      provide: 'IEmailProvider',
      useClass: NodemailerProvider,
    },
    {
      provide: 'IEmailRepository',
      useClass: EmailRepository,
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
