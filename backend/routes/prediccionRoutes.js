// routes/prediccionRoutes.js
import express from 'express';

import { verifyToken, verifyRoles } from '../middleware/authMiddleware.js';
import { controllerFunction } from '../controllers/prediccionController.js';

const router = express.Router();

router.get('/predicciones',verifyToken, verifyRoles("admin","owner","manager","warehouse_manager"),  controllerFunction);

export default router;
