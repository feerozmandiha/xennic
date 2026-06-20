import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class CreateVendorDto {
  @ApiProperty({ example: 'Siemens' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'siemens' })
  @IsOptional()
  @IsString()
  slug?: string;
}

export class UpdateVendorDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'suspended'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'] as const)
  status?: 'active' | 'inactive' | 'suspended';
}
