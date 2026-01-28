import { UserRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password.util';
import { ConflictError, NotFoundError, ValidationError } from '../utils/error.util';
import { logger } from '../utils/logger.util';
import type { User, UserRole } from '../types/user.types';

/**
 * User Service
 * 
 * Business logic for user management
 */

export class UserService {
  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<Omit<User, 'password'>> {
    const user = await UserRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get all users with optional filters
   */
  static async getAllUsers(filters?: {
    role?: UserRole;
    is_active?: boolean;
    search?: string;
  }): Promise<Omit<User, 'password'>[]> {
    const users = await UserRepository.findAll(filters);
    
    // Remove passwords from all users
    return users.map(({ password, ...user }) => user);
  }

  /**
   * Get all staff members
   */
  static async getAllStaff(): Promise<Pick<User, 'id' | 'name' | 'email' | 'phone' | 'role'>[]> {
    return await UserRepository.findAllStaff();
  }

  /**
   * Create new user
   */
  static async createUser(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
  }): Promise<Omit<User, 'password'>> {
    // Check if email already exists
    const emailExists = await UserRepository.emailExists(userData.email);
    if (emailExists) {
      throw new ConflictError('Email already in use');
    }

    // Check if phone already exists
    const phoneExists = await UserRepository.phoneExists(userData.phone);
    if (phoneExists) {
      throw new ConflictError('Phone number already in use');
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const user = await UserRepository.create({
      ...userData,
      password: hashedPassword
    });

    const { password, ...userWithoutPassword } = user;
    logger.info(`New user created: ${user.email}`);
    
    return userWithoutPassword;
  }

  /**
   * Update user profile
   */
  static async updateUser(
    userId: string,
    updates: {
      name?: string;
      email?: string;
      phone?: string;
      role?: UserRole;
      is_active?: boolean;
    }
  ): Promise<Omit<User, 'password'>> {
    // Check if user exists
    const existingUser = await UserRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // If email is being updated, check if new email is available
    if (updates.email && updates.email !== existingUser.email) {
      const emailExists = await UserRepository.emailExists(updates.email, userId);
      if (emailExists) {
        throw new ConflictError('Email already in use');
      }
    }

    // If phone is being updated, check if new phone is available
    if (updates.phone && updates.phone !== existingUser.phone) {
      const phoneExists = await UserRepository.phoneExists(updates.phone, userId);
      if (phoneExists) {
        throw new ConflictError('Phone number already in use');
      }
    }

    // Update user
    const updatedUser = await UserRepository.update(userId, updates);
    
    const { password, ...userWithoutPassword } = updatedUser;
    logger.info(`User updated: ${updatedUser.email}`);
    
    return userWithoutPassword;
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    // Get user
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new ValidationError('Current password is incorrect');
    }

    // Validate new password (minimum 6 characters)
    if (newPassword.length < 6) {
      throw new ValidationError('New password must be at least 6 characters');
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await UserRepository.updatePassword(userId, hashedNewPassword);
    
    logger.info(`Password changed for user: ${user.email}`);
  }

  /**
   * Deactivate user account
   */
  static async deactivateUser(userId: string): Promise<void> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await UserRepository.softDelete(userId);
    logger.info(`User deactivated: ${user.email}`);
  }

  /**
   * Activate user account
   */
  static async activateUser(userId: string): Promise<void> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await UserRepository.update(userId, { is_active: true });
    logger.info(`User activated: ${user.email}`);
  }

  /**
   * Delete user permanently (admin only)
   */
  static async deleteUser(userId: string): Promise<void> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await UserRepository.hardDelete(userId);
    logger.warn(`User permanently deleted: ${user.email}`);
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    admins: number;
    staff: number;
  }> {
    const allUsers = await UserRepository.findAll();
    
    return {
      total: allUsers.length,
      active: allUsers.filter(u => u.is_active).length,
      inactive: allUsers.filter(u => !u.is_active).length,
      admins: allUsers.filter(u => u.role === 'admin').length,
      staff: allUsers.filter(u => u.role === 'staff').length
    };
  }
}