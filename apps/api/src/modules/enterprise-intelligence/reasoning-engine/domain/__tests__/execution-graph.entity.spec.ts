import { ExecutionGraph, NodeStatus } from '../execution-graph.entity.js';
import { ReasoningPlan } from '../reasoning-plan.entity.js';

function makePlan(steps: { description: string; deps: string[] }[]): ReasoningPlan {
  const planSteps = steps.map((s, i) => ({
    description: s.description,
    order: i + 1,
    input: {},
    expectedOutput: null,
  }));

  const plan = ReasoningPlan.create('test plan', planSteps, {});

  const updatedSteps = plan.steps.map((step, i) => {
    const depIds = steps[i].deps
      .map((d) => parseInt(d, 10) - 1)
      .map((idx) => plan.steps[idx]?.id)
      .filter((id): id is string => id !== undefined);
    return { ...step, dependsOn: depIds };
  });

  return plan.withSteps(updatedSteps);
}

describe('ExecutionGraph', () => {
  describe('create()', () => {
    it('should create a graph with correct number of nodes', () => {
      const plan = makePlan([
        { description: 'Step 1', deps: [] },
        { description: 'Step 2', deps: [] },
      ]);

      const graph = ExecutionGraph.create(plan);

      expect(graph.nodes).toHaveLength(2);
      expect(graph.metadata.totalNodes).toBe(2);
    });

    it('should create edges based on step dependencies', () => {
      const plan = makePlan([
        { description: 'Step A', deps: [] },
        { description: 'Step B', deps: ['1'] },
        { description: 'Step C', deps: ['2'] },
      ]);

      const graph = ExecutionGraph.create(plan);

      expect(graph.edges).toHaveLength(2);
      expect(graph.edges[0].from).toBe(plan.steps[0].id);
      expect(graph.edges[0].to).toBe(plan.steps[1].id);
      expect(graph.edges[1].from).toBe(plan.steps[1].id);
      expect(graph.edges[1].to).toBe(plan.steps[2].id);
    });

    it('should handle a plan with no dependencies', () => {
      const plan = makePlan([
        { description: 'A', deps: [] },
        { description: 'B', deps: [] },
        { description: 'C', deps: [] },
      ]);

      const graph = ExecutionGraph.create(plan);

      expect(graph.edges).toHaveLength(0);
      expect(graph.metadata.totalEdges).toBe(0);
    });

    it('should calculate correct max parallelism', () => {
      const plan = makePlan([
        { description: 'Root', deps: [] },
        { description: 'Child A', deps: ['1'] },
        { description: 'Child B', deps: ['1'] },
        { description: 'Leaf', deps: ['2', '3'] },
      ]);

      const graph = ExecutionGraph.create(plan);

      expect(graph.metadata.maxParallelism).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getReadyNodes()', () => {
    it('should return all nodes when no dependencies', () => {
      const plan = makePlan([
        { description: 'A', deps: [] },
        { description: 'B', deps: [] },
      ]);

      const graph = ExecutionGraph.create(plan);
      const ready = graph.getReadyNodes();

      expect(ready).toHaveLength(2);
    });

    it('should return only nodes whose dependencies are completed', () => {
      const plan = makePlan([
        { description: 'Root', deps: [] },
        { description: 'Dependent', deps: ['1'] },
      ]);

      let graph = ExecutionGraph.create(plan);

      let ready = graph.getReadyNodes();
      expect(ready).toHaveLength(1);

      graph = graph.withNodeStatus(plan.steps[0].id, NodeStatus.COMPLETED);

      ready = graph.getReadyNodes();
      expect(ready).toHaveLength(1);
      expect(ready[0].stepId).toBe(plan.steps[1].id);
    });

    it('should not return completed or running nodes', () => {
      const plan = makePlan([
        { description: 'A', deps: [] },
        { description: 'B', deps: [] },
        { description: 'C', deps: [] },
      ]);

      let graph = ExecutionGraph.create(plan);
      graph = graph.withNodeStatus(plan.steps[0].id, NodeStatus.RUNNING);
      graph = graph.withNodeStatus(plan.steps[1].id, NodeStatus.COMPLETED);

      const ready = graph.getReadyNodes();
      expect(ready).toHaveLength(1);
      expect(ready[0].stepId).toBe(plan.steps[2].id);
    });
  });

  describe('withNodeStatus()', () => {
    it('should update node status and set timestamps', () => {
      const plan = makePlan([{ description: 'Step', deps: [] }]);
      const graph = ExecutionGraph.create(plan);

      const running = graph.withNodeStatus(plan.steps[0].id, NodeStatus.RUNNING);
      expect(running.nodes[0].startedAt).toBeInstanceOf(Date);
      expect(running.nodes[0].status).toBe(NodeStatus.RUNNING);

      const completed = running.withNodeStatus(plan.steps[0].id, NodeStatus.COMPLETED, {
        result: 'ok',
      });
      expect(completed.nodes[0].completedAt).toBeInstanceOf(Date);
      expect(completed.nodes[0].duration).toBeGreaterThanOrEqual(0);
      expect(completed.nodes[0].result).toEqual({ result: 'ok' });
    });
  });

  describe('reconstitute()', () => {
    it('should restore a graph from saved state', () => {
      const plan = makePlan([{ description: 'Step', deps: [] }]);
      const original = ExecutionGraph.create(plan);

      const restored = ExecutionGraph.reconstitute(
        original.id,
        original.planId,
        original.nodes,
        original.edges,
        original.status,
        original.metadata,
        original.createdAt,
        original.updatedAt,
      );

      expect(restored.id).toBe(original.id);
      expect(restored.planId).toBe(original.planId);
      expect(restored.nodes).toHaveLength(original.nodes.length);
      expect(restored.edges).toHaveLength(original.edges.length);
    });
  });
});
