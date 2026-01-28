/**
 * Validation utility functions
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 * Accepts: +919876543210, 9876543210, +91 9876543210
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?91?[\s-]?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Normalize phone number to +91XXXXXXXXXX format
 */
export const normalizePhone = (phone: string): string => {
  // Remove all spaces and dashes
  let normalized = phone.replace(/[\s-]/g, '');

  // Remove +91 if present
  if (normalized.startsWith('+91')) {
    normalized = normalized.substring(3);
  } else if (normalized.startsWith('91')) {
    normalized = normalized.substring(2);
  }

  // Add +91 prefix
  return `+91${normalized}`;
};

/**
 * Validate UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Sanitize string input (remove HTML tags and trim)
 */
export const sanitizeString = (input: string): string => {
  return input.replace(/<[^>]*>/g, '').trim();
};

/**
 * Validate positive number
 */
export const isPositiveNumber = (value: any): boolean => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validate non-negative number
 */
export const isNonNegativeNumber = (value: any): boolean => {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Validate date string
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Parse pagination parameters
 */
export const parsePaginationParams = (
  page?: string | number,
  limit?: string | number
): { page: number; limit: number } => {
  const parsedPage = Math.max(1, parseInt(String(page || 1)));
  const parsedLimit = Math.min(100, Math.max(1, parseInt(String(limit || 20))));

  return {
    page: parsedPage,
    limit: parsedLimit,
  };
};

/**
 * Calculate pagination offset
 */
export const calculateOffset = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

/**
 * Validate enum value
 */
export const isValidEnumValue = <T extends Record<string, any>>(
  value: any,
  enumObject: T
): value is T[keyof T] => {
  return Object.values(enumObject).includes(value);
};

/**
 * Validate array of enum values
 */
export const areValidEnumValues = <T extends Record<string, any>>(
  values: any[],
  enumObject: T
): boolean => {
  return values.every((value) => isValidEnumValue(value, enumObject));
};

/**
 * Check if string is empty or whitespace
 */
export const isEmptyString = (str: string | null | undefined): boolean => {
  return !str || str.trim().length === 0;
};

/**
 * Validate price range
 */
export const isValidPriceRange = (min: number, max: number): boolean => {
  return min >= 0 && max >= 0 && min <= max;
};

/**
 * Validate BHK range
 */
export const isValidBHKRange = (min: number, max: number): boolean => {
  return min >= 1 && max >= 1 && min <= max && max <= 10;
};