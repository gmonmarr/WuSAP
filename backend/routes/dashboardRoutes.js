// routes/dashboardRoutes.js

import express from 'express';
import { verifyToken, verifyRoles } from '../middleware/authMiddleware.js';
import { 
  getDashboardData, 
  getKPIs, 
  getEmployeeSales 
} from '../controllers/dashboardController.js';

const router = express.Router();

// Ruta para obtener todos los datos del dashboard
router.get('/dashboard', 
  verifyToken, 
  verifyRoles("admin", "owner", "manager", "warehouse_manager"), 
  getDashboardData
);

// Ruta para obtener solo KPIs
router.get('/dashboard/kpis', 
  verifyToken, 
  verifyRoles("admin", "owner", "manager", "warehouse_manager"), 
  getKPIs
);

// Ruta para obtener ventas por empleado
router.get('/dashboard/employees', 
  verifyToken, 
  verifyRoles("admin", "owner", "manager", "warehouse_manager"), 
  getEmployeeSales
);

export default router; 