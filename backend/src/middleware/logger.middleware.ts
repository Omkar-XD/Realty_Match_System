import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.util';

/**
 * Request Logging Middleware
 * 
 * Logs all incoming HTTP requests and responses
 */

/**
 * Log incoming requests
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Store request start time
  const startTime = Date.now();

  // Log request details
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
    user: req.user?.email
  });

  // Log request body for non-GET requests (excluding sensitive data)
  if (req.method !== 'GET' && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    
    // Remove sensitive fields from logs
    const sensitiveFields = ['password', 'token', 'secret', 'api_key'];
    sensitiveFields.forEach(field => {
      if (sanitizedBody[field]) {
        sanitizedBody[field] = '[REDACTED]';
      }
    });

    logger.debug('Request body', { body: sanitizedBody });
  }

  // Capture response
  const originalSend = res.send;
  res.send = function (data): Response {
    res.send = originalSend; // Restore original send

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Log response details
    logger.info('Outgoing response', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      user: req.user?.email
    });

    // Log slow requests (>1000ms)
    if (responseTime > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        responseTime: `${responseTime}ms`,
        user: req.user?.email
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Log only errors
 * Lighter version that only logs failed requests
 */
export const errorOnlyLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  const originalSend = res.send;
  res.send = function (data): Response {
    res.send = originalSend;

    // Only log if response is an error (4xx or 5xx)
    if (res.statusCode >= 400) {
      const responseTime = Date.now() - startTime;
      
      logger.error('Request failed', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        query: req.query,
        ip: req.ip || req.socket.remoteAddress,
        user: req.user?.email
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Log API performance metrics
 */
export const performanceLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    logger.info('API Performance', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: res.get('content-length') || 0,
      user: req.user?.email
    });
  });

  next();
};

/**
 * Skip logging for health check endpoints
 */
export const skipHealthCheck = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip logging for health check and status endpoints
  const skipPaths = ['/health', '/api/health', '/status', '/api/status'];
  
  if (skipPaths.includes(req.path)) {
    return next();
  }

  requestLogger(req, res, next);
};