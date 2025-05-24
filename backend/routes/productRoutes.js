// routes/productRoutes.js

import express from 'express';
import { verifyToken, verifyRoles } from '../middleware/authMiddleware.js';
import {
  getProducts,
  getActiveProducts,
  postProduct
} from '../controllers/productController.js';

const router = express.Router();

router.get('/product/', verifyToken, getProducts); // ver productos registrados en DB
router.get('/product/active', verifyToken, getActiveProducts); // ver productos que están activos (no descontinuada la venta)
router.post('/product/', verifyToken, verifyRoles("admin", "manager"), postProduct); // crear un producto nuevo en la DB 

export default router;