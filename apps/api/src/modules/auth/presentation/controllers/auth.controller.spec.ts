jest.mock('@xennic/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    session: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    passwordResetToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((fn: any) => fn()),
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from '../../application/services/auth.service.js';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  AuthResponseDto,
  UserResponseDto,
} from '../dtos/auth.dto.js';

const mockAuthResponse: AuthResponseDto = {
  accessToken: 'test-access-token',
  refreshToken: 'test-refresh-token',
  expiresIn: 900,
  tokenType: 'Bearer',
  user: {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    status: 'active',
  },
};

const mockUserResponse: UserResponseDto = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  status: 'active',
  isEmailVerified: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockReq = { user: { userId: 'user-123' } };
const mockIp = '127.0.0.1';
const mockUserAgent = 'jest-test-agent';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
            getMe: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
            changePassword: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService) as jest.Mocked<AuthService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return auth response', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      };
      service.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(dto, mockIp, mockUserAgent);

      expect(result).toEqual({ success: true, data: mockAuthResponse });
      expect(service.register).toHaveBeenCalledWith(dto, mockIp, mockUserAgent);
      expect(service.register).toHaveBeenCalledTimes(1);
    });

    it('should register without optional userAgent', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      };
      service.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(dto, mockIp);

      expect(result).toEqual({ success: true, data: mockAuthResponse });
      expect(service.register).toHaveBeenCalledWith(dto, mockIp, undefined);
    });
  });

  describe('login', () => {
    it('should login user and return auth response', async () => {
      const dto: LoginDto = { email: 'test@example.com', password: 'SecurePass123!' };
      service.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(dto, mockIp, mockUserAgent);

      expect(result).toEqual({ success: true, data: mockAuthResponse });
      expect(service.login).toHaveBeenCalledWith(dto, mockIp, mockUserAgent);
      expect(service.login).toHaveBeenCalledTimes(1);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token and return auth response', async () => {
      const dto: RefreshTokenDto = { refreshToken: 'old-refresh-token' };
      service.refreshToken.mockResolvedValue(mockAuthResponse);

      const result = await controller.refreshToken(dto);

      expect(result).toEqual({ success: true, data: mockAuthResponse });
      expect(service.refreshToken).toHaveBeenCalledWith(dto.refreshToken);
      expect(service.refreshToken).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout', () => {
    it('should logout user without body', async () => {
      service.logout.mockResolvedValue(undefined);

      const result = await controller.logout(mockReq);

      expect(result).toBeUndefined();
      expect(service.logout).toHaveBeenCalledWith('user-123', undefined);
      expect(service.logout).toHaveBeenCalledTimes(1);
    });

    it('should logout user with refresh token in body', async () => {
      const body = { refreshToken: 'test-refresh-token' };
      service.logout.mockResolvedValue(undefined);

      const result = await controller.logout(mockReq, body);

      expect(result).toBeUndefined();
      expect(service.logout).toHaveBeenCalledWith('user-123', 'test-refresh-token');
    });
  });

  describe('getMe', () => {
    it('should return current user profile', async () => {
      service.getMe.mockResolvedValue(mockUserResponse);

      const result = await controller.getMe(mockReq);

      expect(result).toEqual({ success: true, data: mockUserResponse });
      expect(service.getMe).toHaveBeenCalledWith('user-123');
      expect(service.getMe).toHaveBeenCalledTimes(1);
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email', async () => {
      const dto: ForgotPasswordDto = { email: 'test@example.com' };
      service.forgotPassword.mockResolvedValue(undefined);

      const result = await controller.forgotPassword(dto, mockIp);

      expect(result).toEqual({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
      expect(service.forgotPassword).toHaveBeenCalledWith(dto.email, mockIp);
      expect(service.forgotPassword).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const dto: ResetPasswordDto = { token: 'reset-token', newPassword: 'NewSecurePass123!' };
      service.resetPassword.mockResolvedValue(undefined);

      const result = await controller.resetPassword(dto, mockIp);

      expect(result).toEqual({
        success: true,
        message: 'Password has been reset successfully.',
      });
      expect(service.resetPassword).toHaveBeenCalledWith(dto.token, dto.newPassword, mockIp);
      expect(service.resetPassword).toHaveBeenCalledTimes(1);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const dto: ChangePasswordDto = { currentPassword: 'OldPass123!', newPassword: 'NewPass123!' };
      service.changePassword.mockResolvedValue(undefined);

      const result = await controller.changePassword(mockReq, dto, mockIp);

      expect(result).toEqual({
        success: true,
        message: 'Password changed successfully.',
      });
      expect(service.changePassword).toHaveBeenCalledWith('user-123', dto.currentPassword, dto.newPassword, mockIp);
      expect(service.changePassword).toHaveBeenCalledTimes(1);
    });
  });
});
