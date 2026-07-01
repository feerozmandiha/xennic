import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IWorkflowEngine } from '../../domain/interfaces/workflow-engine.interface.js';
import type { ExecutionPlan, WorkflowExecution, WorkflowNodeState, WorkflowStatus } from '../../domain/types/ei.types.js';

@Injectable()
export class WorkflowEngine implements IWorkflowEngine {
  private readonly logger = new Logger(WorkflowEngine.name);
  private readonly executions = new Map<string, WorkflowExecution>();

  async start(plan: ExecutionPlan, sessionId: string): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: randomUUID(), planId: plan.id, status: 'running', nodes: [],
      checkpoint: null, version: 1, startTime: Date.now(),
    };

    execution.nodes = plan.dag.map((node) => ({
      nodeId: node.id, status: 'pending' as const, retryCount: 0, output: {},
    }));

    this.executions.set(execution.id, execution);
    this.logger.debug(`Workflow ${execution.id} started with ${execution.nodes.length} nodes`);
    return execution;
  }

  async cancel(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'cancelled';
      execution.endTime = Date.now();
      for (const node of execution.nodes) {
        if (node.status === 'pending' || node.status === 'running') {
          node.status = 'skipped';
        }
      }
      this.logger.debug(`Workflow ${executionId} cancelled`);
    }
  }

  async pause(executionId: string): Promise<WorkflowExecution> {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'paused';
      this.logger.debug(`Workflow ${executionId} paused`);
    }
    if (!execution) throw new Error(`Execution ${executionId} not found`);
    return execution;
  }

  async resume(executionId: string): Promise<WorkflowExecution> {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'paused') {
      execution.status = 'running';
      this.logger.debug(`Workflow ${executionId} resumed`);
    }
    if (!execution) throw new Error(`Execution ${executionId} not found`);
    return execution;
  }

  async getStatus(executionId: string): Promise<WorkflowExecution> {
    const execution = this.executions.get(executionId);
    if (!execution) throw new Error(`Execution ${executionId} not found`);
    return execution;
  }

  async checkpoint(executionId: string): Promise<string> {
    const execution = this.executions.get(executionId);
    if (!execution) throw new Error(`Execution ${executionId} not found`);
    const checkpointId = randomUUID();
    execution.checkpoint = checkpointId;
    execution.version++;
    this.logger.debug(`Checkpoint ${checkpointId} for workflow ${executionId}`);
    return checkpointId;
  }

  async recover(checkpointId: string): Promise<WorkflowExecution> {
    const execution = [...this.executions.values()].find((e) => e.checkpoint === checkpointId);
    if (!execution) throw new Error(`Checkpoint ${checkpointId} not found`);
    execution.status = 'running';
    execution.version++;
    this.logger.debug(`Recovered workflow ${execution.id} from checkpoint ${checkpointId}`);
    return execution;
  }

  async executeNode(execution: WorkflowExecution, nodeId: string): Promise<WorkflowNodeState> {
    const nodeState = execution.nodes.find((n) => n.nodeId === nodeId);
    if (!nodeState) throw new Error(`Node ${nodeId} not found in execution ${execution.id}`);

    nodeState.status = 'running';
    nodeState.startTime = Date.now();

    await new Promise((resolve) => setTimeout(resolve, 5));

    nodeState.status = 'completed';
    nodeState.endTime = Date.now();
    nodeState.output = { nodeId, executed: true, timestamp: Date.now() };

    return nodeState;
  }
}
