import { CircuitBreaker, CircuitBreakerOpenError } from '../circuit-breaker.js';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker('test-service', 3, 2, 100);
  });

  it('should start in CLOSED state', () => {
    expect(breaker.getState()).toBe('CLOSED');
    expect(breaker.getFailureCount()).toBe(0);
  });

  it('should execute successfully in CLOSED state', async () => {
    const result = await breaker.call(async () => 'success');
    expect(result).toBe('success');
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('should open circuit after threshold failures', async () => {
    await expect(
      breaker.call(async () => {
        throw new Error('fail 1');
      }),
    ).rejects.toThrow('fail 1');
    await expect(
      breaker.call(async () => {
        throw new Error('fail 2');
      }),
    ).rejects.toThrow('fail 2');
    await expect(
      breaker.call(async () => {
        throw new Error('fail 3');
      }),
    ).rejects.toThrow('fail 3');

    expect(breaker.getState()).toBe('OPEN');
    expect(breaker.getFailureCount()).toBe(3);
  });

  it('should reject calls with CircuitBreakerOpenError when OPEN', async () => {
    for (let i = 0; i < 3; i++) {
      await expect(
        breaker.call(async () => {
          throw new Error(`fail ${i}`);
        }),
      ).rejects.toThrow();
    }

    await expect(breaker.call(async () => 'should not reach')).rejects.toThrow(
      CircuitBreakerOpenError,
    );
  });

  it('should transition to HALF_OPEN after timeout', async () => {
    for (let i = 0; i < 3; i++) {
      await expect(
        breaker.call(async () => {
          throw new Error(`fail ${i}`);
        }),
      ).rejects.toThrow();
    }

    expect(breaker.getState()).toBe('OPEN');

    await new Promise((resolve) => setTimeout(resolve, 150));

    const result = await breaker.call(async () => 'recovered');
    expect(result).toBe('recovered');
  });

  it('should close circuit after success threshold in HALF_OPEN', async () => {
    for (let i = 0; i < 3; i++) {
      await expect(
        breaker.call(async () => {
          throw new Error(`fail ${i}`);
        }),
      ).rejects.toThrow();
    }

    const shortBreaker = new CircuitBreaker('short', 3, 1, 50);
    for (let i = 0; i < 3; i++) {
      await expect(
        shortBreaker.call(async () => {
          throw new Error(`fail ${i}`);
        }),
      ).rejects.toThrow();
    }

    await new Promise((resolve) => setTimeout(resolve, 100));

    await shortBreaker.call(async () => 'recovered');
    expect(shortBreaker.getState()).toBe('CLOSED');
  });

  it('should open circuit again on HALF_OPEN failure', async () => {
    for (let i = 0; i < 3; i++) {
      await expect(
        breaker.call(async () => {
          throw new Error(`fail ${i}`);
        }),
      ).rejects.toThrow();
    }

    await new Promise((resolve) => setTimeout(resolve, 150));

    await expect(
      breaker.call(async () => {
        throw new Error('half-open fail');
      }),
    ).rejects.toThrow('half-open fail');

    expect(breaker.getState()).toBe('OPEN');
  });

  it('should reset on success in CLOSED state', async () => {
    for (let i = 0; i < 2; i++) {
      await expect(
        breaker.call(async () => {
          throw new Error('fail');
        }),
      ).rejects.toThrow();
    }

    expect(breaker.getFailureCount()).toBe(2);

    await breaker.call(async () => 'success');
    expect(breaker.getFailureCount()).toBe(0);
  });

  it('should handle concurrent calls correctly', async () => {
    const concurrencyBreaker = new CircuitBreaker('concurrent', 5, 3, 1000);

    const results = await Promise.allSettled(
      Array.from({ length: 10 }, (_, i) =>
        concurrencyBreaker.call(async () => {
          if (i < 5) throw new Error(`fail ${i}`);
          return `success ${i}`;
        }),
      ),
    );

    const failures = results.filter((r) => r.status === 'rejected').length;
    const successes = results.filter((r) => r.status === 'fulfilled').length;

    expect(failures).toBeGreaterThan(0);
    expect(successes).toBeGreaterThan(0);
  });

  it('should not open circuit for CircuitBreakerOpenError', async () => {
    for (let i = 0; i < 3; i++) {
      await expect(
        breaker.call(async () => {
          throw new Error(`fail ${i}`);
        }),
      ).rejects.toThrow();
    }

    expect(breaker.getState()).toBe('OPEN');

    const failureCountBefore = breaker.getFailureCount();

    await expect(breaker.call(async () => 'should not reach')).rejects.toThrow(
      CircuitBreakerOpenError,
    );
    expect(breaker.getFailureCount()).toBe(failureCountBefore);
  });
});
