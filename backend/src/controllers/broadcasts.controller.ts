/**
 * Broadcasts Controller
 * Manages broadcast messaging to multiple customers
 */
import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Broadcast } from '../entities/Broadcast';
import { Customer } from '../entities/Customer';
import { AuthRequest } from '../middleware/auth.middleware';
import { queueService } from '../services/queue.service';

export class BroadcastsController {
  /**
   * GET /api/broadcasts
   * List all broadcasts
   */
  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;
      const { status } = req.query;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      const broadcastRepo = AppDataSource.getRepository(Broadcast);
      const queryBuilder = broadcastRepo
        .createQueryBuilder('broadcast')
        .where('broadcast.business_id = :businessId', { businessId });

      if (status) {
        queryBuilder.andWhere('broadcast.status = :status', { status });
      }

      queryBuilder.orderBy('broadcast.created_at', 'DESC');

      const [broadcasts, total] = await queryBuilder.getManyAndCount();

      res.json({
        success: true,
        data: { broadcasts, total },
      });
    } catch (error) {
      console.error('List broadcasts error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch broadcasts', code: 'INTERNAL_ERROR' },
      });
    }
  }

  /**
   * POST /api/broadcasts
   * Create new broadcast
   */
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;
      const {
        title,
        message,
        target_audience = 'all',
        customer_ids,
        scheduled_at,
      } = req.body;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      if (!title || !message) {
        res.status(400).json({
          success: false,
          error: { message: 'Title and message are required', code: 'MISSING_FIELDS' },
        });
        return;
      }

      // Calculate total recipients
      let totalRecipients = 0;
      if (customer_ids && customer_ids.length > 0) {
        totalRecipients = customer_ids.length;
      } else {
        const customerRepo = AppDataSource.getRepository(Customer);
        totalRecipients = await customerRepo.count({
          where: { business_id: businessId },
        });
      }

      const broadcastRepo = AppDataSource.getRepository(Broadcast);
      const broadcast = broadcastRepo.create({
        business_id: businessId,
        title,
        message,
        target_audience,
        customer_ids,
        scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
        status: scheduled_at ? 'scheduled' : 'draft',
        total_recipients: totalRecipients,
      });

      await broadcastRepo.save(broadcast);

      // If scheduled or immediate, add to queue
      if (broadcast.status === 'scheduled') {
        await queueService.scheduleBroadcast(broadcast.id, broadcast.scheduled_at || undefined);
      }

      res.status(201).json({
        success: true,
        data: broadcast,
      });
    } catch (error) {
      console.error('Create broadcast error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create broadcast', code: 'INTERNAL_ERROR' },
      });
    }
  }

  /**
   * POST /api/broadcasts/:id/send
   * Send broadcast immediately
   */
  async send(req: AuthRequest, res: Response): Promise<void> {
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

      const broadcastRepo = AppDataSource.getRepository(Broadcast);
      const broadcast = await broadcastRepo.findOne({
        where: { id, business_id: businessId },
      });

      if (!broadcast) {
        res.status(404).json({
          success: false,
          error: { message: 'Broadcast not found', code: 'NOT_FOUND' },
        });
        return;
      }

      if (broadcast.status !== 'draft' && broadcast.status !== 'scheduled') {
        res.status(400).json({
          success: false,
          error: {
            message: 'Broadcast already sent or sending',
            code: 'INVALID_STATUS',
          },
        });
        return;
      }

      // Update status to scheduled
      broadcast.status = 'scheduled';
      broadcast.scheduled_at = new Date();
      await broadcastRepo.save(broadcast);

      // Queue for immediate sending
      await queueService.scheduleBroadcast(broadcast.id);

      res.json({
        success: true,
        data: broadcast,
        message: 'Broadcast queued for sending',
      });
    } catch (error) {
      console.error('Send broadcast error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to send broadcast', code: 'INTERNAL_ERROR' },
      });
    }
  }

  /**
   * DELETE /api/broadcasts/:id
   * Delete broadcast (only if draft)
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

      const broadcastRepo = AppDataSource.getRepository(Broadcast);
      const broadcast = await broadcastRepo.findOne({
        where: { id, business_id: businessId },
      });

      if (!broadcast) {
        res.status(404).json({
          success: false,
          error: { message: 'Broadcast not found', code: 'NOT_FOUND' },
        });
        return;
      }

      if (broadcast.status !== 'draft') {
        res.status(400).json({
          success: false,
          error: {
            message: 'Can only delete draft broadcasts',
            code: 'INVALID_STATUS',
          },
        });
        return;
      }

      await broadcastRepo.remove(broadcast);

      res.json({
        success: true,
        message: 'Broadcast deleted successfully',
      });
    } catch (error) {
      console.error('Delete broadcast error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to delete broadcast', code: 'INTERNAL_ERROR' },
      });
    }
  }

  /**
   * GET /api/broadcasts/stats
   * Get broadcast statistics
   */
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      const broadcastRepo = AppDataSource.getRepository(Broadcast);

      const total = await broadcastRepo.count({
        where: { business_id: businessId },
      });

      const sent = await broadcastRepo.count({
        where: { business_id: businessId, status: 'sent' },
      });

      const scheduled = await broadcastRepo.count({
        where: { business_id: businessId, status: 'scheduled' },
      });

      const totalRecipientsResult = await broadcastRepo
        .createQueryBuilder('broadcast')
        .select('SUM(broadcast.sent_count)', 'total')
        .where('broadcast.business_id = :businessId', { businessId })
        .andWhere('broadcast.status = :status', { status: 'sent' })
        .getRawOne();

      const queueStats = await queueService.getStats();

      res.json({
        success: true,
        data: {
          total_broadcasts: total,
          sent_broadcasts: sent,
          scheduled_broadcasts: scheduled,
          total_messages_sent: parseInt(totalRecipientsResult?.total || '0'),
          queue: queueStats,
        },
      });
    } catch (error) {
      console.error('Get broadcast stats error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch stats', code: 'INTERNAL_ERROR' },
      });
    }
  }
}

export const broadcastsController = new BroadcastsController();
