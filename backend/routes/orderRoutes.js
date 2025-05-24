// routes/orderRoutes.js

import express from 'express';
import { verifyToken, verifyRoles } from '../middleware/authMiddleware.js';
import {
  getAllOrders,
  getOrderById,
  getOrdersByStore,
  getOrdersByEmployee,
  createOrder,
  updateOrder
} from '../controllers/orderController.js';

const router = express.Router();

router.get('/orders', verifyToken, verifyRoles("admin", "owner", "manager"), getAllOrders);
router.get('/orders/:id', verifyToken, verifyRoles("admin", "owner", "manager"), getOrderById);
router.get('/orders/store/current', verifyToken, verifyRoles("admin", "owner", "manager"), getOrdersByStore);
router.get('/orders/employee/current', verifyToken, verifyRoles("admin", "owner", "manager"), getOrdersByEmployee);
router.post('/orders', verifyToken, verifyRoles("admin", "owner", "manager"), createOrder);
router.put('/orders/:id', verifyToken, verifyRoles("admin", "owner", "manager"), updateOrder);

export default router;
