import { Request, Response, NextFunction } from 'express';
import { 
  AppError, 
  ValidationError, 
  UnauthorizedError, 
  ForbiddenError, 
  NotFoundError,
  ConflictError,
  DatabaseError 
} from '../utils/error.util';
import { errorResponse } from '../utils/response.util';
import { logger } from '../utils/logger.util';

/**
 * Global Error Handler Middleware
 * 
 * Catches all errors and returns standardized error responses
 */

/**
 * Main error handler
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    user: req.user?.email
  });

  // Handle known custom errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      errorResponse(err.message, err.statusCode, err.details)
    );
    return;
  }

  // Handle validation errors
  if (err instanceof ValidationError) {
    res.status(400).json(
      errorResponse('Validation failed', 400, err.details)
    );
    return;
  }

  // Handle unauthorized errors
  if (err instanceof UnauthorizedError) {
    res.status(401).json(
      errorResponse(err.message, 401)
    );
    return;
  }

  // Handle forbidden errors
  if (err instanceof ForbiddenError) {
    res.status(403).json(
      errorResponse(err.message, 403)
    );
    return;
  }

  // Handle not found errors
  if (err instanceof NotFoundError) {
    res.status(404).json(
      errorResponse(err.message, 404)
    );
    return;
  }

  // Handle conflict errors
  if (err instanceof ConflictError) {
    res.status(409).json(
      errorResponse(err.message, 409)
    );
    return;
  }

  // Handle database errors
  if (err instanceof DatabaseError) {
    res.status(500).json(
      errorResponse('Database operation failed', 500)
    );
    return;
  }

  // Handle Supabase/PostgreSQL errors
  if (err.message?.includes('duplicate key value')) {
    res.status(409).json(
      errorResponse('A record with this information already exists', 409)
    );
    return;
  }

  if (err.message?.includes('foreign key constraint')) {
    res.status(400).json(
      errorResponse('Invalid reference to related resource', 400)
    );
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json(
      errorResponse('Invalid token', 401)
    );
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json(
      errorResponse('Token expired', 401)
    );
    return;
  }

  // Handle unknown errors
  logger.error('Unhandled error:', {
    name: err.name,
    message: err.message,
    stack: err.stack
  });

  res.status(500).json(
    errorResponse(
      process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message || 'Internal server error',
      500
    )
  );
};

/**
 * 404 Not Found handler
 * Should be added after all routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
  
  res.status(404).json(
    errorResponse(
      `Route not found: ${req.method} ${req.path}`,
      404
    )
  );
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass to error handler
 * 
 * @param fn - Async route handler function
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error formatter
 * Formats validation errors into a consistent structure
 */
export const formatValidationErrors = (errors: any[]): any[] => {
  return errors.map(error => ({
    field: error.path?.join('.') || error.field,
    message: error.message,
    value: error.value
  }));
};