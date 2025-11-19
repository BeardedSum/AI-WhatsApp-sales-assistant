/**
 * Google Drive Service
 * Handles document upload and search via Google Drive API
 * Falls back to local metadata storage if Drive API not configured
 */
import { google } from 'googleapis';
import { AppDataSource } from '../config/database';
import { Document } from '../entities/Document';

export class GoogleDriveService {
  private drive: any;
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = false;
    this.initialize();
  }

  private initialize() {
    try {
      const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

      if (credentialsPath && folderId) {
        const auth = new google.auth.GoogleAuth({
          keyFile: credentialsPath,
          scopes: ['https://www.googleapis.com/auth/drive'],
        });

        this.drive = google.drive({ version: 'v3', auth });
        this.isConfigured = true;
        console.log('✅ Google Drive API configured');
      } else {
        console.log('⚠️  Google Drive API not configured - using local storage fallback');
      }
    } catch (error) {
      console.error('Google Drive initialization error:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Upload file to Google Drive
   */
  async uploadFile(
    businessId: string,
    fileName: string,
    fileContent: Buffer,
    mimeType: string
  ): Promise<{ fileId: string; url: string }> {
    if (this.isConfigured) {
      try {
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        const response = await this.drive.files.create({
          requestBody: {
            name: fileName,
            parents: [folderId],
            mimeType: mimeType,
          },
          media: {
            mimeType: mimeType,
            body: fileContent,
          },
          fields: 'id, webViewLink',
        });

        return {
          fileId: response.data.id,
          url: response.data.webViewLink,
        };
      } catch (error) {
        console.error('Google Drive upload error:', error);
        throw new Error('Failed to upload file to Google Drive');
      }
    } else {
      // Fallback: Generate mock file ID
      const mockFileId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return {
        fileId: mockFileId,
        url: `#/documents/${mockFileId}`, // Local reference
      };
    }
  }

  /**
   * Search documents in Google Drive
   */
  async searchFiles(businessId: string, query: string): Promise<any[]> {
    const documentRepo = AppDataSource.getRepository(Document);

    if (this.isConfigured) {
      try {
        // Search in Google Drive
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        const response = await this.drive.files.list({
          q: `'${folderId}' in parents and name contains '${query}' and trashed=false`,
          fields: 'files(id, name, mimeType, size, webViewLink, createdTime)',
          orderBy: 'createdTime desc',
        });

        return response.data.files || [];
      } catch (error) {
        console.error('Google Drive search error:', error);
        // Fall back to database search
      }
    }

    // Fallback: Search in database
    const documents = await documentRepo
      .createQueryBuilder('doc')
      .where('doc.business_id = :businessId', { businessId })
      .andWhere('doc.is_active = :isActive', { isActive: true })
      .andWhere(
        '(doc.name ILIKE :query OR doc.description ILIKE :query)',
        { query: `%${query}%` }
      )
      .orderBy('doc.created_at', 'DESC')
      .take(10)
      .getMany();

    return documents.map((doc) => ({
      id: doc.google_drive_file_id,
      name: doc.name,
      description: doc.description,
      url: doc.google_drive_url,
      createdTime: doc.created_at,
    }));
  }

  /**
   * Get file content for AI processing
   */
  async getFileContent(fileId: string): Promise<string> {
    if (this.isConfigured && !fileId.startsWith('local_')) {
      try {
        const response = await this.drive.files.get({
          fileId: fileId,
          alt: 'media',
        });

        return response.data;
      } catch (error) {
        console.error('Error fetching file content:', error);
        return '';
      }
    }

    // Fallback: Return empty content
    return '';
  }

  /**
   * Delete file from Google Drive
   */
  async deleteFile(fileId: string): Promise<void> {
    if (this.isConfigured && !fileId.startsWith('local_')) {
      try {
        await this.drive.files.delete({ fileId });
      } catch (error) {
        console.error('Error deleting file:', error);
        throw new Error('Failed to delete file from Google Drive');
      }
    }
    // For local files, just remove from database
  }
}

export const googleDriveService = new GoogleDriveService();
