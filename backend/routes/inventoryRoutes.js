// routes/inventoryRoutes.js

import express from 'express';
import { verifyToken, verifyRoles } from '../middleware/authMiddleware.js';
import {
  getInventory,
  getStoreInventory,
  postInventory
} from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/inventory/', verifyToken, getInventory); // ver todo lo que está en inventario
router.get('/inventory/store', verifyToken, getStoreInventory); // ver lo que está en el inventario de una tienda (depende de la JWT token, ahí cada quien tiene una tienda ID)
router.post('/inventory/', verifyToken, verifyRoles("admin", "manager"), postInventory); // crear producto en el inventario

export default router;