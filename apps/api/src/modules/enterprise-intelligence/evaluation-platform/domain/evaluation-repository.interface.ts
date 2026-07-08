import type { BenchmarkEntity } from './benchmark.entity.js';
import type { GoldenDataset } from './golden-dataset.entity.js';
import type { EvaluationRun } from './evaluation-run.entity.js';
import type { PaginatedResult } from '../../shared/types/index.js';

export interface ListOptions {
  offset?: number;
  limit?: number;
  status?: string;
  tag?: string;
  targetType?: string;
}

export interface IEvaluationRepository {
  saveBenchmark(entity: BenchmarkEntity): Promise<void>;
  getBenchmark(id: string): Promise<BenchmarkEntity | null>;
  listBenchmarks(options?: ListOptions): Promise<PaginatedResult<BenchmarkEntity>>;
  deleteBenchmark(id: string): Promise<void>;

  saveDataset(entity: GoldenDataset): Promise<void>;
  getDataset(id: string): Promise<GoldenDataset | null>;
  listDatasets(options?: ListOptions): Promise<PaginatedResult<GoldenDataset>>;
  deleteDataset(id: string): Promise<void>;

  saveRun(entity: EvaluationRun): Promise<void>;
  getRun(id: string): Promise<EvaluationRun | null>;
  listRuns(options?: ListOptions): Promise<PaginatedResult<EvaluationRun>>;
  deleteRun(id: string): Promise<void>;
}
