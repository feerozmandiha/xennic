<<<<<<< HEAD
jest.mock('@xennic/database', () => ({
  prisma: { $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]) },
}));

=======
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
<<<<<<< HEAD

  it('should return health status', async () => {
    const result = await service.getHealth();
    expect(result.status).toBeDefined();
    expect(result.service).toBe('xennic-api');
    expect(result.checks).toBeDefined();
    expect(result.checks.database).toBeDefined();
  });

  it('should return liveness', () => {
    const result = service.checkLiveness();
    expect(result).toEqual({ status: 'ok' });
  });

  it('should return readiness', async () => {
    const result = await service.checkReadiness();
    expect(result.status).toBe('ok');
    expect(result.checks.database).toBeDefined();
    expect(result.checks.redis).toBeDefined();
    expect(result.checks.rabbitmq).toBeDefined();
  });

  it('should return startup not-ready by default', () => {
    service.startupComplete = false;
    const result = service.checkStartup();
    expect(result).toEqual({ status: 'not-ready' });
  });

  it('should return startup ok when complete', () => {
    service.startupComplete = true;
    const result = service.checkStartup();
    expect(result).toEqual({ status: 'ok' });
  });
=======
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
});
