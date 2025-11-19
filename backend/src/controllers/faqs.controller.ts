/**
 * FAQs Controller
 * CRUD operations for FAQ management
 */
import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { FAQ } from '../entities/FAQ';
import { AuthRequest } from '../middleware/auth.middleware';

export class FAQsController {
  /**
   * GET /api/faqs
   * List all FAQs with filters
   */
  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;
      const { category, is_active, search } = req.query;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      const faqRepo = AppDataSource.getRepository(FAQ);
      const queryBuilder = faqRepo
        .createQueryBuilder('faq')
        .where('faq.business_id = :businessId', { businessId });

      // Apply filters
      if (category) {
        queryBuilder.andWhere('faq.category = :category', { category });
      }

      if (is_active !== undefined) {
        queryBuilder.andWhere('faq.is_active = :is_active', {
          is_active: is_active === 'true',
        });
      }

      if (search) {
        queryBuilder.andWhere(
          '(faq.question ILIKE :search OR faq.answer ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      queryBuilder.orderBy('faq.priority', 'DESC').addOrderBy('faq.times_asked', 'DESC');

      const [faqs, total] = await queryBuilder.getManyAndCount();

      res.json({
        success: true,
        data: {
          faqs,
          total,
        },
      });
    } catch (error) {
      console.error('List FAQs error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch FAQs', code: 'INTERNAL_ERROR' },
      });
    }
  }

  /**
   * GET /api/faqs/:id
   * Get single FAQ by ID
   */
  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;
      const { id } = req.params;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      const faqRepo = AppDataSource.getRepository(FAQ);
      const faq = await faqRepo.findOne({
        where: { id, business_id: businessId },
      });

      if (!faq) {
        res.status(404).json({
          success: false,
          error: { message: 'FAQ not found', code: 'NOT_FOUND' },
        });
        return;
      }

      res.json({
        success: true,
        data: faq,
      });
    } catch (error) {
      console.error('Get FAQ error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch FAQ', code: 'INTERNAL_ERROR' },
      });
    }
  }

  /**
   * POST /api/faqs
   * Create new FAQ
   */
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      const { question, answer, category, priority = 1, is_active = true } = req.body;

      if (!question || !answer) {
        res.status(400).json({
          success: false,
          error: { message: 'Question and answer are required', code: 'MISSING_FIELDS' },
        });
        return;
      }

      const faqRepo = AppDataSource.getRepository(FAQ);
      const faq = faqRepo.create({
        business_id: businessId,
        question,
        answer,
        category,
        priority,
        is_active,
      });

      await faqRepo.save(faq);

      res.status(201).json({
        success: true,
        data: faq,
      });
    } catch (error) {
      console.error('Create FAQ error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create FAQ', code: 'INTERNAL_ERROR' },
      });
    }
  }

  /**
   * PATCH /api/faqs/:id
   * Update existing FAQ
   */
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;
      const { id } = req.params;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      const faqRepo = AppDataSource.getRepository(FAQ);
      const faq = await faqRepo.findOne({
        where: { id, business_id: businessId },
      });

      if (!faq) {
        res.status(404).json({
          success: false,
          error: { message: 'FAQ not found', code: 'NOT_FOUND' },
        });
        return;
      }

      // Update fields
      const { question, answer, category, priority, is_active } = req.body;

      if (question !== undefined) faq.question = question;
      if (answer !== undefined) faq.answer = answer;
      if (category !== undefined) faq.category = category;
      if (priority !== undefined) faq.priority = priority;
      if (is_active !== undefined) faq.is_active = is_active;

      faq.updated_at = new Date();

      await faqRepo.save(faq);

      res.json({
        success: true,
        data: faq,
      });
    } catch (error) {
      console.error('Update FAQ error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update FAQ', code: 'INTERNAL_ERROR' },
      });
    }
  }

  /**
   * DELETE /api/faqs/:id
   * Delete FAQ
   */
  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;
      const { id } = req.params;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      const faqRepo = AppDataSource.getRepository(FAQ);
      const faq = await faqRepo.findOne({
        where: { id, business_id: businessId },
      });

      if (!faq) {
        res.status(404).json({
          success: false,
          error: { message: 'FAQ not found', code: 'NOT_FOUND' },
        });
        return;
      }

      await faqRepo.remove(faq);

      res.json({
        success: true,
        message: 'FAQ deleted successfully',
      });
    } catch (error) {
      console.error('Delete FAQ error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to delete FAQ', code: 'INTERNAL_ERROR' },
      });
    }
  }
}

export const faqsController = new FAQsController();
