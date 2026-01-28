import { z } from 'zod';

/**
 * Property Validation Schemas
 * 
 * Validates property listing data using Zod
 */

// Create Property Schema
export const createPropertySchema = z.object({
  owner_name: z.string()
    .min(2, 'Owner name must be at least 2 characters')
    .max(100, 'Owner name must not exceed 100 characters')
    .trim(),
  
  owner_phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Phone must be a valid 10-digit Indian mobile number')
    .trim(),
  
  owner_email: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  
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
  
  transaction_type: z.enum(['sale', 'rent'], {
    errorMap: () => ({ message: 'Must be either "sale" or "rent"' })
  }),
  
  price: z.number()
    .int('Price must be a whole number')
    .positive('Price must be positive')
    .min(100000, 'Price must be at least ₹1 lakh')
    .max(1000000000, 'Price cannot exceed ₹100 crores'),
  
  area: z.number()
    .positive('Area must be positive')
    .min(100, 'Area must be at least 100 sq.ft.')
    .max(1000000, 'Area cannot exceed 10 lakh sq.ft.'),
  
  location: z.string()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location must not exceed 100 characters')
    .trim(),
  
  address: z.string()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address must not exceed 500 characters')
    .trim(),
  
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must not exceed 50 characters')
    .trim()
    .default('Nagpur'),
  
  state: z.string()
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State must not exceed 50 characters')
    .trim()
    .default('Maharashtra'),
  
  pincode: z.string()
    .regex(/^\d{6}$/, 'Pincode must be a valid 6-digit number')
    .optional()
    .nullable(),
  
  description: z.string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional()
    .nullable(),
  
  features: z.array(z.string().trim())
    .max(20, 'Cannot exceed 20 features')
    .optional()
    .default([]),
  
  images: z.array(z.string().url('Invalid image URL'))
    .max(10, 'Cannot exceed 10 images')
    .optional()
    .default([]),
  
  assigned_to: z.string()
    .uuid('Invalid user ID')
    .optional()
    .nullable()
});

// Update Property Schema (all fields optional)
export const updatePropertySchema = z.object({
  owner_name: z.string()
    .min(2, 'Owner name must be at least 2 characters')
    .max(100, 'Owner name must not exceed 100 characters')
    .trim()
    .optional(),
  
  owner_phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Phone must be a valid 10-digit Indian mobile number')
    .trim()
    .optional(),
  
  owner_email: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  
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
  
  transaction_type: z.enum(['sale', 'rent'])
    .optional(),
  
  price: z.number()
    .int('Price must be a whole number')
    .positive('Price must be positive')
    .min(100000, 'Price must be at least ₹1 lakh')
    .max(1000000000, 'Price cannot exceed ₹100 crores')
    .optional(),
  
  area: z.number()
    .positive('Area must be positive')
    .min(100, 'Area must be at least 100 sq.ft.')
    .max(1000000, 'Area cannot exceed 10 lakh sq.ft.')
    .optional(),
  
  location: z.string()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location must not exceed 100 characters')
    .trim()
    .optional(),
  
  address: z.string()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address must not exceed 500 characters')
    .trim()
    .optional(),
  
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must not exceed 50 characters')
    .trim()
    .optional(),
  
  state: z.string()
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State must not exceed 50 characters')
    .trim()
    .optional(),
  
  pincode: z.string()
    .regex(/^\d{6}$/, 'Pincode must be a valid 6-digit number')
    .optional()
    .nullable(),
  
  description: z.string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional()
    .nullable(),
  
  features: z.array(z.string().trim())
    .max(20, 'Cannot exceed 20 features')
    .optional(),
  
  images: z.array(z.string().url('Invalid image URL'))
    .max(10, 'Cannot exceed 10 images')
    .optional(),
  
  assigned_to: z.string()
    .uuid('Invalid user ID')
    .optional()
    .nullable(),
  
  status: z.enum(['available', 'sold', 'rented', 'under_negotiation'])
    .optional()
});

// Property Matching Schema
export const propertyMatchingSchema = z.object({
  requirement_id: z.string()
    .uuid('Invalid requirement ID')
});

// Query Parameters Validation
export const propertyQuerySchema = z.object({
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
  
  status: z.enum(['available', 'sold', 'rented', 'under_negotiation'])
    .optional(),
  
  property_type: z.enum([
    'residential',
    'commercial',
    'industrial',
    'agricultural',
    'plot'
  ]).optional(),
  
  transaction_type: z.enum(['sale', 'rent'])
    .optional(),
  
  location: z.string()
    .trim()
    .optional(),
  
  min_price: z.string()
    .regex(/^\d+$/, 'Price must be a number')
    .transform(Number)
    .pipe(z.number().int().positive())
    .optional(),
  
  max_price: z.string()
    .regex(/^\d+$/, 'Price must be a number')
    .transform(Number)
    .pipe(z.number().int().positive())
    .optional(),
  
  min_area: z.string()
    .regex(/^\d+(\.\d+)?$/, 'Area must be a number')
    .transform(Number)
    .pipe(z.number().positive())
    .optional(),
  
  max_area: z.string()
    .regex(/^\d+(\.\d+)?$/, 'Area must be a number')
    .transform(Number)
    .pipe(z.number().positive())
    .optional(),
  
  assigned_to: z.string()
    .uuid('Invalid user ID')
    .optional(),
  
  search: z.string()
    .trim()
    .optional()
}).refine(
  (data) => {
    if (data.min_price && data.max_price) {
      return Number(data.max_price) >= Number(data.min_price);
    }
    return true;
  },
  {
    message: 'Maximum price must be greater than or equal to minimum price',
    path: ['max_price']
  }
).refine(
  (data) => {
    if (data.min_area && data.max_area) {
      return Number(data.max_area) >= Number(data.min_area);
    }
    return true;
  },
  {
    message: 'Maximum area must be greater than or equal to minimum area',
    path: ['max_area']
  }
);

// Type exports
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyMatchingInput = z.infer<typeof propertyMatchingSchema>;
export type PropertyQueryParams = z.infer<typeof propertyQuerySchema>;