import { Injectable, Logger, Inject } from '@nestjs/common';
import { IAUDIT_REPOSITORY } from '../ports/audit-repository.interface.js';
import type { IAuditRepository } from '../ports/audit-repository.interface.js';
import { CalculationAuditEntity } from '../../domain/entities/calculation-audit.entity.js';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @Inject(IAUDIT_REPOSITORY)
    private readonly repo: IAuditRepository,
  ) {}

  async logExecution(data: {
    workspaceId: string; userId: string; action: 'run' | 'validate' | 'create' | 'update' | 'delete' | 'publish' | 'rollback';
    entityType: 'definition' | 'version' | 'formula' | 'result' | 'certificate' | 'plugin' | 'category';
    entityId?: string | null; inputs?: Record<string, unknown> | null; outputs?: Record<string, unknown> | null;
    formulaVersion?: string | null; aiResponse?: Record<string, unknown> | null;
    executionPath?: string[] | null; errorMessage?: string | null; durationMs?: number | null; correlationId?: string | null;
  }): Promise<CalculationAuditEntity> {
    const entry = CalculationAuditEntity.create(data);
    await this.repo.save(entry);
    return entry;
  }

  async findByWorkspaceId(workspaceId: string, options?: { page?: number; limit?: number; action?: string; entityType?: string }) {
    return this.repo.findByWorkspaceId(workspaceId, options);
  }

  async findById(id: string): Promise<CalculationAuditEntity | null> {
    return this.repo.findById(id);
  }
}
