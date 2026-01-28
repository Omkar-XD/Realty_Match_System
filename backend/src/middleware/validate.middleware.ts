import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../utils/error.util';
import { errorResponse } from '../utils/response.util';
import { logger } from '../utils/logger.util';

/**
 * Validation Middleware
 * 
 * Validates request data against Zod schemas
 */

/**
 * Validate request body, query params, or route params
 * 
 * @param schema - Zod schema to validate against
 * @param source - Which part of request to validate ('body', 'query', 'params')
 */
export const validate = (
  schema: AnyZodObject,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get data from specified source
      const dataToValidate = req[source];

      // Validate data against schema
      const validatedData = await schema.parseAsync(dataToValidate);

      // Replace original data with validated and transformed data
      req[source] = validatedData;

      logger.debug(`Validation passed for ${source}:`, {
        path: req.path,
        method: req.method
      });

      next();
      
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        logger.warn(`Validation failed for ${source}:`, {
          path: req.path,
          method: req.method,
          errors: formattedErrors
        });

        res.status(400).json(
          errorResponse(
            'Validation failed',
            400,
            formattedErrors
          )
        );
      } else {
        logger.error('Unexpected validation error:', error);
        res.status(500).json(errorResponse('Validation error occurred', 500));
      }
    }
  };
};

/**
 * Validate request body
 * Shorthand for validate(schema, 'body')
 */
export const validateBody = (schema: AnyZodObject) => {
  return validate(schema, 'body');
};

/**
 * Validate query parameters
 * Shorthand for validate(schema, 'query')
 */
export const validateQuery = (schema: AnyZodObject) => {
  return validate(schema, 'query');
};

/**
 * Validate route parameters
 * Shorthand for validate(schema, 'params')
 */
export const validateParams = (schema: AnyZodObject) => {
  return validate(schema, 'params');
};

/**
 * Validate multiple parts of the request
 * 
 * @param schemas - Object with schemas for body, query, and/or params
 */
export const validateAll = (schemas: {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate each specified part
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }

      logger.debug('Multi-part validation passed:', {
        path: req.path,
        method: req.method,
        validated: Object.keys(schemas)
      });

      next();
      
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        logger.warn('Multi-part validation failed:', {
          path: req.path,
          method: req.method,
          errors: formattedErrors
        });

        res.status(400).json(
          errorResponse(
            'Validation failed',
            400,
            formattedErrors
          )
        );
      } else {
        logger.error('Unexpected validation error:', error);
        res.status(500).json(errorResponse('Validation error occurred', 500));
      }
    }
  };
};

/**
 * Sanitize request data by removing unwanted fields
 * Useful for preventing mass assignment vulnerabilities
 * 
 * @param allowedFields - Array of field names to keep
 * @param source - Which part of request to sanitize
 */
export const sanitize = (
  allowedFields: string[],
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = req[source];
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      
      for (const field of allowedFields) {
        if (field in data) {
          sanitized[field] = data[field];
        }
      }
      
      req[source] = sanitized;
      
      logger.debug(`Sanitized ${source} data:`, {
        path: req.path,
        allowedFields,
        removedFields: Object.keys(data).filter(k => !allowedFields.includes(k))
      });
    }
    
    next();
  };
};