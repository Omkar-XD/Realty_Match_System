import { UserRepository } from '../repositories/user.repository';
import { comparePassword } from '../utils/password.util';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util';
import { UnauthorizedError, ValidationError } from '../utils/error.util';
import { logger } from '../utils/logger.util';
import { supabase } from '../config/database';
import type { User } from '../types/user.types';

/**
 * Authentication Service
 * 
 * Handles user authentication, token generation, and session management
 */

export class AuthService {
  /**
   * Authenticate user with email/phone and password
   */
  static async login(credentials: {
    identifier: string; // Can be email or phone
    password: string;
  }): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      // Determine if identifier is email or phone
      const isEmail = credentials.identifier.includes('@');
      
      // Find user by email or phone
      const user = isEmail
        ? await UserRepository.findByEmail(credentials.identifier)
        : await UserRepository.findByPhone(credentials.identifier);

      if (!user) {
        logger.warn(`Login attempt failed: User not found (${credentials.identifier})`);
        throw new UnauthorizedError('Invalid credentials');
      }

      // Check if user is active
      if (!user.is_active) {
        logger.warn(`Login attempt failed: User inactive (${user.email})`);
        throw new UnauthorizedError('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await comparePassword(credentials.password, user.password);
      
      if (!isPasswordValid) {
        logger.warn(`Login attempt failed: Invalid password (${user.email})`);
        throw new UnauthorizedError('Invalid credentials');
      }

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      const refreshToken = generateRefreshToken({
        userId: user.id
      });

      // Store refresh token in database
      await this.storeRefreshToken(user.id, refreshToken);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      logger.info(`User logged in successfully: ${user.email}`);

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      logger.error('Login error:', error);
      throw new Error('Login failed');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      
      if (!decoded) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Check if refresh token exists in database
      const { data: tokenRecord, error } = await supabase
        .from('refresh_tokens')
        .select('*')
        .eq('token', refreshToken)
        .eq('user_id', decoded.userId)
        .single();

      if (error || !tokenRecord) {
        throw new UnauthorizedError('Refresh token not found');
      }

      // Check if token is revoked
      if (tokenRecord.revoked) {
        logger.warn(`Revoked refresh token used: ${decoded.userId}`);
        throw new UnauthorizedError('Refresh token has been revoked');
      }

      // Check if token is expired
      if (new Date(tokenRecord.expires_at) < new Date()) {
        logger.warn(`Expired refresh token used: ${decoded.userId}`);
        throw new UnauthorizedError('Refresh token has expired');
      }

      // Get user details
      const user = await UserRepository.findById(decoded.userId);
      
      if (!user || !user.is_active) {
        throw new UnauthorizedError('User not found or inactive');
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      const newRefreshToken = generateRefreshToken({
        userId: user.id
      });

      // Revoke old refresh token and store new one
      await this.revokeRefreshToken(refreshToken);
      await this.storeRefreshToken(user.id, newRefreshToken);

      logger.info(`Tokens refreshed successfully: ${user.email}`);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      logger.error('Token refresh error:', error);
      throw new UnauthorizedError('Failed to refresh token');
    }
  }

  /**
   * Logout user by revoking refresh token
   */
  static async logout(refreshToken: string): Promise<void> {
    try {
      await this.revokeRefreshToken(refreshToken);
      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Logout error:', error);
      throw new Error('Logout failed');
    }
  }

  /**
   * Store refresh token in database
   */
  private static async storeRefreshToken(userId: string, token: string): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      const { error } = await supabase
        .from('refresh_tokens')
        .insert([{
          user_id: userId,
          token,
          expires_at: expiresAt.toISOString(),
          revoked: false
        }]);

      if (error) {
        throw new Error(`Failed to store refresh token: ${error.message}`);
      }
    } catch (error) {
      logger.error('Error storing refresh token:', error);
      throw error;
    }
  }

  /**
   * Revoke refresh token
   */
  private static async revokeRefreshToken(token: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('refresh_tokens')
        .update({ revoked: true })
        .eq('token', token);

      if (error) {
        throw new Error(`Failed to revoke refresh token: ${error.message}`);
      }
    } catch (error) {
      logger.error('Error revoking refresh token:', error);
      throw error;
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  static async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('refresh_tokens')
        .update({ revoked: true })
        .eq('user_id', userId)
        .eq('revoked', false);

      if (error) {
        throw new Error(`Failed to revoke user tokens: ${error.message}`);
      }

      logger.info(`All tokens revoked for user: ${userId}`);
    } catch (error) {
      logger.error('Error revoking all user tokens:', error);
      throw error;
    }
  }

  /**
   * Clean up expired tokens
   */
  static async cleanupExpiredTokens(): Promise<void> {
    try {
      const { error } = await supabase
        .from('refresh_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        throw new Error(`Failed to cleanup expired tokens: ${error.message}`);
      }

      logger.info('Expired tokens cleaned up');
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error);
      throw error;
    }
  }
}