export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRYING = 'retrying',
  CANCELLED = 'cancelled',
}

export enum JobPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

export interface Job {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  priority: JobPriority;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  retryDelay: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: unknown;
}

export interface JobSchedule {
  id: string;
  name: string;
  jobType: string;
  payload: Record<string, unknown>;
  cron: string;
  priority: JobPriority;
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
  createdAt: Date;
}

export interface CronJob {
  id: string;
  name: string;
  expression: string;
  handler: string;
  enabled: boolean;
  timezone: string;
  lastExecution?: Date;
  nextExecution: Date;
}

export interface WorkerPoolConfig {
  name: string;
  concurrency: number;
  jobTypes: string[];
  maxRetries: number;
  retryDelay: number;
  deadLetterExchange: string;
  prefetch: number;
}

export interface JobResult {
  jobId: string;
  status: JobStatus;
  output?: unknown;
  error?: string;
  duration: number;
}

export interface DeadLetterRecord {
  id: string;
  originalJobId: string;
  jobType: string;
  payload: Record<string, unknown>;
  error: string;
  attempts: number;
  failedAt: Date;
  reason: string;
}
