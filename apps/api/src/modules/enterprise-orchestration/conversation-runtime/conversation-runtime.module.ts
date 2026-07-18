import { Module, Global, Logger, OnModuleInit } from '@nestjs/common';
import { ConversationService } from './application/conversation.service.js';
import { SessionManagerService } from './application/session-manager.service.js';
import { HistoryService } from './application/history.service.js';
import { PrismaConversationRepository } from './infrastructure/persistence/prisma-conversation-repository.js';

@Global()
@Module({
  providers: [
    ConversationService,
    SessionManagerService,
    HistoryService,
    { provide: 'IConversationRepository', useClass: PrismaConversationRepository },
  ],
  exports: [ConversationService, SessionManagerService, HistoryService],
})
export class ConversationRuntimeModule implements OnModuleInit {
  private readonly logger = new Logger(ConversationRuntimeModule.name);

  onModuleInit(): void {
    this.logger.log('Conversation Runtime Module initialized');
  }
}
