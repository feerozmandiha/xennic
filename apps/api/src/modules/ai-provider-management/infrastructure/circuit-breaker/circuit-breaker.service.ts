import { Injectable, Logger } from '@nestjs/common';

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

interface CircuitStateData {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureAt: number | null;
  halfOpenAttempts: number;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly circuits = new Map<string, CircuitStateData>();

  private readonly FAILURE_THRESHOLD = 5;
  private readonly SUCCESS_THRESHOLD = 3;
  private readonly OPEN_TIMEOUT_MS = 30_000;
  private readonly HALF_OPEN_MAX_ATTEMPTS = 3;

  isAvailable(providerId: string): boolean {
    const circuit = this.circuits.get(providerId);
    if (!circuit || circuit.state === CircuitState.CLOSED) return true;

    if (circuit.state === CircuitState.OPEN) {
      const elapsed = Date.now() - (circuit.lastFailureAt ?? Date.now());
      if (elapsed >= this.OPEN_TIMEOUT_MS) {
        this.logger.log(`Circuit ${providerId}: OPEN → HALF_OPEN (timeout elapsed)`);
        circuit.state = CircuitState.HALF_OPEN;
        circuit.halfOpenAttempts = 0;
        return true;
      }
      return false;
    }

    if (circuit.state === CircuitState.HALF_OPEN) {
      if (circuit.halfOpenAttempts >= this.HALF_OPEN_MAX_ATTEMPTS) {
        return false;
      }
      return true;
    }

    return true;
  }

  recordSuccess(providerId: string): void {
    let circuit = this.circuits.get(providerId);
    if (!circuit) {
      circuit = {
        state: CircuitState.CLOSED,
        failureCount: 0,
        successCount: 0,
        lastFailureAt: null,
        halfOpenAttempts: 0,
      };
      this.circuits.set(providerId, circuit);
    }

    if (circuit.state === CircuitState.HALF_OPEN) {
      circuit.halfOpenAttempts++;
      circuit.successCount++;
      if (circuit.successCount >= this.SUCCESS_THRESHOLD) {
        this.logger.log(`Circuit ${providerId}: HALF_OPEN → CLOSED (recovered)`);
        circuit.state = CircuitState.CLOSED;
        circuit.failureCount = 0;
        circuit.successCount = 0;
        circuit.halfOpenAttempts = 0;
      }
    } else {
      circuit.failureCount = 0;
      circuit.successCount++;
    }
  }

  recordFailure(providerId: string): void {
    let circuit = this.circuits.get(providerId);
    if (!circuit) {
      circuit = {
        state: CircuitState.CLOSED,
        failureCount: 0,
        successCount: 0,
        lastFailureAt: null,
        halfOpenAttempts: 0,
      };
      this.circuits.set(providerId, circuit);
    }

    circuit.failureCount++;
    circuit.lastFailureAt = Date.now();

    if (circuit.state === CircuitState.HALF_OPEN) {
      this.logger.warn(`Circuit ${providerId}: HALF_OPEN → OPEN (half-open attempt failed)`);
      circuit.state = CircuitState.OPEN;
      circuit.halfOpenAttempts = 0;
    } else if (circuit.failureCount >= this.FAILURE_THRESHOLD) {
      this.logger.warn(`Circuit ${providerId}: CLOSED → OPEN (${circuit.failureCount} failures)`);
      circuit.state = CircuitState.OPEN;
      circuit.halfOpenAttempts = 0;
    }
  }

  getState(providerId: string): CircuitState {
    return this.circuits.get(providerId)?.state ?? CircuitState.CLOSED;
  }

  reset(providerId: string): void {
    this.circuits.delete(providerId);
    this.logger.log(`Circuit ${providerId}: reset to CLOSED`);
  }

  getMetrics(
    providerId: string,
  ): { state: string; failureCount: number; successCount: number } | null {
    const circuit = this.circuits.get(providerId);
    if (!circuit) return null;
    return {
      state: circuit.state,
      failureCount: circuit.failureCount,
      successCount: circuit.successCount,
    };
  }
}
