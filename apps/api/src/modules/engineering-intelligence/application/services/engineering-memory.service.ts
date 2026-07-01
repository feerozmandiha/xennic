import { Injectable, Logger } from '@nestjs/common';
import type { IEngineeringMemory } from '../../domain/interfaces/engineering-memory.interface.js';
import type { ExecutionMemory, WorkflowNodeState, CalculationResult } from '../../domain/types/ei.types.js';

@Injectable()
export class EngineeringMemory implements IEngineeringMemory {
  private readonly logger = new Logger(EngineeringMemory.name);
  private readonly sessions = new Map<string, ExecutionMemory>();

  async createSession(sessionId: string, workflowId: string, context?: Record<string, unknown>): Promise<ExecutionMemory> {
    const memory: ExecutionMemory = {
      sessionId, workflowId,
      completedSteps: {},
      intermediateCalculations: {},
      evidenceCache: {},
      reasoningState: {},
      context: context ?? {},
    };
    this.sessions.set(sessionId, memory);
    return memory;
  }

  async getSession(sessionId: string): Promise<ExecutionMemory | null> {
    return this.sessions.get(sessionId) ?? null;
  }

  async updateStep(sessionId: string, nodeId: string, state: WorkflowNodeState): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    session.completedSteps[nodeId] = state;
  }

  async cacheCalculation(sessionId: string, calcId: string, result: CalculationResult): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    session.intermediateCalculations[calcId] = result;
  }

  async getCachedCalculation(sessionId: string, calcId: string): Promise<CalculationResult | null> {
    const session = this.sessions.get(sessionId);
    return session?.intermediateCalculations[calcId] ?? null;
  }

  async getEvidenceCache(sessionId: string): Promise<unknown[]> {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    return Object.values(session.evidenceCache).flat();
  }

  async clearSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    this.logger.debug(`Session ${sessionId} cleared`);
  }
}
