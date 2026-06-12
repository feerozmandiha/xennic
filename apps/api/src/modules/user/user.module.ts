import { Module } from '@nestjs/common';
import { UserController } from './presentation/controllers/user.controller.js';
import { UserService } from './application/services/user.service.js';
import { UserRepository } from './infrastructure/repositories/user.repository.js';
import { Argon2Service } from './infrastructure/hashing/argon2.service.js';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    Argon2Service,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    UserRepository,
  ],
  exports: [UserService],
})
export class UserModule {}