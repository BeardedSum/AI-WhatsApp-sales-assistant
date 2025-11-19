/**
 * Business Routes
 */
import { Router } from 'express';
import { businessController } from '../controllers/business.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.patch('/settings', authenticateToken, (req, res) =>
  businessController.updateSettings(req, res)
);

export default router;
