/**
 * Documents Controller
 * Manages document uploads and knowledge base
 */
import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Document } from '../entities/Document';
import { AuthRequest } from '../middleware/auth.middleware';
import { googleDriveService } from '../services/googledrive.service';

export class DocumentsController {
  /**
   * GET /api/documents
   * List all documents
   */
  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;
      const { search } = req.query;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      const documentRepo = AppDataSource.getRepository(Document);
      const queryBuilder = documentRepo
        .createQueryBuilder('doc')
        .where('doc.business_id = :businessId', { businessId });

      if (search) {
        queryBuilder.andWhere(
          '(doc.name ILIKE :search OR doc.description ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      queryBuilder.orderBy('doc.created_at', 'DESC');

      const [documents, total] = await queryBuilder.getManyAndCount();

      res.json({
        success: true,
        data: { documents, total },
      });
    } catch (error) {
      console.error('List documents error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch documents', code: 'INTERNAL_ERROR' },
      });
    }
  }

  /**
   * POST /api/documents/upload
   * Upload document (or save metadata if no file)
   */
  async upload(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;
      const { name, description, file_type } = req.body;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      if (!name) {
        res.status(400).json({
          success: false,
          error: { message: 'Document name is required', code: 'MISSING_FIELDS' },
        });
        return;
      }

      // For now, create document metadata without actual file upload
      // Real file upload would require multipart/form-data handling
      const fileResult = await googleDriveService.uploadFile(
        businessId,
        name,
        Buffer.from(''), // Empty buffer for metadata-only
        file_type || 'application/pdf'
      );

      const documentRepo = AppDataSource.getRepository(Document);
      const document = documentRepo.create({
        business_id: businessId,
        name,
        description,
        file_type,
        google_drive_file_id: fileResult.fileId,
        google_drive_url: fileResult.url,
        is_active: true,
        is_indexed: false,
      });

      await documentRepo.save(document);

      res.status(201).json({
        success: true,
        data: document,
      });
    } catch (error) {
      console.error('Upload document error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to upload document', code: 'INTERNAL_ERROR' },
      });
    }
  }

  /**
   * PATCH /api/documents/:id
   * Update document metadata
   */
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;
      const { id } = req.params;
      const { name, description, is_active } = req.body;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      const documentRepo = AppDataSource.getRepository(Document);
      const document = await documentRepo.findOne({
        where: { id, business_id: businessId },
      });

      if (!document) {
        res.status(404).json({
          success: false,
          error: { message: 'Document not found', code: 'NOT_FOUND' },
        });
        return;
      }

      if (name !== undefined) document.name = name;
      if (description !== undefined) document.description = description;
      if (is_active !== undefined) document.is_active = is_active;

      await documentRepo.save(document);

      res.json({
        success: true,
        data: document,
      });
    } catch (error) {
      console.error('Update document error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update document', code: 'INTERNAL_ERROR' },
      });
    }
  }

  /**
   * DELETE /api/documents/:id
   * Delete document
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

      const documentRepo = AppDataSource.getRepository(Document);
      const document = await documentRepo.findOne({
        where: { id, business_id: businessId },
      });

      if (!document) {
        res.status(404).json({
          success: false,
          error: { message: 'Document not found', code: 'NOT_FOUND' },
        });
        return;
      }

      // Delete from Google Drive
      try {
        await googleDriveService.deleteFile(document.google_drive_file_id);
      } catch (error) {
        console.error('Error deleting from Drive:', error);
        // Continue with database deletion even if Drive deletion fails
      }

      await documentRepo.remove(document);

      res.json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error) {
      console.error('Delete document error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to delete document', code: 'INTERNAL_ERROR' },
      });
    }
  }

  /**
   * POST /api/documents/search
   * Search documents for AI
   */
  async search(req: AuthRequest, res: Response): Promise<void> {
    try {
      const businessId = req.businessId;
      const { query, max_results = 5 } = req.body;

      if (!businessId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
        });
        return;
      }

      if (!query) {
        res.status(400).json({
          success: false,
          error: { message: 'Search query is required', code: 'MISSING_QUERY' },
        });
        return;
      }

      const results = await googleDriveService.searchFiles(businessId, query);

      res.json({
        success: true,
        data: {
          results: results.slice(0, max_results),
          total: results.length,
        },
      });
    } catch (error) {
      console.error('Search documents error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to search documents', code: 'INTERNAL_ERROR' },
      });
    }
  }
}

export const documentsController = new DocumentsController();
