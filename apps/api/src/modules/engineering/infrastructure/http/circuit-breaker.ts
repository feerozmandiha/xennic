import { Logger } from '@nestjs/common';

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private readonly logger = new Logger(CircuitBreaker.name);

  constructor(
    private readonly name: string,
    private readonly failureThreshold = 5,
    private readonly successThreshold = 3,
    private readonly timeoutMs = 30_000,
  ) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.timeoutMs) {
        this.state = CircuitState.HALF_OPEN;
        this.logger.warn(`[${this.name}] Circuit HALF_OPEN — testing recovery`);
      } else {
        throw new CircuitBreakerOpenError(
          this.name,
          this.timeoutMs - (Date.now() - this.lastFailureTime),
        );
      }
    }

    try {
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (error) {
      if (error instanceof CircuitBreakerOpenError) throw error;
      this._onFailure();
      throw error;
    }
  }

  getState(): string {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  private _onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.logger.log(`[${this.name}] Circuit CLOSED — service recovered`);
        this._reset();
      }
    } else {
      this._reset();
    }
  }

  private _onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.logger.error(`[${this.name}] Circuit OPEN again — HALF_OPEN test failed`);
    } else if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.logger.error(`[${this.name}] Circuit OPEN — ${this.failureCount} consecutive failures`);
    }
  }

  private _reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
  }
}

export class CircuitBreakerOpenError extends Error {
  constructor(name: string, retryAfterMs: number) {
    super(`Circuit breaker [${name}] is OPEN — retry after ${Math.ceil(retryAfterMs / 1000)}s`);
    this.name = 'CircuitBreakerOpenError';
  }
}
