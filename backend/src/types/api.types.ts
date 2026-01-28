import { Request } from 'express';
import { UserResponse } from './user.types';

/**
 * Authenticated request with user
 */
export interface AuthRequest extends Request {
  user?: UserResponse;
  userId?: string;
  userRole?: string;
}

/**
 * Pagination query parameters
 */
export interface PaginationQuery {
  page?: string;
  limit?: string;
}

/**
 * Statistics response for dashboard
 */
export interface DashboardStats {
  totalEnquiries: number;
  newEnquiries: number;
  contactedEnquiries: number;
  appointmentBookedEnquiries: number;
  closedEnquiries: number;
  totalProperties: number;
  availableProperties: number;
  onHoldProperties: number;
  soldRentedProperties: number;
  recentEnquiries: any[];
  recentProperties: any[];
}

/**
 * Enquiry statistics
 */
export interface EnquiryStats {
  byStatus: Record<string, number>;
  byLeadSource: Record<string, number>;
  byMonth: Array<{
    month: string;
    count: number;
  }>;
  totalCount: number;
}

/**
 * Property statistics
 */
export interface PropertyStats {
  byStatus: Record<string, number>;
  byArea: Record<string, number>;
  byType: Record<string, number>;
  byPropertyFor: Record<string, number>;
  totalCount: number;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: any;
  timestamp: string;
}

/**
 * API Success Response
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  message?: string;
  data?: T;
  timestamp: string;
}

/**
 * Paginated API Response
 */
export interface PaginatedApiResponse<T = any> extends ApiSuccessResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}