import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsArray, IsBoolean, IsNumber,
  IsObject, Min, Max, IsIn, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ── Nested Objects ───────────────────────────────────────────────────────────

export class BrandSettings {
  @ApiPropertyOptional({ example: 'Xennic Engineering' })
  @IsOptional() @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'https://storage.xennic.ir/logo.png' })
  @IsOptional() @IsString()
  logo_url?: string;

  @ApiPropertyOptional({ example: '#2563eb' })
  @IsOptional() @IsString()
  primary_color?: string;

  @ApiPropertyOptional({ example: '#7c3aed' })
  @IsOptional() @IsString()
  accent_color?: string;
}

export class LocalizationSettings {
  @ApiProperty({ example: 'fa', enum: ['fa', 'en'] })
  @IsString() @IsIn(['fa', 'en'])
  locale: string = 'fa';

  @ApiProperty({ example: 'Asia/Tehran' })
  @IsString()
  timezone: string = 'Asia/Tehran';

  @ApiProperty({ example: 'YYYY/MM/DD' })
  @IsString()
  date_format: string = 'YYYY/MM/DD';

  @ApiProperty({ example: 'fa', enum: ['fa', 'en'] })
  @IsString() @IsIn(['fa', 'en'])
  number_format: string = 'fa';

  @ApiProperty({ example: 'rtl', enum: ['rtl', 'ltr'] })
  @IsString() @IsIn(['rtl', 'ltr'])
  direction: string = 'rtl';
}

export class IndustrySettings {
  @ApiPropertyOptional({ example: 'power' })
  @IsOptional() @IsString()
  sector?: string;

  @ApiPropertyOptional({ example: 'transmission_distribution' })
  @IsOptional() @IsString()
  sub_sector?: string;

  @ApiPropertyOptional({ example: ['LV', 'MV', 'power_quality'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  engineering_fields?: string[];
}

export class DefaultCalculationSettings {
  @ApiPropertyOptional({ example: 0.4 })
  @IsOptional() @IsNumber() @Min(0) @Max(1000)
  voltage_level_kv?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional() @IsNumber() @Min(50) @Max(60)
  frequency_hz?: number;

  @ApiPropertyOptional({ example: 35 })
  @IsOptional() @IsNumber() @Min(-20) @Max(80)
  ambient_temperature_c?: number;

  @ApiPropertyOptional({ example: 'copper' })
  @IsOptional() @IsString()
  conductor_material?: string;

  @ApiPropertyOptional({ example: 'XLPE' })
  @IsOptional() @IsString()
  insulation_type?: string;

  @ApiPropertyOptional({ example: 0.85 })
  @IsOptional() @IsNumber() @Min(0) @Max(1)
  power_factor?: number;

  @ApiPropertyOptional({ example: 0.75 })
  @IsOptional() @IsNumber() @Min(0) @Max(2)
  load_factor?: number;
}

export class NotificationSettings {
  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean()
  email_alerts?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean()
  calculation_completed?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean()
  member_joined?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional() @IsBoolean()
  weekly_report?: boolean;
}

export class FeatureSettings {
  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean()
  auto_save?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional() @IsBoolean()
  show_advanced_options?: boolean;

  @ApiPropertyOptional({ example: 'pdf', enum: ['pdf', 'xlsx', 'csv'] })
  @IsOptional() @IsString() @IsIn(['pdf', 'xlsx', 'csv'])
  export_default_format?: string;
}

// ── Main DTO ─────────────────────────────────────────────────────────────────

export class WorkspaceSettingsDto {
  @ApiPropertyOptional({ type: BrandSettings })
  @IsOptional() @IsObject() @ValidateNested() @Type(() => BrandSettings)
  brand?: BrandSettings;

  @ApiPropertyOptional({ type: LocalizationSettings })
  @IsOptional() @IsObject() @ValidateNested() @Type(() => LocalizationSettings)
  localization?: LocalizationSettings;

  @ApiPropertyOptional({ type: IndustrySettings })
  @IsOptional() @IsObject() @ValidateNested() @Type(() => IndustrySettings)
  industry?: IndustrySettings;

  @ApiPropertyOptional({ type: DefaultCalculationSettings })
  @IsOptional() @IsObject() @ValidateNested() @Type(() => DefaultCalculationSettings)
  defaults?: DefaultCalculationSettings;

  @ApiPropertyOptional({ type: NotificationSettings })
  @IsOptional() @IsObject() @ValidateNested() @Type(() => NotificationSettings)
  notifications?: NotificationSettings;

  @ApiPropertyOptional({ type: FeatureSettings })
  @IsOptional() @IsObject() @ValidateNested() @Type(() => FeatureSettings)
  features?: FeatureSettings;
}

// ── Response ─────────────────────────────────────────────────────────────────

export class WorkspaceSettingsResponseDto {
  @ApiProperty({ description: 'Workspace ID' })
  workspaceId: string;

  @ApiProperty({ type: WorkspaceSettingsDto })
  settings: WorkspaceSettingsDto;

  @ApiProperty({ example: '2026-06-03T02:59:44.524Z' })
  updatedAt: Date;

  constructor(workspaceId: string, settings: WorkspaceSettingsDto, updatedAt: Date) {
    this.workspaceId = workspaceId;
    this.settings    = settings;
    this.updatedAt   = updatedAt;
  }
}

// ── Update DTO ───────────────────────────────────────────────────────────────

export class UpdateWorkspaceSettingsDto {
  @ApiPropertyOptional({ type: BrandSettings })
  @IsOptional() @IsObject() @ValidateNested() @Type(() => BrandSettings)
  brand?: BrandSettings;

  @ApiPropertyOptional({ type: LocalizationSettings })
  @IsOptional() @IsObject() @ValidateNested() @Type(() => LocalizationSettings)
  localization?: LocalizationSettings;

  @ApiPropertyOptional({ type: IndustrySettings })
  @IsOptional() @IsObject() @ValidateNested() @Type(() => IndustrySettings)
  industry?: IndustrySettings;

  @ApiPropertyOptional({ type: DefaultCalculationSettings })
  @IsOptional() @IsObject() @ValidateNested() @Type(() => DefaultCalculationSettings)
  defaults?: DefaultCalculationSettings;

  @ApiPropertyOptional({ type: NotificationSettings })
  @IsOptional() @IsObject() @ValidateNested() @Type(() => NotificationSettings)
  notifications?: NotificationSettings;

  @ApiPropertyOptional({ type: FeatureSettings })
  @IsOptional() @IsObject() @ValidateNested() @Type(() => FeatureSettings)
  features?: FeatureSettings;
}
