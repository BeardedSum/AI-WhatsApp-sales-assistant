/**
 * Queue Service with BullMQ
 * Handles follow-ups and broadcasts with Redis queue
 * Gracefully falls back to direct execution if Redis not available
 */
import { Queue, Worker, type Job } from 'bullmq';
import Redis from 'ioredis';
import { AppDataSource } from '../config/database';
import { FollowUpQueue } from '../entities/FollowUpQueue';
import { Broadcast } from '../entities/Broadcast';
import { whatsappService } from './whatsapp.service';

class QueueService {
  private followUpQueue: Queue | null = null;
  private broadcastQueue: Queue | null = null;
  private connection: Redis | null = null;
  private isRedisAvailable: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const redisHost = process.env.REDIS_HOST || 'localhost';
      const redisPort = parseInt(process.env.REDIS_PORT || '6379');
      const redisPassword = process.env.REDIS_PASSWORD || undefined;

      // Test Redis connection
      this.connection = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Don't retry
      });

      this.connection.on('connect', () => {
        console.log('✅ Redis connected - BullMQ enabled');
        this.isRedisAvailable = true;
        this.setupQueues();
      });

      this.connection.on('error', (err) => {
        console.log('⚠️  Redis not available - using fallback mode');
        this.isRedisAvailable = false;
      });
    } catch (error) {
      console.log('⚠️  Redis initialization failed - using fallback mode');
      this.isRedisAvailable = false;
    }
  }

  private setupQueues() {
    if (!this.connection || !this.isRedisAvailable) return;

    // Follow-up queue
    this.followUpQueue = new Queue('follow-ups', {
      connection: this.connection,
    });

    // Broadcast queue
    this.broadcastQueue = new Queue('broadcasts', {
      connection: this.connection,
    });

    // Set up workers
    this.setupFollowUpWorker();
    this.setupBroadcastWorker();

    console.log('✅ BullMQ queues and workers initialized');
  }

  private setupFollowUpWorker() {
    if (!this.connection) return;

    const worker = new Worker(
      'follow-ups',
      async (job: Job) => {
        await this.processFollowUp(job.data);
      },
      { connection: this.connection }
    );

    worker.on('completed', (job) => {
      console.log(`Follow-up ${job.id} completed`);
    });

    worker.on('failed', (job, err) => {
      console.error(`Follow-up ${job?.id} failed:`, err);
    });
  }

  private setupBroadcastWorker() {
    if (!this.connection) return;

    const worker = new Worker(
      'broadcasts',
      async (job: Job) => {
        await this.processBroadcast(job.data);
      },
      { connection: this.connection }
    );

    worker.on('completed', (job) => {
      console.log(`Broadcast ${job.id} completed`);
    });

    worker.on('failed', (job, err) => {
      console.error(`Broadcast ${job?.id} failed:`, err);
    });
  }

  /**
   * Schedule a follow-up message
   */
  async scheduleFollowUp(followUpId: string, delayMs: number): Promise<void> {
    if (this.isRedisAvailable && this.followUpQueue) {
      // Add to BullMQ queue
      await this.followUpQueue.add(
        'send-followup',
        { followUpId },
        { delay: delayMs }
      );
      console.log(`Follow-up ${followUpId} scheduled with BullMQ (delay: ${delayMs}ms)`);
    } else {
      // Fallback: Use setTimeout (will be lost on server restart)
      setTimeout(() => {
        this.processFollowUp({ followUpId }).catch((err) =>
          console.error('Follow-up processing error:', err)
        );
      }, delayMs);
      console.log(`Follow-up ${followUpId} scheduled with setTimeout (delay: ${delayMs}ms)`);
    }
  }

  /**
   * Process a follow-up message
   */
  private async processFollowUp(data: { followUpId: string }): Promise<void> {
    const followUpRepo = AppDataSource.getRepository(FollowUpQueue);

    const followUp = await followUpRepo.findOne({
      where: { id: data.followUpId },
      relations: ['customer'],
    });

    if (!followUp || followUp.status !== 'pending') {
      console.log(`Follow-up ${data.followUpId} not found or already processed`);
      return;
    }

    try {
      // Send WhatsApp message
      const messageSid = await whatsappService.sendMessage(
        followUp.customer.whatsapp_number,
        followUp.message_template
      );

      // Update follow-up status
      followUp.status = 'sent';
      followUp.sent_at = new Date();
      followUp.error_message = null;

      await followUpRepo.save(followUp);

      console.log(`Follow-up ${data.followUpId} sent successfully`);
    } catch (error) {
      console.error(`Follow-up ${data.followUpId} failed:`, error);

      followUp.status = 'failed';
      followUp.error_message =
        error instanceof Error ? error.message : String(error);

      await followUpRepo.save(followUp);
    }
  }

  /**
   * Schedule a broadcast
   */
  async scheduleBroadcast(broadcastId: string, scheduledAt?: Date): Promise<void> {
    const delay = scheduledAt
      ? scheduledAt.getTime() - Date.now()
      : 0;

    if (this.isRedisAvailable && this.broadcastQueue) {
      await this.broadcastQueue.add(
        'send-broadcast',
        { broadcastId },
        { delay: Math.max(0, delay) }
      );
      console.log(`Broadcast ${broadcastId} scheduled with BullMQ`);
    } else {
      // Fallback: Execute immediately or use setTimeout
      if (delay > 0) {
        setTimeout(() => {
          this.processBroadcast({ broadcastId }).catch((err) =>
            console.error('Broadcast processing error:', err)
          );
        }, delay);
      } else {
        await this.processBroadcast({ broadcastId });
      }
      console.log(`Broadcast ${broadcastId} scheduled with fallback`);
    }
  }

  /**
   * Process a broadcast
   */
  private async processBroadcast(data: { broadcastId: string }): Promise<void> {
    const broadcastRepo = AppDataSource.getRepository(Broadcast);

    const broadcast = await broadcastRepo.findOne({
      where: { id: data.broadcastId },
    });

    if (!broadcast || broadcast.status !== 'scheduled') {
      console.log(`Broadcast ${data.broadcastId} not found or not scheduled`);
      return;
    }

    try {
      // Update status to sending
      broadcast.status = 'sending';
      await broadcastRepo.save(broadcast);

      // Get customer phone numbers
      const customerRepo = AppDataSource.getRepository('Customer');
      let customers: any[] = [];

      if (broadcast.customer_ids && broadcast.customer_ids.length > 0) {
        // Send to specific customers
        customers = await AppDataSource.createQueryBuilder()
          .select('customer')
          .from('customers', 'customer')
          .where('customer.id IN (:...ids)', { ids: broadcast.customer_ids })
          .getMany();
      } else {
        // Send to all customers based on target_audience
        const query = AppDataSource.createQueryBuilder()
          .select('customer')
          .from('customers', 'customer')
          .where('customer.business_id = :businessId', {
            businessId: broadcast.business_id,
          });

        if (broadcast.target_audience === 'active') {
          // Customers with recent conversations
          query.andWhere(
            'EXISTS (SELECT 1 FROM conversations c WHERE c.customer_id = customer.id AND c.updated_at > NOW() - INTERVAL \'30 days\')'
          );
        }

        customers = await query.getMany();
      }

      broadcast.total_recipients = customers.length;
      let sentCount = 0;
      let failedCount = 0;

      // Send messages
      for (const customer of customers) {
        try {
          await whatsappService.sendMessage(
            customer.whatsapp_number,
            broadcast.message
          );
          sentCount++;
        } catch (error) {
          console.error(`Failed to send to ${customer.whatsapp_number}:`, error);
          failedCount++;
        }

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Update broadcast status
      broadcast.status = 'sent';
      broadcast.sent_at = new Date();
      broadcast.sent_count = sentCount;
      broadcast.failed_count = failedCount;

      await broadcastRepo.save(broadcast);

      console.log(
        `Broadcast ${data.broadcastId} completed: ${sentCount} sent, ${failedCount} failed`
      );
    } catch (error) {
      console.error(`Broadcast ${data.broadcastId} failed:`, error);

      broadcast.status = 'failed';
      broadcast.error_message =
        error instanceof Error ? error.message : String(error);

      await broadcastRepo.save(broadcast);
    }
  }

  /**
   * Get queue stats
   */
  async getStats() {
    if (!this.isRedisAvailable) {
      return {
        redis: 'unavailable',
        followUps: { waiting: 0, active: 0, completed: 0, failed: 0 },
        broadcasts: { waiting: 0, active: 0, completed: 0, failed: 0 },
      };
    }

    const followUpStats = this.followUpQueue
      ? await this.followUpQueue.getJobCounts()
      : null;
    const broadcastStats = this.broadcastQueue
      ? await this.broadcastQueue.getJobCounts()
      : null;

    return {
      redis: 'connected',
      followUps: followUpStats || { waiting: 0, active: 0, completed: 0, failed: 0 },
      broadcasts: broadcastStats || { waiting: 0, active: 0, completed: 0, failed: 0 },
    };
  }
}

export const queueService = new QueueService();
