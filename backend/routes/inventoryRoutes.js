// routes/inventoryRoutes.js

import express from 'express';
import { verifyToken, verifyRoles } from '../middleware/authMiddleware.js';
import {
  getInventory,
  getStoreInventory,
  postInventory,
  getWarehouseProductsController
} from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/inventory/', verifyToken, getInventory); // ver todo lo que está en inventario
router.get('/inventory/store', verifyToken, getStoreInventory); // ver lo que está en el inventario de una tienda (depende de la JWT token, ahí cada quien tiene una tienda ID)
router.get('/inventory/warehouse', verifyToken, getWarehouseProductsController); // ver productos disponibles en el almacén (storeid = 1)
router.post('/inventory/', verifyToken, verifyRoles("admin", "manager, warehouse_manager"), postInventory); // crear registro de cant. de productos en el inventario

export default router;