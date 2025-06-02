// routes/orderRoutes.js

import express from 'express';
import { verifyToken, verifyRoles } from '../middleware/authMiddleware.js';
import {
  getAllOrders,
  getOrderById,
  getOrdersByStore,
  getOrdersByEmployee,
  createOrder,
  updateOrder,
  getAllActiveOrders,
  getOrdersWithDetailsForStore,
  getOrderWithFullDetails
} from '../controllers/orderController.js';

const router = express.Router();

// todos menos sales
router.get('/orders', verifyToken, verifyRoles("admin", "owner", "manager", "warehouse_manager"), getAllOrders); // Get all orders
router.get('/orders/active', verifyToken, verifyRoles("admin", "owner", "manager", "warehouse_manager"), getAllActiveOrders); // Get orders 'STATUS' != 'Cancelada' or 'Entregada' ["Pendiente", "Aprobada", "Confirmada", "Entregada", "Cancelada"]
router.get('/orders/:id', verifyToken, verifyRoles("admin", "owner", "manager", "warehouse_manager"), getOrderById); // Get order by ID, este es importante porque muestra el detalle de la orden, orderitems, y orderhistory
router.get('/orders/store/current', verifyToken, verifyRoles("admin", "owner", "manager", "warehouse_manager"), getOrdersByStore); // Ver las órdenes de la tienda actual (la tienda del usuario que está logueado, se obtiene del token JWT)
router.get('/orders/store/detailed', verifyToken, verifyRoles("admin", "owner", "manager", "warehouse_manager"), getOrdersWithDetailsForStore); // Ver las órdenes de la tienda con detalles completos para el historial
router.get('/orders/:id/full-details', verifyToken, verifyRoles("admin", "owner", "manager", "warehouse_manager"), getOrderWithFullDetails); // Obtener detalles completos de una orden específica
router.get('/orders/employee/current', verifyToken, verifyRoles("admin", "owner", "manager", "warehouse_manager"), getOrdersByEmployee); // Ver las órdenes del empleado actual (el empleado del usuario que está logueado, se obtiene del token JWT)
router.post('/orders', verifyToken, verifyRoles("manager", "warehouse_manager"), createOrder); // Crea una nueva order, se le asigna un ID automáticamente y se crea un registro en la base de datos
router.put('/orders/:id', verifyToken, verifyRoles("manager", "warehouse_manager"), updateOrder); // actualizar una order (principalmente el status de la orden)

export default router;
