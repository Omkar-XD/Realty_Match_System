/**
 * Application Constants
 * Centralized constants for the RealtyMatch application
 */

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Enquiry Statuses
export const ENQUIRY_STATUSES = {
  NEW: 'New Enquiry',
  CONTACTED: 'Contacted',
  APPOINTMENT_BOOKED: 'Appointment Booked',
  NOT_INTERESTED: 'Not Interested',
  WRONG_NUMBER: 'Wrong Number',
  CLOSED: 'Closed',
} as const;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[keyof typeof ENQUIRY_STATUSES];

// Lead Sources
export const LEAD_SOURCES = {
  ADS_CAMPAIGN: 'Ads Campaign',
  WEBSITE_FORM: 'Website Form',
  MANUAL_ENTRY: 'Manual Entry',
  PHONE_CALL: 'Phone Call',
  REFERRAL: 'Referral',
  WALK_IN: 'Walk-in',
} as const;

export type LeadSource = (typeof LEAD_SOURCES)[keyof typeof LEAD_SOURCES];

// Property For
export const PROPERTY_FOR = {
  RENT: 'Rent',
  BUY: 'Buy',
} as const;

export type PropertyFor = (typeof PROPERTY_FOR)[keyof typeof PROPERTY_FOR];

// Property Types
export const PROPERTY_TYPES = {
  FLAT: 'Flat',
  PLOT: 'Plot',
} as const;

export type PropertyType = (typeof PROPERTY_TYPES)[keyof typeof PROPERTY_TYPES];

// BHK Types
export const BHK_TYPES = {
  ONE: '1 BHK',
  TWO: '2 BHK',
  THREE: '3 BHK',
  FOUR: '4 BHK',
  FIVE_PLUS: '5+ BHK',
} as const;

export type BHKType = (typeof BHK_TYPES)[keyof typeof BHK_TYPES];

// Property Status
export const PROPERTY_STATUSES = {
  AVAILABLE: 'Available',
  ON_HOLD: 'On Hold',
  SOLD_RENTED: 'Sold/Rented',
} as const;

export type PropertyStatus = (typeof PROPERTY_STATUSES)[keyof typeof PROPERTY_STATUSES];

// Areas in Nagpur
export const AREAS = {
  DHARAMPETH: 'Dharampeth',
  SITABULDI: 'Sitabuldi',
  RAMDASPETH: 'Ramdaspeth',
  CIVIL_LINES: 'Civil Lines',
  SADAR: 'Sadar',
  BAJAJ_NAGAR: 'Bajaj Nagar',
  MANISH_NAGAR: 'Manish Nagar',
} as const;

export type Area = (typeof AREAS)[keyof typeof AREAS];

// Property Matching Score Weights
export const MATCHING_WEIGHTS = {
  AREA: 30,
  BUDGET: 30,
  TYPE_BHK: 20,
  PROPERTY_FOR: 20,
} as const;

// Minimum matching score (out of 100)
export const MIN_MATCH_SCORE = 60;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// OTP
export const OTP_LENGTH = 6;
export const OTP_DEMO = '123456'; // Demo OTP for development

// Token Types
export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const;

export type TokenType = (typeof TOKEN_TYPES)[keyof typeof TOKEN_TYPES];

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  INVALID_PHONE_OTP: 'Invalid phone number or OTP',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  USER_NOT_FOUND: 'User not found',
  ENQUIRY_NOT_FOUND: 'Enquiry not found',
  PROPERTY_NOT_FOUND: 'Property not found',
  INVALID_TOKEN: 'Invalid or expired token',
  EMAIL_EXISTS: 'Email already exists',
  PHONE_EXISTS: 'Phone number already exists',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error',
  PASSWORD_MISMATCH: 'Old password is incorrect',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  ENQUIRY_CREATED: 'Enquiry created successfully',
  ENQUIRY_UPDATED: 'Enquiry updated successfully',
  ENQUIRY_DELETED: 'Enquiry deleted successfully',
  PROPERTY_CREATED: 'Property created successfully',
  PROPERTY_UPDATED: 'Property updated successfully',
  PROPERTY_DELETED: 'Property deleted successfully',
} as const;

// Export all constants as arrays for validation
export const USER_ROLES_ARRAY = Object.values(USER_ROLES);
export const ENQUIRY_STATUSES_ARRAY = Object.values(ENQUIRY_STATUSES);
export const LEAD_SOURCES_ARRAY = Object.values(LEAD_SOURCES);
export const PROPERTY_FOR_ARRAY = Object.values(PROPERTY_FOR);
export const PROPERTY_TYPES_ARRAY = Object.values(PROPERTY_TYPES);
export const BHK_TYPES_ARRAY = Object.values(BHK_TYPES);
export const PROPERTY_STATUSES_ARRAY = Object.values(PROPERTY_STATUSES);
export const AREAS_ARRAY = Object.values(AREAS);