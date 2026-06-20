import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@xennic/database', () => ({
  prisma: {
    workspaceSettings: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn((fn: any) => fn()),
  },
}));

import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { WorkspaceSettingsController } from './workspace-settings.controller.js';
import { WorkspaceSettingsService } from '../../application/services/workspace-settings.service.js';
import { WorkspaceSettingsEntity } from '../../domain/entities/workspace-settings.entity.js';
import { WorkspaceSettingsResponseDto } from '../dtos/workspace-settings.dto.js';

const WS_ID = 'ws-test-001';

function createEntity(): WorkspaceSettingsEntity {
  return WorkspaceSettingsEntity.create(WS_ID);
}

describe('WorkspaceSettingsController', () => {
  let controller: WorkspaceSettingsController;
  let service: jest.Mocked<WorkspaceSettingsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceSettingsController],
      providers: [
        {
          provide: WorkspaceSettingsService,
          useValue: {
            getSettings: jest.fn(),
            updateSettings: jest.fn(),
            resetSettings: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WorkspaceSettingsController>(WorkspaceSettingsController);
    service = module.get(WorkspaceSettingsService) as jest.Mocked<WorkspaceSettingsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should return WorkspaceSettingsResponseDto', async () => {
      const entity = createEntity();
      service.getSettings.mockResolvedValue(entity);

      const result = await controller.getSettings(WS_ID);

      expect(result).toBeInstanceOf(WorkspaceSettingsResponseDto);
      expect(result.workspaceId).toBe(WS_ID);
      expect(service.getSettings).toHaveBeenCalledWith(WS_ID);
    });
  });

  describe('updateSettings', () => {
    it('should call service.updateSettings and return dto', async () => {
      const entity = createEntity();
      service.updateSettings.mockResolvedValue(entity);

      const dto = { brand: { name: 'Updated' } } as any;
      const result = await controller.updateSettings(WS_ID, dto);

      expect(result).toBeInstanceOf(WorkspaceSettingsResponseDto);
      expect(service.updateSettings).toHaveBeenCalledWith(WS_ID, dto);
      expect(service.updateSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetSettings', () => {
    it('should call service.resetSettings and return dto', async () => {
      const entity = createEntity();
      service.resetSettings.mockResolvedValue(entity);

      const result = await controller.resetSettings(WS_ID);

      expect(result).toBeInstanceOf(WorkspaceSettingsResponseDto);
      expect(service.resetSettings).toHaveBeenCalledWith(WS_ID);
      expect(service.resetSettings).toHaveBeenCalledTimes(1);
    });
  });
});
