// routes/inventoryRoutes.js

import express from 'express';
import { verifyToken, verifyRoles } from '../middleware/authMiddleware.js';
import {
  getInventory,
  getStoreInventory,
  postInventory,
  getWarehouseProductsController,
  updateInventory,
  getInventoryByStoreAndProduct
} from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/inventory/', verifyToken, getInventory); // ver todo lo que está en inventario
router.get('/inventory/store', verifyToken, getStoreInventory); // ver lo que está en el inventario de una tienda (depende de la JWT token, ahí cada quien tiene una tienda ID)
router.get('/inventory/warehouse', verifyToken, getWarehouseProductsController); // ver productos disponibles en el almacén (storeid = 1)
router.post('/inventory/', verifyToken, verifyRoles("admin", "manager", "warehouse_manager", "owner"), postInventory); // crear registro de cant. de productos en el inventario
router.get('/inventory/by-sandp', verifyToken, getInventoryByStoreAndProduct); // Obtener un registro de inventario por tienda y producto
router.put('/inventory/', verifyToken, verifyRoles("admin", "manager", "warehouse_manager", "owner"), updateInventory); // Editar cantidad de inventario existente

export default router;