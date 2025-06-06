// routes/salesRoutes.js

import express from 'express';
import { verifyToken, verifyRoles } from '../middleware/authMiddleware.js';
import {
  getAllSales,
  getSaleById,
  postSale,
  // updateSale,
  deleteSale
} from '../controllers/salesController.js';

const router = express.Router();

router.get('/sales/', verifyToken, getAllSales); // Ver todas las ventas
router.get('/sales/:id', verifyToken, getSaleById); // Ver una venta con sus items
router.post('/sales/', verifyToken, verifyRoles("admin", "manager", "warehouse_manager", "sales"), postSale); // Crear una venta y sus items
// router.put('/sales/:id', verifyToken, verifyRoles("admin", "manager", "warehouse_manager", "sales"), updateSale); // Actualizar venta y sus items
router.delete('/sales/:id', verifyToken, verifyRoles("admin", "manager", "warehouse_manager", "sales"), deleteSale); // Eliminar una venta y sus items

export default router;
