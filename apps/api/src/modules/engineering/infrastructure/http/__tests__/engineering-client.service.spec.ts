import { Test, TestingModule } from '@nestjs/testing';
import { EngineeringClientService } from '../engineering-client.service.js';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';

const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe('EngineeringClientService', () => {
  let client: EngineeringClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EngineeringClientService],
    }).compile();

    client = module.get(EngineeringClientService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully execute a calculation', async () => {
    const responseBody = {
      success: true,
      data: { results: { voltage_v: 230 }, inputs: { current_a: 10, resistance_ohm: 23 }, formula_version: '1.0', engine_version: '2.0', standard_version: 'IEC' },
      meta: {},
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => responseBody,
    });

    const result = await client.calculate('/api/v1/engineering/basic/ohms-law', { current_a: 10, resistance_ohm: 23 });

    expect(result.success).toBe(true);
    expect(result.data.results.voltage_v).toBe(230);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should propagate correlation ID header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: {}, meta: {} }),
    });

    await client.calculate('/api/v1/engineering/basic/ohms-law', {}, 'corr-123');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-Correlation-ID': 'corr-123' }),
      }),
    );
  });

  it('should not add correlation ID header when not provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: {}, meta: {} }),
    });

    await client.calculate('/api/v1/engineering/basic/ohms-law', {});

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.not.objectContaining({
        headers: expect.objectContaining({ 'X-Correlation-ID': expect.any(String) }),
      }),
    );
  });

  it('should retry on transient failure', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Connection refused'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { results: {} }, meta: {} }),
      });

    const result = await client.calculate('/api/v1/engineering/basic/ohms-law', { current_a: 10 });

    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should throw ServiceUnavailableException after max retries', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Connection refused'))
      .mockRejectedValueOnce(new Error('Connection refused'))
      .mockRejectedValueOnce(new Error('Connection refused'));

    await expect(
      client.calculate('/api/v1/engineering/basic/ohms-law', {}),
    ).rejects.toThrow(ServiceUnavailableException);

    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should throw BadRequestException on validation error (400)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'Invalid input: current_a must be positive' } }),
    });

    await expect(
      client.calculate('/api/v1/engineering/basic/ohms-law', { current_a: -5 }),
    ).rejects.toThrow(BadRequestException);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should throw ServiceUnavailableException on 5xx error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}),
    });

    await expect(
      client.calculate('/api/v1/engineering/basic/ohms-law', {}),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('should handle timeout (AbortError)', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    mockFetch.mockRejectedValueOnce(abortError);

    await expect(
      client.calculate('/api/v1/engineering/basic/ohms-law', {}),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('should report health with circuit breaker state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ status: 'healthy', calculators_registered: 80, version: '2.0.0' }),
    });

    const health = await client.health();

    expect(health.status).toBe('healthy');
    expect(health.calculators_registered).toBe(80);
    expect(health.circuitState).toBeDefined();
    expect(health.circuitFailures).toBeDefined();
  });

  it('should return unhealthy when health endpoint fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

    const health = await client.health();

    expect(health.status).toBe('unreachable');
    expect(health.circuitState).toBe('CLOSED');
    expect(health.circuitFailures).toBe(0);
  });

  it('should not retry on BadRequestException', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'Bad input' } }),
    });

    await expect(
      client.calculate('/api/v1/engineering/basic/ohms-law', {}),
    ).rejects.toThrow(BadRequestException);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
