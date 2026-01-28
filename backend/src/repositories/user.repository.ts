import { supabase } from '../config/database';
import { DatabaseError, NotFoundError } from '../utils/error.util';
import { logger } from '../utils/logger.util';
import type { User, UserRole } from '../types/user.types';

/**
 * User Repository
 * 
 * Handles all database operations for users table
 */

export class UserRepository {
  /**
   * Find user by ID
   */
  static async findById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // User not found
        }
        throw new DatabaseError(`Failed to find user: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // User not found
        }
        throw new DatabaseError(`Failed to find user by email: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Find user by phone
   */
  static async findByPhone(phone: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // User not found
        }
        throw new DatabaseError(`Failed to find user by phone: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error('Error finding user by phone:', error);
      throw error;
    }
  }

  /**
   * Get all users with optional filters
   */
  static async findAll(filters?: {
    role?: UserRole;
    is_active?: boolean;
    search?: string;
  }): Promise<User[]> {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.role) {
        query = query.eq('role', filters.role);
      }

      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new DatabaseError(`Failed to fetch users: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Error fetching all users:', error);
      throw error;
    }
  }

  /**
   * Get all staff members (role = 'staff')
   */
  static async findAllStaff(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, phone, role')
        .eq('role', 'staff')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        throw new DatabaseError(`Failed to fetch staff: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Error fetching staff members:', error);
      throw error;
    }
  }

  /**
   * Create new user
   */
  static async create(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
  }): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          name: userData.name,
          email: userData.email.toLowerCase(),
          phone: userData.phone,
          password: userData.password, // Should already be hashed
          role: userData.role,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        throw new DatabaseError(`Failed to create user: ${error.message}`);
      }

      logger.info(`User created: ${userData.email}`);
      return data;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user by ID
   */
  static async update(
    userId: string,
    updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<User> {
    try {
      // If email is being updated, normalize it
      if (updates.email) {
        updates.email = updates.email.toLowerCase();
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new DatabaseError(`Failed to update user: ${error.message}`);
      }

      if (!data) {
        throw new NotFoundError('User not found');
      }

      logger.info(`User updated: ${userId}`);
      return data;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', userId);

      if (error) {
        throw new DatabaseError(`Failed to update password: ${error.message}`);
      }

      logger.info(`Password updated for user: ${userId}`);
    } catch (error) {
      logger.error('Error updating password:', error);
      throw error;
    }
  }

  /**
   * Delete user by ID (soft delete by setting is_active to false)
   */
  static async softDelete(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) {
        throw new DatabaseError(`Failed to deactivate user: ${error.message}`);
      }

      logger.info(`User deactivated: ${userId}`);
    } catch (error) {
      logger.error('Error deactivating user:', error);
      throw error;
    }
  }

  /**
   * Permanently delete user (hard delete - use with caution)
   */
  static async hardDelete(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        throw new DatabaseError(`Failed to delete user: ${error.message}`);
      }

      logger.warn(`User permanently deleted: ${userId}`);
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string, excludeUserId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase());

      if (excludeUserId) {
        query = query.neq('id', excludeUserId);
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') {
        throw new DatabaseError(`Failed to check email: ${error.message}`);
      }

      return !!data;
    } catch (error) {
      logger.error('Error checking email existence:', error);
      throw error;
    }
  }

  /**
   * Check if phone exists
   */
  static async phoneExists(phone: string, excludeUserId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('users')
        .select('id')
        .eq('phone', phone);

      if (excludeUserId) {
        query = query.neq('id', excludeUserId);
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') {
        throw new DatabaseError(`Failed to check phone: ${error.message}`);
      }

      return !!data;
    } catch (error) {
      logger.error('Error checking phone existence:', error);
      throw error;
    }
  }

  /**
   * Count users by role
   */
  static async countByRole(role: UserRole): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', role)
        .eq('is_active', true);

      if (error) {
        throw new DatabaseError(`Failed to count users: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      logger.error('Error counting users:', error);
      throw error;
    }
  }
}