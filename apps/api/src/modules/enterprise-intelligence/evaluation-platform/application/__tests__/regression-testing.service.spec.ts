import { Test, TestingModule } from '@nestjs/testing';
import { RegressionTestingService } from '../regression-testing.service.js';
import { InMemoryEvaluationRepository } from '../../testing/adapters/in-memory-evaluation-repository.js';
import type { IEvaluationRepository } from '../../domain/evaluation-repository.interface.js';
import {
  EvaluationRun,
  EvaluationRunStatus,
  EvaluationTargetType,
} from '../../domain/evaluation-run.entity.js';

describe('RegressionTestingService', () => {
  let service: RegressionTestingService;
  let repo: IEvaluationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegressionTestingService,
        { provide: 'IEvaluationRepository', useClass: InMemoryEvaluationRepository },
      ],
    }).compile();

    service = module.get(RegressionTestingService);
    repo = module.get('IEvaluationRepository');
  });

  afterEach(async () => {
    const runs = await repo.listRuns();
    for (const r of runs.items) await repo.deleteRun(r.id);
  });

  function makeRun(
    targetType: EvaluationTargetType,
    targetId: string,
    score: number | null,
    completedAt: Date,
    results: { metric: string; value: number }[] = [],
  ): EvaluationRun {
    const created = EvaluationRun.create({
      benchmarkId: 'bench-1',
      targetType,
      targetId,
      targetVersion: 1,
    });
    return EvaluationRun.reconstitute(
      created.id,
      created.benchmarkId,
      created.targetType,
      created.targetId,
      created.targetVersion,
      EvaluationRunStatus.COMPLETED,
      results.map((r) => ({ metric: r.metric, value: r.value })),
      score,
      new Date(completedAt.getTime() - 1000),
      completedAt,
      created.metadata,
      created.createdAt,
      completedAt,
    );
  }

  describe('detectRegression with improvement', () => {
    it('should report positive delta when score improves', async () => {
      const previous = makeRun(EvaluationTargetType.SKILL, 'skill-1', 0.6, new Date('2025-01-01'), [
        { metric: 'accuracy', value: 0.6 },
      ]);
      const current = makeRun(EvaluationTargetType.SKILL, 'skill-1', 0.9, new Date('2025-06-01'), [
        { metric: 'accuracy', value: 0.9 },
      ]);

      await repo.saveRun(previous);
      await repo.saveRun(current);

      const report = await service.detectRegression(previous.id, current.id);
      expect(report.isRegressed).toBe(false);
      expect(report.overallDelta).toBeCloseTo(0.3, 5);
      expect(report.overallPercentChange).toBeCloseTo(50, 5);
    });
  });

  describe('detectRegression with regression', () => {
    it('should report regression when score drops', async () => {
      const previous = makeRun(EvaluationTargetType.TOOL, 'tool-1', 0.85, new Date('2025-01-01'), [
        { metric: 'accuracy', value: 0.85 },
      ]);
      const current = makeRun(EvaluationTargetType.TOOL, 'tool-1', 0.45, new Date('2025-06-01'), [
        { metric: 'accuracy', value: 0.45 },
      ]);

      await repo.saveRun(previous);
      await repo.saveRun(current);

      const report = await service.detectRegression(previous.id, current.id);
      expect(report.isRegressed).toBe(true);
      expect(report.overallDelta).toBeCloseTo(-0.4, 5);
    });

    it('should include per-metric deltas', async () => {
      const prevR = [
        { metric: 'accuracy', value: 0.9 },
        { metric: 'f1', value: 0.8 },
      ];
      const currR = [
        { metric: 'accuracy', value: 0.7 },
        { metric: 'f1', value: 0.75 },
      ];

      const previous = makeRun(
        EvaluationTargetType.PROMPT,
        'prompt-1',
        0.85,
        new Date('2025-01-01'),
        prevR,
      );
      const current = makeRun(
        EvaluationTargetType.PROMPT,
        'prompt-1',
        0.725,
        new Date('2025-06-01'),
        currR,
      );

      await repo.saveRun(previous);
      await repo.saveRun(current);

      const report = await service.detectRegression(previous.id, current.id);
      expect(report.metrics.length).toBe(2);

      const accuracyDelta = report.metrics.find((m) => m.metric === 'accuracy');
      expect(accuracyDelta).toBeDefined();
      expect(accuracyDelta!.delta).toBeCloseTo(-0.2, 5);
    });
  });

  describe('isSignificant', () => {
    it('should return true when delta >= 0.05', () => {
      expect(service.isSignificant(0.05)).toBe(true);
      expect(service.isSignificant(0.1)).toBe(true);
      expect(service.isSignificant(-0.05)).toBe(true);
    });

    it('should return false when delta < 0.05', () => {
      expect(service.isSignificant(0.04)).toBe(false);
      expect(service.isSignificant(-0.04)).toBe(false);
      expect(service.isSignificant(0)).toBe(false);
    });
  });
});
