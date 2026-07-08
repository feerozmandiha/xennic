import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class SearchQueryDto {
  @IsString()
  q: string = '';

  @IsOptional()
  @IsString()
  standard?: string;

  @IsOptional()
  @IsString()
  equipmentType?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
