import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class SetFeatureFlagDto {
  @ApiPropertyOptional({ description: 'Workspace ID (null = global)' })
  @IsOptional()
  @IsString()
  workspaceId?: string;

  @ApiPropertyOptional({ description: 'Provider ID (null = all)' })
  @IsOptional()
  @IsString()
  providerId?: string;

  @ApiPropertyOptional({ description: 'Model ID (null = all)' })
  @IsOptional()
  @IsString()
  modelId?: string;

  @ApiProperty({
    description: 'Feature name',
    example: 'vision',
    enum: [
      'vision',
      'embedding',
      'reasoning',
      'audio',
      'ocr',
      'image_generation',
      'translation',
      'tools',
      'json_mode',
    ],
  })
  @IsString()
  @IsNotEmpty()
  feature!: string;

  @ApiProperty({ description: 'Enable or disable feature' })
  @IsBoolean()
  enabled!: boolean;
}
