import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/error.util';
import { errorResponse } from '../utils/response.util';
import { logger } from '../utils/logger.util';

/**
 * Role-Based Access Control Middleware
 * 
 * Restricts access to routes based on user roles
 */

type UserRole = 'admin' | 'staff';

/**
 * Require specific role(s) to access route
 * 
 * @param allowedRoles - Array of roles that can access the route
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json(errorResponse('Authentication required', 401));
        return;
      }

      // Check if user has required role
      if (!allowedRoles.includes(req.user.role)) {
        logger.warn(
          `Access denied: ${req.user.email} (${req.user.role}) tried to access ` +
          `${req.method} ${req.path} (requires: ${allowedRoles.join(' or ')})`
        );
        
        throw new ForbiddenError(
          `Access denied. This action requires ${allowedRoles.join(' or ')} role.`
        );
      }

      logger.debug(`Role check passed: ${req.user.email} (${req.user.role})`);
      next();
      
    } catch (error) {
      if (error instanceof ForbiddenError) {
        res.status(403).json(errorResponse(error.message, 403));
      } else {
        res.status(500).json(errorResponse('Role verification failed', 500));
      }
    }
  };
};

/**
 * Require admin role
 * Shorthand for requireRole('admin')
 */
export const requireAdmin = requireRole('admin');

/**
 * Require staff or admin role
 * Shorthand for requireRole('staff', 'admin')
 */
export const requireStaffOrAdmin = requireRole('staff', 'admin');

/**
 * Check if user can modify resource
 * Admin can modify anything, staff can only modify their own or unassigned
 * 
 * @param getResourceUserId - Function to extract assigned user ID from request
 */
export const canModifyResource = (
  getResourceUserId: (req: Request) => string | null | undefined
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Authentication required', 401));
        return;
      }

      // Admins can modify anything
      if (req.user.role === 'admin') {
        return next();
      }

      // For staff, check if resource is assigned to them or unassigned
      const resourceUserId = getResourceUserId(req);
      
      if (resourceUserId === null || resourceUserId === undefined) {
        // Unassigned resources can be modified by any staff
        return next();
      }

      if (resourceUserId === req.user.id) {
        // Staff can modify their own resources
        return next();
      }

      logger.warn(
        `Modification denied: ${req.user.email} tried to modify resource ` +
        `assigned to ${resourceUserId}`
      );

      throw new ForbiddenError(
        'You can only modify resources assigned to you or unassigned resources'
      );
      
    } catch (error) {
      if (error instanceof ForbiddenError) {
        res.status(403).json(errorResponse(error.message, 403));
      } else {
        res.status(500).json(errorResponse('Permission check failed', 500));
      }
    }
  };
};

/**
 * Check if user can view resource
 * Admin can view anything, staff can only view their own or unassigned
 * 
 * @param getResourceUserId - Function to extract assigned user ID from request
 */
export const canViewResource = (
  getResourceUserId: (req: Request) => string | null | undefined
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Authentication required', 401));
        return;
      }

      // Admins can view anything
      if (req.user.role === 'admin') {
        return next();
      }

      // For staff, check if resource is assigned to them or unassigned
      const resourceUserId = getResourceUserId(req);
      
      if (resourceUserId === null || resourceUserId === undefined) {
        // Unassigned resources can be viewed by any staff
        return next();
      }

      if (resourceUserId === req.user.id) {
        // Staff can view their own resources
        return next();
      }

      logger.warn(
        `View denied: ${req.user.email} tried to view resource ` +
        `assigned to ${resourceUserId}`
      );

      throw new ForbiddenError(
        'You can only view resources assigned to you or unassigned resources'
      );
      
    } catch (error) {
      if (error instanceof ForbiddenError) {
        res.status(403).json(errorResponse(error.message, 403));
      } else {
        res.status(500).json(errorResponse('Permission check failed', 500));
      }
    }
  };
};