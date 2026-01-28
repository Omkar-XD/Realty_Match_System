import { Response } from 'express';
import { HTTP_STATUS } from '../config/constants';

/**
 * Standard API Response interface
 */
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
  timestamp: string;
}

/**
 * Paginated response interface
 */
interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Send success response
 */
export const successResponse = <T = any>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  error?: any
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    error: error?.message || error,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 */
export const paginatedResponse = <T = any>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): Response => {
  const totalPages = Math.ceil(total / limit);

  const response: PaginatedResponse<T[]> = {
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(HTTP_STATUS.OK).json(response);
};

/**
 * Send created response
 */
export const createdResponse = <T = any>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): Response => {
  return successResponse(res, data, message, HTTP_STATUS.CREATED);
};

/**
 * Send no content response
 */
export const noContentResponse = (res: Response): Response => {
  return res.status(204).send();
};

/**
 * Send validation error response
 */
export const validationErrorResponse = (
  res: Response,
  errors: any[]
): Response => {
  const response: ApiResponse = {
    success: false,
    message: 'Validation failed',
    error: {
      details: errors,
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(400).json(response);
};