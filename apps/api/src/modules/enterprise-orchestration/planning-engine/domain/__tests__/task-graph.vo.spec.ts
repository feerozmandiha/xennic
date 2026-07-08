import { PlanEntity } from '../plan.entity.js';
import { TaskGraph } from '../task-graph.vo.js';
import type { PlanTask, Dependency } from '../plan.entity.js';
import type { Metadata } from '../../../shared/types/index.js';

const makeMetadata = (): Metadata => ({
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'test-user',
  updatedBy: null,
});

describe('TaskGraph', () => {
  describe('create', () => {
    it('should build a DAG from a plan with tasks and dependencies', () => {
      const tasks: PlanTask[] = [
        { id: 't1', description: 'Task 1', type: 'task', status: 'pending', dependsOn: [] },
        { id: 't2', description: 'Task 2', type: 'task', status: 'pending', dependsOn: ['t1'] },
        { id: 't3', description: 'Task 3', type: 'task', status: 'pending', dependsOn: ['t2'] },
      ];
      const deps: Dependency[] = [
        { from: 't1', to: 't2', type: 'hard' },
        { from: 't2', to: 't3', type: 'hard' },
      ];

      const plan = PlanEntity.create({ goal: 'test', tasks, dependencies: deps, metadata: makeMetadata() });
      const graph = TaskGraph.create(plan);

      expect(graph.nodes).toHaveLength(3);
      expect(graph.edges).toHaveLength(2);
    });

    it('should handle plans with no dependencies', () => {
      const tasks: PlanTask[] = [
        { id: 't1', description: 'Task 1', type: 'task', status: 'pending', dependsOn: [] },
        { id: 't2', description: 'Task 2', type: 'task', status: 'pending', dependsOn: [] },
      ];

      const plan = PlanEntity.create({ goal: 'test', tasks, dependencies: [], metadata: makeMetadata() });
      const graph = TaskGraph.create(plan);

      expect(graph.nodes).toHaveLength(2);
      expect(graph.edges).toHaveLength(0);
    });
  });

  describe('topological ordering', () => {
    it('should assign correct levels', () => {
      const tasks: PlanTask[] = [
        { id: 't1', description: 'Root', type: 'task', status: 'pending', dependsOn: [] },
        { id: 't2', description: 'Child', type: 'task', status: 'pending', dependsOn: ['t1'] },
        { id: 't3', description: 'Grandchild', type: 'task', status: 'pending', dependsOn: ['t2'] },
      ];
      const deps: Dependency[] = [
        { from: 't1', to: 't2', type: 'hard' },
        { from: 't2', to: 't3', type: 'hard' },
      ];

      const plan = PlanEntity.create({ goal: 'test', tasks, dependencies: deps, metadata: makeMetadata() });
      const graph = TaskGraph.create(plan);

      expect(graph.getLevel('t1')).toBe(0);
      expect(graph.getLevel('t2')).toBe(1);
      expect(graph.getLevel('t3')).toBe(2);
    });

    it('should produce topological order', () => {
      const tasks: PlanTask[] = [
        { id: 't1', description: 'A', type: 'task', status: 'pending', dependsOn: [] },
        { id: 't2', description: 'B', type: 'task', status: 'pending', dependsOn: ['t1'] },
        { id: 't3', description: 'C', type: 'task', status: 'pending', dependsOn: ['t1'] },
        { id: 't4', description: 'D', type: 'task', status: 'pending', dependsOn: ['t2', 't3'] },
      ];
      const deps: Dependency[] = [
        { from: 't1', to: 't2', type: 'hard' },
        { from: 't1', to: 't3', type: 'hard' },
        { from: 't2', to: 't4', type: 'hard' },
        { from: 't3', to: 't4', type: 'hard' },
      ];

      const plan = PlanEntity.create({ goal: 'test', tasks, dependencies: deps, metadata: makeMetadata() });
      const graph = TaskGraph.create(plan);

      const order = graph.nodes.sort((a, b) => a.level - b.level || a.order - b.order).map(n => n.taskId);
      expect(order.indexOf('t1')).toBeLessThan(order.indexOf('t2'));
      expect(order.indexOf('t1')).toBeLessThan(order.indexOf('t3'));
      expect(order.indexOf('t2')).toBeLessThan(order.indexOf('t4'));
      expect(order.indexOf('t3')).toBeLessThan(order.indexOf('t4'));
    });
  });

  describe('getReadyTasks', () => {
    it('should return tasks with all dependencies completed', () => {
      const tasks: PlanTask[] = [
        { id: 't1', description: 'Task 1', type: 'task', status: 'pending', dependsOn: [] },
        { id: 't2', description: 'Task 2', type: 'task', status: 'pending', dependsOn: ['t1'] },
        { id: 't3', description: 'Task 3', type: 'task', status: 'pending', dependsOn: ['t1', 't2'] },
      ];
      const deps: Dependency[] = [
        { from: 't1', to: 't2', type: 'hard' },
        { from: 't2', to: 't3', type: 'hard' },
      ];

      const plan = PlanEntity.create({ goal: 'test', tasks, dependencies: deps, metadata: makeMetadata() });
      const graph = TaskGraph.create(plan);

      const ready0 = graph.getReadyTasks([]);
      expect(ready0.map(t => t.id)).toEqual(['t1']);

      const ready1 = graph.getReadyTasks(['t1']);
      expect(ready1.map(t => t.id)).toEqual(['t2']);

      const ready2 = graph.getReadyTasks(['t1', 't2']);
      expect(ready2.map(t => t.id)).toEqual(['t3']);
    });
  });

  describe('getCriticalPath', () => {
    it('should return the longest path through hard dependencies', () => {
      const tasks: PlanTask[] = [
        { id: 't1', description: 'A', type: 'task', status: 'pending', dependsOn: [] },
        { id: 't2', description: 'B', type: 'task', status: 'pending', dependsOn: ['t1'] },
        { id: 't3', description: 'C', type: 'task', status: 'pending', dependsOn: ['t1'] },
        { id: 't4', description: 'D', type: 'task', status: 'pending', dependsOn: ['t2'] },
      ];
      const deps: Dependency[] = [
        { from: 't1', to: 't2', type: 'hard' },
        { from: 't1', to: 't3', type: 'soft' },
        { from: 't2', to: 't4', type: 'hard' },
      ];

      const plan = PlanEntity.create({ goal: 'test', tasks, dependencies: deps, metadata: makeMetadata() });
      const graph = TaskGraph.create(plan);
      const criticalPath = graph.getCriticalPath();

      expect(criticalPath).toEqual(['t1', 't2', 't4']);
    });

    it('should return a single node for a plan with no dependencies', () => {
      const tasks: PlanTask[] = [
        { id: 't1', description: 'Solo', type: 'task', status: 'pending', dependsOn: [] },
      ];

      const plan = PlanEntity.create({ goal: 'test', tasks, dependencies: [], metadata: makeMetadata() });
      const graph = TaskGraph.create(plan);
      const criticalPath = graph.getCriticalPath();

      expect(criticalPath).toEqual(['t1']);
    });
  });

  describe('level assignment', () => {
    it('should assign level 0 to root tasks', () => {
      const tasks: PlanTask[] = [
        { id: 't1', description: 'Root', type: 'task', status: 'pending', dependsOn: [] },
        { id: 't2', description: 'Dependent', type: 'task', status: 'pending', dependsOn: ['t1'] },
      ];

      const plan = PlanEntity.create({ goal: 'test', tasks, dependencies: [], metadata: makeMetadata() });
      const graph = TaskGraph.create(plan);

      expect(graph.getLevel('t1')).toBe(0);
    });

    it('should return -1 for unknown task', () => {
      const plan = PlanEntity.create({ goal: 'test', tasks: [], dependencies: [], metadata: makeMetadata() });
      const graph = TaskGraph.create(plan);

      expect(graph.getLevel('nonexistent')).toBe(-1);
    });
  });
});
