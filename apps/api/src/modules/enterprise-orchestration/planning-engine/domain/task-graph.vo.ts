import type { PlanTask, DependencyType } from './plan.entity.js';
import type { PlanEntity } from './plan.entity.js';

export interface TaskNode {
  taskId: string;
  level: number;
  order: number;
}

export interface TaskEdge {
  from: string;
  to: string;
  type: DependencyType;
}

export class TaskGraph {
  public readonly nodes: TaskNode[];
  public readonly edges: TaskEdge[];

  private constructor(nodes: TaskNode[], edges: TaskEdge[]) {
    this.nodes = nodes;
    this.edges = edges;
  }

  static create(plan: PlanEntity): TaskGraph {
    const adjacency = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    const taskMap = new Map<string, PlanTask>();

    for (const task of plan.tasks) {
      adjacency.set(task.id, []);
      inDegree.set(task.id, 0);
      taskMap.set(task.id, task);
    }

    for (const dep of plan.dependencies) {
      const deps = adjacency.get(dep.from);
      if (deps) {
        deps.push(dep.to);
      }
      const deg = inDegree.get(dep.to);
      if (deg !== undefined) {
        inDegree.set(dep.to, deg + 1);
      }
    }

    for (const task of plan.tasks) {
      for (const depId of task.dependsOn) {
        const deps = adjacency.get(depId);
        if (deps) {
          deps.push(task.id);
        }
        const deg = inDegree.get(task.id);
        if (deg !== undefined) {
          inDegree.set(task.id, deg + 1);
        }
      }
    }

    const levels = new Map<string, number>();
    const edges: TaskEdge[] = [];
    const visited = new Set<string>();
    const queue: string[] = [];

    for (const [id, deg] of inDegree) {
      if (deg === 0) {
        queue.push(id);
        levels.set(id, 0);
      }
    }

    for (const dep of plan.dependencies) {
      edges.push({ from: dep.from, to: dep.to, type: dep.type });
    }
    for (const task of plan.tasks) {
      for (const depId of task.dependsOn) {
        if (!edges.some((e) => e.from === depId && e.to === task.id)) {
          edges.push({ from: depId, to: task.id, type: 'hard' });
        }
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      visited.add(current);
      const currentLevel = levels.get(current) ?? 0;

      const neighbors = adjacency.get(current) ?? [];
      for (const neighbor of neighbors) {
        const existingLevel = levels.get(neighbor) ?? 0;
        const newLevel = currentLevel + 1;
        if (newLevel > existingLevel) {
          levels.set(neighbor, newLevel);
        }

        const deg = inDegree.get(neighbor);
        if (deg !== undefined) {
          inDegree.set(neighbor, deg - 1);
          if (inDegree.get(neighbor) === 0) {
            queue.push(neighbor);
          }
        }
      }
    }

    const unvisited = plan.tasks.filter((t) => !visited.has(t.id));
    for (const task of unvisited) {
      levels.set(task.id, levels.size);
      visited.add(task.id);
    }

    const byLevel = new Map<number, string[]>();
    for (const [taskId, level] of levels) {
      const list = byLevel.get(level) ?? [];
      list.push(taskId);
      byLevel.set(level, list);
    }

    const nodes: TaskNode[] = [];
    for (const [level, taskIds] of [...byLevel.entries()].sort((a, b) => a[0] - b[0])) {
      for (let order = 0; order < taskIds.length; order++) {
        nodes.push({ taskId: taskIds[order]!, level, order });
      }
    }

    return new TaskGraph(nodes, edges);
  }

  getReadyTasks(completedIds: string[]): PlanTask[] {
    const completed = new Set(completedIds);
    return this.nodes
      .filter((node) => {
        if (completed.has(node.taskId)) {
          return false;
        }
        const deps = this.edges.filter((e) => e.to === node.taskId).map((e) => e.from);
        return deps.every((d) => completed.has(d));
      })
      .map((n) => ({
        id: n.taskId,
        description: '',
        type: '',
        status: 'pending' as const,
        dependsOn: [],
      }));
  }

  getLevel(taskId: string): number {
    return this.nodes.find((n) => n.taskId === taskId)?.level ?? -1;
  }

  getCriticalPath(): string[] {
    const hardEdges = this.edges.filter((e) => e.type === 'hard');
    const fromMap = new Map<string, string[]>();
    const toMap = new Map<string, string[]>();
    const allNodes = new Set<string>();

    for (const node of this.nodes) {
      allNodes.add(node.taskId);
    }

    for (const edge of hardEdges) {
      const list = fromMap.get(edge.from) ?? [];
      list.push(edge.to);
      fromMap.set(edge.from, list);
    }

    for (const e of hardEdges) {
      const list = toMap.get(e.to) ?? [];
      list.push(e.from);
      toMap.set(e.to, list);
    }

    const dist = new Map<string, number>();
    const prev = new Map<string, string | null>();

    for (const node of allNodes) {
      dist.set(node, -Infinity);
      prev.set(node, null);
    }

    const roots = [...allNodes].filter((n) => !toMap.has(n));
    for (const root of roots) {
      dist.set(root, 0);
    }
    if (roots.length === 0 && allNodes.size > 0) {
      const first = [...allNodes][0]!;
      dist.set(first, 0);
    }

    for (const node of this.nodes) {
      if (!allNodes.has(node.taskId)) {
        continue;
      }
      const currentDist = dist.get(node.taskId) ?? -Infinity;
      const neighbors = fromMap.get(node.taskId) ?? [];
      for (const neighbor of neighbors) {
        const newDist = currentDist + 1;
        if (newDist > (dist.get(neighbor) ?? -Infinity)) {
          dist.set(neighbor, newDist);
          prev.set(neighbor, node.taskId);
        }
      }
    }

    let maxDist = -Infinity;
    let endNode: string | null = null;
    for (const [node, d] of dist) {
      if (d > maxDist) {
        maxDist = d;
        endNode = node;
      }
    }

    const path: string[] = [];
    let current: string | null = endNode;
    while (current !== null) {
      path.unshift(current);
      current = prev.get(current) ?? null;
    }

    return path;
  }
}
