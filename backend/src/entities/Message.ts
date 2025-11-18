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
 * Message Entity
 * Represents individual messages in a conversation
 */
@Entity('messages')
@Index(['conversation_id', 'created_at'])
@Index(['sender_type', 'created_at'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  conversation_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  whatsapp_message_id: string | null;

  @Column({ type: 'varchar', length: 50 })
  sender_type: 'customer' | 'ai' | 'human';

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 50, default: 'text' })
  message_type: 'text' | 'image' | 'video' | 'audio' | 'document';

  @Column({ type: 'varchar', length: 500, nullable: true })
  media_url: string | null;

  @Column({ type: 'float', nullable: true })
  ai_confidence_score: number | null;

  @Column({ type: 'varchar', length: 50, default: 'sent' })
  status: 'sent' | 'delivered' | 'read' | 'failed';

  @Column({ type: 'text', nullable: true })
  error_message: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  created_at: Date;

  // Relationships
  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;
}
