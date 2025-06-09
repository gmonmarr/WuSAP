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
        if (err) return reject(err instanceof Error ? err : new Error(err));

        statement.exec([email], async (err, results) => {
          if (err) return reject(err instanceof Error ? err : new Error(err));
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
              storeID: user.STOREID,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
          );

          // Console log para imprimir el JWT token
          // console.log("🔑 JWT Token generado para login:");
          // console.log("📧 Email:", user.EMAIL);
          // console.log("🎫 Token:", token);
          // console.log("👤 Payload:", {
          //   employeeID: user.EMPLOYEEID,
          //   email: user.EMAIL,
          //   role: user.ROLE,
          //   storeID: user.STOREID,
          // });

          resolve({
            success: true,
            message: "Login exitoso",
            token,
            user: {
              employeeID: user.EMPLOYEEID,
              email: user.EMAIL,
              name: user.NAME,
              lastName: user.LASTNAME,
              cellphone: user.CELLPHONE,
              role: user.ROLE,
              storeID: user.STOREID,
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
export const registerUser = async (createdByID, name, lastname, email, cellphone, password, role, storeID = null) => {
  const conn = await pool.acquire();

  try {
    // Start a transaction
    await conn.setAutoCommit(false);
    
    // 1. Check for existing user
    const checkSql = `SELECT * FROM WUSAP.Employees WHERE EMAIL = ?`;
    const existing = await new Promise((resolve, reject) => {
      conn.prepare(checkSql, (err, stmt) => {
        if (err) return reject(err instanceof Error ? err : new Error(err));
        stmt.exec([email], (err, results) => {
          if (err) return reject(err instanceof Error ? err : new Error(err));
          resolve(results);
        });
      });
    });

    if (existing.length > 0) {
      throw new Error("El usuario ya existe.");
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert user with storeID
    const insertSql = `
      INSERT INTO WUSAP.Employees (NAME, LASTNAME, EMAIL, PASSWORD, ROLE, CELLPHONE, STOREID)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await new Promise((resolve, reject) => {
      conn.prepare(insertSql, (err, stmt) => {
        if (err) return reject(err instanceof Error ? err : new Error(err));
        stmt.exec([name, lastname, email, hashedPassword, role, cellphone, storeID], (err) => {
          if (err) return reject(err instanceof Error ? err : new Error(err));
          resolve();
        });
      });
    });

    // 4. Get inserted employeeID
    const result = await new Promise((resolve, reject) => {
      conn.exec(`SELECT CURRENT_IDENTITY_VALUE() AS employeeID FROM DUMMY`, (err, res) => {
        if (err) return reject(err instanceof Error ? err : new Error(err));
        if (!res || res.length === 0 || res[0].employeeID === null) {
          return reject(new Error("No se pudo obtener el ID del empleado recién creado"));
        }
        resolve(res[0]);
      });
    });

    const newEmployeeID = result.employeeID;
    
    // 5. Log to TableLogs - only if we have both valid IDs
    if (createdByID && newEmployeeID) {
      const logSql = `
        INSERT INTO WUSAP.TableLogs (employeeID, tableName, recordID, action)
        VALUES (?, ?, ?, ?)
      `;
      await new Promise((resolve, reject) => {
        conn.prepare(logSql, (err, stmt) => {
          if (err) return reject(err instanceof Error ? err : new Error(err));
          stmt.exec([createdByID, "Employees", newEmployeeID, "INSERT"], (err) => {
            if (err) return reject(err instanceof Error ? err : new Error(err));
            resolve();
          });
        });
      });
    } else {
      console.warn("Omitiendo registro en TableLogs - ID de empleado creador o creado no válido");
    }

    // 6. Commit the transaction
    await conn.commit();
    
    // 7. Return
    return {
      success: true,
      message: "Usuario registrado exitosamente",
      user: { name, lastname, email, role, storeID },
    };
  } catch (error) {
    // Rollback on error
    await conn.rollback();
    throw error;
  } finally {
    pool.release(conn);
  }
};
