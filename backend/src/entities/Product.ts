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
import { Business } from './Business';

/**
 * Product Entity
 * Represents products/services offered by the business
 */
@Entity('products')
@Index(['business_id', 'is_active'])
@Index(['category', 'is_active'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  business_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 10, default: 'NGN' })
  currency: string;

  @Column({ type: 'int', default: 0 })
  stock_quantity: number;

  @Column({ type: 'varchar', length: 50, default: 'in_stock' })
  stock_status: 'in_stock' | 'out_of_stock' | 'low_stock' | 'pre_order';

  @Column({ type: 'simple-array', nullable: true })
  image_urls: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  sizes: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  colors: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[] | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sku: string | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  times_viewed: number;

  @Column({ type: 'int', default: 0 })
  times_inquired: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @ManyToOne(() => Business, (business) => business.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' })
  business: Business;
}
