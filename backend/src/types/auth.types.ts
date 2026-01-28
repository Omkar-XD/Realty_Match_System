import { UserResponse } from './user.types';

/**
 * Login request with email/password
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login request with phone/OTP
 */
export interface PhoneLoginRequest {
  phone: string;
  otp: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  accessToken: string;
}

/**
 * Refresh token entity in database
 */
export interface RefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}

/**
 * Create refresh token DTO
 */
export interface CreateRefreshTokenDto {
  user_id: string;
  token: string;
  expires_at: Date;
}