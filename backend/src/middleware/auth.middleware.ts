import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { UnauthorizedError } from '../utils/error.util';
import { errorResponse } from '../utils/response.util';
import { logger } from '../utils/logger.util';
import { supabase } from '../config/database';

/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and attaches user information to request
 */

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'admin' | 'staff';
        name: string;
      };
    }
  }
}

/**
 * Verify JWT token from Authorization header
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify and decode token
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    // Fetch user from database to ensure they still exist and are active
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, name, is_active')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      logger.warn(`User not found for token: ${decoded.userId}`);
      throw new UnauthorizedError('User not found');
    }

    if (!user.is_active) {
      logger.warn(`Inactive user attempted access: ${user.email}`);
      throw new UnauthorizedError('User account is deactivated');
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    logger.debug(`User authenticated: ${user.email} (${user.role})`);
    next();
    
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(401).json(errorResponse(error.message, 401));
    } else {
      logger.error('Authentication error:', error);
      res.status(401).json(errorResponse('Authentication failed', 401));
    }
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 * But verifies token if present
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    // If no token, just continue without user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    if (decoded) {
      // Fetch user from database
      const { data: user } = await supabase
        .from('users')
        .select('id, email, role, name, is_active')
        .eq('id', decoded.userId)
        .single();

      if (user && user.is_active) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        };
      }
    }

    next();
  } catch (error) {
    // If token verification fails, just continue without user
    logger.debug('Optional authentication failed, continuing without user');
    next();
  }
};

/**
 * Check if user owns the resource or is admin
 * Used for protecting user-specific endpoints
 */
export const authenticateOwnerOrAdmin = (userIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const resourceUserId = req.params[userIdParam];
      
      // Allow if admin or if user is accessing their own resource
      if (req.user.role === 'admin' || req.user.id === resourceUserId) {
        return next();
      }

      throw new UnauthorizedError('You do not have permission to access this resource');
      
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        res.status(401).json(errorResponse(error.message, 401));
      } else {
        res.status(500).json(errorResponse('Authorization check failed', 500));
      }
    }
  };
};