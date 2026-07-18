import { Injectable, Logger } from '@nestjs/common';

export interface TraceSpan {
  name: string;
  attributes: Record<string, string | number | boolean>;
  startTime: number;
  endTime?: number;
  children: TraceSpan[];
}

@Injectable()
export class CalculationTracingService {
  private readonly logger = new Logger(CalculationTracingService.name);
  private readonly spans = new Map<string, TraceSpan>();

  startSpan(
    traceId: string,
    name: string,
    attributes: Record<string, string | number | boolean> = {},
  ): void {
    const span: TraceSpan = {
      name,
      attributes,
      startTime: Date.now(),
      children: [],
    };

    if (!this.spans.has(traceId)) {
      this.spans.set(traceId, span);
    } else {
      const parent = this.spans.get(traceId)!;
      parent.children.push(span);
    }
  }

  endSpan(
    traceId: string,
    name: string,
    additionalAttributes?: Record<string, string | number | boolean>,
  ): void {
    const span = this.findSpan(traceId, name);
    if (span) {
      span.endTime = Date.now();
      if (additionalAttributes) {
        Object.assign(span.attributes, additionalAttributes);
      }
    }
  }

  getTrace(traceId: string): TraceSpan | undefined {
    return this.spans.get(traceId);
  }

  getTraceDuration(traceId: string): number | undefined {
    const trace = this.spans.get(traceId);
    if (!trace) return undefined;
    return (trace.endTime ?? Date.now()) - trace.startTime;
  }

  deleteTrace(traceId: string): void {
    this.spans.delete(traceId);
  }

  clear(): void {
    this.spans.clear();
  }

  private findSpan(traceId: string, name: string): TraceSpan | undefined {
    const root = this.spans.get(traceId);
    if (!root) return undefined;
    if (root.name === name) return root;
    return this.findSpanInChildren(root.children, name);
  }

  private findSpanInChildren(children: TraceSpan[], name: string): TraceSpan | undefined {
    for (const child of children) {
      if (child.name === name) return child;
      const found = this.findSpanInChildren(child.children, name);
      if (found) return found;
    }
    return undefined;
  }

  getActiveTraceCount(): number {
    return this.spans.size;
  }
}
