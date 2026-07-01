import { Injectable, Logger } from '@nestjs/common';
import { randomUUID, createHash } from 'node:crypto';
import type { ICalcOrchestrator } from '../../domain/interfaces/calc-orchestrator.interface.js';
import type { CalculationResult, CalculationProvenance } from '../../domain/types/ei.types.js';

@Injectable()
export class CalcOrchestrator implements ICalcOrchestrator {
  private readonly logger = new Logger(CalcOrchestrator.name);
  private readonly cache = new Map<string, CalculationResult>();
  private readonly history = new Map<string, CalculationResult[]>();

  async execute(toolId: string, input: Record<string, unknown>, context?: Record<string, unknown>): Promise<CalculationResult> {
    const cacheKey = this.getCacheKey(toolId, input);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return { ...cached, cached: true };
    }

    const startTime = Date.now();
    const output: Record<string, unknown> = {
      toolId,
      result: 'simulated',
      input: { ...input },
      context: context ?? {},
      computedAt: Date.now(),
    };

    const hash = createHash('sha256').update(JSON.stringify(input)).digest('hex').substring(0, 16);

    const provenance: CalculationProvenance = {
      toolId, toolVersion: '1.0.0', inputHash: hash,
      timestamp: Date.now(), duration: Date.now() - startTime,
      parameters: { ...input },
    };

    const result: CalculationResult = {
      id: randomUUID(), toolId, input, output,
      cached: false, duration: Date.now() - startTime, provenance, checksum: hash,
    };

    this.cache.set(cacheKey, result);
    const toolHistory = this.history.get(toolId) ?? [];
    toolHistory.push(result);
    this.history.set(toolId, toolHistory);

    return result;
  }

  async executeBatch(calculations: Array<{ toolId: string; input: Record<string, unknown> }>): Promise<CalculationResult[]> {
    return Promise.all(calculations.map((c) => this.execute(c.toolId, c.input)));
  }

  getCacheKey(toolId: string, input: Record<string, unknown>): string {
    return `${toolId}:${createHash('md5').update(JSON.stringify(input)).digest('hex')}`;
  }

  async invalidateCache(toolId?: string): Promise<void> {
    if (toolId) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(toolId)) this.cache.delete(key);
      }
    } else {
      this.cache.clear();
    }
  }

  async getHistory(toolId: string): Promise<CalculationResult[]> {
    return this.history.get(toolId) ?? [];
  }
}
