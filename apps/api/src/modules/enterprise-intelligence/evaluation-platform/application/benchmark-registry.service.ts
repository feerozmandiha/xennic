import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IEvaluationRepository, ListOptions } from '../domain/evaluation-repository.interface.js';
import { BenchmarkEntity, BenchmarkStatus } from '../domain/benchmark.entity.js';
import type { BenchmarkData } from '../domain/benchmark.entity.js';
import type { PaginatedResult } from '../../shared/types/index.js';

export interface BenchmarkStats {
  total: number;
  byStatus: Record<string, number>;
  byMetric: Record<string, number>;
}

@Injectable()
export class BenchmarkRegistryService {
  private readonly logger = new Logger(BenchmarkRegistryService.name);

  constructor(
    @Inject('IEvaluationRepository') private readonly repo: IEvaluationRepository,
  ) {}

  async register(data: BenchmarkData): Promise<BenchmarkEntity> {
    const entity = BenchmarkEntity.create(data);
    await this.repo.saveBenchmark(entity);
    this.logger.log(`Registered benchmark "${data.name}" (${entity.id})`);
    return entity;
  }

  async get(id: string): Promise<BenchmarkEntity | null> {
    return this.repo.getBenchmark(id);
  }

  async list(options?: ListOptions): Promise<PaginatedResult<BenchmarkEntity>> {
    return this.repo.listBenchmarks(options);
  }

  async findByMetric(metric: string): Promise<BenchmarkEntity[]> {
    const result = await this.repo.listBenchmarks();
    return result.items.filter(b => b.metrics.includes(metric));
  }

  async findByTag(tag: string): Promise<BenchmarkEntity[]> {
    const result = await this.repo.listBenchmarks();
    return result.items.filter(b => b.tags.includes(tag));
  }

  async activate(id: string): Promise<BenchmarkEntity | null> {
    const entity = await this.repo.getBenchmark(id);
    if (!entity) return null;
    const updated = BenchmarkEntity.reconstitute(
      entity.id,
      entity.name,
      entity.description,
      entity.datasetId,
      entity.metrics,
      entity.tags,
      entity.version,
      BenchmarkStatus.ACTIVE,
      entity.metadata,
      entity.createdAt,
      new Date(),
    );
    await this.repo.saveBenchmark(updated);
    this.logger.log(`Activated benchmark ${id}`);
    return updated;
  }

  async archive(id: string): Promise<BenchmarkEntity | null> {
    const entity = await this.repo.getBenchmark(id);
    if (!entity) return null;
    const updated = BenchmarkEntity.reconstitute(
      entity.id,
      entity.name,
      entity.description,
      entity.datasetId,
      entity.metrics,
      entity.tags,
      entity.version,
      BenchmarkStatus.ARCHIVED,
      entity.metadata,
      entity.createdAt,
      new Date(),
    );
    await this.repo.saveBenchmark(updated);
    this.logger.log(`Archived benchmark ${id}`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repo.deleteBenchmark(id);
    this.logger.log(`Deleted benchmark ${id}`);
  }

  async getStats(): Promise<BenchmarkStats> {
    const result = await this.repo.listBenchmarks();
    const byStatus: Record<string, number> = {};
    const byMetric: Record<string, number> = {};

    for (const b of result.items) {
      byStatus[b.status] = (byStatus[b.status] ?? 0) + 1;
      for (const m of b.metrics) {
        byMetric[m] = (byMetric[m] ?? 0) + 1;
      }
    }

    return {
      total: result.total,
      byStatus,
      byMetric,
    };
  }
}
