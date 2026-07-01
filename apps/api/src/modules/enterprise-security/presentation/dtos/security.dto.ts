import { IsString, IsOptional, IsEnum, IsInt, Min, Max, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLogQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() actorId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() resourceType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() resourceId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() action?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() severity?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() workspaceId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() fromDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() toDate?: string;
  @ApiProperty({ default: 1 }) @IsOptional() @IsInt() @Min(1) page = 1;
  @ApiProperty({ default: 50 }) @IsOptional() @IsInt() @Min(1) @Max(100) limit = 50;
}

export class EncryptDto {
  @ApiProperty() @IsString() plaintext!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() context?: string;
}

export class DecryptDto {
  @ApiProperty() @IsString() ciphertext!: string;
  @ApiProperty() @IsString() iv!: string;
  @ApiProperty() @IsString() tag!: string;
  @ApiProperty() @IsString() algorithm!: string;
  @ApiProperty() @IsString() keyId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() context?: string;
}

export class SignedUrlRequestDto {
  @ApiProperty({ enum: ['upload', 'download', 'delete'] }) @IsString() operation!: 'upload' | 'download' | 'delete';
  @ApiProperty() @IsString() bucket!: string;
  @ApiProperty() @IsString() path!: string;
  @ApiProperty() @IsInt() @Min(1) @Max(86400) expiresIn!: number;
}
