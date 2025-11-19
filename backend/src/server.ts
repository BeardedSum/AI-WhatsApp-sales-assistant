import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { initializeDatabase, closeDatabase } from './config/database';
import webhookRoutes from './routes/webhook.routes';
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import conversationsRoutes from './routes/conversations.routes';
import productsRoutes from './routes/products.routes';
import faqsRoutes from './routes/faqs.routes';
import businessRoutes from './routes/business.routes';

// Load environment variables
config();

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 3000;

/**
 * Middleware Configuration
 */

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

/**
 * Routes
 */

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API root
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'WhatsApp AI Assistant API',
    version: '1.0.0',
    phase: 'Phase 4 - Complete with Dashboard',
    endpoints: {
      health: '/health',
      webhook: '/api/webhook/whatsapp',
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      conversations: '/api/conversations',
      products: '/api/products',
      faqs: '/api/faqs',
      business: '/api/business',
    },
    features: [
      'Twilio WhatsApp Integration',
      'AI-Powered Responses with Function Calling',
      'Product Lookup',
      'FAQ Search',
      'Intelligent Escalation',
      'Conversation History Context',
      'Confidence Scoring',
      'JWT Authentication',
      'Dashboard Analytics',
      'Conversation Management',
      'Product & FAQ CRUD',
      'Business Settings',
    ],
  });
});

// Webhook routes (Phase 2)
app.use('/api/webhook', webhookRoutes);

// Authentication routes (Phase 4)
app.use('/api/auth', authRoutes);

// Dashboard routes (Phase 4)
app.use('/api/dashboard', dashboardRoutes);

// Conversation routes (Phase 4)
app.use('/api/conversations', conversationsRoutes);

// Product routes (Phase 4)
app.use('/api/products', productsRoutes);

// FAQ routes (Phase 4)
app.use('/api/faqs', faqsRoutes);

// Business routes (Phase 4)
app.use('/api/business', businessRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.url} not found`,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

/**
 * Server Startup
 */
const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 WhatsApp AI Assistant Backend');
      console.log('================================');
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
      console.log(`💚 Health: http://localhost:${PORT}/health`);
      console.log(`📲 Webhook: http://localhost:${PORT}/api/webhook/whatsapp`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
      console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard`);
      console.log(`💬 Conversations: http://localhost:${PORT}/api/conversations`);
      console.log(`🛍️  Products: http://localhost:${PORT}/api/products`);
      console.log(`❓ FAQs: http://localhost:${PORT}/api/faqs`);
      console.log(`🤖 Phase: 4 - Complete with Dashboard`);
      console.log(`🧠 AI Model: ${process.env.AI_MODEL || 'gemini/gemini-2.0-flash-exp'}`);
      console.log('================================');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful Shutdown
 */
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    await closeDatabase();
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();

export default app;
