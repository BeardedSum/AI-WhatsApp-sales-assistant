/**
 * Products Controller
 * CRUD operations for product management
 */
import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import { AuthRequest } from '../middleware/auth.middleware';

export class ProductsController {
  /**
   * GET /api/products
   * List all products with filters
   */
  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;
      const { category, is_active, search, min_price, max_price } = req.query;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      const productRepo = AppDataSource.getRepository(Product);
      const queryBuilder = productRepo
        .createQueryBuilder('product')
        .where('product.business_id = :businessId', { businessId });

      // Apply filters
      if (category) {
        queryBuilder.andWhere('product.category = :category', { category });
      }

      if (is_active !== undefined) {
        queryBuilder.andWhere('product.is_active = :is_active', {
          is_active: is_active === 'true',
        });
      }

      if (search) {
        queryBuilder.andWhere(
          '(product.name ILIKE :search OR product.description ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      if (min_price) {
        queryBuilder.andWhere('product.price >= :min_price', {
          min_price: parseFloat(min_price as string),
        });
      }

      if (max_price) {
        queryBuilder.andWhere('product.price <= :max_price', {
          max_price: parseFloat(max_price as string),
        });
      }

      queryBuilder.orderBy('product.created_at', 'DESC');

      const [products, total] = await queryBuilder.getManyAndCount();

      res.json({
        success: true,
        data: {
          products,
          total,
        },
      });
    } catch (error) {
      console.error('List products error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch products', code: 'INTERNAL_ERROR' },
      });
    }
  }

  /**
   * GET /api/products/:id
   * Get single product by ID
   */
  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;
      const { id } = req.params;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      const productRepo = AppDataSource.getRepository(Product);
      const product = await productRepo.findOne({
        where: { id, business_id: businessId },
      });

      if (!product) {
        res.status(404).json({
          success: false,
          error: { message: 'Product not found', code: 'NOT_FOUND' },
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch product', code: 'INTERNAL_ERROR' },
      });
    }
  }

  /**
   * POST /api/products
   * Create new product
   */
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      const {
        name,
        description,
        price,
        currency = 'NGN',
        category,
        stock_quantity,
        image_url,
        image_urls,
        is_active = true,
      } = req.body;

      if (!name || !price) {
        res.status(400).json({
          success: false,
          error: { message: 'Name and price are required', code: 'MISSING_FIELDS' },
        });
        return;
      }

      // Handle both single image_url and array image_urls
      let imageUrls: string[] | null = null;
      if (image_urls) {
        imageUrls = Array.isArray(image_urls) ? image_urls : [image_urls];
      } else if (image_url) {
        imageUrls = [image_url];
      }

      const productRepo = AppDataSource.getRepository(Product);
      const product = productRepo.create({
        business_id: businessId,
        name,
        description,
        price,
        currency,
        category,
        stock_quantity,
        image_urls: imageUrls,
        is_active,
      });

      await productRepo.save(product);

      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create product', code: 'INTERNAL_ERROR' },
      });
    }
  }

  /**
   * PATCH /api/products/:id
   * Update existing product
   */
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;
      const { id } = req.params;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      const productRepo = AppDataSource.getRepository(Product);
      const product = await productRepo.findOne({
        where: { id, business_id: businessId },
      });

      if (!product) {
        res.status(404).json({
          success: false,
          error: { message: 'Product not found', code: 'NOT_FOUND' },
        });
        return;
      }

      // Update fields
      const {
        name,
        description,
        price,
        currency,
        category,
        stock_quantity,
        image_url,
        image_urls,
        is_active,
      } = req.body;

      if (name !== undefined) product.name = name;
      if (description !== undefined) product.description = description;
      if (price !== undefined) product.price = price;
      if (currency !== undefined) product.currency = currency;
      if (category !== undefined) product.category = category;
      if (stock_quantity !== undefined) product.stock_quantity = stock_quantity;

      // Handle both single image_url and array image_urls
      if (image_urls !== undefined) {
        product.image_urls = Array.isArray(image_urls) ? image_urls : [image_urls];
      } else if (image_url !== undefined) {
        product.image_urls = [image_url];
      }

      if (is_active !== undefined) product.is_active = is_active;

      product.updated_at = new Date();

      await productRepo.save(product);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update product', code: 'INTERNAL_ERROR' },
      });
    }
  }

  /**
   * DELETE /api/products/:id
   * Delete product
   */
  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;
      const { id } = req.params;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      const productRepo = AppDataSource.getRepository(Product);
      const product = await productRepo.findOne({
        where: { id, business_id: businessId },
      });

      if (!product) {
        res.status(404).json({
          success: false,
          error: { message: 'Product not found', code: 'NOT_FOUND' },
        });
        return;
      }

      await productRepo.remove(product);

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to delete product', code: 'INTERNAL_ERROR' },
      });
    }
  }
}

export const productsController = new ProductsController();
