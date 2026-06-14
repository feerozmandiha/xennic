import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'متن نظر', minLength: 1, maxLength: 2000 })
  @IsString()
  @IsNotEmpty({ message: 'متن نظر نمی‌تواند خالی باشد' })
  @MinLength(1)
  @MaxLength(2000, { message: 'متن نظر حداکثر ۲۰۰۰ کاراکتر' })
  content!: string;

  @ApiProperty({ description: 'شناسه نظر والد (برای پاسخ)', required: false })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateCommentDto {
  @ApiProperty({ description: 'متن ویرایش شده نظر', minLength: 1, maxLength: 2000 })
  @IsString()
  @IsNotEmpty({ message: 'متن نظر نمی‌تواند خالی باشد' })
  @MinLength(1)
  @MaxLength(2000)
  content!: string;
}

export class CommentResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() articleId!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() authorName!: string;
  @ApiProperty() authorAvatar!: string | null;
  @ApiProperty() content!: string;
  @ApiProperty() parentId!: string | null;
  @ApiProperty() likes!: number;
  @ApiProperty() likedBy!: string[];
  @ApiProperty() isEdited!: boolean;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
  @ApiProperty() replies!: CommentResponseDto[];
}
