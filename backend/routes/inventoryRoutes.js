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

router.get('/inventory/', verifyToken, getInventory); // ver todo lo que está en inventario
router.get('/inventory/store', verifyToken, getStoreInventory); // ver lo que está en el inventario de una tienda (depende de la JWT token, ahí cada quien tiene una tienda ID)
router.post('/inventory/', verifyToken, postInventory); // crear producto en el inventario

export default router;