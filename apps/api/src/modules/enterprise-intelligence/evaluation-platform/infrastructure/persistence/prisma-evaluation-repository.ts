import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { BenchmarkEntity } from '../../domain/benchmark.entity.js';
import { GoldenDataset, type GoldenItem } from '../../domain/golden-dataset.entity.js';
import { EvaluationRun, type EvaluationResult } from '../../domain/evaluation-run.entity.js';
import type { IEvaluationRepository, ListOptions } from '../../domain/evaluation-repository.interface.js';
import type { PaginatedResult } from '../../../shared/types/index.js';

@Injectable()
export class PrismaEvaluationRepository implements IEvaluationRepository {
  private readonly logger = new Logger(PrismaEvaluationRepository.name);

  async saveBenchmark(entity: BenchmarkEntity): Promise<void> {
    await prisma.evaluation_benchmarks.upsert({
      where: { id: entity.id },
      update: {
        name: entity.name,
        description: entity.description,
        dataset_id: entity.datasetId,
        metrics: entity.metrics,
        tags: entity.tags,
        version: entity.version,
        status: entity.status,
        metadata: entity.metadata as Record<string, unknown>,
      },
      create: {
        id: entity.id,
        workspace_id: null,
        name: entity.name,
        description: entity.description,
        dataset_id: entity.datasetId,
        metrics: entity.metrics,
        tags: entity.tags,
        version: entity.version,
        status: entity.status,
        metadata: entity.metadata as Record<string, unknown>,
      },
    });
    this.logger.debug(`Saved benchmark ${entity.id}`);
  }

  async getBenchmark(id: string): Promise<BenchmarkEntity | null> {
    const row = await prisma.evaluation_benchmarks.findUnique({ where: { id } });
    if (!row) return null;
    return BenchmarkEntity.reconstitute(
      row.id,
      row.name,
      row.description,
      row.dataset_id,
      row.metrics,
      row.tags,
      row.version,
      row.status as any,
      row.metadata as Record<string, unknown>,
      row.created_at,
      row.updated_at,
    );
  }

  async listBenchmarks(options?: ListOptions): Promise<PaginatedResult<BenchmarkEntity>> {
    const where: Record<string, unknown> = {};
    if (options?.status) where.status = options.status;
    if (options?.tag) where.tags = { has: options.tag };
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 50;
    const [items, total] = await Promise.all([
      prisma.evaluation_benchmarks.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.evaluation_benchmarks.count({ where }),
    ]);
    return {
      items: items.map(r =>
        BenchmarkEntity.reconstitute(
          r.id,
          r.name,
          r.description,
          r.dataset_id,
          r.metrics,
          r.tags,
          r.version,
          r.status as any,
          r.metadata as Record<string, unknown>,
          r.created_at,
          r.updated_at,
        ),
      ),
      total,
      offset,
      limit,
    };
  }

  async deleteBenchmark(id: string): Promise<void> {
    await prisma.evaluation_benchmarks.delete({ where: { id } });
  }

  async saveDataset(entity: GoldenDataset): Promise<void> {
    await prisma.evaluation_datasets.upsert({
      where: { id: entity.id },
      update: {
        name: entity.name,
        description: entity.description,
        version: entity.version,
        items: entity.items as unknown as Record<string, unknown>,
        tags: entity.tags,
        metadata: entity.metadata as Record<string, unknown>,
      },
      create: {
        id: entity.id,
        workspace_id: null,
        name: entity.name,
        description: entity.description,
        version: entity.version,
        items: entity.items as unknown as Record<string, unknown>,
        tags: entity.tags,
        metadata: entity.metadata as Record<string, unknown>,
      },
    });
    this.logger.debug(`Saved dataset ${entity.id}`);
  }

  async getDataset(id: string): Promise<GoldenDataset | null> {
    const row = await prisma.evaluation_datasets.findUnique({ where: { id } });
    if (!row) return null;
    return GoldenDataset.reconstitute(
      row.id,
      row.name,
      row.description,
      row.version,
      row.items as unknown as GoldenItem[],
      row.tags,
      row.metadata as Record<string, unknown>,
      row.created_at,
      row.updated_at,
    );
  }

  async listDatasets(options?: ListOptions): Promise<PaginatedResult<GoldenDataset>> {
    const where: Record<string, unknown> = {};
    if (options?.tag) where.tags = { has: options.tag };
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 50;
    const [items, total] = await Promise.all([
      prisma.evaluation_datasets.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.evaluation_datasets.count({ where }),
    ]);
    return {
      items: items.map(r =>
        GoldenDataset.reconstitute(
          r.id,
          r.name,
          r.description,
          r.version,
          r.items as unknown as GoldenItem[],
          r.tags,
          r.metadata as Record<string, unknown>,
          r.created_at,
          r.updated_at,
        ),
      ),
      total,
      offset,
      limit,
    };
  }

  async deleteDataset(id: string): Promise<void> {
    await prisma.evaluation_datasets.delete({ where: { id } });
  }

  async saveRun(entity: EvaluationRun): Promise<void> {
    await prisma.evaluation_runs.upsert({
      where: { id: entity.id },
      update: {
        benchmark_id: entity.benchmarkId,
        target_type: entity.targetType,
        target_id: entity.targetId,
        target_version: entity.targetVersion,
        status: entity.status,
        results: entity.results as unknown as Record<string, unknown>,
        score: entity.score,
        started_at: entity.startedAt,
        completed_at: entity.completedAt,
        metadata: entity.metadata as Record<string, unknown>,
      },
      create: {
        id: entity.id,
        workspace_id: null,
        benchmark_id: entity.benchmarkId,
        target_type: entity.targetType,
        target_id: entity.targetId,
        target_version: entity.targetVersion,
        status: entity.status,
        results: entity.results as unknown as Record<string, unknown>,
        score: entity.score,
        started_at: entity.startedAt,
        completed_at: entity.completedAt,
        metadata: entity.metadata as Record<string, unknown>,
      },
    });
    this.logger.debug(`Saved run ${entity.id}`);
  }

  async getRun(id: string): Promise<EvaluationRun | null> {
    const row = await prisma.evaluation_runs.findUnique({ where: { id } });
    if (!row) return null;
    return EvaluationRun.reconstitute(
      row.id,
      row.benchmark_id,
      row.target_type as any,
      row.target_id,
      row.target_version,
      row.status as any,
      row.results as unknown as EvaluationResult[],
      row.score,
      row.started_at,
      row.completed_at,
      row.metadata as Record<string, unknown>,
      row.created_at,
      row.updated_at,
    );
  }

  async listRuns(options?: ListOptions): Promise<PaginatedResult<EvaluationRun>> {
    const where: Record<string, unknown> = {};
    if (options?.targetType) where.target_type = options.targetType;
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 50;
    const [items, total] = await Promise.all([
      prisma.evaluation_runs.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.evaluation_runs.count({ where }),
    ]);
    return {
      items: items.map(r =>
        EvaluationRun.reconstitute(
          r.id,
          r.benchmark_id,
          r.target_type as any,
          r.target_id,
          r.target_version,
          r.status as any,
          r.results as unknown as EvaluationResult[],
          r.score,
          r.started_at,
          r.completed_at,
          r.metadata as Record<string, unknown>,
          r.created_at,
          r.updated_at,
        ),
      ),
      total,
      offset,
      limit,
    };
  }

  async deleteRun(id: string): Promise<void> {
    await prisma.evaluation_runs.delete({ where: { id } });
  }
}
