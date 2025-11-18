import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Customer } from './Customer';
import { Product } from './Product';
import { FAQ } from './FAQ';
import { Conversation } from './Conversation';

/**
 * Business Entity
 * Represents a business using the WhatsApp AI Assistant
 */
@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone_number: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'text', nullable: true })
  location: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50, default: 'friendly' })
  ai_tone: 'friendly' | 'formal' | 'custom';

  @Column({ type: 'text', nullable: true })
  ai_custom_instructions: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  knowledge_base_google_drive_folder_id: string | null;

  @Column({ type: 'float', default: 0.85 })
  ai_confidence_threshold: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  owner_name: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  owner_whatsapp_number: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @OneToMany(() => Customer, (customer) => customer.business)
  customers: Customer[];

  @OneToMany(() => Product, (product) => product.business)
  products: Product[];

  @OneToMany(() => FAQ, (faq) => faq.business)
  faqs: FAQ[];

  @OneToMany(() => Conversation, (conversation) => conversation.business)
  conversations: Conversation[];
}
