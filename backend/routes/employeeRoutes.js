// routes/employeeRoutes.js

import express from 'express';
import { getAllEmployees, updateEmployee } from '../controllers/employeeController.js';
import { verifyToken, verifyRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all employees (admin only)
router.get('/employees', verifyToken, verifyRoles("admin"), getAllEmployees);

// Update an employee (admin only)
router.put('/employees/:id', verifyToken, verifyRoles("admin"), updateEmployee);

export default router; 