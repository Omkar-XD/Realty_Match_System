import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { CreateUserDTO, UpdateUserDTO } from '../types';

export class UserController {
  private userService = new UserService();

  getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      sendSuccess(res, users);
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 500);
    }
  };

  getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      sendSuccess(res, user);
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 404);
    }
  };

  createUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userData: CreateUserDTO = req.body;
      const user = await this.userService.createUser(userData);
      sendSuccess(res, user, 'User created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 400);
    }
  };

  updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates: UpdateUserDTO = req.body;
      const user = await this.userService.updateUser(id, updates);
      sendSuccess(res, user, 'User updated successfully');
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 400);
    }
  };

  deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);
      sendSuccess(res, null, 'User deleted successfully');
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 400);
    }
  };
}