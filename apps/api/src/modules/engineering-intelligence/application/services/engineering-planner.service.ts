import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IEngineeringPlanner } from '../../domain/interfaces/engineering-planner.interface.js';
import type { ReasoningGoal, ExecutionPlan, PlanNode, PlanEdge, PlanNodeType, PlanMetadata } from '../../domain/types/ei.types.js';

@Injectable()
export class EngineeringPlanner implements IEngineeringPlanner {
  private readonly logger = new Logger(EngineeringPlanner.name);

  async createPlan(goal: ReasoningGoal): Promise<ExecutionPlan> {
    const nodes: PlanNode[] = [];
    const edges: PlanEdge[] = [];

    const retrievalNode: PlanNode = {
      id: randomUUID(), type: 'retrieval', label: 'Retrieve Evidence',
      input: { query: goal.description, evidence: goal.evidence }, output: {}, evidence: [], config: {},
    };
    nodes.push(retrievalNode);

    const calcNode: PlanNode = {
      id: randomUUID(), type: 'calculation', label: this.getCalculationLabel(goal.type),
      input: { constraints: goal.constraints }, output: {}, evidence: [], config: {},
    };
    nodes.push(calcNode);
    edges.push({ from: retrievalNode.id, to: calcNode.id, data: ['evidence'] });

    const decisionNode: PlanNode = {
      id: randomUUID(), type: 'decision', label: 'Make Decision',
      input: {}, output: {}, evidence: [], config: {},
    };
    nodes.push(decisionNode);
    edges.push({ from: calcNode.id, to: decisionNode.id, data: ['calculation_result'] });

    const reportNode: PlanNode = {
      id: randomUUID(), type: 'report', label: 'Generate Report',
      input: {}, output: {}, evidence: [], config: {},
    };
    nodes.push(reportNode);
    edges.push({ from: decisionNode.id, to: reportNode.id, data: ['decision'] });

    const plan: ExecutionPlan = {
      id: randomUUID(),
      goal,
      dag: nodes,
      edges,
      metadata: { createdBy: 'system', createdAt: Date.now(), version: '1.0.0', domain: goal.type, tags: [goal.type] },
    };

    this.logger.debug(`Created plan ${plan.id} with ${nodes.length} nodes for goal ${goal.id}`);
    return plan;
  }

  async validatePlan(plan: ExecutionPlan): Promise<boolean> {
    if (!plan.dag.length) return false;
    if (!plan.edges.length) return false;
    const nodeIds = new Set(plan.dag.map((n) => n.id));
    for (const edge of plan.edges) {
      if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) return false;
    }
    return true;
  }

  async getPlan(planId: string): Promise<ExecutionPlan | null> {
    this.logger.warn(`getPlan(${planId}) not persisted`);
    return null;
  }

  getSupportedPlanTypes(): PlanNodeType[] {
    return ['retrieval', 'calculation', 'decision', 'verification', 'transformation', 'aggregation', 'report'];
  }

  private getCalculationLabel(type: string): string {
    const labels: Record<string, string> = {
      calculation: 'Perform Calculation',
      selection: 'Evaluate Options',
      verification: 'Verify Compliance',
      analysis: 'Analyze System',
      estimation: 'Estimate Values',
      compliance: 'Check Compliance',
    };
    return labels[type] ?? 'Execute Calculation';
  }
}
