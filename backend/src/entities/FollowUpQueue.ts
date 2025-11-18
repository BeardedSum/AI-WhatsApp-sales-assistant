import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Customer } from './Customer';

/**
 * FollowUpQueue Entity
 * Manages scheduled follow-up messages to customers
 */
@Entity('follow_up_queue')
@Index(['customer_id', 'status'])
@Index(['scheduled_for', 'status'])
export class FollowUpQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  customer_id: string;

  @Column({ type: 'text' })
  message_template: string;

  @Column({ type: 'timestamp' })
  scheduled_for: Date;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'pending',
  })
  status: 'pending' | 'sent' | 'failed' | 'cancelled';

  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date | null;

  @Column({ type: 'text', nullable: true })
  error_message: string | null;

  @Column({ type: 'int', default: 0 })
  retry_count: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @ManyToOne(() => Customer, (customer) => customer.follow_ups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}
