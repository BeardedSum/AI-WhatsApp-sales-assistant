/**
 * Authentication Middleware
 * JWT token verification for protected routes
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

export interface AuthRequest extends Request {
  businessId?: string;
  business?: any;
}

/**
 * Verify JWT token and attach business ID to request
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Access token required',
        code: 'NO_TOKEN',
      },
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { businessId: string };
    req.businessId = decoded.businessId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Token expired',
          code: 'TOKEN_EXPIRED',
        },
      });
      return;
    }

    res.status(403).json({
      success: false,
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      },
    });
  }
};

/**
 * Generate access token (15 minutes)
 */
export const generateAccessToken = (businessId: string): string => {
  return jwt.sign({ businessId }, JWT_SECRET, { expiresIn: '15m' });
};

/**
 * Generate refresh token (7 days)
 */
export const generateRefreshToken = (businessId: string): string => {
  return jwt.sign({ businessId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { businessId: string };
    return decoded.businessId;
  } catch (error) {
    return null;
  }
};
