/**
 * FAQs Routes
 */
import { Router } from 'express';
import { faqsController } from '../controllers/faqs.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.get('/', authenticateToken, (req, res) => faqsController.list(req, res));
router.get('/:id', authenticateToken, (req, res) => faqsController.getById(req, res));
router.post('/', authenticateToken, (req, res) => faqsController.create(req, res));
router.patch('/:id', authenticateToken, (req, res) => faqsController.update(req, res));
router.delete('/:id', authenticateToken, (req, res) => faqsController.delete(req, res));

export default router;
