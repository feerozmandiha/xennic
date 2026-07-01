import { Injectable, Logger } from '@nestjs/common';
import { randomUUID, createHash } from 'node:crypto';
import { prisma } from '@xennic/database';
import type { PipelineEventType } from '../../domain/pipeline-events.js';

export interface AuditEntry {
  id: string;
  documentId: string;
  workspaceId: string;
  eventType: PipelineEventType;
  status: 'success' | 'failure';
  detail: string;
  previousHash: string;
  hash: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  async record(
    documentId: string,
    workspaceId: string,
    eventType: PipelineEventType,
    status: 'success' | 'failure',
    detail: string,
    metadata: Record<string, unknown> = {},
  ): Promise<AuditEntry> {
    const previousHash = await this.getLastHash(documentId);
    const entry: AuditEntry = {
      id: randomUUID(),
      documentId,
      workspaceId,
      eventType,
      status,
      detail,
      previousHash,
      hash: '',
      timestamp: new Date(),
      metadata,
    };

    entry.hash = this.computeHash(entry);

    try {
      await prisma.audit_logs.create({
        data: {
          id: entry.id,
          workspace_id: workspaceId,
          user_id: 'system',
          action: `knowledge.${eventType}`,
          entity: 'knowledge_document',
          entity_id: documentId,
        metadata: {
          eventType,
          status,
          detail,
          hash: entry.hash,
          previousHash: entry.previousHash,
          pipelineMetadata: metadata,
        } as any,
          ip_address: 'internal',
          created_at: entry.timestamp,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to write audit log: ${(err as Error).message}`);
    }

    this.logger.log(`Audit [${eventType}] ${documentId}: ${status}`);
    return entry;
  }

  async getHistory(documentId: string): Promise<AuditEntry[]> {
    try {
      const rows = await prisma.audit_logs.findMany({
        where: {
          entity: 'knowledge_document',
          entity_id: documentId,
        },
        orderBy: { created_at: 'asc' },
      });

      return rows.map((row) => {
        const meta = row.metadata as Record<string, unknown> | undefined;
        return {
          id: row.id,
          documentId: row.entity_id ?? '',
          workspaceId: row.workspace_id ?? '',
          eventType: (meta?.eventType as PipelineEventType) ?? 'knowledge.document.uploaded' as PipelineEventType,
          status: (meta?.status as 'success' | 'failure') ?? 'success',
          detail: (meta?.detail as string) ?? '',
          previousHash: (meta?.previousHash as string) ?? '',
          hash: (meta?.hash as string) ?? '',
          timestamp: row.created_at,
          metadata: (meta?.pipelineMetadata as Record<string, unknown>) ?? {},
        };
      });
    } catch (err) {
      this.logger.error(`Failed to read audit history: ${(err as Error).message}`);
      return [];
    }
  }

  verifyChain(documentId: string, entries: AuditEntry[]): boolean {
    if (entries.length === 0) return true;

    for (const entry of entries) {
      const expectedHash = this.computeHash(entry);
      if (entry.hash !== expectedHash) return false;
    }

    return true;
  }

  private async getLastHash(documentId: string): Promise<string> {
    try {
      const last = await prisma.audit_logs.findFirst({
        where: {
          entity: 'knowledge_document',
          entity_id: documentId,
        },
        orderBy: { created_at: 'desc' },
        select: { metadata: true },
      });

      if (last) {
        const details = last.metadata as Record<string, unknown> | undefined;
        return (details?.hash as string) ?? '';
      }
    } catch {
      return '';
    }
    return '';
  }

  private computeHash(entry: Omit<AuditEntry, 'hash'>): string {
    const data = `${entry.id}|${entry.documentId}|${entry.eventType}|${entry.status}|${entry.detail}|${entry.previousHash}|${entry.timestamp.toISOString()}`;
    return createHash('sha256').update(data).digest('hex');
  }
}
