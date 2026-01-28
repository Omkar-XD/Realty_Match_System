import { z } from 'zod';
import { USER_ROLES_ARRAY } from '../config/constants';

/**
 * Update user profile schema
 */
export const updateProfileSchema = z.object({
  body: z.object({
    full_name: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(255, 'Full name cannot exceed 255 characters')
      .optional(),
    email: z
      .string()
      .email('Invalid email format')
      .toLowerCase()
      .optional(),
    phone_number: z
      .string()
      .regex(/^\+?91?[\s-]?[6-9]\d{9}$/, 'Invalid phone number format')
      .optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    'At least one field must be provided'
  ),
});

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z
      .string({
        required_error: 'Old password is required',
      })
      .min(1, 'Old password cannot be empty'),
    newPassword: z
      .string({
        required_error: 'New password is required',
      })
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  }).refine(
    (data) => data.oldPassword !== data.newPassword,
    {
      message: 'New password must be different from old password',
      path: ['newPassword'],
    }
  ),
});

/**
 * Create user schema (admin only)
 */
export const createUserSchema = z.object({
  body: z.object({
    full_name: z
      .string({
        required_error: 'Full name is required',
      })
      .min(2, 'Full name must be at least 2 characters')
      .max(255, 'Full name cannot exceed 255 characters'),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format')
      .toLowerCase(),
    phone_number: z
      .string({
        required_error: 'Phone number is required',
      })
      .regex(/^\+?91?[\s-]?[6-9]\d{9}$/, 'Invalid phone number format'),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(8, 'Password must be at least 8 characters'),
    role: z
      .enum(USER_ROLES_ARRAY as [string, ...string[]], {
        required_error: 'Role is required',
        invalid_type_error: 'Invalid role',
      }),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;