import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationRunnerService, ExactMatchStrategy, PartialMatchStrategy } from '../evaluation-runner.service.js';
import { InMemoryEvaluationRepository } from '../../../testing/adapters/in-memory-evaluation-repository.js';
import type { IEvaluationRepository } from '../../domain/evaluation-repository.interface.js';
import { BenchmarkStatus } from '../../domain/benchmark.entity.js';
import { EvaluationTargetType, EvaluationRunStatus } from '../../domain/evaluation-run.entity.js';
import { GoldenDataset } from '../../domain/golden-dataset.entity.js';
import { BenchmarkEntity } from '../../domain/benchmark.entity.js';

describe('EvaluationRunnerService', () => {
  let service: EvaluationRunnerService;
  let repo: IEvaluationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationRunnerService,
        { provide: 'IEvaluationRepository', useClass: InMemoryEvaluationRepository },
      ],
    }).compile();

    service = module.get(EvaluationRunnerService);
    repo = module.get('IEvaluationRepository');
  });

  afterEach(async () => {
    const runs = await repo.listRuns();
    for (const r of runs.items) await repo.deleteRun(r.id);
    const benchmarks = await repo.listBenchmarks();
    for (const b of benchmarks.items) await repo.deleteBenchmark(b.id);
    const datasets = await repo.listDatasets();
    for (const d of datasets.items) await repo.deleteDataset(d.id);
  });

  async function setupBenchmarkAndDataset(
    items: { input: Record<string, unknown>; expectedOutput: Record<string, unknown> }[],
    metrics: string[] = ['accuracy'],
  ) {
    const dataset = GoldenDataset.create({
      name: 'test-ds',
      description: 'Test dataset',
      items,
      tags: [],
    });
    await repo.saveDataset(dataset);

    const benchmark = BenchmarkEntity.create({
      name: 'test-bench',
      description: 'Test benchmark',
      datasetId: dataset.id,
      metrics,
      tags: [],
    });
    const active = BenchmarkEntity.reconstitute(
      benchmark.id,
      benchmark.name,
      benchmark.description,
      benchmark.datasetId,
      benchmark.metrics,
      benchmark.tags,
      benchmark.version,
      BenchmarkStatus.ACTIVE,
      benchmark.metadata,
      benchmark.createdAt,
      new Date(),
    );
    await repo.saveBenchmark(active);

    return { dataset, benchmark: active };
  }

  describe('run evaluation with exact match', () => {
    it('should return perfect score when all items match exactly', async () => {
      service.registerStrategy('accuracy', new ExactMatchStrategy());

      const { benchmark } = await setupBenchmarkAndDataset([
        { input: { result: 'a' }, expectedOutput: { result: 'a' } },
        { input: { result: 'b' }, expectedOutput: { result: 'b' } },
      ], ['accuracy']);

      const run = await service.run(benchmark.id, EvaluationTargetType.TOOL, 'tool-1', 1);

      expect(run.status).toBe(EvaluationRunStatus.COMPLETED);
      expect(run.score).toBe(1);
      expect(run.results.length).toBe(2);
      expect(run.results.every(r => r.value === 1)).toBe(true);
    });

    it('should return zero score when nothing matches', async () => {
      service.registerStrategy('accuracy', new ExactMatchStrategy());

      const { benchmark } = await setupBenchmarkAndDataset([
        { input: { x: 1 }, expectedOutput: { result: 'a' } },
      ], ['accuracy']);

      const run = await service.run(benchmark.id, EvaluationTargetType.TOOL, 'tool-1', 1);

      expect(run.status).toBe(EvaluationRunStatus.COMPLETED);
      expect(run.score).toBe(0);
      expect(run.results[0].value).toBe(0);
    });
  });

  describe('run evaluation with partial match', () => {
    it('should calculate partial scores', async () => {
      service.registerStrategy('coherence', new PartialMatchStrategy());

      const { benchmark } = await setupBenchmarkAndDataset([
        { input: { a: 1, b: 2 }, expectedOutput: { a: 1, b: 99, c: 3 } },
      ], ['coherence']);

      const run = await service.run(benchmark.id, EvaluationTargetType.PROMPT, 'prompt-1', 1);

      expect(run.status).toBe(EvaluationRunStatus.COMPLETED);
      expect(run.score).toBeCloseTo(1 / 3, 5);
    });
  });

  describe('score calculation', () => {
    it('should compute aggregate score across multiple metrics and items', async () => {
      service.registerStrategy('accuracy', new ExactMatchStrategy());
      service.registerStrategy('relevance', new PartialMatchStrategy());

      const { benchmark } = await setupBenchmarkAndDataset([
        { input: { result: 'a' }, expectedOutput: { result: 'a' } },
      ], ['accuracy', 'relevance']);

      const run = await service.run(benchmark.id, EvaluationTargetType.AGENT, 'agent-1', 1);

      expect(run.status).toBe(EvaluationRunStatus.COMPLETED);
      expect(run.results.length).toBe(2);
      expect(run.score).toBeDefined();
      expect(typeof run.score).toBe('number');
    });
  });

  describe('target by type', () => {
    it('should run evaluation for each target type', async () => {
      service.registerStrategy('accuracy', new ExactMatchStrategy());

      const { benchmark } = await setupBenchmarkAndDataset([
        { input: { result: 'a' }, expectedOutput: { result: 'a' } },
      ], ['accuracy']);

      for (const targetType of Object.values(EvaluationTargetType)) {
        const run = await service.run(benchmark.id, targetType, `${targetType}-id`, 1);
        expect(run.status).toBe(EvaluationRunStatus.COMPLETED);
        expect(run.targetType).toBe(targetType);
      }
    });
  });
});
