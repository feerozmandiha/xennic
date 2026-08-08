import { IsBoolean, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLandingContentDto {
  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsObject()
  content!: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  versionNote?: string;

  @ApiPropertyOptional({ default: 'fa' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string;
}

export class PublishLandingContentDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  versionNote?: string;
}
