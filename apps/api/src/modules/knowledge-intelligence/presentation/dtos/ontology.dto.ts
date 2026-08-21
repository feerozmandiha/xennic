import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

const CONTAINS_NON_WHITESPACE = /\S/;

export class RegisterOntologyDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @Matches(CONTAINS_NON_WHITESPACE)
  @MaxLength(200)
  name!: string;

  @ApiProperty({ maxLength: 120 })
  @IsString()
  @Matches(CONTAINS_NON_WHITESPACE)
  @MaxLength(120)
  slug!: string;

  @ApiProperty({ maxLength: 50 })
  @IsString()
  @Matches(CONTAINS_NON_WHITESPACE)
  @MaxLength(50)
  version!: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

export class ClassifyGraphNodeDto {
  @ApiProperty({ description: 'URI of a class in an active workspace ontology', maxLength: 2048 })
  @IsString()
  @Matches(CONTAINS_NON_WHITESPACE)
  @MaxLength(2048)
  classUri!: string;
}
