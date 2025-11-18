import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Import all entities
import { Business } from '../entities/Business';
import { Customer } from '../entities/Customer';
import { Conversation } from '../entities/Conversation';
import { Message } from '../entities/Message';
import { Product } from '../entities/Product';
import { FAQ } from '../entities/FAQ';
import { AIInteraction } from '../entities/AIInteraction';
import { FollowUpQueue } from '../entities/FollowUpQueue';

// Load environment variables
config();

/**
 * Database Configuration
 * TypeORM DataSource for PostgreSQL connection
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'whatsapp_ai',

  // Entities
  entities: [
    Business,
    Customer,
    Conversation,
    Message,
    Product,
    FAQ,
    AIInteraction,
    FollowUpQueue,
  ],

  // Migrations
  migrations: [path.join(__dirname, '../migrations/*.{ts,js}')],

  // Development settings
  synchronize: process.env.NODE_ENV === 'development', // Auto-sync schema (NEVER use in production!)
  logging: process.env.NODE_ENV === 'development',

  // Connection pool
  extra: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
  },
});

/**
 * Initialize database connection
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established successfully');
      console.log(`📊 Connected to: ${process.env.DB_NAME || 'whatsapp_ai'}`);
    }
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    throw error;
  }
};

/**
 * Close database connection
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Database connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
};
