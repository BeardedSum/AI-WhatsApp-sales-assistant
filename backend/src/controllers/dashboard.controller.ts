/**
 * Dashboard Controller
 * Provides analytics and statistics
 */
import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Conversation } from '../entities/Conversation';
import { Message } from '../entities/Message';
import { Customer } from '../entities/Customer';
import { AIInteraction } from '../entities/AIInteraction';
import { AuthRequest } from '../middleware/auth.middleware';

export class DashboardController {
  /**
   * GET /api/dashboard/charts
   * Get chart data for analytics
   */
  async getCharts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;
      const { days = '7' } = req.query;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      const daysNum = parseInt(days as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysNum);

      const conversationRepo = AppDataSource.getRepository(Conversation);
      const messageRepo = AppDataSource.getRepository(Message);

      // Conversations over time
      const conversationsOverTime = await conversationRepo
        .createQueryBuilder('conv')
        .select('DATE(conv.created_at)', 'date')
        .addSelect('COUNT(*)', 'count')
        .where('conv.business_id = :businessId', { businessId })
        .andWhere('conv.created_at >= :startDate', { startDate })
        .groupBy('DATE(conv.created_at)')
        .orderBy('DATE(conv.created_at)', 'ASC')
        .getRawMany();

      // Messages over time
      const messagesOverTime = await messageRepo
        .createQueryBuilder('msg')
        .innerJoin('msg.conversation', 'conv')
        .select('DATE(msg.created_at)', 'date')
        .addSelect('COUNT(*)', 'count')
        .where('conv.business_id = :businessId', { businessId })
        .andWhere('msg.created_at >= :startDate', { startDate })
        .groupBy('DATE(msg.created_at)')
        .orderBy('DATE(msg.created_at)', 'ASC')
        .getRawMany();

      res.json({
        success: true,
        data: {
          conversations_over_time: conversationsOverTime,
          messages_over_time: messagesOverTime,
        },
      });
    } catch (error) {
      console.error('Dashboard charts error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch chart data',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  /**
   * GET /api/dashboard/stats
   * Get dashboard statistics and analytics
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

      const conversationRepo = AppDataSource.getRepository(Conversation);
      const messageRepo = AppDataSource.getRepository(Message);
      const customerRepo = AppDataSource.getRepository(Customer);
      const aiInteractionRepo = AppDataSource.getRepository(AIInteraction);

      // Total conversations
      const total_conversations = await conversationRepo.count({
        where: { business_id: businessId },
      });

      // Conversations by status
      const active_conversations = await conversationRepo.count({
        where: { business_id: businessId, status: 'active' },
      });

      const escalated_conversations = await conversationRepo.count({
        where: { business_id: businessId, status: 'escalated' },
      });

      const resolved_conversations = await conversationRepo.count({
        where: { business_id: businessId, status: 'resolved' },
      });

      // AI vs Human handled
      const ai_handled = await conversationRepo.count({
        where: { business_id: businessId, handled_by: 'ai' },
      });

      const human_handled = await conversationRepo.count({
        where: { business_id: businessId, handled_by: 'human' },
      });

      const hybrid_handled = await conversationRepo.count({
        where: { business_id: businessId, handled_by: 'hybrid' },
      });

      const ai_handled_percentage =
        total_conversations > 0 ? (ai_handled / total_conversations) * 100 : 0;
      const human_handled_percentage =
        total_conversations > 0 ? ((human_handled + hybrid_handled) / total_conversations) * 100 : 0;

      // Average response time from AI interactions
      const avgResult = await aiInteractionRepo
        .createQueryBuilder('ai')
        .innerJoin('ai.conversation', 'conv')
        .where('conv.business_id = :businessId', { businessId })
        .select('AVG(ai.processing_time_ms)', 'avg')
        .getRawOne();

      const average_response_time_ms = avgResult?.avg
        ? Math.round(parseFloat(avgResult.avg))
        : 0;

      // Messages today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const total_messages_today = await messageRepo
        .createQueryBuilder('msg')
        .innerJoin('msg.conversation', 'conv')
        .where('conv.business_id = :businessId', { businessId })
        .andWhere('msg.created_at >= :today', { today })
        .getCount();

      // Total customers
      const total_customers = await customerRepo.count({
        where: { business_id: businessId },
      });

      // Recent conversations (last 10)
      const recent_conversations = await conversationRepo.find({
        where: { business_id: businessId },
        relations: ['customer'],
        order: { updated_at: 'DESC' },
        take: 10,
      });

      res.json({
        success: true,
        data: {
          total_conversations,
          active_conversations,
          escalated_conversations,
          resolved_conversations,
          ai_handled_percentage,
          human_handled_percentage,
          average_response_time_ms,
          total_messages_today,
          total_customers,
          recent_conversations: recent_conversations.map((conv) => ({
            id: conv.id,
            status: conv.status,
            is_human_handled: conv.handled_by === 'human' || conv.handled_by === 'hybrid',
            last_message_at: conv.updated_at,
            customer: conv.customer
              ? {
                  id: conv.customer.id,
                  name: conv.customer.name,
                  whatsapp_number: conv.customer.whatsapp_number,
                }
              : null,
          })),
        },
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch dashboard stats',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }
}

export const dashboardController = new DashboardController();
