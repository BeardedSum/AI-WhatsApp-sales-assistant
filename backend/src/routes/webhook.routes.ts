import express, { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';

const router: Router = express.Router();

/**
 * WhatsApp Webhook Routes
 * Handles incoming messages from Twilio WhatsApp Business API
 */

/**
 * POST /api/webhook/whatsapp
 * Receive incoming WhatsApp messages from Twilio
 *
 * This endpoint MUST respond within 15 seconds to avoid Twilio retries
 */
router.post(
  '/whatsapp',
  (req, res) => webhookController.handleIncomingMessage(req, res)
);

/**
 * GET /api/webhook/whatsapp
 * Webhook verification endpoint
 * Called by Twilio when you first configure the webhook URL
 */
router.get(
  '/whatsapp',
  (req, res) => webhookController.handleWebhookVerification(req, res)
);

export default router;
