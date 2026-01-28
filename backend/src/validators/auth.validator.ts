import { z } from 'zod';

/**
 * Login with email/password schema
 */
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format')
      .toLowerCase(),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(1, 'Password cannot be empty'),
  }),
});

/**
 * Login with phone/OTP schema
 */
export const phoneLoginSchema = z.object({
  body: z.object({
    phone: z
      .string({
        required_error: 'Phone number is required',
      })
      .regex(/^\+?91?[\s-]?[6-9]\d{9}$/, 'Invalid phone number format'),
    otp: z
      .string({
        required_error: 'OTP is required',
      })
      .length(6, 'OTP must be 6 digits'),
  }),
});

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z
      .string({
        required_error: 'Refresh token is required',
      })
      .min(1, 'Refresh token cannot be empty'),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type PhoneLoginInput = z.infer<typeof phoneLoginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;