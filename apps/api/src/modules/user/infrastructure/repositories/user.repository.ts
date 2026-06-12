import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface.js';
import { UserEntity } from '../../domain/entities/user.entity.js';

@Injectable()
export class UserRepository implements IUserRepository {
  async save(user: UserEntity): Promise<void> {
    if (user.needsPasswordHashing()) {
      throw new Error('Password must be hashed before saving');
    }

    try {
      const existingUser = await prisma.$queryRaw<any[]>`
        SELECT id FROM "users" WHERE id = ${user.id}
      `;

      if (existingUser && existingUser.length > 0) {
        // Update existing user - using correct column names
        await prisma.$executeRaw`
          UPDATE "users" SET
            email = ${user.email},
            phone = ${user.phone},
            password = ${user.password.hash},
            first_name = ${user.firstName},
            last_name = ${user.lastName},
            is_active = ${user.status === 'active'},
            email_verified_at = ${user.emailVerifiedAt},
            last_login = ${user.lastLoginAt},
            updated_by = ${user.updatedBy},
            updated_at = ${new Date()},
            deleted_at = ${user.deletedAt}
          WHERE id = ${user.id}
        `;
      } else {
        // Create new user - using correct column names
        await prisma.$executeRaw`
          INSERT INTO "users" (
            id, email, phone, password, first_name, last_name,
            is_active, created_by, updated_by, created_at, updated_at
          ) VALUES (
            ${user.id}, ${user.email}, ${user.phone}, ${user.password.hash},
            ${user.firstName}, ${user.lastName}, ${user.status === 'active'},
            ${user.createdBy}, ${user.updatedBy}, ${new Date()}, ${new Date()}
          )
        `;
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error saving user:', error.message);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    try {
      const users = await prisma.$queryRaw<any[]>`
        SELECT * FROM "users" WHERE id = ${id} AND deleted_at IS NULL
      `;

      if (!users || users.length === 0) return null;
      const user = users[0];

      return UserEntity.reconstitute({
        id: user.id,
        email: user.email,
        passwordHash: user.password,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        avatarFileId: user.avatar_file_id,
        status: user.is_active ? 'active' : 'inactive',
        emailVerifiedAt: user.email_verified_at,
        lastLoginAt: user.last_login,
        createdBy: user.created_by,
        updatedBy: user.updated_by,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        deletedAt: user.deleted_at,
      });
    } catch (err) {
      const error = err as Error;
      console.error('Error finding user by id:', error.message);
      return null;
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const users = await prisma.$queryRaw<any[]>`
        SELECT * FROM "users" WHERE email = ${email.toLowerCase()} AND deleted_at IS NULL
      `;

      if (!users || users.length === 0) return null;
      const user = users[0];

      return UserEntity.reconstitute({
        id: user.id,
        email: user.email,
        passwordHash: user.password,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        avatarFileId: user.avatar_file_id,
        status: user.is_active ? 'active' : 'inactive',
        emailVerifiedAt: user.email_verified_at,
        lastLoginAt: user.last_login,
        createdBy: user.created_by,
        updatedBy: user.updated_by,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        deletedAt: user.deleted_at,
      });
    } catch (err) {
      const error = err as Error;
      console.error('Error finding user by email:', error.message);
      return null;
    }
  }

  async findByPhone(phone: string): Promise<UserEntity | null> {
    if (!phone) return null;
    
    try {
      const users = await prisma.$queryRaw<any[]>`
        SELECT * FROM "users" WHERE phone = ${phone} AND deleted_at IS NULL
      `;

      if (!users || users.length === 0) return null;
      const user = users[0];

      return UserEntity.reconstitute({
        id: user.id,
        email: user.email,
        passwordHash: user.password,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        avatarFileId: user.avatar_file_id,
        status: user.is_active ? 'active' : 'inactive',
        emailVerifiedAt: user.email_verified_at,
        lastLoginAt: user.last_login,
        createdBy: user.created_by,
        updatedBy: user.updated_by,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        deletedAt: user.deleted_at,
      });
    } catch (err) {
      const error = err as Error;
      console.error('Error finding user by phone:', error.message);
      return null;
    }
  }

  async findAll(offset = 0, limit = 20): Promise<UserEntity[]> {
    try {
      const users = await prisma.$queryRaw<any[]>`
        SELECT * FROM "users" 
        WHERE deleted_at IS NULL 
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;

      return users.map((user) =>
        UserEntity.reconstitute({
          id: user.id,
          email: user.email,
          passwordHash: user.password,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          avatarFileId: user.avatar_file_id,
          status: user.is_active ? 'active' : 'inactive',
          emailVerifiedAt: user.email_verified_at,
          lastLoginAt: user.last_login,
          createdBy: user.created_by,
          updatedBy: user.updated_by,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          deletedAt: user.deleted_at,
        }),
      );
    } catch (err) {
      const error = err as Error;
      console.error('Error finding all users:', error.message);
      return [];
    }
  }

  async count(filters?: { status?: string }): Promise<number> {
    try {
      let query = prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM "users" 
        WHERE deleted_at IS NULL
      `;
      
      if (filters?.status) {
        const isActive = filters.status === 'active';
        query = prisma.$queryRaw<any[]>`
          SELECT COUNT(*) as count FROM "users" 
          WHERE deleted_at IS NULL AND is_active = ${isActive}
        `;
      }
      
      const result = await query;
      return Number(result[0]?.count || 0);
    } catch (err) {
      const error = err as Error;
      console.error('Error counting users:', error.message);
      return 0;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        DELETE FROM "users" WHERE id = ${id}
      `;
    } catch (err) {
      const error = err as Error;
      console.error('Error deleting user:', error.message);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const result = await prisma.$queryRaw<any[]>`
        SELECT 1 FROM "users" WHERE id = ${id} LIMIT 1
      `;
      return result && result.length > 0;
    } catch (err) {
      const error = err as Error;
      console.error('Error checking user existence:', error.message);
      return false;
    }
  }

  async existsByEmail(email: string, excludeId?: string): Promise<boolean> {
    try {
      let query = prisma.$queryRaw<any[]>`
        SELECT 1 FROM "users" WHERE email = ${email.toLowerCase()}
      `;
      
      if (excludeId) {
        query = prisma.$queryRaw<any[]>`
          SELECT 1 FROM "users" WHERE email = ${email.toLowerCase()} AND id != ${excludeId}
        `;
      }
      
      const result = await query;
      return result && result.length > 0;
    } catch (err) {
      const error = err as Error;
      console.error('Error checking email existence:', error.message);
      return false;
    }
  }
}