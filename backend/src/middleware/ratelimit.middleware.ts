import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../utils/logger.util';
import { errorResponse } from '../utils/response.util';

/**
 * Rate Limiting Middleware
 * 
 * Prevents abuse by limiting the number of requests from a single IP
 */

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    res.status(429).json(
      errorResponse(
        'Too many requests. Please try again later.',
        429,
        {
          retryAfter: '15 minutes'
        }
      )
    );
  },
  
  skip: (req: Request) => {
    // Skip rate limiting for health check endpoints
    return req.path === '/health' || req.path === '/api/health';
  }
});

/**
 * Authentication rate limiter
 * 5 login attempts per 15 minutes per IP
 * Stricter to prevent brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts
  skipSuccessfulRequests: true, // Don't count successful logins
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req: Request, res: Response) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      body: { email: req.body.email } // Log attempted email (not password)
    });
    
    res.status(429).json(
      errorResponse(
        'Too many login attempts. Please try again after 15 minutes.',
        429,
        {
          retryAfter: '15 minutes',
          hint: 'If you forgot your password, contact your administrator.'
        }
      )
    );
  }
});

/**
 * Creation rate limiter
 * 20 create operations per hour per user
 * Prevents spam creation of enquiries/properties
 */
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit to 20 creations per hour
  standardHeaders: true,
  legacyHeaders: false,
  
  // Use user ID as key instead of IP for authenticated requests
  keyGenerator: (req: Request) => {
    return req.user?.id || req.ip || 'unknown';
  },
  
  handler: (req: Request, res: Response) => {
    logger.warn('Create rate limit exceeded', {
      user: req.user?.email,
      ip: req.ip,
      path: req.path
    });
    
    res.status(429).json(
      errorResponse(
        'Too many creation requests. Please try again later.',
        429,
        {
          retryAfter: '1 hour',
          limit: '20 per hour'
        }
      )
    );
  }
});

/**
 * Search/Query rate limiter
 * 60 searches per minute per user
 * More lenient as searching is a common operation
 */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit to 60 searches per minute
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req: Request) => {
    return req.user?.id || req.ip || 'unknown';
  },
  
  handler: (req: Request, res: Response) => {
    logger.warn('Search rate limit exceeded', {
      user: req.user?.email,
      ip: req.ip,
      path: req.path
    });
    
    res.status(429).json(
      errorResponse(
        'Too many search requests. Please slow down.',
        429,
        {
          retryAfter: '1 minute'
        }
      )
    );
  }
});

/**
 * Update rate limiter
 * 30 updates per hour per user
 */
export const updateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit to 30 updates per hour
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req: Request) => {
    return req.user?.id || req.ip || 'unknown';
  },
  
  handler: (req: Request, res: Response) => {
    logger.warn('Update rate limit exceeded', {
      user: req.user?.email,
      ip: req.ip,
      path: req.path
    });
    
    res.status(429).json(
      errorResponse(
        'Too many update requests. Please try again later.',
        429,
        {
          retryAfter: '1 hour',
          limit: '30 per hour'
        }
      )
    );
  }
});

/**
 * Matching algorithm rate limiter
 * 10 matching requests per 15 minutes per user
 * More restrictive as matching is computationally expensive
 */
export const matchingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit to 10 matching requests
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req: Request) => {
    return req.user?.id || req.ip || 'unknown';
  },
  
  handler: (req: Request, res: Response) => {
    logger.warn('Matching rate limit exceeded', {
      user: req.user?.email,
      ip: req.ip,
      path: req.path
    });
    
    res.status(429).json(
      errorResponse(
        'Too many matching requests. Please try again later.',
        429,
        {
          retryAfter: '15 minutes',
          limit: '10 per 15 minutes'
        }
      )
    );
  }
});

/**
 * Strict rate limiter for sensitive operations
 * 3 requests per hour per IP
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req: Request, res: Response) => {
    logger.error('Strict rate limit exceeded - possible attack', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    res.status(429).json(
      errorResponse(
        'Access temporarily restricted. Please contact support if you believe this is an error.',
        429,
        {
          retryAfter: '1 hour'
        }
      )
    );
  }
});