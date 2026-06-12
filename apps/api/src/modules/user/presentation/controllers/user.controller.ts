import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { UserService } from '../../application/services/user.service.js';
import type { CreateUserDto, UpdateUserDto } from '../../application/services/user.service.js';
import { UserResponseDto } from '../dtos/user-response.dto.js';

// برای Swagger نیاز به کلاس داریم، بنابراین کلاس‌های مجزا ایجاد می‌کنیم
import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@ApiTags('user')
@ApiBearerAuth('JWT-auth')
@Controller('user')

export class CreateUserHttpDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({ example: 'John', description: 'First name', minLength: 2, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName!: string;

  @ApiProperty({ example: 'Doe', description: 'Last name', minLength: 2, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName!: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Password' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase, one lowercase, one number, and one special character',
  })
  password!: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateUserHttpDto {
  @ApiProperty({ example: 'John', description: 'First name', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'Last name', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  lastName?: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user', description: 'Creates a new user account.' })
  @ApiBody({ type: CreateUserHttpDto })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async create(@Body() createUserDto: CreateUserHttpDto, @Req() req: any): Promise<UserResponseDto> {
    const userId = req.headers['x-user-id'] || 'system';
    const user = await this.userService.create(createUserDto, userId);
    return UserResponseDto.fromEntity(user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users', description: 'Returns paginated list of users.' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const { data, meta } = await this.userService.findAll(pageNum, limitNum);
    return {
      success: true,
      data: UserResponseDto.fromEntities(data),
      meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID', description: 'Returns detailed user information.' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.findOne(id);
    return UserResponseDto.fromEntity(user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user', description: 'Updates user profile information.' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiBody({ type: UpdateUserHttpDto })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserHttpDto,
    @Req() req: any,
  ): Promise<UserResponseDto> {
    const userId = req.headers['x-user-id'] || 'system';
    const user = await this.userService.update(id, updateUserDto, userId);
    return UserResponseDto.fromEntity(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete user', description: 'Marks user as deleted (can be restored).' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 204, description: 'User soft deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string, @Req() req: any): Promise<void> {
    const userId = req.headers['x-user-id'] || 'system';
    await this.userService.remove(id, userId);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted user', description: 'Restores a previously soft-deleted user.' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User restored successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async restore(@Param('id') id: string, @Req() req: any): Promise<UserResponseDto> {
    const userId = req.headers['x-user-id'] || 'system';
    const user = await this.userService.restore(id, userId);
    return UserResponseDto.fromEntity(user);
  }

  @Delete(':id/hard')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete user', description: '⚠️ IRREVERSIBLE - Completely removes user from database.' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 204, description: 'User permanently deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async hardDelete(@Param('id') id: string): Promise<void> {
    await this.userService.hardDelete(id);
  }
}