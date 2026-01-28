import { UserRole } from '../config/constants';

/**
 * User entity from database
 */
export interface User {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

/**
 * User without password (for responses)
 */
export interface UserResponse {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create user DTO
 */
export interface CreateUserDto {
  full_name: string;
  phone_number: string;
  email: string;
  password: string;
  role: UserRole;
}

/**
 * Update user profile DTO
 */
export interface UpdateUserProfileDto {
  full_name?: string;
  phone_number?: string;
  email?: string;
}

/**
 * Change password DTO
 */
export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

/**
 * User filter options
 */
export interface UserFilter {
  role?: UserRole;
  search?: string;
}

/**
 * Convert User to UserResponse (remove password)
 */
export const toUserResponse = (user: User): UserResponse => {
  const { password_hash, ...userResponse } = user;
  return userResponse;
};