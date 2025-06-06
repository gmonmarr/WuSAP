// routes/authRoutes.js

import express from "express";
import { login, register } from "../controllers/authController.js";
import { validateRegister, validateLogin } from "../middleware/validation.js";
import { handleValidation } from "../middleware/handleValidation.js";
import { verifyToken, verifyRoles, verifyTokenOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/auth/login", validateLogin, handleValidation, login);
router.post("/auth/register", verifyToken, verifyRoles("admin"), validateRegister, handleValidation, register);
// ✨ Versión más elegante: el middleware maneja todo
router.get("/auth/verify", verifyTokenOnly);

export default router;
