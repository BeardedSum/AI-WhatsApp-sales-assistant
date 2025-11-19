/**
 * Conversations Routes
 */
import { Router } from 'express';
import { conversationsController } from '../controllers/conversations.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.get('/', authenticateToken, (req, res) =>
  conversationsController.list(req, res)
);

router.get('/:id', authenticateToken, (req, res) =>
  conversationsController.getById(req, res)
);

router.patch('/:id/takeover', authenticateToken, (req, res) =>
  conversationsController.takeover(req, res)
);

router.post('/:id/messages', authenticateToken, (req, res) =>
  conversationsController.sendMessage(req, res)
);

router.patch('/:id/resolve', authenticateToken, (req, res) =>
  conversationsController.resolve(req, res)
);

export default router;
