// middleware/validation.js

import { body } from "express-validator";

export const validateRegister = [
    body("name").notEmpty().withMessage("El nombre es obligatorio"),
    body("lastname").notEmpty().withMessage("El apellido es obligatorio"),
    body("email").isEmail().withMessage("Debe ser un correo válido"),
    body("cellphone").notEmpty().withMessage("El número de celular es obligatorio"),
    body("password").isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 8 caracteres"),
    body("role").notEmpty().withMessage("El rol es obligatorio"),
    body("role").isIn(["admin", "manager", "sales", "owner", "warehouse_manager"]).withMessage("El rol debe ser admin, manager, sales, owner o warehouse_manager"),
];

export const validateLogin = [
    body("email").isEmail().withMessage("Debe ser un correo válido"),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
];
