import { Test, TestingModule } from '@nestjs/testing';
import { BenchmarkRegistryService } from '../benchmark-registry.service.js';
import { InMemoryEvaluationRepository } from '../../../testing/adapters/in-memory-evaluation-repository.js';
import type { IEvaluationRepository } from '../../domain/evaluation-repository.interface.js';
import { BenchmarkStatus } from '../../domain/benchmark.entity.js';

describe('BenchmarkRegistryService', () => {
  let service: BenchmarkRegistryService;
  let repo: IEvaluationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BenchmarkRegistryService,
        { provide: 'IEvaluationRepository', useClass: InMemoryEvaluationRepository },
      ],
    }).compile();

    service = module.get(BenchmarkRegistryService);
    repo = module.get('IEvaluationRepository');
  });

  afterEach(async () => {
    const all = await repo.listBenchmarks();
    for (const item of all.items) {
      await repo.deleteBenchmark(item.id);
    }
  });

  function makeBenchmark(name: string, metrics: string[] = ['accuracy'], tags: string[] = []) {
    return service.register({
      name,
      description: `Benchmark for ${name}`,
      datasetId: 'ds-1',
      metrics,
      tags,
    });
  }

  describe('register', () => {
    it('should register a new benchmark with draft status', async () => {
      const b = await service.register({
        name: 'qa-benchmark',
        description: 'QA evaluation benchmark',
        datasetId: 'ds-qa-1',
        metrics: ['accuracy', 'f1'],
        tags: ['qa', 'nlp'],
      });

      expect(b.name).toBe('qa-benchmark');
      expect(b.status).toBe(BenchmarkStatus.DRAFT);
      expect(b.version).toBe(1);
      expect(b.id).toBeDefined();
    });
  });

  describe('findByMetric', () => {
    it('should find benchmarks by metric', async () => {
      await makeBenchmark('b1', ['accuracy', 'f1']);
      await makeBenchmark('b2', ['latency']);
      await makeBenchmark('b3', ['accuracy']);

      const results = await service.findByMetric('accuracy');
      expect(results.length).toBe(2);
    });

    it('should return empty array when no benchmark has the metric', async () => {
      await makeBenchmark('b1', ['f1']);
      const results = await service.findByMetric('coherence');
      expect(results.length).toBe(0);
    });
  });

  describe('findByTag', () => {
    it('should find benchmarks by tag', async () => {
      await makeBenchmark('b1', ['accuracy'], ['nlp', 'text']);
      await makeBenchmark('b2', ['latency'], ['performance']);

      const results = await service.findByTag('nlp');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('b1');
    });
  });

  describe('activate / archive', () => {
    it('should activate a benchmark', async () => {
      const b = await makeBenchmark('activate-me');
      const activated = await service.activate(b.id);
      expect(activated).toBeDefined();
      expect(activated!.status).toBe(BenchmarkStatus.ACTIVE);
    });

    it('should archive a benchmark', async () => {
      const b = await makeBenchmark('archive-me');
      const archived = await service.archive(b.id);
      expect(archived).toBeDefined();
      expect(archived!.status).toBe(BenchmarkStatus.ARCHIVED);
    });

    it('should return null for nonexistent benchmark', async () => {
      const result = await service.activate('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('list with pagination', () => {
    it('should return all benchmarks sorted by creation date', async () => {
      await makeBenchmark('first');
      await makeBenchmark('second');

      const result = await service.list();
      expect(result.items.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it('should respect offset and limit', async () => {
      for (let i = 0; i < 5; i++) {
        await makeBenchmark(`bench-${i}`);
      }

      const page = await service.list({ offset: 1, limit: 2 });
      expect(page.items.length).toBe(2);
      expect(page.total).toBe(5);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      const b1 = await makeBenchmark('s1', ['accuracy']);
      await makeBenchmark('s2', ['accuracy', 'latency']);
      await service.activate(b1.id);

      const stats = await service.getStats();
      expect(stats.total).toBe(2);
      expect(stats.byStatus['draft']).toBe(1);
      expect(stats.byStatus['active']).toBe(1);
      expect(stats.byMetric['accuracy']).toBe(2);
      expect(stats.byMetric['latency']).toBe(1);
    });
  });

  describe('delete', () => {
    it('should remove benchmark', async () => {
      const b = await makeBenchmark('temp');
      await service.delete(b.id);
      const found = await service.get(b.id);
      expect(found).toBeNull();
    });
  });
});
