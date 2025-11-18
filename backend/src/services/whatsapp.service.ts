import { Request } from 'express';
import { twilioClient, twilioConfig, formatWhatsAppNumber } from '../config/whatsapp';
import { validateRequest } from 'twilio';

/**
 * WhatsApp Service
 * Handles all WhatsApp message operations via Twilio
 */
export class WhatsAppService {
  /**
   * Send a text message via WhatsApp
   * @param to - Recipient WhatsApp number (with country code)
   * @param message - Message content
   * @returns Message SID from Twilio
   */
  async sendMessage(to: string, message: string): Promise<string> {
    try {
      const formattedTo = formatWhatsAppNumber(to);
      const formattedFrom = formatWhatsAppNumber(twilioConfig.whatsappNumber);

      console.log(`📤 Sending WhatsApp message to ${formattedTo}`);

      const response = await twilioClient.messages.create({
        from: formattedFrom,
        to: formattedTo,
        body: message,
      });

      console.log(`✅ Message sent successfully. SID: ${response.sid}`);
      return response.sid;
    } catch (error) {
      console.error('❌ Error sending WhatsApp message:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to send WhatsApp message: ${errorMessage}`);
    }
  }

  /**
   * Send a media message (image, video, document) via WhatsApp
   * @param to - Recipient WhatsApp number
   * @param message - Message caption
   * @param mediaUrl - Public URL of the media file
   * @returns Message SID from Twilio
   */
  async sendMediaMessage(
    to: string,
    message: string,
    mediaUrl: string
  ): Promise<string> {
    try {
      const formattedTo = formatWhatsAppNumber(to);
      const formattedFrom = formatWhatsAppNumber(twilioConfig.whatsappNumber);

      console.log(`📤 Sending WhatsApp media message to ${formattedTo}`);

      const response = await twilioClient.messages.create({
        from: formattedFrom,
        to: formattedTo,
        body: message,
        mediaUrl: [mediaUrl],
      });

      console.log(`✅ Media message sent successfully. SID: ${response.sid}`);
      return response.sid;
    } catch (error) {
      console.error('❌ Error sending WhatsApp media message:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to send WhatsApp media message: ${errorMessage}`);
    }
  }

  /**
   * Verify Twilio webhook signature
   * Ensures the webhook request is actually from Twilio
   * @param req - Express request object
   * @returns true if signature is valid
   */
  verifyWebhookSignature(req: Request): boolean {
    try {
      const signature = req.headers['x-twilio-signature'] as string;

      if (!signature) {
        console.warn('⚠️  No Twilio signature found in request headers');
        return false;
      }

      // Get the full URL (including query params)
      const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

      // Validate the request came from Twilio
      const isValid = validateRequest(
        twilioConfig.authToken,
        signature,
        url,
        req.body
      );

      if (!isValid) {
        console.warn('⚠️  Invalid Twilio webhook signature');
      }

      return isValid;
    } catch (error) {
      console.error('❌ Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Parse incoming WhatsApp message from Twilio webhook
   * @param body - Request body from Twilio webhook
   * @returns Parsed message data
   */
  parseIncomingMessage(body: any): {
    from: string;
    to: string;
    messageId: string;
    body: string;
    numMedia: number;
    mediaUrls: string[];
    profileName: string;
  } {
    // Remove 'whatsapp:' prefix from phone numbers
    const from = body.From?.replace('whatsapp:', '') || '';
    const to = body.To?.replace('whatsapp:', '') || '';

    // Get media URLs if present
    const numMedia = parseInt(body.NumMedia || '0');
    const mediaUrls: string[] = [];

    for (let i = 0; i < numMedia; i++) {
      const mediaUrl = body[`MediaUrl${i}`];
      if (mediaUrl) {
        mediaUrls.push(mediaUrl);
      }
    }

    return {
      from,
      to,
      messageId: body.MessageSid || '',
      body: body.Body || '',
      numMedia,
      mediaUrls,
      profileName: body.ProfileName || 'Unknown',
    };
  }

  /**
   * Send a template message (for future use with approved templates)
   * @param to - Recipient WhatsApp number
   * @param templateId - Twilio template SID
   * @param variables - Template variables
   */
  async sendTemplateMessage(
    to: string,
    templateId: string,
    variables: Record<string, string>
  ): Promise<string> {
    try {
      const formattedTo = formatWhatsAppNumber(to);
      const formattedFrom = formatWhatsAppNumber(twilioConfig.whatsappNumber);

      console.log(`📤 Sending WhatsApp template message to ${formattedTo}`);

      // Note: This requires approved WhatsApp Business templates
      const response = await twilioClient.messages.create({
        from: formattedFrom,
        to: formattedTo,
        contentSid: templateId,
        contentVariables: JSON.stringify(variables),
      });

      console.log(`✅ Template message sent successfully. SID: ${response.sid}`);
      return response.sid;
    } catch (error) {
      console.error('❌ Error sending template message:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to send template message: ${errorMessage}`);
    }
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();
