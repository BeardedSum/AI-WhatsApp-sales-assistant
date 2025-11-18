import twilio from 'twilio';
import { config } from 'dotenv';

config();

/**
 * Twilio WhatsApp Configuration
 */

// Validate required environment variables
const requiredEnvVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_WHATSAPP_NUMBER',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️  Warning: ${envVar} is not set in environment variables`);
  }
}

// Twilio client instance
export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Twilio configuration
export const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || '',
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || '',
  webhookUrl: process.env.WEBHOOK_URL || '',
};

/**
 * Format phone number for WhatsApp
 * @param phoneNumber - Phone number (with or without 'whatsapp:' prefix)
 * @returns Formatted WhatsApp number
 */
export const formatWhatsAppNumber = (phoneNumber: string): string => {
  // Remove 'whatsapp:' prefix if present
  const cleanNumber = phoneNumber.replace('whatsapp:', '');

  // Add 'whatsapp:' prefix
  return `whatsapp:${cleanNumber}`;
};

/**
 * Validate Twilio configuration
 * @returns true if configuration is valid
 */
export const validateTwilioConfig = (): boolean => {
  const isValid =
    !!twilioConfig.accountSid &&
    !!twilioConfig.authToken &&
    !!twilioConfig.whatsappNumber;

  if (!isValid) {
    console.error('❌ Twilio configuration is incomplete');
    console.error('Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER');
  }

  return isValid;
};
