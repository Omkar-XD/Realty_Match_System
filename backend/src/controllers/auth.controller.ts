import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { logger } from '../utils/logger.util';

/**
 * Authentication Controller
 * 
 * Handles authentication-related HTTP requests
 */

export class AuthController {
  /**
   * POST /api/auth/login
   * User login with email/phone and password
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, password } = req.body;

      const result = await AuthService.login({ identifier, password });

      res.status(200).json(
        successResponse('Login successful', result)
      );
    } catch (error: any) {
      logger.error('Login error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Login failed', error.statusCode || 500)
      );
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json(
          errorResponse('Refresh token is required', 400)
        );
        return;
      }

      const result = await AuthService.refreshAccessToken(refreshToken);

      res.status(200).json(
        successResponse('Token refreshed successfully', result)
      );
    } catch (error: any) {
      logger.error('Token refresh error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Token refresh failed', error.statusCode || 500)
      );
    }
  }

  /**
   * POST /api/auth/logout
   * Logout user by revoking refresh token
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json(
          errorResponse('Refresh token is required', 400)
        );
        return;
      }

      await AuthService.logout(refreshToken);

      res.status(200).json(
        successResponse('Logout successful')
      );
    } catch (error: any) {
      logger.error('Logout error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Logout failed', error.statusCode || 500)
      );
    }
  }

  /**
   * GET /api/auth/me
   * Get current authenticated user info
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // User is already attached by auth middleware
      if (!req.user) {
        res.status(401).json(
          errorResponse('Not authenticated', 401)
        );
        return;
      }

      res.status(200).json(
        successResponse('User retrieved successfully', { user: req.user })
      );
    } catch (error: any) {
      logger.error('Get current user error:', error);
      res.status(500).json(
        errorResponse('Failed to retrieve user information', 500)
      );
    }
  }

  /**
   * POST /api/auth/revoke-all
   * Revoke all refresh tokens for current user (logout from all devices)
   */
  static async revokeAllTokens(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(
          errorResponse('Not authenticated', 401)
        );
        return;
      }

      await AuthService.revokeAllUserTokens(req.user.id);

      res.status(200).json(
        successResponse('All sessions terminated successfully')
      );
    } catch (error: any) {
      logger.error('Revoke all tokens error:', error);
      res.status(500).json(
        errorResponse('Failed to revoke tokens', 500)
      );
    }
  }
}