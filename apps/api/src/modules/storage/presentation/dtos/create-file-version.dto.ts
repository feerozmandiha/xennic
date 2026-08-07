import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO ورودی برای ساخت نسخه جدید فایل.
 *
 * فایل به‌صورت multipart/form-data ارسال می‌شود؛ این DTO فقط فیلدهای
 * غیر-فایلی (تغییرات توضیحات) را اعتبارسنجی می‌کند. اندازه و MIME فایل
 * در لایه Service اعتبارسنجی می‌شود.
 */
export class CreateFileVersionDto {
  @ApiPropertyOptional({
    description: 'Reason for creating this version (max 500 chars)',
    example: 'Incorporated client feedback on section 3',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  changeReason?: string;
}
