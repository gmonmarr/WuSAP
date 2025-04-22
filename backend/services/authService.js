// services/authService.js

import pool from "../db/hanaPool.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// -- LOGIN --
export const loginUser = async (email, password) => {
  const sql = `SELECT * FROM WUSAP.Employees WHERE EMAIL = ?`;
  const conn = await pool.acquire();

  try {
    return await new Promise((resolve, reject) => {
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
              role: user.ROLE,
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
  } finally {
    pool.release(conn);
  }
};

// -- REGISTER --
export const registerUser = async (createdByID, name, lastName, email, cellphone, password, role) => {
  const conn = await pool.acquire();

  try {
    // 1. Check for existing user
    const checkSql = `SELECT * FROM WUSAP.Employees WHERE EMAIL = ?`;
    const existing = await new Promise((resolve, reject) => {
      conn.prepare(checkSql, (err, stmt) => {
        if (err) return reject(err);
        stmt.exec([email], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
    });

    if (existing.length > 0) {
      throw new Error("El usuario ya existe.");
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert user
    const insertSql = `
      INSERT INTO WUSAP.Employees (NAME, LASTNAME, EMAIL, PASSWORD, ROLE, CELLPHONE)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await new Promise((resolve, reject) => {
      conn.prepare(insertSql, (err, stmt) => {
        if (err) return reject(err);
        stmt.exec([name, lastName, email, hashedPassword, role, cellphone], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });

    // 4. Get inserted employeeID
    const result = await new Promise((resolve, reject) => {
      conn.exec(`SELECT CURRENT_IDENTITY_VALUE() AS employeeID FROM DUMMY`, (err, res) => {
        if (err) return reject(err);
        resolve(res[0]);
      });
    });

    const newEmployeeID = result.EMPLOYEEID;

    // 5. Log to TableLogs
    const logSql = `
      INSERT INTO WUSAP.TableLogs (employeeID, tableName, recordID, action)
      VALUES (?, ?, ?, ?)
    `;
    await new Promise((resolve, reject) => {
      conn.prepare(logSql, (err, stmt) => {
        if (err) return reject(err);
        stmt.exec([createdByID, "Employees", newEmployeeID, "CREATE"], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });

    // 6. Return
    return {
      success: true,
      message: "Usuario registrado exitosamente",
      user: { name, lastName, email, role },
    };
  } finally {
    pool.release(conn);
  }
};
