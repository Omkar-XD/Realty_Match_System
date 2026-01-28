import { HTTP_STATUS } from '../config/constants';

/**
 * Base API Error class
 */
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad Request') {
    super(HTTP_STATUS.BAD_REQUEST, message);
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(HTTP_STATUS.UNAUTHORIZED, message);
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(HTTP_STATUS.FORBIDDEN, message);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Not Found') {
    super(HTTP_STATUS.NOT_FOUND, message);
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Conflict') {
    super(HTTP_STATUS.CONFLICT, message);
  }
}

/**
 * 422 Validation Error
 */
export class ValidationError extends ApiError {
  public errors: any[];

  constructor(message: string = 'Validation Error', errors: any[] = []) {
    super(422, message);
    this.errors = errors;
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal Server Error') {
    super(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, false);
  }
}

/**
 * Database Error
 */
export class DatabaseError extends ApiError {
  constructor(message: string = 'Database Error') {
    super(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, false);
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication Failed') {
    super(HTTP_STATUS.UNAUTHORIZED, message);
  }
}