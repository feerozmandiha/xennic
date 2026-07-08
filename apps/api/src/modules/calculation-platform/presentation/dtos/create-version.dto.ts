import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class CreateVersionDto {
  @ApiProperty({ description: 'Semantic version string', example: '1.0.0' })
  @IsString()
  @IsNotEmpty()
  version!: string;

  @ApiProperty({ description: 'Full DSL definition JSON' })
  @IsObject()
  dslDefinition!: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Change log description' })
  @IsOptional()
  @IsString()
  changeLog?: string;
}
