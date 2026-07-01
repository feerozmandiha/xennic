import { Global, Module } from '@nestjs/common';
import { TransactionService } from './transaction.service.js';
import { AuditRepository } from './audit.repository.js';

@Global()
@Module({
  providers: [TransactionService, AuditRepository],
  exports: [TransactionService, AuditRepository],
})
export class RepositoryModule {}
