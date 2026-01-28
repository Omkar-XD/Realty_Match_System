import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authenticateOwnerOrAdmin } from '../middleware/auth.middleware';
import { requireAdmin, requireStaffOrAdmin } from '../middleware/role.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import { createLimiter, updateLimiter } from '../middleware/rateLimit.middleware';
import { 
  createUserSchema, 
  updateUserSchema, 
  changePasswordSchema 
} from '../validators/user.validator';

/**
 * User Management Routes
 * 
 * /api/users/*
 */

const router = Router();

/**
 * GET /api/users
 * Get all users with optional filters
 * Admin only
 */
router.get(
  '/',
  authenticate,
  requireAdmin,
  UserController.getAllUsers
);

/**
 * GET /api/users/staff
 * Get all staff members (for assignment dropdowns)
 * Requires authentication
 */
router.get(
  '/staff',
  authenticate,
  requireStaffOrAdmin,
  UserController.getAllStaff
);

/**
 * GET /api/users/stats
 * Get user statistics
 * Admin only
 */
router.get(
  '/stats',
  authenticate,
  requireAdmin,
  UserController.getUserStats
);

/**
 * GET /api/users/:id
 * Get user by ID
 * User can view their own profile, admin can view any
 */
router.get(
  '/:id',
  authenticate,
  authenticateOwnerOrAdmin('id'),
  UserController.getUserById
);

/**
 * POST /api/users
 * Create new user
 * Admin only
 * Rate limited: 20 creations per hour
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  createLimiter,
  validateBody(createUserSchema),
  UserController.createUser
);

/**
 * PUT /api/users/:id
 * Update user profile
 * User can update their own profile, admin can update any
 * Rate limited: 30 updates per hour
 */
router.put(
  '/:id',
  authenticate,
  authenticateOwnerOrAdmin('id'),
  updateLimiter,
  validateBody(updateUserSchema),
  UserController.updateUser
);

/**
 * PUT /api/users/:id/password
 * Change user password
 * User can change their own password, admin can change any
 * Rate limited: 30 updates per hour
 */
router.put(
  '/:id/password',
  authenticate,
  authenticateOwnerOrAdmin('id'),
  updateLimiter,
  validateBody(changePasswordSchema),
  UserController.changePassword
);

/**
 * PUT /api/users/:id/activate
 * Activate user account
 * Admin only
 */
router.put(
  '/:id/activate',
  authenticate,
  requireAdmin,
  updateLimiter,
  UserController.activateUser
);

/**
 * DELETE /api/users/:id
 * Deactivate user (soft delete)
 * Admin only
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  UserController.deactivateUser
);

export default router;