import { z } from 'zod';

/**
 * Enquiry Validation Schemas
 * 
 * Validates enquiry and buyer requirement data using Zod
 */

// Enquiry Basic Info Schema
export const createEnquirySchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Phone must be a valid 10-digit Indian mobile number')
    .trim(),
  
  email: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  
  address: z.string()
    .max(500, 'Address must not exceed 500 characters')
    .optional(),
  
  notes: z.string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional(),
  
  assigned_to: z.string()
    .uuid('Invalid user ID')
    .optional()
    .nullable()
});

// Update Enquiry Schema (all fields optional)
export const updateEnquirySchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim()
    .optional(),
  
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Phone must be a valid 10-digit Indian mobile number')
    .trim()
    .optional(),
  
  email: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  
  address: z.string()
    .max(500, 'Address must not exceed 500 characters')
    .optional(),
  
  notes: z.string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional(),
  
  assigned_to: z.string()
    .uuid('Invalid user ID')
    .optional()
    .nullable(),
  
  status: z.enum(['active', 'inactive', 'converted', 'closed'])
    .optional()
});

// Buyer Requirement Schema
export const createBuyerRequirementSchema = z.object({
  enquiry_id: z.string()
    .uuid('Invalid enquiry ID'),
  
  property_type: z.enum([
    'residential',
    'commercial',
    'industrial',
    'agricultural',
    'plot'
  ], {
    errorMap: () => ({ message: 'Invalid property type' })
  }),
  
  property_subtype: z.string()
    .min(2, 'Property subtype must be at least 2 characters')
    .max(50, 'Property subtype must not exceed 50 characters')
    .trim(),
  
  looking_for: z.enum(['buy', 'rent'], {
    errorMap: () => ({ message: 'Must be either "buy" or "rent"' })
  }),
  
  budget_min: z.number()
    .int('Budget must be a whole number')
    .positive('Budget must be positive')
    .min(100000, 'Minimum budget must be at least ₹1 lakh')
    .max(1000000000, 'Budget cannot exceed ₹100 crores'),
  
  budget_max: z.number()
    .int('Budget must be a whole number')
    .positive('Budget must be positive')
    .min(100000, 'Maximum budget must be at least ₹1 lakh')
    .max(1000000000, 'Budget cannot exceed ₹100 crores'),
  
  area_min: z.number()
    .positive('Area must be positive')
    .min(100, 'Minimum area must be at least 100 sq.ft.')
    .max(1000000, 'Area cannot exceed 10 lakh sq.ft.')
    .optional()
    .nullable(),
  
  area_max: z.number()
    .positive('Area must be positive')
    .min(100, 'Maximum area must be at least 100 sq.ft.')
    .max(1000000, 'Area cannot exceed 10 lakh sq.ft.')
    .optional()
    .nullable(),
  
  preferred_areas: z.array(z.string().trim())
    .min(1, 'At least one preferred area is required')
    .max(10, 'Cannot exceed 10 preferred areas'),
  
  notes: z.string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional()
    .nullable()
}).refine(
  (data) => data.budget_max >= data.budget_min,
  {
    message: 'Maximum budget must be greater than or equal to minimum budget',
    path: ['budget_max']
  }
).refine(
  (data) => {
    if (data.area_min && data.area_max) {
      return data.area_max >= data.area_min;
    }
    return true;
  },
  {
    message: 'Maximum area must be greater than or equal to minimum area',
    path: ['area_max']
  }
);

// Update Buyer Requirement Schema
export const updateBuyerRequirementSchema = z.object({
  property_type: z.enum([
    'residential',
    'commercial',
    'industrial',
    'agricultural',
    'plot'
  ]).optional(),
  
  property_subtype: z.string()
    .min(2, 'Property subtype must be at least 2 characters')
    .max(50, 'Property subtype must not exceed 50 characters')
    .trim()
    .optional(),
  
  looking_for: z.enum(['buy', 'rent'])
    .optional(),
  
  budget_min: z.number()
    .int('Budget must be a whole number')
    .positive('Budget must be positive')
    .min(100000, 'Minimum budget must be at least ₹1 lakh')
    .max(1000000000, 'Budget cannot exceed ₹100 crores')
    .optional(),
  
  budget_max: z.number()
    .int('Budget must be a whole number')
    .positive('Budget must be positive')
    .min(100000, 'Maximum budget must be at least ₹1 lakh')
    .max(1000000000, 'Budget cannot exceed ₹100 crores')
    .optional(),
  
  area_min: z.number()
    .positive('Area must be positive')
    .min(100, 'Minimum area must be at least 100 sq.ft.')
    .max(1000000, 'Area cannot exceed 10 lakh sq.ft.')
    .optional()
    .nullable(),
  
  area_max: z.number()
    .positive('Area must be positive')
    .min(100, 'Maximum area must be at least 100 sq.ft.')
    .max(1000000, 'Area cannot exceed 10 lakh sq.ft.')
    .optional()
    .nullable(),
  
  preferred_areas: z.array(z.string().trim())
    .min(1, 'At least one preferred area is required')
    .max(10, 'Cannot exceed 10 preferred areas')
    .optional(),
  
  notes: z.string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional()
    .nullable(),
  
  status: z.enum(['active', 'matched', 'closed'])
    .optional()
}).refine(
  (data) => {
    if (data.budget_min && data.budget_max) {
      return data.budget_max >= data.budget_min;
    }
    return true;
  },
  {
    message: 'Maximum budget must be greater than or equal to minimum budget',
    path: ['budget_max']
  }
).refine(
  (data) => {
    if (data.area_min && data.area_max) {
      return data.area_max >= data.area_min;
    }
    return true;
  },
  {
    message: 'Maximum area must be greater than or equal to minimum area',
    path: ['area_max']
  }
);

// Query Parameters Validation
export const enquiryQuerySchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .pipe(z.number().int().positive())
    .optional()
    .default('1'),
  
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .pipe(z.number().int().positive().max(100))
    .optional()
    .default('20'),
  
  status: z.enum(['active', 'inactive', 'converted', 'closed'])
    .optional(),
  
  assigned_to: z.string()
    .uuid('Invalid user ID')
    .optional(),
  
  search: z.string()
    .trim()
    .optional()
});

// Type exports
export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
export type UpdateEnquiryInput = z.infer<typeof updateEnquirySchema>;
export type CreateBuyerRequirementInput = z.infer<typeof createBuyerRequirementSchema>;
export type UpdateBuyerRequirementInput = z.infer<typeof updateBuyerRequirementSchema>;
export type EnquiryQueryParams = z.infer<typeof enquiryQuerySchema>;    