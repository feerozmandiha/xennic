export enum AgentRole {
  PLANNER = 'planner',
  COORDINATOR = 'coordinator',
  WORKER = 'worker',
  REVIEWER = 'reviewer',
  CRITIC = 'critic',
  SUPERVISOR = 'supervisor',
}

export enum AgentCapability {
  PLAN = 'plan',
  EXECUTE = 'execute',
  REVIEW = 'review',
  CRITIQUE = 'critique',
  SUPERVISE = 'supervise',
  COORDINATE = 'coordinate',
}

export type AgentStatus = 'idle' | 'busy' | 'error';

export interface AgentAssignment {
  agentId: string;
  role: AgentRole;
  capabilities: AgentCapability[];
  status: AgentStatus;
  metadata?: Record<string, unknown>;
}
