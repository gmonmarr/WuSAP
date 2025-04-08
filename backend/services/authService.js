// services/authService.js

import { conn } from "../db/hana.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginUser = async (email, password) => {
  const sql = `SELECT * FROM WUSAP.Employees WHERE EMAIL = ?`;

  return new Promise((resolve, reject) => {
    conn.prepare(sql, async (err, statement) => {
      if (err) return reject(err);

      statement.exec([email], async (err, results) => {
        if (err) return reject(err);
        if (!results || results.length === 0) return reject(new Error("Usuario no encontrado"));

        const user = results[0];

        if (!user.ISACTIVE) {
            return reject(new Error("Tu cuenta está desactivada. Contacta al administrador."));
        }
        if (user.ISBLOCKED) {
            return reject(new Error(`Tu acceso está bloqueado${user.BLOCKREASON ? `: ${user.BLOCKREASON}` : "."}`));
        }
        
        const passwordMatch = await bcrypt.compare(password, user.PASSWORD);
        if (!passwordMatch) return reject(new Error("Contraseña incorrecta"));

        const token = jwt.sign(
          {
            employeeID: user.EMPLOYEEID,
            email: user.EMAIL,
            role: user.ROLE
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRATION }
        );

        resolve({
          success: true,
          message: "Login exitoso",
          token,
          user: {
            employeeID: user.EMPLOYEEID,
            email: user.EMAIL,
            name: user.NAME,
            lastName: user.LASTNAME,
            role: user.ROLE,
          },
        });
      });
    });
  });
};

export const registerUser = async (name, lastName, email, cellphone, password, role) => {
  const checkSql = `SELECT * FROM WUSAP.Employees WHERE EMAIL = ?`;

  return new Promise((resolve, reject) => {
    conn.prepare(checkSql, async (err, checkStatement) => {
      if (err) return reject(err);

      checkStatement.exec([email], async (err, results) => {
        if (err) return reject(err);
        if (results.length > 0) return reject(new Error("El usuario ya existe."));

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertSql = `
          INSERT INTO WUSAP.Employees (NAME, LASTNAME, EMAIL, PASSWORD, ROLE, CELLPHONE)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        conn.prepare(insertSql, (err, insertStatement) => {
          if (err) return reject(err);

          insertStatement.exec([name, lastName, email, hashedPassword, role, cellphone], (err) => {
            if (err) return reject(err);

            resolve({
              success: true,
              message: "Usuario registrado exitosamente",
              user: { name, lastName, email, role }
            });
          });
        });
      });
    });
  });
};
