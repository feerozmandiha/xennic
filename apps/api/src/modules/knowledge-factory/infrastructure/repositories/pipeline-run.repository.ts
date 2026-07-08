import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IPipelineRunRepository } from '../../domain/interfaces/pipeline-run.repository.interface.js';
import { KnowledgePipelineRun } from '../../domain/entities/knowledge-pipeline-run.entity.js';

@Injectable()
export class PipelineRunRepository implements IPipelineRunRepository {
  async create(entity: KnowledgePipelineRun): Promise<KnowledgePipelineRun> {
    const row = await prisma.knowledge_pipeline_runs.create({
      data: {
        document_id: entity.documentId,
        stage: entity.stage,
        status: entity.status as string,
        input: entity.input as any,
        output: entity.output as any,
        error: entity.error,
      },
    });
    return KnowledgePipelineRun.reconstitute({
      id: row.id,
      documentId: row.document_id,
      stage: row.stage,
      status: row.status,
      input: row.input as unknown,
      output: row.output as unknown | null,
      error: row.error,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      durationMs: row.duration_ms,
    });
  }

  async findById(id: string): Promise<KnowledgePipelineRun | null> {
    const row = await prisma.knowledge_pipeline_runs.findUnique({ where: { id } });
    if (!row) return null;
    return this._toEntity(row);
  }

  async findByDocument(documentId: string): Promise<KnowledgePipelineRun[]> {
    const rows = await prisma.knowledge_pipeline_runs.findMany({
      where: { document_id: documentId },
      orderBy: { started_at: 'desc' },
    });
    return rows.map((r) => this._toEntity(r));
  }

  async findRunningByStage(stage: string): Promise<KnowledgePipelineRun[]> {
    const rows = await prisma.knowledge_pipeline_runs.findMany({
      where: { stage, status: 'running' },
    });
    return rows.map((r) => this._toEntity(r));
  }

  async update(entity: KnowledgePipelineRun): Promise<KnowledgePipelineRun> {
    const row = await prisma.knowledge_pipeline_runs.update({
      where: { id: entity.id },
      data: {
        status: entity.status as string,
        output: entity.output as any,
        error: entity.error,
        finished_at: entity.finishedAt,
        duration_ms: entity.durationMs,
      },
    });
    return this._toEntity(row as any);
  }

  private _toEntity(row: {
    id: string;
    document_id: string;
    stage: string;
    status: string;
    input: unknown;
    output: unknown | null;
    error: string | null;
    started_at: Date;
    finished_at: Date | null;
    duration_ms: number | null;
  }): KnowledgePipelineRun {
    return KnowledgePipelineRun.reconstitute({
      id: row.id,
      documentId: row.document_id,
      stage: row.stage,
      status: row.status as string,
      input: row.input as unknown,
      output: row.output as unknown | null,
      error: row.error,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      durationMs: row.duration_ms,
    });
  }
}
