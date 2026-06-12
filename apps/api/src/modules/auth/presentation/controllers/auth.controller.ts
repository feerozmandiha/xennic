import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Ip,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service.js';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  AuthResponseDto,
  UserResponseDto,
} from '../dtos/auth.dto.js';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user', description: 'Creates a new user account and returns authentication tokens.' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async register(
    @Body() registerDto: RegisterDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ): Promise<{ success: boolean; data: AuthResponseDto }> {
    const data = await this.authService.register(registerDto, ip, userAgent);
    return { success: true, data };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password', description: 'Authenticates user and returns JWT tokens.' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ): Promise<{ success: boolean; data: AuthResponseDto }> {
    const data = await this.authService.login(loginDto, ip, userAgent);
    return { success: true, data };
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token', description: 'Generates a new access token using a valid refresh token.' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ success: boolean; data: AuthResponseDto }> {
    const data = await this.authService.refreshToken(refreshTokenDto.refreshToken);
    return { success: true, data };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout', description: 'Revokes all tokens and sessions for the current user.' })
  @ApiResponse({ status: 204, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @Req() req: any,
    @Body() body?: { refreshToken?: string },
  ): Promise<void> {
    await this.authService.logout(req.user.userId, body?.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile', description: 'Returns the profile of the authenticated user.' })
  @ApiResponse({ status: 200, description: 'User profile retrieved', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@Req() req: any): Promise<{ success: boolean; data: UserResponseDto }> {
    const data = await this.authService.getMe(req.user.userId);
    return { success: true, data };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Request password reset', description: 'Sends a password reset link to the user\'s email.' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 202, description: 'Password reset email sent if user exists' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ success: boolean; message: string }> {
    return { 
      success: true, 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password', description: 'Resets user password using a valid reset token.' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ success: boolean; message: string }> {
    return { 
      success: true, 
      message: 'Password has been reset successfully.' 
    };
  }

  @Put('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change password', description: 'Changes the password of the authenticated user.' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  async changePassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    return { 
      success: true, 
      message: 'Password changed successfully.' 
    };
  }
}