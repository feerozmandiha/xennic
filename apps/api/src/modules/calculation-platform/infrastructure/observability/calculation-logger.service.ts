import { Injectable, Logger } from '@nestjs/common';

export interface CalculationLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  calculationId?: string;
  definition?: string;
  version?: string;
  userId?: string;
  workspaceId?: string;
  correlationId?: string;
  durationMs?: number;
  formulaCount?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class CalculationLoggerService {
  private readonly logger = new Logger('CalculationPlatform');
  private readonly logBuffer: CalculationLogEntry[] = [];
  private readonly MAX_BUFFER_SIZE = 1000;

  log(entry: CalculationLogEntry): void {
    const message = `[${entry.definition ?? 'unknown'}]${entry.calculationId ? ` (${entry.calculationId})` : ''}${entry.error ? ` ERROR: ${entry.error}` : ''}${entry.durationMs ? ` ${entry.durationMs}ms` : ''}`;

    switch (entry.level) {
      case 'error': this.logger.error(message); break;
      case 'warn': this.logger.warn(message); break;
      case 'debug': this.logger.debug(message); break;
      default: this.logger.log(message);
    }

    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.MAX_BUFFER_SIZE) {
      this.logBuffer.shift();
    }
  }

  info(definition: string, message: string, data?: Partial<CalculationLogEntry>): void {
    this.log({ timestamp: new Date().toISOString(), level: 'info', definition, ...data });
  }

  warn(definition: string, message: string, data?: Partial<CalculationLogEntry>): void {
    this.log({ timestamp: new Date().toISOString(), level: 'warn', definition, ...data });
  }

  error(definition: string, message: string, error?: string, data?: Partial<CalculationLogEntry>): void {
    this.log({ timestamp: new Date().toISOString(), level: 'error', definition, error: error ?? message, ...data });
  }

  debug(definition: string, message: string, data?: Partial<CalculationLogEntry>): void {
    this.log({ timestamp: new Date().toISOString(), level: 'debug', definition, ...data });
  }

  getRecentLogs(count: number = 100): CalculationLogEntry[] {
    return this.logBuffer.slice(-count);
  }

  getErrorLogs(): CalculationLogEntry[] {
    return this.logBuffer.filter(e => e.level === 'error');
  }

  getSlowCalculations(thresholdMs: number = 1000): CalculationLogEntry[] {
    return this.logBuffer.filter(e => (e.durationMs ?? 0) > thresholdMs);
  }
}
