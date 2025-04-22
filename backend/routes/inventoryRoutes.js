// routes/inventoryRoutes.js

import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  getInventory,
  getActiveInventory,
  getStoreInventory,
  postInventory
} from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/inventory/', verifyToken, getInventory);
router.get('/inventory/active', verifyToken, getActiveInventory);
router.get('/inventory/store', verifyToken, getStoreInventory);
router.post('/inventory/', verifyToken, postInventory);

export default router;