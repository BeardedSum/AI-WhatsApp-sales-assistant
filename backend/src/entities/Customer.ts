import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { Business } from './Business';
import { Conversation } from './Conversation';
import { FollowUpQueue } from './FollowUpQueue';

/**
 * Customer Entity
 * Represents a customer interacting with the business via WhatsApp
 */
@Entity('customers')
@Index(['business_id', 'whatsapp_number'], { unique: true })
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  business_id: string;

  @Column({ type: 'varchar', length: 20 })
  whatsapp_number: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ type: 'int', default: 0 })
  total_conversations: number;

  @Column({ type: 'timestamp', nullable: true })
  last_interaction_at: Date | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @ManyToOne(() => Business, (business) => business.customers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @OneToMany(() => Conversation, (conversation) => conversation.customer)
  conversations: Conversation[];

  @OneToMany(() => FollowUpQueue, (followUp) => followUp.customer)
  follow_ups: FollowUpQueue[];
}
