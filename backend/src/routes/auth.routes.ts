import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { authLimiter } from '../middleware/rateLimit.middleware';
import { loginSchema, refreshTokenSchema } from '../validators/auth.validator';

/**
 * Authentication Routes
 * 
 * /api/auth/*
 */

const router = Router();

/**
 * POST /api/auth/login
 * User login with email/phone and password
 * Rate limited: 5 attempts per 15 minutes
 */
router.post(
  '/login',
  authLimiter,
  validateBody(loginSchema),
  AuthController.login
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  AuthController.refreshToken
);

/**
 * POST /api/auth/logout
 * Logout user by revoking refresh token
 * Requires authentication
 */
router.post(
  '/logout',
  authenticate,
  AuthController.logout
);

/**
 * GET /api/auth/me
 * Get current authenticated user information
 * Requires authentication
 */
router.get(
  '/me',
  authenticate,
  AuthController.getCurrentUser
);

/**
 * POST /api/auth/revoke-all
 * Revoke all refresh tokens (logout from all devices)
 * Requires authentication
 */
router.post(
  '/revoke-all',
  authenticate,
  AuthController.revokeAllTokens
);

export default router;