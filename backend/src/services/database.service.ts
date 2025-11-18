import { AppDataSource } from '../config/database';
import { Business } from '../entities/Business';
import { Customer } from '../entities/Customer';
import { Conversation } from '../entities/Conversation';
import { Message } from '../entities/Message';
import { Not, IsNull } from 'typeorm';

/**
 * Database Service
 * Handles all database operations for WhatsApp messages and conversations
 */
export class DatabaseService {
  /**
   * Get or create a business by phone number
   */
  async getOrCreateBusiness(phoneNumber: string): Promise<Business> {
    const businessRepo = AppDataSource.getRepository(Business);

    let business = await businessRepo.findOne({
      where: { phone_number: phoneNumber },
    });

    if (!business) {
      // Create a default business for this number
      business = businessRepo.create({
        phone_number: phoneNumber,
        name: `Business ${phoneNumber}`,
        ai_tone: 'friendly',
        ai_confidence_threshold: 0.85,
        is_active: true,
      });

      await businessRepo.save(business);
      console.log(`✅ Created new business for ${phoneNumber}`);
    }

    return business;
  }

  /**
   * Get or create a customer
   */
  async getOrCreateCustomer(
    businessId: string,
    whatsappNumber: string,
    profileName?: string
  ): Promise<Customer> {
    const customerRepo = AppDataSource.getRepository(Customer);

    let customer = await customerRepo.findOne({
      where: {
        business_id: businessId,
        whatsapp_number: whatsappNumber,
      },
    });

    if (!customer) {
      customer = customerRepo.create({
        business_id: businessId,
        whatsapp_number: whatsappNumber,
        name: profileName || null,
        is_active: true,
        total_conversations: 0,
      });

      await customerRepo.save(customer);
      console.log(`✅ Created new customer: ${whatsappNumber}`);
    } else if (profileName && !customer.name) {
      // Update name if we have it now
      customer.name = profileName;
      await customerRepo.save(customer);
    }

    return customer;
  }

  /**
   * Get or create an active conversation
   */
  async getOrCreateConversation(
    businessId: string,
    customerId: string
  ): Promise<Conversation> {
    const conversationRepo = AppDataSource.getRepository(Conversation);

    // Find an active conversation
    let conversation = await conversationRepo.findOne({
      where: {
        business_id: businessId,
        customer_id: customerId,
        status: Not('archived'),
      },
      order: {
        updated_at: 'DESC',
      },
    });

    if (!conversation) {
      conversation = conversationRepo.create({
        business_id: businessId,
        customer_id: customerId,
        status: 'active',
        handled_by: 'ai',
        total_messages: 0,
      });

      await conversationRepo.save(conversation);
      console.log(`✅ Created new conversation for customer ${customerId}`);
    }

    return conversation;
  }

  /**
   * Save a message to the database
   */
  async saveMessage(data: {
    conversationId: string;
    senderType: 'customer' | 'ai' | 'human';
    content: string;
    messageType?: 'text' | 'image' | 'video' | 'audio' | 'document';
    mediaUrl?: string;
    whatsappMessageId?: string;
    aiConfidenceScore?: number;
  }): Promise<Message> {
    const messageRepo = AppDataSource.getRepository(Message);
    const conversationRepo = AppDataSource.getRepository(Conversation);

    const message = messageRepo.create({
      conversation_id: data.conversationId,
      sender_type: data.senderType,
      content: data.content,
      message_type: data.messageType || 'text',
      media_url: data.mediaUrl || null,
      whatsapp_message_id: data.whatsappMessageId || null,
      ai_confidence_score: data.aiConfidenceScore || null,
      status: 'sent',
    });

    await messageRepo.save(message);

    // Update conversation message count and timestamp
    await conversationRepo.increment(
      { id: data.conversationId },
      'total_messages',
      1
    );

    await conversationRepo.update(
      { id: data.conversationId },
      { updated_at: new Date() }
    );

    console.log(`✅ Saved ${data.senderType} message to conversation ${data.conversationId}`);

    return message;
  }

  /**
   * Get conversation history (last N messages)
   */
  async getConversationHistory(
    conversationId: string,
    limit: number = 10
  ): Promise<Message[]> {
    const messageRepo = AppDataSource.getRepository(Message);

    const messages = await messageRepo.find({
      where: { conversation_id: conversationId },
      order: { created_at: 'DESC' },
      take: limit,
    });

    return messages.reverse(); // Oldest first
  }

  /**
   * Update customer's last interaction time
   */
  async updateCustomerInteraction(customerId: string): Promise<void> {
    const customerRepo = AppDataSource.getRepository(Customer);

    await customerRepo.update(
      { id: customerId },
      { last_interaction_at: new Date() }
    );
  }

  /**
   * Escalate a conversation to human
   */
  async escalateConversation(
    conversationId: string,
    reason: string
  ): Promise<void> {
    const conversationRepo = AppDataSource.getRepository(Conversation);

    await conversationRepo.update(
      { id: conversationId },
      {
        status: 'escalated',
        handled_by: 'human',
        escalation_reason: reason,
        escalated_at: new Date(),
      }
    );

    console.log(`⬆️  Escalated conversation ${conversationId}: ${reason}`);
  }

  /**
   * Get business by ID
   */
  async getBusinessById(businessId: string): Promise<Business | null> {
    const businessRepo = AppDataSource.getRepository(Business);
    return await businessRepo.findOne({ where: { id: businessId } });
  }

  /**
   * Get conversation with business and customer details
   */
  async getConversationWithDetails(
    conversationId: string
  ): Promise<Conversation | null> {
    const conversationRepo = AppDataSource.getRepository(Conversation);

    return await conversationRepo.findOne({
      where: { id: conversationId },
      relations: ['business', 'customer'],
    });
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
