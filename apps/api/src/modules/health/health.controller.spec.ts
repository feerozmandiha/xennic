<<<<<<< HEAD
jest.mock('@xennic/database', () => ({
  prisma: { $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]) },
}));

=======
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    controller = module.get<HealthController>(HealthController);
<<<<<<< HEAD
    module.get<HealthService>(HealthService).startupComplete = true;
=======
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
<<<<<<< HEAD

  it('should return health from controller', async () => {
    const result = await controller.getHealth();
    expect(result).toBeDefined();
    expect(result.service).toBe('xennic-api');
  });

  it('should return liveness probe', () => {
    const result = controller.checkLiveness();
    expect(result).toEqual({ status: 'ok' });
  });

  it('should return readiness probe', async () => {
    const result = await controller.checkReadiness();
    expect(result).toBeDefined();
    expect(result.status).toBe('ok');
    expect(result.checks).toBeDefined();
  });

  it('should return startup probe', () => {
    const result = controller.checkStartup();
    expect(result).toEqual({ status: 'ok' });
  });
=======
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
});
