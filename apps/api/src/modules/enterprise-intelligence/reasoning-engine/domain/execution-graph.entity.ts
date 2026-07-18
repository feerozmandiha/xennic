import { randomUUID } from 'node:crypto';
import type { ReasoningPlan, PlanStep } from './reasoning-plan.entity.js';

export enum NodeStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface ExecutionNode {
  stepId: string;
  status: NodeStatus;
  result: Record<string, unknown> | null;
  startedAt: Date | null;
  completedAt: Date | null;
  duration: number | null;
}

export interface ExecutionEdge {
  from: string;
  to: string;
}

export interface ExecutionGraphMetadata {
  totalNodes: number;
  totalEdges: number;
  maxParallelism: number;
  longestPath: number;
  planId: string;
}

export class ExecutionGraph {
  public readonly id: string;
  public readonly planId: string;
  public readonly nodes: ExecutionNode[];
  public readonly edges: ExecutionEdge[];
  public readonly status: NodeStatus;
  public readonly metadata: ExecutionGraphMetadata;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    planId: string,
    nodes: ExecutionNode[],
    edges: ExecutionEdge[],
    status: NodeStatus,
    metadata: ExecutionGraphMetadata,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.planId = planId;
    this.nodes = nodes;
    this.edges = edges;
    this.status = status;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(plan: ReasoningPlan): ExecutionGraph {
    const now = new Date();
    const nodes: ExecutionNode[] = plan.steps.map((s) => ({
      stepId: s.id,
      status: NodeStatus.PENDING,
      result: null,
      startedAt: null,
      completedAt: null,
      duration: null,
    }));

    const edges: ExecutionEdge[] = [];
    const stepMap = new Map<string, PlanStep>();
    for (const step of plan.steps) {
      stepMap.set(step.id, step);
    }

    for (const step of plan.steps) {
      for (const depId of step.dependsOn) {
        if (stepMap.has(depId)) {
          edges.push({ from: depId, to: step.id });
        }
      }
    }

    const maxParallelism = ExecutionGraph.calculateMaxParallelism(plan.steps, edges);
    const longestPath = ExecutionGraph.calculateLongestPath(plan.steps, edges);

    return new ExecutionGraph(
      randomUUID(),
      plan.id,
      nodes,
      edges,
      NodeStatus.PENDING,
      {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        maxParallelism,
        longestPath,
        planId: plan.id,
      },
      now,
      now,
    );
  }

  static reconstitute(
    id: string,
    planId: string,
    nodes: ExecutionNode[],
    edges: ExecutionEdge[],
    status: NodeStatus,
    metadata: ExecutionGraphMetadata,
    createdAt: Date,
    updatedAt: Date,
  ): ExecutionGraph {
    return new ExecutionGraph(id, planId, nodes, edges, status, metadata, createdAt, updatedAt);
  }

  withNodeStatus(
    stepId: string,
    status: NodeStatus,
    result?: Record<string, unknown>,
  ): ExecutionGraph {
    const now = new Date();
    const nodes = this.nodes.map((n) => {
      if (n.stepId !== stepId) return n;
      return {
        ...n,
        status,
        result: result ?? n.result,
        startedAt: status === NodeStatus.RUNNING ? now : n.startedAt,
        completedAt:
          status === NodeStatus.COMPLETED || status === NodeStatus.FAILED ? now : n.completedAt,
        duration:
          (status === NodeStatus.COMPLETED || status === NodeStatus.FAILED) && n.startedAt
            ? now.getTime() - n.startedAt.getTime()
            : n.duration,
      };
    });

    return new ExecutionGraph(
      this.id,
      this.planId,
      nodes,
      this.edges,
      this.status,
      this.metadata,
      this.createdAt,
      now,
    );
  }

  getReadyNodes(): ExecutionNode[] {
    const completedOrSkipped = new Set(
      this.nodes
        .filter((n) => n.status === NodeStatus.COMPLETED || n.status === NodeStatus.FAILED)
        .map((n) => n.stepId),
    );

    const pending = this.nodes.filter((n) => n.status === NodeStatus.PENDING);

    return pending.filter((n) => {
      const deps = this.edges.filter((e) => e.to === n.stepId).map((e) => e.from);
      return deps.every((depId) => completedOrSkipped.has(depId));
    });
  }

  private static calculateMaxParallelism(steps: PlanStep[], edges: ExecutionEdge[]): number {
    if (steps.length === 0) return 0;

    const inDegree = new Map<string, number>();
    for (const step of steps) {
      inDegree.set(step.id, 0);
    }
    for (const edge of edges) {
      inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
    }

    const levels = new Map<number, number>();
    const queue: { id: string; level: number }[] = [];

    for (const step of steps) {
      if ((inDegree.get(step.id) ?? 0) === 0) {
        queue.push({ id: step.id, level: 0 });
      }
    }

    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      levels.set(level, (levels.get(level) ?? 0) + 1);

      for (const edge of edges) {
        if (edge.from === id) {
          inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) - 1);
          if ((inDegree.get(edge.to) ?? 0) === 0) {
            queue.push({ id: edge.to, level: level + 1 });
          }
        }
      }
    }

    return Math.max(0, ...Array.from(levels.values()));
  }

  private static calculateLongestPath(steps: PlanStep[], edges: ExecutionEdge[]): number {
    if (steps.length === 0) return 0;

    const adj = new Map<string, string[]>();
    for (const step of steps) {
      adj.set(step.id, []);
    }
    for (const edge of edges) {
      adj.get(edge.from)?.push(edge.to);
    }

    const memo = new Map<string, number>();
    let longest = 0;

    function dfs(nodeId: string): number {
      if (memo.has(nodeId)) return memo.get(nodeId)!;
      let maxLen = 0;
      for (const neighbor of adj.get(nodeId) ?? []) {
        maxLen = Math.max(maxLen, dfs(neighbor));
      }
      memo.set(nodeId, 1 + maxLen);
      return 1 + maxLen;
    }

    for (const step of steps) {
      longest = Math.max(longest, dfs(step.id));
    }

    return longest;
  }
}
