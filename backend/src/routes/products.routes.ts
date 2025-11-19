/**
 * Products Routes
 */
import { Router } from 'express';
import { productsController } from '../controllers/products.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.get('/', authenticateToken, (req, res) => productsController.list(req, res));
router.get('/:id', authenticateToken, (req, res) => productsController.getById(req, res));
router.post('/', authenticateToken, (req, res) => productsController.create(req, res));
router.patch('/:id', authenticateToken, (req, res) => productsController.update(req, res));
router.delete('/:id', authenticateToken, (req, res) => productsController.delete(req, res));

export default router;
