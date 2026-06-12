import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './presentation/controllers/auth.controller.js';
import { AuthService } from './application/services/auth.service.js';
import { JwtService } from './infrastructure/jwt/jwt.service.js';
import { JwtStrategy } from './presentation/strategies/jwt.strategy.js';
import { SessionRepository } from './infrastructure/repositories/session.repository.js';
import { RefreshTokenRepository } from './infrastructure/repositories/refresh-token.repository.js';
import { UserModule } from '../user/user.module.js';
import { Argon2Service } from '../user/infrastructure/hashing/argon2.service.js';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      signOptions: {
        algorithm: 'RS256',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    JwtStrategy,
    Argon2Service,
    {
      provide: 'ISessionRepository',
      useClass: SessionRepository,
    },
    {
      provide: 'IRefreshTokenRepository',
      useClass: RefreshTokenRepository,
    },
  ],
  exports: [AuthService, JwtService],
})
export class AuthModule {}