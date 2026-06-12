import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import type { IUserRepository } from '../../domain/interfaces/user.repository.interface.js';
import { UserEntity } from '../../domain/entities/user.entity.js';
import { Argon2Service } from '../../infrastructure/hashing/argon2.service.js';

// DTOها را در همین فایل تعریف کنید
export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly hashingService: Argon2Service,
  ) {}

  async create(createUserDto: CreateUserDto, createdBy: string): Promise<UserEntity> {
    const emailExists = await this.userRepository.existsByEmail(createUserDto.email);
    if (emailExists) {
      throw new ConflictException(`User with email "${createUserDto.email}" already exists`);
    }

    const user = UserEntity.create(
      createUserDto.email,
      createUserDto.password,
      createUserDto.firstName,
      createUserDto.lastName,
      createUserDto.phone,
      createdBy,
    );

    const hashedPassword = await this.hashingService.hash(user.password.value);
    user.setPasswordHash(hashedPassword);

    await this.userRepository.save(user);

    return user;
  }

  async findAll(page = 1, limit = 20): Promise<{
    data: UserEntity[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.userRepository.findAll(offset, limit),
      this.userRepository.count(),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);

    if (!user || user.isDeleted()) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto, updatedBy: string): Promise<UserEntity> {
    const user = await this.findOne(id);

    if (updateUserDto.firstName || updateUserDto.lastName) {
      user.updateProfile(
        updateUserDto.firstName || user.firstName,
        updateUserDto.lastName || user.lastName,
        updatedBy,
      );
    }

    if (updateUserDto.phone !== undefined) {
      user.updatePhone(updateUserDto.phone, updatedBy);
    }

    await this.userRepository.save(user);

    return user;
  }

  async remove(id: string, deletedBy: string): Promise<void> {
    const user = await this.findOne(id);
    user.softDelete(deletedBy);
    await this.userRepository.save(user);
  }

  async restore(id: string, restoredBy: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    user.restore(restoredBy);
    await this.userRepository.save(user);

    return user;
  }

  async hardDelete(id: string): Promise<void> {
    const exists = await this.userRepository.exists(id);

    if (!exists) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    await this.userRepository.delete(id);
  }
}