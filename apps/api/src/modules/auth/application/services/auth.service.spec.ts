jest.mock('@xennic/database', () => ({
  prisma: {
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';

import { AuthService } from './auth.service.js';
import type { RegisterDto, LoginDto } from './auth.service.js';
import { JwtService } from '../../infrastructure/jwt/jwt.service.js';
import { UserService } from '../../../user/application/services/user.service.js';
import { Argon2Service } from '../../../user/infrastructure/hashing/argon2.service.js';
import { EmailService } from '../../../email/application/services/email.service.js';
import type { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface.js';
import type { ISessionRepository } from '../../domain/interfaces/session.repository.interface.js';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token.entity.js';
import { UserEntity } from '../../../user/domain/entities/user.entity.js';
import { prisma } from '@xennic/database';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildUser(
  overrides: Partial<{
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    status: string;
    emailVerifiedAt: Date | null;
    lastLoginAt: Date | null;
    deletedAt: Date | null;
  }> = {},
): UserEntity {
  return UserEntity.reconstitute({
    id: 'b10e5d80-1111-4000-8000-000000000001',
    email: 'jane@example.com',
    passwordHash: 'argon2-hash-placeholder',
    firstName: 'Jane',
    lastName: 'Doe',
    phone: null,
    avatarFileId: null,
    status: 'active',
    emailVerifiedAt: null,
    lastLoginAt: null,
    createdBy: 'seed',
    updatedBy: null,
    createdAt: new Date('2024-06-01T00:00:00Z'),
    updatedAt: new Date('2024-06-01T00:00:00Z'),
    deletedAt: null,
    ...overrides,
  });
}

function buildRefreshToken(
  overrides: Partial<{
    id: string;
    userId: string;
    tokenHash: string;
    revokedAt: Date | null;
    expiresAt: Date;
    createdAt: Date;
  }> = {},
): RefreshTokenEntity {
  return RefreshTokenEntity.reconstitute({
    id: 'rt-0001',
    userId: 'b10e5d80-1111-4000-8000-000000000001',
    tokenHash: 'known-token-hash',
    revokedAt: null,
    expiresAt: new Date(Date.now() + 86_400_000),
    createdAt: new Date(),
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let hashingService: jest.Mocked<Argon2Service>;
  let emailService: jest.Mocked<EmailService>;
  let refreshTokenRepo: jest.Mocked<IRefreshTokenRepository>;
  let sessionRepo: jest.Mocked<ISessionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn() },
        },
        {
          provide: Argon2Service,
          useValue: { verify: jest.fn(), hash: jest.fn() },
        },
        {
          provide: EmailService,
          useValue: {
            sendWelcome: jest.fn().mockResolvedValue(undefined),
            sendPasswordReset: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: 'IRefreshTokenRepository',
          useValue: {
            findByTokenHash: jest.fn(),
            save: jest.fn(),
            revoke: jest.fn(),
            revokeAllByUserId: jest.fn(),
          },
        },
        {
          provide: 'ISessionRepository',
          useValue: {
            save: jest.fn(),
            deleteByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    userService = module.get(UserService) as jest.Mocked<UserService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    hashingService = module.get(Argon2Service) as jest.Mocked<Argon2Service>;
    emailService = module.get(EmailService) as jest.Mocked<EmailService>;
    refreshTokenRepo = module.get('IRefreshTokenRepository') as jest.Mocked<IRefreshTokenRepository>;
    sessionRepo = module.get('ISessionRepository') as jest.Mocked<ISessionRepository>;

    (prisma.$executeRaw as jest.Mock).mockResolvedValue(undefined);
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // register
  // -----------------------------------------------------------------------
  describe('register', () => {
    const dto: RegisterDto = {
      email: 'jane@example.com',
      password: 'StrongP@ss1',
      firstName: 'Jane',
      lastName: 'Doe',
    };
    const ip = '10.0.0.1';
    const ua = 'Mozilla/5.0';

    it('creates user, saves session, sends welcome, returns tokens', async () => {
      const user = buildUser();
      userService.findByEmail.mockResolvedValue(null);
      userService.create.mockResolvedValue(user);
      jwtService.sign.mockResolvedValue('jwt-access');

      const res = await authService.register(dto, ip, ua);

      expect(userService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(userService.create).toHaveBeenCalledWith(dto, 'system');
      expect(jwtService.sign).toHaveBeenCalled();
      expect(refreshTokenRepo.save).toHaveBeenCalledTimes(1);
      expect(sessionRepo.save).toHaveBeenCalledTimes(1);
      expect(emailService.sendWelcome).toHaveBeenCalledWith(
        user.email,
        `${user.firstName} ${user.lastName}`,
      );
      expect(res).toMatchObject({
        accessToken: 'jwt-access',
        refreshToken: expect.any(String),
        expiresIn: expect.any(Number),
        tokenType: 'Bearer',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status,
        },
      });
    });

    it('throws ConflictException when email is taken', async () => {
      userService.findByEmail.mockResolvedValue(buildUser());

      await expect(authService.register(dto)).rejects.toThrow(ConflictException);
      expect(userService.create).not.toHaveBeenCalled();
      expect(emailService.sendWelcome).not.toHaveBeenCalled();
    });

    it('works without ip / userAgent', async () => {
      userService.findByEmail.mockResolvedValue(null);
      userService.create.mockResolvedValue(buildUser());
      jwtService.sign.mockResolvedValue('jwt-access');

      const res = await authService.register(dto);

      expect(sessionRepo.save).toHaveBeenCalled();
      expect(res.accessToken).toBe('jwt-access');
    });

    it('does not throw when welcome email fails (non‑blocking)', async () => {
      userService.findByEmail.mockResolvedValue(null);
      userService.create.mockResolvedValue(buildUser());
      jwtService.sign.mockResolvedValue('jwt-access');
      emailService.sendWelcome.mockRejectedValue(new Error('SMTP down'));

      const res = await authService.register(dto);

      expect(res.accessToken).toBe('jwt-access');
    });
  });

  // -----------------------------------------------------------------------
  // login
  // -----------------------------------------------------------------------
  describe('login', () => {
    const dto: LoginDto = { email: 'jane@example.com', password: 'StrongP@ss1' };

    it('validates credentials, records login, returns tokens', async () => {
      const user = buildUser();
      userService.findByEmail.mockResolvedValue(user);
      hashingService.verify.mockResolvedValue(true);
      jwtService.sign.mockResolvedValue('jwt-access');

      const res = await authService.login(dto, '10.0.0.1');

      expect(userService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(hashingService.verify).toHaveBeenCalledWith(user.password.hash, dto.password);
      expect(userService.update).toHaveBeenCalledWith(user.id, {}, 'system');
      expect(sessionRepo.save).toHaveBeenCalled();
      expect(res.accessToken).toBe('jwt-access');
    });

    it('throws UnauthorizedException when email does not exist', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(hashingService.verify).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      userService.findByEmail.mockResolvedValue(buildUser());
      hashingService.verify.mockResolvedValue(false);

      await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when account is inactive', async () => {
      userService.findByEmail.mockResolvedValue(buildUser({ status: 'suspended' }));
      hashingService.verify.mockResolvedValue(true);

      await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(userService.update).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // refreshToken
  // -----------------------------------------------------------------------
  describe('refreshToken', () => {
    it('returns new tokens when refresh token is valid', async () => {
      const token = 'valid-refresh-token';
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      const stored = buildRefreshToken({ tokenHash: hash });
      const user = buildUser();

      refreshTokenRepo.findByTokenHash.mockImplementation((h) =>
        Promise.resolve(h === hash ? stored : null),
      );
      userService.findOne.mockResolvedValue(user);
      jwtService.sign.mockResolvedValue('new-jwt');

      const res = await authService.refreshToken(token);

      expect(refreshTokenRepo.revoke).toHaveBeenCalledWith(stored.id);
      expect(refreshTokenRepo.save).toHaveBeenCalledTimes(1);
      expect(res.accessToken).toBe('new-jwt');
    });

    it('throws UnauthorizedException when token is not found', async () => {
      refreshTokenRepo.findByTokenHash.mockResolvedValue(null);

      await expect(authService.refreshToken('unknown')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when token is revoked', async () => {
      const token = 'revoked-token';
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      refreshTokenRepo.findByTokenHash.mockResolvedValue(
        buildRefreshToken({ tokenHash: hash, revokedAt: new Date() }),
      );

      await expect(authService.refreshToken(token)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user is inactive', async () => {
      const token = 'token-inactive-user';
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      refreshTokenRepo.findByTokenHash.mockResolvedValue(
        buildRefreshToken({ tokenHash: hash }),
      );
      userService.findOne.mockResolvedValue(buildUser({ status: 'suspended' }));

      await expect(authService.refreshToken(token)).rejects.toThrow(UnauthorizedException);
    });
  });

  // -----------------------------------------------------------------------
  // logout
  // -----------------------------------------------------------------------
  describe('logout', () => {
    const userId = 'b10e5d80-1111-4000-8000-000000000001';

    it('revokes all tokens and deletes sessions without refreshToken', async () => {
      await authService.logout(userId);

      expect(refreshTokenRepo.revokeAllByUserId).toHaveBeenCalledWith(userId);
      expect(sessionRepo.deleteByUserId).toHaveBeenCalledWith(userId);
      expect(refreshTokenRepo.findByTokenHash).not.toHaveBeenCalled();
    });

    it('also revokes the specific refresh token when provided', async () => {
      const token = 'my-refresh';
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      const stored = buildRefreshToken({ tokenHash: hash });
      refreshTokenRepo.findByTokenHash.mockResolvedValue(stored);

      await authService.logout(userId, token);

      expect(refreshTokenRepo.revokeAllByUserId).toHaveBeenCalledWith(userId);
      expect(sessionRepo.deleteByUserId).toHaveBeenCalledWith(userId);
      expect(refreshTokenRepo.revoke).toHaveBeenCalledWith(stored.id);
    });

    it('skips revoke when the provided token is already revoked', async () => {
      const token = 'already-revoked';
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      const stored = buildRefreshToken({
        tokenHash: hash,
        revokedAt: new Date(),
      });
      refreshTokenRepo.findByTokenHash.mockResolvedValue(stored);

      await authService.logout(userId, token);

      expect(refreshTokenRepo.revoke).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // getMe
  // -----------------------------------------------------------------------
  describe('getMe', () => {
    it('returns formatted user profile', async () => {
      const user = buildUser({ emailVerifiedAt: new Date('2024-06-15T00:00:00Z') });
      userService.findOne.mockResolvedValue(user);

      const profile = await authService.getMe(user.id);

      expect(profile).toEqual({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        isEmailVerified: true,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    });

    it('throws UnauthorizedException when user is not found', async () => {
      userService.findOne.mockResolvedValue(null as unknown as UserEntity);

      await expect(authService.getMe('missing')).rejects.toThrow(UnauthorizedException);
    });
  });

  // -----------------------------------------------------------------------
  // forgotPassword
  // -----------------------------------------------------------------------
  describe('forgotPassword', () => {
    const email = 'jane@example.com';

    it('inserts reset token and sends email when user exists', async () => {
      const user = buildUser();
      userService.findByEmail.mockResolvedValue(user);

      await authService.forgotPassword(email, '10.0.0.1');

      expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
      expect(emailService.sendPasswordReset).toHaveBeenCalledWith(
        email,
        `${user.firstName} ${user.lastName}`,
        expect.any(String),
      );
    });

    it('silently returns when user does not exist', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await authService.forgotPassword(email);

      expect(prisma.$executeRaw).not.toHaveBeenCalled();
      expect(emailService.sendPasswordReset).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // resetPassword
  // -----------------------------------------------------------------------
  describe('resetPassword', () => {
    const token = 'password-reset-token';
    const newPassword = 'NewStr0ng!Pass';

    it('hashes new password, updates user, marks token used', async () => {
      const user = buildUser();
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([
        { id: 'prt-001', user_id: user.id },
      ]);
      userService.findOne.mockResolvedValue(user);
      hashingService.hash.mockResolvedValue('new-argon2-hash');

      await authService.resetPassword(token, newPassword, '10.0.0.1');

      expect(hashingService.hash).toHaveBeenCalledWith(newPassword);
      expect(userService.update).toHaveBeenCalledWith(user.id, {}, 'system');
      expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
      expect(refreshTokenRepo.revokeAllByUserId).toHaveBeenCalledWith(user.id);
    });

    it('throws BadRequestException when token is invalid', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      await expect(
        authService.resetPassword('bad-token', newPassword),
      ).rejects.toThrow(BadRequestException);
      expect(hashingService.hash).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when user does not exist', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([
        { id: 'prt-001', user_id: 'missing-user' },
      ]);
      userService.findOne.mockResolvedValue(null as unknown as UserEntity);

      await expect(
        authService.resetPassword(token, newPassword),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // -----------------------------------------------------------------------
  // changePassword
  // -----------------------------------------------------------------------
  describe('changePassword', () => {
    const userId = 'b10e5d80-1111-4000-8000-000000000001';

    it('verifies current password, hashes new one, updates user', async () => {
      const user = buildUser();
      userService.findOne.mockResolvedValue(user);
      hashingService.verify.mockResolvedValue(true);
      hashingService.hash.mockResolvedValue('new-argon2-hash');

      await authService.changePassword(userId, 'CurrentP@ss1', 'NewP@ss123', '10.0.0.1');

      expect(hashingService.verify).toHaveBeenCalledWith('argon2-hash-placeholder', 'CurrentP@ss1');
      expect(hashingService.hash).toHaveBeenCalledWith('NewP@ss123');
      expect(userService.update).toHaveBeenCalledWith(user.id, {}, userId);
    });

    it('throws UnauthorizedException when user is not found', async () => {
      userService.findOne.mockResolvedValue(null as unknown as UserEntity);

      await expect(
        authService.changePassword(userId, 'CurrentP@ss1', 'NewP@ss123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when current password is wrong', async () => {
      userService.findOne.mockResolvedValue(buildUser());
      hashingService.verify.mockResolvedValue(false);

      await expect(
        authService.changePassword(userId, 'WrongP@ss1', 'NewP@ss123'),
      ).rejects.toThrow(UnauthorizedException);
      expect(hashingService.hash).not.toHaveBeenCalled();
    });
  });
});
