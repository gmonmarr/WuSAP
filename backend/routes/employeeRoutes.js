// routes/employeeRoutes.js

import express from 'express';
import { getAllEmployees, updateEmployee } from '../controllers/employeeController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all employees (admin only)
router.get('/employees', verifyToken, verifyAdmin, getAllEmployees);

// Update an employee (admin only)
router.put('/employees/:id', verifyToken, verifyAdmin, updateEmployee);

export default router; 