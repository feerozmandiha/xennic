import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RevertFileVersionDto {
  @ApiPropertyOptional({
    description: 'Reason for reverting (max 500 chars)',
    example: 'Rolling back to the approved version',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  changeReason?: string;
}
