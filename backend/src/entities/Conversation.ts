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
import { Customer } from './Customer';
import { Message } from './Message';
import { AIInteraction } from './AIInteraction';

/**
 * Conversation Entity
 * Represents a conversation thread between a customer and the business
 */
@Entity('conversations')
@Index(['business_id', 'customer_id'])
@Index(['status', 'updated_at'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  business_id: string;

  @Column({ type: 'uuid' })
  customer_id: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'active',
  })
  status: 'active' | 'resolved' | 'escalated' | 'archived';

  @Column({ type: 'varchar', length: 50, default: 'ai' })
  handled_by: 'ai' | 'human' | 'hybrid';

  @Column({ type: 'text', nullable: true })
  escalation_reason: string | null;

  @Column({ type: 'timestamp', nullable: true })
  escalated_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date | null;

  @Column({ type: 'int', default: 0 })
  total_messages: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @ManyToOne(() => Business, (business) => business.conversations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @ManyToOne(() => Customer, (customer) => customer.conversations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @OneToMany(() => AIInteraction, (interaction) => interaction.conversation)
  ai_interactions: AIInteraction[];
}
