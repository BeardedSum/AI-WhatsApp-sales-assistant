import { Router } from 'express';
import { documentsController } from '../controllers/documents.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.get('/', authenticateToken, (req, res) => documentsController.list(req, res));
router.post('/upload', authenticateToken, (req, res) => documentsController.upload(req, res));
router.post('/search', authenticateToken, (req, res) => documentsController.search(req, res));
router.patch('/:id', authenticateToken, (req, res) => documentsController.update(req, res));
router.delete('/:id', authenticateToken, (req, res) => documentsController.delete(req, res));

export default router;
