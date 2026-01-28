import jwt from 'jsonwebtoken';
import { env } from '../config/environment';
import { TOKEN_TYPES } from '../config/constants';
import { logger } from './logger.util';

export interface TokenPayload {
  userId: string;
  role: string;
  type: string;
}

/**
 * Generate access token (short-lived)
 */
export const generateAccessToken = (userId: string, role: string): string => {
  try {
    const payload: TokenPayload = {
      userId,
      role,
      type: TOKEN_TYPES.ACCESS,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    return token;
  } catch (error) {
    logger.error('Error generating access token:', error);
    throw new Error('Failed to generate access token');
  }
};

/**
 * Generate refresh token (long-lived)
 */
export const generateRefreshToken = (userId: string): string => {
  try {
    const payload: TokenPayload = {
      userId,
      role: '', // Not needed for refresh token
      type: TOKEN_TYPES.REFRESH,
    };

    const token = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });

    return token;
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

    if (decoded.type !== TOKEN_TYPES.ACCESS) {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    logger.error('Error verifying access token:', error);
    throw new Error('Failed to verify token');
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;

    if (decoded.type !== TOKEN_TYPES.REFRESH) {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    logger.error('Error verifying refresh token:', error);
    throw new Error('Failed to verify refresh token');
  }
};

/**
 * Decode token without verification (for debugging)
 */
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    return decoded;
  } catch (error) {
    logger.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get token expiration time in seconds
 */
export const getTokenExpiration = (token: string): number | null => {
  try {
    const decoded = jwt.decode(token) as any;
    return decoded?.exp || null;
  } catch (error) {
    return null;
  }
};