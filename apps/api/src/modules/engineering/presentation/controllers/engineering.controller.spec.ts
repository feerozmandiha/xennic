jest.mock('@xennic/database', () => ({
  prisma: {
    $queryRaw: jest.fn(),
    $queryRawUnsafe: jest.fn(),
    $executeRawUnsafe: jest.fn(),
    workspaces: { findUnique: jest.fn(), findMany: jest.fn() },
    workspace_members: { findFirst: jest.fn(), findMany: jest.fn() },
    roles: { findUnique: jest.fn(), findMany: jest.fn() },
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { EngineeringController } from './engineering.controller.js';
import { EngineeringService } from '../../application/services/engineering.service.js';
import { CalculationResponseDto } from '../dtos/engineering.dto.js';
import { CalculationEntity } from '../../domain/entities/calculation.entity.js';

const WS_ID = 'ws-123';
const USER_ID = 'user-456';
const CALC_ID = 'calc-789';

function makeReq(overrides: Record<string, unknown> = {}): any {
  return {
    workspaceId: WS_ID,
    user: { userId: USER_ID, planSlug: 'free' },
    ...overrides,
  };
}

function makeReply(): any {
  return {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    header: jest.fn().mockReturnThis(),
  };
}

function makeEntity(opts: Partial<ConstructorParameters<typeof CalculationEntity>[0]> = {}): CalculationEntity {
  return CalculationEntity.create({
    workspaceId: WS_ID,
    userId: USER_ID,
    type: 'BASIC-001',
    version: '1.0',
    inputs: { current_a: 10, resistance_ohm: 23 },
    results: { voltage_v: 230 },
    engineVersion: '1.0.0',
    standardVersion: 'IEC-60364',
    durationMs: 42,
    ...opts,
  });
}

const MOCK_FETCH_JSON = { success: true, data: {} };

function mockFetchOnce(status: number, body: unknown = MOCK_FETCH_JSON) {
  return jest.fn().mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  });
}

describe('EngineeringController', () => {
  let controller: EngineeringController;
  let service: jest.Mocked<EngineeringService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EngineeringController],
      providers: [
        {
          provide: EngineeringService,
          useValue: {
            findAll: jest.fn(),
            run: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            availableCalculations: jest.fn(),
            engineeringHealth: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EngineeringController>(EngineeringController);
    service = module.get(EngineeringService) as jest.Mocked<EngineeringService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /engineering/calculations', () => {
    it('should return paginated list with default page/limit', async () => {
      const entity = makeEntity();
      const dto = CalculationResponseDto.fromEntity(entity);
      service.findAll.mockResolvedValue({
        data: [entity],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const result = await controller.findAll(makeReq(), undefined, undefined, undefined, undefined);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([dto]);
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
      expect(service.findAll).toHaveBeenCalledWith(WS_ID, 1, 20, undefined, undefined);
    });

    it('should parse page, limit, projectId, and type query params', async () => {
      service.findAll.mockResolvedValue({
        data: [],
        meta: { page: 2, limit: 10, total: 0, totalPages: 0 },
      });

      await controller.findAll(makeReq(), '2', '10', 'proj-1', 'BASIC-001');

      expect(service.findAll).toHaveBeenCalledWith(WS_ID, 2, 10, 'proj-1', 'BASIC-001');
    });
  });

  describe('POST /engineering/calculations', () => {
    it('should run a calculation and return the result', async () => {
      const entity = makeEntity();
      const resultData = { voltage_v: 230, formula_version: '1.0' };
      service.run.mockResolvedValue({ calculation: entity, result: resultData });

      const dto = {
        type: 'BASIC-001' as const,
        inputs: { current_a: 10, resistance_ohm: 23 },
        projectId: 'proj-1',
      };
      const result = await controller.run(dto as any, makeReq());

      expect(result.success).toBe(true);
      expect(result.data.calculation).toEqual(CalculationResponseDto.fromEntity(entity));
      expect(result.data.result).toEqual(resultData);
      expect(service.run).toHaveBeenCalledWith({
        workspaceId: WS_ID,
        projectId: 'proj-1',
        userId: USER_ID,
        type: 'BASIC-001',
        inputs: { current_a: 10, resistance_ohm: 23 },
      });
    });

    it('should run a calculation without projectId', async () => {
      const entity = makeEntity();
      service.run.mockResolvedValue({ calculation: entity, result: {} });

      const dto = { type: 'BASIC-001' as const, inputs: { current_a: 10 } };
      await controller.run(dto as any, makeReq());

      expect(service.run).toHaveBeenCalledWith({
        workspaceId: WS_ID,
        projectId: undefined,
        userId: USER_ID,
        type: 'BASIC-001',
        inputs: { current_a: 10 },
      });
    });
  });

  describe('GET /engineering/calculations/:id', () => {
    it('should return a single calculation by id', async () => {
      const entity = makeEntity();
      service.findOne.mockResolvedValue(entity);

      const result = await controller.findOne(CALC_ID, makeReq());

      expect(result.success).toBe(true);
      expect(result.data).toEqual(CalculationResponseDto.fromEntity(entity));
      expect(service.findOne).toHaveBeenCalledWith(CALC_ID, WS_ID);
    });
  });

  describe('DELETE /engineering/calculations/:id', () => {
    it('should delete calculation and return nothing', async () => {
      service.delete.mockResolvedValue(undefined);

      const result = await controller.delete(CALC_ID, makeReq());

      expect(result).toBeUndefined();
      expect(service.delete).toHaveBeenCalledWith(CALC_ID, WS_ID);
    });
  });

  describe('GET /engineering/catalog', () => {
    it('should return available calculations for the user plan', async () => {
      const types = ['BASIC-001', 'BASIC-002'];
      service.availableCalculations.mockReturnValue(types);

      const result = await controller.getCatalog(makeReq());

      expect(result.success).toBe(true);
      expect(result.data).toEqual(types);
      expect(result.meta).toEqual({ total: 2 });
      expect(service.availableCalculations).toHaveBeenCalledWith('free');
    });

    it('should pass planSlug from request user', async () => {
      service.availableCalculations.mockReturnValue([]);

      await controller.getCatalog(makeReq({ user: { userId: USER_ID, planSlug: 'pro' } }));

      expect(service.availableCalculations).toHaveBeenCalledWith('pro');
    });

    it('should fallback to free when planSlug is missing', async () => {
      service.availableCalculations.mockReturnValue([]);

      await controller.getCatalog(makeReq({ user: { userId: USER_ID } }));

      expect(service.availableCalculations).toHaveBeenCalledWith('free');
    });
  });

  describe('GET /engineering/health', () => {
    it('should return health status from the engineering client', async () => {
      const healthStatus = { status: 'healthy', uptime: 3600 };
      service.engineeringHealth.mockResolvedValue(healthStatus);

      const result = await controller.health();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(healthStatus);
      expect(service.engineeringHealth).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /engineering/energy/analyze (proxy)', () => {
    let fetchSpy: jest.SpyInstance;

    beforeEach(() => {
      fetchSpy = jest.spyOn(global, 'fetch');
    });

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    it('should proxy JSON body to Python service and return response', async () => {
      const pythonResponse = { success: true, data: { energy_kwh: 150 } };
      fetchSpy.mockImplementation(mockFetchOnce(200, pythonResponse));

      const req = makeReq({ body: { voltage: 220, current: 10 } });
      const reply = makeReply();
      await controller.analyzeEnergy(req, reply);

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8001/api/v1/engineering/energy/analyze',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voltage: 220, current: 10 }),
        }),
      );
      expect(reply.status).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith(pythonResponse);
    });

    it('should propagate error status from Python service', async () => {
      const errorBody = { error: 'Bad request' };
      fetchSpy.mockImplementation(mockFetchOnce(400, errorBody));

      const reply = makeReply();
      await controller.analyzeEnergy(makeReq(), reply);

      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith(errorBody);
    });

    it('should return 503 on fetch failure', async () => {
      fetchSpy.mockRejectedValue(new Error('Connection refused'));

      const reply = makeReply();
      await controller.analyzeEnergy(makeReq(), reply);

      expect(reply.status).toHaveBeenCalledWith(503);
      expect(reply.send).toHaveBeenCalledWith({
        success: false,
        error: { code: 'SERVICE_UNAVAILABLE', message: 'Engineering service unavailable' },
      });
    });
  });

  describe('POST /engineering/energy/manual-analyze (proxy)', () => {
    let fetchSpy: jest.SpyInstance;

    beforeEach(() => {
      fetchSpy = jest.spyOn(global, 'fetch');
    });

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    it('should proxy request to manual-analyze endpoint', async () => {
      const pythonResponse = { success: true, data: { analysis: 'done' } };
      fetchSpy.mockImplementation(mockFetchOnce(200, pythonResponse));

      const req = makeReq({ body: { kwh: 300 } });
      const reply = makeReply();
      await controller.manualAnalyze(req, reply);

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8001/api/v1/engineering/energy/manual-analyze',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(reply.status).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith(pythonResponse);
    });

    it('should return 503 on fetch failure', async () => {
      fetchSpy.mockRejectedValue(new Error('Timeout'));

      const reply = makeReply();
      await controller.manualAnalyze(makeReq(), reply);

      expect(reply.status).toHaveBeenCalledWith(503);
    });
  });

  describe('POST /engineering/energy/ocr-preview (proxy)', () => {
    let fetchSpy: jest.SpyInstance;

    beforeEach(() => {
      fetchSpy = jest.spyOn(global, 'fetch');
    });

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    function makeMultipartReq(): any {
      return {
        isMultipart: jest.fn().mockReturnValue(true),
        raw: (async function* () {
          yield Buffer.from('fake-image-data');
        })(),
        headers: { 'content-type': 'multipart/form-data; boundary=abc' },
      };
    }

    it('should proxy multipart to Python service', async () => {
      const pythonResponse = { success: true, data: { ocr_text: 'bill data' } };
      fetchSpy.mockImplementation(mockFetchOnce(200, pythonResponse));

      const reply = makeReply();
      await controller.ocrPreview(makeMultipartReq(), reply);

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8001/api/v1/engineering/energy/ocr-preview',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(reply.status).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith(pythonResponse);
    });

    it('should return 400 if not multipart', async () => {
      const req = { isMultipart: jest.fn().mockReturnValue(false) };
      const reply = makeReply();
      await controller.ocrPreview(req, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({ success: false, error: 'multipart required' });
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return 503 on fetch failure', async () => {
      fetchSpy.mockRejectedValue(new Error('Python down'));

      const reply = makeReply();
      await controller.ocrPreview(makeMultipartReq(), reply);

      expect(reply.status).toHaveBeenCalledWith(503);
      expect(reply.send).toHaveBeenCalledWith({ success: false, error: 'Engineering service unavailable' });
    });
  });

  describe('POST /engineering/energy/ocr-bill', () => {
    let fetchSpy: jest.SpyInstance;

    beforeEach(() => {
      fetchSpy = jest.spyOn(global, 'fetch');
    });

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    function makeOcrBillReq(): any {
      return {
        isMultipart: jest.fn().mockReturnValue(true),
        raw: (async function* () {
          yield Buffer.from('part1');
          yield Buffer.from('part2');
        })(),
        headers: { 'content-type': 'multipart/form-data; boundary=xyz' },
      };
    }

    it('should process OCR bill successfully', async () => {
      const visionResponse = {
        success: true,
        data: {
          bill: { consumption_kwh: 250, total_amount: 500000, extra_fields: { billing_days: 30 } },
          combined_text: 'قبض برق 250 کیلووات',
        },
        confidence: 0.95,
        engine_version: '2.0.0',
      };
      fetchSpy.mockImplementation(mockFetchOnce(200, visionResponse));

      const reply = makeReply();
      await controller.ocrBill(makeOcrBillReq(), reply);

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8003/api/v1/vision/bill/read',
        expect.objectContaining({ method: 'POST' }),
      );

      expect(reply.status).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          ocr: expect.objectContaining({
            raw_text: 'قبض برق 250 کیلووات',
            kwh_found: true,
            confidence: 0.95,
            normalized: expect.objectContaining({
              kwh_consumed: 250,
              amount_rials: 500000,
              billing_days: 30,
            }),
          }),
          engine: 'vision-service',
          engine_version: '2.0.0',
        }),
      );
    });

    it('should return 400 if not multipart', async () => {
      const req = { isMultipart: jest.fn().mockReturnValue(false) };
      const reply = makeReply();
      await controller.ocrBill(req, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({ success: false, error: 'multipart/form-data required' });
    });

    it('should handle vision service error', async () => {
      const errorBody = { message: 'OCR failed' };
      fetchSpy.mockImplementation(mockFetchOnce(502, errorBody));

      const reply = makeReply();
      await controller.ocrBill(makeOcrBillReq(), reply);

      expect(reply.status).toHaveBeenCalledWith(502);
      expect(reply.send).toHaveBeenCalledWith({
        success: false,
        error: 'Vision service OCR failed',
        detail: errorBody,
      });
    });

    it('should return 503 on fetch failure', async () => {
      fetchSpy.mockRejectedValue(new Error('Vision service unreachable'));

      const reply = makeReply();
      await controller.ocrBill(makeOcrBillReq(), reply);

      expect(reply.status).toHaveBeenCalledWith(503);
      expect(reply.send).toHaveBeenCalledWith({
        success: false,
        error: 'Bill OCR service unavailable',
        detail: 'Vision service unreachable',
      });
    });

    it('should handle null consumption gracefully', async () => {
      const visionResponse = {
        success: true,
        data: {
          bill: { consumption_kwh: null, total_amount: null },
          combined_text: '',
        },
        confidence: 0,
        engine_version: '1.0.0',
      };
      fetchSpy.mockImplementation(mockFetchOnce(200, visionResponse));

      const reply = makeReply();
      await controller.ocrBill(makeOcrBillReq(), reply);

      expect(reply.status).toHaveBeenCalledWith(200);
      const sent = (reply.send as jest.Mock).mock.calls[0][0];
      expect(sent.ocr.kwh_found).toBe(false);
      expect(sent.ocr.normalized.kwh_consumed).toBeNull();
      expect(sent.ocr.normalized.amount_rials).toBeNull();
    });
  });
});
