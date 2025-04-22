// routes/productRoutes.js

import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  getProducts,
  getActiveProducts,
  postProduct
} from '../controllers/productController.js';

const router = express.Router();

router.get('/product/', verifyToken, getProducts);
router.get('/product/active', verifyToken, getActiveProducts);
router.post('/product/', verifyToken, postProduct);

export default router;