/**
 * Business Controller
 * Manage business settings
 */
import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Business } from '../entities/Business';
import { AuthRequest } from '../middleware/auth.middleware';

export class BusinessController {
  /**
   * PATCH /api/business/settings
   * Update business settings
   */
  async updateSettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      const businessRepo = AppDataSource.getRepository(Business);
      const business = await businessRepo.findOne({
        where: { id: businessId },
      });

      if (!business) {
        res.status(404).json({
          success: false,
          error: { message: 'Business not found', code: 'NOT_FOUND' },
        });
        return;
      }

      // Update fields
      const {
        name,
        location,
        ai_tone,
        ai_custom_instructions,
        ai_confidence_threshold,
      } = req.body;

      if (name !== undefined) business.name = name;
      if (location !== undefined) business.location = location;
      if (ai_tone !== undefined) business.ai_tone = ai_tone;
      if (ai_custom_instructions !== undefined)
        business.ai_custom_instructions = ai_custom_instructions;
      if (ai_confidence_threshold !== undefined)
        business.ai_confidence_threshold = ai_confidence_threshold;

      business.updated_at = new Date();

      await businessRepo.save(business);

      res.json({
        success: true,
        data: {
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
      });
    } catch (error) {
      console.error('Update business settings error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update settings', code: 'INTERNAL_ERROR' },
      });
    }
  }
}

export const businessController = new BusinessController();
