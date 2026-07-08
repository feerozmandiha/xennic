import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UploadDocumentDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  metadata?: string;
}
