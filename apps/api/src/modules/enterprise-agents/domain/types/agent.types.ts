export enum AgentType {
  ELECTRICAL_ENGINEER = 'electrical_engineer',
  SOLAR_CONSULTANT = 'solar_consultant',
  PROTECTION_ENGINEER = 'protection_engineer',
  POWER_QUALITY = 'power_quality',
  RESEARCHER = 'researcher',
  DOCUMENT_ANALYST = 'document_analyst',
  DRAWING_ANALYST = 'drawing_analyst',
}

export enum AgentCapabilityType {
  CHAT = 'chat',
  CALCULATE = 'calculate',
  ANALYZE = 'analyze',
  SEARCH = 'search',
  RECOMMEND = 'recommend',
  VERIFY = 'verify',
  REPORT = 'report',
  CLASSIFY = 'classify',
  EXTRACT = 'extract',
}

export interface AgentCapability {
  type: AgentCapabilityType;
  description: string;
  requiredTools: string[];
}

export interface ToolConfig {
  toolId: string;
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  safetyLevel: SafetyLevel;
}

export enum SafetyLevel {
  SAFE = 'safe',
  REVIEW_REQUIRED = 'review_required',
  RESTRICTED = 'restricted',
}

export interface AgentDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: AgentType;
  systemPrompt: string;
  capabilities: AgentCapability[];
  toolsConfig: ToolConfig[];
  isActive: boolean;
  version: string;
  createdAt: Date;
}

export interface AgentQuery {
  query: string;
  agentSlug: string;
  sessionId?: string;
  workspaceId: string;
  context?: Record<string, unknown>;
  options?: {
    maxSteps?: number;
    includeMemory?: boolean;
    safetyLevel?: SafetyLevel;
    timeout?: number;
  };
}

export interface AgentStepResult {
  stepId: string;
  type: string;
  description: string;
  output: Record<string, unknown>;
  duration: number;
}

export interface AgentMetrics {
  totalTimeMs: number;
  stepsExecuted: number;
  toolsCalled: number;
  memoryRetrieved: number;
  safetyScore: number;
}

export interface AgentResponse {
  success: boolean;
  data?: {
    response: string;
    agentSlug: string;
    agentName: string;
    sessionId: string;
    steps?: AgentStepResult[];
    toolsUsed?: ToolExecutionResult[];
    memoryUsed?: AgentMemoryEntry[];
    safetyCheck?: SafetyValidationResult;
    metrics: AgentMetrics;
  };
  error?: string;
}

export interface ToolExecutionRequest {
  toolId: string;
  input: Record<string, unknown>;
  agentId: string;
  sessionId: string;
  workspaceId: string;
}

export interface ToolProvenance {
  toolId: string;
  agentId: string;
  sessionId: string;
  timestamp: number;
  inputHash: string;
  outputHash: string;
}

export interface ToolExecutionResult {
  toolId: string;
  toolName: string;
  output: Record<string, unknown>;
  success: boolean;
  executionTimeMs: number;
  error?: string;
  provenance: ToolProvenance;
}

export interface AgentTask {
  taskId: string;
  agentId: string;
  agentSlug: string;
  input: Record<string, unknown>;
  context: Record<string, unknown>;
  priority: number;
  status: TaskStatus;
  dependsOn: string[];
  createdAt: number;
}

export enum TaskStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ExecutionStrategy {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  HYBRID = 'hybrid',
}

export interface OrchestrationPlan {
  planId: string;
  query: string;
  tasks: AgentTask[];
  coordinatorSlug: string;
  executionStrategy: ExecutionStrategy;
  createdAt: number;
}

export interface AgentMemoryEntry {
  id: string;
  sessionId: string;
  agentId: string;
  type: MemoryType;
  content: unknown;
  timestamp: number;
  ttl?: number;
  metadata?: Record<string, unknown>;
}

export enum MemoryType {
  CONVERSATION = 'conversation',
  FACT = 'fact',
  DECISION = 'decision',
  CALCULATION = 'calculation',
  REFERENCE = 'reference',
  CONTEXT = 'context',
}

export interface AgentMemorySession {
  sessionId: string;
  agentId: string;
  agentSlug: string;
  workspaceId: string;
  entries: AgentMemoryEntry[];
  createdAt: number;
  updatedAt: number;
  metadata: Record<string, unknown>;
}

export interface SafetyValidationRequest {
  agentId: string;
  agentSlug: string;
  input: string;
  output: string;
  context: Record<string, unknown>;
  toolsUsed: string[];
}

export interface SafetyCheck {
  name: string;
  passed: boolean;
  score: number;
  details: string;
  severity: SafetySeverity;
}

export enum SafetySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface SafetyValidationResult {
  passed: boolean;
  score: number;
  checks: SafetyCheck[];
  confidence: number;
}
