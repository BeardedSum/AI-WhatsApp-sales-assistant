import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsapp.service';
import { databaseService } from '../services/database.service';

/**
 * Webhook Controller
 * Handles incoming WhatsApp messages from Twilio
 *
 * CRITICAL: Must respond to Twilio within 15 seconds to avoid retries
 */
export class WebhookController {
  /**
   * Handle incoming WhatsApp messages
   * Responds immediately to Twilio and processes message asynchronously
   */
  async handleIncomingMessage(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();

      // Verify webhook signature (security check)
      if (process.env.NODE_ENV === 'production') {
        const isValid = whatsappService.verifyWebhookSignature(req);
        if (!isValid) {
          console.error('❌ Invalid webhook signature');
          res.status(403).send('Forbidden');
          return;
        }
      }

      // Parse incoming message
      const messageData = whatsappService.parseIncomingMessage(req.body);

      console.log('📥 Incoming WhatsApp message:');
      console.log(`   From: ${messageData.from}`);
      console.log(`   To: ${messageData.to}`);
      console.log(`   Body: ${messageData.body}`);
      console.log(`   Media: ${messageData.numMedia} files`);

      // Respond immediately to Twilio (within 15 seconds requirement)
      res.status(200).send('OK');

      const responseTime = Date.now() - startTime;
      console.log(`✅ Responded to Twilio in ${responseTime}ms`);

      // Process message asynchronously (doesn't block webhook response)
      this.processMessageAsync(messageData).catch((error) => {
        console.error('❌ Error processing message asynchronously:', error);
      });
    } catch (error) {
      console.error('❌ Error handling incoming message:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  /**
   * Process message asynchronously (after webhook response sent)
   * This is where we store the message, interact with AI, and send response
   */
  private async processMessageAsync(messageData: {
    from: string;
    to: string;
    messageId: string;
    body: string;
    numMedia: number;
    mediaUrls: string[];
    profileName: string;
  }): Promise<void> {
    try {
      console.log('🔄 Processing message asynchronously...');

      // Step 1: Get or create business (based on 'to' number)
      const business = await databaseService.getOrCreateBusiness(messageData.to);

      // Step 2: Get or create customer
      const customer = await databaseService.getOrCreateCustomer(
        business.id,
        messageData.from,
        messageData.profileName
      );

      // Step 3: Get or create conversation
      const conversation = await databaseService.getOrCreateConversation(
        business.id,
        customer.id
      );

      // Step 4: Save customer message to database
      const messageType = messageData.numMedia > 0 ? this.detectMediaType(messageData.mediaUrls[0]) : 'text';

      await databaseService.saveMessage({
        conversationId: conversation.id,
        senderType: 'customer',
        content: messageData.body || '[Media message]',
        messageType,
        mediaUrl: messageData.mediaUrls[0] || undefined,
        whatsappMessageId: messageData.messageId,
      });

      // Step 5: Update customer interaction timestamp
      await databaseService.updateCustomerInteraction(customer.id);

      // Step 6: Generate AI response (placeholder for Phase 3)
      // For now, send a simple acknowledgment
      const aiResponse = this.generateTemporaryResponse(messageData.body, business.name);

      // Step 7: Send AI response via WhatsApp
      await whatsappService.sendMessage(messageData.from, aiResponse);

      // Step 8: Save AI response to database
      await databaseService.saveMessage({
        conversationId: conversation.id,
        senderType: 'ai',
        content: aiResponse,
        aiConfidenceScore: 0.5, // Placeholder - will be real in Phase 3
      });

      console.log(`✅ Message processing complete for ${messageData.from}`);
    } catch (error) {
      console.error('❌ Error in async message processing:', error);

      // Try to send error message to customer
      try {
        await whatsappService.sendMessage(
          messageData.from,
          "Sorry, I'm having trouble processing your message right now. Please try again later or contact our team directly."
        );
      } catch (sendError) {
        console.error('❌ Failed to send error message to customer:', sendError);
      }
    }
  }

  /**
   * Handle webhook verification (GET request from Twilio)
   * This is called when you first set up the webhook URL
   */
  handleWebhookVerification(req: Request, res: Response): void {
    console.log('🔍 Webhook verification request received');
    res.status(200).send('Webhook is active');
  }

  /**
   * Detect media type from URL
   */
  private detectMediaType(url: string): 'text' | 'image' | 'video' | 'audio' | 'document' {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg') || lowerUrl.includes('.png') || lowerUrl.includes('.gif')) {
      return 'image';
    } else if (lowerUrl.includes('.mp4') || lowerUrl.includes('.mov') || lowerUrl.includes('.avi')) {
      return 'video';
    } else if (lowerUrl.includes('.mp3') || lowerUrl.includes('.wav') || lowerUrl.includes('.ogg')) {
      return 'audio';
    } else if (lowerUrl.includes('.pdf') || lowerUrl.includes('.doc') || lowerUrl.includes('.docx')) {
      return 'document';
    }

    return 'text';
  }

  /**
   * Generate temporary response (Phase 2 placeholder)
   * Will be replaced with Google ADK AI in Phase 3
   */
  private generateTemporaryResponse(customerMessage: string, businessName: string): string {
    const lowerMessage = customerMessage.toLowerCase();

    // Simple keyword-based responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return `Hello! Welcome to ${businessName}. How can I help you today?`;
    }

    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      return `I'm processing your inquiry about pricing. Let me help you with that! (Note: This is a temporary response. AI integration coming in Phase 3)`;
    }

    if (lowerMessage.includes('product') || lowerMessage.includes('available') || lowerMessage.includes('stock')) {
      return `I'm checking our product availability for you. (Note: This is a temporary response. Full product search coming in Phase 3)`;
    }

    if (lowerMessage.includes('delivery') || lowerMessage.includes('shipping') || lowerMessage.includes('location')) {
      return `I'm here to help with delivery information. (Note: This is a temporary response. Full AI responses coming in Phase 3)`;
    }

    // Default response
    return `Thank you for your message! I'm an AI assistant for ${businessName}, currently in development. Full AI capabilities will be available soon. For urgent matters, please contact our team directly.`;
  }
}

// Export singleton instance
export const webhookController = new WebhookController();
