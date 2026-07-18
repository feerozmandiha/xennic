import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PaginatedResult } from '../../shared/types/index.js';

export interface AuditEntry {
  id: string;
  action: string;
  promptId: string;
  version: number;
  userId: string;
  metadata: Record<string, unknown> | null;
  timestamp: Date;
}

export interface AuditFindOptions {
  offset?: number;
  limit?: number;
}

@Injectable()
export class PromptAuditService {
  private readonly logger = new Logger(PromptAuditService.name);
  private readonly entries: AuditEntry[] = [];

  async log(
    action: string,
    promptId: string,
    version: number,
    userId: string,
    metadata?: Record<string, unknown>,
  ): Promise<AuditEntry> {
    const entry: AuditEntry = {
      id: randomUUID(),
      action,
      promptId,
      version,
      userId,
      metadata: metadata ?? null,
      timestamp: new Date(),
    };
    this.entries.push(entry);
    this.logger.debug(`Audit: ${action} prompt ${promptId} v${version} by ${userId}`);
    return entry;
  }

  async getAuditTrail(
    promptId: string,
    options?: AuditFindOptions,
  ): Promise<PaginatedResult<AuditEntry>> {
    const filtered = this.entries.filter((e) => e.promptId === promptId);
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? filtered.length;
    return {
      items: filtered.slice(offset, offset + limit),
      total: filtered.length,
      offset,
      limit,
    };
  }
}
