import { Logger } from '@nestjs/common';
import type { BenchmarkEntity } from '../../domain/benchmark.entity.js';
import type { GoldenDataset } from '../../domain/golden-dataset.entity.js';
import type { EvaluationRun } from '../../domain/evaluation-run.entity.js';
import type { IEvaluationRepository, ListOptions } from '../../domain/evaluation-repository.interface.js';
import type { PaginatedResult } from '../../../shared/types/index.js';

export class InMemoryEvaluationRepository implements IEvaluationRepository {
  private readonly logger = new Logger(InMemoryEvaluationRepository.name);
  private readonly benchmarks = new Map<string, BenchmarkEntity>();
  private readonly datasets = new Map<string, GoldenDataset>();
  private readonly runs = new Map<string, EvaluationRun>();

  async saveBenchmark(entity: BenchmarkEntity): Promise<void> {
    this.benchmarks.set(entity.id, entity);
    this.logger.debug(`Saved benchmark ${entity.id}`);
  }

  async getBenchmark(id: string): Promise<BenchmarkEntity | null> {
    return this.benchmarks.get(id) ?? null;
  }

  async listBenchmarks(options?: ListOptions): Promise<PaginatedResult<BenchmarkEntity>> {
    let items = Array.from(this.benchmarks.values());
    if (options?.status) items = items.filter(e => e.status === options.status);
    if (options?.tag) items = items.filter(e => e.tags.includes(options.tag!));
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;
    return { items: items.slice(offset, offset + limit), total: items.length, offset, limit };
  }

  async deleteBenchmark(id: string): Promise<void> {
    this.benchmarks.delete(id);
  }

  async saveDataset(entity: GoldenDataset): Promise<void> {
    this.datasets.set(entity.id, entity);
    this.logger.debug(`Saved dataset ${entity.id}`);
  }

  async getDataset(id: string): Promise<GoldenDataset | null> {
    return this.datasets.get(id) ?? null;
  }

  async listDatasets(options?: ListOptions): Promise<PaginatedResult<GoldenDataset>> {
    let items = Array.from(this.datasets.values());
    if (options?.tag) items = items.filter(e => e.tags.includes(options.tag!));
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;
    return { items: items.slice(offset, offset + limit), total: items.length, offset, limit };
  }

  async deleteDataset(id: string): Promise<void> {
    this.datasets.delete(id);
  }

  async saveRun(entity: EvaluationRun): Promise<void> {
    this.runs.set(entity.id, entity);
    this.logger.debug(`Saved run ${entity.id}`);
  }

  async getRun(id: string): Promise<EvaluationRun | null> {
    return this.runs.get(id) ?? null;
  }

  async listRuns(options?: ListOptions): Promise<PaginatedResult<EvaluationRun>> {
    let items = Array.from(this.runs.values());
    if (options?.targetType) items = items.filter(e => e.targetType === options.targetType);
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;
    return { items: items.slice(offset, offset + limit), total: items.length, offset, limit };
  }

  async deleteRun(id: string): Promise<void> {
    this.runs.delete(id);
  }
}
