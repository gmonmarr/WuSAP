// routes/locationRoutes.js

import express from 'express';
import { 
  getAllLocations, 
  getLocationById, 
  createLocation, 
  updateLocation, 
  deleteLocation,
  checkTable,
  createTable,
  getEmployeesByLocation
} from '../controllers/locationController.js';
import { verifyToken, verifyRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Check table structure (temporary for debugging)
router.get('/locations/check-table', verifyToken, verifyRoles("admin"), checkTable);

// Create table (temporary for setup)
router.post('/locations/create-table', verifyToken, verifyRoles("admin"), createTable);

// Get employees by location (temporary for testing)
router.get('/locations/:id/employees', verifyToken, verifyRoles("admin"), getEmployeesByLocation);

// Get all locations (admin only)
router.get('/locations', verifyToken, verifyRoles("admin"), getAllLocations);

// Get location by ID (admin only)
router.get('/locations/:id', verifyToken, verifyRoles("admin", "manager", "owner", "warehouse_manager"), getLocationById);

// Create a new location (admin only)
router.post('/locations', verifyToken, verifyRoles("admin"), createLocation);

// Update a location (admin only)
router.put('/locations/:id', verifyToken, verifyRoles("admin"), updateLocation);

// Delete a location (admin only)
router.delete('/locations/:id', verifyToken, verifyRoles("admin"), deleteLocation);

export default router; 