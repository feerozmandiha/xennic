import { Injectable } from '@nestjs/common';

export type AgentPhase =
  | 'initialized'
  | 'context_ready'
  | 'tools_resolved'
  | 'prompt_rendered'
  | 'llm_completed'
  | 'response_ready'
  | 'completed'
  | 'error';

const VALID_PHASE_TRANSITIONS: Record<AgentPhase, AgentPhase[]> = {
  initialized: ['context_ready', 'error'],
  context_ready: ['tools_resolved', 'error'],
  tools_resolved: ['prompt_rendered', 'error'],
  prompt_rendered: ['llm_completed', 'error'],
  llm_completed: ['response_ready', 'error'],
  response_ready: ['completed', 'error'],
  completed: [],
  error: ['initialized'],
};

interface AgentState {
  agentId: string;
  phase: AgentPhase;
  conversationId: string | null;
  metadata: Record<string, unknown>;
}

@Injectable()
export class AgentStateManagerService {
  private readonly _states = new Map<string, AgentState>();

  initialize(agentId: string, conversationId?: string): void {
    this._states.set(agentId, {
      agentId,
      phase: 'initialized',
      conversationId: conversationId ?? null,
      metadata: {},
    });
  }

  getPhase(agentId: string): AgentPhase | null {
    return this._states.get(agentId)?.phase ?? null;
  }

  transition(agentId: string, target: AgentPhase): void {
    const state = this._states.get(agentId);
    if (!state) {
      throw new Error(`Agent state not found: ${agentId}`);
    }

    const allowed = VALID_PHASE_TRANSITIONS[state.phase];
    if (!allowed?.includes(target)) {
      throw new Error(`Invalid agent phase transition: ${state.phase} → ${target}`);
    }

    state.phase = target;
  }

  setMetadata(agentId: string, key: string, value: unknown): void {
    const state = this._states.get(agentId);
    if (state) {
      state.metadata[key] = value;
    }
  }

  getMetadata(agentId: string, key: string): unknown {
    return this._states.get(agentId)?.metadata?.[key];
  }

  getState(agentId: string): AgentState | null {
    return this._states.get(agentId) ?? null;
  }

  remove(agentId: string): void {
    this._states.delete(agentId);
  }

  reset(agentId: string): void {
    this.initialize(agentId);
  }
}
