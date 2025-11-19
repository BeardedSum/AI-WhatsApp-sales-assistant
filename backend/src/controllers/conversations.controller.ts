/**
 * Conversations Controller
 * Manages conversations and messages
 */
import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Conversation } from '../entities/Conversation';
import { Message } from '../entities/Message';
import { AuthRequest } from '../middleware/auth.middleware';
import { whatsappService } from '../services/whatsapp.service';

export class ConversationsController {
  /**
   * GET /api/conversations
   * List conversations with filters
   */
  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;
      const { status, is_human_handled, search, page = '1', limit = '20' } = req.query;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      const conversationRepo = AppDataSource.getRepository(Conversation);
      const queryBuilder = conversationRepo
        .createQueryBuilder('conv')
        .leftJoinAndSelect('conv.customer', 'customer')
        .where('conv.business_id = :businessId', { businessId });

      // Apply filters
      if (status) {
        queryBuilder.andWhere('conv.status = :status', { status });
      }

      if (is_human_handled !== undefined) {
        const handledBy = is_human_handled === 'true' ? 'human' : 'ai';
        queryBuilder.andWhere('conv.handled_by = :handledBy', { handledBy });
      }

      if (search) {
        queryBuilder.andWhere(
          '(customer.name ILIKE :search OR customer.whatsapp_number ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      queryBuilder
        .orderBy('conv.updated_at', 'DESC')
        .skip(skip)
        .take(limitNum);

      const [conversations, total] = await queryBuilder.getManyAndCount();

      res.json({
        success: true,
        data: {
          conversations: conversations.map((conv) => ({
            id: conv.id,
            business_id: conv.business_id,
            customer_id: conv.customer_id,
            status: conv.status,
            is_human_handled: conv.handled_by === 'human' || conv.handled_by === 'hybrid',
            human_takeover_at: conv.escalated_at,
            started_at: conv.created_at,
            last_message_at: conv.updated_at,
            customer: conv.customer
              ? {
                  id: conv.customer.id,
                  name: conv.customer.name,
                  whatsapp_number: conv.customer.whatsapp_number,
                }
              : null,
          })),
          total,
          page: pageNum,
          limit: limitNum,
        },
      });
    } catch (error) {
      console.error('List conversations error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch conversations', code: 'INTERNAL_ERROR' },
      });
    }
  }

  /**
   * GET /api/conversations/:id
   * Get conversation details with messages
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

      const conversationRepo = AppDataSource.getRepository(Conversation);
      const messageRepo = AppDataSource.getRepository(Message);

      const conversation = await conversationRepo.findOne({
        where: { id, business_id: businessId },
        relations: ['customer'],
      });

      if (!conversation) {
        res.status(404).json({
          success: false,
          error: { message: 'Conversation not found', code: 'NOT_FOUND' },
        });
        return;
      }

      const messages = await messageRepo.find({
        where: { conversation_id: id },
        order: { created_at: 'ASC' },
      });

      res.json({
        success: true,
        data: {
          conversation: {
            id: conversation.id,
            business_id: conversation.business_id,
            customer_id: conversation.customer_id,
            status: conversation.status,
            is_human_handled: conversation.handled_by === 'human' || conversation.handled_by === 'hybrid',
            human_takeover_at: conversation.escalated_at,
            started_at: conversation.created_at,
            last_message_at: conversation.updated_at,
            customer: conversation.customer
              ? {
                  id: conversation.customer.id,
                  name: conversation.customer.name,
                  whatsapp_number: conversation.customer.whatsapp_number,
                }
              : null,
          },
          messages: messages.map((msg) => ({
            id: msg.id,
            conversation_id: msg.conversation_id,
            sender_type: msg.sender_type,
            content: msg.content,
            message_type: msg.message_type,
            media_url: msg.media_url,
            created_at: msg.created_at,
          })),
        },
      });
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch conversation', code: 'INTERNAL_ERROR' },
      });
    }
  }

  /**
   * PATCH /api/conversations/:id/takeover
   * Take over conversation from AI
   */
  async takeover(req: AuthRequest, res: Response): Promise<void> {
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

      const conversationRepo = AppDataSource.getRepository(Conversation);
      const conversation = await conversationRepo.findOne({
        where: { id, business_id: businessId },
      });

      if (!conversation) {
        res.status(404).json({
          success: false,
          error: { message: 'Conversation not found', code: 'NOT_FOUND' },
        });
        return;
      }

      conversation.handled_by = 'human';
      conversation.escalated_at = new Date();
      conversation.status = 'escalated';

      await conversationRepo.save(conversation);

      res.json({
        success: true,
        data: {
          conversation: {
            id: conversation.id,
            status: conversation.status,
            is_human_handled: true,
            human_takeover_at: conversation.escalated_at,
          },
        },
      });
    } catch (error) {
      console.error('Takeover conversation error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to takeover conversation', code: 'INTERNAL_ERROR' },
      });
    }
  }

  /**
   * POST /api/conversations/:id/messages
   * Send message as human agent
   */
  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;
      const { id } = req.params;
      const { content, message_type = 'text', media_url } = req.body;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      if (!content) {
        res.status(400).json({
          success: false,
          error: { message: 'Message content is required', code: 'MISSING_CONTENT' },
        });
        return;
      }

      const conversationRepo = AppDataSource.getRepository(Conversation);
      const messageRepo = AppDataSource.getRepository(Message);

      const conversation = await conversationRepo.findOne({
        where: { id, business_id: businessId },
        relations: ['customer'],
      });

      if (!conversation) {
        res.status(404).json({
          success: false,
          error: { message: 'Conversation not found', code: 'NOT_FOUND' },
        });
        return;
      }

      // Send WhatsApp message
      const whatsappMessageId = await whatsappService.sendMessage(
        conversation.customer.whatsapp_number,
        content
      );

      // Save message to database
      const message = messageRepo.create({
        conversation_id: id,
        sender_type: 'human',
        content,
        message_type: message_type as any,
        media_url,
        whatsapp_message_id: whatsappMessageId,
      });

      await messageRepo.save(message);

      // Update conversation timestamp
      conversation.updated_at = new Date();
      await conversationRepo.save(conversation);

      res.json({
        success: true,
        data: {
          message: {
            id: message.id,
            conversation_id: message.conversation_id,
            sender_type: message.sender_type,
            content: message.content,
            message_type: message.message_type,
            created_at: message.created_at,
          },
        },
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to send message', code: 'INTERNAL_ERROR' },
      });
    }
  }

  /**
   * PATCH /api/conversations/:id/resolve
   * Mark conversation as resolved
   */
  async resolve(req: AuthRequest, res: Response): Promise<void> {
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

      const conversationRepo = AppDataSource.getRepository(Conversation);
      const conversation = await conversationRepo.findOne({
        where: { id, business_id: businessId },
      });

      if (!conversation) {
        res.status(404).json({
          success: false,
          error: { message: 'Conversation not found', code: 'NOT_FOUND' },
        });
        return;
      }

      conversation.status = 'resolved';
      conversation.resolved_at = new Date();
      await conversationRepo.save(conversation);

      res.json({
        success: true,
        data: {
          conversation: {
            id: conversation.id,
            status: conversation.status,
          },
        },
      });
    } catch (error) {
      console.error('Resolve conversation error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to resolve conversation', code: 'INTERNAL_ERROR' },
      });
    }
  }
}

export const conversationsController = new ConversationsController();
