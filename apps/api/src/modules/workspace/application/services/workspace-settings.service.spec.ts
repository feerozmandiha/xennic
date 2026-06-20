import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WorkspaceSettingsService } from './workspace-settings.service.js';
import { WorkspaceSettingsEntity, DEFAULT_WORKSPACE_SETTINGS } from '../../domain/entities/workspace-settings.entity.js';
import type { IWorkspaceSettingsRepository } from '../../domain/interfaces/workspace-settings.repository.interface.js';
import type { WorkspaceSettingsData } from '../../domain/entities/workspace-settings.entity.js';
import type { UpdateWorkspaceSettingsDto } from '../../presentation/dtos/workspace-settings.dto.js';

const WS_ID = 'ws-test-001';

function createEntity(overrides?: Partial<WorkspaceSettingsData>): WorkspaceSettingsEntity {
  return WorkspaceSettingsEntity.create(WS_ID, overrides);
}

describe('WorkspaceSettingsService', () => {
  let service: WorkspaceSettingsService;
  let repo: jest.Mocked<IWorkspaceSettingsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceSettingsService,
        {
          provide: 'IWorkspaceSettingsRepository',
          useValue: {
            findByWorkspaceId: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WorkspaceSettingsService>(WorkspaceSettingsService);
    repo = module.get('IWorkspaceSettingsRepository') as jest.Mocked<IWorkspaceSettingsRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── getSettings ─────────────────────────────────────────────────────────────

  describe('getSettings', () => {
    it('should return existing settings when found', async () => {
      const entity = createEntity();
      repo.findByWorkspaceId.mockResolvedValue(entity);

      const result = await service.getSettings(WS_ID);

      expect(result).toBe(entity);
      expect(repo.findByWorkspaceId).toHaveBeenCalledWith(WS_ID);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should create default settings when none exist', async () => {
      repo.findByWorkspaceId.mockResolvedValue(null);

      const result = await service.getSettings(WS_ID);

      expect(result.settings).toMatchObject(DEFAULT_WORKSPACE_SETTINGS);
      expect(result.workspaceId).toBe(WS_ID);
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith(result);
    });
  });

  // ── updateSettings ──────────────────────────────────────────────────────────

  describe('updateSettings', () => {
    it('should deep-merge partial update into existing settings', async () => {
      const entity = createEntity();
      repo.findByWorkspaceId.mockResolvedValue(entity);

      const dto: UpdateWorkspaceSettingsDto = {
        brand: { name: 'Xennic Pro', primary_color: '#ff0000' },
        defaults: { voltage_level_kv: 11 },
      };

      const result = await service.updateSettings(WS_ID, dto);

      expect(result.settings.brand?.name).toBe('Xennic Pro');
      expect(result.settings.brand?.primary_color).toBe('#ff0000');
      expect(result.settings.defaults?.voltage_level_kv).toBe(11);
      // untouched fields preserved
      expect(result.settings.localization?.locale).toBe('fa');
      expect(result.settings.notifications?.email_alerts).toBe(true);
      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('should create new entity when no existing settings found', async () => {
      repo.findByWorkspaceId.mockResolvedValue(null);

      const dto: UpdateWorkspaceSettingsDto = {
        localization: { locale: 'en', timezone: 'UTC', date_format: 'YYYY-MM-DD', number_format: 'en', direction: 'ltr' },
      };

      const result = await service.updateSettings(WS_ID, dto);

      expect(result.settings.localization?.locale).toBe('en');
      expect(result.settings.localization?.timezone).toBe('UTC');
      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('should not mutate with undefined values', async () => {
      const entity = createEntity({ brand: { name: 'Original' } });
      repo.findByWorkspaceId.mockResolvedValue(entity);

      const dto: UpdateWorkspaceSettingsDto = {
        brand: { name: undefined as any, logo_url: 'https://logo.new' },
      };

      const result = await service.updateSettings(WS_ID, dto);

      expect(result.settings.brand?.name).toBe('Original');
      expect(result.settings.brand?.logo_url).toBe('https://logo.new');
    });
  });

  // ── resetSettings ───────────────────────────────────────────────────────────

  describe('resetSettings', () => {
    it('should reset existing settings to defaults', async () => {
      const entity = createEntity({
        brand: { name: 'Custom Brand' },
        defaults: { voltage_level_kv: 400 },
      });
      repo.findByWorkspaceId.mockResolvedValue(entity);

      const result = await service.resetSettings(WS_ID);

      expect(result.settings.brand?.name).toBeUndefined();
      expect(result.settings.defaults?.voltage_level_kv).toBeUndefined();
      expect(result.settings.localization?.locale).toBe('fa');
      expect(result.settings.features?.auto_save).toBe(true);
      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when no settings exist', async () => {
      repo.findByWorkspaceId.mockResolvedValue(null);

      await expect(service.resetSettings(WS_ID)).rejects.toThrow(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });
});
