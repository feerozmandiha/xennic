import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';
import { UserEntity } from '../../domain/entities/user.entity.js';

@ApiExtraModels()
export class UserResponseDto {
  @ApiProperty({ description: 'User unique identifier' })
  id: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Phone number', nullable: true })
  phone: string | null;

  @ApiProperty({ description: 'First name' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  lastName: string;

  @ApiProperty({ description: 'Full name' })
  fullName: string;

  @ApiProperty({ description: 'Account status' })
  status: string;

  @ApiProperty({ description: 'Email verification status' })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Last login timestamp', nullable: true })
  lastLoginAt: Date | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Soft delete status' })
  isDeleted: boolean;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.email = user.email;
    this.phone = user.phone;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    // BUG FIX: now uses the dedicated fullName getter instead of
    // concatenating firstName + lastName where lastName was broken.
    this.fullName = user.fullName;
    this.status = user.status;
    this.isEmailVerified = user.emailVerifiedAt !== null;
    this.lastLoginAt = user.lastLoginAt;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.isDeleted = user.isDeleted();
  }

  static fromEntity(user: UserEntity): UserResponseDto {
    return new UserResponseDto(user);
  }

  static fromEntities(users: UserEntity[]): UserResponseDto[] {
    return users.map((user) => new UserResponseDto(user));
  }
}