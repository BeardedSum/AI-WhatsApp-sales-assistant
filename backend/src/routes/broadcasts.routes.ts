import { Router } from 'express';
import { broadcastsController } from '../controllers/broadcasts.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.get('/', authenticateToken, (req, res) => broadcastsController.list(req, res));
router.get('/stats', authenticateToken, (req, res) => broadcastsController.getStats(req, res));
router.post('/', authenticateToken, (req, res) => broadcastsController.create(req, res));
router.post('/:id/send', authenticateToken, (req, res) => broadcastsController.send(req, res));
router.delete('/:id', authenticateToken, (req, res) => broadcastsController.delete(req, res));

export default router;
