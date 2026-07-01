export interface EngineeringAssumption {
  id: string;
  description: string;
  source: string;
  verified: boolean;
  justification: string;
}

export interface Constraint {
  type: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between';
  value: unknown;
  description: string;
}

export interface ReasoningGoal {
  id: string;
  description: string;
  type: 'calculation' | 'selection' | 'verification' | 'analysis' | 'estimation' | 'compliance';
  constraints: Constraint[];
  evidence: string[];
}

export interface StepTrace {
  stepId: string;
  parentId: string | null;
  timestamp: number;
  duration: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  error?: string;
}

export interface ReasoningStep {
  id: string;
  type: 'decompose' | 'retrieve' | 'calculate' | 'decide' | 'verify' | 'conclude';
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  evidence: string[];
  assumptions: EngineeringAssumption[];
  confidence: number;
  trace: StepTrace;
}

export type PlanNodeType =
  | 'retrieval' | 'calculation' | 'decision' | 'verification'
  | 'transformation' | 'aggregation' | 'report';

export interface PlanNode {
  id: string;
  type: PlanNodeType;
  label: string;
  tool?: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  evidence: string[];
  config: Record<string, unknown>;
}

export interface PlanEdge {
  from: string;
  to: string;
  condition?: string;
  data: string[];
}

export interface PlanMetadata {
  createdBy: string;
  createdAt: number;
  version: string;
  domain: string;
  tags: string[];
}

export interface ExecutionPlan {
  id: string;
  goal: ReasoningGoal;
  dag: PlanNode[];
  edges: PlanEdge[];
  metadata: PlanMetadata;
}

export type WorkflowStatus =
  | 'pending' | 'running' | 'paused' | 'completed'
  | 'failed' | 'cancelled' | 'timed_out';

export interface WorkflowNodeState {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  retryCount: number;
  output: Record<string, unknown>;
  error?: string;
  startTime?: number;
  endTime?: number;
}

export interface WorkflowExecution {
  id: string;
  planId: string;
  status: WorkflowStatus;
  nodes: WorkflowNodeState[];
  checkpoint: string | null;
  version: number;
  startTime: number;
  endTime?: number;
  error?: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  capability: string[];
  safetyLevel: 'informational' | 'advisory' | 'critical';
  requiredEvidence: string[];
  supportedDomains: string[];
}

export interface CalculationProvenance {
  toolId: string;
  toolVersion: string;
  inputHash: string;
  timestamp: number;
  duration: number;
  parameters: Record<string, unknown>;
}

export interface CalculationResult {
  id: string;
  toolId: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  cached: boolean;
  duration: number;
  provenance: CalculationProvenance;
  checksum: string;
}

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  properties: Record<string, unknown>;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  weight?: number;
  properties: Record<string, unknown>;
}

export interface GraphPath {
  nodes: GraphNode[];
  edges: GraphEdge[];
  totalWeight: number;
}

export interface DecisionAlternative {
  id: string;
  description: string;
  pros: string[];
  cons: string[];
  score: number;
}

export interface RejectedAlternative {
  alternativeId: string;
  reason: string;
  evidentialBasis: string;
}

export interface EngineeringDecision {
  id: string;
  title: string;
  description: string;
  inputs: Record<string, unknown>;
  evidence: string[];
  appliedStandards: string[];
  reasoningSteps: ReasoningStep[];
  calculations: CalculationResult[];
  confidence: number;
  alternatives: DecisionAlternative[];
  rejectedAlternatives: RejectedAlternative[];
  finalDecision: string;
  timestamp: number;
}

export type ReportFormat = 'markdown' | 'json' | 'pdf-ready' | 'machine';

export type ReportSectionType =
  | 'executive-summary' | 'analysis' | 'evidence' | 'calculations'
  | 'references' | 'appendix' | 'decision';

export interface ReportSection {
  id: string;
  type: ReportSectionType;
  title: string;
  content: string;
  data: Record<string, unknown>;
  order: number;
}

export interface EngineeringReport {
  id: string;
  title: string;
  format: ReportFormat;
  sections: ReportSection[];
  generatedAt: number;
  traceId: string;
}

export interface ExecutionMemory {
  sessionId: string;
  workflowId: string;
  completedSteps: Record<string, WorkflowNodeState>;
  intermediateCalculations: Record<string, CalculationResult>;
  evidenceCache: Record<string, unknown[]>;
  reasoningState: Record<string, unknown>;
  context: Record<string, unknown>;
}

export interface AuditTiming {
  totalDuration: number;
  perStep: Record<string, number>;
  retrievalTime: number;
  calculationTime: number;
  decisionTime: number;
}

export interface AuditRecord {
  executionId: string;
  traceId: string;
  workflowGraph: WorkflowExecution;
  reasoningLog: ReasoningStep[];
  calculationLog: CalculationResult[];
  timing: AuditTiming;
  decisionHistory: EngineeringDecision[];
  validationStatus: 'passed' | 'failed' | 'pending';
  timestamp: number;
}

export interface IntelligenceQuery {
  goal: string;
  goalType: ReasoningGoal['type'];
  workspaceId: string;
  domain: string;
  constraints?: Constraint[];
  options?: {
    maxSteps?: number;
    timeout?: number;
    includeReport?: boolean;
    format?: ReportFormat;
  };
}

export interface IntelligenceResponse {
  executionId: string;
  traceId: string;
  decisions: EngineeringDecision[];
  report?: EngineeringReport;
  audit: AuditRecord;
  metrics: {
    totalDuration: number;
    stepCount: number;
    calculationCount: number;
    evidenceCount: number;
    confidence: number;
  };
}
