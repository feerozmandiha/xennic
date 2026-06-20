import { Injectable, UnauthorizedException, ConflictException, Inject, BadRequestException } from '@nestjs/common';
import { JwtService } from '../../infrastructure/jwt/jwt.service.js';
import { UserService } from '../../../user/application/services/user.service.js';
import { Argon2Service } from '../../../user/infrastructure/hashing/argon2.service.js';
import { JwtPayloadVO } from '../../domain/value-objects/jwt-payload.vo.js';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token.entity.js';
import { SessionEntity } from '../../domain/entities/session.entity.js';
import type { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface.js';
import type { ISessionRepository } from '../../domain/interfaces/session.repository.interface.js';
import { EmailService } from '../../../email/application/services/email.service.js';
import { prisma } from '@xennic/database';
import * as crypto from 'crypto';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly hashingService: Argon2Service,
    private readonly emailService: EmailService,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async register(registerDto: RegisterDto, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.userService.create(registerDto, 'system');
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email);
    const session = SessionEntity.create(user.id, ipAddress, userAgent);
    await this.sessionRepository.save(session);

    // ارسال ایمیل خوش‌آمدگویی (non-blocking)
    this.emailService.sendWelcome(user.email, `${user.firstName} ${user.lastName}`).catch(err =>
      console.error(`[EMAIL] Welcome email failed: ${err.message}`),
    );

    return this.formatAuthResponse(accessToken, refreshToken, user);
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.hashingService.verify(user.password.hash, loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive()) {
      throw new UnauthorizedException('Account is inactive. Please contact support.');
    }

    user.recordLogin();
    await this.userService.update(user.id, {}, 'system');

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email);
    const session = SessionEntity.create(user.id, ipAddress, userAgent);
    await this.sessionRepository.save(session);

    // لاگ ساده در console برای MVP
    console.log(`[AUDIT] User logged in: ${user.email} from ${ipAddress}`);

    return this.formatAuthResponse(accessToken, refreshToken, user);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);
    
    if (!storedToken || !storedToken.isValid()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userService.findOne(storedToken.userId);
    if (!user || !user.isActive()) {
      throw new UnauthorizedException('User not found or inactive');
    }

    await this.refreshTokenRepository.revoke(storedToken.id);
    const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user.id, user.email);

    return this.formatAuthResponse(accessToken, newRefreshToken, user);
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllByUserId(userId);
    await this.sessionRepository.deleteByUserId(userId);
    
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);
      if (storedToken && !storedToken.isRevoked()) {
        await this.refreshTokenRepository.revoke(storedToken.id);
      }
    }

    console.log(`[AUDIT] User logged out: ${userId}`);
  }

  async getMe(userId: string): Promise<any> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      isEmailVerified: user.emailVerifiedAt !== null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async generateTokens(userId: string, email: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = JwtPayloadVO.create(userId, email, ['user']);
    const accessToken = await this.jwtService.sign(payload);
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const refreshTokenEntity = RefreshTokenEntity.create(userId, tokenHash);
    await this.refreshTokenRepository.save(refreshTokenEntity);
    return { accessToken, refreshToken };
  }

  private formatAuthResponse(accessToken: string, refreshToken: string, user: any): AuthResponse {
    return {
      accessToken,
      refreshToken,
      expiresIn: parseInt(process.env.JWT_ACCESS_TOKEN_TTL || '900', 10),
      tokenType: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
      },
    };
  }

  async forgotPassword(email: string, ipAddress?: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.$executeRaw`
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
      VALUES (${user.id}, ${tokenHash}, ${expiresAt})
    `;

    // ارسال ایمیل بازیابی رمز (non-blocking)
    this.emailService.sendPasswordReset(email, `${user.firstName} ${user.lastName}`, resetToken).catch(err =>
      console.error(`[EMAIL] Password reset email failed: ${err.message}`),
    );
    console.log(`[AUDIT] Password reset requested for: ${email} from ${ipAddress}`);
  }

  async resetPassword(token: string, newPassword: string, ipAddress?: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const resetRequest = await prisma.$queryRaw<any[]>`
      SELECT * FROM password_reset_tokens 
      WHERE token_hash = ${tokenHash} AND used_at IS NULL AND expires_at > NOW()
    `;

    if (!resetRequest || resetRequest.length === 0) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.userService.findOne(resetRequest[0].user_id);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const hashedPassword = await this.hashingService.hash(newPassword);
    user.setPasswordHash(hashedPassword);
    await this.userService.update(user.id, {}, 'system');

    await prisma.$executeRaw`
      UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ${resetRequest[0].id}
    `;

    await this.refreshTokenRepository.revokeAllByUserId(user.id);

    console.log(`[AUDIT] Password reset successful for user: ${user.email} from ${ipAddress}`);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string, ipAddress?: string): Promise<void> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await this.hashingService.verify(user.password.hash, currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await this.hashingService.hash(newPassword);
    user.setPasswordHash(hashedPassword);
    await this.userService.update(user.id, {}, userId);

    console.log(`[AUDIT] Password changed for user: ${user.email} from ${ipAddress}`);
  }
}