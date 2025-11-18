import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Conversation } from './Conversation';

/**
 * AIInteraction Entity
 * Logs AI processing details for analytics and debugging
 */
@Entity('ai_interactions')
@Index(['conversation_id', 'created_at'])
@Index(['intent_detected'])
export class AIInteraction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  conversation_id: string;

  @Column({ type: 'text' })
  customer_message: string;

  @Column({ type: 'text' })
  ai_response: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  intent_detected: string | null;

  @Column({ type: 'float' })
  confidence_score: number;

  @Column({ type: 'simple-array', nullable: true })
  tools_used: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  context_data: Record<string, any> | null;

  @Column({ type: 'int', nullable: true })
  processing_time_ms: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  model_used: string | null;

  @Column({ type: 'boolean', default: false })
  was_escalated: boolean;

  @Column({ type: 'text', nullable: true })
  escalation_reason: string | null;

  @CreateDateColumn()
  created_at: Date;

  // Relationships
  @ManyToOne(() => Conversation, (conversation) => conversation.ai_interactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;
}
