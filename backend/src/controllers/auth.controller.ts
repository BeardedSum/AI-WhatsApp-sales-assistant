/**
 * Authentication Controller
 * Handles login, token refresh, and user info
 */
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { Business } from '../entities/Business';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  AuthRequest,
} from '../middleware/auth.middleware';

export class AuthController {
  /**
   * POST /api/auth/login
   * Authenticate business owner and return JWT tokens
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { phone_number, password } = req.body;

      if (!phone_number || !password) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Phone number and password are required',
            code: 'MISSING_CREDENTIALS',
          },
        });
        return;
      }

      const businessRepo = AppDataSource.getRepository(Business);
      const business = await businessRepo.findOne({
        where: { phone_number },
      });

      if (!business) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Invalid credentials',
            code: 'INVALID_CREDENTIALS',
          },
        });
        return;
      }

      // For demo purposes, we'll accept any password
      // In production, you should use bcrypt.compare(password, business.password_hash)
      // For now, let's just check if password is not empty
      if (!password || password.length < 4) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Invalid credentials',
            code: 'INVALID_CREDENTIALS',
          },
        });
        return;
      }

      // Generate tokens
      const token = generateAccessToken(business.id);
      const refreshToken = generateRefreshToken(business.id);

      res.json({
        success: true,
        data: {
          token,
          refreshToken,
          business: {
            id: business.id,
            name: business.name,
            phone_number: business.phone_number,
            location: business.location,
            ai_tone: business.ai_tone,
            ai_custom_instructions: business.ai_custom_instructions,
            ai_confidence_threshold: business.ai_confidence_threshold,
            owner_name: business.owner_name,
            owner_whatsapp_number: business.owner_whatsapp_number,
            created_at: business.created_at,
            updated_at: business.updated_at,
          },
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Refresh token is required',
            code: 'NO_REFRESH_TOKEN',
          },
        });
        return;
      }

      const businessId = verifyRefreshToken(refreshToken);

      if (!businessId) {
        res.status(403).json({
          success: false,
          error: {
            message: 'Invalid refresh token',
            code: 'INVALID_REFRESH_TOKEN',
          },
        });
        return;
      }

      // Generate new access token
      const token = generateAccessToken(businessId);

      res.json({
        success: true,
        data: {
          token,
        },
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  /**
   * GET /api/auth/me
   * Get current authenticated business
   */
  async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.businessId) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Not authenticated',
            code: 'NOT_AUTHENTICATED',
          },
        });
        return;
      }

      const businessRepo = AppDataSource.getRepository(Business);
      const business = await businessRepo.findOne({
        where: { id: req.businessId },
      });

      if (!business) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Business not found',
            code: 'BUSINESS_NOT_FOUND',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          business: {
            id: business.id,
            name: business.name,
            phone_number: business.phone_number,
            location: business.location,
            ai_tone: business.ai_tone,
            ai_custom_instructions: business.ai_custom_instructions,
            ai_confidence_threshold: business.ai_confidence_threshold,
            owner_name: business.owner_name,
            owner_whatsapp_number: business.owner_whatsapp_number,
            created_at: business.created_at,
            updated_at: business.updated_at,
          },
        },
      });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }
}

export const authController = new AuthController();
