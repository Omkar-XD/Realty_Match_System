import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { logger } from '../utils/logger.util';

/**
 * User Controller
 * 
 * Handles user management HTTP requests
 */

export class UserController {
  /**
   * GET /api/users
   * Get all users (admin only)
   */
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { role, is_active, search } = req.query;

      const filters: any = {};
      if (role) filters.role = role;
      if (is_active !== undefined) filters.is_active = is_active === 'true';
      if (search) filters.search = search as string;

      const users = await UserService.getAllUsers(filters);

      res.status(200).json(
        successResponse('Users retrieved successfully', { users, total: users.length })
      );
    } catch (error: any) {
      logger.error('Get all users error:', error);
      res.status(500).json(
        errorResponse('Failed to retrieve users', 500)
      );
    }
  }

  /**
   * GET /api/users/staff
   * Get all staff members (for assignment dropdowns)
   */
  static async getAllStaff(req: Request, res: Response): Promise<void> {
    try {
      const staff = await UserService.getAllStaff();

      res.status(200).json(
        successResponse('Staff members retrieved successfully', { staff, total: staff.length })
      );
    } catch (error: any) {
      logger.error('Get staff error:', error);
      res.status(500).json(
        errorResponse('Failed to retrieve staff members', 500)
      );
    }
  }

  /**
   * GET /api/users/:id
   * Get user by ID
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);

      res.status(200).json(
        successResponse('User retrieved successfully', { user })
      );
    } catch (error: any) {
      logger.error('Get user by ID error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to retrieve user', error.statusCode || 500)
      );
    }
  }

  /**
   * POST /api/users
   * Create new user (admin only)
   */
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, password, role } = req.body;

      const user = await UserService.createUser({
        name,
        email,
        phone,
        password,
        role
      });

      res.status(201).json(
        successResponse('User created successfully', { user })
      );
    } catch (error: any) {
      logger.error('Create user error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to create user', error.statusCode || 500)
      );
    }
  }

  /**
   * PUT /api/users/:id
   * Update user profile
   */
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const user = await UserService.updateUser(id, updates);

      res.status(200).json(
        successResponse('User updated successfully', { user })
      );
    } catch (error: any) {
      logger.error('Update user error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to update user', error.statusCode || 500)
      );
    }
  }

  /**
   * PUT /api/users/:id/password
   * Change user password
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;

      await UserService.changePassword(id, oldPassword, newPassword);

      res.status(200).json(
        successResponse('Password changed successfully')
      );
    } catch (error: any) {
      logger.error('Change password error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to change password', error.statusCode || 500)
      );
    }
  }

  /**
   * DELETE /api/users/:id
   * Deactivate user (soft delete)
   */
  static async deactivateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await UserService.deactivateUser(id);

      res.status(200).json(
        successResponse('User deactivated successfully')
      );
    } catch (error: any) {
      logger.error('Deactivate user error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to deactivate user', error.statusCode || 500)
      );
    }
  }

  /**
   * PUT /api/users/:id/activate
   * Activate user account
   */
  static async activateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await UserService.activateUser(id);

      res.status(200).json(
        successResponse('User activated successfully')
      );
    } catch (error: any) {
      logger.error('Activate user error:', error);
      res.status(error.statusCode || 500).json(
        errorResponse(error.message || 'Failed to activate user', error.statusCode || 500)
      );
    }
  }

  /**
   * GET /api/users/stats
   * Get user statistics (admin only)
   */
  static async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await UserService.getUserStats();

      res.status(200).json(
        successResponse('User statistics retrieved successfully', { stats })
      );
    } catch (error: any) {
      logger.error('Get user stats error:', error);
      res.status(500).json(
        errorResponse('Failed to retrieve user statistics', 500)
      );
    }
  }
}