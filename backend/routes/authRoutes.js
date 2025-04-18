// routes/authRoutes.js

import express from "express";
import { login, register } from "../controllers/authController.js";
import { validateRegister, validateLogin } from "../middleware/validation.js";
import { handleValidation } from "../middleware/handleValidation.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/auth/login", validateLogin, handleValidation, login);
router.post("/auth/register", verifyToken, verifyAdmin, validateRegister, handleValidation, register);

export default router;
