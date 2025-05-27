// routes/authRoutes.js

import express from "express";
import { login, register } from "../controllers/authController.js";
import { validateRegister, validateLogin } from "../middleware/validation.js";
import { handleValidation } from "../middleware/handleValidation.js";
import { verifyToken, verifyRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/auth/login", validateLogin, handleValidation, login);
router.post("/auth/register", verifyToken, verifyRoles("admin"), validateRegister, handleValidation, register);

export default router;
