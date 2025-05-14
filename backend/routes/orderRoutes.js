// routes/orderRoutes.js

import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  getAllOrders,
  getOrderById,
  getOrdersByStore,
  getOrdersByEmployee,
  createOrder,
  updateOrder
} from '../controllers/orderController.js';

const router = express.Router();

router.get('/orders', verifyToken, getAllOrders);
router.get('/orders/:id', verifyToken, getOrderById);
router.get('/orders/store/current', verifyToken, getOrdersByStore);
router.get('/orders/employee/current', verifyToken, getOrdersByEmployee);
router.post('/orders', verifyToken, createOrder);
router.put('/orders/:id', verifyToken, updateOrder);

export default router;
