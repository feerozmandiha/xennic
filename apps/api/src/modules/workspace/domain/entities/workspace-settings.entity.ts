export interface WorkspaceSettingsData {
  brand?: {
    name?: string;
    logo_url?: string;
    primary_color?: string;
    accent_color?: string;
  };
  localization?: {
    locale: string;
    timezone: string;
    date_format: string;
    number_format: string;
    direction: string;
  };
  industry?: {
    sector?: string;
    sub_sector?: string;
    engineering_fields?: string[];
  };
  defaults?: {
    voltage_level_kv?: number;
    frequency_hz?: number;
    ambient_temperature_c?: number;
    conductor_material?: string;
    insulation_type?: string;
    power_factor?: number;
    load_factor?: number;
  };
  notifications?: {
    email_alerts?: boolean;
    calculation_completed?: boolean;
    member_joined?: boolean;
    weekly_report?: boolean;
  };
  features?: {
    auto_save?: boolean;
    show_advanced_options?: boolean;
    export_default_format?: string;
  };
}

export const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettingsData = {
  localization: {
    locale: 'fa',
    timezone: 'Asia/Tehran',
    date_format: 'YYYY/MM/DD',
    number_format: 'fa',
    direction: 'rtl',
  },
  notifications: {
    email_alerts: true,
    calculation_completed: true,
    member_joined: true,
    weekly_report: false,
  },
  features: {
    auto_save: true,
    show_advanced_options: false,
    export_default_format: 'pdf',
  },
};

export class WorkspaceSettingsEntity {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public settings: WorkspaceSettingsData,
    public updatedAt: Date,
  ) {}

  static create(workspaceId: string, settings?: Partial<WorkspaceSettingsData>): WorkspaceSettingsEntity {
    const merged = this.mergeDeep(DEFAULT_WORKSPACE_SETTINGS, settings ?? {});
    return new WorkspaceSettingsEntity(
      crypto.randomUUID(),
      workspaceId,
      merged,
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    workspaceId: string;
    settings: Record<string, unknown>;
    updatedAt: Date;
  }): WorkspaceSettingsEntity {
    return new WorkspaceSettingsEntity(
      data.id,
      data.workspaceId,
      data.settings as WorkspaceSettingsData,
      data.updatedAt,
    );
  }

  update(partial: Partial<WorkspaceSettingsData>, updatedAt: Date): void {
    this.settings = WorkspaceSettingsEntity.mergeDeep(this.settings, partial);
    this.updatedAt = updatedAt;
  }

  private static mergeDeep(base: any, override: any): any {
    const result = { ...base };
    for (const key of Object.keys(override)) {
      if (override[key] !== undefined && override[key] !== null) {
        if (typeof override[key] === 'object' && !Array.isArray(override[key]) && typeof base[key] === 'object') {
          result[key] = this.mergeDeep(base[key] ?? {}, override[key]);
        } else {
          result[key] = override[key];
        }
      }
    }
    return result;
  }
}
