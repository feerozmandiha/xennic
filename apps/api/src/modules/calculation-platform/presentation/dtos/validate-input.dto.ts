import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class ValidateInputDto {
  @ApiProperty({ description: 'Calculation definition slug or ID' })
  @IsString()
  @IsNotEmpty()
  definitionId!: string;

  @ApiProperty({ description: 'Input values to validate' })
  @IsObject()
  inputs!: Record<string, unknown>;
}
