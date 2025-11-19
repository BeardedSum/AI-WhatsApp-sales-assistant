/**
 * Dashboard Routes
 */
import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/stats', authenticateToken, (req, res) =>
  dashboardController.getStats(req, res)
);

router.get('/charts', authenticateToken, (req, res) =>
  dashboardController.getCharts(req, res)
);

export default router;
